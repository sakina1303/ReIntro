(() => {
  const section = document.getElementById('journey');
  const canvas = document.getElementById('journey-motion');
  const splash = document.getElementById('project-splash');
  if (!section || !canvas || !splash) return;

  const ctx = canvas.getContext('2d');
  const splashCtx = splash.getContext('2d');
  if (!ctx || !splashCtx) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const acts = [...section.querySelectorAll('.journey-act')];
  const intro = section.querySelector('.chapter-intro');
  const introTitle = intro.querySelector('h2');
  const close = section.querySelector('.journey-close');
  let points = [];
  let length = 0;
  let current = 0;
  let target = 0;
  let frame = 0;
  let width = 0;
  let height = 0;
  let dominoCount = 0;
  let splashWidth = 0;
  let splashHeight = 0;
  let powderTexture;
  let burstAt = 0;
  let burstArmed = true;
  let initialized = false;
  const burstDuration = 3600;

  let seed = 6913;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const jets = [
    { slope: -.43, color: [239, 68, 171] },
    { slope: -.27, color: [155, 103, 239] },
    { slope: -.09, color: [91, 204, 245] },
    { slope: .1, color: [80, 215, 213] },
    { slope: .27, color: [254, 148, 84] },
    { slope: .44, color: [255, 205, 77] }
  ];
  const powder = jets.flatMap((jet, jetIndex) => Array.from({ length: 430 }, (_, i) => {
    const depth = .08 + Math.pow(random(), .75) * .92;
    const y = 22 + depth * 505;
    const scatter = (random() + random() + random() - 1.5) * (26 + depth * 132);
    return { x: jet.slope * y + scatter, y,
      radius: .35 + Math.pow(random(), 3.2) * (i % 41 === 0 ? 6.2 : 2.35),
      color: jet.color, delay: random() * .18 + jetIndex * .018,
      sway: (random() - .5) * 32 };
  }));

  const clamp = value => Math.max(0, Math.min(1, value));
  function buildPowderTexture() {
    if (powderTexture) return;
    const texture = document.createElement('canvas');
    texture.width = 1200;
    texture.height = 580;
    const tctx = texture.getContext('2d');
    const source = document.createElement('canvas');
    source.width = texture.width;
    source.height = texture.height;
    const ink = source.getContext('2d');
    ink.globalCompositeOperation = 'screen';
    const hash = (x, y) => {
      let n = (x * 374761393 + y * 668265263) | 0;
      n = Math.imul(n ^ n >>> 13, 1274126177);
      return ((n ^ n >>> 16) >>> 0) / 4294967295;
    };
    const noise = (x, y, scale) => {
      const gx = Math.floor(x / scale), gy = Math.floor(y / scale);
      let fx = x / scale - gx, fy = y / scale - gy;
      fx = fx * fx * (3 - 2 * fx);
      fy = fy * fy * (3 - 2 * fy);
      const a = hash(gx, gy) * (1 - fx) + hash(gx + 1, gy) * fx;
      const b = hash(gx, gy + 1) * (1 - fx) + hash(gx + 1, gy + 1) * fx;
      return a * (1 - fy) + b * fy;
    };
    // Billowing, overlapping dye pockets follow six narrow falling streams.
    // Their changing size and lateral curl avoid the triangular spotlight shape.
    jets.forEach((jet, jetIndex) => {
      for (let i = 0; i < 23; i++) {
        const depth = i / 22;
        const y = 6 + i * 25 + (random() - .5) * (10 + depth * 28);
        const x = 600 + jet.slope * y + Math.sin(i * .83 + jetIndex * 1.4) * (12 + depth * 34)
          + (random() - .5) * (18 + depth * 58);
        const radius = 13 + depth * (44 + random() * 92);
        const [r, g, b] = jet.color;
        const gradient = ink.createRadialGradient(x, y, radius * .07, x, y, radius);
        gradient.addColorStop(0, `rgba(${r},${g},${b},.29)`);
        gradient.addColorStop(.35, `rgba(${r},${g},${b},.19)`);
        gradient.addColorStop(.73, `rgba(${r},${g},${b},.075)`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ink.fillStyle = gradient;
        ink.beginPath();
        ink.ellipse(x, y, radius * (.65 + random() * .5), radius * (.55 + random() * .7),
          (random() - .5) * .8, 0, Math.PI * 2);
        ink.fill();
      }
    });
    const sourceData = ink.getImageData(0, 0, texture.width, texture.height).data;
    const image = tctx.createImageData(texture.width, texture.height);
    const data = image.data;
    for (let y = 0; y < texture.height; y++) {
      const depth = y / texture.height;
      for (let x = 0; x < texture.width; x++) {
        // Curl the soft pockets through multiscale turbulence, then erode
        // small openings and add a fine pigment grain.
        const curlX = (noise(x, y, 43) - .5) * (20 + depth * 78)
          + (noise(x, y, 121) - .5) * 48;
        const curlY = (noise(x + 391, y, 59) - .5) * (17 + depth * 35);
        const sx = Math.max(0, Math.min(1199, Math.round(x + curlX)));
        const sy = Math.max(0, Math.min(579, Math.round(y + curlY)));
        const from = (sy * 1200 + sx) * 4;
        if (sourceData[from + 3] < 3) continue;
        const to = (y * 1200 + x) * 4;
        const fold = .48 + noise(x, y, 13) * .65 + noise(x, y, 5) * .18;
        const grain = .57 + hash(x, y) * .43;
        data[to] = sourceData[from];
        data[to + 1] = sourceData[from + 1];
        data[to + 2] = sourceData[from + 2];
        data[to + 3] = Math.min(238, sourceData[from + 3] * fold * grain);
      }
    }
    tctx.putImageData(image, 0, 0);
    tctx.globalCompositeOperation = 'screen';
    jets.forEach((jet, jetIndex) => {
      for (let i = 0; i < 26; i++) {
        const startY = 10 + random() * 270;
        const endY = Math.min(570, startY + 105 + random() * 195);
        const startX = 600 + jet.slope * startY + (random() - .5) * (24 + startY * .14);
        const endX = 600 + jet.slope * endY + (random() - .5) * (36 + endY * .2);
        const curl = (random() - .5) * (74 + endY * .22);
        const [r, g, b] = jet.color;
        tctx.beginPath();
        tctx.moveTo(startX, startY);
        tctx.bezierCurveTo(startX + curl, startY + 65, endX - curl, endY - 85, endX, endY);
        tctx.strokeStyle = `rgba(${r},${g},${b},${.04 + random() * .1})`;
        tctx.lineWidth = .6 + random() * 4;
        tctx.stroke();
      }
    });
    tctx.globalCompositeOperation = 'source-over';
    powderTexture = texture;
  }
  function localRect(element) {
    const sectionBox = section.getBoundingClientRect();
    const box = element.getBoundingClientRect();
    return { left: box.left - sectionBox.left, right: box.right - sectionBox.left,
      top: box.top - sectionBox.top, bottom: box.bottom - sectionBox.top,
      width: box.width, height: box.height };
  }

  // The wide route sketches alternating C curves; the narrow route stays in the
  // chapter gutter so the story remains readable on a phone.
  function route() {
    const title = localRect(introTitle);
    const first = localRect(acts[0]);
    const second = localRect(acts[1]);
    const third = localRect(acts[2]);
    const introBox = localRect(intro);
    const closing = localRect(close);
    if (width <= 850) return [
      [width * .78, title.top + title.height * .16],
      [width * .87, introBox.bottom - 16],
      [width * .13, first.top + 25],
      [width * .11, first.top + first.height * .52],
      [width * .18, first.bottom - 34],
      [width * .12, second.top + second.height * .42],
      [width * .18, second.bottom - 30],
      [width * .11, third.top + third.height * .48],
      [width * .21, third.bottom - 20],
      [width * .2, Math.min(height - 23, closing.bottom + 90)]
    ];
    const firstVisual = localRect(acts[0].querySelector('.act-visual'));
    const secondVisual = localRect(acts[1].querySelector('.act-visual'));
    return [
      [width * .82, Math.max(16, introBox.top - 105)],
      [firstVisual.left - 110, introBox.bottom - 20],
      [firstVisual.left - 110, firstVisual.top - 80],
      [firstVisual.left + 10, firstVisual.top + 4],
      [firstVisual.left + firstVisual.width * .65, firstVisual.bottom - 15],
      [Math.min(width * .89, firstVisual.right - 20), first.bottom - 25],
      [secondVisual.left + secondVisual.width * .62, secondVisual.top + 10],
      [secondVisual.left + secondVisual.width * .55, secondVisual.bottom - 8],
      [width * .56, second.bottom + 10],
      [width * .16, third.top + 55],
      [width * .14, third.top + third.height * .55],
      [width * .25, third.bottom - 55],
      [width * .55, Math.min(height - 23, closing.bottom + 90)]
    ];
  }

  function rebuild() {
    width = section.clientWidth;
    height = section.offsetHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    splashWidth = splash.clientWidth;
    splashHeight = splash.clientHeight;
    splash.width = Math.round(splashWidth * pixelRatio);
    splash.height = Math.round(splashHeight * pixelRatio);
    splashCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    buildPowderTexture();
    const stops = route();
    points = [];
    length = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[Math.max(0, i - 1)];
      const b = stops[i];
      const c = stops[i + 1];
      const d = stops[Math.min(stops.length - 1, i + 2)];
      for (let step = i === 0 ? 0 : 1; step <= 36; step++) {
        const t = step / 36;
        const t2 = t * t;
        const t3 = t2 * t;
        const x = .5 * ((2 * b[0]) + (-a[0] + c[0]) * t + (2*a[0] - 5*b[0] + 4*c[0] - d[0]) * t2 + (-a[0] + 3*b[0] - 3*c[0] + d[0]) * t3);
        const y = .5 * ((2 * b[1]) + (-a[1] + c[1]) * t + (2*a[1] - 5*b[1] + 4*c[1] - d[1]) * t2 + (-a[1] + 3*b[1] - 3*c[1] + d[1]) * t3);
        const previous = points[points.length - 1];
        if (previous) length += Math.hypot(x - previous.x, y - previous.y);
        points.push({ x, y, distance: length });
      }
    }
    dominoCount = Math.max(24, Math.floor(length / (width <= 700 ? 27 : 35)));
    schedule();
  }

  function at(fraction) {
    const distance = clamp(fraction) * length;
    let low = 0;
    let high = points.length - 1;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (points[middle].distance < distance) low = middle + 1;
      else high = middle;
    }
    const right = points[low];
    const left = points[Math.max(0, low - 1)];
    const part = right.distance === left.distance ? 0 : (distance - left.distance) / (right.distance - left.distance);
    return { x: left.x + (right.x - left.x) * part,
      y: left.y + (right.y - left.y) * part,
      angle: Math.atan2(right.y - left.y, right.x - left.x) };
  }

  function drawDomino(position, fallen, index) {
    const tileWidth = width <= 700 ? 11 : 15;
    const tileHeight = width <= 700 ? 24 : 34;
    ctx.save();
    ctx.globalAlpha = .67 + fallen * .08;
    ctx.translate(position.x, position.y - (1 - fallen) * 6);
    ctx.rotate(fallen * 1.17);
    ctx.scale(1 + fallen * .28, 1 - fallen * .43);
    ctx.shadowColor = '#99897944';
    ctx.shadowBlur = 7;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#9a8978';
    ctx.beginPath();
    ctx.roundRect(-tileWidth / 2 + 3, -tileHeight / 2 + 4, tileWidth, tileHeight, 3);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    const grain = ctx.createLinearGradient(-tileWidth / 2, 0, tileWidth / 2, 0);
    grain.addColorStop(0, '#c3ad98');
    grain.addColorStop(.45, '#f0dfc8');
    grain.addColorStop(1, '#cdb79f');
    ctx.fillStyle = grain;
    ctx.strokeStyle = '#a6947f';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.roundRect(-tileWidth / 2, -tileHeight / 2, tileWidth, tileHeight, 3);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#a18d79';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-tileWidth / 2 + 2, 0);
    ctx.lineTo(tileWidth / 2 - 2, 0);
    ctx.stroke();
    ctx.fillStyle = '#745e4f';
    ctx.beginPath();
    ctx.arc(0, -tileHeight * .18, width <= 700 ? 1.35 : 1.8, 0, Math.PI * 2);
    ctx.moveTo(width <= 700 ? 1.35 : 1.8, tileHeight * .17);
    ctx.arc(0, tileHeight * .17, width <= 700 ? 1.35 : 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff3d590';
    ctx.fillRect(-tileWidth / 2 + 2, -tileHeight / 2 + 2, Math.max(2, tileWidth - 4), 1.5);
    ctx.restore();
  }

  function sparkle(x, y, radius, color, opacity = 1) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = radius * 2;
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.quadraticCurveTo(radius * .2, -radius * .2, radius, 0);
    ctx.quadraticCurveTo(radius * .2, radius * .2, 0, radius);
    ctx.quadraticCurveTo(-radius * .2, radius * .2, -radius, 0);
    ctx.quadraticCurveTo(-radius * .2, -radius * .2, 0, -radius);
    ctx.fill();
    ctx.restore();
  }

  function drawBall(position, progress, moving) {
    const drop = clamp((progress - .982) / .018);
    const fade = clamp((progress - .996) / .004);
    const radius = width <= 700 ? 13 : 18;
    const bounce = Math.abs(Math.sin(progress * dominoCount * Math.PI)) * (width <= 700 ? 5 : 8);
    const y = position.y - 27 - bounce + drop * 30;
    ctx.save();
    ctx.globalAlpha = 1 - fade;
    ctx.beginPath();
    ctx.ellipse(position.x + 3, position.y + 5, radius * .86, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#25305255';
    ctx.fill();
    for (let i = 12; i >= 1; i--) {
      const ghost = at(Math.max(0, progress - i * .0026));
      const trailY = ghost.y - 26 - Math.abs(Math.sin((progress - i * .0026) * dominoCount * Math.PI)) * 6;
      const spread = Math.sin(i * 8.13) * (3 + i * .45);
      sparkle(ghost.x + spread, trailY - 4 + Math.cos(i * 5.9) * 8,
        i % 3 === 0 ? 3.5 : 2, ['#a994f4', '#ffc980', '#f5a8d6', '#99dbef'][i % 4],
        (1 - i / 14) * (moving > .001 ? .88 : .44));
    }
    ctx.shadowColor = '#a080ba99';
    ctx.shadowBlur = 23;
    ctx.shadowOffsetY = 6;
    const gradient = ctx.createRadialGradient(position.x - 5, y - 6, 1, position.x, y, radius);
    gradient.addColorStop(0, '#fff8e9');
    gradient.addColorStop(.32, '#ffe0a0');
    gradient.addColorStop(.63, '#f4a9c5');
    gradient.addColorStop(1, '#9277cf');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(position.x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff9';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    sparkle(position.x - radius * .3, y - radius * .35, radius * .32, '#ffffff', .95);
    ctx.restore();
  }

  function drawSplash(time) {
    splashCtx.clearRect(0, 0, splashWidth, splashHeight);
    if (!burstAt || !powderTexture || reducedMotion.matches) return;
    const phase = clamp((time - burstAt) / burstDuration);
    const grow = 1 - Math.pow(1 - clamp(phase / .43), 3);
    const opacity = clamp(phase / .08) * (1 - clamp((phase - .67) / .33));
    if (opacity <= 0) return;
    const origin = at(1).x / width * splashWidth;
    const horizontalScale = Math.min(splashWidth / 870, 1.18) * (.12 + grow * .88);
    const verticalScale = splashHeight / 580 * (.12 + grow * .88);
    splashCtx.save();
    // Soft radial puffs spread outward from the impact. Each puff fades to a
    // transparent edge, so the smoke never exposes a cropped canvas rectangle.
    const wingReach = Math.min(splashWidth * .34, 430);
    for (const side of [-1, 1]) {
      for (let i = 0; i < 10; i++) {
        const spread = (i + .35) / 10;
        const x = origin + side * (24 + wingReach * spread * grow);
        const y = 38 + splashHeight * (.12 + spread * .44) * grow;
        const radiusX = (54 + spread * 74) * (.3 + grow * .7);
        const radiusY = (66 + spread * 92) * (.3 + grow * .7);
        const color = side < 0
          ? (i % 3 === 0 ? [155, 103, 239] : [239, 68, 171])
          : (i % 3 === 0 ? [80, 215, 213] : [255, 188, 92]);
        splashCtx.save();
        splashCtx.translate(x, y);
        splashCtx.rotate(side * (.28 + spread * .22));
        splashCtx.scale(radiusX, radiusY);
        const haze = splashCtx.createRadialGradient(0, 0, .03, 0, 0, 1);
        haze.addColorStop(0, `rgba(${color.join(',')},.17)`);
        haze.addColorStop(.42, `rgba(${color.join(',')},.11)`);
        haze.addColorStop(1, `rgba(${color.join(',')},0)`);
        splashCtx.globalAlpha = opacity * (.75 - spread * .24);
        splashCtx.fillStyle = haze;
        splashCtx.beginPath();
        splashCtx.arc(0, 0, 1, 0, Math.PI * 2);
        splashCtx.fill();
        splashCtx.restore();
      }
    }
    splashCtx.globalAlpha = opacity * .3;
    splashCtx.filter = 'blur(22px)';
    splashCtx.drawImage(powderTexture, origin - 600 * horizontalScale, 0,
      1200 * horizontalScale, 580 * verticalScale);
    splashCtx.filter = 'none';
    splashCtx.globalAlpha = opacity * .95;
    splashCtx.drawImage(powderTexture, origin - 600 * horizontalScale, 0,
      1200 * horizontalScale, 580 * verticalScale);
    const reach = Math.min(splashWidth / 870, 1.18);
    const vertical = splashHeight / 580;
    powder.forEach(particle => {
      const travel = clamp((grow - particle.delay) / (1 - particle.delay));
      if (!travel) return;
      const x = origin + (particle.x * travel + particle.sway * Math.sin(travel * Math.PI)) * reach;
      const y = 5 + particle.y * vertical * travel * travel;
      const [r, g, b] = particle.color;
      splashCtx.fillStyle = `rgba(${r},${g},${b},${Math.min(.95, .48 + particle.radius * .13) * opacity})`;
      splashCtx.beginPath();
      splashCtx.ellipse(x, y, particle.radius * reach, particle.radius * (1 + travel * .3), particle.sway * .02, 0, Math.PI * 2);
      splashCtx.fill();
    });
    splashCtx.restore();
  }

  function draw(moving = 0) {
    if (!points.length) return;
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.strokeStyle = '#a9a8d344';
    ctx.lineWidth = width <= 700 ? 1 : 1.5;
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.setLineDash([]);
    for (let i = 0; i <= dominoCount; i++) {
      const position = at(i / dominoCount);
      const fallen = clamp((current - i / dominoCount) * dominoCount * .72);
      drawDomino(position, fallen, i);
    }
    if (!reducedMotion.matches) drawBall(at(current), current, moving);
    const impact = burstAt ? 1 - clamp((performance.now() - burstAt - 850) / 1100) : 0;
    if (impact > 0) {
      const landing = at(1);
      const colors = ['#f6b373', '#ef9fa0', '#ad96dc', '#f6d18d'];
      for (let i = 0; i < 18; i++) {
        const angle = i * 2.39996;
        const spread = (18 + (i % 5) * 12) * impact;
        ctx.globalAlpha = impact * (i % 3 === 0 ? .67 : .42);
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.ellipse(landing.x + Math.cos(angle) * spread, landing.y + Math.sin(angle) * spread * .53,
          2 + (i % 4) * 2, 2 + (i % 3) * 2, angle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    drawSplash(performance.now());
  }

  function tick() {
    frame = 0;
    const difference = target - current;
    current = reducedMotion.matches ? target : current + difference * .17;
    if (Math.abs(target - current) < .00035) current = target;
    if (current < .965) {
      burstArmed = true;
      burstAt = 0;
    }
    if (current >= .995 && burstArmed) {
      burstAt = performance.now();
      burstArmed = false;
    }
    draw(Math.abs(difference));
    if (current !== target || (burstAt && performance.now() - burstAt < burstDuration)) schedule();
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(tick); }
  function updateTarget() {
    const top = window.scrollY + section.getBoundingClientRect().top;
    const start = top - window.innerHeight * .72;
    const end = top + height - window.innerHeight * .42;
    target = clamp((window.scrollY - start) / (end - start));
    if (!initialized) {
      current = target;
      burstArmed = target < .965;
      initialized = true;
    }
    schedule();
  }

  window.addEventListener('scroll', updateTarget, { passive: true });
  window.addEventListener('resize', () => { rebuild(); updateTarget(); });
  reducedMotion.addEventListener('change', updateTarget);
  if ('ResizeObserver' in window) new ResizeObserver(() => { rebuild(); updateTarget(); }).observe(section);
  if (document.fonts?.ready) document.fonts.ready.then(() => { rebuild(); updateTarget(); });
  rebuild();
  updateTarget();
})();
