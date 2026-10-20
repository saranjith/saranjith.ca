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
      {transform: `translate(${x}px, ${y}px) rotate(-12deg)`},
      {transform: 'translate(0, 0) rotate(-12deg)'}
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
