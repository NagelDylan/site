/**
 * C:\Projects\ — the file-explorer window.
 *
 * Three folders: featured projects, secondary ones, and the Recycle Bin gag.
 * Featured projects open their own window; secondary ones are a details list,
 * because a one-liner and a repo link do not need a window each.
 *
 * The bin renders RECYCLE_BIN exactly and nothing else; anything left out of that
 * list is left out on purpose.
 */
import { useState } from 'react';
import { FEATURED, RECYCLE_BIN, SECONDARY } from '../../../data';
import Icon from '../Icon';

type Folder = 'featured' | 'secondary' | 'bin';

const FOLDERS: { id: Folder; label: string }[] = [
  { id: 'featured', label: 'Featured\\' },
  { id: 'secondary', label: 'Old But Gold\\' },
  { id: 'bin', label: 'Recycle Bin' },
];

const ProjectsExplorer = ({ onOpenProject }: { onOpenProject: (slug: string) => void }) => {
  const [folder, setFolder] = useState<Folder>('featured');

  const count =
    folder === 'featured' ? FEATURED.length : folder === 'secondary' ? SECONDARY.length : RECYCLE_BIN.length;

  return (
    <>
      <div className="y2k-client y2k-client--face" style={{ padding: 3 }}>
        <div className="y2k-explorer">
          <nav className="y2k-in y2k-tree" aria-label="Folders">
            <button type="button" data-selected={false} onClick={() => setFolder('featured')}>
              <Icon name="pc" /> My Computer
            </button>
            <ul>
              <li>
                <button type="button" data-selected={false} onClick={() => setFolder('featured')}>
                  <Icon name="folderOpen" /> C:\Projects\
                </button>
                <ul>
                  {FOLDERS.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        data-selected={folder === entry.id}
                        onClick={() => setFolder(entry.id)}
                      >
                        <Icon name={entry.id === 'bin' ? 'trash' : 'folder'} /> {entry.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>

          <div className="y2k-in" style={{ overflow: 'auto' }}>
            {folder === 'featured' ? (
              <div className="y2k-filegrid">
                {FEATURED.map((project) => (
                  <button
                    key={project.slug}
                    type="button"
                    className="y2k-file"
                    onClick={() => onOpenProject(project.slug)}
                    onDoubleClick={() => onOpenProject(project.slug)}
                    title={project.summary}
                  >
                    <Icon name="doc" />
                    <span>
                      {project.name}
                      <br />
                      <small>.exe</small>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            {folder === 'secondary' ? (
              <div style={{ padding: '10px 12px' }}>
                <h3 style={{ marginTop: 0 }}>OLD BUT GOLD</h3>
                <p style={{ fontSize: 11 }}>
                  Mostly C# and MonoGame, mostly built for the fun of building them. Repo links below.
                </p>
                {SECONDARY.map((project) => (
                  <article key={project.name} style={{ marginBottom: 12 }}>
                    <strong>{project.name}</strong>
                    <p style={{ margin: '2px 0 4px' }}>{project.oneLiner}</p>
                    <p style={{ margin: 0, fontSize: 11 }}>
                      {project.stack.join(' · ')}
                      {' — '}
                      {project.links.map((link, index) => (
                        <span key={link.href}>
                          {index > 0 ? ' · ' : ''}
                          <a href={link.href} target="_blank" rel="noreferrer noopener">
                            {link.label}
                          </a>
                        </span>
                      ))}
                    </p>
                  </article>
                ))}
              </div>
            ) : null}

            {folder === 'bin' ? <BinList /> : null}
          </div>
        </div>
      </div>
      <div className="y2k-statusbar" data-chrome>
        <div>{count} object(s)</div>
        <div>C:\Projects\</div>
      </div>
    </>
  );
};

/** The Recycle Bin gag: names only, no links and no descriptions. */
export const BinList = () => (
  <div style={{ padding: '10px 12px' }}>
    <h3 style={{ marginTop: 0 }}>RECYCLE BIN</h3>
    <p>these didn&apos;t make the cut :)</p>
    <div className="y2k-filegrid" style={{ padding: '4px 0' }}>
      {RECYCLE_BIN.map((name) => (
        <div key={name} className="y2k-file" style={{ opacity: 0.72 }}>
          <Icon name="file" />
          <span>{name}</span>
        </div>
      ))}
    </div>
    <p style={{ fontSize: 11 }}>
      Restore is greyed out. They are in here for a reason and the reason is taste.
    </p>
    <button type="button" className="y2k-btn" disabled>
      Restore all items
    </button>
  </div>
);

export default ProjectsExplorer;
