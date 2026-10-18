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
