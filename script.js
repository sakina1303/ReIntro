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
  discs.forEach((disc, i) => {
    let offset = i - currentProject;
    if (offset > projects.length / 2) offset -= projects.length;
    if (offset < -projects.length / 2) offset += projects.length;
    const distance = Math.abs(offset);
    const scale = distance === 0 ? 1 : distance === 1 ? .78 : .62;
    disc.style.transform = `translate(-50%, -50%) translateX(${offset * span}px) scale(${scale}) rotate(${offset * -8}deg)`;
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
  const moveSculpture = event => {
    const rect = robot.getBoundingClientRect();
    const dx = Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / (rect.width / 2)));
    const dy = Math.max(-1, Math.min(1, (event.clientY - rect.top - rect.height / 2) / (rect.height / 2)));
    robot.style.setProperty('--eye-x', `${(dx * 3.2).toFixed(1)}px`);
    robot.style.setProperty('--eye-y', `${(dy * 2.1).toFixed(1)}px`);
    robot.style.setProperty('--body-x', `${(dx * 18).toFixed(1)}px`);
    robot.style.setProperty('--body-y', `${(dy * 12).toFixed(1)}px`);
    robot.style.setProperty('--head-tilt', `${(dx * 2.5).toFixed(1)}deg`);
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
    if (event.pointerType === 'mouse') resetSculpture();
  });
  robot.addEventListener('click', () => {
    robotState = (robotState + 1) % robotSequence.length;
    robotStep.textContent = robotSequence[robotState][0];
    robotStatus.textContent = robotSequence[robotState][1];
    robot.classList.remove('is-waving');
    void robot.offsetWidth;
    robot.classList.add('is-waving');
    clearTimeout(waveTimer);
    waveTimer = setTimeout(() => robot.classList.remove('is-waving'), 1300);
  });
}

const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const openSource = document.getElementById('open-source');
const inkField = document.getElementById('ink-field');
if (openSource && inkField) {
  openSource.addEventListener('pointerdown', event => {
    if (motionReduced.matches || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const bounds = openSource.getBoundingClientRect();
    const burst = document.createElement('span');
    burst.className = 'ink-burst';
    burst.style.left = `${event.clientX - bounds.left}px`;
    burst.style.top = `${event.clientY - bounds.top}px`;
    burst.innerHTML = '<i></i><b></b>';
    inkField.appendChild(burst);
    if (inkField.childElementCount > 7) inkField.firstElementChild.remove();
    window.setTimeout(() => burst.remove(), 1900);
  }, { passive: true });
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
  journeyVisuals.forEach(visual => {
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
