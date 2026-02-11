/*--------------------
SETTINGS
--------------------*/
let waveSettings = {
    lines: 10, // Slightly reduced for performance with multiple sections
    speed: 0.015,
    amplitude: 40,
    wavelength: 180,
    parallaxFactor: 0.15
}


/*--------------------
VARS
--------------------*/
let waveSystems = []; // Store multiple wave instances
let waveTime = 0;


/*--------------------
PATH CLASS
--------------------*/
class WavePath {
    constructor(y, fill, index, container, winH) {
        this.baseY = y;
        this.fill = fill;
        this.index = index;
        this.containerHeight = winH;

        // Randomize characteristics for "Organic" feel
        this.speedFactor = 0.5 + Math.random() * 1.5;
        this.amplitudeFactor = 0.6 + Math.random() * 1.2;
        this.phaseShift = Math.random() * Math.PI * 2;
        this.parallaxMult = (index / waveSettings.lines) * waveSettings.parallaxFactor;

        this.el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.el.setAttribute('fill', fill);
        this.el.style.opacity = 0.3 + (index / waveSettings.lines) * 0.7;
        container.appendChild(this.el);
    };

    update(time, scroll, waveWinW, waveWinH, waveScrollY) {
        let x = -100;
        const scrollOffset = (scroll - waveScrollY) * this.parallaxMult;
        const currentBaseY = this.baseY - scrollOffset;

        let d = `M -100 ${waveWinH + 200}`;

        let first = true;
        while (x < waveWinW + 100) {
            const noise = Math.sin(time * this.speedFactor + (x / waveSettings.wavelength) + this.index + this.phaseShift) *
                (waveSettings.amplitude * this.amplitudeFactor);
            const y = currentBaseY + noise;

            if (first) {
                d += ` L ${x} ${y}`;
                first = false;
            } else {
                d += ` L ${x} ${y}`;
            }
            x += 40; // Slightly larger step for performance
        }

        d += ` L ${waveWinW + 100} ${waveWinH + 200} Z`;
        this.el.setAttribute('d', d);
    }
};


/*--------------------
INIT SYSTEM
--------------------*/
function initWaves() {
    if (typeof chroma === 'undefined') return;

    waveSystems = [];
    const containers = document.querySelectorAll('.wave-container');
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    containers.forEach(container => {
        const parentSection = container.closest('section');
        if (!parentSection) return;

        // Reset
        while (container.firstChild) container.removeChild(container.firstChild);

        const winW = parentSection.offsetWidth;
        const winH = parentSection.offsetHeight;
        const scrollY = parentSection.offsetTop - window.innerHeight;

        let colors;
        if (isLight) {
            colors = chroma.scale(['hsl(210, 80%, 90%)', 'hsl(250, 70%, 95%)']).mode('lch').colors(waveSettings.lines + 1);
        } else {
            colors = chroma.scale(['hsl(215, 60%, 15%)', 'hsl(260, 50%, 5%)']).mode('lch').colors(waveSettings.lines + 1);
        }

        const fusionOffset = 150;
        const effectiveHeight = winH - fusionOffset;

        const paths = [];
        for (let i = 0; i < waveSettings.lines; i++) {
            let rootY = fusionOffset + (effectiveHeight / (waveSettings.lines - 1)) * i;
            paths.push(new WavePath(rootY, colors[i], i, container, winH));
        }

        waveSystems.push({
            container,
            paths,
            winW,
            winH,
            scrollY
        });
    });
}

/*--------------------
ANIMATE
--------------------*/
function animateWaves() {
    waveTime += waveSettings.speed;
    const currentScroll = window.pageYOffset;
    waveSystems.forEach(system => {
        system.paths.forEach(path => path.update(waveTime, currentScroll, system.winW, system.winH, system.scrollY));
    });
    requestAnimationFrame(animateWaves);
}

/*--------------------
LISTENERS
--------------------*/
window.addEventListener('resize', initWaves);
const waveThemeObs = new MutationObserver(initWaves);
waveThemeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

// Start
initWaves();
animateWaves();

// Watch multiple sections
document.querySelectorAll('.skills, .projects, .certifications, .contact').forEach(sec => {
    new ResizeObserver(initWaves).observe(sec);
});
