(() => {
  const files = ['./v4-core.js','./v4-tasks.js','./v4-ui.js','./v4-41.js'];
  let index = 0;
  const loadNext = () => {
    if (index >= files.length) return;
    const script = document.createElement('script');
    script.src = files[index++];
    script.onload = loadNext;
    script.onerror = () => {
      const toast = document.getElementById('toast');
      if (toast) {
        toast.textContent = 'بارگذاری برنامه کامل نشد؛ صفحه را دوباره باز کن.';
        toast.classList.add('show');
      }
    };
    document.body.appendChild(script);
  };
  loadNext();
})();