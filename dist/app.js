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

const emailButton = document.querySelector('[data-email-action]');
if (emailButton) emailButton.hidden = false;
emailButton?.addEventListener('click', () => {
  // Assemble the address only after a person asks to email; keep it out of HTML.
  const local = ['con', 'tact'].join('');
  const domain = ['saran', 'jith', '.ca'].join('');
  window.location.href = `mailto:${local}@${domain}`;
});



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

// Scroll through a deck: the front process card lifts to reveal the next one.
(() => {
  const stack = document.querySelector('.process-stack');
  const cards = [...(stack?.querySelectorAll('.process-step') || [])];
  if (!stack || cards.length !== 4) return;
  const mapPlanes = [...stack.querySelectorAll('.process-map .field-plane')];
  const mapLabels = [...stack.querySelectorAll('.process-map .step-annotation')];
  const setActive = index => {
    mapPlanes.forEach((plane, planeIndex) => plane.classList.toggle('is-active', planeIndex === index));
    mapLabels.forEach((label, labelIndex) => label.classList.toggle('is-active', labelIndex === index));
  };
  const motion = matchMedia('(min-width: 800px) and (prefers-reduced-motion: no-preference)');
  let frame = 0;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function reset() {
    stack.classList.remove('stack-active', 'stack-entered');
    setActive(0);
    cards.forEach(card => {
      card.style.removeProperty('transform');
      card.style.removeProperty('opacity');
      card.style.removeProperty('visibility');
    });
  }
  function draw() {
    frame = 0;
    if (!motion.matches) { reset(); return; }
    stack.classList.add('stack-active');
    const stage = stack.getBoundingClientRect();
    stack.closest('.approach')?.classList.toggle('process-reached', stage.top < innerHeight * .15);
    stack.classList.toggle('stack-entered', stage.top < innerHeight * .7 && stage.bottom > 0);
    const deck = stack.querySelector('.process-steps').getBoundingClientRect();
    const top = deck.top;
    const travel = Math.max(1, stage.height - deck.height);
    const progress = clamp((top - stage.top) / travel, 0, 1) * (cards.length - 1);
    const current = Math.min(cards.length - 1, Math.floor(progress));
    const fraction = progress - current;
    setActive(current);
    cards.forEach((card, index) => {
      const distance = index - current;
      if (distance < 0) {
        card.style.transform = 'translate3d(0,-105%,0) rotate(-3deg)';
        card.style.opacity = '0';
        card.style.visibility = 'hidden';
      } else if (distance === 0) {
        card.style.transform = `translate3d(0,${-105 * fraction}%,0) rotate(${-3 * fraction}deg)`;
        card.style.opacity = '1';
        card.style.visibility = 'visible';
      } else {
        const depth = Math.min(distance, 3);
        const offset = distance === 1 ? 22 * (1 - fraction) : 22 + (depth - 1) * 9;
        const scale = distance === 1 ? .96 + .04 * fraction : 1 - .04 * depth;
        card.style.transform = `translate3d(0,${offset}px,0) scale(${scale})`;
        card.style.opacity = '1';
        card.style.visibility = 'visible';
      }
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  motion.addEventListener('change', schedule);
  schedule();
})();

// Carry the complete four-layer drawing from the hero into the process map.
(() => {
  const source = document.querySelector('.hero-art .field-diagram');
  const target = document.querySelector('.process-map-diagram');
  if (!source || !target) return;
  const motion = matchMedia('(min-width: 1000px) and (prefers-reduced-motion: no-preference)');
  const moving = source.cloneNode(true);
  moving.classList.remove('field-diagram');
  moving.classList.add('process-plane-handoff');
  moving.setAttribute('aria-hidden', 'true');
  document.body.append(moving);
  let frame = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  function draw() {
    frame = 0;
    const intro = document.documentElement.classList.contains('intro-pending') || document.documentElement.classList.contains('intro-running');
    if (!motion.matches || intro) {
      source.style.removeProperty('opacity');
      target.style.removeProperty('opacity');
      moving.style.display = 'none';
      return;
    }
    const sourceBox = source.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();
    const sourceBottom = sourceBox.bottom + scrollY;
    const targetTop = targetBox.top + scrollY;
    const start = sourceBottom - innerHeight * .6;
    const end = Math.max(start + 240, targetTop - innerHeight * .45);
    const progress = clamp((scrollY - start) / (end - start));
    if (progress <= 0) {
      source.style.removeProperty('opacity');
      target.style.opacity = '0';
      moving.style.display = 'none';
      return;
    }
    if (progress >= 1) {
      source.style.opacity = '0';
      target.style.removeProperty('opacity');
      moving.style.display = 'none';
      return;
    }
    const eased = progress * progress * (3 - 2 * progress);
    const lerp = (a, b) => a + (b - a) * eased;
    source.style.opacity = '0';
    target.style.opacity = '0';
    moving.style.display = 'block';
    moving.style.width = `${lerp(sourceBox.width, targetBox.width)}px`;
    moving.style.height = `${lerp(sourceBox.height, targetBox.height)}px`;
    moving.style.transform = `translate3d(${lerp(sourceBox.left, targetBox.left)}px,${lerp(sourceBox.top, targetBox.top)}px,0)`;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  motion.addEventListener('change', schedule);
  new MutationObserver(schedule).observe(document.documentElement, {attributes:true,attributeFilter:['class']});
  schedule();
})();;
