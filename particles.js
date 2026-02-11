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
        this.color = 'rgba(100, 149, 237, 0.3)';
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.fill();
    }

    update(mouse) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let maxDistance = 200; // Large magnetic field

        if (distance < maxDistance && mouse.x !== null) {
            let force = (maxDistance - distance) / maxDistance;
            // Magnetic pull towards cursor
            this.vx += (dx / distance) * force * 0.3;
            this.vy += (dy / distance) * force * 0.3;

            // Subtle color shift
            const alpha = 0.3 + (force * 0.3);
            this.color = `rgba(0, 242, 254, ${alpha})`;
        } else {
            // Gentle spring return to base
            let dxBase = this.baseX - this.x;
            let dyBase = this.baseY - this.y;
            this.vx += dxBase * this.spring;
            this.vy += dyBase * this.spring;

            // Fade back to base color
            this.color = 'rgba(100, 149, 237, 0.3)';
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

    window.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', resize);

    resize();
    animate();
};

document.addEventListener('DOMContentLoaded', initParticlePattern);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initParticlePattern();
}
