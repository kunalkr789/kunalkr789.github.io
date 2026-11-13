// Bakes the rendered page into dist/index.html so content paints before any JS runs.
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const dist = resolve('dist/index.html');
const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href);
const { html, styles } = render();

let template = await readFile(dist, 'utf8');
if (!template.includes('<div id="root"></div>')) throw new Error('prerender: #root placeholder not found');

// Inline the (small) site stylesheets so first paint doesn't wait on extra requests.
let inlined = 0;
for (const [tag, href] of [...template.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)]) {
  const css = await readFile(resolve('dist', href.replace(/^\//, '')), 'utf8');
  template = template.replace(tag, `<style>${css}</style>`);
  inlined += css.length;
}

// Preload the fonts the hero paints with, so the swap happens before first paint, not after.
const assets = await readdir(resolve('dist/assets'));
const heroFonts = [/^instrument-serif-latin-400-normal-.*\.woff2$/, /^geist-latin-wght-normal-.*\.woff2$/];
const preloads = heroFonts
  .map((re) => assets.find((f) => re.test(f)))
  .filter(Boolean)
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`)
  .join('\n    ');

// The page is fully readable from this HTML, so don't let ~280 KB of JS compete with
// first paint: drop the eager modulepreloads and start the entry module after the first frame.
const entry = template.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
if (!entry) throw new Error('prerender: entry module script not found');
template = template
  .replace(/\s*<link rel="modulepreload"[^>]*>/g, '')
  .replace(
    entry[0],
    `<script>requestAnimationFrame(() => setTimeout(() => { const s = document.createElement('script'); s.type = 'module'; s.crossOrigin = ''; s.src = '${entry[1]}'; document.head.append(s); }));</script>`,
  );

const out = template
  .replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    ${preloads}`)
  .replace('</head>', `${styles}\n  </head>`)
  .replace('<div id="root"></div>', `<div id="root">${html}</div>`);

await writeFile(dist, out);
await rm('dist-ssr', { recursive: true, force: true });
console.log(`prerender: ${Math.round(html.length / 1024)} KB HTML, ${Math.round(styles.length / 1024)} KB MUI CSS, ${Math.round(inlined / 1024)} KB site CSS inlined, ${preloads ? preloads.split('\n').length : 0} fonts preloaded`);
