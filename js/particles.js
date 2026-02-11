class Particle {
    constructor(x, y, canvas, ctx) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.vx = 0;
        this.vy = 0;
        this.canvas = canvas;
        this.ctx = ctx;
        this.size = 1.2;
        this.friction = 0.92; // Soft inertia
        this.spring = 0.008; // Very gentle return
        this.baseColorDark = 'rgba(100, 149, 237, 0.3)';
        this.assignAttributes();
    }

    assignAttributes() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if (isLight) {
            this.size = 1.6; // Slightly larger for light mode visibility

            // "Twilight Aura" Curated Gradient Mapping
            // Transitions from Cyan (approx 200) to Violet (approx 280) based on X position
            const normalizedX = this.x / this.canvas.width;
            this.hue = 200 + (normalizedX * 80);

            this.color = `hsla(${this.hue}, 85%, 55%, 0.75)`;
            this.currentColor = this.color;
        } else {
            this.size = 1.2; // Original smaller size for dark mode
            this.color = this.baseColorDark;
            this.currentColor = this.color;
        }
    }

    draw() {
        this.ctx.fillStyle = this.currentColor;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.fill();
    }

    update(mouse) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let maxDistance = 200; // Reduced for more precise activation

        if (distance < maxDistance && mouse.x !== null) {
            let force = (maxDistance - distance) / maxDistance;
            // Magnetic pull towards cursor
            this.vx += (dx / distance) * force * 0.3;
            this.vy += (dy / distance) * force * 0.3;

            // Subtle color shift
            const alpha = 0.4 + (force * 0.4);
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            if (isLight) {
                // Boost brightness and saturation on interaction while keeping the rainbow hue
                this.currentColor = `hsla(${this.hue}, 100%, 60%, ${alpha})`;
            } else {
                this.currentColor = `rgba(0, 242, 254, ${alpha})`;
            }
        } else {
            // Gentle spring return to base
            let dxBase = this.baseX - this.x;
            let dyBase = this.baseY - this.y;
            this.vx += dxBase * this.spring;
            this.vy += dyBase * this.spring;

            // Fade back to base color
            this.currentColor = this.color;
        }

        // Apply friction for soft inertia
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Update position
        this.x += this.vx;
        this.y += this.vy;
    }
}

const initParticlePattern = () => {
    const canvas = document.getElementById('dotCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = {
        x: null,
        y: null
    };

    const resize = () => {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        canvas.width = hero.clientWidth;
        canvas.height = hero.clientHeight;
        init();
    };

    const init = () => {
        particles = [];
        const gap = 35; // Slightly sparser for minimalism
        for (let y = 0; y < canvas.height + gap; y += gap) {
            for (let x = 0; x < canvas.width + gap; x += gap) {
                particles.push(new Particle(x, y, canvas, ctx));
            }
        }
    };

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update(mouse);
            particles[i].draw();
        }
        requestAnimationFrame(animate);
    };

    const handleMouseMove = (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX;
        const y = event.clientY;

        // Boundary checks
        const margin = 2;
        const isOutsideViewport = x <= margin || y <= margin || x >= window.innerWidth - margin || y >= window.innerHeight - margin;

        // Strict check: only activate if mouse is actually within the canvas element's bounds
        const isInsideCanvas = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

        if (isOutsideViewport || !isInsideCanvas) {
            mouse.x = null;
            mouse.y = null;
        } else {
            mouse.x = x - rect.left;
            mouse.y = y - rect.top;
        }
    };

    const handleMouseLeave = () => {
        mouse.x = null;
        mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', (event) => {
        // Just in case we missed a move event while entering
        handleMouseMove(event);
    });

    // Handle cursor leaving the window or switching tabs
    window.addEventListener('blur', handleMouseLeave);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) handleMouseLeave();
    });

    window.addEventListener('resize', resize);

    // Watch for theme changes to update particle colors instantly
    const themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                particles.forEach(p => p.assignAttributes());
            }
        });
    });
    themeObserver.observe(document.documentElement, { attributes: true });

    resize();
    animate();
};

document.addEventListener('DOMContentLoaded', initParticlePattern);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initParticlePattern();
}
