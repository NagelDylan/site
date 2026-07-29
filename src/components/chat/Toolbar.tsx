/**
 * Toolbar — theme switcher and light/dark, in the chat idiom (spec G8, G4).
 *
 * The switcher is always visible and always keyboard-reachable. In this theme it
 * is doing more work than in the other two: chat is the least skimmable way to
 * read a résumé, and a recruiter in a hurry needs a one-click exit to the paper
 * version. That escape route is the reason chat is allowed to be chat-only with
 * no content sidebar.
 *
 * It dispatches an event and never navigates: ThemeBoot listens, swaps the
 * mounted React root, and persists the choice. No reload, no URL change, so the
 * same link works whichever theme the visitor lands in (G7).
 */
import { THEMES } from '../../config';
import { THEME_LABELS, persistMode, returnToChooser, type Mode } from '../../lib/theme';
import type { ThemeId } from '../../data/voice';

/** Shared by the offline panel, which nudges toward the other two themes. */
export function requestTheme(theme: ThemeId): void {
  window.dispatchEvent(new CustomEvent('nagel:theme-change', { detail: { theme } }));
}

/**
 * This theme's own id, annotated as `ThemeId` rather than left to infer.
 *
 * 'chat' is not in THEMES any more (the theme is hidden — see config.ts), so a
 * plain `'chat'` literal makes the `theme === SELF` comparison below a compile
 * error: TypeScript sees `'paper' | 'y2k' | 'mac'` against `'chat'` and reports no
 * overlap. The assertion — rather than a `: ThemeId` annotation, which control-flow
 * analysis narrows straight back to the literal on a const — keeps this retained
 * tree compiling, and the comparison starts being true again the moment 'chat'
 * returns to THEMES.
 */
const SELF = 'chat' as ThemeId;

type Props = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
};

const Toolbar = ({ mode, onModeChange }: Props) => {
  const toggleMode = () => {
    const next: Mode = mode === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.mode = next;
    document.documentElement.style.colorScheme = next;
    persistMode(next);
    onModeChange(next);
  };

  return (
    <div className="c-toolbar">
      <div className="c-switcher" role="group" aria-label="Choose how this site looks">
        {THEMES.map((theme) => {
          const active = theme === SELF;
          return (
            <button
              className="c-switcher__btn"
              key={theme}
              type="button"
              aria-current={active ? 'true' : undefined}
              onClick={() => !active && requestTheme(theme)}
            >
              {THEME_LABELS[theme]}
            </button>
          );
        })}
      </div>

      {/* Back to the splash, which is the only screen showing all three themes. */}
      <button
        className="c-iconbtn"
        type="button"
        onClick={returnToChooser}
        title="Back to the theme chooser"
      >
        <span aria-hidden="true">⌂</span>
        <span className="sr-only">Back to the theme chooser</span>
      </button>

      <button
        className="c-iconbtn"
        type="button"
        onClick={toggleMode}
        aria-pressed={mode === 'dark'}
      >
        <span aria-hidden="true">{mode === 'dark' ? '☾' : '☀'}</span>
        <span className="sr-only">
          {mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        </span>
      </button>
    </div>
  );
};

export default Toolbar;
