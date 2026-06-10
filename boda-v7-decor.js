/* =========================================================
   Boda v7 — Iconos decorativos de fondo (~1.5 cm)
   · 2 iconos por sección, en secciones ALTERNADAS (una sí, una no)
   · Colocados en las esquinas para no tapar el texto
   · Hilo rojo largo, de extremo a extremo
   ========================================================= */
(function () {
  'use strict';

  function init() {
    var ICONS = [
      'fotos/icons/talavera-jarron.png',
      'fotos/icons/sobre-flores.png',
      'fotos/icons/bailarines.png',
      'fotos/icons/talavera-azulejos.png'
    ];
    // En secciones oscuras el bailarín (azul marino) no contrasta → se omite
    var DARK_SAFE = [
      'fotos/icons/talavera-jarron.png',
      'fotos/icons/sobre-flores.png',
      'fotos/icons/talavera-azulejos.png'
    ];

    // Pares de posiciones (esquinas, lejos del centro donde va el texto)
    var POS = [
      [ { top: '6%',  left: '3%',  rot: -8 }, { bottom: '7%', right: '4%', rot: 10 } ],
      [ { top: '8%',  right: '4%', rot: 9  }, { bottom: '6%', left: '3%',  rot: -11 } ]
    ];

    var all = Array.prototype.slice.call(document.querySelectorAll('main > .section'));
    var sections = all.filter(function (s) {
      return !s.classList.contains('logo-intro') &&
             !s.classList.contains('tal-bg-full');
    });

    var d = 0;
    sections.forEach(function (sec, i) {
      if (i % 2 !== 0) return;               // alternado: una sí, una no
      var dark = sec.classList.contains('bg-ink');
      var pool = dark ? DARK_SAFE : ICONS;

      var layer = document.createElement('div');
      layer.className = 'bg-decor';
      layer.setAttribute('aria-hidden', 'true');

      var preset = POS[d % POS.length];
      preset.forEach(function (p, k) {
        var img = document.createElement('img');
        img.className = 'ico';
        var ipath = pool[(d * 2 + k) % pool.length];
        img.src = (window.__ICON_URIS && window.__ICON_URIS[ipath]) || ipath;
        img.alt = '';
        img.style.top    = p.top    || 'auto';
        img.style.bottom = p.bottom || 'auto';
        img.style.left   = p.left   || 'auto';
        img.style.right  = p.right  || 'auto';
        img.style.transform = 'rotate(' + p.rot + 'deg)';
        layer.appendChild(img);
      });

      sec.insertBefore(layer, sec.firstChild);
      sec.classList.add('has-bg-decor');
      d++;
    });

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
