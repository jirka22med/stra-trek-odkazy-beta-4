// links.js - v2.0 OPTIMIZED FOR MOBILE
// 🚀 Minimální DOM manipulace, debounced sync messages, efektivní rendering

const linksTableBody = document.getElementById('linksTableBody');
const addLinkButton = document.getElementById('addLinkButton');
const linkNameInput = document.getElementById('linkName');
const linkUrlInput = document.getElementById('linkUrl');
const syncStatusMessageElement = document.getElementById('syncStatusMessage');
const clearAllLinksButton = document.getElementById('clearAllLinksButton');
const saveEditButton = document.getElementById('saveEditButton');

let syncMessageTimeout;
let currentLinks = [];
let actionInProgress = false;

// 🚀 NOVÉ: RequestAnimationFrame pro plynulejší rendering
let pendingRenderFrame = null;

// --- A. SYSTÉMOVÉ ZPRÁVY - OPTIMALIZOVÁNO ---
function toggleSyncMessage(show, message = "Probíhá synchronizace dat...", isError = false) {
    if (!syncStatusMessageElement) return;
    
    // Zrušíme předchozí timeouty
    clearTimeout(syncMessageTimeout);

    syncStatusMessageElement.textContent = message;
    syncStatusMessageElement.classList.toggle('error', isError);

    if (show) {
        syncStatusMessageElement.style.display = 'block';
        syncStatusMessageElement.style.opacity = '1';
        
        // Automatické zmizení (chyby svítí déle)
        syncMessageTimeout = setTimeout(() => {
            syncStatusMessageElement.style.opacity = '0';
            setTimeout(() => {
                syncStatusMessageElement.style.display = 'none';
            }, 300);
        }, isError ? 4000 : 2000);
    } else {
        syncStatusMessageElement.style.opacity = '0';
        setTimeout(() => {
            syncStatusMessageElement.style.display = 'none';
        }, 300);
    }
}

// --- B. VYKRESLENÍ TABULKY - PLNĚ OPTIMALIZOVÁNO ---
// 🚀 RequestAnimationFrame + efektivní DOM manipulace
window.populateLinksTable = function(links) {
    // Zrušíme případný pending render
    if (pendingRenderFrame) {
        cancelAnimationFrame(pendingRenderFrame);
    }
    
    // Naplánujeme render v dalším frame (plynulejší)
    pendingRenderFrame = requestAnimationFrame(() => {
        renderLinksTableOptimized(links);
        pendingRenderFrame = null;
    });
};

