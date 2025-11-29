# Blockchain Simulator — Learn Blockchain Technology

A lightweight, client-side educational web app that demonstrates core blockchain concepts through interactive simulations: hashing, single block structure, block chaining, ECC signatures, and simple consensus. Built with plain HTML/CSS/JS and Tailwind utilities for layout and styling.

## Live preview / Purpose

This project is intended for learning and demonstration. It shows how common primitives (SHA-256 hashing, block header linking, digital signatures using elliptic/ECC, and a toy consensus mechanism) work in a readable, interactive way.

## Features

- Hash Generator (SHA-256) — experiment with inputs and observe deterministic output / avalanche effect.
- Single Block Viewer — inspect a block’s fields and recompute header/hash.
- Chain Viewer — visualize block linking and chain integrity.
- ECC Signature Playground — generate key pairs and sign/verify messages (uses elliptic lib).
- Simple Consensus Demo — explore a basic consensus rule for validating new blocks.
- Responsive layout with a top navigation and in-page routing (single-page pattern using .page / .active classes).
- Accessible, minimal dependencies — mostly static files, no server-side logic required.

## Tech stack

- HTML5, CSS3
- Tailwind CSS utilities (cdn during development or use Tailwind build for production)
- Vanilla JavaScript (app4.js + small helpers)
- elliptic (ECDSA) — https://cdnjs.cloudflare.com/ajax/libs/elliptic/6.5.4/elliptic.min.js
- Font Awesome for icons

## Repository layout

(corresponds to your local folder)

- index.html — main UI and page sections
- style.css — custom styles + rules for .page visibility
- app4.js (or script.js) — main application logic and page show/hide handlers
- img/ — images used by the site (profile)
- pages/ — optional separate page fragments for some demonstrations
- scripts/ (optional) — helper scripts (image resize, build helpers)

## Getting started (local development)

1. Clone repo (or open your existing folder in VS Code).
2. Serve files over HTTP (recommended) — do not rely on `file://` for module/script behavior:
   - Python: `python -m http.server 8000`
   - Node: `npx http-server -p 8000`
   - VS Code: use Live Server extension
3. Open: `http://localhost:8000` (or `http://127.0.0.1:8000`)

## Common dev notes and troubleshooting

- Blank page on load:

  - Open DevTools (F12) → Console & Network. Look for JS errors or 404s.
  - Typical cause: a script tries to access DOM elements that do not exist on that page (guard getElementById calls or run code on DOMContentLoaded).
  - Ensure only one `.page` element has `active` on initial load. Add defensive JS to set `page-home` active if none found.

- Tailwind & component scripts:

  - For development/testing you can use the CDN: `<script src="https://cdn.tailwindcss.com"></script>`.
  - If you use custom theme names (e.g., `bg-neutral-primary`) you must build Tailwind with your `tailwind.config.js`. The CDN provides default utilities only.
  - If you use a component helper (Flowbite, Tailwind Elements) ensure the corresponding JS is loaded after Tailwind and that data-\* attributes match the library (or add a small JS fallback to toggle `.hidden`).

- Dropdowns / collapse not working:

  - Either include the component library (Flowbite) or add your own small listener:
    document.querySelector('[data-collapse-toggle="navbar-dropdown"]').addEventListener('click', () => { ...toggleHidden... })

- Images & performance:
  - Use responsive images (srcset + sizes), WebP, and lazy-loading: `loading="lazy" decoding="async" width height`.
  - Generate multiple sizes (320/640/1280) and serve the best size with `srcset`.
  - For public sites, consider Cloudinary / Imgix / CDN for caching and optimization.

## Production recommendations

- Replace Tailwind CDN with a proper build (PostCSS + Tailwind CLI) if you use custom utilities or want smaller CSS.
- Minify & bundle JS where appropriate.
- Optimize images and include responsive sources.
- Use HTTPS & set proper caching headers if hosting publicly (GitHub Pages + Cloudflare recommended).

## How navigation and pages work

- Each view is a `.page` element. CSS hides `.page` by default and `.page.active` is visible.
- Navigation toggles `.page.active` and highlights the corresponding `.nav-btn` with a lightweight `.nav-btn.active` style.
- On initial load, a small script ensures exactly one page is `.active` (defaults to `page-home`) so the home view appears correctly.

## Development checklist / debugging hints

- If you see `Cannot set properties of null (setting 'textContent')` — find code that uses `document.getElementById(...)` and wrap it with a guard:
  ```
  const el = document.getElementById('foo');
  if (!el) return;
  el.textContent = ...
  ```
- If dropdowns or toggles do nothing, ensure the library you expect to handle `data-` attributes is loaded and check console for 404.
- Confirm file paths (e.g., `script.js` or `style.css`) relative to pages. Use `../` for pages served from a `pages/` folder.

## Contributing

- Fixes & improvements welcome: open an issue describing the change, then a PR.
- Keep JS changes defensive (check DOM elements exist).
- If adding new Tailwind utilities, prefer adding them to `tailwind.config.js` and generating a production CSS bundle.

## License

MIT License Copyright (c) 2025 Herwin Dermawan

## Contact

- Project author: Herwin Dermawan
- Email: herwin@met.students.pens.ac.id
