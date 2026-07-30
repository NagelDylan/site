// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import { SITE_URL } from './src/config.ts';

/**
 * Deploy target is GitHub Pages, via .github/workflows/deploy.yml. No adapter on
 * purpose: `output: 'static'` is the v7 default, and with no adapter the page
 * ships as real static HTML — nothing here needs a server. The contact form posts
 * straight to Web3Forms from the browser (src/lib/contact.ts).
 *
 * No `base` is set because the site is served from the root of a custom domain
 * (public/CNAME). If it ever moves to a project URL like user.github.io/site,
 * `base` becomes mandatory and every root-absolute asset path in src/data and
 * src/lib/music.ts has to be rewritten through it.
 */
export default defineConfig({
  // Required by @astrojs/sitemap: without `site` it logs a warning and silently
  // emits nothing (node_modules/@astrojs/sitemap/dist/index.js:43).
  site: SITE_URL,

  integrations: [react(), sitemap()],

  // Astro 7 defaults this to 'jsx', which applies React's whitespace rules and
  // welds words together wherever an inline <a> or <span> sits on its own line
  // ("Waterloo.I build"). `true` is the old lossless minification.
  compressHTML: true,

  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },

  devToolbar: {
    enabled: false,
  },
});
