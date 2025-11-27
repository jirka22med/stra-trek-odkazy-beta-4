// Sprava-tapet.js - FULL PERFORMANCE MODE v2.1
// 🖖 Více admirál Jiřík - Bez animací pro maximální výkon

(function() {
    'use strict';

    // ========================================
    // KONFIGURACE
    // ========================================
    const CONFIG = {
        debug: true,
        prefix: 'melnicka_tapeta_',
        containerSelector: '.background-image-container img',
        tapety: {
            desktop: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_1920x1080_2.jpg?ver=0',
            mobile: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_1024x1792.jpg?ver=0'
        },
        fallback: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_1920x1080_2.jpg?ver=0',
        preloadImages: true
    };

    // ========================================
    // UTILITY FUNKCE
    // ========================================

    // Debug log
    function log(message, type = 'info') {
        if (!CONFIG.debug) return;
        const emoji = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : type === 'success' ? '✅' : '🖖';
        console.log(`${emoji} [Mělnická Tapeta] ${message}`);
    }

    // LocalStorage s unikátním prefixem
    function saveToStorage(key, value) {
        try {
            localStorage.setItem(CONFIG.prefix + key, JSON.stringify(value));
            log(`Uloženo do storage: ${key}`, 'success');
        } catch (e) {
            log(`Chyba ukládání do storage: ${e.message}`, 'error');
        }
    }

    function loadFromStorage(key) {
        try {
            const value = localStorage.getItem(CONFIG.prefix + key);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            log(`Chyba načítání ze storage: ${e.message}`, 'error');
            return null;
        }
    }

    // ========================================
    // DETEKCE ZAŘÍZENÍ (VYLEPŠENÁ)
    // ========================================
    function detectDevice() {
        const width = window.screen.width;
        const height = window.screen.height;
        const ua = navigator.userAgent.toLowerCase();
        const pixelRatio = window.devicePixelRatio || 1;
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        const device = {
            // Infinix Note 30 detekce
            isInfinix: (
                width <= 420 && 
                height >= 800 && 
                hasTouch &&
                (ua.includes('infinix') || 
                 ua.includes('note30') || 
                 ua.includes('android'))
            ),
            
            // Obecné kategorie
            isMobile: width <= 768 || hasTouch,
            isTablet: width > 768 && width <= 1024 && hasTouch,
            isDesktop: width > 1024 && !hasTouch,
            isLargeMonitor: width > 1600,
            
            // Orientace
            orientation: window.matchMedia("(orientation: landscape)").matches ? 'landscape' : 'portrait',
            
            // Technické info
            screenWidth: width,
            screenHeight: height,
            pixelRatio: pixelRatio,
            hasTouch: hasTouch,
            userAgent: ua
        };

        log(`Detekováno zařízení: ${device.isInfinix ? 'Infinix Note 30' : device.isMobile ? 'Mobile' : 'Desktop'}`, 'success');
        log(`Rozlišení: ${width}x${height}, Pixel Ratio: ${pixelRatio}`, 'info');

        return device;
    }

    // ========================================
    // PRELOAD OBRÁZKU
    // ========================================
    function preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                log(`Obrázek úspěšně načten: ${url}`, 'success');
                resolve(url);
            };
            
            img.onerror = () => {
                log(`Chyba načtení obrázku: ${url}`, 'error');
                reject(new Error(`Failed to load image: ${url}`));
            };
            
            img.src = url;
        });
    }

    // ========================================
    // NASTAVENÍ TAPETY
    // ========================================
    async function setTapeta(forceRefresh = false) {
        log('Zahajuji nastavení tapety...', 'info');

        // Získej device info
        const device = detectDevice();
        saveToStorage('device_info', device);

        // Vyber správnou tapetu
        let tapetyUrl;
        if (device.isInfinix || (device.isMobile && device.screenWidth <= 420)) {
            tapetyUrl = CONFIG.tapety.mobile;
            log('Vybrána MOBILNÍ tapeta', 'info');
        } else {
            tapetyUrl = CONFIG.tapety.desktop;
            log('Vybrána DESKTOP tapeta', 'info');
        }

        // Kontrola cache (pokud není force refresh)
        const cachedUrl = loadFromStorage('current_url');
        const cachedTimestamp = loadFromStorage('last_set_timestamp');
        const now = Date.now();
        const cacheAge = cachedTimestamp ? (now - cachedTimestamp) / 1000 / 60 : Infinity; // minuty

        if (!forceRefresh && cachedUrl === tapetyUrl && cacheAge < 60) {
            log(`Použita CACHED tapeta (cache age: ${Math.round(cacheAge)} min)`, 'info');
            applyTapeta(cachedUrl);
            return;
        }

        // Preload obrázku (pokud je zapnutý)
        if (CONFIG.preloadImages) {
            try {
                log('Preloaduji obrázek...', 'info');
                await preloadImage(tapetyUrl);
            } catch (error) {
                log(`Preload selhal, zkouším fallback: ${error.message}`, 'warn');
                tapetyUrl = CONFIG.fallback;
                try {
                    await preloadImage(tapetyUrl);
                } catch (fallbackError) {
                    log('I fallback selhal!', 'error');
                    return;
                }
            }
        }

        // Aplikuj tapetu
        applyTapeta(tapetyUrl);

        // Ulož do cache
        saveToStorage('current_url', tapetyUrl);
        saveToStorage('last_set_timestamp', now);
        saveToStorage('device_type', device.isInfinix ? 'infinix' : device.isMobile ? 'mobile' : 'desktop');
    }

    // ========================================
    // APLIKACE TAPETY NA DOM - BEZ ANIMACÍ
    // ========================================
    function applyTapeta(url) {
        const bgContainer = document.querySelector(CONFIG.containerSelector);

        if (!bgContainer) {
            log('KRITICKÁ CHYBA: Background container nenalezen!', 'error');
            log(`Hledaný selektor: ${CONFIG.containerSelector}`, 'error');
            return;
        }

        // Přímé nastavení bez fade efektu
        bgContainer.src = url;
        bgContainer.alt = 'Mělnická tapeta';

        log(`Tapeta úspěšně nastavena: ${url}`, 'success');
    }

    // ========================================
    // OBNOVENÍ TAPETY
    // ========================================
    function restoreTapeta() {
        log('Obnovuji uloženou tapetu...', 'info');

        const cachedUrl = loadFromStorage('current_url');
        const cachedDeviceType = loadFromStorage('device_type');

        if (cachedUrl) {
            log(`Nalezena cached tapeta: ${cachedDeviceType}`, 'success');
            applyTapeta(cachedUrl);
        } else {
            log('Žádná cached tapeta, nastavuji novou...', 'warn');
            setTapeta();
        }
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================
    function setupEventListeners() {
        // Orientace (mobil) - okamžitá reakce
        window.addEventListener('orientationchange', () => {
            log('Změna orientace detekována', 'info');
            setTapeta(true);
        });

        // Resize (desktop) - s debounce pro výkon
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                log('Změna velikosti okna detekována', 'info');
                setTapeta(true);
            }, 500);
        });

        log('Event listeners nastaveny', 'success');
    }

    // ========================================
    // INICIALIZACE
    // ========================================
    function init() {
        log('═══════════════════════════════════════', 'info');
        log('MĚLNICKÁ TAPETA MODULE v2.1 - PERFORMANCE', 'info');
        log('═══════════════════════════════════════', 'info');

        // Kontrola DOM elementu
        const bgContainer = document.querySelector(CONFIG.containerSelector);
        if (!bgContainer) {
            log('CHYBA: Background container neexistuje!', 'error');
            log(`Očekávaný selektor: ${CONFIG.containerSelector}`, 'error');
            log('Ujisti se, že máš v HTML: <div class="background-image-container"><img src=""></div>', 'error');
            return;
        }

        log('Background container nalezen ✓', 'success');

        // Nastav event listeners
        setupEventListeners();

        // Obnov nebo nastav tapetu
        restoreTapeta();

        log('Inicializace dokončena!', 'success');
        log('═══════════════════════════════════════', 'info');
    }

    // ========================================
    // VEŘEJNÉ API
    // ========================================
    window.MelnickaTapeta = {
        refresh: () => setTapeta(true),
        getDeviceInfo: () => loadFromStorage('device_info'),
        getCurrentUrl: () => loadFromStorage('current_url'),
        clearCache: () => {
            localStorage.removeItem(CONFIG.prefix + 'current_url');
            localStorage.removeItem(CONFIG.prefix + 'last_set_timestamp');
            localStorage.removeItem(CONFIG.prefix + 'device_info');
            log('Cache vymazána!', 'success');
        },
        version: '2.1 - Performance Mode'
    };

    // ========================================
    // AUTO-START
    // ========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
