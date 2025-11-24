// firebaseLinksFunctions.js - FÁZE 4: PODPORA pageId

const firebaseConfig = {
    apiKey: "AIzaSyBdsU71bo-BBUNinMctWM73jX8fX7mXz60",
    authDomain: "star-trek-odkazy.firebaseapp.com",
    projectId: "star-trek-odkazy",
    storageBucket: "star-trek-odkazy.firebasestorage.app",
    messagingSenderId: "1009898907428",
    appId: "1:1009898907428:web:07297e8b8d76ff2654b5b1"
};

let app = null;
let db = null;
let lastSyncTime = 0;
const CACHE_DURATION = 5000; // 5 sekund cache

window.initializeFirebaseLinksApp = async function() {
    console.log("🚀 Inicializace Firebase aplikace...");
    try {
        if (typeof firebase === 'undefined' || !firebase.initializeApp) {
            console.error("❌ Firebase SDK není načteno!");
            return false;
        }

        if (!app) {
            app = firebase.initializeApp(firebaseConfig, "linksApp");
            console.log("✅ Firebase aplikace inicializována");
        }

        if (!db) {
            if (typeof firebase.firestore === 'undefined') {
                console.error("❌ Firestore SDK není načteno!");
                return false;
            }
            db = firebase.firestore(app);
            console.log("✅ Firestore databáze připravena");

            // OPTIMALIZACE: Offline persistence pouze na desktopu
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (!isMobile) {
                try {
                    await db.enablePersistence();
                    console.log("✅ Offline persistence povolena");
                } catch (err) {
                    console.warn("⚠️ Offline persistence nelze aktivovat:", err.code);
                }
            } else {
                console.log("📱 Mobile detekován - offline persistence přeskočena");
            }
        }

        return true;
    } catch (error) {
        console.error("❌ Chyba při inicializaci Firebase:", error);
        return false;
    }
};

// OPTIMALIZACE: Cache pro links
let linksCache = null;

// 🚀 UPRAVENÁ FUNKCE: Přidání pageId jako 4. parametr
window.addLinkToFirestore = async function(linkName, linkUrl, orderIndex, pageId) {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return false;
    }
    try {
        await db.collection('links').add({
            name: linkName,
            url: linkUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            orderIndex: orderIndex,
            pageId: pageId || null // 🚀 NOVÉ: pageId
        });
        console.log(`✅ Odkaz "${linkName}" přidán na stránku ${pageId}`);
        linksCache = null; // INVALIDUJEME CACHE
        return true;
    } catch (error) {
        console.error("❌ Chyba při přidávání odkazu:", error);
        return false;
    }
};

// OPTIMALIZACE: Caching + redukce orderBy dotazů
window.getLinksFromFirestore = async function() {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return [];
    }

    // CACHE CHECK - pokud máme čerstvá data, vraťme je ihned
    const now = Date.now();
    if (linksCache && (now - lastSyncTime) < CACHE_DURATION) {
        console.log("⚡ Vracím cached data (bez API volání)");
        return linksCache;
    }

    try {
        // OPTIMALIZACE: Jen jeden orderBy místo dvou
        const snapshot = await db.collection('links')
            .orderBy('orderIndex', 'asc')
            .get();
        
        linksCache = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        lastSyncTime = now;
        console.log(`✅ Načteno ${linksCache.length} odkazů z Firestore`);
        return linksCache;
    } catch (error) {
        console.error("❌ Chyba při načítání odkazů:", error);
        return linksCache || []; // Vrať cache pokud existuje, jinak prázdný array
    }
};

window.deleteLinkFromFirestore = async function(linkId) {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return false;
    }
    try {
        await db.collection('links').doc(linkId).delete();
        console.log(`✅ Odkaz smazán: ${linkId}`);
        linksCache = null; // INVALIDUJEME CACHE
        return true;
    } catch (error) {
        console.error("❌ Chyba při mazání odkazu:", error);
        return false;
    }
};

