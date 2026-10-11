(() => {
  const measurementId = 'G-Y50T40C7YR';
  const embedded = window.parent !== window && window.name === 'wey-pillar-page';
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', measurementId, { send_page_view: !embedded });

  // A cached pillar is only viewed when its live page opens.
  if (embedded) {
    window.addEventListener('message', event => {
      if (event.source !== parent || event.data?.type !== 'wey-page-activity' || !event.data.active) return;
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: location.href,
        page_referrer: document.referrer
      });
    });
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  document.head.append(script);
})();
