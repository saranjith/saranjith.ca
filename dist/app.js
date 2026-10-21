const themeButton = document.querySelector('#theme');
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
function syncTheme() {
  themeButton?.setAttribute('aria-pressed', String(document.documentElement.dataset.theme === 'dark'));
}
syncTheme();
themeButton?.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('theme', theme); } catch {}
  syncTheme();
});
systemTheme.addEventListener('change', event => {
  try { if (localStorage.getItem('theme')) return; } catch {}
  document.documentElement.dataset.theme = event.matches ? 'dark' : 'light';
  syncTheme();
});
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();


// First visit in this tab only. Hash links and reduced motion open directly.
(() => {
  const root = document.documentElement;
  if (!root.classList.contains('intro-pending')) return;
  const art = document.querySelector('.hero-art');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let animations = [];
  let timer;
  const finish = () => {
    clearTimeout(timer);
    clearTimeout(window.heroIntroSafety);
    root.classList.remove('intro-pending', 'intro-running');
    animations.forEach(animation => animation.cancel());
    window.removeEventListener('resize', finish);
    window.removeEventListener('keydown', finish);
    window.removeEventListener('wheel', finish);
    window.removeEventListener('touchstart', finish);
    motion.removeEventListener('change', finish);
  };
  try {
    if (!art || motion.matches) { finish(); return; }
    const rect = art.getBoundingClientRect();
    const x = innerWidth / 2 - (rect.left + rect.width / 2);
    const y = innerHeight / 2 - (rect.top + rect.height / 2);
    animations.push(art.animate([
      {transform: `translate(${x}px, ${y}px) rotate(0deg)`},
      {transform: 'translate(0, 0) rotate(0deg)'}
    ], {duration: 1500, delay: 2300, easing: 'cubic-bezier(.25,.75,.35,1)', fill: 'both'}));
    root.classList.add('intro-running');
    const content = document.querySelectorAll('body>header, .hero>.eyebrow, .hero-copy, .hero-foot, main>section:not(.hero), body>footer');
    content.forEach(element => animations.push(element.animate([
      {opacity: 0, visibility: 'visible'},
      {opacity: 1, visibility: 'visible'}
    ], {duration: 1000, delay: 3800, easing: 'ease-in', fill: 'forwards'})));
    sessionStorage.setItem('hero-intro-seen', '1');
    timer = setTimeout(finish, 4850);
    window.addEventListener('resize', finish, {once:true});
    window.addEventListener('keydown', finish, {once:true});
    window.addEventListener('wheel', finish, {once:true, passive:true});
    window.addEventListener('touchstart', finish, {once:true, passive:true});
    motion.addEventListener('change', finish, {once:true});
  } catch { finish(); }
})();

// Keep each artwork plane visually continuous between its hero position and process step.
(() => {
  const hero = document.querySelector('.hero');
  const art = hero?.querySelector('.field-diagram');
  const approach = document.querySelector('#approach');
  const sources = [...(art?.querySelectorAll('.field-plane') || [])];
  const destinations = [...(approach?.querySelectorAll('.process-landing svg') || [])];
  if (!hero || !art || !approach || sources.length !== 4 || destinations.length !== 4) return;

  const motion = matchMedia('(min-width: 800px) and (prefers-reduced-motion: no-preference)');
  const svgNS = 'http://www.w3.org/2000/svg';
  let planes = [];
  let frame = 0;
  let active = false;
  const targetViews = destinations.map(svg => svg.getAttribute('viewBox').split(/\s+/).map(Number));
  const sourcePositions = sources.map(source => {
    const values = source.querySelector('g')?.getAttribute('transform')?.match(/translate\(([-\d.]+)\s+([-\d.]+)\)/);
    return values ? {x: Number(values[1]), y: Number(values[2])} : {x: 0, y: 0};
  });
  const sourceView = art.getAttribute('viewBox').split(/\s+/).map(Number);
  const clamp = value => Math.max(0, Math.min(1, value));
  const interpolate = (from, to, progress) => from + (to - from) * progress;

  function draw() {
    frame = 0;
    if (!active) return;
    const origin = art.getBoundingClientRect();
    const annotations = art.querySelectorAll('.step-annotation');
    const heroEnd = hero.getBoundingClientRect().bottom + scrollY;
    const approachStart = approach.getBoundingClientRect().top + scrollY;
    const start = Math.max(0, heroEnd - innerHeight * .8);
    const end = Math.max(start + 220, approachStart - innerHeight * .2);
    const progress = clamp((scrollY - start) / (end - start));
    const eased = progress * progress * (3 - 2 * progress);
    planes.forEach((plane, index) => {
      const target = destinations[index].getBoundingClientRect();
      if (annotations[index]) annotations[index].style.opacity = String(1 - eased);
      plane.setAttribute('viewBox', sourceView.map((value, part) => interpolate(value, targetViews[index][part], eased)).join(' '));
      const inner = plane.querySelector('.field-plane > g');
      if (inner) {
        const {x, y} = sourcePositions[index];
        const turn = clamp((eased - .55) / .45);
        inner.setAttribute('transform', `translate(${x} ${y}) skewY(${30 * (1 - turn)})`);
      }
      plane.style.width = `${interpolate(origin.width, target.width, eased)}px`;
      plane.style.height = `${interpolate(origin.height, target.height, eased)}px`;
      const fan = -Math.sin(Math.PI * eased) * (80 + index * 22);
      plane.style.transform = `translate3d(${interpolate(origin.left, target.left, eased) + fan}px,${interpolate(origin.top, target.top, eased)}px,0)`;
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  function stop() {
    active = false;
    document.documentElement.classList.remove('journey-active');
    planes.forEach(plane => plane.remove());
    art.querySelectorAll('.step-annotation').forEach(annotation => annotation.style.removeProperty('opacity'));
    planes = [];
    cancelAnimationFrame(frame);
    frame = 0;
  }
  function sync() {
    if (!motion.matches || document.documentElement.classList.contains('intro-pending') || document.documentElement.classList.contains('intro-running')) {
      if (active) stop();
      return;
    }
    if (!active) {
      planes = sources.map(source => {
        const plane = document.createElementNS(svgNS, 'svg');
        plane.setAttribute('class', 'journey-plane');
        plane.setAttribute('viewBox', art.getAttribute('viewBox'));
        plane.setAttribute('aria-hidden', 'true');
        plane.append(source.cloneNode(true));
        document.body.append(plane);
        return plane;
      });
      active = true;
      document.documentElement.classList.add('journey-active');
    }
    schedule();
  }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', sync);
  motion.addEventListener('change', sync);
  new MutationObserver(sync).observe(document.documentElement, {attributes:true,attributeFilter:['class']});
  sync();
})();
