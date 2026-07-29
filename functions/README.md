# Phase B — Cloudflare Pages Functions

**Nothing lives here yet.** One of the two planned routes is still blocked on an
account (the Anthropic API key for the chatbot); the other one is never coming,
because contact is now delivered without a server — see below.

No stub endpoints are committed here, because a route that returns a fake 200 is worse
than a route that doesn't exist — the chat frontend already has an honest offline state.

This file documents where the two endpoints go and what they have to do, so Phase B is
a build rather than a re-derivation.

Pages picks up `functions/` automatically alongside the static `dist/` output. No
adapter is needed and none is installed — the site stays fully prerendered (§13), and
adding `@astrojs/cloudflare` would compromise that for no gain.

---

## `functions/api/chat.ts`

Proxies streaming completions to the Anthropic API. The browser must never see the key.

Frontend contract is already fixed by `src/lib/chat/` — implement to that, and going
live is `FEATURES.liveChat = true` in `src/config.ts`.

**System prompt:** import `buildSystemPrompt()` from `src/lib/fact-pack.ts`. Do not
write a second prompt here. It is compiled from the fact layer at build time so the
bot cannot cite a stale job title, and it already carries R1–R5, the Apple boundary,
hostile-question handling, and injection hardening.

**Model:** `claude-opus-5`. Cheaper options if the ceiling bites: `claude-sonnet-5`,
`claude-haiku-4-5`.

Two API details that are easy to get wrong and expensive to debug:

1. **Keep thinking ON at `effort: "low"`. Never `thinking: {type: "disabled"}`.**
   On Opus 5, disabling thinking has a documented failure mode where the model writes
   a tool call into its *visible text* instead of emitting a real `tool_use` block.
   The turn succeeds, the tool silently never runs, and no error is raised. This
   interface renders project cards via tool calls, so it surfaces as cards
   mysteriously failing to appear. Low effort is also cheap.
2. **Check `stop_reason` before reading response content.** Safety classifiers can
   decline a request and return HTTP 200 with `stop_reason: "refusal"` and empty
   content. Code that reads `content[0]` unconditionally crashes.

**Prompt caching:** cache the compiled fact pack as a prefix. Cache reads cost ~0.1×
input. The minimum cacheable prefix on Opus 5 is 512 tokens; the pack clears that
easily.

**Cost control (§11.4) — no API feature does this for you. All of it is here:**

- Hard single-digit-dollar monthly ceiling, enforced by a persistent counter (KV or a
  Durable Object). Refuse requests once hit.
- Per-IP rate limit.
- Cap conversation length and `max_tokens` per reply.
- When the cap is hit or this Worker is down, the frontend already renders an honest
  "chat is offline right now — here's the site and Dylan's email" with a nudge toward
  the other themes. **Do not substitute canned answers while implying the bot is
  live.** That is the one failure mode that actively damages the impression.

**Transcript logging:** on, with the visible privacy notice already in the UI. Wire
the notice's wording to what the backend actually does.

---

## `functions/api/contact.ts` — not needed; do not build it

Contact is **done without a server.** All four forms POST straight to Web3Forms from
the browser, which holds the mail credentials and (once configured) the Turnstile
secret. See `src/lib/contact.ts` for the reasoning and the delivery contract.

The reason the original plan here could not work: verifying a Turnstile token requires
a secret key, and a fully static site has nowhere to put one. Standing up a Function
purely to hold that secret would trade the site's prerendering guarantee (§13) for a
captcha. Web3Forms' server does the verification instead.

If you ever add this route anyway, delete `src/lib/contact.ts` in the same commit —
two delivery paths for one message is how one of them silently rots.

---

## Secrets

Never commit keys. Local dev uses `.dev.vars` (gitignored); production uses Pages
environment variables. Expected names:

```
ANTHROPIC_API_KEY
```

The contact form needs no secret here. Its only variable, `PUBLIC_WEB3FORMS_ACCESS_KEY`,
is a routing identifier that ships in the client bundle by design (`.env.example`);
anything genuinely secret about contact — the mail credentials, the Turnstile secret —
lives in the Web3Forms dashboard.
