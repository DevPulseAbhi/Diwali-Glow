(() => {
    'use strict';

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // A small field of petals keeps the atmosphere alive without DOM-heavy decoration.
    const petalField = $('.petal-field');
    for (let index = 0; index < 18; index += 1) {
        const petal = document.createElement('span');
        petal.className = 'petal';
        petal.style.left = `${Math.random() * 100}%`;
        petal.style.animationDuration = `${10 + Math.random() * 14}s`;
        petal.style.animationDelay = `${Math.random() * -18}s`;
        petal.style.opacity = `${0.18 + Math.random() * 0.35}`;
        petal.style.transform = `scale(${0.5 + Math.random() * 0.7})`;
        petalField.append(petal);
    }

    // Reveal sections as they enter the viewport.
    const revealItems = $$('.reveal');
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const observer = new IntersectionObserver((entries, currentObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    currentObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealItems.forEach((item) => observer.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add('visible'));
    }

    // Diyas stay lit for this visit and reset naturally on refresh.
    const diyaGrid = $('#diyaGrid');
    for (let index = 0; index < 12; index += 1) {
        const diya = document.createElement('button');
        diya.type = 'button';
        diya.className = 'interactive-diya';
        diya.setAttribute('aria-label', `Light diya ${index + 1}`);
        diya.innerHTML = '<span class="flame"></span><span class="wick"></span><span class="bowl"></span>';
        diya.addEventListener('click', () => {
            diya.classList.add('lit');
            diya.setAttribute('aria-label', `Diya ${index + 1} is lit`);
        });
        diyaGrid.append(diya);
    }
    $('#lightAll').addEventListener('click', () => $$('.interactive-diya').forEach((diya, index) => {
        window.setTimeout(() => diya.click(), prefersReducedMotion ? 0 : index * 75);
    }));

    // Canvas fireworks: particles are discarded after their alpha reaches zero.
    const fireworksCanvas = $('#fireworksCanvas');
    const fireworksContext = fireworksCanvas.getContext('2d');
    let fireworks = [];
    let fireworksRunning = false;
    let audioContext;
    let soundEnabled = false;

    function resizeFireworks() {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        fireworksCanvas.width = window.innerWidth * ratio;
        fireworksCanvas.height = window.innerHeight * ratio;
        fireworksCanvas.style.width = `${window.innerWidth}px`;
        fireworksCanvas.style.height = `${window.innerHeight}px`;
        fireworksContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    resizeFireworks();
    window.addEventListener('resize', resizeFireworks, { passive: true });

    function playPop() {
        if (!soundEnabled) return;
        audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(190, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(70, audioContext.currentTime + 0.16);
        gain.gain.setValueAtTime(0.08, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.16);
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.16);
    }

    function launchFirework(x = window.innerWidth * (.15 + Math.random() * .7), y = window.innerHeight * (.14 + Math.random() * .38), forcedPattern) {
        const colors = ['#f9b233', '#f4dfb2', '#e65c4f', '#70b6a1', '#b483c7', '#f07b4f'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const pattern = forcedPattern || ['ring', 'star', 'willow'][Math.floor(Math.random() * 3)];
        const particleCount = pattern === 'star' ? 56 : 72;
        for (let index = 0; index < particleCount; index += 1) {
            const angle = (Math.PI * 2 * index) / particleCount;
            const speed = pattern === 'star' && index % 7 < 2 ? 4.8 + Math.random() * 1.8 : 1.4 + Math.random() * 4.2;
            fireworks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, previousX: x, previousY: y, alpha: 1, size: 1 + Math.random() * 1.8, color, gravity: pattern === 'willow' ? .055 : .025 + Math.random() * .02, drag: pattern === 'willow' ? .97 : .985 });
        }
        playPop();
        if (!fireworksRunning) animateFireworks();
    }

    function animateFireworks() {
        fireworksRunning = true;
        fireworksContext.fillStyle = 'rgba(9, 13, 38, .16)';
        fireworksContext.fillRect(0, 0, window.innerWidth, window.innerHeight);
        fireworks = fireworks.filter((particle) => {
            particle.previousX = particle.x;
            particle.previousY = particle.y;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += particle.gravity;
            particle.vx *= particle.drag;
            particle.alpha -= .012;
            fireworksContext.globalAlpha = Math.max(particle.alpha, 0);
            fireworksContext.fillStyle = particle.color;
            fireworksContext.shadowBlur = 12;
            fireworksContext.shadowColor = particle.color;
            fireworksContext.strokeStyle = particle.color;
            fireworksContext.lineWidth = particle.size;
            fireworksContext.beginPath();
            fireworksContext.moveTo(particle.previousX, particle.previousY);
            fireworksContext.lineTo(particle.x, particle.y);
            fireworksContext.stroke();
            fireworksContext.beginPath();
            fireworksContext.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            fireworksContext.fill();
            return particle.alpha > 0;
        });
        fireworksContext.globalAlpha = 1;
        fireworksContext.shadowBlur = 0;
        if (fireworks.length) {
            requestAnimationFrame(animateFireworks);
        } else {
            fireworksContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
            fireworksRunning = false;
        }
    }

    $$('[data-fireworks]').forEach((button) => button.addEventListener('click', () => {
        const burstCount = prefersReducedMotion ? 2 : 8;
        for (let index = 0; index < burstCount; index += 1) window.setTimeout(() => launchFirework(), index * 260);
    }));
    $('#celebrateAgain').addEventListener('click', () => {
        document.querySelector('#home').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        for (let index = 0; index < (prefersReducedMotion ? 3 : 10); index += 1) window.setTimeout(() => launchFirework(), index * 220);
    });

    const finale = $('#finale');
    if ('IntersectionObserver' in window) {
        const finaleObserver = new IntersectionObserver((entries, currentObserver) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                for (let index = 0; index < (prefersReducedMotion ? 2 : 7); index += 1) {
                    window.setTimeout(() => launchFirework(window.innerWidth * (.2 + Math.random() * .6), window.innerHeight * (.16 + Math.random() * .28), index % 2 ? 'star' : 'ring'), index * 260);
                }
                currentObserver.disconnect();
            }
        }, { threshold: .35 });
        finaleObserver.observe(finale);
    }

    function setSoundButton(button, enabled) {
        button.setAttribute('aria-pressed', String(enabled));
        const label = button.id === 'musicToggle' ? (enabled ? 'Mute ambient sound' : 'Enable ambient sound') : (enabled ? 'Sound on' : 'Sound off');
        button.setAttribute('aria-label', label);
        if (button.id === 'soundToggle') button.lastChild.textContent = enabled ? ' Sound on' : ' Sound off';
    }
    function toggleSound() {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') audioContext.resume();
            launchFirework(window.innerWidth / 2, window.innerHeight / 3);
        }
        setSoundButton($('#musicToggle'), soundEnabled);
        setSoundButton($('#soundToggle'), soundEnabled);
    }
    $('#musicToggle').addEventListener('click', toggleSound);
    $('#soundToggle').addEventListener('click', toggleSound);

    // Rangoli uses radial symmetry. Each click paints a playful mirrored motif.
    const rangoliCanvas = $('#rangoliCanvas');
    const rangoliContext = rangoliCanvas.getContext('2d');
    let rangoliColor = '#f9b233';
    let rangoliTool = 'flower';
    const paintedNodes = new Map();
    const rangoliCenter = 280;
    const rangoliNodes = [];
    for (let ring = 1; ring <= 3; ring += 1) {
        for (let node = 0; node < 8; node += 1) {
            const angle = (Math.PI * 2 * node) / 8 + (ring % 2 ? Math.PI / 8 : 0);
            rangoliNodes.push({ x: rangoliCenter + Math.cos(angle) * ring * 62, y: rangoliCenter + Math.sin(angle) * ring * 62, ring, node });
        }
    }
    function drawPetal(x, y, angle, color, size = 16) {
        rangoliContext.save();
        rangoliContext.translate(x, y);
        rangoliContext.rotate(angle);
        rangoliContext.fillStyle = color;
        rangoliContext.shadowColor = color;
        rangoliContext.shadowBlur = 10;
        rangoliContext.beginPath();
        rangoliContext.moveTo(0, 0);
        rangoliContext.bezierCurveTo(-size, -size * .72, -size, -size * 1.8, 0, -size * 2);
        rangoliContext.bezierCurveTo(size, -size * 1.8, size, -size * .72, 0, 0);
        rangoliContext.fill();
        rangoliContext.restore();
    }
    function drawFlower(x, y, color, radius = 20) {
        for (let petal = 0; petal < 6; petal += 1) drawPetal(x, y, (Math.PI * 2 * petal) / 6, color, radius * .55);
        rangoliContext.fillStyle = '#f4dfb2';
        rangoliContext.shadowBlur = 0;
        rangoliContext.beginPath();
        rangoliContext.arc(x, y, radius * .3, 0, Math.PI * 2);
        rangoliContext.fill();
    }
    function drawDiya(x, y, color, scale = 1) {
        rangoliContext.save();
        rangoliContext.translate(x, y);
        rangoliContext.fillStyle = color;
        rangoliContext.shadowColor = color;
        rangoliContext.shadowBlur = 10;
        rangoliContext.beginPath();
        rangoliContext.ellipse(0, 7 * scale, 16 * scale, 8 * scale, 0, 0, Math.PI * 2);
        rangoliContext.fill();
        rangoliContext.fillStyle = '#ffe8a6';
        rangoliContext.beginPath();
        rangoliContext.ellipse(0, -3 * scale, 4 * scale, 9 * scale, -.35, 0, Math.PI * 2);
        rangoliContext.fill();
        rangoliContext.restore();
    }
    function drawRangoli() {
        rangoliContext.clearRect(0, 0, 560, 560);
        const background = rangoliContext.createRadialGradient(rangoliCenter, rangoliCenter, 10, rangoliCenter, rangoliCenter, 250);
        background.addColorStop(0, 'rgba(249,178,51,.12)');
        background.addColorStop(1, 'rgba(249,178,51,0)');
        rangoliContext.fillStyle = background;
        rangoliContext.beginPath();
        rangoliContext.arc(rangoliCenter, rangoliCenter, 250, 0, Math.PI * 2);
        rangoliContext.fill();
        rangoliContext.save();
        rangoliContext.translate(rangoliCenter, rangoliCenter);
        rangoliContext.strokeStyle = 'rgba(249,178,51,.3)';
        rangoliContext.lineWidth = 1;
        for (let ring = 1; ring <= 3; ring += 1) { rangoliContext.beginPath(); rangoliContext.arc(0, 0, ring * 62, 0, Math.PI * 2); rangoliContext.stroke(); }
        for (let node = 0; node < 8; node += 1) {
            const angle = (Math.PI * 2 * node) / 8;
            rangoliContext.beginPath();
            rangoliContext.moveTo(0, 0);
            rangoliContext.lineTo(Math.cos(angle) * 195, Math.sin(angle) * 195);
            rangoliContext.stroke();
            drawPetal(Math.cos(angle) * 198, Math.sin(angle) * 198, angle, 'rgba(247,233,201,.45)', 7);
        }
        rangoliContext.restore();
        [0, 1, 2, 3].forEach((index) => drawFlower(rangoliCenter + Math.cos(index * Math.PI / 2 + Math.PI / 4) * 164, rangoliCenter + Math.sin(index * Math.PI / 2 + Math.PI / 4) * 164, rangoliColor, 18));
        [0, 1, 2, 3].forEach((index) => drawDiya(rangoliCenter + Math.cos(index * Math.PI / 2) * 220, rangoliCenter + Math.sin(index * Math.PI / 2) * 220, rangoliColor, .7));
        rangoliNodes.forEach((point) => {
            const painted = paintedNodes.get(`${point.ring}-${point.node}`);
            rangoliContext.fillStyle = painted ? painted.color : 'rgba(247,233,201,.68)';
            rangoliContext.shadowColor = painted ? painted.color : 'transparent';
            rangoliContext.shadowBlur = painted ? 13 : 0;
            rangoliContext.beginPath();
            rangoliContext.arc(point.x, point.y, painted ? 7 : 4, 0, Math.PI * 2);
            rangoliContext.fill();
            if (painted?.type === 'flower') drawFlower(point.x, point.y, painted.color, 16);
            if (painted?.type === 'petal') drawPetal(point.x, point.y, Math.atan2(point.y - rangoliCenter, point.x - rangoliCenter), painted.color, 11);
            if (painted?.type === 'diya') drawDiya(point.x, point.y, painted.color, .6);
        });
        rangoliContext.shadowBlur = 0;
        rangoliContext.strokeStyle = rangoliColor;
        rangoliContext.lineWidth = 3;
        rangoliContext.beginPath();
        rangoliContext.arc(rangoliCenter, rangoliCenter, 35, 0, Math.PI * 2);
        rangoliContext.stroke();
        rangoliContext.fillStyle = rangoliColor;
        rangoliContext.font = '26px serif';
        rangoliContext.textAlign = 'center';
        rangoliContext.fillText('✦', rangoliCenter, rangoliCenter + 9);
    }
    drawRangoli();
    rangoliCanvas.addEventListener('click', (event) => {
        const bounds = rangoliCanvas.getBoundingClientRect();
        const scaleX = 560 / bounds.width;
        const scaleY = 560 / bounds.height;
        const x = (event.clientX - bounds.left) * scaleX;
        const y = (event.clientY - bounds.top) * scaleY;
        const nearest = rangoliNodes.reduce((best, point) => ((point.x - x) ** 2 + (point.y - y) ** 2 < best.distance ? { point, distance: (point.x - x) ** 2 + (point.y - y) ** 2 } : best), { point: null, distance: 900 });
        if (nearest.point) {
            for (let node = 0; node < 8; node += 1) paintedNodes.set(`${nearest.point.ring}-${node}`, { color: rangoliColor, type: rangoliTool });
            drawRangoli();
        }
    });
    $$('.swatch').forEach((swatch) => swatch.addEventListener('click', () => {
        rangoliColor = swatch.dataset.color;
        $$('.swatch').forEach((item) => { item.classList.toggle('active', item === swatch); item.setAttribute('aria-pressed', String(item === swatch)); });
        drawRangoli();
    }));
    $$('.rangoli-tool').forEach((tool) => tool.addEventListener('click', () => {
        rangoliTool = tool.dataset.tool;
        $$('.rangoli-tool').forEach((item) => { item.classList.toggle('active', item === tool); item.setAttribute('aria-pressed', String(item === tool)); });
        drawRangoli();
    }));
    $('#resetRangoli').addEventListener('click', () => { paintedNodes.clear(); drawRangoli(); });

    // Letter open/close state is intentionally simple and keyboard friendly.
    const envelope = $('#envelope');
    const letterPaper = $('#letterPaper');
    envelope.addEventListener('click', () => {
        envelope.classList.add('open');
        envelope.setAttribute('aria-expanded', 'true');
        window.setTimeout(() => { letterPaper.classList.add('open'); letterPaper.setAttribute('aria-hidden', 'false'); }, 500);
    });
    $('#closeLetter').addEventListener('click', () => {
        letterPaper.classList.remove('open');
        letterPaper.setAttribute('aria-hidden', 'true');
        window.setTimeout(() => { envelope.classList.remove('open'); envelope.setAttribute('aria-expanded', 'false'); }, 450);
    });

    // Personal wish card and sharing fallbacks.
    const nameInput = $('#nameInput');
    const wishName = $('#wishName');
    const wishText = $('#wishText');
    const toast = $('#toast');
    function getWish() {
        const name = nameInput.value.trim() || 'Someone wonderful';
        wishName.textContent = name;
        wishText.textContent = `Happy Diwali, ${name}! May your life sparkle with happiness, prosperity and endless possibilities.`;
        return wishText.textContent;
    }
    $('#generateWish').addEventListener('click', getWish);
    function showToast(message) { toast.textContent = message; window.setTimeout(() => { toast.textContent = ''; }, 2600); }
    $('#copyWish').addEventListener('click', async () => {
        const wish = getWish();
        try { await navigator.clipboard.writeText(wish); showToast('Copied to your clipboard'); } catch { showToast('Select and copy the wish above'); }
    });
    $('#shareWish').addEventListener('click', async () => {
        const wish = getWish();
        if (navigator.share) { try { await navigator.share({ title: 'A Diwali wish for you', text: wish }); } catch { /* User cancelled share. */ } }
        else { window.open(`https://wa.me/?text=${encodeURIComponent(wish)}`, '_blank', 'noopener'); showToast('Opening WhatsApp'); }
    });
})();
