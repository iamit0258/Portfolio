const generateStars = (n, range) => {
    let value = '';
    for (let i = 0; i < n; i++) {
        const x = Math.floor(Math.random() * range);
        const y = Math.floor(Math.random() * range);
        value += `${x}px ${y}px #FFF${i === n - 1 ? '' : ','}`;
    }
    return value;
};

const initStars = () => {
    // Target classes instead of IDs
    document.querySelectorAll('.stars-layer-1').forEach(layer => {
        layer.style.boxShadow = generateStars(700, 2000);
    });
    document.querySelectorAll('.stars-layer-2').forEach(layer => {
        layer.style.boxShadow = generateStars(200, 2000);
    });
    document.querySelectorAll('.stars-layer-3').forEach(layer => {
        layer.style.boxShadow = generateStars(100, 2000);
    });
};

document.addEventListener('DOMContentLoaded', initStars);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initStars();
}
