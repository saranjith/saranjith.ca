const viewer = document.querySelector('#image-viewer');
const enlarged = viewer.querySelector('img');
document.querySelectorAll('.expand-image').forEach(link => link.addEventListener('click', event => {
  event.preventDefault(); enlarged.src = link.href; enlarged.alt = link.querySelector('img').alt;
  viewer.showModal(); document.body.classList.add('viewer-open');
}));
viewer.querySelector('button').addEventListener('click', () => viewer.close());
viewer.addEventListener('close', () => document.body.classList.remove('viewer-open'));
viewer.addEventListener('click', event => { if (event.target === viewer) { const r = viewer.getBoundingClientRect(); if(event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) viewer.close(); } });
