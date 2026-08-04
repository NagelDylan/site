/**
 * The program frame: everything between the title bar and the soft keys.
 *
 * Deliberately thin, because almost all of a window is affordance rather than
 * frame — a bar to drag, a corner to resize, a menu strip to drop down — and none
 * of that survives a thumb. What is left is a caption band and the switch that
 * chooses what goes under it.
 *
 * That switch is a mirror of App.tsx's renderContent: the same components, the
 * same props, no mobile variants. It is the reason a bio, a job date or a track
 * list can only be edited in one place. Anything that does not fit a 320px screen
 * is therefore a CSS problem, and the fix belongs in styles/mobile/apps.css —
 * never in a second copy of the JSX.
 */
import type { Resume, WindowKind } from '../wm';
import Icon from '../Icon';
import type { RunningApp } from './shell';

import WelcomeWindow from '../content/WelcomeWindow';
import ExperienceWindow from '../content/ExperienceWindow';
import ProjectsExplorer, { BinList } from '../content/ProjectsExplorer';
import ProjectWindow from '../content/ProjectWindow';
import AboutWindow from '../content/AboutWindow';
import SkillsWindow from '../content/SkillsWindow';
import EducationWindow from '../content/EducationWindow';
import ContactWindow from '../content/ContactWindow';
import GuestbookWindow from '../content/GuestbookWindow';
import WinampWindow from '../content/WinampWindow';
import ResumeWindow from '../content/ResumeWindow';
import HelpWindow from '../content/HelpWindow';

type Props = {
  app: RunningApp;
  resume: Resume;
  onOpen: (kind: WindowKind, arg?: string | null) => void;
  /** Opens the "guestbook is full" dialog. */
  onSign: () => void;
};

const AppFrame = ({ app, resume, onOpen, onSign }: Props) => {
  const content = () => {
    switch (app.kind) {
      case 'welcome':
        return <WelcomeWindow resume={resume} onOpen={(kind) => onOpen(kind)} />;
      case 'experience':
        return <ExperienceWindow />;
      case 'projects':
        return <ProjectsExplorer onOpenProject={(slug) => onOpen('project', slug)} />;
      case 'project':
        return <ProjectWindow slug={app.arg ?? ''} />;
      case 'about':
        return <AboutWindow onContact={() => onOpen('contact')} />;
      case 'skills':
        return <SkillsWindow />;
      case 'education':
        return <EducationWindow />;
      case 'contact':
        return <ContactWindow />;
      case 'guestbook':
        return <GuestbookWindow onSign={onSign} />;
      case 'recycle':
        return (
          <div className="y2k-client y2k-client--face">
            <BinList />
          </div>
        );
      case 'winamp':
        return <WinampWindow />;
      case 'resume':
        return <ResumeWindow resume={resume} />;
      case 'help':
        return <HelpWindow platform="mobile" />;
      default:
        return <div className="y2k-client" />;
    }
  };

  return (
    <div className="y2k-ce-app">
      {/*
       * The document title, not the window title: the top bar already names the
       * running program, so this band says what the *file* is — which for a
       * project is its own name rather than the generic MOBILE_TITLES entry.
       * Chrome, so print starts at the content's own heading instead of repeating
       * it.
       */}
      <p className="y2k-ce-app-head" data-chrome>
        <Icon name={app.icon} />
        <span>{app.title}</span>
      </p>

      {content()}
    </div>
  );
};

export default AppFrame;
