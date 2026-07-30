/**
 * The desktop assistant: a paperclip, legally distinct from any other paperclip.
 *
 * Introduces Dylan and offers to open windows. Everything he says is pulled from
 * the data layer rather than hardcoded, since microcopy is still copy.
 */
import { useState } from 'react';
import { COOP_TERMS, IDENTITY } from '../../data';
import { ClippyFigure } from './Icon';

type Says = 'intro' | 'available' | 'work' | 'bye';

type Props = {
  onOpen: (what: 'projects' | 'experience' | 'contact' | 'help') => void;
  onDismiss: () => void;
};

const Clippy = ({ onOpen, onDismiss }: Props) => {
  const [says, setSays] = useState<Says>('intro');

  return (
    <aside className="y2k-clippy" data-decorative aria-label="Desktop assistant">
      <div className="y2k-clippy-bubble" aria-live="polite">
        {says === 'intro' ? (
          <>
            <p style={{ margin: 0 }}>
              It looks like you&apos;re trying to hire a co-op student! Would you like help?
            </p>
            <p style={{ margin: '6px 0 0' }}>
              That&apos;s <strong>{IDENTITY.name}</strong> — {IDENTITY.headline}, Computer Science at
              Waterloo, {COOP_TERMS.length} co-op terms in.
            </p>
          </>
        ) : null}

        {says === 'available' ? (
          <p style={{ margin: 0 }}>
            <strong>{IDENTITY.availability}.</strong> He&apos;s in {IDENTITY.location}. The MSN window
            has the e-mail address, and the e-mail address is the part that actually works.
          </p>
        ) : null}

        {says === 'work' ? (
          <p style={{ margin: 0 }}>
            Full-stack products and the AI infrastructure behind them — evaluation platforms,
            retrieval systems and LLM features. C:\Projects\ is on the desktop; JOBS I HAVE HAD has
            the details, in his employers&apos; own words rather than mine.
          </p>
        ) : null}

        {says === 'bye' ? (
          <p style={{ margin: 0 }}>
            Fine. I&apos;ll be in the tray, thinking about 1998. Click the ☻ if you need me.
          </p>
        ) : null}

        {/* Once he's said goodbye the options go with him, or the widget reads
            as half-dismissed for the 1.4s before he leaves. */}
        {says === 'bye' ? null : (
          <div className="y2k-clippy-actions">
            {says !== 'work' ? (
              <button
                type="button"
                className="y2k-btn"
                onClick={() => {
                  setSays('work');
                  onOpen('projects');
                }}
              >
                Show me his work!!
              </button>
            ) : null}
            {says !== 'available' ? (
              <button type="button" className="y2k-btn" onClick={() => setSays('available')}>
                Is he available?
              </button>
            ) : null}
            <button type="button" className="y2k-btn" onClick={() => onOpen('contact')}>
              How do I reach him?
            </button>
            <button type="button" className="y2k-btn" onClick={() => onOpen('help')}>
              How does this desktop work?
            </button>
            <button
              type="button"
              className="y2k-btn"
              onClick={() => {
                setSays('bye');
                window.setTimeout(onDismiss, 1400);
              }}
            >
              Go away, paperclip
            </button>
          </div>
        )}
      </div>
      <span className="y2k-clippy-guy" aria-hidden="true">
        <ClippyFigure />
      </span>
    </aside>
  );
};

export default Clippy;
