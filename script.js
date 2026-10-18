document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileNav.hidden = !open;
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
  }));
}

document.getElementById('year').textContent = new Date().getFullYear();

const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => revealObserver.observe(el));
} else {
  reveals.forEach(el => el.classList.add('is-visible'));
}

const chapters = Array.from(document.querySelectorAll('[data-chapter]'));
const railLinks = Array.from(document.querySelectorAll('[data-rail]'));
const progressFill = document.getElementById('page-progress-fill');
let scrollTicking = false;
function updatePagePosition() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  progressFill.style.width = `${maxScroll > 0 ? window.scrollY / maxScroll * 100 : 0}%`;
  const focusY = window.innerHeight * 0.38;
  let active = chapters[0]?.dataset.chapter;
  for (const chapter of chapters) {
    const rect = chapter.getBoundingClientRect();
    if (rect.top <= focusY && rect.bottom > focusY) active = chapter.dataset.chapter;
  }
  railLinks.forEach(link => {
    const match = link.dataset.rail === active;
    link.classList.toggle('is-active', match);
    if (match) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollTicking = false;
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) { requestAnimationFrame(updatePagePosition); scrollTicking = true; }
}, { passive: true });
window.addEventListener('resize', updatePagePosition);
updatePagePosition();

const projects = [
  { title: 'QAI', kind: 'AI PRODUCT', year: '2025', description: 'An AI quiz generator that turns a topic into multiple-choice questions, built with Python, Flask and the Gemini API.', tech: ['Python', 'Flask', 'Gemini API'], demo: 'https://aiquizgenerator-69r2.onrender.com/', demoLabel: 'See it live ↗', code: 'https://github.com/sakina1303/QuizGenerator' },
  { title: 'Aurora', kind: 'MOBILE EXPERIENCE', year: '2025', description: 'A digital diary for journaling, mood tracking, photos, a vision board and habits, designed with a gentle, page-flip feel.', tech: ['React Native', 'Expo', 'Product design'], demo: 'https://drive.google.com/file/d/15fNx8J8k5eB9IbzLDBfyymWRCvcBIUTI/view?usp=sharing', demoLabel: 'Watch demo ↗', code: 'https://github.com/sakina1303/Aurora' },
  { title: 'StackMate', kind: 'DEVELOPER TOOL', year: '2025', description: 'A VS Code extension that brings Stack Overflow search, notes, JSON validation and everyday utilities into one workspace.', tech: ['VS Code Extension', 'JavaScript', 'Developer experience'], demo: 'https://marketplace.visualstudio.com/items?itemName=Sakina.Stackmate', demoLabel: 'View extension ↗', code: 'https://github.com/sakina1303/VS-code-Extension' },
  { title: 'PermKit', kind: 'OPEN SOURCE UTILITY', year: '2025', description: 'A React Native utility that simplifies camera, location, microphone and photo library permissions across platforms.', tech: ['React Native', 'Permissions', 'npm'], demo: 'https://www.npmjs.com/package/permkit', demoLabel: 'View package ↗', code: 'https://github.com/sakina1303/permKit' },
  { title: 'EduAid', kind: 'OPEN SOURCE', year: '2024', description: 'Front-end UI and accessibility improvements, input validation and bug fixes contributed to an open-source education project.', tech: ['Front-end', 'Accessibility', 'Open source'], demo: null, demoLabel: '', code: 'https://github.com/sakina1303/EduAid' }
];
const orbit = document.getElementById('project-orbit');
const discs = Array.from(orbit.querySelectorAll('.project-disc'));
const story = {
  kind: document.getElementById('project-kind'),
  year: document.getElementById('project-year'),
  title: document.getElementById('project-title'),
  desc: document.getElementById('project-desc'),
  tech: document.getElementById('project-tech'),
  demo: document.getElementById('project-demo'),
  code: document.getElementById('project-code'),
  count: document.getElementById('project-count')
};
let currentProject = 0;
function showProject(index) {
  currentProject = (index + projects.length) % projects.length;
  const span = orbit.clientWidth * (window.innerWidth <= 600 ? .68 : .48);
  const cardHeight = discs[0].offsetHeight;
  orbit.style.setProperty('--shelf-y', `${orbit.clientHeight / 2 + cardHeight / 2}px`);
  discs.forEach((disc, i) => {
    let offset = i - currentProject;
    if (offset > projects.length / 2) offset -= projects.length;
    if (offset < -projects.length / 2) offset += projects.length;
    const distance = Math.abs(offset);
    const scale = distance === 0 ? 1 : distance === 1 ? .78 : .62;
    disc.style.transform = `translate(-50%, -50%) translateX(${offset * span}px) translateY(${(1 - scale) * cardHeight / 2}px) scale(${scale}) rotate(${offset * -2}deg)`;
    disc.style.opacity = distance > 1 ? '0' : '1';
    disc.style.zIndex = String(10 - distance);
    disc.style.pointerEvents = distance > 1 ? 'none' : 'auto';
    disc.tabIndex = distance > 1 ? -1 : 0;
    disc.classList.toggle('is-active', distance === 0);
    disc.setAttribute('aria-pressed', String(distance === 0));
  });
  const item = projects[currentProject];
  story.kind.textContent = item.kind;
  story.year.textContent = item.year;
  story.title.textContent = item.title;
  story.desc.textContent = item.description;
  story.count.textContent = String(currentProject + 1).padStart(2, '0');
  story.tech.replaceChildren(...item.tech.map(label => {
    const span = document.createElement('span');
    span.textContent = label;
    return span;
  }));
  story.demo.hidden = !item.demo;
  if (item.demo) { story.demo.href = item.demo; story.demo.textContent = item.demoLabel; }
  story.code.href = item.code;
}
let suppressDiscClick = false;
discs.forEach((disc, index) => disc.addEventListener('click', () => { if (!suppressDiscClick) showProject(index); }));
let mouseDragStart = null;
orbit.addEventListener('pointerdown', event => { if (event.pointerType === 'mouse') mouseDragStart = event.clientX; });
orbit.addEventListener('pointerup', event => {
  if (event.pointerType !== 'mouse' || mouseDragStart === null) return;
  const delta = event.clientX - mouseDragStart;
  mouseDragStart = null;
  if (Math.abs(delta) > 55) {
    suppressDiscClick = true;
    showProject(currentProject + (delta < 0 ? 1 : -1));
    setTimeout(() => { suppressDiscClick = false; }, 0);
  }
});
document.getElementById('project-prev').addEventListener('click', () => showProject(currentProject - 1));
document.getElementById('project-next').addEventListener('click', () => showProject(currentProject + 1));
orbit.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); showProject(currentProject + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showProject(currentProject - 1); }
});
let touchStartX = null;
orbit.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0]?.screenX ?? null; }, { passive: true });
orbit.addEventListener('touchend', event => {
  if (touchStartX === null) return;
  const delta = (event.changedTouches[0]?.screenX ?? touchStartX) - touchStartX;
  if (Math.abs(delta) > 45) showProject(currentProject + (delta < 0 ? 1 : -1));
  touchStartX = null;
}, { passive: true });
window.addEventListener('resize', () => showProject(currentProject));
showProject(0);

