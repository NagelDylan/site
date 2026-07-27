/**
 * PLACEHOLDER — replaced by the Y2K theme build.
 *
 * Exists so the dynamic import in ThemeBoot.astro resolves and the scaffold
 * builds before the theme trees land. The real implementation is the Win98/2000
 * desktop shell: window manager, Start menu, taskbar, boot sequence (spec §10).
 *
 * Contract: default-export a React component taking ThemeAppProps.
 */
import type { ThemeAppProps } from '../../lib/theme-mount';

const App = ({ route }: ThemeAppProps) => (
  <div style={{ padding: '2rem', fontFamily: 'Tahoma, Verdana, sans-serif' }}>
    <p>Y2K theme not built yet ({route}).</p>
  </div>
);

export default App;
