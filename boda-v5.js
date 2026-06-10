/* =========================================================
   Boda v5 — Photo carousel · Talavera background · Autoplay
   Runs after boda-v4-engine.js / boda-v4-floaters.js
   ========================================================= */
(function () {
  'use strict';
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ C34 · Venue photo carousel (auto swipe-left) ============ */
  (function () {
    const root = $('#venueCarousel');
    const track = $('#vcTrack');
    const dotsWrap = $('#vcDots');
    if (!root || !track) return;

    const slides = $$('.vc-slide', track);
    const n = slides.length;
    if (n < 2) return;

    // Clone first slide to the end for a seamless always-left loop
    const clone = slides[0].cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);

    // Dots
    const dots = [];
    if (dotsWrap) {
      for (let i = 0; i < n; i++) {
        const d = document.createElement('span');
        d.className = 'dot' + (i === 0 ? ' on' : '');
        dotsWrap.appendChild(d);
        dots.push(d);
      }
    }

    const DWELL = 2200;   // ms each photo is shown
    const SLIDE = 800;    // ms slide animation
    let index = 0;
    let timer = null;
    let paused = false;

    function apply(animate) {
      track.style.transition = animate ? `transform ${SLIDE}ms cubic-bezier(.55,.06,.2,1)` : 'none';
      track.style.transform = `translateX(${-index * 100}%)`;
    }
    function setDots() {
      const real = index % n;
      dots.forEach((d, i) => d.classList.toggle('on', i === real));
    }
    function next() {
      index++;
      apply(true);
      setDots();
    }
    track.addEventListener('transitionend', () => {
      if (index >= n) {            // landed on the clone → snap back to real first
        index = 0;
        apply(false);
        // force reflow so the next animated move works
        void track.offsetWidth;
      }
    });

    function start() {
      if (timer || reduce) return;
      timer = setInterval(() => { if (!paused) next(); }, DWELL);
    }
    function stop() { clearInterval(timer); timer = null; }

    // Pause while the guest is interacting
    root.addEventListener('mouseenter', () => paused = true);
    root.addEventListener('mouseleave', () => paused = false);

    // Light touch-swipe support
    let sx = 0, sdx = 0, dragging = false;
    root.addEventListener('touchstart', (e) => {
      paused = true; dragging = true; sx = e.touches[0].clientX; sdx = 0;
    }, { passive: true });
    root.addEventListener('touchmove', (e) => {
      if (!dragging) return; sdx = e.touches[0].clientX - sx;
    }, { passive: true });
    root.addEventListener('touchend', () => {
      if (dragging && Math.abs(sdx) > 40) {
        if (sdx < 0) next();
        else { index = (index - 1 + (n + 1)) % (n + 1); apply(true); setDots(); }
      }
      dragging = false; setTimeout(() => paused = false, 600);
    });

    apply(false);
    // Always rotating — start immediately on load (no wait for scroll-in)
    start();
  })();

  /* ============ Talavera full background — applied via CSS class
     (.tal-fullbg on selected light sections). No JS scatter needed. ============ */

  /* ============ Typewriter placeholder on the name field ============ */
  (function () {
    const input = document.getElementById('rsvp-name');
    if (!input) return;
    if (reduce) { input.setAttribute('placeholder', 'Escribe tu nombre'); return; }

    const PHRASE = 'Escribe tu nombre…';
    let i = 0, dir = 1, timer = null, active = true;

    function step() {
      if (!active) return;
      input.setAttribute('placeholder', PHRASE.slice(0, i));
      i += dir;
      let delay = dir > 0 ? 95 : 45;
      if (i > PHRASE.length) { i = PHRASE.length; dir = -1; delay = 1700; }      // hold full
      else if (i < 0)        { i = 0; dir = 1; delay = 600; }                     // hold empty
      timer = setTimeout(step, delay);
    }
    function start() { if (!active) { active = true; step(); } }
    function stop()  { active = false; clearTimeout(timer); }

    // Pause while the guest interacts; clear hint on focus
    input.addEventListener('focus', () => { stop(); input.setAttribute('placeholder', ''); });
    input.addEventListener('blur', () => {
      if (!input.value) { i = 0; dir = 1; start(); }
    });

    // Start when the RSVP section enters view (so it's noticed)
    const sec = input.closest('section') || input;
    const io = new IntersectionObserver((ents) => {
      ents.forEach(e => {
        if (e.isIntersecting) { step(); io.disconnect(); }
      });
    }, { threshold: 0.25 });
    io.observe(sec);
  })();

  /* ============ Add to calendar (.ics download) ============ */
  (function () {
    const btn = $('#calBtn');
    if (!btn) return;
    const ICS = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Carlos y Veronica//Boda 10.10.2026//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:boda-carlos-veronica-20261010@satoriagency',
      'DTSTAMP:20260101T000000Z',
      'DTSTART:20261010T183000Z',          // 12:30 PM Morelos (UTC-6)
      'DTEND:20261011T050000Z',            // ~11:00 PM local
      'SUMMARY:Boda Carlos & Verónica',
      'DESCRIPTION:¡Nos casamos! Te esperamos para celebrar nuestra boda en la Ex-Hacienda Chiconcuac\\, Morelos.',
      'LOCATION:Ex-Hacienda Chiconcuac\\, Morelos\\, México',
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Mañana es la boda de Carlos & Verónica',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    btn.addEventListener('click', () => {
      const blob = new Blob([ICS], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Boda-Carlos-y-Veronica.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    });
  })();

  /* ============ Música: arranca al abrir el sobre (sello) ============ */
  (function () {
    const fab = $('#musicFab');
    const envelope = $('#envelope');
    if (!fab || !envelope) return;

    const isPlaying = () => fab.classList.contains('playing');
    let started = false;

    function startFromGesture() {
      if (started) return;
      started = true;
      // El clic en el sobre es un gesto de usuario válido → el navegador permite reproducir.
      try { fab.click(); } catch (_) {}
      // Reintento corto por si el audio aún no había precargado en el primer intento.
      setTimeout(() => { if (!isPlaying()) { try { fab.click(); } catch (_) {} } }, 400);
    }

    // Abrir el sobre (clic o teclado) inicia la música
    envelope.addEventListener('click', startFromGesture);
    envelope.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') startFromGesture();
    });
  })();

})();
