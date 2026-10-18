const viewer = document.querySelector('#image-viewer');
if (viewer && typeof viewer.showModal === 'function') {
  const enlarged = viewer.querySelector('img');
  let opener;
  document.querySelectorAll('.expand-image').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      opener = link;
      enlarged.src = link.href;
      enlarged.alt = link.querySelector('img').alt;
      viewer.showModal();
      document.body.classList.add('viewer-open');
    });
  });
  viewer.querySelector('button').addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => {
    document.body.classList.remove('viewer-open');
    opener?.focus();
  });
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const rect = viewer.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
  });
}
