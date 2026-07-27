// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import { SITE_URL } from './src/config.ts';

/**
 * Astro 7. Verified against the installed packages, not from memory — several
 * defaults moved between v5 and v7 and two of them matter here.
 *
 * Deploy target is Cloudflare Pages (G1). No adapter is installed on purpose:
 * `output: 'static'` is the v7 default and, with no adapter and no route
 * exporting `prerender = false`, every route ships as real static HTML, which is
 * what §13 requires for deep links and SEO. The Phase B Worker (§11) will live
 * in functions/ and Pages will pick it up beside dist/ — adding an adapter would
 * compromise prerendering for nothing.
 */
export default defineConfig({
  // Required by @astrojs/sitemap: without `site` it logs a warning and silently
  // emits nothing (node_modules/@astrojs/sitemap/dist/index.js:43).
  site: SITE_URL,

  integrations: [react(), sitemap()],

  /**
   * Astro 7 changed this default to 'jsx', which applies React's whitespace
   * rules: whitespace and newlines around elements are dropped and multi-line
   * text is collapsed. On a copy-heavy site that silently welds words together
   * wherever an inline <a> or <span> sits on its own line — e.g. "Waterloo.I
   * build". `true` is the old lossless minification and is what we want.
   */
  compressHTML: true,

  build: {
    // Directory format gives /experience/ rather than /experience.html, which is
    // what the canonical URLs and the sitemap assume.
    format: 'directory',
    inlineStylesheets: 'auto',
  },

  // Three independent component trees share route names; make a collision a
  // build failure rather than a warning we scroll past.
  prerenderConflictBehavior: 'error',

  devToolbar: {
    enabled: false,
  },
});