const robot = document.getElementById('agent-robot');
if (robot) {
  const robotStatus = document.getElementById('robot-status-text');
  const robotStep = document.querySelector('.robot-status span');
  const robotSequence = [
    ['01 / TASK', 'TASK RECEIVED'],
    ['02 / EVALUATE', 'CHECKING RESPONSE'],
    ['03 / FEEDBACK', 'NOTES READY']
  ];
  let robotState = 0;
  let waveTimer;
  let touchResetTimer;
  let gestureTimers = [];
  let gestureLocked = false;
  let agentVisible = false;
  const setPose = pose => { robot.dataset.pose = pose; };
  const moveSculpture = event => {
    const rect = robot.getBoundingClientRect();
    const dx = Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / (rect.width / 2)));
    const dy = Math.max(-1, Math.min(1, (event.clientY - rect.top - rect.height / 2) / (rect.height / 2)));
    robot.style.setProperty('--eye-x', `${(dx * 3.2).toFixed(1)}px`);
    robot.style.setProperty('--eye-y', `${(dy * 2.1).toFixed(1)}px`);
    robot.style.setProperty('--body-x', `${(dx * 18).toFixed(1)}px`);
    robot.style.setProperty('--body-y', `${(dy * 12).toFixed(1)}px`);
    robot.style.setProperty('--head-tilt', `${(dx * 2.5).toFixed(1)}deg`);
    if (!gestureLocked) setPose(dy < -.24 ? 'reaching' : 'listening');
  };
  const resetSculpture = () => {
    robot.style.setProperty('--eye-x', '0px');
    robot.style.setProperty('--eye-y', '0px');
    robot.style.setProperty('--body-x', '0px');
    robot.style.setProperty('--body-y', '0px');
    robot.style.setProperty('--head-tilt', '0deg');
  };
  robot.addEventListener('pointermove', moveSculpture);
  robot.addEventListener('pointerdown', event => {
    moveSculpture(event);
    if (event.pointerType !== 'mouse') {
      clearTimeout(touchResetTimer);
      touchResetTimer = setTimeout(resetSculpture, 1300);
    }
  }, { passive: true });
  robot.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') {
      resetSculpture();
      if (!gestureLocked) setPose('idle');
    }
  });
  const playGesture = () => {
    robot.classList.remove('is-waving');
    void robot.offsetWidth;
    robot.classList.add('is-waving');
    gestureTimers.forEach(clearTimeout);
    gestureLocked = true;
    setPose('listening');
    gestureTimers = [
      setTimeout(() => setPose('reaching'), 160),
      setTimeout(() => setPose('listening'), 900),
      setTimeout(() => {
        gestureLocked = false;
        setPose('idle');
        resetSculpture();
      }, 1450)
    ];
    clearTimeout(waveTimer);
    waveTimer = setTimeout(() => robot.classList.remove('is-waving'), 1450);
  };
  robot.addEventListener('click', () => {
    robotState = (robotState + 1) % robotSequence.length;
    robotStep.textContent = robotSequence[robotState][0];
    robotStatus.textContent = robotSequence[robotState][1];
    playGesture();
  });
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    new IntersectionObserver(entries => { agentVisible = entries[0].isIntersecting; }, { threshold: .45 }).observe(robot);
    setInterval(() => {
      if (agentVisible && !gestureLocked && !robot.matches(':hover')) playGesture();
    }, 6200);
  }
}

