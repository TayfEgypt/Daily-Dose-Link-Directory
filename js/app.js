/* ------------------------------------------------------------------ *
 *  app.js — hash router + view rendering
 *
 *  Routes
 *    #/                  home (the link tree)
 *    #/menus             pick a branch
 *    #/menu/<branchId>   that branch's menu, shown as the printed artwork
 *    #/locations         all branches + directions
 *
 *  Deep links are stable, so #/menu/gouna is safe to put on a QR code.
 *
 *  Menus are never retyped. js/menu-pages.js lists page images rendered
 *  straight from the source artwork, and every image carries its
 *  intrinsic width/height so the browser reserves the right box and can
 *  never distort the page.
 * ------------------------------------------------------------------ */
(function () {
  'use strict';

  const icon = window.Icons.icon;
  const app = document.getElementById('app');

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const branchById = (id) => BRANCHES.find((b) => b.id === id);
  const menuOf = (branch) => MENU_PAGES[branch.menu];
  /** What to call the downloadable original, taken from its extension. */
  const originalKind = (menu) => (/\.pdf$/i.test(menu.pdf) ? 'PDF' : 'image');

  const SOCIAL = {
    instagram:
      '<svg viewBox="0 0 32 32" width="22" height="22" fill="none" stroke="currentColor" ' +
      'stroke-width="1.9" stroke-linecap="round" aria-hidden="true">' +
      '<rect x="4.6" y="4.6" width="22.8" height="22.8" rx="7"/>' +
      '<circle cx="16" cy="16" r="5.8"/>' +
      '<circle cx="22.6" cy="9.4" r="1.25" fill="currentColor" stroke="none"/></svg>',
    tiktok:
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">' +
      '<path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 ' +
      '4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 ' +
      '8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03' +
      '-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 ' +
      '3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 ' +
      '1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4' +
      '-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
  };

  /* ---------------------------------------------------------------- *
   *  Cover — the booklet front, rebuilt
   *
   *  The cover panel is the brand's deep green in both themes, so the
   *  artwork on it is always the cream ink version.
   * ---------------------------------------------------------------- */
  function coverHtml() {
    const rows = [
      { words: ['THIS', 'MUST'], mark: 'cup' },
      { words: ['BE', 'THE'], mark: 'kettle' },
      { words: ['PLACE'], mark: 'pancakes', end: true },
    ];
    const type = rows
      .map((r, i) => {
        const mark = '<span class="cover__mark">' + icon(r.mark, { sw: 1.4 }) + '</span>';
        const body = r.end
          ? mark + '<span>' + r.words[0] + '</span>'
          : '<span>' + r.words[0] + '</span>' + mark + '<span>' + r.words[1] + '</span>';
        return '<div class="cover__row cover__row--' + (i + 1) + '" style="--i:' + i + '">' +
          body + '</div>';
      })
      .join('');

    return (
      '<header class="cover">' +
        '<div class="cover__in">' +
          '<div class="cover__type">' + type + '</div>' +
          '<p class="cover__poem">' +
            SITE.poem.map((l) => '<span>' + esc(l) + '</span>').join('') +
          '</p>' +
          '<div class="cover__foot">' +
            '<div class="cover__brand">' +
              '<img class="logo" src="assets/img/logo.webp" width="2760" height="565" ' +
                'alt="Daily Dose" fetchpriority="high" decoding="async">' +
              '<span class="cover__kicker">' + esc(SITE.kicker) + '</span>' +
            '</div>' +
            '<img class="mascot" src="assets/img/mascot.webp" width="702" height="640" ' +
              'alt="" aria-hidden="true" fetchpriority="high" decoding="async">' +
          '</div>' +
        '</div>' +
      '</header>'
    );
  }

  function topbarHtml(title, sub, extra) {
    return (
      '<div class="topbar" id="topbar">' +
        '<div class="wrap wrap--wide topbar__in">' +
          '<a class="iconbtn" href="#/" aria-label="Back to home">' + icon('back', { sw: 2 }) + '</a>' +
          '<div class="topbar__title">' +
            '<b>' + esc(title) + '</b>' +
            (sub ? '<span>' + esc(sub) + '</span>' : '') +
          '</div>' +
          (extra || '') +
        '</div>' +
      '</div>'
    );
  }

  /* ---------------------------------------------------------------- *
   *  View: home
   * ---------------------------------------------------------------- */
  function viewHome() {
    const rows = [
      { href: '#/menus', ico: 'book', label: 'Menus', ink: 'orange',
        sub: 'The full booklet for every branch' },
      { href: '#/locations', ico: 'pin', label: 'Locations', ink: 'orange',
        sub: BRANCHES.length + ' branches · tap for directions' },
      { href: LINKS.review, ico: 'star', label: 'Leave a review', ink: 'gold',
        sub: 'Tell us how we did — it takes a minute', ext: true },
    ];

    const links = rows
      .map((r, i) => (
        '<a class="link rise" style="--i:' + (i + 5) + '" href="' + esc(r.href) + '"' +
          (r.ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
          '<span class="link__ico">' + icon(r.ico, { ink: r.ink }) + '</span>' +
          '<span class="link__txt">' +
            '<span class="link__label">' + esc(r.label) + '</span>' +
            '<span class="link__sub">' + esc(r.sub) + '</span>' +
          '</span>' +
          '<span class="link__go">' + icon('arrow', { sw: 2 }) + '</span>' +
        '</a>'
      ))
      .join('');

    return (
      coverHtml() +
      '<div class="wrap">' +
        '<p class="about rise" style="--i:4">' + esc(SITE.about) + '</p>' +
        '<nav class="links stack" aria-label="Main links">' + links + '</nav>' +
        '<div class="socials rise" style="--i:8">' +
          '<a class="social" href="' + esc(LINKS.instagram) + '" target="_blank" ' +
            'rel="noopener noreferrer" aria-label="Instagram">' + SOCIAL.instagram + '</a>' +
          '<a class="social" href="' + esc(LINKS.tiktok) + '" target="_blank" ' +
            'rel="noopener noreferrer" aria-label="TikTok">' + SOCIAL.tiktok + '</a>' +
        '</div>' +
        '<p class="handle rise" style="--i:9">' + esc(LINKS.handle) + '</p>' +
        '<footer class="signoff rise" style="--i:10">' +
          '<strong>' + esc(SITE.signoff[0]) + '</strong>' +
          esc(SITE.signoff[1]) +
        '</footer>' +
      '</div>'
    );
  }

  /* ---------------------------------------------------------------- *
   *  View: branch lists
   * ---------------------------------------------------------------- */
  function branchGroups() {
    const seen = {};
    BRANCHES.forEach((b) => { (seen[b.region] = seen[b.region] || []).push(b); });
    return REGION_ORDER.filter((r) => seen[r]).map((r) => ({ region: r, list: seen[r] }));
  }

  function regionHead(region, n) {
    return (
      '<div class="region">' +
        '<h2 class="region__name">' + esc(region) + '</h2>' +
        '<span class="region__rule"></span>' +
        '<span class="region__count nums">' + n + '</span>' +
      '</div>'
    );
  }

  /** Render each region's branches with a per-branch card builder. */
  function branchList(card) {
    let i = 0;
    return branchGroups()
      .map((g) => regionHead(g.region, g.list.length) +
        g.list.map((b) => card(b, i++)).join(''))
      .join('');
  }

  function viewMenus() {
    const body = branchList((b, i) => (
      '<a class="branch rise" style="--i:' + i + '" href="#/menu/' + esc(b.id) + '">' +
        '<span class="branch__ico">' + icon('book', { ink: 'orange' }) + '</span>' +
        '<span class="branch__name">' + esc(b.name) + '</span>' +
        '<span class="branch__go">' + icon('arrow', { sw: 2 }) + '</span>' +
      '</a>'
    ));

    return (
      topbarHtml('Menus', 'Pick a branch') +
      '<div class="wrap wrap--wide">' +
        '<div class="pagehead rise">' +
          '<h1 class="pagehead__title">which one is<br>yours?</h1>' +
          '<p class="pagehead__lede">Menus differ a little between branches — pick yours and ' +
            'you’ll get the right one.</p>' +
        '</div>' +
        body +
      '</div>'
    );
  }

  function viewLocations() {
    const body = branchList((b, i) => (
      '<div class="branch loc rise" style="--i:' + i + '">' +
        '<div class="loc__head">' +
          '<span class="branch__ico">' + icon('pin', { ink: 'orange' }) + '</span>' +
          '<span class="branch__name">' + esc(b.name) + '</span>' +
        '</div>' +
        '<div class="loc__acts">' +
          '<a class="btn btn--solid" href="' + esc(b.maps) + '" target="_blank" ' +
            'rel="noopener noreferrer">' + icon('pin', { sw: 2 }) + 'Directions</a>' +
          '<a class="btn" href="#/menu/' + esc(b.id) + '">' +
            icon('book', { sw: 2 }) + 'Menu</a>' +
        '</div>' +
      '</div>'
    ));

    return (
      topbarHtml('Locations', BRANCHES.length + ' branches') +
      '<div class="wrap wrap--wide">' +
        '<div class="pagehead rise">' +
          '<h1 class="pagehead__title">find us</h1>' +
          '<p class="pagehead__lede">From the marina where it started to four more across Cairo.</p>' +
        '</div>' +
        body +
      '</div>'
    );
  }

  /* ---------------------------------------------------------------- *
   *  View: menu — the artwork, page by page
   * ---------------------------------------------------------------- */
  function viewMenu(branchId) {
    const branch = branchById(branchId);
    if (!branch) return viewMenus();
    const menu = menuOf(branch);
    const total = menu.pages.length;

    const pages = menu.pages
      .map((p, i) => (
        '<button class="page" type="button" data-i="' + i + '" ' +
          'aria-label="Open page ' + (i + 1) + ' of ' + total + ' full screen">' +
          '<img src="' + esc(p.src) + '" width="' + p.w + '" height="' + p.h + '" ' +
            (i < 2 ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async" ' +
            'alt="' + esc(branch.name) + ' menu, page ' + (i + 1) + '">' +
          (total > 1 ? '<span class="page__no nums">' + (i + 1) + '</span>' : '') +
        '</button>'
      ))
      .join('');

    return (
      topbarHtml(branch.name, '',
        '<a class="iconbtn" href="' + esc(menu.pdf) + '" target="_blank" rel="noopener" ' +
          'aria-label="Open the original ' + originalKind(menu) + '">' +
          icon('download', { sw: 2 }) + '</a>') +

      '<div class="wrap wrap--wide">' +
        '<p class="menuhint rise">' + icon('zoom', { sw: 2 }) +
          '<span>Tap any page to zoom.</span></p>' +
        '<div class="pages">' + pages + '</div>' +
      '</div>' +

      (total > 1
        ? '<div class="pagepill nums" id="pagePill" aria-hidden="true">1 / ' + total + '</div>'
        : '')
    );
  }

  /* ---------------------------------------------------------------- *
   *  Menu behaviour: page counter + full-screen viewer
   * ---------------------------------------------------------------- */
  let teardown = null;

  function wireMenu(branchId) {
    const branch = branchById(branchId);
    const menu = menuOf(branch);
    const host = document.querySelector('.pages');
    if (!host) return;

    const total = menu.pages.length;
    const pill = document.getElementById('pagePill');
    let spy = null;

    /* which page am I looking at */
    if (pill) {
      spy = new IntersectionObserver(
        (entries) => entries.forEach((en) => {
          if (en.isIntersecting) {
            pill.textContent = (Number(en.target.dataset.i) + 1) + ' / ' + total;
          }
        }),
        { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
      );
      host.querySelectorAll('.page').forEach((el) => spy.observe(el));
    }

    /* --- full-screen viewer --- */
    let at = 0;
    let zoom = 1;

    const lb = document.createElement('div');
    lb.className = 'lb';
    lb.hidden = true;
    lb.innerHTML =
      '<div class="lb__bar">' +
        '<span class="lb__count nums" id="lbCount"></span>' +
        '<span class="lb__tools">' +
          '<button class="iconbtn iconbtn--onDark" type="button" id="lbOut" ' +
            'aria-label="Zoom out">' + icon('minus', { sw: 2.2 }) + '</button>' +
          '<button class="iconbtn iconbtn--onDark" type="button" id="lbIn" ' +
            'aria-label="Zoom in">' + icon('plus', { sw: 2.2 }) + '</button>' +
          '<button class="iconbtn iconbtn--onDark" type="button" id="lbClose" ' +
            'aria-label="Close">' + icon('close', { sw: 2.2 }) + '</button>' +
        '</span>' +
      '</div>' +
      '<div class="lb__scroll" id="lbScroll"><img class="lb__img" id="lbImg" alt=""></div>' +
      (total > 1
        ? '<button class="lb__nav lb__nav--prev" type="button" id="lbPrev" ' +
            'aria-label="Previous page">' + icon('back', { sw: 2.2 }) + '</button>' +
          '<button class="lb__nav lb__nav--next" type="button" id="lbNext" ' +
            'aria-label="Next page">' + icon('arrow', { sw: 2.2 }) + '</button>'
        : '');
    document.body.appendChild(lb);

    const img = lb.querySelector('#lbImg');
    const scroll = lb.querySelector('#lbScroll');
    const count = lb.querySelector('#lbCount');
    let lastFocus = null;
    let closeTimer = null;

    function setZoom(z) {
      zoom = Math.min(4, Math.max(1, z));
      scroll.style.setProperty('--z', zoom);
      scroll.classList.toggle('is-zoomed', zoom > 1);
      lb.querySelector('#lbOut').disabled = zoom <= 1;
      lb.querySelector('#lbIn').disabled = zoom >= 4;
    }

    function show(i) {
      at = (i + total) % total;
      const p = menu.pages[at];
      img.src = p.src;
      img.width = p.w;
      img.height = p.h;
      img.alt = branch.name + ' menu, page ' + (at + 1) + ' of ' + total;
      count.textContent = (at + 1) + ' / ' + total;
      setZoom(1);
      scroll.scrollTo({ top: 0, left: 0 });
    }

    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      clearTimeout(closeTimer);
      lb.classList.remove('is-closing');
      lb.hidden = false;
      document.body.classList.add('is-locked');
      lb.querySelector('#lbClose').focus();
    }

    function close() {
      document.body.classList.remove('is-locked');
      lb.classList.add('is-closing');
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        lb.hidden = true;
        lb.classList.remove('is-closing');
        img.removeAttribute('src');
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180);
      if (lastFocus && lastFocus.isConnected) lastFocus.focus();
    }

    host.addEventListener('click', (e) => {
      const btn = e.target.closest('.page');
      if (btn) open(Number(btn.dataset.i));
    });
    lb.querySelector('#lbClose').addEventListener('click', close);
    lb.querySelector('#lbIn').addEventListener('click', () => setZoom(zoom + 1));
    lb.querySelector('#lbOut').addEventListener('click', () => setZoom(zoom - 1));
    if (total > 1) {
      lb.querySelector('#lbPrev').addEventListener('click', () => show(at - 1));
      lb.querySelector('#lbNext').addEventListener('click', () => show(at + 1));
    }
    /* tap the artwork to flip between whole-page and readable */
    img.addEventListener('click', () => setZoom(zoom > 1 ? 1 : 2.5));
    scroll.addEventListener('click', (e) => { if (e.target === scroll) close(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { close(); return; }
      if (total < 2) return;
      if (e.key === 'ArrowLeft') show(at - 1);
      if (e.key === 'ArrowRight') show(at + 1);
    });

    /* the viewer belongs to this route only */
    teardown = () => {
      if (spy) spy.disconnect();
      clearTimeout(closeTimer);
      document.body.classList.remove('is-locked');
      lb.remove();
    };
  }

  /* --- shadow under the sticky bar once the page moves ------------- */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const el = document.getElementById('topbar');
      if (el) el.classList.toggle('is-stuck', window.scrollY > 6);
      ticking = false;
    });
  }

  /* ---------------------------------------------------------------- *
   *  Router
   * ---------------------------------------------------------------- */
  function parse() {
    const p = (location.hash || '#/').replace(/^#/, '').split('/').filter(Boolean);
    if (!p.length) return { name: 'home' };
    if (p[0] === 'menus') return { name: 'menus' };
    if (p[0] === 'locations') return { name: 'locations' };
    if (p[0] === 'menu' && p[1]) return { name: 'menu', id: p[1] };
    return { name: 'home' };
  }

  function paint(route) {
    if (teardown) { teardown(); teardown = null; }

    let html, title;
    switch (route.name) {
      case 'menus':
        html = viewMenus(); title = 'Menus · Daily Dose'; break;
      case 'locations':
        html = viewLocations(); title = 'Locations · Daily Dose'; break;
      case 'menu': {
        const b = branchById(route.id);
        if (!b) { location.hash = '#/menus'; return; }
        html = viewMenu(route.id);
        title = b.name + ' menu · Daily Dose';
        break;
      }
      default:
        html = viewHome(); title = 'Daily Dose Coffee Roasters';
    }
    app.innerHTML = html;
    document.title = title;
    if (route.name === 'menu') wireMenu(route.id);
    onScroll();
  }

  let lastKey = null;
  let firstPaint = true;

  function render() {
    const route = parse();
    const key = route.name + ':' + (route.id || '');
    if (key === lastKey) return;
    lastKey = key;

    const run = () => { paint(route); window.scrollTo(0, 0); };

    /* Cross-fade between routes only — never on the first paint, and
       never while hidden (the API rejects in both cases). */
    const animate =
      !firstPaint &&
      typeof document.startViewTransition === 'function' &&
      document.visibilityState === 'visible' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    firstPaint = false;

    if (!animate) { run(); return; }
    try {
      const t = document.startViewTransition(run);
      ['finished', 'ready', 'updateCallbackDone'].forEach((k) => {
        if (t && t[k] && t[k].catch) t[k].catch(() => {});
      });
    } catch (e) {
      run();
    }
  }

  /* ---------------------------------------------------------------- *
   *  Theme — light by default, dark only when the reader asks for it
   * ---------------------------------------------------------------- */
  (function theme() {
    const KEY = 'dd-theme';
    const root = document.documentElement;
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* private mode */ }
    if (saved === 'dark') root.setAttribute('data-theme', 'dark');

    document.getElementById('themeToggle').addEventListener('click', () => {
      const dark = root.getAttribute('data-theme') !== 'dark';
      if (dark) root.setAttribute('data-theme', 'dark');
      else root.removeAttribute('data-theme');
      try { localStorage.setItem(KEY, dark ? 'dark' : 'light'); } catch (e) { /* ignore */ }
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', dark ? '#1A1917' : '#F2F0E2');
    });
  })();

  /* ---------------------------------------------------------------- *
   *  Boot
   * ---------------------------------------------------------------- */
  window.addEventListener('hashchange', render);
  window.addEventListener('scroll', onScroll, { passive: true });
  render();
})();
