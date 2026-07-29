/**
 * The always-visible control cluster: theme switcher, light/dark, sound.
 *
 * G8 requires the theme switcher to be always visible, styled natively per theme,
 * and keyboard-reachable. This is paper's version — small index-card buttons in
 * the header, in the paper idiom.
 *
 * Switching dispatches `nagel:theme-change` rather than navigating, so the URL is
 * untouched (G7) and the swap is instant. ThemeBoot.astro listens for it.
 *
 * The list of themes comes from THEMES in src/config.ts rather than being written
 * out here. It used to be a local literal, and the literal had gone stale: it read
 * ['paper', 'y2k', 'chat'], so paper visitors were never offered the Classic Mac
 * theme at all. Reading the shared list means this cluster cannot fall behind the
 * splash again — and it is why hiding the chat theme took no edit in this file.
 *
 * The ♪ sound switch is rendered by `Mixtape.tsx`, not here. See the comment at the
 * bottom of this file for why it had to move.
 */
import { useCallback, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { THEMES } from '../../config';
import { persistMode, returnToChooser, THEME_LABELS, type Mode } from '../../lib/theme';
import type { ThemeId } from '../../data/voice';
import { play, SOUND_STORAGE_KEY } from './sounds';
import Mixtape from './Mixtape';

type Props = { initialMode: Mode };

const PaperControls = ({ initialMode }: Props) => {
  const [mode, setMode] = useState<Mode>(initialMode);
  /**
   * Whether sound is allowed at all. Mixtape owns the switch and reports changes
   * here; this copy exists so `chirp` below knows whether it may make a noise.
   * Read once on mount as well, so the first render after hydration is right even
   * before the visitor touches anything.
   */
  const [soundOn, setSoundOn] = useState(false);

  // The pre-paint script may have resolved a different mode than the server
  // guessed; adopt whatever is actually on <html>.
  useEffect(() => {
    const applied = document.documentElement.dataset.mode;
    if (applied === 'light' || applied === 'dark') setMode(applied);
    try {
      setSoundOn(localStorage.getItem(SOUND_STORAGE_KEY) === 'on');
    } catch {
      /* private mode */
    }
  }, []);

  const chirp = useCallback(
    (kind: 'rustle' | 'scratch' | 'pin') => {
      if (soundOn) play(kind);
    },
    [soundOn],
  );

  const switchTheme = (theme: ThemeId) => (event: MouseEvent<HTMLAnchorElement>) => {
    // The anchor's ?theme= href is the no-JS path; with JS we switch in place so
    // the URL stays clean (G7) and nothing reloads.
    event.preventDefault();
    chirp('rustle');
    window.dispatchEvent(new CustomEvent('nagel:theme-change', { detail: { theme } }));
  };

  const toggleMode = () => {
    const next: Mode = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    document.documentElement.dataset.mode = next;
    document.documentElement.style.colorScheme = next;
    persistMode(next);
    chirp('scratch');
  };

  return (
    <div className="controls">
      <div className="ctrl-group" role="group" aria-label="Choose a theme">
        {THEMES.map((theme) => (
          <a
            key={theme}
            className="ctrl"
            href={`?theme=${theme}`}
            aria-current={theme === 'paper' ? 'true' : undefined}
            onClick={switchTheme(theme)}
          >
            {THEME_LABELS[theme]}
          </a>
        ))}
      </div>

      <button
        type="button"
        className="ctrl"
        onClick={() => {
          chirp('rustle');
          returnToChooser();
        }}
        title="Back to the theme chooser"
      >
        ⌂ chooser
      </button>

      <button
        type="button"
        className="ctrl"
        onClick={toggleMode}
        aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {mode === 'dark' ? '☾' : '☀'}
      </button>

      {/*
        The ♪ switch used to be a button in this file, toggling nothing but the
        synthesised rustle/scratch effects. It moved into Mixtape when it started
        starting real music, and the move is not cosmetic: `audio.play()` has to be
        called from inside the click handler or Safari treats the user gesture as
        expired and refuses. Mixtape owns the switch, persists the preference under
        the same key, and reports the value back here — which is all this component
        still needs it for, since `chirp` must stay silent when sound is off.
      */}
      <Mixtape onSoundChange={setSoundOn} />
    </div>
  );
};

export default PaperControls;
