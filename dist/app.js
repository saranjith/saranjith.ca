const themeButton=document.querySelector('#theme');function syncTheme(){const dark=document.documentElement.dataset.theme==='dark';themeButton.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} mode`);themeButton.setAttribute('aria-pressed',String(dark))}syncTheme();themeButton.addEventListener('click',()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('theme',document.documentElement.dataset.theme)}catch(e){}syncTheme()});document.querySelector('#year').textContent=new Date().getFullYear();
fetch('content.json')
  .then(response => { if (!response.ok) throw new Error('Content unavailable'); return response.json(); })
  .then(content => {
    const timeline = document.querySelector('#timeline');
    content.timeline.forEach(([date, name, role]) => {
      const row = document.createElement('div'); row.className = 'timeline-row';
      const dateElement = document.createElement('span'); dateElement.textContent = date;
      const detail = document.createElement('div');
      const title = document.createElement('strong'); title.textContent = name;
      const description = document.createElement('p'); description.textContent = role;
      detail.append(title, description); row.append(dateElement, detail); timeline.append(row);
    });
  })
  .catch(() => {
    const message = document.createElement('p');
    message.textContent = 'The career timeline could not load. You can find the full story on LinkedIn above.';
    document.querySelector('#timeline').append(message);
  });
