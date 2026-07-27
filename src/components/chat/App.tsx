/**
 * PLACEHOLDER — replaced by the chatbot theme build.
 *
 * Exists so the dynamic import in ThemeBoot.astro resolves and the scaffold
 * builds before the theme trees land. The real implementation is the chat client
 * against ChatTransport, with the StubTransport demo-mode notice (spec §11, §18.5).
 *
 * Contract: default-export a React component taking ThemeAppProps.
 */
import type { ThemeAppProps } from '../../lib/theme-mount';

const App = ({ route }: ThemeAppProps) => (
  <div style={{ padding: '2rem' }}>
    <p>Chat theme not built yet ({route}).</p>
  </div>
);

export default App;
