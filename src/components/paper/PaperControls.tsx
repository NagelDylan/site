/**
 * The always-visible control cluster: theme switcher, light/dark, sound.
 *
 * G8 requires the theme switcher to be always visible, styled natively per theme,
 * and keyboard-reachable. This is paper's version — small index-card buttons in
 * the header, in the paper idiom.
 *
 * Switching dispatches `nagel:theme-change` rather than navigating, so the URL is
 * untouched (G7) and the swap is instant. ThemeBoot.astro listens for it.
 */
import { useCallback, useEffect, useState } from 'react';
import { persistMode, THEME_LABELS, type Mode } from '../../lib/theme';
import type { ThemeId } from '../../data/voice';
import { play, SOUND_STORAGE_KEY } from './sounds';

const THEMES: ThemeId[] = ['paper', 'y2k', 'chat'];

type Props = { initialMode: Mode };

const PaperControls = ({ initialMode }: Props) => {
  const [mode, setMode] = useState<Mode>(initialMode);
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

  const switchTheme = (theme: ThemeId) => {
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

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, next ? 'on' : 'off');
    } catch {
      /* private mode */
    }
    // Play the confirmation only when turning it ON, so enabling is audible and
    // disabling is silent — the obvious behaviour.
    if (next) play('pin');
  };

  return (
    <div className="controls">
      <div className="ctrl-group" role="group" aria-label="Choose a theme">
        {THEMES.map((theme) => (
          <button
            key={theme}
            type="button"
            className="ctrl"
            aria-pressed={theme === 'paper'}
            onClick={() => switchTheme(theme)}
          >
            {THEME_LABELS[theme]}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="ctrl"
        onClick={toggleMode}
        aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {mode === 'dark' ? '☾' : '☀'}
      </button>

      <button
        type="button"
        className="ctrl"
        onClick={toggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? 'Turn paper sounds off' : 'Turn paper sounds on'}
        title="Paper sounds are synthesized, not recorded"
      >
        ♪ {soundOn ? 'on' : 'off'}
      </button>
    </div>
  );
};

export default PaperControls;
