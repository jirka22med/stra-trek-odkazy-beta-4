// search.js - VYHLEDÁVACÍ MODUL PRO HVĚZDNOU DATABÁZI

class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchButton = document.getElementById('clearSearchButton');
        this.searchCountElement = document.getElementById('searchCount');
        this.linksTableBody = document.getElementById('linksTableBody');
        
        this.currentSearchTerm = '';
        this.allRows = [];
        
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
            this.performSearch();
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
        
        console.log("✅ Vyhledávací modul inicializován");
    }
    
    // Hlavní vyhledávací funkce
    performSearch() {
        const searchTerm = this.currentSearchTerm.toLowerCase();
        
        // Získáme všechny řádky tabulky
        this.allRows = Array.from(this.linksTableBody.querySelectorAll('tr'));
        
        if (searchTerm === '') {
            // Pokud je vyhledávání prázdné, zobraz vše
            this.showAllRows();
            this.updateSearchCount(this.allRows.length);
            return;
        }
        
        let visibleCount = 0;
        
        this.allRows.forEach(row => {
            // Přeskočíme řádky s prázdným stavem nebo loading
            const firstCell = row.querySelector('td');
            if (!firstCell || firstCell.colSpan > 1) {
                row.classList.add('hidden-by-search');
                return;
            }
            
            // Získáme data z řádku
            const cells = row.querySelectorAll('td');
            if (cells.length < 3) {
                row.classList.add('hidden-by-search');
                return;
            }
            
            const linkName = cells[1].textContent.toLowerCase();
            const linkUrlButton = cells[2].querySelector('.url-button');
            const linkUrl = linkUrlButton ? linkUrlButton.dataset.url.toLowerCase() : '';
            
            // Kontrola shody
            const nameMatch = linkName.includes(searchTerm);
            const urlMatch = linkUrl.includes(searchTerm);
            
            if (nameMatch || urlMatch) {
                // Zobrazíme řádek
                row.classList.remove('hidden-by-search');
                visibleCount++;
                
                // Zvýrazníme shody
                this.highlightMatches(cells[1], searchTerm, linkName);
                if (linkUrlButton) {
                    this.highlightButtonText(linkUrlButton, searchTerm, linkUrl);
                }
            } else {
                // Skryjeme řádek
                row.classList.add('hidden-by-search');
                // Odstraníme zvýraznění
                this.removeHighlights(cells[1]);
                if (linkUrlButton) {
                    linkUrlButton.textContent = 'Odkaz';
                }
            }
        });
        
        this.updateSearchCount(visibleCount);
    }
    
    // Zvýraznění textu v buňce
    highlightMatches(cell, searchTerm, originalText) {
        if (!cell || !searchTerm) return;
        
        const index = originalText.indexOf(searchTerm);
        if (index === -1) {
            cell.innerHTML = cell.textContent;
            return;
        }
        
        // Získáme původní text (bez HTML)
        const text = cell.textContent;
        const startIndex = text.toLowerCase().indexOf(searchTerm);
        
        if (startIndex === -1) {
            return;
        }
        
        const before = text.substring(0, startIndex);
        const match = text.substring(startIndex, startIndex + searchTerm.length);
        const after = text.substring(startIndex + searchTerm.length);
        
        cell.innerHTML = `${this.escapeHtml(before)}<span class="highlight">${this.escapeHtml(match)}</span>${this.escapeHtml(after)}`;
    }
    
    // Zvýraznění v tlačítku URL
    highlightButtonText(button, searchTerm, url) {
        if (!button) return;
        
        if (url.includes(searchTerm)) {
            button.textContent = '🔍 Shoda';
            button.style.background = 'linear-gradient(135deg, #aa7700, #ffaa00)';
        } else {
            button.textContent = 'Odkaz';
            button.style.background = '';
        }
    }
    
    // Odstranění zvýraznění
    removeHighlights(cell) {
        if (!cell) return;
        cell.innerHTML = cell.textContent;
    }
    
    // Zobrazení všech řádků
    showAllRows() {
        this.allRows.forEach(row => {
            row.classList.remove('hidden-by-search');
            
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
                this.removeHighlights(cells[1]);
            }
            
            const urlButton = row.querySelector('.url-button');
            if (urlButton) {
                urlButton.textContent = 'Odkaz';
                urlButton.style.background = '';
            }
        });
    }
    
    // Aktualizace počítadla
    updateSearchCount(count) {
        if (this.searchCountElement) {
            this.searchCountElement.textContent = count;
        }
    }
    
    // Vymazání vyhledávání
    clearSearch() {
        this.searchInput.value = '';
        this.currentSearchTerm = '';
        this.showAllRows();
        this.updateSearchCount(this.allRows.length);
        this.searchInput.focus();
        console.log("🔄 Vyhledávání vymazáno");
    }
    
    // Escape HTML znaků
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Refresh po načtení nových dat
    refresh() {
        if (this.currentSearchTerm) {
            // Pokud probíhá vyhledávání, znovu aplikuj filtr
            setTimeout(() => this.performSearch(), 100);
        } else {
            // Jinak jen aktualizuj počítadlo
            this.allRows = Array.from(this.linksTableBody.querySelectorAll('tr'));
            const validRows = this.allRows.filter(row => {
                const firstCell = row.querySelector('td');
                return firstCell && firstCell.colSpan === undefined;
            });
            this.updateSearchCount(validRows.length);
        }
    }
}

// Globální instance
let searchManager = null;

// Inicializace po načtení DOM
document.addEventListener('DOMContentLoaded', () => {
    searchManager = new SearchManager();
    console.log("🔍 Vyhledávací systém aktivován");
});

// Export pro použití v jiných souborech
window.searchManager = searchManager;