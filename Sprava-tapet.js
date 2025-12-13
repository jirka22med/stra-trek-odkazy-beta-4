// Sprava-tapet.js - FULL PERFORMANCE MODE v2.2
// 🖖 Více admirál Jiřík - INFINIX NOTE 30 FIX + GPU Akcelerace

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
            desktop: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/animal-nature-feather-multi-colored-close-up-blue-beak-generative-ai.jpg?ver=0',
            mobile: 'https://img42.rajce.idnes.cz/d4202/19/19651/19651587_25f4050a3274b2ce2c6af3b5fb5b76b1/images/staensoubor1.jpg?ver=0'
        },
        fallback: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_1920x1080_2.jpg?ver=0',
        preloadImages: true,
        enableGPUAcceleration: true
    };

    // ========================================
    // UTILITY FUNKCE
    // ========================================

    // Debug log
    function log(message, type = 'info') {
        if (!CONFIG.debug) return;
        const emoji = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : type === 'success' ? '✅' : '🖖';
        console.log(`${emoji} [Mělnická Tapeta v2.2] ${message}`);
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
            userAgent: ua,
            
            // Android specifika
            isAndroid: ua.includes('android'),
            androidVersion: ua.match(/android (\d+)/i) ? parseInt(ua.match(/android (\d+)/i)[1]) : null
        };

        log(`Detekováno zařízení: ${device.isInfinix ? 'Infinix Note 30' : device.isMobile ? 'Mobile' : 'Desktop'}`, 'success');
        log(`Rozlišení: ${width}x${height}, Pixel Ratio: ${pixelRatio}`, 'info');
        if (device.isAndroid) {
            log(`Android verze: ${device.androidVersion || 'neznámá'}`, 'info');
        }

        return device;
    }

    // ========================================
    // GPU AKCELERACE - FORCE REPAINT
    // ========================================
    function forceGPUAcceleration(element) {
        if (!CONFIG.enableGPUAcceleration || !element) return;

        try {
            // Force GPU layer
            element.style.transform = 'translate3d(0, 0, 0)';
            element.style.webkitTransform = 'translate3d(0, 0, 0)';
            element.style.backfaceVisibility = 'hidden';
            element.style.webkitBackfaceVisibility = 'hidden';
            element.style.perspective = '1000px';
            element.style.webkitPerspective = '1000px';

            // Force repaint (důležité pro Android)
            element.style.display = 'none';
            element.offsetHeight; // Trigger reflow
            element.style.display = '';

            log('GPU akcelerace aktivována', 'success');
        } catch (e) {
            log(`Chyba při aktivaci GPU: ${e.message}`, 'warn');
        }
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
            applyTapeta(cachedUrl, device);
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
        applyTapeta(tapetyUrl, device);

        // Ulož do cache
        saveToStorage('current_url', tapetyUrl);
        saveToStorage('last_set_timestamp', now);
        saveToStorage('device_type', device.isInfinix ? 'infinix' : device.isMobile ? 'mobile' : 'desktop');
    }

    // ========================================
    // APLIKACE TAPETY NA DOM - S GPU AKCELERACÍ
    // ========================================
    function applyTapeta(url, device) {
        const bgContainer = document.querySelector(CONFIG.containerSelector);

        if (!bgContainer) {
            log('KRITICKÁ CHYBA: Background container nenalezen!', 'error');
            log(`Hledaný selektor: ${CONFIG.containerSelector}`, 'error');
            return;
        }

        // Nastavení obrázku
        bgContainer.src = url;
        bgContainer.alt = 'Mělnická tapeta';

        // GPU akcelerace pro Android/Infinix
        if (device && (device.isAndroid || device.isInfinix || device.isMobile)) {
            log('Aktivuji GPU akceleraci pro mobilní zařízení...', 'info');
            
            // Aplikuj na <img>
            forceGPUAcceleration(bgContainer);
            
            // Aplikuj i na parent container
            const parentContainer = bgContainer.parentElement;
            if (parentContainer) {
                forceGPUAcceleration(parentContainer);
            }

            // Extra fix pro Infinix Note 30
            if (device.isInfinix) {
                log('Infinix Note 30 detekován - aplikuji speciální fix...', 'info');
                bgContainer.style.position = 'absolute';
                bgContainer.style.willChange = 'auto'; // Vypni will-change po načtení
                
                // Delayed cleanup
                setTimeout(() => {
                    bgContainer.style.willChange = 'auto';
                }, 1000);
            }
        }

        log(`Tapeta úspěšně nastavena: ${url}`, 'success');
    }

    // ========================================
    // OBNOVENÍ TAPETY
    // ========================================
    function restoreTapeta() {
        log('Obnovuji uloženou tapetu...', 'info');

        const cachedUrl = loadFromStorage('current_url');
        const cachedDeviceType = loadFromStorage('device_type');
        const device = detectDevice();

        if (cachedUrl) {
            log(`Nalezena cached tapeta: ${cachedDeviceType}`, 'success');
            applyTapeta(cachedUrl, device);
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
            setTimeout(() => {
                setTapeta(true);
            }, 100); // Krátké zpoždění pro stabilizaci
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

        // Scroll event pro debug (pouze v dev módu)
        if (CONFIG.debug) {
            let scrollDebounce;
            window.addEventListener('scroll', () => {
                clearTimeout(scrollDebounce);
                scrollDebounce = setTimeout(() => {
                    const scrollY = window.scrollY || window.pageYOffset;
                    if (scrollY > 0 && scrollY % 500 === 0) {
                        log(`Scroll pozice: ${scrollY}px - tapeta by měla být fixní`, 'info');
                    }
                }, 250);
            }, { passive: true });
        }

        log('Event listeners nastaveny', 'success');
    }

    // ========================================
    // INICIALIZACE
    // ========================================
    function init() {
        log('╔════════════════════════════════════════╗', 'info');
        log('  MĚLNICKÁ TAPETA MODULE v2.2           ', 'info');
        log('  INFINIX NOTE 30 FIX + GPU ACCELERATION', 'info');
        log('╚════════════════════════════════════════╝', 'info');

        // Kontrola DOM elementu
        const bgContainer = document.querySelector(CONFIG.containerSelector);
        if (!bgContainer) {
            log('CHYBA: Background container neexistuje!', 'error');
            log(`Očekávaný selektor: ${CONFIG.containerSelector}`, 'error');
            log('Ujisti se, že máš v HTML: <div class="background-image-container"><img src=""></div>', 'error');
            return;
        }

        log('Background container nalezen ✔', 'success');

        // Nastav event listeners
        setupEventListeners();

        // Obnov nebo nastav tapetu
        restoreTapeta();

        log('Inicializace dokončena!', 'success');
        log('╚════════════════════════════════════════╝', 'info');
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
        toggleGPU: (enable) => {
            CONFIG.enableGPUAcceleration = enable;
            log(`GPU akcelerace: ${enable ? 'ZAPNUTO' : 'VYPNUTO'}`, 'info');
            setTapeta(true);
        },
        version: '2.2 - Infinix Note 30 Fix',
        debug: {
            testScroll: () => {
                const bgContainer = document.querySelector(CONFIG.containerSelector);
                if (bgContainer) {
                    const computed = window.getComputedStyle(bgContainer.parentElement);
                    console.table({
                        'Position': computed.position,
                        'Transform': computed.transform,
                        'Will-Change': computed.willChange,
                        'Z-Index': computed.zIndex
                    });
                }
            }
        }
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
