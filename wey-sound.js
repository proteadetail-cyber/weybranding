(() => {
  const KEY = 'weySoundEnabled';
  const embedded = window.parent !== window;
  let enabled = false;
  let context = null;
  let master = null;
  let noiseBuffer = null;

  try {
    enabled = localStorage.getItem(KEY) === 'true';
  } catch (_) {}

  function storePreference(value) {
    try {
      localStorage.setItem(KEY, value ? 'true' : 'false');
    } catch (_) {}
  }

  function getAudioContext() {
    if (context) return context;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    context = new AudioContextClass();
    master = context.createGain();
    master.gain.value = 0.34;

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 14;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.008;
    compressor.release.value = 0.16;
    master.connect(compressor);
    compressor.connect(context.destination);
    return context;
  }

  function makeNoiseBuffer(audio) {
    if (noiseBuffer) return noiseBuffer;
    const length = Math.floor(audio.sampleRate * 0.6);
    noiseBuffer = audio.createBuffer(1, length, audio.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const fade = 1 - i / length;
      data[i] = (Math.random() * 2 - 1) * fade;
    }
    return noiseBuffer;
  }

  function playTap() {
    const audio = getAudioContext();
    if (!audio || !enabled) return;
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    const now = audio.currentTime;

    const body = audio.createOscillator();
    const bodyGain = audio.createGain();
    body.type = 'sine';
    body.frequency.setValueAtTime(410, now);
    body.frequency.exponentialRampToValueAtTime(245, now + 0.12);
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.12, now + 0.012);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    body.connect(bodyGain);
    bodyGain.connect(master);
    body.start(now);
    body.stop(now + 0.15);

    const edge = audio.createOscillator();
    const edgeGain = audio.createGain();
    edge.type = 'triangle';
    edge.frequency.setValueAtTime(880, now);
    edge.frequency.exponentialRampToValueAtTime(620, now + 0.045);
    edgeGain.gain.setValueAtTime(0.0001, now);
    edgeGain.gain.exponentialRampToValueAtTime(0.022, now + 0.004);
    edgeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    edge.connect(edgeGain);
    edgeGain.connect(master);
    edge.start(now);
    edge.stop(now + 0.07);
  }

  function playEnable() {
    const audio = getAudioContext();
    if (!audio) return;
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    const now = audio.currentTime;

    [[392, 0], [587.33, 0.055]].forEach(([frequency, delay]) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const start = now + delay;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.055, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(start);
      oscillator.stop(start + 0.23);
    });
  }

  function playSweep(reverse) {
    const audio = getAudioContext();
    if (!audio || !enabled) return;
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    const now = audio.currentTime;
    const duration = 0.46;

    const source = audio.createBufferSource();
    source.buffer = makeNoiseBuffer(audio);
    const filter = audio.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.55;
    filter.frequency.setValueAtTime(reverse ? 2100 : 260, now);
    filter.frequency.exponentialRampToValueAtTime(reverse ? 260 : 2100, now + duration);
    const airGain = audio.createGain();
    airGain.gain.setValueAtTime(0.0001, now);
    airGain.gain.linearRampToValueAtTime(0.13, now + 0.12);
    airGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter);
    filter.connect(airGain);
    airGain.connect(master);
    source.start(now);
    source.stop(now + duration);

    const low = audio.createOscillator();
    const lowGain = audio.createGain();
    low.type = 'sine';
    low.frequency.setValueAtTime(reverse ? 54 : 86, now);
    low.frequency.exponentialRampToValueAtTime(reverse ? 86 : 54, now + duration);
    lowGain.gain.setValueAtTime(0.0001, now);
    lowGain.gain.linearRampToValueAtTime(0.07, now + 0.14);
    lowGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    low.connect(lowGain);
    lowGain.connect(master);
    low.start(now);
    low.stop(now + duration);
  }

  function play(effect) {
    if (!enabled) return;
    if (effect === 'transition') playSweep(false);
    else if (effect === 'return') playSweep(true);
    else playTap();
  }

  function sendEffect(effect) {
    if (embedded) {
      window.parent.postMessage({ type: 'wey-sound-effect', effect }, location.origin);
    } else {
      play(effect);
    }
  }

  let control = null;
  if (!embedded && document.body) {
    control = document.createElement('button');
    control.className = 'wey-sound-toggle';
    control.type = 'button';
    control.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    control.innerHTML = '<span class="wey-sound-meter" aria-hidden="true"><i></i><i></i><i></i></span><span class="wey-sound-label"></span>';
    document.body.append(control);

    const label = control.querySelector('.wey-sound-label');
    function updateControl() {
      control.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      control.setAttribute('aria-label', enabled ? 'Turn website sounds off' : 'Turn website sounds on');
      control.title = enabled ? 'Sound on — click to mute' : 'Sound off — click to enable';
      label.textContent = enabled ? 'SOUND ON' : 'SOUND OFF';
      control.classList.toggle('is-on', enabled);
    }
    updateControl();

    control.addEventListener('click', () => {
      enabled = !enabled;
      storePreference(enabled);
      updateControl();
      if (enabled) playEnable();
      else if (master && context) {
        master.gain.setTargetAtTime(0, context.currentTime, 0.025);
        window.setTimeout(() => {
          if (master && context && !enabled) master.gain.value = 0.34;
        }, 120);
      }
    });
  }

  const transitionTargets = '#weyMini, #weyBack, #weyHomeButton, .return-control, .wey-page-return, .wey-page-back, [data-wey-sound-transition]';

  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest('a[href], button, summary, [role="button"]') : null;
    if (!target || target === control || target.closest('.wey-sound-toggle')) return;

    let effect = 'tap';
    if (target.matches(transitionTargets) || target.closest(transitionTargets)) {
      effect = target.matches('.wey-home-button, .return-control, .wey-page-return, .wey-page-back') ? 'return' : 'transition';
    } else {
      const link = target.closest('a[href]');
      if (link) {
        try {
          const destination = new URL(link.href, location.href);
          if (destination.pathname !== location.pathname || destination.search !== location.search || !link.hash) {
            effect = 'transition';
          }
        } catch (_) {
          effect = 'transition';
        }
      }
    }
    sendEffect(effect);
  }, true);

  if (!embedded) {
    window.addEventListener('message', event => {
      if (event.origin !== location.origin || event.data?.type !== 'wey-sound-effect') return;
      play(event.data.effect);
    });

    const accordionFrame = document.getElementById('weyFrame');
    if (accordionFrame) {
      const attachAccordionSounds = () => {
        let doc;
        try {
          doc = accordionFrame.contentDocument;
        } catch (_) {
          return;
        }
        if (!doc || doc.documentElement.dataset.weySoundsAttached === 'true') return;
        doc.documentElement.dataset.weySoundsAttached = 'true';
        doc.addEventListener('click', event => {
          const tile = event.target instanceof Element ? event.target.closest('nav a') : null;
          if (tile) play('transition');
        }, true);
      };
      accordionFrame.addEventListener('load', attachAccordionSounds);
      attachAccordionSounds();
    }
  }
})();
