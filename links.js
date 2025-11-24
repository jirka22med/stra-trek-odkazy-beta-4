// links.js - FINÁLNÍ VERZE S PODPOROU STRÁNKOVÁNÍ A MODALU
// Sloučeno: Logika z verze 1 + Architektura z verze 2

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

// --- A. SYSTÉMOVÉ ZPRÁVY ---
function toggleSyncMessage(show, message = "Probíhá synchronizace dat...", isError = false) {
    if (!syncStatusMessageElement) return;
    clearTimeout(syncMessageTimeout);

    syncStatusMessageElement.textContent = message;
    syncStatusMessageElement.classList.toggle('error', isError);

    if (show) {
        syncStatusMessageElement.style.display = 'block';
        syncStatusMessageElement.style.opacity = '1';
        
        // Pokud je to chyba, svítí déle, jinak zmizí rychle
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

// --- B. VYKRESLENÍ TABULKY (Exportováno pro Pagination.js) ---
window.populateLinksTable = function(links) {
    linksTableBody.innerHTML = '';
    
    if (links.length === 0) {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = `<td colspan="4" style="text-align: center; color: #888;">🌌 Žádné odkazy na této stránce</td>`;
        linksTableBody.appendChild(noDataRow);
        clearAllLinksButton.style.display = 'none';
        
        // Refresh vyhledávače (pokud existuje)
        if (window.searchManager) window.searchManager.refresh();
        return;
    }

    const fragment = document.createDocumentFragment();

    links.forEach((link, index) => {
        const row = document.createElement('tr');
        row.dataset.linkId = link.id;
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${link.name}</td>
            <td><button class="url-button" data-url="${link.url}" title="${link.url}">Odkaz</button></td>
            <td>
                <div class="action-buttons">
                    <button class="move-up-button" ${index === 0 ? 'disabled' : ''}>⬆️</button>
                    <button class="move-down-button" ${index === links.length - 1 ? 'disabled' : ''}>⬇️</button>
                    <button class="edit-link-button" data-name="${link.name}" data-url="${link.url}">✏️</button>
                    <button class="delete-link-button">🗑️</button>
                </div>
            </td>
        `;
        fragment.appendChild(row);
    });

    linksTableBody.appendChild(fragment);
    clearAllLinksButton.style.display = links.length > 0 ? 'block' : 'none';
    currentLinks = links;
    
    // Refresh vyhledávače
    if (window.searchManager) window.searchManager.refresh();
};

// --- C. NAČÍTÁNÍ DAT DLE STRÁNKY ---
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

    toggleSyncMessage(true, "Načítám data stránky...");
    const links = await window.getLinksByPageId(currentPageId);
    window.populateLinksTable(links);
    toggleSyncMessage(false);
}

// --- D. OBSLUHA KLIKNUTÍ V TABULCE (Event Delegation) ---
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
            toggleSyncMessage(true);
            
            const success = await window.deleteLinkFromFirestore(linkId);
            
            if (success) {
                await loadLinksForCurrentPage();
            } else {
                toggleSyncMessage(true, 'Chyba při mazání odkazu.', true);
            }
            toggleSyncMessage(false);
            actionInProgress = false;
        }
    }

    // 3. Přesun Nahoru
    if (target.classList.contains('move-up-button')) {
        if (currentIndex > 0) {
            actionInProgress = true;
            toggleSyncMessage(true);
            const targetLink = currentLinks[currentIndex - 1];
            
            const success = await window.updateLinkOrderInFirestore(
                linkId, currentLinks[currentIndex].orderIndex,
                targetLink.id, targetLink.orderIndex
            );
            
            if (success) await loadLinksForCurrentPage();
            else toggleSyncMessage(true, 'Chyba při přesunu.', true);
            
            toggleSyncMessage(false);
            actionInProgress = false;
        }
    }

    // 4. Přesun Dolů
    if (target.classList.contains('move-down-button')) {
        if (currentIndex < currentLinks.length - 1) {
            actionInProgress = true;
            toggleSyncMessage(true);
            const targetLink = currentLinks[currentIndex + 1];
            
            const success = await window.updateLinkOrderInFirestore(
                linkId, currentLinks[currentIndex].orderIndex,
                targetLink.id, targetLink.orderIndex
            );
            
            if (success) await loadLinksForCurrentPage();
            else toggleSyncMessage(true, 'Chyba při přesunu.', true);
            
            toggleSyncMessage(false);
            actionInProgress = false;
        }
    }

    // 5. Editace (Otevření Modalu)
    if (target.classList.contains('edit-link-button')) {
        window.modalManager.open(linkId, target.dataset.name, target.dataset.url);
    }
});

// --- E. PŘIDÁNÍ NOVÉHO ODKAZU ---
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
        toggleSyncMessage(true);
        
        // Výpočet indexu pořadí
        const newOrderIndex = currentLinks.length > 0 
            ? Math.max(...currentLinks.map(l => l.orderIndex)) + 1 
            : 0;

        // Odeslání do Firestore s pageId
        const success = await window.addLinkToFirestore(linkName, linkUrl, newOrderIndex, currentPageId);
        
        if (success) {
            linkNameInput.value = '';
            linkUrlInput.value = '';
            await loadLinksForCurrentPage();
        } else {
            toggleSyncMessage(true, 'Chyba při ukládání.', true);
        }
        
        toggleSyncMessage(false);
        actionInProgress = false;
    });
}

// --- F. SMAZÁNÍ VŠECH ODKAZŮ (Na aktuální stránce) ---
if (clearAllLinksButton) {
    clearAllLinksButton.addEventListener('click', async () => {
        if (actionInProgress) return;

        if (confirm('⚠️ OPRAVDU chcete smazat VŠECHNY odkazy na TÉTO stránce?')) {
            if (confirm('⚠️ JSTE SI JISTI? Je to nevratné!')) {
                actionInProgress = true;
                toggleSyncMessage(true);

                try {
                    let deleteCount = 0;
                    // Mažeme jen odkazy z aktuálního zobrazení (currentLinks)
                    for (const link of currentLinks) {
                        const success = await window.deleteLinkFromFirestore(link.id);
                        if (success) deleteCount++;
                    }

                    if (deleteCount === currentLinks.length) {
                        await loadLinksForCurrentPage();
                        toggleSyncMessage(true, '✅ Stránka vyčištěna!');
                    } else {
                        toggleSyncMessage(true, `Smazáno ${deleteCount}/${currentLinks.length}.`, true);
                    }
                } catch (error) {
                    console.error("❌ Chyba:", error);
                    toggleSyncMessage(true, 'Chyba při hromadném mazání.', true);
                }

                toggleSyncMessage(false);
                actionInProgress = false;
            }
        }
    });
}

// --- G. ULOŽENÍ EDITACE (Z Modalu) ---
// ULOŽENÍ EDITU - S PODPOROU PŘESUNU
if (saveEditButton) {
    saveEditButton.addEventListener('click', async () => {
        if (actionInProgress) return;

        const data = window.modalManager.getData();

        if (!window.modalManager.isValid()) {
            toggleSyncMessage(true, 'Vyplň název i URL!', true);
            return;
        }

        actionInProgress = true;
        toggleSyncMessage(true);
        
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
            toggleSyncMessage(true, '✅ Uloženo!');
            window.modalManager.close();
            // Znovu načteme aktuální stránku (pokud jsme přesouvali pryč, odkaz zmizí - to je správně)
            await loadLinksForCurrentPage();
        } else {
            toggleSyncMessage(true, 'Chyba při ukládání.', true);
        }
    
        toggleSyncMessage(false);
        actionInProgress = false;
    });
}

// --- H. INICIALIZACE ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🔄 Links.js: Čekám na PaginationManager...");
    
    // Inteligentní čekání na načtení systému stránek
    const waitForPagination = setInterval(async () => {
        if (window.paginationManager && window.paginationManager.initialized) {
            clearInterval(waitForPagination);
            console.log("✅ PaginationManager připraven. Načítám data...");
            await loadLinksForCurrentPage();
        }
    }, 100);
    
    // Záchranná brzda po 10 sekundách
    setTimeout(() => {
        if (!window.paginationManager || !window.paginationManager.initialized) {
            clearInterval(waitForPagination);
            console.error("❌ Timeout: PaginationManager se nenačetl.");
            // Nezobrazujeme chybu uživateli hned, abychom nestrašili při pomalém netu, 
            // ale v konzoli to bude.
        }
    }, 10000);
});