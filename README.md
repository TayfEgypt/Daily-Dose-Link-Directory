# Daily Dose Coffee Roasters — link tree

A phone-first link tree on a plain web stack: hand-written HTML, CSS and
JavaScript. No framework, no build step, no dependencies. Copy the folder to any
static host and it works.

Replaces the previous Flutter Web version.

---

## Running it

```bash
npx serve .
```

Then open <http://localhost:3000>. Any static file server works; use one rather
than opening `index.html` over `file://` so fonts and images get the right MIME
types.

---

## Files

```
index.html               the shell — everything else is loaded from here
css/styles.css           all styling; design tokens at the top
js/
  data.js                branches, links, site copy      ← edit this
  icons.js               the SVG icons used in the UI
  menu-pages.js          GENERATED — menu page list + image dimensions
  app.js                 hash router and view rendering
assets/
  fonts/                 LeMonde Livre (brand serif) + Figtree
  img/                   logo, mascot, app icons
  menus/                 rendered menu pages + the original PDFs / image
tools/build-menus.py     regenerates assets/menus/ and js/menu-pages.js
favicon.ico
manifest.webmanifest     "Add to Home Screen" metadata
```

### Routes

Hash-based, so every view is deep-linkable and safe on a QR code:

| Route | View |
|---|---|
| `#/` | Home — the link tree |
| `#/branches` | Every branch: directions + menu on one card |
| `#/menu/<branch>` | That branch's menu. Ids: `gouna`, `mivida`, `driive`, `owest`, `lavista`, `playa`, `mountain` |

`#/locations` and `#/menus` from the earlier two-tab layout both redirect to
`#/branches`, so any link already shared keeps working.

---

## Menus

**The menus are the original artwork.** Nothing is retyped or re-laid-out.
`tools/build-menus.py` renders each source page to an image at its native
aspect ratio, and the untouched original stays downloadable via the button in
the menu screen's header. Tapping a page opens a full-screen viewer that zooms
as deep as the source artwork allows.

Six sets of artwork cover the seven branches:

| Artwork | Branches |
|---|---|
| `DD Gouna Booklet (Gouna branch).pdf` | Abu Tig Marina |
| `DD Cairo Booklet (Mivida and Majarrah branches).pdf` | Mivida |
| `DD Menu (The Drive and O West branches).jpeg` | The Driive, O West |
| `Sahel - La Vista menu (48cmx29.7cm).pdf` | La Vista |
| `Sahel - Playa menu (45cmx29.7cm).pdf` | Playa |
| `Sahel - Mountain view menu (45cmx29.7cm).pdf` | Mountain View |

The Sahel menus are large-format landscape spreads rather than booklets, so
the viewer lets zoom go deeper on them — far enough to reach the source
resolution, since a 48 cm spread needs it to be readable on a phone.

### Updating a menu

1. Put the new artwork in a folder — by default `~/Downloads/DD menus`, using
   the same filenames. To change either, edit `SOURCES` at the top of
   `tools/build-menus.py` or set `DD_MENU_SRC`.
2. Run:

```bash
pip install pymupdf pillow
python tools/build-menus.py
```

That rewrites `assets/menus/` and `js/menu-pages.js`. Page counts and image
sizes are picked up automatically — no other file needs editing.

---

## Editing content

Everything routine is in **`js/data.js`**:

- `BRANCHES` — name, place, Google Maps link, and which artwork the branch
  serves, as one flat list rendered in array order (Cairo, then El Gouna, then
  Sahel). Add or remove one here and every screen follows. Leave `maps` off a branch and its card shows "Location soon"
  instead of a directions button.
- `LINKS` — Instagram, TikTok, the review form.
- `SITE` — the kicker under the logo, the about paragraph, the sign-off.

---

## Design notes

The printed booklet is the design system, so the site reads as the same object:
cream paper, green ink, and the brand's own LeMonde Livre italic for display
type.

- **Colours** are sampled from the source artwork: paper `#F2F0E2`, ink
  `#1B582C`, cover green `#1C4425`, orange `#F68F43`.
- **The hero has no green panel.** The wordmark leads in brand green on cream
  paper, so only the green-ink artwork ships. (If a green background is ever
  reintroduced, the logo and mascot need cream-ink copies — green on green
  disappears.)
- **Light is the default**, regardless of the device's system setting. Dark
  mode is opt-in and remembered; the toggle sits beside the social icons on
  home and in the topbar elsewhere, inline rather than floating, so it costs
  the layout no space. It uses
  a warm charcoal rather than a second green, so the green panels and the orange
  accents still register. Body text is 7.4:1 in light and 12:1 in dark, both
  WCAG AAA.
- **Type**: LeMonde Livre for display and italic notes, Figtree for UI. Four
  self-hosted WOFF2 files, ~64 KB total, and no third-party requests at all —
  which keeps first load fast on mobile data.
- **Motion** is one page-load stagger plus a cross-fade between routes, fully
  disabled under `prefers-reduced-motion`.
- **Images** always carry their intrinsic `width`/`height` alongside a global
  `height: auto`, so the browser reserves the correct box and artwork is never
  stretched or shifted.
- **Home fits one phone screen without scrolling.** It is a `100dvh` flex
  column with the footer cluster pushed down by `margin-top: auto`, the larger
  rhythm steps scale with viewport height, and three `max-height` tiers trim
  type on shorter screens. Verified exact from 540px of visible height upward.
  Nothing is ever truncated: below 620px tall the decorative mascot is hidden
  and below 580px the `@handle` line goes, since the icons beside it lead to
  the same accounts.

### A note on the brand fonts

The supplied `LeMondeLivre-*.otf` files are rejected outright by browser font
sanitisers, so they cannot be used on the web as-is — this is almost certainly
why the old site fell back to a default serif. The files in `assets/fonts/`
were converted from CFF to TrueType outlines, which browsers accept. Keep the
`.woff2` files; regenerating them from the OTFs requires that conversion.

Only the weights actually used are shipped: LeMonde Normal, Italic and
SemiBold, plus Figtree as a variable font.

---

## Deploying

Static site — Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3 or nginx all
work. Upload the folder; there is no build command and no output directory.
Two server settings are worth checking:

- `.woff2` served as `font/woff2`, `.webp` as `image/webp`.
- Long `Cache-Control` on `assets/`, short on `index.html` and `js/`, so menu
  updates appear straight away.
