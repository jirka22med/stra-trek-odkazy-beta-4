// Performance monitoring (pouze pro debug)
let frameCount = 0;
let lastFpsUpdate = Date.now();

function monitorPerformance() {
    frameCount++;
    const now = Date.now();
    if (now - lastFpsUpdate > 5000) {
        const fps = Math.round((frameCount / 5) * 10) / 10;
        const perfEl = document.getElementById('perfMode');
        if (perfEl) perfEl.textContent = `⚡ monitorPerformance  | ${fps} FPS`;
        frameCount = 0;
        lastFpsUpdate = now;
    }
    requestAnimationFrame(monitorPerformance);
}

monitorPerformance();