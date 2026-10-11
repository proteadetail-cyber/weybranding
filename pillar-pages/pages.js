(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const embedded = window.parent !== window && window.name === 'wey-pillar-page';
  const html = document.documentElement;
  if (!reduced) html.classList.add('has-motion');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
  }, { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(node => observer.observe(node));
  const hero = document.querySelector('.landscape-hero');
  new IntersectionObserver(entries => { document.body.classList.toggle('past-hero', !entries[0].isIntersecting); }, { threshold: .08 }).observe(hero);
  document.querySelector('.return-control').addEventListener('click', () => {
    if (embedded) parent.postMessage({type:'wey-page-return'}, '*');
    else location.href = '/?weyReturn=accordion';
  });
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    document.querySelectorAll('.gallery-item').forEach(card => { card.hidden = button.dataset.filter !== 'All' && card.dataset.category !== button.dataset.filter; });
  }));
  document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-step]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    document.querySelectorAll('.route-panel').forEach(panel => { panel.hidden = panel.id !== `step-${button.dataset.step}`; });
  }));
  const copy = document.querySelector('.copy-email');
  if (copy) copy.addEventListener('click', async () => {
    const status = document.querySelector('.copy-status');
    try { await navigator.clipboard.writeText('hello@weybrand.co.za'); status.textContent = 'Email address copied.'; }
    catch { status.textContent = 'hello@weybrand.co.za — select and copy the address above.'; }
  });
  const scope = [...document.querySelectorAll('input[name=scope]')];
  scope.forEach(input => input.addEventListener('change', () => {
    document.getElementById('scope-summary').textContent = scope.filter(i => i.checked).map(i => i.value).join(' / ') || 'Choose the areas you’d like to discuss.';
  }));
  document.querySelectorAll('[data-brief]').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const business = String(data.get('business') || '').trim();
    const body = [`Name: ${name}`, `Email: ${email}`, `Business / project: ${business}`, data.getAll('scope').length ? `Scope: ${data.getAll('scope').join(', ')}` : '', data.get('timing') ? `Timing: ${data.get('timing')}` : '', data.get('budget') ? `Budget context: ${data.get('budget')}` : '', '', String(data.get('message') || '')].filter(line => line !== '').join('\n');
    const subject = `${form.dataset.brief} — ${business || name}`;
    const url = `mailto:hello@weybrand.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    let result = form.querySelector('.form-result');
    if (!result) { result = document.createElement('div'); result.className = 'form-result'; result.setAttribute('role', 'status'); form.append(result); }
    result.replaceChildren();
    const note = document.createElement('p'); note.textContent = 'Your brief is ready. Open it in your email app, or copy the text below.';
    const link = document.createElement('a'); link.href = url; link.className = 'text-link'; link.textContent = 'Open email app';
    const preview = document.createElement('textarea'); preview.readOnly = true; preview.rows = 8; preview.value = body; preview.setAttribute('aria-label', 'Prepared enquiry — copy this text if you prefer');
    result.append(note, link, preview);
    result.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
  }));
  window.addEventListener('message', event => {
    if (event.source !== parent || !embedded) return;
    if (event.data?.type === 'wey-page-activity') html.classList.toggle('is-page-active', !!event.data.active);
  });
})();