// 🚀 NOVÁ FUNKCE: Optimalizovaný rendering
function renderLinksTableOptimized(links) {
    // Prázdný stav
    if (links.length === 0) {
        linksTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #888;">🌌 Žádné odkazy na této stránce</td></tr>`;
        clearAllLinksButton.style.display = 'none';
        if (window.searchManager) window.searchManager.refresh();
        return;
    }

    // 🚀 OPTIMALIZACE: Použijeme DocumentFragment (minimální reflow)
    const fragment = document.createDocumentFragment();

    // 🚀 OPTIMALIZACE: Batch vytvoření všech řádků najednou
    const rowsHTML = links.map((link, index) => {
        const isFirst = index === 0;
        const isLast = index === links.length - 1;
        
        return `
            <tr data-link-id="${link.id}">
                <td>${index + 1}</td>
                <td>${escapeHtml(link.name)}</td>
                <td><button class="url-button" data-url="${escapeHtml(link.url)}" title="${escapeHtml(link.url)}">Odkaz</button></td>
                <td>
                    <div class="action-buttons">
                        <button class="move-up-button" ${isFirst ? 'disabled' : ''}>⬆️</button>
                        <button class="move-down-button" ${isLast ? 'disabled' : ''}>⬇️</button>
                        <button class="edit-link-button" data-name="${escapeHtml(link.name)}" data-url="${escapeHtml(link.url)}">✏️</button>
                        <button class="delete-link-button">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // 🚀 KLÍČOVÁ OPTIMALIZACE: Jeden innerHTML místo postupného appendování
    linksTableBody.innerHTML = rowsHTML;

    clearAllLinksButton.style.display = links.length > 0 ? 'none' : 'none';
    currentLinks = links;
    
    // Refresh vyhledávače
    if (window.searchManager) window.searchManager.refresh();
    
    console.log(`✅ Vykresleno ${links.length} odkazů (optimized render)`);
}

// Helper funkce pro escapování HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- C. NAČÍTÁNÍ DAT DLE STRÁNKY - OPTIMALIZOVÁNO ---
async function loadLinksForCurrentPage() {
    if (!window.paginationManager) {
        console.warn("⚠️ PaginationManager není inicializován!");
        return;
    }

    const currentPageId = window.paginationManager.getCurrentPageId();
    
    if (!currentPageId) {
        console.warn("⚠️ Žádná aktivní stránka!");
        linksTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #ff3333;">⚠️ Není vybrána žádná stránka</td></tr>';
        return;
    }

    // 🚀 OPTIMALIZACE: Krátká, nenápadná zpráva
    toggleSyncMessage(true, "⏳ Načítám...");
    
    // getLinksByPageId nyní filtruje z GLOBAL_CACHE - super rychlé!
    const links = await window.getLinksByPageId(currentPageId);
    
    window.populateLinksTable(links);
    toggleSyncMessage(false);
}

// --- D. OBSLUHA KLIKNUTÍ V TABULCE (Event Delegation) ---
// 🚀 OPTIMALIZOVÁNO: Jeden listener na celou tabulku místo na každý řádek
linksTableBody.addEventListener('click', async (e) => {
    if (actionInProgress) return;
    
    const target = e.target;
    
    // 1. Otevření URL
    if (target.classList.contains('url-button')) {
        const url = target.dataset.url;
        window.open(url, '_blank');
        return;
    }
    
    const row = target.closest('tr');
    if (!row) return;

    const linkId = row.dataset.linkId;
    const currentIndex = currentLinks.findIndex(l => l.id === linkId);
    if (currentIndex === -1) return;

    // 2. Mazání odkazu
    if (target.classList.contains('delete-link-button')) {
        if (confirm('Opravdu chcete smazat tento odkaz? Tato akce je nevratná.')) {
            actionInProgress = true;
            toggleSyncMessage(true, "🗑️ Mažu...");
            
            const success = await window.deleteLinkFromFirestore(linkId);
            
            if (success) {
                // 🚀 OPTIMALIZACE: Počkáme na debounced invalidaci
                setTimeout(async () => {
                    await loadLinksForCurrentPage();
                    toggleSyncMessage(true, '✅ Smazáno!');
                }, 600);
            } else {
                toggleSyncMessage(true, 'Chyba při mazání odkazu.', true);
            }
            
            actionInProgress = false;
        }
    }

    // 3. Přesun Nahoru
    if (target.classList.contains('move-up-button')) {
        if (currentIndex > 0) {
            actionInProgress = true;
            toggleSyncMessage(true, "⬆️ Přesouvám...");
            const targetLink = currentLinks[currentIndex - 1];
            
            const success = await window.updateLinkOrderInFirestore(
                linkId, currentLinks[currentIndex].orderIndex,
                targetLink.id, targetLink.orderIndex
            );
            
            if (success) {
                setTimeout(async () => {
                    await loadLinksForCurrentPage();
                }, 600);
            } else {
                toggleSyncMessage(true, 'Chyba při přesunu.', true);
            }
            
            toggleSyncMessage(false);
            actionInProgress = false;
        }
    }

    // 4. Přesun Dolů
    if (target.classList.contains('move-down-button')) {
        if (currentIndex < currentLinks.length - 1) {
            actionInProgress = true;
            toggleSyncMessage(true, "⬇️ Přesouvám...");
            const targetLink = currentLinks[currentIndex + 1];
            
            const success = await window.updateLinkOrderInFirestore(
                linkId, currentLinks[currentIndex].orderIndex,
                targetLink.id, targetLink.orderIndex
            );
            
            if (success) {
                setTimeout(async () => {
                    await loadLinksForCurrentPage();
                }, 600);
            } else {
                toggleSyncMessage(true, 'Chyba při přesunu.', true);
            }
            
            toggleSyncMessage(false);
            actionInProgress = false;
        }
    }

    // 5. Editace (Otevření Modalu)
    if (target.classList.contains('edit-link-button')) {
        window.modalManager.open(linkId, target.dataset.name, target.dataset.url);
    }
});

// --- E. PŘIDÁNÍ NOVÉHO ODKAZU - OPTIMALIZOVÁNO ---
if (addLinkButton) {
    addLinkButton.addEventListener('click', async () => {
        if (actionInProgress) return;

        const linkName = linkNameInput.value.trim();
        const linkUrl = linkUrlInput.value.trim();

        if (!linkName || !linkUrl) {
            toggleSyncMessage(true, 'Vyplň název i URL adresu!', true);
            return;
        }

        // KONTROLA STRÁNKY
        if (!window.paginationManager || !window.paginationManager.getCurrentPageId()) {
            toggleSyncMessage(true, 'Není vybrána žádná stránka!', true);
            return;
        }
        
        const currentPageId = window.paginationManager.getCurrentPageId();

        actionInProgress = true;
        toggleSyncMessage(true, "➕ Přidávám...");
        
        // Výpočet indexu pořadí
        const newOrderIndex = currentLinks.length > 0 
            ? Math.max(...currentLinks.map(l => l.orderIndex)) + 1 
            : 0;

        // Odeslání do Firestore s pageId
        const success = await window.addLinkToFirestore(linkName, linkUrl, newOrderIndex, currentPageId);
        
        if (success) {
            linkNameInput.value = '';
            linkUrlInput.value = '';
            
            // 🚀 OPTIMALIZACE: Počkáme na debounced invalidaci
            setTimeout(async () => {
                await loadLinksForCurrentPage();
                toggleSyncMessage(true, '✅ Přidáno!');
            }, 600);
        } else {
            toggleSyncMessage(true, 'Chyba při ukládání.', true);
        }
        
        actionInProgress = false;
    });
}

// --- F. SMAZÁNÍ VŠECH ODKAZŮ (Na aktuální stránce) - OPTIMALIZOVÁNO ---
if (clearAllLinksButton) {
    clearAllLinksButton.addEventListener('click', async () => {
        if (actionInProgress) return;

        if (confirm('⚠️ OPRAVDU chcete smazat VŠECHNY odkazy na TÉTO stránce?')) {
            if (confirm('⚠️ JSTE SI JISTI? Je to nevratné!')) {
                actionInProgress = true;
                toggleSyncMessage(true, "🗑️ Mažu všechny odkazy...");

                try {
                    let deleteCount = 0;
                    const deletePromises = currentLinks.map(link => 
                        window.deleteLinkFromFirestore(link.id)
                    );
                    
                    // 🚀 OPTIMALIZACE: Paralelní mazání
                    const results = await Promise.all(deletePromises);
                    deleteCount = results.filter(r => r === true).length;

                    if (deleteCount === currentLinks.length) {
                        setTimeout(async () => {
                            await loadLinksForCurrentPage();
                            toggleSyncMessage(true, '✅ Stránka vyčištěna!');
                        }, 600);
                    } else {
                        toggleSyncMessage(true, `Smazáno ${deleteCount}/${currentLinks.length}.`, true);
                    }
                } catch (error) {
                    console.error("❌ Chyba:", error);
                    toggleSyncMessage(true, 'Chyba při hromadném mazání.', true);
                }

                actionInProgress = false;
            }
        }
    });
}

// --- G. ULOŽENÍ EDITACE (Z Modalu) - OPTIMALIZOVÁNO ---
if (saveEditButton) {
    saveEditButton.addEventListener('click', async () => {
        if (actionInProgress) return;

        const data = window.modalManager.getData();

        if (!window.modalManager.isValid()) {
            toggleSyncMessage(true, 'Vyplň název i URL!', true);
            return;
        }

        actionInProgress = true;
        toggleSyncMessage(true, "💾 Ukládám...");
        
        // 1. Aktualizace jména a URL (vždy)
        const updateSuccess = await window.updateLinkInFirestore(data.id, data.name, data.url);

        // 2. Kontrola, zda chceme přesunout na jinou stránku
        const currentPageId = window.paginationManager.getCurrentPageId();
        let moveSuccess = true;

        if (data.pageId && data.pageId !== currentPageId) {
            console.log(`🚀 Přesouvám odkaz na stránku ID: ${data.pageId}`);
            moveSuccess = await window.moveLinkToPage(data.id, data.pageId);
        }

        if (updateSuccess && moveSuccess) {
            window.modalManager.close();
            
            // 🚀 OPTIMALIZACE: Počkáme na debounced invalidaci
            setTimeout(async () => {
                await loadLinksForCurrentPage();
                toggleSyncMessage(true, '✅ Uloženo!');
            }, 600);
        } else {
            toggleSyncMessage(true, 'Chyba při ukládání.', true);
        }
    
        actionInProgress = false;
    });
}

// --- H. INICIALIZACE - OPTIMALIZOVÁNO ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("📄 Links.js v2.0: Čekám na PaginationManager...");
    
    // 🚀 OPTIMALIZACE: Chytřejší čekání s timeoutem
    let checkCount = 0;
    const maxChecks = 100; // Max 10 sekund (100 * 100ms)
    
    const waitForPagination = setInterval(async () => {
        checkCount++;
        
        if (window.paginationManager && window.paginationManager.initialized) {
            clearInterval(waitForPagination);
            console.log("✅ PaginationManager připraven. Načítám data...");
            await loadLinksForCurrentPage();
        } else if (checkCount >= maxChecks) {
            clearInterval(waitForPagination);
            console.error("❌ Timeout: PaginationManager se nenačetl.");
            toggleSyncMessage(true, '⚠️ Chyba načítání systému', true);
        }
    }, 100);
});