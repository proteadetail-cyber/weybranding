(() => {
  const form = document.getElementById('estimate-form');
  const config = window.WEY_QUOTE_PRICING;
  if (!form || !config) return;
  const money = cents => 'R' + new Intl.NumberFormat('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}).format(cents / 100);
  const options = [...form.querySelectorAll('[data-price-key]')];
  const type = document.getElementById('build-type');
  let selected = [], total = 0, deposit = 0, packageLabel = config.packageLabel;
  function calculate() {
    const enabled = new Set(options.filter(input => input.checked).map(input => input.dataset.priceKey));
    const landing = type.value === 'landing';
    packageLabel = landing ? 'Single-page landing website' : config.packageLabel;
    selected = landing ? [{id:'landing',label:packageLabel,cents:config.landingPageCents,required:true}] : config.items.filter(item => item.required || enabled.has(item.id));
    document.getElementById('custom-build-options').hidden = landing;
    document.getElementById('landing-description').hidden = !landing;
    options.forEach(input => { input.disabled = landing; });
    total = selected.reduce((sum, item) => sum + item.cents, 0);
    deposit = Math.round((total * config.depositPercent / 100) / 100) * 100;
    document.getElementById('estimate-total').textContent = money(total);
    document.getElementById('estimate-deposit').textContent = money(deposit);
    document.getElementById('estimate-balance').textContent = money(total - deposit);
    const list = document.getElementById('estimate-items');
    list.replaceChildren(...selected.map(item => {
      const row = document.createElement('li');
      const label = document.createElement('span'); label.textContent = item.label;
      const price = document.createElement('span'); price.textContent = money(item.cents);
      row.append(label, price); return row;
    }));
    document.getElementById('scope-summary').textContent = [packageLabel, ...selected.filter(item => !item.required).map(item => item.label)].join(' / ');
    const oldResult = form.querySelector('.form-result');
    if (oldResult) oldResult.remove();
  }
  form.querySelectorAll('[data-feature-price]').forEach(node => {
    const item = config.items.find(item => item.id === node.dataset.featurePrice);
    if (item) node.textContent = money(item.cents);
  });
  options.forEach(input => input.addEventListener('change', calculate));
  type.addEventListener('change', calculate);
  form.addEventListener('input', event => {
    if (!event.target.matches('[data-price-key]')) form.querySelector('.form-result')?.remove();
  });
  form.addEventListener('change', event => {
    if (!event.target.matches('[data-price-key]')) form.querySelector('.form-result')?.remove();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const body = [
      'WEY — WEBSITE PROJECT ENQUIRY', '',
      `Name: ${String(data.get('name') || '').trim()}`,
      `Email: ${String(data.get('email') || '').trim()}`,
      `Business / project: ${String(data.get('business') || '').trim()}`,
      `Timing: ${data.get('timing') || 'Flexible'}`,
      `Budget context: ${String(data.get('budget') || '').trim() || 'Not specified'}`,
      '', 'WEBSITE ESTIMATE', packageLabel,
      ...selected.map(item => `${item.label}: ${money(item.cents)}`),
      '', `Estimated project total: ${money(total)}`,
      `50% deposit: ${money(deposit)}`, `50% before launch: ${money(total - deposit)}`,
      '', 'Estimate subject to scope review. Maximum listed build price: ' + money(config.maxBuildCents) + '. Payment split rounded to whole rand. Tax treatment to be confirmed. Hosting, domains, paid subscriptions, provider fees, LMS and course payments excluded.',
      '', 'PROJECT GOALS', String(data.get('message') || '').trim()
    ].join('\n');
    form.querySelector('.form-result')?.remove();
    const result = document.createElement('div'); result.className = 'form-result'; result.setAttribute('role','status');
    const note = document.createElement('p'); note.textContent = 'Your enquiry is ready. Open your email app to send it, or copy the brief below.';
    const link = document.createElement('a'); link.className = 'text-link'; link.textContent = 'Open email app';
    link.href = `mailto:hello@weybrand.co.za?subject=${encodeURIComponent('Website enquiry — ' + String(data.get('business') || '').trim())}&body=${encodeURIComponent(body)}`;
    const copy = document.createElement('button'); copy.type = 'button'; copy.className = 'text-link copy-estimate'; copy.textContent = 'Copy enquiry';
    const preview = document.createElement('textarea'); preview.readOnly = true; preview.rows = 12; preview.value = body; preview.setAttribute('aria-label','Your enquiry and itemised estimate');
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(body); copy.textContent = 'Copied'; }
      catch { preview.focus(); preview.select(); copy.textContent = 'Select and copy the enquiry below'; }
    });
    result.append(note,link,copy,preview); form.append(result);
    result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
  });
  calculate();
})();