window.updateLinkInFirestore = async function(linkId, newName, newUrl) {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return false;
    }
    try {
        await db.collection('links').doc(linkId).update({
            name: newName,
            url: newUrl,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Odkaz aktualizován: ${linkId}`);
        linksCache = null; // INVALIDUJEME CACHE
        return true;
    } catch (error) {
        console.error("❌ Chyba při aktualizaci odkazu:", error);
        return false;
    }
};

window.updateLinkOrderInFirestore = async function(link1Id, link1OrderIndex, link2Id, link2OrderIndex) {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return false;
    }
    
    const batch = db.batch();
    const link1Ref = db.collection('links').doc(link1Id);
    const link2Ref = db.collection('links').doc(link2Id);

    batch.update(link1Ref, { orderIndex: link2OrderIndex });
    batch.update(link2Ref, { orderIndex: link1OrderIndex });

    try {
        await batch.commit();
        console.log(`✅ Pořadí odkazů prohozeno`);
        linksCache = null; // INVALIDUJEME CACHE
        return true;
    } catch (error) {
        console.error("❌ Chyba při prohazování pořadí:", error);
        return false;
    }
};

// ========================================
// 🚀 FUNKCE PRO SPRÁVU STRÁNEK
// ========================================

let pagesCache = null;
let pagesCacheTime = 0;

// Přidání nové stránky
window.addPageToFirestore = async function(pageName, orderIndex) {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return false;
    }
    try {
        await db.collection('pages').add({
            name: pageName,
            orderIndex: orderIndex,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Stránka "${pageName}" přidána`);
        pagesCache = null; // INVALIDUJEME CACHE
        return true;
    } catch (error) {
        console.error("❌ Chyba při přidávání stránky:", error);
        return false;
    }
};

// Načtení všech stránek
window.getPagesFromFirestore = async function() {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return [];
    }

    const now = Date.now();
    if (pagesCache && (now - pagesCacheTime) < CACHE_DURATION) {
        console.log("⚡ Vracím cached pages");
        return pagesCache;
    }

    try {
        const snapshot = await db.collection('pages')
            .orderBy('orderIndex', 'asc')
            .get();
        
        pagesCache = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        pagesCacheTime = now;
        console.log(`✅ Načteno ${pagesCache.length} stránek`);
        return pagesCache;
    } catch (error) {
        console.error("❌ Chyba při načítání stránek:", error);
        return pagesCache || [];
    }
};

// Smazání stránky
window.deletePageFromFirestore = async function(pageId) {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return false;
    }
    try {
        await db.collection('pages').doc(pageId).delete();
        console.log(`✅ Stránka smazána: ${pageId}`);
        pagesCache = null; // INVALIDUJEME CACHE
        return true;
    } catch (error) {
        console.error("❌ Chyba při mazání stránky:", error);
        return false;
    }
};

// Aktualizace názvu stránky
window.updatePageInFirestore = async function(pageId, newName) {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return false;
    }
    try {
        await db.collection('pages').doc(pageId).update({
            name: newName,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Stránka aktualizována: ${pageId}`);
        pagesCache = null; // INVALIDUJEME CACHE
        return true;
    } catch (error) {
        console.error("❌ Chyba při aktualizaci stránky:", error);
        return false;
    }
};

// 🚀 KLÍČOVÁ FUNKCE: Načtení odkazů pro konkrétní stránku
window.getLinksByPageId = async function(pageId) {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return [];
    }

    try {
        const snapshot = await db.collection('links')
            .where('pageId', '==', pageId)
            .orderBy('orderIndex', 'asc')
            .get();
        
        const links = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log(`✅ Načteno ${links.length} odkazů pro stránku ${pageId}`);
        return links;
    } catch (error) {
        console.error("❌ Chyba při načítání odkazů pro stránku:", error);
        return [];
    }
};

// Přesunutí odkazu na jinou stránku
window.moveLinkToPage = async function(linkId, newPageId) {
    if (!db) {
        console.error("❌ Firestore databáze není inicializována");
        return false;
    }
    try {
        await db.collection('links').doc(linkId).update({
            pageId: newPageId,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Odkaz přesunut na stránku: ${newPageId}`);
        linksCache = null; // INVALIDUJEME CACHE
        return true;
    } catch (error) {
        console.error("❌ Chyba při přesunu odkazu:", error);
        return false;
    }
};