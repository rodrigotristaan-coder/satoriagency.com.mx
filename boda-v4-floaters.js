/* =========================================================
   Boda v4 — Falling flowers & petals spawner
   ========================================================= */
(function () {
  'use strict';

  // Soft floral shapes — blossoms, petals & leaves
  const ICONS = {
    blossom: `<svg viewBox="0 0 24 24" fill="currentColor">
      <g>
        <ellipse cx="12" cy="6.4" rx="2.7" ry="4.4"/>
        <ellipse cx="12" cy="6.4" rx="2.7" ry="4.4" transform="rotate(72 12 12)"/>
        <ellipse cx="12" cy="6.4" rx="2.7" ry="4.4" transform="rotate(144 12 12)"/>
        <ellipse cx="12" cy="6.4" rx="2.7" ry="4.4" transform="rotate(216 12 12)"/>
        <ellipse cx="12" cy="6.4" rx="2.7" ry="4.4" transform="rotate(288 12 12)"/>
        <circle cx="12" cy="12" r="2.3" fill="#FBF1D8"/>
      </g>
    </svg>`,
    bloom:   `<svg viewBox="0 0 24 24" fill="currentColor">
      <g>
        <ellipse cx="12" cy="7" rx="3.4" ry="4.6"/>
        <ellipse cx="12" cy="7" rx="3.4" ry="4.6" transform="rotate(90 12 12)"/>
        <ellipse cx="12" cy="7" rx="3.4" ry="4.6" transform="rotate(45 12 12)"/>
        <ellipse cx="12" cy="7" rx="3.4" ry="4.6" transform="rotate(135 12 12)"/>
        <circle cx="12" cy="12" r="2.6" fill="#FBF1D8"/>
      </g>
    </svg>`,
    petal:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.2 6.8 6.6 12.8 9 18.6c1.2 2.9 4.8 2.9 6 0C17.4 12.8 15.8 6.8 12 2z"/></svg>`,
    bud:     `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c3.2 2.4 4.8 5.6 4.8 9.2 0 3.8-2.2 6.6-4.8 7.8-2.6-1.2-4.8-4-4.8-7.8C7.2 8.6 8.8 5.4 12 3z" opacity="0.95"/><path d="M12 6c1.4 1.8 2 4 2 6.4" fill="none" stroke="#FBF1D8" stroke-width="0.9" opacity="0.6"/></svg>`,
    leaf:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M7 17C10 12 13 9 17 7" fill="none" stroke="#FBF1D8" stroke-width="0.9" opacity="0.5"/></svg>`,
  };

  // Romantic floral palette — soft rose, blush, gold, dusty blue
  const PALETTES = {
    blossom: ['#D98C9A', '#E3B0BA', '#E7BFC6'],
    bloom:   ['#8FA9D0', '#A7BEDD', '#7C99C4'],
    petal:   ['#E3B0BA', '#D98C9A', '#EBC9CF', '#C9A668'],
    bud:     ['#D98C9A', '#C98594'],
    leaf:    ['#9CB58A', '#A9C29A', '#8CA87C'],
  };

  const VARIANTS = [
    { cls: 'f-blossom', icon: 'blossom', w: 0.30 },
    { cls: 'f-petal',   icon: 'petal',   w: 0.26 },
    { cls: 'f-bloom',   icon: 'bloom',   w: 0.20 },
    { cls: 'f-bud',     icon: 'bud',     w: 0.10 },
    { cls: 'f-leaf',    icon: 'leaf',    w: 0.14 },
  ];

  function pickVariant() {
    const total = VARIANTS.reduce((s, v) => s + v.w, 0);
    let r = Math.random() * total;
    for (const v of VARIANTS) {
      r -= v.w;
      if (r <= 0) return v;
    }
    return VARIANTS[0];
  }

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  let host = null;
  function ensureHost() {
    if (host) return host;
    host = document.createElement('div');
    host.className = 'floaters';
    host.setAttribute('aria-hidden', 'true');
    document.body.appendChild(host);
    return host;
  }

  function spawn() {
    const h = ensureHost();
    const v = pickVariant();
    const el = document.createElement('div');
    el.className = 'floater ' + v.cls;
    el.innerHTML = ICONS[v.icon];
    el.style.color = pick(PALETTES[v.icon]);

    const size = rand(13, 24);
    const left = rand(2, 96);
    const sway = (Math.random() > 0.5 ? 1 : -1) * rand(40, 130);
    const rotEnd = (Math.random() > 0.5 ? 1 : -1) * rand(180, 540);
    const dur = rand(13, 24);
    const peakOp = rand(0.45, 0.80);
    // Per-piece easing so pieces drift at slightly different rhythms
    const eases = [
      'cubic-bezier(.37,.06,.55,.96)',
      'cubic-bezier(.45,.02,.5,1)',
      'cubic-bezier(.30,.10,.60,.92)',
    ];

    el.style.left = left + 'vw';
    el.style.fontSize = size + 'px';
    el.style.animationDuration = dur + 's';
    el.style.setProperty('--sway', sway + 'px');
    el.style.setProperty('--rot-end', rotEnd + 'deg');
    el.style.setProperty('--peak-op', peakOp);
    el.style.setProperty('--fall-ease', pick(eases));

    h.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // First batch — a light welcome flurry, staggered
  for (let i = 0; i < 5; i++) setTimeout(spawn, i * 700);

  // A second little wave a few seconds after the first batch settles
  for (let i = 0; i < 4; i++) setTimeout(spawn, 5000 + i * 900);

  // Then spawn sparingly: one flower every ~3.5 seconds
  setInterval(spawn, 3500);

})();
