/* =========================================================
   Boda Carlos & Verónica — v4 engine (envelope edition)
   Countdown · Calendar · Reveal · RSVP · Music · Envelope intro
   ========================================================= */
(function () {
  'use strict';
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ============ Hero names letter animation ============ */
  (function () {
    const root = document.getElementById('heroNames');
    if (!root) return;
    $$('.hero-name', root).forEach(span => {
      const text = span.dataset.letters || span.textContent;
      span.innerHTML = '';
      span.setAttribute('aria-label', text);
      [...text].forEach((ch, i) => {
        const l = document.createElement('span');
        l.className = 'hl';
        l.style.setProperty('--li', i);
        l.textContent = ch;
        span.appendChild(l);
      });
    });
    // Add active class on next frame so transition runs
    requestAnimationFrame(() => {
      requestAnimationFrame(() => root.classList.add('lit'));
    });
  })();

  /* ============ Animated text (word stagger) ============ */
  $$('.text-stagger[data-animate="words"]').forEach(el => {
    if (el.dataset.staggered) return;
    el.dataset.staggered = '1';

    // Walk children: preserve <br> and inline elements like <small>, split text nodes into words
    let counter = 0;
    function walk(node, parent) {
      const out = [];
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent;
          if (!text.trim()) {
            // whitespace only — preserve as-is
            if (text.length) out.push(document.createTextNode(' '));
            return;
          }
          // Split into words, preserving non-breaking pieces
          text.split(/(\s+)/).forEach(token => {
            if (!token) return;
            if (/^\s+$/.test(token)) {
              out.push(document.createTextNode(' '));
            } else {
              const span = document.createElement('span');
              span.className = 'w';
              span.style.setProperty('--wi', counter++);
              span.textContent = token;
              out.push(span);
            }
          });
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          if (child.tagName === 'BR') {
            // Wrap <br> in a span with animation index so it appears in sequence
            const br = document.createElement('br');
            out.push(br);
          } else {
            // Recurse into inline elements (preserve them, animate inner text)
            const wrapped = child.cloneNode(false);
            const inner = walk(child, wrapped);
            inner.forEach(n => wrapped.appendChild(n));
            out.push(wrapped);
          }
        }
      });
      return out;
    }

    const newKids = walk(el, el);
    el.innerHTML = '';
    newKids.forEach(n => el.appendChild(n));
  });

  /* ============ Reveal on scroll ============ */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
  $$('.reveal:not(.itin-item)').forEach(el => io.observe(el));

  /* Safety net: reveal any stragglers once the page is scrolled near the bottom,
     so content that can't reach the mid-line still appears */
  function revealBottomStragglers() {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80) {
      $$('.reveal:not(.in):not(.itin-item)').forEach(el => { el.classList.add('in'); io.unobserve(el); });
      $$('.itin-item.reveal:not(.in)').forEach(el => el.classList.add('in'));
    }
  }
  window.addEventListener('scroll', revealBottomStragglers, { passive: true });

  /* ============ Itinerary reveal — trigger when item passes viewport middle ============ */
  // Each card waits until it is near the centre of the screen, with extra delay between them
  const itinObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        itinObserver.unobserve(e.target);
      }
    });
  }, {
    // Trigger when each item reaches ~60% down the screen (a touch before the middle),
    // so the whole landing reveals consistently
    rootMargin: '0px 0px -18% 0px',
    threshold: 0
  });
  $$('.itin-item.reveal').forEach(el => itinObserver.observe(el));

  /* ============ Countdown ============ */
  const TARGET = new Date('2026-10-10T12:30:00-06:00').getTime();
  const cdD = $('#cd-d'), cdH = $('#cd-h'), cdM = $('#cd-m'), cdS = $('#cd-s');
  const cdNavDays = $('#cdNavDays');
  const cdNavHours = $('#cdNavHours');
  const cdNavMins = $('#cdNavMins');
  const cdNavSecs = $('#cdNavSecs');
  function tick() {
    const now = Date.now();
    const diff = Math.max(0, TARGET - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000) % 24;
    const m = Math.floor(diff / 60000) % 60;
    const s = Math.floor(diff / 1000) % 60;
    if (cdD) cdD.textContent = String(d).padStart(3, '0');
    if (cdH) cdH.textContent = String(h).padStart(2, '0');
    if (cdM) cdM.textContent = String(m).padStart(2, '0');
    if (cdS) cdS.textContent = String(s).padStart(2, '0');
    if (cdNavDays)  cdNavDays.textContent  = String(d).padStart(3, '0');
    if (cdNavHours) cdNavHours.textContent = String(h).padStart(2, '0');
    if (cdNavMins)  cdNavMins.textContent  = String(m).padStart(2, '0');
    if (cdNavSecs)  cdNavSecs.textContent  = String(s).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);

  /* ============ Mini calendar (October 2026) ============ */
  function buildCal() {
    const grid = $('#cal-grid');
    if (!grid) return;
    const dow = ['L','M','M','J','V','S','D'];
    dow.forEach(d => {
      const el = document.createElement('div');
      el.className = 'dow';
      el.textContent = d;
      grid.appendChild(el);
    });
    const firstDow = 4; // Oct 1, 2026 is a Thursday
    const daysInMonth = 31;
    const lead = firstDow - 1;
    for (let i = 0; i < lead; i++) {
      const el = document.createElement('div');
      el.className = 'day muted';
      el.textContent = 30 - lead + i + 1;
      grid.appendChild(el);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const el = document.createElement('div');
      el.className = 'day' + (i === 10 ? ' target' : '');
      el.textContent = i;
      grid.appendChild(el);
    }
    const total = lead + daysInMonth;
    const tail = (Math.ceil(total / 7) * 7) - total;
    for (let i = 1; i <= tail; i++) {
      const el = document.createElement('div');
      el.className = 'day muted';
      el.textContent = i;
      grid.appendChild(el);
    }
  }
  buildCal();

  /* ============ Boleto counter ============ */
  (function () {
    const el = $('#boleto-count');
    if (!el) return;
    const urlPart = new URLSearchParams(window.location.search).get('b');
    if (urlPart && /^\d+$/.test(urlPart)) el.textContent = urlPart;
  })();

  /* ============ Copy buttons ============ */
  $$('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const val = btn.dataset.copy || '';
      try {
        await navigator.clipboard.writeText(val);
        const orig = btn.textContent;
        btn.textContent = '✓ COPIADO';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1600);
      } catch (e) { /* ignore */ }
    });
  });

  /* ============ Pill radios ============ */
  $$('.pill-radio').forEach(grp => {
    grp.addEventListener('change', e => {
      $$('label', grp).forEach(l => l.classList.toggle('on', l.dataset.val === e.target.value));
      const ifYes = $('#rsvp-if-yes');
      if (ifYes && e.target.name === 'attendance') {
        ifYes.style.display = e.target.value === 'yes' ? '' : 'none';
      }
    });
  });

  /* ============ Guest list (RSVP) ============ */
  (function () {
    const list = $('#guestsList');
    const addBtn = $('#guestsAdd');
    if (!list || !addBtn) return;
    let idx = 0;
    function addGuestRow() {
      idx++;
      const row = document.createElement('div');
      row.className = 'guest-row';
      row.innerHTML = `
        <input type="text" name="guest_${idx}" placeholder="Nombre del invitado" autocomplete="off" />
        <button type="button" class="guest-remove" aria-label="Quitar invitado">✕</button>
      `;
      row.querySelector('.guest-remove').addEventListener('click', () => row.remove());
      list.appendChild(row);
      row.querySelector('input').focus();
    }
    addBtn.addEventListener('click', addGuestRow);
  })();

  /* ============ Gallery flip cycle ============ */
  (function () {
    const cards = $$('.gallery-mosaic > div');
    if (!cards.length) return;
    let started = false;
    const galSection = cards[0].closest('.section');
    if (!galSection) return;

    function startFlipCycle() {
      if (started) return;
      started = true;
      const sequence = [...cards].sort(() => Math.random() - 0.5);
      const GAP = 4000;     // 4 seconds between each card flip
      const SHOW = 3500;    // each card stays flipped 3.5s (so it flips back before the next)
      const CYCLE = sequence.length * GAP;

      function runCycle() {
        const seq = [...cards].sort(() => Math.random() - 0.5);
        seq.forEach((card, i) => {
          setTimeout(() => {
            card.classList.add('flipped');
            setTimeout(() => card.classList.remove('flipped'), SHOW);
          }, i * GAP);
        });
      }

      // First flip almost immediately so the viewer instantly notices the cards have a reverse
      setTimeout(() => {
        runCycle();
        // Re-trigger after every full cycle + 4s pause
        setInterval(runCycle, CYCLE + 4000);
      }, 500);
    }

    // Allow click/tap to manually flip
    cards.forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
      });
    });

    // Start the auto-flip when the gallery enters viewport
    const flipObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          startFlipCycle();
          flipObs.disconnect();
        }
      });
    }, { threshold: 0.35 });
    flipObs.observe(galSection);
  })();

  /* ============ RSVP submit ============ */
  const form = $('#rsvpForm');
  if (form) {
    // Endpoint de Make (webhook) → escribe la fila en tu Excel (OneDrive)
    const RSVP_ENDPOINT = 'https://hook.us2.make.com/kfj6avx4647defdta8mbh3c2m7je04j7';

    // Hora local de México (America/Mexico_City) en formato "YYYY-MM-DD HH:mm:ss"
    function nowMexico() {
      try {
        const p = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Mexico_City',
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        }).formatToParts(new Date());
        const m = {};
        p.forEach(x => { m[x.type] = x.value; });
        let hh = m.hour === '24' ? '00' : m.hour;
        return `${m.year}-${m.month}-${m.day} ${hh}:${m.minute}:${m.second}`;
      } catch (_) {
        return new Date().toISOString().replace('T', ' ').slice(0, 19);
      }
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const body = $('#rsvp-body');
      const thanks = $('#rsvpThanks');

      // Armar el payload con el mismo esquema del flujo
      const fd = new FormData(form);
      const asistira = fd.get('attendance') === 'yes' ? 'Sí' : 'No';
      const guests = [];
      for (const [k, v] of fd.entries()) {
        if (k.indexOf('guest_') === 0 && String(v).trim()) guests.push(String(v).trim());
      }
      const payload = {
        marca_tiempo: nowMexico(),
        nombre: String(fd.get('name') || '').trim(),
        asistira: asistira,
        num_acompanantes: asistira === 'Sí' ? guests.length : 0,
        acompanantes: asistira === 'Sí' ? guests.join(', ') : '',
        mensaje: String(fd.get('message') || '').trim()
      };

      // Mostrar agradecimiento de inmediato (no hacemos esperar al invitado)
      if (body) body.style.display = 'none';
      if (thanks) thanks.classList.add('show');

      // Enviar a Power Automate / Excel
      try {
        await fetch(RSVP_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        console.info('RSVP enviado →', payload);
      } catch (err) {
        console.warn('RSVP: el envío falló:', err && err.message);
      }
    });
  }

  /* ============ Music (bottom-right FAB) ============ */
  let audio = null;
  let playing = false;
  let bootStarted = false;
  let currentTrack = 0;
  const fab = $('#musicFab');

  const PLAYLIST = [
    { src: (window.__SONG_DATA_URI || 'fotos/song.mp3'),  startAt: 3 },
  ];

  function ensureAudio() {
    if (audio) return audio;
    audio = new Audio();
    audio.volume = 0.45;
    audio.preload = 'auto';
    audio.loop = true;
    loadTrack(0);
    // When a track ends, advance to the next; loop the playlist after last
    audio.addEventListener('ended', () => {
      currentTrack = (currentTrack + 1) % PLAYLIST.length;
      loadTrack(currentTrack);
      audio.play().catch(err => console.warn('Next track play error:', err && err.message));
    });
    audio.addEventListener('play',  () => { playing = true;  fab && fab.classList.add('playing'); });
    audio.addEventListener('pause', () => { playing = false; fab && fab.classList.remove('playing'); });
    audio.addEventListener('error', (e) => { console.warn('Audio error:', e); });
    return audio;
  }

  function loadTrack(i) {
    const t = PLAYLIST[i] || PLAYLIST[0];
    if (!audio) return;
    audio.src = t.src;
    const seek = () => {
      if (t.startAt && audio.currentTime < t.startAt) audio.currentTime = t.startAt;
    };
    audio.addEventListener('loadedmetadata', seek, { once: true });
  }

  function startMusic() {
    if (bootStarted) return;
    bootStarted = true;
    const a = ensureAudio();
    if (fab) {
      fab.classList.add('ready');
      fab.classList.add('playing');
    }
    const tryPlay = () => {
      const t = PLAYLIST[currentTrack];
      if (a.readyState >= 1 && t.startAt && a.currentTime < t.startAt) a.currentTime = t.startAt;
      a.play().catch(err => {
        console.warn('Audio play blocked:', err && err.message);
        if (fab) fab.classList.remove('playing');
      });
    };
    if (a.readyState >= 1) tryPlay();
    else a.addEventListener('loadedmetadata', tryPlay, { once: true });
  }

  if (fab) {
    fab.addEventListener('click', () => {
      fab.classList.remove('pulse-hint');
      const a = ensureAudio();
      if (playing) {
        a.pause();
      } else {
        if (!bootStarted) {
          startMusic();
        } else {
          a.play().catch(err => console.warn('play error:', err));
        }
      }
    });
  }

  /* ============ Envelope intro ============ */
  (function () {
    const overlay = $('#envelopeOverlay');
    const envelope = $('#envelope');
    if (!overlay || !envelope) return;

    // Build gold confetti burst sparks
    const burst = envelope.querySelector('.env-burst');
    if (burst) {
      for (let i = 0; i < 24; i++) {
        const sp = document.createElement('span');
        sp.className = 'spark';
        const angle = (Math.PI * 2 / 24) * i + Math.random() * 0.3;
        const dist = 80 + Math.random() * 140;
        sp.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        sp.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
        sp.style.animationDelay = (0.4 + Math.random() * 0.4) + 's';
        sp.style.background = Math.random() > 0.5 ? '#B68B4C' : '#C9A668';
        sp.style.width = sp.style.height = (4 + Math.random() * 6) + 'px';
        burst.appendChild(sp);
      }
    }

    function openEnvelope() {
      if (envelope.classList.contains('opening')) return;
      // Arrancar la música DENTRO del gesto del usuario (requisito de los navegadores)
      try { startMusic(); } catch (_) {}
      envelope.classList.add('opening');
      // After the flap/letter animation, hold so guests can read the invitation, then fade
      setTimeout(() => {
        overlay.classList.add('opened');
        if (fab) { fab.classList.add('ready'); if (!playing) fab.classList.add('pulse-hint'); }
        // Reveal countdown nav once envelope is gone
        const cdNav = $('#cdNav');
        if (cdNav) { cdNav.classList.add('show'); document.body.classList.add('has-cd-nav'); cdNav.setAttribute('aria-hidden', 'false'); }
      }, 2600);
      // Remove from DOM after fade
      setTimeout(() => {
        overlay.remove();
      }, 4100);
    }

    envelope.addEventListener('click', openEnvelope);
    // Keyboard accessibility
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openEnvelope();
      }
    });
    envelope.setAttribute('tabindex', '0');
    envelope.setAttribute('role', 'button');
    envelope.setAttribute('aria-label', 'Abrir invitación');
    // Focus envelope on load for keyboard users
    setTimeout(() => envelope.focus(), 400);
  })();

})();
