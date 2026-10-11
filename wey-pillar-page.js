(() => {
  const embedded = window.parent !== window && window.name === 'wey-pillar-page';
  const pillars = new Set(['PROJECTS','PORTFOLIO','CLIENTS','QUOTE','SERVICES','ABOUT','PROCESS','INSIGHTS','TEAM','CAREERS','CONTACT','NEWS']);
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const destination = new URL(link.href, location.href);
    const match = destination.pathname.match(/\/(?:--WEB--\/)?([^/]+)\/index\.html$/i);
    if (!match || !pillars.has(match[1].toUpperCase()) || destination.protocol !== location.protocol || destination.host !== location.host) return;
    if (destination.pathname === location.pathname && destination.hash) return;
    event.preventDefault();
    destination.search = ''; destination.hash = '';
    if (embedded) {
      parent.postMessage({type:'wey-page-navigate',href:destination.href}, '*');
    } else {
      const accordion = new URL('/?weyReturn=accordion', destination);
      accordion.searchParams.set('weyReturn', 'accordion');
      accordion.searchParams.set('weyOpen', match[1].toUpperCase());
      location.href = accordion.href;
    }
  });
  if (!embedded) return;
  window.addEventListener('message', event => {
    if (event.source === parent && event.data?.type === 'wey-page-activity' && event.data.active) {
      window.scrollTo({top:0,left:0,behavior:'instant'});
    }
  });
  document.documentElement.classList.add('wey-embedded-page');
  const style = document.createElement('style');
  style.textContent = '.wey-embedded-page .return-control,.wey-embedded-page .wey-page-return,.wey-embedded-page .entry-curtain,.wey-embedded-page .wey-entry-curtain{display:none!important}';
  document.head.append(style);
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') parent.postMessage({type:'wey-page-return'}, '*');
  });
  document.addEventListener('DOMContentLoaded', async () => {
    const palette = getComputedStyle(document.documentElement);
    const accent = ['/PROJECTS/'].some(path => location.pathname.includes(path)) ? palette.getPropertyValue('--fern-light').trim() : ['--accent','--blood','--moss'].map(key => palette.getPropertyValue(key).trim()).find(Boolean) || '#c31f26';
    const images = [...document.images].filter(image => image.getBoundingClientRect().top < innerHeight);
    const assets = images.map(image => image.decode ? image.decode().catch(() => {}) : Promise.resolve());
    if (document.fonts) assets.push(document.fonts.ready);
    await Promise.race([Promise.all(assets), new Promise(resolve => setTimeout(resolve, 2500))]);
    requestAnimationFrame(() => requestAnimationFrame(() => parent.postMessage({type:'wey-page-ready',url:location.href,accent}, '*')));
  });
})();