const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const openSource = document.getElementById('open-source');
const inkCanvas = document.getElementById('ink-canvas');
if (openSource && inkCanvas) {
  const ink = inkCanvas.getContext('2d');
  const strokes = [];
  let activeInkStroke = null;
  let inkFrame = 0;
  const inkLife = 4200;
  function sizeInkCanvas() {
    const bounds = openSource.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 600 ? 1.5 : 2);
    inkCanvas.width = Math.round(bounds.width * ratio);
    inkCanvas.height = Math.round(bounds.height * ratio);
    inkCanvas.style.width = `${bounds.width}px`;
    inkCanvas.style.height = `${bounds.height}px`;
    ink.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function inkPath(points) {
    const path = new Path2D();
    path.moveTo(points[0].x, points[0].y);
    if (points.length === 1) path.lineTo(points[0].x + .01, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const midpoint = { x: (points[i].x + points[i + 1].x) / 2, y: (points[i].y + points[i + 1].y) / 2 };
      path.quadraticCurveTo(points[i].x, points[i].y, midpoint.x, midpoint.y);
    }
    if (points.length > 1) path.lineTo(points.at(-1).x, points.at(-1).y);
    return path;
  }
  function drawInk(now) {
    inkFrame = 0;
    const bounds = openSource.getBoundingClientRect();
    ink.clearRect(0, 0, bounds.width, bounds.height);
    for (let i = strokes.length - 1; i >= 0; i--) {
      const stroke = strokes[i];
      const age = now - stroke.updated;
      if (age > inkLife) { strokes.splice(i, 1); continue; }
      const fade = 1 - age / inkLife;
      const path = inkPath(stroke.points);
      const layers = window.innerWidth <= 600 ? 8 : 12;
      for (let layer = 0; layer < layers; layer++) {
        ink.strokeStyle = layer < 6 ? '#a18bdf' : '#856dd4';
        ink.globalAlpha = (.025 + layer * .004) * fade;
        ink.lineWidth = 160 - layer * (window.innerWidth <= 600 ? 16 : 11);
        ink.lineCap = 'round';
        ink.lineJoin = 'round';
        ink.shadowColor = '#927add';
        ink.shadowBlur = 12;
        ink.stroke(path);
      }
    }
    ink.globalAlpha = 1;
    ink.shadowBlur = 0;
    if (strokes.length) inkFrame = requestAnimationFrame(drawInk);
  }
  function addInk(x, y) {
    const now = performance.now();
    const previous = activeInkStroke?.points.at(-1);
    const distance = previous ? Math.hypot(x - previous.x, y - previous.y) : Infinity;
    if (!activeInkStroke || distance > 160 || activeInkStroke.points.length >= 140) {
      activeInkStroke = { points: [{ x, y }], updated: now };
      strokes.push(activeInkStroke);
      if (strokes.length > 12) strokes.shift();
    } else if (distance > 1) {
      activeInkStroke.points.push({ x, y });
      activeInkStroke.updated = now;
    }
    if (!inkFrame) inkFrame = requestAnimationFrame(drawInk);
  }
  sizeInkCanvas();
  if ('ResizeObserver' in window) new ResizeObserver(sizeInkCanvas).observe(openSource);
  else window.addEventListener('resize', sizeInkCanvas);
  openSource.addEventListener('pointermove', event => {
    if (motionReduced.matches || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
    const bounds = openSource.getBoundingClientRect();
    addInk(event.clientX - bounds.left, event.clientY - bounds.top);
  }, { passive: true });
  openSource.addEventListener('pointerleave', () => { activeInkStroke = null; });
  openSource.addEventListener('pointerdown', event => {
    if (motionReduced.matches || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const bounds = openSource.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    activeInkStroke = null;
    addInk(x, y);
  }, { passive: true });
  openSource.addEventListener('touchmove', event => {
    if (motionReduced.matches || !event.touches.length) return;
    const bounds = openSource.getBoundingClientRect();
    const touch = event.touches[0];
    addInk(touch.clientX - bounds.left, touch.clientY - bounds.top);
  }, { passive: true });
  openSource.addEventListener('touchend', () => { activeInkStroke = null; }, { passive: true });
}

const openPuzzle = document.getElementById('open-puzzle');
if (openPuzzle) {
  const puzzleItems = [
    { id: 'github', title: 'GitHub', icon: 'github.svg' },
    { id: 'stackoverflow', title: 'Stack Overflow', icon: 'stackoverflow.svg' },
    { id: 'react', title: 'React', icon: 'react.svg' },
    { id: 'npm', title: 'npm', icon: 'npm.svg' }
  ];
  const puzzleShapes = [
    'M0 0 H100 V31 C100 36 104 38 108 38 C117 38 119 46 119 50 C119 54 117 62 108 62 C104 62 100 64 100 69 V100 H69 C64 100 62 96 62 92 C62 83 54 81 50 81 C46 81 38 83 38 92 C38 96 36 100 31 100 H0 Z',
    'M0 0 H100 V100 H69 C64 100 62 104 62 108 C62 117 54 119 50 119 C46 119 38 117 38 108 C38 104 36 100 31 100 H0 V69 C0 64 4 62 8 62 C17 62 19 54 19 50 C19 46 17 38 8 38 C4 38 0 36 0 31 Z',
    'M0 0 H31 C36 0 38 -4 38 -8 C38 -17 46 -19 50 -19 C54 -19 62 -17 62 -8 C62 -4 64 0 69 0 H100 V31 C100 36 96 38 92 38 C83 38 81 46 81 50 C81 54 83 62 92 62 C96 62 100 64 100 69 V100 H0 Z',
    'M0 0 H31 C36 0 38 4 38 8 C38 17 46 19 50 19 C54 19 62 17 62 8 C62 4 64 0 69 0 H100 V100 H0 V69 C0 64 -4 62 -8 62 C-17 62 -19 54 -19 50 C-19 46 -17 38 -8 38 C-4 38 0 36 0 31 Z'
  ];
  let activePuzzle = Math.max(0, puzzleItems.findIndex(item => item.id === new URLSearchParams(location.search).get('puzzle')));
  function puzzleShape(index, filled = false) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'puzzle-shape');
    svg.setAttribute('viewBox', '-20 -20 140 140');
    svg.setAttribute('aria-hidden', 'true');
    const surface = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    surface.setAttribute('class', 'puzzle-surface');
    surface.setAttribute('d', puzzleShapes[index]);
    svg.append(surface);
    if (filled) {
      const clipId = `puzzle-clip-${activePuzzle}-${index}-${Math.random().toString(36).slice(2, 8)}`;
      const clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clip.setAttribute('id', clipId);
      const clipShape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      clipShape.setAttribute('d', puzzleShapes[index]);
      clip.append(clipShape);
      const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      image.setAttribute('href', `assets/brand-icons/${puzzleItems[activePuzzle].icon}`);
      image.setAttribute('x', String(24 - (index % 2) * 100));
      image.setAttribute('y', String(24 - Math.floor(index / 2) * 100));
      image.setAttribute('width', '152');
      image.setAttribute('height', '152');
      image.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      image.setAttribute('clip-path', `url(#${clipId})`);
      const outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      outline.setAttribute('class', 'puzzle-outline');
      outline.setAttribute('d', puzzleShapes[index]);
      svg.append(clip, image, outline);
    }
    return svg;
  }
  const slots = Array.from(openPuzzle.querySelectorAll('.puzzle-slot'));
  const pieces = Array.from(openPuzzle.querySelectorAll('.puzzle-piece'));
  const status = document.getElementById('puzzle-status');
  const shareButton = document.getElementById('puzzle-share');
  const result = document.getElementById('puzzle-result');
  const instruction = document.getElementById('puzzle-instruction');
  const puzzleIndex = document.getElementById('puzzle-index');
  const completeLogo = document.getElementById('puzzle-complete-logo');
  const placed = [null, null, null, null];
  let selected = null;
  let drag = null;
  let suppressClickId = null;
  let placing = false;

  if (new URLSearchParams(location.search).get('complete') === '1') placed.splice(0, 4, 0, 1, 2, 3);

  function renderPuzzle() {
    const count = placed.filter(value => value !== null).length;
    const puzzleCaption = `${puzzleItems[activePuzzle].title} · Join four fragments to complete the logo.`;
    instruction.textContent = puzzleCaption;
    instruction.hidden = count === 4;
    result.textContent = puzzleCaption;
    puzzleIndex.textContent = `${String(activePuzzle + 1).padStart(2, '0')} / 04`;
    if (completeLogo.dataset.icon !== puzzleItems[activePuzzle].icon) {
      completeLogo.src = `assets/brand-icons/${puzzleItems[activePuzzle].icon}`;
      completeLogo.dataset.icon = puzzleItems[activePuzzle].icon;
    }
    slots.forEach((slot, index) => {
      const filled = placed[index] !== null;
      const tileState = `${activePuzzle}-${filled}`;
      if (slot.dataset.tileState !== tileState) {
        slot.replaceChildren(puzzleShape(index, filled));
        slot.dataset.tileState = tileState;
      }
      slot.classList.remove('is-mismatch', 'is-placed');
      slot.classList.toggle('is-filled', filled);
      slot.classList.toggle('is-ready', selected === index && !filled);
      slot.setAttribute('aria-label', filled ? `${puzzleItems[activePuzzle].title} fragment ${index + 1} placed. Tap to return it.` : `Empty space ${index + 1}. Fits fragment ${index + 1}.`);
    });
    pieces.forEach(piece => {
      const index = Number(piece.dataset.piece);
      if (piece.dataset.renderedPuzzle !== String(activePuzzle)) {
        piece.replaceChildren(puzzleShape(index, true));
        piece.dataset.renderedPuzzle = String(activePuzzle);
      }
      piece.hidden = placed.includes(index);
      piece.style.opacity = '';
      piece.classList.toggle('is-selected', index === selected);
      piece.setAttribute('aria-label', `${puzzleItems[activePuzzle].title} logo fragment ${index + 1}`);
      piece.setAttribute('aria-pressed', String(index === selected));
    });
    openPuzzle.classList.toggle('is-complete', count === 4);
    result.hidden = count !== 4;
    shareButton.disabled = count !== 4;
    status.textContent = count === 4 ? `4 / 4 · ${puzzleItems[activePuzzle].title} is complete` : `${count} / 4 · Assemble the ${puzzleItems[activePuzzle].title} logo`;
  }

  function placePiece(id, index, fromRect = null) {
    if (placing) return;
    if (!Number.isInteger(id) || id < 0 || id > 3) return;
    if (id !== index) {
      const slot = slots[index];
      slot.classList.remove('is-mismatch');
      void slot.offsetWidth;
      slot.classList.add('is-mismatch');
      status.textContent = 'That shape belongs in another space · Try again';
      return;
    }
    const piece = pieces.find(candidate => Number(candidate.dataset.piece) === id);
    const source = fromRect || piece.getBoundingClientRect();
    const target = slots[index].getBoundingClientRect();
    const commit = () => {
      const previous = placed.indexOf(id);
      if (previous !== -1) placed[previous] = null;
      placed[index] = id;
      selected = null;
      placing = false;
      renderPuzzle();
      const slot = slots[index];
      slot.classList.remove('is-placed');
      void slot.offsetWidth;
      slot.classList.add('is-placed');
    };
    if (motionReduced.matches) { commit(); return; }
    placing = true;
    const ghost = piece.cloneNode(true);
    ghost.classList.add('puzzle-flying');
    ghost.style.left = `${source.left}px`;
    ghost.style.top = `${source.top}px`;
    ghost.style.width = `${source.width}px`;
    ghost.style.height = `${source.height}px`;
    ghost.style.setProperty('--piece-color', getComputedStyle(piece).getPropertyValue('--piece-color'));
    document.body.append(ghost);
    piece.style.opacity = '.15';
    const dx = target.left + target.width / 2 - source.left - source.width / 2;
    const dy = target.top + target.height / 2 - source.top - source.height / 2;
    const grow = target.width / source.width;
    const flight = ghost.animate([
      { transform: 'translate(0, 0) rotate(-5deg) scale(1)' },
      { transform: `translate(${dx}px, ${dy}px) rotate(0deg) scale(${grow})` }
    ], { duration: 460, easing: 'cubic-bezier(.2,.8,.2,1)' });
    flight.finished.catch(() => {}).then(() => { ghost.remove(); commit(); });
  }

  function switchPuzzle(direction) {
    if (placing) return;
    activePuzzle = (activePuzzle + direction + puzzleItems.length) % puzzleItems.length;
    placed.fill(null);
    selected = null;
    openPuzzle.classList.remove('is-switching');
    void openPuzzle.offsetWidth;
    openPuzzle.classList.add('is-switching');
    renderPuzzle();
  }
  document.getElementById('puzzle-prev').addEventListener('click', () => switchPuzzle(-1));
  document.getElementById('puzzle-next').addEventListener('click', () => switchPuzzle(1));

  pieces.forEach(piece => {
    piece.addEventListener('click', () => {
      if (placing) return;
      const id = Number(piece.dataset.piece);
      if (suppressClickId === id) { suppressClickId = null; return; }
      selected = selected === id ? null : id;
      renderPuzzle();
    });
    piece.addEventListener('pointerdown', event => {
      if (placing || event.button !== 0) return;
      drag = { piece, id: Number(piece.dataset.piece), x: event.clientX, y: event.clientY, moved: false };
    });
  });
  document.addEventListener('pointermove', event => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 7) return;
    drag.moved = true;
    drag.piece.classList.add('is-dragging');
    drag.piece.style.setProperty('--drag-x', `${dx}px`);
    drag.piece.style.setProperty('--drag-y', `${dy}px`);
    slots.forEach(slot => slot.classList.remove('is-drop-target'));
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.puzzle-slot');
    if (target && drag.id === Number(target.dataset.slot)) target.classList.add('is-drop-target');
  });
  function finishDrag(event) {
    if (!drag) return;
    const { piece, id, moved } = drag;
    const target = moved ? document.elementFromPoint(event.clientX, event.clientY)?.closest('.puzzle-slot') : null;
    const fromRect = piece.getBoundingClientRect();
    piece.classList.remove('is-dragging');
    piece.style.removeProperty('--drag-x');
    piece.style.removeProperty('--drag-y');
    slots.forEach(slot => slot.classList.remove('is-drop-target'));
    drag = null;
    if (moved) {
      suppressClickId = id;
      setTimeout(() => { suppressClickId = null; }, 0);
      if (target) placePiece(id, Number(target.dataset.slot), fromRect);
    }
  }
  document.addEventListener('pointerup', finishDrag);
  document.addEventListener('pointercancel', finishDrag);
  slots.forEach((slot, index) => {
    slot.addEventListener('click', () => {
      if (placing) return;
      if (selected !== null) placePiece(selected, index);
      else if (placed[index] !== null) { placed[index] = null; renderPuzzle(); }
    });
  });
  shareButton.addEventListener('click', async () => {
    if (placed.some(id => id === null)) return;
    const url = new URL(location.href);
    url.searchParams.set('puzzle', puzzleItems[activePuzzle].id);
    url.searchParams.set('complete', '1');
    url.hash = 'open-source';
    const text = `I assembled the ${puzzleItems[activePuzzle].title} logo on Sakina Farukh Ahmed's portfolio.`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Sakina’s open source puzzle', text, url: url.href }); return; }
      catch (error) { if (error.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url.href}`);
      status.textContent = 'Share link copied · Your puzzle travels with it';
    } catch {
      status.textContent = 'Share link ready in the address bar';
      history.replaceState(null, '', url.href);
    }
  });
  renderPuzzle();
}

const questionArt = document.getElementById('question-art');
const questionText = document.getElementById('question-text');
if (questionArt && questionText) {
  const questions = ['WHAT<br>IF?', 'WHAT CAN<br>I MAKE?', 'COULD IT<br>HELP?', 'WHAT<br>COMES NEXT?'];
  let questionIndex = 0;
  let questionTimer = 0;
  function showQuestion(index) {
    questionIndex = index % questions.length;
    questionText.classList.remove('is-entering');
    void questionText.offsetWidth;
    questionText.innerHTML = questions[questionIndex];
    questionArt.querySelector('.question-index').textContent = `A QUESTION IN MOTION / ${String(questionIndex + 1).padStart(2, '0')}`;
    questionText.classList.add('is-entering');
  }
  function startQuestions() {
    if (motionReduced.matches || questionTimer) return;
    showQuestion(questionIndex + 1);
    questionTimer = window.setInterval(() => showQuestion(questionIndex + 1), 1750);
  }
  function stopQuestions() {
    window.clearInterval(questionTimer);
    questionTimer = 0;
    if (!motionReduced.matches) showQuestion(0);
  }
  questionArt.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse' || event.pointerType === 'pen') startQuestions(); });
  questionArt.addEventListener('pointerleave', stopQuestions);
  questionArt.addEventListener('pointermove', event => {
    const bounds = questionArt.getBoundingClientRect();
    questionArt.style.setProperty('--question-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 14}px`);
    questionArt.style.setProperty('--question-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 14}px`);
  }, { passive: true });
  questionArt.addEventListener('click', () => showQuestion(questionIndex + 1));
  questionArt.addEventListener('focus', startQuestions);
  questionArt.addEventListener('blur', stopQuestions);
  questionArt.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showQuestion(questionIndex + 1); }
  });
}

