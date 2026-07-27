# Animation Project (HTML / SCSS / JS)

Quick scaffold for a small animation project using plain HTML, SCSS and ES modules.

Structure
- `index.html` — HTML entry, links `css/main.css` and `scripts/main.js`
- `scss/` — SCSS sources (`_reset.scss`, `main.scss`)
- `css/` — compiled CSS (`main.css`) included for immediate preview
- `scripts/` — JS modules (`main.js`)
- `images/`, `fonts/` — asset folders (place your images and fonts here)

Open locally
1. Open `index.html` in a browser or use Live Server extension.

Compile SCSS (optional)
Install Dart Sass if you want to compile manually:

```bash
npm install -g sass
# or use your local install
sass scss/main.scss css/main.css --no-source-map --style=expanded
```

Notes
- `css/main.css` is provided so you can open `index.html` immediately without a build step.
- To add a toolchain later, consider adding a `package.json` with `sass --watch` and a small dev server.
