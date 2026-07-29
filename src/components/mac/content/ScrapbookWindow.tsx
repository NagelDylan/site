/**
 * Scrapbook — the guest book, as the desk accessory that came with the system
 * (spec §4.11).
 *
 * WHAT IT IS: the Mac counterpart to `y2k/GuestbookWindow.tsx`, and a different
 * object rather than the same list in grey. The Y2K guestbook is one long scroll
 * of shouting; the Scrapbook holds one clipping per page and you turn the pages
 * with the two arrows in the corner. Calm, dated, signed.
 *
 * ─── EVERYTHING ON THESE PAGES IS FICTION, AND NONE OF IT IS A CLAIM ─────────
 * The visitors are invented and the dates are period dressing. Not one entry
 * asserts anything about Dylan that the fact layer does not already state: they
 * mention the tank game, the word puzzle and the pathfinding because those are in
 * `src/data/projects.ts`, and they stop there (R5). Nobody in here awards anybody
 * anything, and nobody may (R2). No entry carries a figure of any kind (R1).
 *
 * There is no form, no data store and no submission path, and the window says so
 * on every page. A guest book that accepted input would need a backend,
 * moderation and a spam story; none of that is funny, and pretending to store a
 * signature would be the same small dishonesty §18.5 forbids everywhere else.
 * `Sign` therefore opens a dialog that explains this — the handler comes from
 * App.tsx, because the dialog layer lives there.
 */
import { useState } from 'react';
import { Hairline } from '../deco';

type Page = {
  /** Written out in full, in the era's ordering. Machine-free, like a real note. */
  when: string;
  body: string;
  signed: string;
};

/**
 * Six clippings. In the Mac register: complete sentences, no capitals shouted, no
 * exclamation marks, and the joke carried by the deadpan rather than the volume.
 */
const PAGES: Page[] = [
  {
    when: '12 November 1999',
    body: 'The tank game is the reason I am writing. The enemies do not all behave the same way, and it took me three levels to notice that. Whoever wrote the one that hangs back and waits deserves a quiet word of thanks.',
    signed: 'R. Deveraux, Guelph',
  },
  {
    when: '3 December 1999',
    body: 'Read the whole of this on a Performa over a very patient telephone line. Everything arrived in order and nothing blinked at me, which I appreciated more than I expected to.',
    signed: 'M. Okonkwo',
  },
  {
    when: '19 January 2000',
    body: 'My clocks are still confused and the toaster is unaffected. This document, however, opened without complaint. Thank you for not using frames.',
    signed: 'Ellen H., System 7.5.3',
  },
  {
    when: '8 April 2000',
    body: 'I came for the word puzzle and stayed for the part about pathfinding. That is a compliment, and I am aware of how it reads.',
    signed: 'A guest who did not sign properly',
  },
  {
    when: '22 September 2000',
    body: 'Have you considered a HyperCard stack edition. I am aware of the year. I am asking anyway.',
    signed: 'T. Brandt, Peterborough',
  },
  {
    when: '6 June 2001',
    body: 'Copied this onto a Zip disk to show my father, who asked what an acronym is and then asked to play again. The scoring being kinder than right-or-wrong is the part he liked.',
    signed: 'J. Vasquez',
  },
];

const ScrapbookWindow = ({ onSign }: { onSign: () => void }) => {
  const [index, setIndex] = useState(0);
  const total = PAGES.length;
  /**
   * `noUncheckedIndexedAccess` makes this `Page | undefined`, and the guard below
   * is the cheap way to honour that: paging is clamped, so it cannot be undefined
   * today, and if PAGES is ever emptied the window renders a blank page rather
   * than throwing inside a window manager.
   */
  const page = PAGES[index];

  return (
    <div className="mac-client mac-scrapbook">
      <h2>Scrapbook</h2>
      <p className="mac-lead">
        Clippings kept from the years this desktop is dressed as. Turn the pages with the arrows.
      </p>

      {/* aria-live so a page turn is announced; the arrows sit beside the page in a
          real Scrapbook, and keeping them there is what makes the paging obvious. */}
      <div className="mac-scrap-page" aria-live="polite">
        {page ? (
          <article className="mac-scrap-entry">
            <p className="mac-scrap-date">{page.when}</p>
            <p className="mac-scrap-body">{page.body}</p>
            <p className="mac-scrap-signed">— {page.signed}</p>
          </article>
        ) : (
          <p className="mac-note">This Scrapbook is empty.</p>
        )}
      </div>

      <div className="mac-scrap-controls" data-chrome>
        <button
          type="button"
          className="mac-btn mac-scrap-arrow"
          onClick={() => setIndex((current) => Math.max(0, current - 1))}
          disabled={index === 0}
          aria-label="Previous page"
          data-balloon="Click here for the previous clipping."
        >
          <span aria-hidden="true">◀</span>
        </button>
        <button
          type="button"
          className="mac-btn mac-scrap-arrow"
          onClick={() => setIndex((current) => Math.min(total - 1, current + 1))}
          disabled={index >= total - 1}
          aria-label="Next page"
          data-balloon="Click here for the next clipping."
        >
          <span aria-hidden="true">▶</span>
        </button>
        <span className="mac-scrap-count">
          Page {index + 1} of {total}
        </span>
      </div>

      <Hairline />

      <div className="mac-btn-row">
        <button
          type="button"
          className="mac-btn"
          onClick={onSign}
          data-balloon="Click here and a dialog will explain why this Scrapbook cannot be signed."
        >
          Sign
        </button>
      </div>
      <p className="mac-note">
        This Scrapbook is read-only. There is no database behind this site, so nothing typed
        anywhere on it is stored — including in the message window, which says the same thing in
        its own words.
      </p>
    </div>
  );
};

export default ScrapbookWindow;
