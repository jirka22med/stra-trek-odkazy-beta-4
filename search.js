// search.js - GLOBÁLNÍ VYHLEDÁVÁNÍ (Deep Space Scan)
// Verze 2.0 - Prohledává celou databázi napříč všemi stránkami

class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchButton = document.getElementById('clearSearchButton');
        this.searchCountElement = document.getElementById('searchCount');
        this.linksTableBody = document.getElementById('linksTableBody');
        
        this.currentSearchTerm = '';
        this.isSearching = false;
        
        // Cache pro data
        this.allLinksCache = [];
        this.allPagesCache = [];
        
        this.init();
    }
    
    init() {
        if (!this.searchInput || !this.clearSearchButton) {
            console.error("⚠️ Vyhledávací elementy nenalezeny!");
            return;
        }
        
        // Real-time vyhledávání při psaní
        this.searchInput.addEventListener('input', (e) => {
            this.currentSearchTerm = e.target.value.trim();
            if (this.currentSearchTerm.length > 0) {
                this.performGlobalSearch();
            } else {
                this.clearSearch();
            }
        });
        
        // Vymazání vyhledávání
        this.clearSearchButton.addEventListener('click', () => {
            this.clearSearch();
        });
        
        // ESC klávesa pro vymazání
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch();
            }
        });
        
        console.log("✅ Vyhledávací modul 2.0 (Globální) inicializován");
    }
    
    // 🚀 HLAVNÍ FUNKCE: Globální vyhledávání
    async performGlobalSearch() {
        this.isSearching = true;
        const searchTerm = this.currentSearchTerm.toLowerCase();
        
        // 1. Načteme VŠECHNA data (pokud je ještě nemáme)
        // Využijeme existující funkce z firebaseLinksFunctions.js
        if (this.allLinksCache.length === 0 || !this.allPagesCache.length) {
            console.log("📡 Skenuji celou databázi pro vyhledávání...");
            this.allLinksCache = await window.getLinksFromFirestore();
            this.allPagesCache = await window.getPagesFromFirestore();
        }

        // 2. Filtrování výsledků
        const results = this.allLinksCache.filter(link => {
            const nameMatch = link.name.toLowerCase().includes(searchTerm);
            const urlMatch = link.url.toLowerCase().includes(searchTerm);
            return nameMatch || urlMatch;
        });

        // 3. Vykreslení výsledků
        this.renderSearchResults(results, searchTerm);
    }
    
    // Vykreslení tabulky s výsledky
    renderSearchResults(results, searchTerm) {
        if (!this.linksTableBody) return;
        
        this.linksTableBody.innerHTML = '';
        this.updateSearchCount(results.length);

        if (results.length === 0) {
            this.linksTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #ffaa00; padding: 20px;">
                        ⚠️ Žádný záznam nenalezen pro: "<strong>${this.escapeHtml(searchTerm)}</strong>"
                    </td>
                </tr>`;
            return;
        }

        const fragment = document.createDocumentFragment();

        results.forEach((link, index) => {
            // Zjistíme název stránky, kam odkaz patří
            const sourcePage = this.allPagesCache.find(p => p.id === link.pageId);
            const pageName = sourcePage ? sourcePage.name : "Nezařazeno";

            const row = document.createElement('tr');
            row.dataset.linkId = link.id;
            
            // HTML pro řádek s výsledkem
            // Přidali jsme malý štítek (span) s názvem stránky pod název odkazu
            row.innerHTML = `
                <td style="color: #888;">${index + 1}</td>
                <td style="text-align: center;">
                    <div style="font-weight: bold; font-size: 1.1em;">${this.highlightText(link.name, searchTerm)}</div>
                    <div style="font-size: 0.8em; color: #FF7800; margin-top: 4px; opacity: 0.8;">
                        📂 Sekce: ${this.escapeHtml(pageName)}
                    </div>
                </td>
                <td><button class="url-button" data-url="${link.url}" title="${link.url}">Odkaz</button></td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-link-button" data-name="${link.name}" data-url="${link.url}">✏️</button>
                        <button class="delete-link-button">🗑️</button>
                    </div>
                </td>
            `;
            fragment.appendChild(row);
        });

        this.linksTableBody.appendChild(fragment);
    }
    
    // Zvýraznění hledaného textu (žlutě)
    highlightText(text, searchTerm) {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${this.escapeHtml(searchTerm)})`, 'gi');
        return this.escapeHtml(text).replace(regex, '<span style="background: rgba(255,255,0,0.3); color: #ffff00;">$1</span>');
    }

    // Vymazání hledání a návrat na aktuální stránku
    clearSearch() {
        this.searchInput.value = '';
        this.currentSearchTerm = '';
        this.isSearching = false;
        
        // Vyčistíme počítadlo
        if (this.searchCountElement) this.searchCountElement.textContent = '0';
        
        // Invalidujeme cache pro příští hledání (aby byla data čerstvá)
        this.allLinksCache = [];
        
        console.log("🔄 Vyhledávání ukončeno, návrat na stránku.");
        
        // Zavoláme PaginationManager, aby obnovil původní zobrazení stránky
        if (window.paginationManager) {
            window.paginationManager.loadLinksForCurrentPage();
        }
    }
    
    updateSearchCount(count) {
        if (this.searchCountElement) {
            this.searchCountElement.textContent = count;
        }
    }
    
    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Pomocná metoda pro refresh (pokud je potřeba zvenčí)
    refresh() {
        if (this.isSearching) {
            this.performGlobalSearch();
        }
    }
}

// Globální instance
window.searchManager = null;

document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
});
