// pagination.js - STRÁNKOVÁNÍ A SPRÁVA STRÁNEK - OPRAVENO

class PaginationManager {
    constructor() {
        this.currentPageId = null;
        this.allPages = [];
        this.itemsPerPage = 10; // Počet odkazů na stránku
        
        // UI elementy
        this.tabsContainer = document.getElementById('pageTabs');
        this.addPageButton = document.getElementById('addPageButton');
        this.newPageNameInput = document.getElementById('newPageName');
        
        this.initialized = false;
    }
    
    async init() {
        if (this.initialized) return;
        
        console.log("🚀 Inicializace Pagination Manageru...");
        
        // 🛠️ OPRAVA: Nejprve musíme nastartovat Firebase!
        // Bez toho funkce getPagesFromFirestore selžou s chybou "db is null"
        const dbReady = await window.initializeFirebaseLinksApp();
        
        if (!dbReady) {
            console.error("🛑 KRITICKÁ CHYBA: Nepodařilo se připojit k Firebase!");
            if (this.tabsContainer) {
                this.tabsContainer.innerHTML = '<div class="no-pages" style="color: red;">❌ Chyba připojení k databázi</div>';
            }
            return;
        }

        // Načteme stránky z Firebase (teď už to půjde)
        await this.loadPages();
        
        // Event listenery
        if (this.addPageButton) {
            this.addPageButton.addEventListener('click', () => this.addNewPage());
        }
        
        // Enter key v inputu
        if (this.newPageNameInput) {
            this.newPageNameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.addNewPage();
                }
            });
        }
        
        this.initialized = true;
        console.log("✅ Pagination Manager inicializován a připojen k DB");
    }
    
    // Načtení všech stránek z Firebase
    async loadPages() {
        const pages = await window.getPagesFromFirestore();
        
        // Pokud neexistují žádné stránky, vytvoříme výchozí
        if (pages.length === 0) {
            console.log("📄 Žádné stránky nenalezeny, vytvářím výchozí...");
            // Zde už DB musí fungovat
            await window.addPageToFirestore('Hlavní stránka', 0);
            this.allPages = await window.getPagesFromFirestore();
        } else {
            this.allPages = pages;
        }
        
        // Nastavíme první stránku jako aktivní
        if (this.allPages.length > 0 && !this.currentPageId) {
            this.currentPageId = this.allPages[0].id;
        }
        
        this.renderTabs();
        console.log(`✅ Načteno ${this.allPages.length} stránek`);
    }
    
    // Vykreslení záložek stránek
    renderTabs() {
        if (!this.tabsContainer) return;
        
        this.tabsContainer.innerHTML = '';
        
        if (this.allPages.length === 0) {
            this.tabsContainer.innerHTML = '<div class="no-pages">🌌 Žádné stránky</div>';
            return;
        }
        
        const fragment = document.createDocumentFragment();
        
        this.allPages.forEach(page => {
            const tab = document.createElement('div');
            tab.className = 'page-tab';
            if (page.id === this.currentPageId) {
                tab.classList.add('active');
            }
            
            tab.innerHTML = `
                <span class="tab-name">${page.name}</span>
                <button class="tab-delete" data-page-id="${page.id}" title="Smazat stránku">❌</button>
            `;
            
            // Kliknutí na záložku - přepnutí stránky
            tab.querySelector('.tab-name').addEventListener('click', () => {
                this.switchToPage(page.id);
            });
            
            // Kliknutí na křížek - smazání stránky
            tab.querySelector('.tab-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deletePage(page.id, page.name);
            });
            
            fragment.appendChild(tab);
        });
        
        this.tabsContainer.appendChild(fragment);
    }
    
    // Přepnutí na jinou stránku
    async switchToPage(pageId) {
        if (this.currentPageId === pageId) return;
        
        console.log(`🔄 Přepínám na stránku: ${pageId}`);
        this.currentPageId = pageId;
        
        // Překreslíme záložky
        this.renderTabs();
        
        // Načteme odkazy pro tuto stránku
        await this.loadLinksForCurrentPage();
    }
    
    // Načtení odkazů pro aktuální stránku
    async loadLinksForCurrentPage() {
        if (!this.currentPageId) return;
        
        console.log(`📥 Načítám odkazy pro stránku: ${this.currentPageId}`);
        
        const links = await window.getLinksByPageId(this.currentPageId);
        
        // Zavoláme funkci z links.js pro vykreslení
        if (window.populateLinksTable) {
            window.populateLinksTable(links);
        }
        
        // Aktualizujeme vyhledávač
        if (window.searchManager) {
            window.searchManager.refresh();
        }
    }
    
    // Přidání nové stránky
    async addNewPage() {
        if (!this.newPageNameInput) return;
        
        const pageName = this.newPageNameInput.value.trim();
        
        if (!pageName) {
            alert('❌ Zadejte název stránky!');
            return;
        }
        
        console.log(`➕ Přidávám novou stránku: ${pageName}`);
        
        const newOrderIndex = this.allPages.length > 0 
            ? Math.max(...this.allPages.map(p => p.orderIndex)) + 1 
            : 0;
        
        const success = await window.addPageToFirestore(pageName, newOrderIndex);
        
        if (success) {
            this.newPageNameInput.value = '';
            await this.loadPages();
            
            // Přepneme na novou stránku
            const newPage = this.allPages[this.allPages.length - 1];
            if (newPage) {
                await this.switchToPage(newPage.id);
            }
        } else {
            alert('❌ Chyba při vytváření stránky!');
        }
    }
    
    // Smazání stránky
    async deletePage(pageId, pageName) {
        // Nelze smazat poslední stránku
        if (this.allPages.length <= 1) {
            alert('❌ Nelze smazat poslední stránku!');
            return;
        }
        
        const confirmed = confirm(`⚠️ Opravdu chcete smazat stránku "${pageName}"?\n\nVšechny odkazy na této stránce budou také smazány!`);
        
        if (!confirmed) return;
        
        console.log(`🗑️ Mažu stránku: ${pageId}`);
        
        // Smažeme všechny odkazy na této stránce
        const links = await window.getLinksByPageId(pageId);
        
        for (const link of links) {
            await window.deleteLinkFromFirestore(link.id);
        }
        
        // Smažeme stránku
        const success = await window.deletePageFromFirestore(pageId);
        
        if (success) {
            // Pokud jsme smazali aktivní stránku, přepneme na první dostupnou
            if (this.currentPageId === pageId) {
                await this.loadPages();
                if (this.allPages.length > 0) {
                    await this.switchToPage(this.allPages[0].id);
                }
            } else {
                await this.loadPages();
            }
        } else {
            alert('❌ Chyba při mazání stránky!');
        }
    }
    
    // Getter pro aktuální stránku
    getCurrentPageId() {
        return this.currentPageId;
    }
    
    // Refresh po změnách
    async refresh() {
        await this.loadPages();
        if (this.currentPageId) {
            await this.loadLinksForCurrentPage();
        }
    }
}

// Globální instance
window.paginationManager = null;

// Inicializace po načtení DOM
document.addEventListener('DOMContentLoaded', async () => {
    window.paginationManager = new PaginationManager();
    await window.paginationManager.init();
    console.log("📄 Pagination systém aktivován");
});