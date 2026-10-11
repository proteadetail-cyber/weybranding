(() => {
  const root = document.documentElement;
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const links = [...document.querySelectorAll('.depth-nav a')];
  const counter = document.getElementById('journey-progress');
  let queued = false;
  function update() {
    queued = false;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.min(1, Math.max(0, scrollY / max));
    root.style.setProperty('--progress', progress.toFixed(4));
    root.style.setProperty('--depth', Math.min(1, scrollY / (innerHeight * 3)).toFixed(4));
    counter.textContent = `${String(Math.round(progress * 100)).padStart(2, '0')}%`;
    let current = 0;
    chapters.forEach((chapter, index) => {
      const box = chapter.getBoundingClientRect();
      chapter.classList.toggle('is-current', box.top < innerHeight * .8 && box.bottom > innerHeight * .2);
      if (box.top < innerHeight * .5) current = index;
    });
    links.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  update();
})();