const hero = document.querySelector('.hero');
const heroScratch = document.getElementById('hero-scratch');
const portraitScratch = document.getElementById('hero-portrait-scratch');
const portraitCard = document.querySelector('.hero-portrait-card');
const portraitImage = portraitCard?.querySelector('img');
if (hero && heroScratch && portraitScratch && portraitCard && portraitImage) {
  const backgroundInk = heroScratch.getContext('2d');
  const portraitInk = portraitScratch.getContext('2d');
  let lastScratchPoint = null;
  const revealCells = new Set();
  const revealCellSize = 72;
  let revealColumns = 1;
  let revealRows = 1;
  function sizeScratchCanvas(canvas, context, width, height) {
    const ratio = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 600 ? 1.5 : 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function paintPortraitMono() {
    const bounds = portraitCard.getBoundingClientRect();
    if (!bounds.width || !bounds.height || !portraitImage.complete || !portraitImage.naturalWidth) return;
    sizeScratchCanvas(portraitScratch, portraitInk, bounds.width, bounds.height);
    const sourceWidth = portraitImage.naturalWidth;
    const sourceHeight = portraitImage.naturalHeight;
    const coverScale = Math.max(bounds.width / sourceWidth, bounds.height / sourceHeight);
    const cropWidth = bounds.width / coverScale;
    const cropHeight = bounds.height / coverScale;
    const sourceX = (sourceWidth - cropWidth) * .52;
    const sourceY = (sourceHeight - cropHeight) * .36;
    portraitInk.filter = 'grayscale(1) contrast(1.13) brightness(.79)';
    portraitInk.drawImage(portraitImage, sourceX, sourceY, cropWidth, cropHeight, 0, 0, bounds.width, bounds.height);
    portraitInk.filter = 'none';
  }
  function prepareScratch() {
    const bounds = hero.getBoundingClientRect();
    sizeScratchCanvas(heroScratch, backgroundInk, bounds.width, bounds.height);
    backgroundInk.fillStyle = '#090a0c';
    backgroundInk.fillRect(0, 0, bounds.width, bounds.height);
    revealColumns = Math.max(1, Math.ceil(bounds.width / revealCellSize));
    revealRows = Math.max(1, Math.ceil(bounds.height / revealCellSize));
    revealCells.clear();
    hero.classList.remove('is-light-revealed', 'is-light-dominant');
    paintPortraitMono();
  }
  function dab(context, x, y, radius, edgeStart) {
    context.save();
    context.globalCompositeOperation = 'destination-out';
    const feather = context.createRadialGradient(x, y, radius * edgeStart, x, y, radius);
    feather.addColorStop(0, 'rgba(0,0,0,1)');
    feather.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = feather;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
  function recordReveal(x, y) {
    if (hero.classList.contains('is-light-dominant')) return;
    const column = Math.floor(x / revealCellSize);
    const row = Math.floor(y / revealCellSize);
    for (let cy = Math.max(0, row - 1); cy <= Math.min(revealRows - 1, row + 1); cy++) {
      for (let cx = Math.max(0, column - 1); cx <= Math.min(revealColumns - 1, column + 1); cx++) {
        revealCells.add(cy * revealColumns + cx);
      }
    }
    const coverage = revealCells.size / (revealColumns * revealRows);
    if (coverage >= .4) hero.classList.add('is-light-revealed');
    if (coverage >= .82) hero.classList.add('is-light-dominant');
  }
  function scratchAt(x, y) {
    dab(backgroundInk, x, y, 54, .91);
    recordReveal(x, y);
    const heroBounds = hero.getBoundingClientRect();
    const portraitBounds = portraitCard.getBoundingClientRect();
    const imageX = x + heroBounds.left - portraitBounds.left;
    const imageY = y + heroBounds.top - portraitBounds.top;
    if (imageX > -36 && imageY > -36 && imageX < portraitBounds.width + 36 && imageY < portraitBounds.height + 36) {
      dab(portraitInk, imageX, imageY, 48, .58);
    }
  }
  function scratch(event) {
    if (motionReduced.matches || (event.pointerType === 'touch' && !event.buttons)) return;
    const bounds = hero.getBoundingClientRect();
    const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    if (lastScratchPoint) {
      const distance = Math.hypot(point.x - lastScratchPoint.x, point.y - lastScratchPoint.y);
      const steps = Math.min(30, Math.ceil(distance / 17));
      for (let step = 1; step <= steps; step++) {
        const t = step / steps;
        scratchAt(lastScratchPoint.x + (point.x - lastScratchPoint.x) * t, lastScratchPoint.y + (point.y - lastScratchPoint.y) * t);
      }
    } else scratchAt(point.x, point.y);
    lastScratchPoint = point;
  }
  prepareScratch();
  if (!portraitImage.complete) portraitImage.addEventListener('load', paintPortraitMono, { once: true });
  if ('ResizeObserver' in window) new ResizeObserver(prepareScratch).observe(hero);
  else window.addEventListener('resize', prepareScratch);
  hero.addEventListener('pointermove', scratch, { passive: true });
  hero.addEventListener('pointerdown', scratch, { passive: true });
  hero.addEventListener('touchmove', event => {
    if (motionReduced.matches || !event.touches.length) return;
    const touch = event.touches[0];
    scratch({ clientX: touch.clientX, clientY: touch.clientY, pointerType: 'touch', buttons: 1 });
  }, { passive: true });
  hero.addEventListener('touchend', () => { lastScratchPoint = null; }, { passive: true });
  hero.addEventListener('pointerleave', () => { lastScratchPoint = null; });
}
const editorialHeadings = document.querySelectorAll('.chapter-intro h2, .projects-heading h2, .open-source h2, .next h2');
if ('IntersectionObserver' in window && !motionReduced.matches) {
  const headingObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        headingObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  editorialHeadings.forEach(heading => headingObserver.observe(heading));
} else {
  editorialHeadings.forEach(heading => heading.classList.add('in-view'));
}

const portraitScene = document.querySelector('.hero-collage');
const journeyVisuals = Array.from(document.querySelectorAll('.journey-act .act-visual'));
let motionQueued = false;
function updateEditorialMotion() {
  motionQueued = false;
  if (motionReduced.matches) return;
  const viewport = window.innerHeight;
  if (portraitScene && window.scrollY < viewport * 1.3 && window.innerWidth > 850) {
    portraitScene.style.setProperty('--portrait-y', `${Math.round(window.scrollY * .18)}px`);
  }
  journeyVisuals.forEach((visual, index) => {
    // The domino route passes behind the first two cards, so their edges must
    // stay aligned with the fixed canvas path throughout the scroll.
    if (index < 2) return;
    const rect = visual.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > viewport) return;
    const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
    visual.style.setProperty('--visual-y', `${Math.round(progress * -22)}px`);
  });
}
window.addEventListener('scroll', () => {
  if (!motionQueued) {
    requestAnimationFrame(updateEditorialMotion);
    motionQueued = true;
  }
}, { passive: true });
window.addEventListener('resize', updateEditorialMotion);
updateEditorialMotion();
