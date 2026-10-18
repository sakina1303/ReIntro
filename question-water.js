(() => {
  const art = document.getElementById('question-art');
  const canvas = document.getElementById('question-water');
  if (!art || !canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let frame = 0;
  let lastPoint = null;
  let lastWave = null;
  let wetness = 0;
  const waves = [];
  const drops = [];
  const wash = [];
  const clamp = value => Math.max(0, Math.min(1, value));

  function resize() {
    const bounds = art.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function addSplash(x, y, vx, vy, strength, ripple = true) {
    const now = performance.now();
    if (ripple && (!lastWave || Math.hypot(x - lastWave.x, y - lastWave.y) > 53 || now - lastWave.time > 210)) {
      waves.push({ x, y, born: now, radius: 14 + strength * 13 });
      lastWave = { x, y, time: now };
    }
    wash.push({ x, y, born: now, radius: 32 + strength * 23 });
    const count = 2 + Math.round(strength * 2);
    for (let i = 0; i < count; i++) {
      const angle = Math.atan2(vy, vx) + (i - (count - 1) / 2) * .55;
      const speed = 2 + strength * 3 + (i % 3) * .75;
      drops.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1.5,
        radius: 1.3 + (i % 3) * 1.2, born: now, life: 480 + (i % 4) * 115 });
    }
    if (waves.length > 55) waves.splice(0, waves.length - 55);
    if (drops.length > 155) drops.splice(0, drops.length - 155);
    if (wash.length > 100) wash.splice(0, wash.length - 100);
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function draw(now) {
    frame = 0;
    ctx.clearRect(0, 0, width, height);
    for (let i = wash.length - 1; i >= 0; i--) {
      const age = (now - wash[i].born) / 2500;
      if (age >= 1) { wash.splice(i, 1); continue; }
      const item = wash[i];
      const radius = item.radius * (1 + age * .6);
      const gradient = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, radius);
      gradient.addColorStop(0, `rgba(236,250,255,${.23 * (1 - age)})`);
      gradient.addColorStop(.43, `rgba(190,232,255,${.11 * (1 - age)})`);
      gradient.addColorStop(1, 'rgba(190,232,255,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(item.x, item.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = waves.length - 1; i >= 0; i--) {
      const age = (now - waves[i].born) / 950;
      if (age >= 1) { waves.splice(i, 1); continue; }
      const item = waves[i];
      const radius = item.radius + age * 66;
      ctx.lineWidth = 1.1 + (1 - age) * 1.3;
      ctx.strokeStyle = `rgba(255,255,255,${.7 * (1 - age) * (1 - age)})`;
      ctx.beginPath();
      ctx.ellipse(item.x, item.y, radius, radius * .72, -.16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(78,139,218,${.3 * (1 - age)})`;
      ctx.beginPath();
      ctx.ellipse(item.x + 2, item.y + 3, radius * .85, radius * .62, -.16, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let i = drops.length - 1; i >= 0; i--) {
      const item = drops[i];
      const elapsed = now - item.born;
      if (elapsed >= item.life) { drops.splice(i, 1); continue; }
      const age = elapsed / item.life;
      const x = item.x + item.vx * elapsed / 16;
      const y = item.y + item.vy * elapsed / 16 + 16 * age * age;
      const gradient = ctx.createRadialGradient(x - item.radius * .3, y - item.radius * .4, .2,
        x, y, item.radius * 2.4);
      gradient.addColorStop(0, `rgba(255,255,255,${.9 * (1 - age)})`);
      gradient.addColorStop(.45, `rgba(185,234,255,${.72 * (1 - age)})`);
      gradient.addColorStop(1, 'rgba(137,183,231,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, item.radius * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (wash.length || waves.length || drops.length) frame = requestAnimationFrame(draw);
  }

  art.addEventListener('pointermove', event => {
    const bounds = art.getBoundingClientRect();
    const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    if (lastPoint) {
      const vx = point.x - lastPoint.x;
      const vy = point.y - lastPoint.y;
      const distance = Math.hypot(vx, vy);
      if (distance > 3) {
        const steps = Math.min(10, Math.ceil(distance / 18));
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          addSplash(lastPoint.x + vx * t, lastPoint.y + vy * t, vx / steps, vy / steps,
            clamp(distance / 55), i === steps || i % 4 === 0);
        }
        wetness = clamp(wetness + Math.min(distance, 80) / 1300);
        art.style.setProperty('--wetness', wetness.toFixed(3));
      }
    }
    lastPoint = point;
  }, { passive: true });
  art.addEventListener('pointerdown', event => {
    const bounds = art.getBoundingClientRect();
    addSplash(event.clientX - bounds.left, event.clientY - bounds.top, 0, -2, .8);
  }, { passive: true });
  art.addEventListener('pointerleave', () => { lastPoint = null; });
  art.addEventListener('pointercancel', () => { lastPoint = null; });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(art);
  else window.addEventListener('resize', resize);
  resize();
})();
