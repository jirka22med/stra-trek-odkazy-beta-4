function setBackgroundForDevice() {
    const deviceInfo = detectDeviceType();
    const backgrounds = {
        desktop: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_1920x1080_2.jpg?ver=0',
        infinix: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_1024x1792.jpg?ver=0'
    };
    let backgroundUrl = deviceInfo.isInfinixNote30 ? backgrounds.infinix : backgrounds.desktop;
    const bgContainer = document.querySelector('.background-image-container img');
    if (bgContainer) bgContainer.src = backgroundUrl;
    localStorage.setItem('background_url', backgroundUrl);
}

function restorePreviousBackground() {
    const savedBackgroundUrl = localStorage.getItem('background_url');
    const bgContainerImg = document.querySelector('.background-image-container img');
    if (!bgContainerImg) return;
    if (savedBackgroundUrl) {
        bgContainerImg.src = savedBackgroundUrl;
    } else {
        setBackgroundForDevice();
    }
}
