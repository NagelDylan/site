/// <reference types="astro/client" />

/**
 * Build-time environment. `PUBLIC_` values are inlined into the client bundle by
 * Astro — that is required here (the forms run in the browser on a static site)
 * and it is safe, because the Web3Forms access key is a routing identifier rather
 * than a credential. See the header of src/lib/contact.ts.
 *
 * Optional on purpose: `npm run build` must succeed with no `.env` present, and
 * the forms then render their honest "not configured" state instead of failing to
 * compile. Copy .env.example to .env to switch delivery on locally.
 */
interface ImportMetaEnv {
  readonly PUBLIC_WEB3FORMS_ACCESS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
