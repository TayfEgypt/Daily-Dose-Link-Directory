/* ------------------------------------------------------------------ *
 *  app.js — hash router + view rendering
 *
 *  Routes
 *    #/                  home (the link tree)
 *    #/branches          every branch: directions + menu
 *    #/menu/<branchId>   that branch's menu, shown as the printed artwork
 *
 *  Deep links are stable, so #/menu/gouna is safe to put on a QR code.
 *
 *  Menus are never retyped. js/menu-pages.js lists page images rendered
 *  straight from the source artwork, and every image carries its
 *  intrinsic width/height so the browser reserves the right box and can
 *  never distort the page.
 *
 *  HERO VARIANTS — temporary, for picking a direction. Append ?hero=band,
 *  ?hero=cream or ?hero=cover to compare. Once one is chosen, keep that
 *  function, delete the other two and drop the switch.
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

  const HEROES = ['band', 'cream', 'cover'];
  function heroChoice() {
    const q = new URLSearchParams(location.search).get('hero');
    return HEROES.indexOf(q) !== -1 ? q : 'band';
  }

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
   *  Hero pieces
   * ---------------------------------------------------------------- */
  /** Wordmark + kicker. `ink` picks the cream or green artwork. */
  function logoBlock(ink, cls) {
    const file = ink === 'cream' ? 'logo.webp' : 'logo-green.webp';
    return (
      '<div class="brand ' + (cls || '') + '">' +
        '<img class="brand__mark" src="assets/img/' + file + '" width="2760" height="565" ' +
          'alt="Daily Dose" fetchpriority="high" decoding="async">' +
        '<span class="brand__kicker">' + esc(SITE.kicker) + '</span>' +
      '</div>'
    );
  }

  /** The booklet tagline: THIS ◦ MUST BE ◦ THE PLACE, marks inline. */
  function taglineBlock(cls) {
    const rows = [
      { words: ['THIS', 'MUST'], mark: 'cup' },
      { words: ['BE', 'THE'], mark: 'kettle' },
      { words: ['PLACE'], mark: 'pancakes', end: true },
    ];
    return (
      '<div class="tagline ' + (cls || '') + '">' +
        rows.map((r, i) => {
          const mark = '<span class="tagline__mark">' + icon(r.mark, { sw: 1.4 }) + '</span>';
          return '<div class="tagline__row tagline__row--' + (i + 1) + '" style="--i:' + i + '">' +
            (r.end
              ? mark + '<span>' + r.words[0] + '</span>'
              : '<span>' + r.words[0] + '</span>' + mark + '<span>' + r.words[1] + '</span>') +
            '</div>';
        }).join('') +
      '</div>'
    );
  }

  const poemBlock = (cls) =>
    '<p class="poem ' + (cls || '') + '">' +
      SITE.poem.map((l) => '<span>' + esc(l) + '</span>').join('') +
    '</p>';

  const mascotImg = (ink, cls) =>
    '<img class="mascot ' + (cls || '') + '" width="702" height="640" alt="" aria-hidden="true" ' +
    'fetchpriority="high" decoding="async" src="assets/img/' +
    (ink === 'cream' ? 'mascot.webp' : 'mascot-green.webp') + '">';

  const aboutBlock = () => '<p class="about rise" style="--i:4">' + esc(SITE.about) + '</p>';

  /* --- variant A: slim green band, logo dominant ------------------- */
  function heroBand() {
    return (
      '<header class="hero hero--band">' +
        '<div class="hero__in">' +
          logoBlock('cream', 'brand--xl') +
          mascotImg('cream', 'mascot--band') +
        '</div>' +
      '</header>' +
      '<div class="wrap">' +
        taglineBlock('tagline--ink') +
        poemBlock('poem--ink') +
        aboutBlock() +
      '</div>'
    );
  }

  /* --- variant B: no green panel ----------------------------------- */
  function heroCream() {
    return (
      '<header class="hero hero--cream">' +
        '<div class="hero__in">' +
          logoBlock('green', 'brand--xl') +
          taglineBlock('tagline--ink tagline--center') +
          poemBlock('poem--ink poem--center') +
          mascotImg('green', 'mascot--cream') +
        '</div>' +
      '</header>' +
      '<div class="wrap">' + aboutBlock() + '</div>'
    );
  }

  /* --- variant C: full green cover, logo leads it ------------------ */
  function heroCover() {
    return (
      '<header class="hero hero--cover">' +
        '<div class="hero__in">' +
          logoBlock('cream', 'brand--xl') +
          taglineBlock('tagline--sm') +
          poemBlock() +
          mascotImg('cream', 'mascot--cover') +
        '</div>' +
      '</header>' +
      '<div class="wrap">' + aboutBlock() + '</div>'
    );
  }

  const HERO_FN = { band: heroBand, cream: heroCream, cover: heroCover };

  /* ---------------------------------------------------------------- *
   *  Shared chrome
   * ---------------------------------------------------------------- */
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
      { href: '#/branches', ico: 'pin', label: 'Branches', ink: 'orange',
        sub: BRANCHES.length + ' locations · directions and menus' },
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
      HERO_FN[heroChoice()]() +
      '<div class="wrap">' +
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
   *  View: branches — one flat list, directions + menu on each card
   * ---------------------------------------------------------------- */
  function viewBranches() {
    const cards = BRANCHES
      .map((b, i) => (
        '<div class="branch rise" style="--i:' + i + '">' +
          '<div class="branch__head">' +
            '<span class="branch__ico">' + icon('pin', { ink: 'orange' }) + '</span>' +
            '<span class="branch__txt">' +
              '<span class="branch__name">' + esc(b.name) + '</span>' +
              (b.place ? '<span class="branch__place">' + esc(b.place) + '</span>' : '') +
            '</span>' +
          '</div>' +
          '<div class="branch__acts">' +
            (b.maps
              ? '<a class="btn btn--solid" href="' + esc(b.maps) + '" target="_blank" ' +
                  'rel="noopener noreferrer">' + icon('pin', { sw: 2 }) + 'Directions</a>'
              : '<span class="btn btn--muted">' + icon('pin', { sw: 2 }) + 'Location soon</span>') +
            '<a class="btn" href="#/menu/' + esc(b.id) + '">' +
              icon('book', { sw: 2 }) + 'Menu</a>' +
          '</div>' +
        '</div>'
      ))
      .join('');

    return (
      topbarHtml('Branches', BRANCHES.length + ' locations') +
      '<div class="wrap wrap--wide">' +
        '<div class="pagehead rise">' +
          '<h1 class="pagehead__title">find us</h1>' +
          '<p class="pagehead__lede">Every branch, with directions and its own menu.</p>' +
        '</div>' +
        '<div class="branches">' + cards + '</div>' +
      '</div>'
    );
  }

  /* ---------------------------------------------------------------- *
   *  View: menu — the artwork, page by page
   * ---------------------------------------------------------------- */
  function viewMenu(branchId) {
    const branch = branchById(branchId);
    if (!branch) return viewBranches();
    const menu = menuOf(branch);
    const total = menu.pages.length;
    /* wide spreads get a wider thumbnail treatment */
    const wide = menu.pages[0].w > menu.pages[0].h;

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
      topbarHtml(branch.name, branch.place,
        '<a class="iconbtn" href="' + esc(menu.pdf) + '" target="_blank" rel="noopener" ' +
          'aria-label="Open the original ' + originalKind(menu) + '">' +
          icon('download', { sw: 2 }) + '</a>') +

      '<div class="wrap wrap--wide">' +
        '<p class="menuhint rise">' + icon('zoom', { sw: 2 }) +
          '<span>Tap any page to zoom' + (wide ? ' — this one is a wide spread' : '') +
          '.</span></p>' +
        '<div class="pages' + (wide ? ' pages--wide' : '') + '">' + pages + '</div>' +
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

    let at = 0;
    let zoom = 1;
    let maxZoom = 4;

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
      const wasZoomed = zoom > 1;
      /* Where the reader is looking, as a fraction of the whole page, so
         the same spot stays put across a zoom change. */
      const fx = scroll.scrollWidth > scroll.clientWidth
        ? (scroll.scrollLeft + scroll.clientWidth / 2) / scroll.scrollWidth
        : 0.5;
      const fy = scroll.scrollHeight > scroll.clientHeight
        ? (scroll.scrollTop + scroll.clientHeight / 2) / scroll.scrollHeight
        : 0.5;

      zoom = Math.min(maxZoom, Math.max(1, z));
      scroll.style.setProperty('--z', zoom);
      scroll.classList.toggle('is-zoomed', zoom > 1);
      lb.querySelector('#lbOut').disabled = zoom <= 1;
      lb.querySelector('#lbIn').disabled = zoom >= maxZoom;

      /* Reading scrollWidth flushes the new layout, so no frame callback
         is needed. Zooming in from the fitted view starts at the top of
         the page; deeper zoom steps hold the reader's focal point. */
      scroll.scrollLeft = fx * scroll.scrollWidth - scroll.clientWidth / 2;
      if (wasZoomed) {
        scroll.scrollTop = fy * scroll.scrollHeight - scroll.clientHeight / 2;
      }
    }

    function show(i) {
      at = (i + total) % total;
      const p = menu.pages[at];
      img.src = p.src;
      img.width = p.w;
      img.height = p.h;
      img.alt = branch.name + ' menu, page ' + (at + 1) + ' of ' + total;
      count.textContent = (at + 1) + ' / ' + total;
      /* Let zoom reach 1:1 with the source pixels — a 2835px wide spread
         needs far more than a 827px booklet page to become readable. */
      const fitW = Math.max(scroll.clientWidth - 24, 1);
      maxZoom = Math.max(4, Math.min(10, Math.ceil(p.w / fitW)));
      zoom = 0;                        /* force setZoom to apply */
      setZoom(1);
      scroll.scrollTo({ top: 0, left: 0 });
    }

    function open(i) {
      lastFocus = document.activeElement;
      clearTimeout(closeTimer);
      lb.classList.remove('is-closing');
      lb.hidden = false;
      document.body.classList.add('is-locked');
      show(i);                         /* after unhide, so clientWidth is real */
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
    img.addEventListener('click', () => setZoom(zoom > 1 ? 1 : Math.min(maxZoom, 2.5)));
    scroll.addEventListener('click', (e) => { if (e.target === scroll) close(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { close(); return; }
      if (total < 2) return;
      if (e.key === 'ArrowLeft') show(at - 1);
      if (e.key === 'ArrowRight') show(at + 1);
    });

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
    /* the old split routes both now land on Branches */
    if (p[0] === 'branches' || p[0] === 'locations' || p[0] === 'menus') {
      return { name: 'branches' };
    }
    if (p[0] === 'menu' && p[1]) return { name: 'menu', id: p[1] };
    return { name: 'home' };
  }

  function paint(route) {
    if (teardown) { teardown(); teardown = null; }

    let html, title;
    switch (route.name) {
      case 'branches':
        html = viewBranches(); title = 'Branches · Daily Dose'; break;
      case 'menu': {
        const b = branchById(route.id);
        if (!b) { location.hash = '#/branches'; return; }
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
  document.documentElement.dataset.hero = heroChoice();
  window.addEventListener('hashchange', render);
  window.addEventListener('scroll', onScroll, { passive: true });
  render();
})();
