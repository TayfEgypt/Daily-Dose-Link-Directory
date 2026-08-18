/* ------------------------------------------------------------------ *
 *  icons.js — SVG line art
 *
 *  Interface icons, all stroke-only on a 32x32 grid so each inherits
 *  `currentColor` and stays crisp at any size.
 * ------------------------------------------------------------------ */
(function (global) {
  'use strict';

  const PATHS = {
    book:
      'M5.6 6.4h8.8c1 0 1.6.7 1.6 1.6v18c0-.9-.6-1.6-1.6-1.6H5.6z' +
      'M26.4 6.4h-8.8c-1 0-1.6.7-1.6 1.6v18c0-.9.6-1.6 1.6-1.6h8.8z',
    pin:
      'M16 28c5-5.4 8.4-10 8.4-14A8.4 8.4 0 0 0 7.6 14c0 4 3.4 8.6 8.4 14z' +
      'M19 13.6a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    star: 'M16 5.4l3.3 6.9 7.3 1-5.3 5.4 1.3 7.6L16 22.6l-6.6 3.7 1.3-7.6L5.4 13.3l7.3-1z',
    arrow: 'M6 16h20M18.4 8.4 26 16l-7.6 7.6',
    back: 'M26 16H6M13.6 8.4 6 16l7.6 7.6',
    close: 'M8 8l16 16M24 8 8 24',
    zoom: 'M14.6 5.6a9 9 0 1 0 0 18 9 9 0 0 0 0-18M21.2 21.2 27 27M10.6 14.6h8M14.6 10.6v8',
    plus: 'M16 7v18M7 16h18',
    minus: 'M7 16h18',
    download: 'M16 5v16M9.4 14.4 16 21l6.6-6.6M6 26h20',
  };

  /**
   * Render an icon as an SVG string.
   * @param {string} name key in PATHS
   * @param {{size?:number, sw?:number, ink?:string}} [opt]
   *        ink is a colour-class suffix ('orange', 'gold', …); omit to
   *        inherit the surrounding text colour.
   */
  function icon(name, opt) {
    const o = opt || {};
    const d = PATHS[name];
    if (!d) return '';
    const cls = 'ico' + (o.ink ? ' ico--' + o.ink : '');
    const size = o.size || 32;
    return (
      '<svg class="' + cls + '" viewBox="0 0 32 32" width="' + size + '" height="' + size + '" ' +
      'fill="none" stroke="currentColor" stroke-width="' + (o.sw || 1.7) + '" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<path d="' + d + '"/></svg>'
    );
  }

  global.Icons = { icon: icon };
})(window);
