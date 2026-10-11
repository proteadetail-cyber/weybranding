(() => {
  const curtain = document.querySelector('.wey-entry-curtain');
  if (!curtain || !new URLSearchParams(location.search).has('weyEnter')) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.documentElement.classList.add('wey-accordion-opening');
  }));

  window.setTimeout(() => {
    document.documentElement.classList.remove('wey-accordion-entering', 'wey-accordion-opening');
    curtain.remove();
    const cleanUrl = new URL(location.href);
    cleanUrl.searchParams.delete('weyEnter');
    history.replaceState(null, '', cleanUrl.pathname + cleanUrl.hash);
  }, reducedMotion ? 40 : 980);
})();
