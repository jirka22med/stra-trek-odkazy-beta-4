// Sprava-tapet.js - KOMPLETNÍ MODUL

// --- Detekce zařízení ---
function detectDeviceType() {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const userAgent = navigator.userAgent.toLowerCase();
    
    const deviceInfo = {
        isInfinixNote30: (
            screenWidth <= 420 && 
            screenHeight >= 800 && 
            (userAgent.includes('infinix') || 
             userAgent.includes('note30') || 
             userAgent.includes('android'))
        ),
        isLargeMonitor: screenWidth > 1600,
        isMobile: screenWidth <= 768,
        orientation: window.matchMedia("(orientation: landscape)").matches ? 'landscape' : 'portrait'
    };
    
    // Uložení do localStorage
    localStorage.setItem('device_isLargeMonitor', deviceInfo.isLargeMonitor.toString());
    localStorage.setItem('device_isInfinixNote30', deviceInfo.isInfinixNote30.toString());
    localStorage.setItem('device_isMobile', deviceInfo.isMobile.toString());
    localStorage.setItem('device_orientation', deviceInfo.orientation);
    
    return deviceInfo;
}

// --- Nastavení tapety ---
function setBackgroundForDevice() {
    const deviceInfo = detectDeviceType();
    
    // MĚLNICKÉ TAPETY
    const backgrounds = {
        desktop: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_1920x1080_2.jpg?ver=0',
        infinix: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_1024x1792.jpg?ver=0
    };
    
    let backgroundUrl = deviceInfo.isInfinixNote30 
        ? backgrounds.infinix 
        : backgrounds.desktop;
    
    const bgContainer = document.querySelector('.background-image-container img');
    
    if (bgContainer) {
        bgContainer.src = backgroundUrl;
        console.log('✅ Mělnická tapeta nastavena:', deviceInfo.isInfinixNote30 ? 'Mobile' : 'Desktop');
    } else {
        console.warn('⚠️ .background-image-container img nenalezen!');
    }
    
    localStorage.setItem('background_url', backgroundUrl);
}

// --- Obnovení předchozí tapety ---
function restorePreviousBackground() {
    const savedBackgroundUrl = localStorage.getItem('background_url');
    const bgContainerImg = document.querySelector('.background-image-container img');
    
    if (!bgContainerImg) {
        console.warn('⚠️ Background container nenalezen!');
        return;
    }
    
    if (savedBackgroundUrl) {
        bgContainerImg.src = savedBackgroundUrl;
        console.log('✅ Obnovena uložená tapeta');
    } else {
        setBackgroundForDevice();
    }
}

// --- Event Listeners ---
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        setBackgroundForDevice();
    }, 300);
});

window.addEventListener('resize', () => {
    if (window.resizeTimer) clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
        setBackgroundForDevice();
    }, 250);
});

// --- Inicializace ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('🖖 Sprava-tapet.js inicializován');
    restorePreviousBackground();
});
