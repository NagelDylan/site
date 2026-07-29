/**
 * The menu bar (spec §4.4) — this theme's primary navigation and its only piece of
 * permanently visible chrome.
 *
 * WHAT IT READS: `FEATURED` (for the File → Get Info submenu), `THEME_LABELS` and
 * `returnToChooser` from the theme lib, and the window list handed down by
 * App.tsx. It states no fact of its own beyond project *names*, which come from
 * the fact layer (R5).
 *
 * G10 — EVERY window kind on this desktop is reachable from here, including the
 * ones with no desktop icon. That is checked by hand against `WindowKind`:
 *   readme (System → Note Pad, View → Read Me) · work (View) · projects (File) ·
 *   project (File → Get Info ▸) · about (View) · extensions (View, and System →
 *   Control Panels) · system (System → About This Macintosh) · mail (File) ·
 *   scrapbook (System) · trash (View) · quicktime (System) · resume (File, only
 *   when the file exists) · guide (System, Help) · chooser (System → Chooser…,
 *   Edit → Select Another Theme…).
 * If a kind is added to `wm.ts`, it gets an entry here in the same commit.
 *
 * G8/§2 — nobody may be trapped in the theme. The switcher is reachable from the
 * System menu (Chooser… and Control Panels → Themes ▸) *and* from the always-
 * visible Control Strip, and every route to it is a real button in the tab order.
 *
 * THE EDIT MENU IS DELIBERATELY DEAD. Undo/Cut/Copy/Paste/Clear are greyed out
 * because on a Macintosh in 1999 they almost always were, and a menu full of
 * disabled commands is the single most evocative thing about that era's software.
 * They are `aria-disabled` rather than `disabled` so a keyboard visitor can still
 * land on them and hear the joke. Do not make them live.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ThemeId } from "../../data/voice";
import { THEMES } from "../../config";
import { THEME_LABELS, returnToChooser } from "../../lib/theme";
import { FEATURED } from "../../data";
import Icon, { RainbowMark } from "./Icon";
import { useClock, useMenuDismiss } from "./hooks";
import type { OpenRequest, WindowState } from "./wm";

type Props = {
  windows: WindowState[];
  activeId: string | null;
  onOpen: (req: OpenRequest) => void;
  onSelectWindow: (id: string) => void;
  onTheme: (theme: ThemeId) => void;
  onToggleMode: () => void;
  mode: "light" | "dark";
  onShutDown: () => void;
  onToggleBalloons: () => void;
  balloons: boolean;
  resumeAvailable: boolean;
  /**
   * Optional: App.tsx owns the dialog layer, so if it wants Special → Empty Trash…
   * to raise the "are you sure" alert it passes a handler. When it does not, the
   * command still does something honest and useful — it opens the Trash window —
   * rather than looking broken, which §4.4 forbids.
   */
  onEmptyTrash?: () => void;
};

/** One row in a pull-down menu. */
type MenuItem =
  | { type: "sep" }
  | {
      type: "item";
      label: string;
      /** Absent means the command is greyed out. */
      onSelect?: () => void;
      /** Greyed out even though a handler exists (nothing currently needs this). */
      disabled?: boolean;
      /** Renders the Mac's ✓ and reports `aria-checked`. */
      checked?: boolean;
      /** Checkmark is one-of-a-set rather than on/off. */
      radio?: boolean;
      balloon?: string;
    }
  | { type: "sub"; label: string; items: MenuItem[]; balloon?: string };

type Menu = {
  id: string;
  /** Accessible name; also the visible text unless `mark` is set. */
  label: string;
  /** The System menu shows the rainbow lozenge instead of a word (§2). */
  mark?: boolean;
  items: MenuItem[];
};

/** Only these three roles may carry `aria-checked`, so pick the right one. */
const roleFor = (item: Extract<MenuItem, { type: "item" }>) =>
  item.checked === undefined
    ? "menuitem"
    : item.radio
      ? "menuitemradio"
      : "menuitemcheckbox";

/**
 * The focusable rows of one menu, direct children only.
 *
 * `:scope >` matters: a menu containing an open submenu would otherwise report the
 * submenu's rows as its own, and Arrow-Down would walk out of the list it is
 * supposed to be walking.
 */
const rowsIn = (list: HTMLElement): HTMLElement[] =>
  Array.from(
    list.querySelectorAll<HTMLElement>(':scope > li > [role^="menuitem"]'),
  );

function moveWithin(
  list: HTMLElement,
  current: HTMLElement,
  to: number | "home" | "end",
): void {
  const rows = rowsIn(list);
  if (rows.length === 0) return;
  let next: number;
  if (to === "home") next = 0;
  else if (to === "end") next = rows.length - 1;
  else {
    const i = rows.indexOf(current);
    next = (i + to + rows.length) % rows.length;
  }
  rows[next]?.focus();
}

/**
 * A pull-down menu, rendered recursively so the hierarchical `Control Panels ▸`
 * and `Get Info ▸` menus are the same code as a flat one.
 *
 * Declared at module scope on purpose. Defined inside MenuBar it would be a new
 * component type on every render, so React would unmount the open submenu the
 * instant MenuBar's own state changed and throw keyboard focus away with it — the
 * exact bug the Y2K taskbar's `Sub` comment describes.
 */
const MenuList = ({
  menuKey,
  label,
  items,
  openSub,
  onOpenSub,
  onKeyDown,
  className,
}: {
  menuKey: string;
  label: string;
  items: MenuItem[];
  openSub: string | null;
  onOpenSub: (key: string | null) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
  className: string;
}) => (
  <ul className={className} role="menu" aria-label={label} data-menu={menuKey}>
    {items.map((item, i) => {
      if (item.type === "sep") {
        // A real separator, never a text row of dashes: a screen reader should not
        // read "em dash em dash em dash".
        return (
          <li className="mac-menu-sep" role="separator" key={`sep-${i}`} />
        );
      }

      if (item.type === "sub") {
        const key = `${menuKey}/${item.label}`;
        const open = openSub === key;
        return (
          <li
            className="mac-menu-row"
            role="none"
            key={item.label}
            onPointerEnter={() => onOpenSub(key)}
          >
            <button
              type="button"
              className="mac-menu-item"
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={open}
              data-sub="true"
              data-open={open || undefined}
              data-balloon={item.balloon}
              onClick={() => onOpenSub(open ? null : key)}
              onKeyDown={onKeyDown}
            >
              <span className="mac-menu-label">{item.label}</span>
              <span
                className="mac-menu-arrow"
                aria-hidden="true"
                data-decorative
              />
            </button>
            {open ? (
              <MenuList
                menuKey={key}
                label={item.label}
                items={item.items}
                openSub={openSub}
                onOpenSub={onOpenSub}
                onKeyDown={onKeyDown}
                className="mac-submenu"
              />
            ) : null}
          </li>
        );
      }

      const dead = item.disabled || !item.onSelect;
      return (
        <li className="mac-menu-row" role="none" key={item.label}>
          <button
            type="button"
            className="mac-menu-item"
            role={roleFor(item)}
            // aria-disabled, not `disabled`: a dead command stays in the tab order
            // so keyboard visitors meet the same greyed-out menu everyone else does.
            aria-disabled={dead || undefined}
            aria-checked={item.checked}
            data-dead={dead || undefined}
            data-balloon={item.balloon}
            onClick={() => {
              if (dead) return;
              item.onSelect?.();
            }}
            onKeyDown={onKeyDown}
          >
            <span className="mac-menu-check" aria-hidden="true" data-decorative>
              {item.checked ? "✓" : ""}
            </span>
            <span className="mac-menu-label">{item.label}</span>
          </button>
        </li>
      );
    })}
  </ul>
);

const MenuBar = ({
  windows,
  activeId,
  onOpen,
  onSelectWindow,
  onTheme,
  onToggleMode,
  mode,
  onShutDown,
  onToggleBalloons,
  balloons,
  resumeAvailable,
  onEmptyTrash,
}: Props) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const clock = useClock();
  /** True only for keyboard-initiated opens; a hover must not steal focus. */
  const focusOnOpen = useRef(false);

  const close = useCallback(() => {
    setOpenMenu(null);
    setOpenSub(null);
  }, []);

  // Outside pointerdown or Escape closes. Passing null while nothing is open keeps
  // the two document listeners off the page for most of the visit.
  const rootRef = useMenuDismiss<HTMLDivElement>(openMenu ? close : null);

  /** Opening a menu with the keyboard drops focus onto its first row. */
  useEffect(() => {
    if (!openMenu || !focusOnOpen.current) return;
    focusOnOpen.current = false;
    const list = rootRef.current?.querySelector<HTMLElement>(
      `[data-menu="${openMenu}"]`,
    );
    if (list) rowsIn(list)[0]?.focus();
  }, [openMenu, rootRef]);

  const titles = useCallback(
    (): HTMLElement[] =>
      Array.from(
        rootRef.current?.querySelectorAll<HTMLElement>(
          '[role="menubar"] > li > button[role="menuitem"]:not([disabled])',
        ) ?? [],
      ),
    [rootRef],
  );

  /** Slide sideways to the next/previous menu title, keeping the pull-down open. */
  const stepMenu = useCallback(
    (from: string, delta: number) => {
      const buttons = titles();
      const i = buttons.findIndex((b) => b.dataset.menuTitle === from);
      if (i < 0) return;
      const next = buttons[(i + delta + buttons.length) % buttons.length];
      const id = next?.dataset.menuTitle;
      if (!next || !id) return;
      setOpenSub(null);
      focusOnOpen.current = true;
      setOpenMenu(id);
    },
    [titles],
  );

  /** Keyboard model for the menu titles themselves (the `role="menubar"` row). */
  const onTitleKeyDown =
    (id: string) => (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        focusOnOpen.current = true;
        setOpenMenu(id);
        return;
      }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const buttons = titles();
        const i = buttons.findIndex((b) => b.dataset.menuTitle === id);
        const next =
          buttons[
            (i + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) %
              buttons.length
          ];
        if (!next) return;
        next.focus();
        // Classic behaviour: once something is pulled down, moving sideways pulls the
        // next one down too.
        if (openMenu && next.dataset.menuTitle) {
          setOpenSub(null);
          setOpenMenu(next.dataset.menuTitle);
        }
        return;
      }
      if (event.key === "Escape") close();
    };

  /**
   * Keyboard model inside a pull-down. Enter and Space need no handling: these are
   * real `<button>`s, so the browser already turns both into a click.
   */
  const onRowKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const row = event.currentTarget;
    const list = row.closest<HTMLElement>('ul[role="menu"]');
    if (!list) return;
    const menuKey = list.dataset.menu ?? "";
    const inSub = menuKey.includes("/");

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveWithin(list, row, 1);
        return;
      case "ArrowUp":
        event.preventDefault();
        moveWithin(list, row, -1);
        return;
      case "Home":
        event.preventDefault();
        moveWithin(list, row, "home");
        return;
      case "End":
        event.preventDefault();
        moveWithin(list, row, "end");
        return;
      case "ArrowRight": {
        event.preventDefault();
        // On a hierarchical row, open the submenu and step into it. Otherwise fall
        // through to the next menu along, which is what APG expects.
        if (row.dataset.sub === "true") {
          const key = `${menuKey}/${row.querySelector(".mac-menu-label")?.textContent ?? ""}`;
          setOpenSub(key);
          // The submenu does not exist yet this tick; focus it once React has drawn
          // it. rAF rather than a timeout so it lands in the same frame as paint.
          requestAnimationFrame(() => {
            const sub = rootRef.current?.querySelector<HTMLElement>(
              `[data-menu="${key}"]`,
            );
            if (sub) rowsIn(sub)[0]?.focus();
          });
          return;
        }
        stepMenu(menuKey.split("/")[0] ?? "", 1);
        return;
      }
      case "ArrowLeft": {
        event.preventDefault();
        if (inSub) {
          const parentKey = menuKey.slice(0, menuKey.lastIndexOf("/"));
          setOpenSub(null);
          const parent = rootRef.current?.querySelector<HTMLElement>(
            `[data-menu="${parentKey}"] > li > [data-sub="true"]`,
          );
          parent?.focus();
          return;
        }
        stepMenu(menuKey, -1);
        return;
      }
      case "Escape": {
        event.preventDefault();
        const title = rootRef.current?.querySelector<HTMLElement>(
          `[data-menu-title="${menuKey.split("/")[0]}"]`,
        );
        close();
        title?.focus();
        return;
      }
      default:
        return;
    }
  };

  /** Run a command and put the menu away, which is what a real menu does. */
  const run = (fn: () => void) => () => {
    close();
    fn();
  };
  const go = (req: OpenRequest) => run(() => onOpen(req));

  const activeWindow = windows.find((w) => w.id === activeId) ?? null;

  const MENUS: Menu[] = [
    {
      id: "system",
      // §2, TRADEMARK: this is an abstract six-stripe rainbow lozenge and it is
      // deliberately NOT fruit-shaped. There is no apple silhouette anywhere in
      // this theme, and its accessible name is "System menu", never "Apple menu".
      label: "System menu",
      mark: true,
      items: [
        {
          type: "item",
          label: "About This Macintosh",
          onSelect: go({ kind: "system" }),
          balloon:
            "Shows where Dylan studies, what he has taken, and when he finishes.",
        },
        {
          type: "item",
          label: "Macintosh Guide",
          onSelect: go({ kind: "guide" }),
          balloon:
            "Explains how this desktop works, in case anything here is unfamiliar.",
        },
        { type: "sep" },
        {
          type: "item",
          label: "Chooser…",
          onSelect: go({ kind: "chooser" }),
          balloon:
            "The Chooser lists the ways this site can look. Pick one and it changes at once.",
        },
        {
          type: "sub",
          label: "Control Panels",
          balloon:
            "The control panels change how the desktop looks and what is loaded.",
          items: [
            {
              type: "item",
              label:
                mode === "dark"
                  ? "Appearance… (Graphite)"
                  : "Appearance… (Platinum)",
              onSelect: run(onToggleMode),
              balloon:
                "Switches between the light Platinum appearance and the darker graphite one.",
            },
            {
              type: "item",
              label: "Extensions Manager",
              onSelect: go({ kind: "extensions" }),
              balloon:
                "Lists the languages, frameworks and tools Dylan works with.",
            },
            /**
             * Themes lives under Control Panels because §2 requires the theme
             * switcher to be reachable from the System menu, and because a control
             * panel is exactly where a Mac from this era would have put it.
             */
            {
              type: "sub",
              label: "Themes",
              balloon: "The same facts, presented three different ways.",
              // From THEMES in config.ts, so a hidden theme disappears from this
              // menu without an edit here.
              items: THEMES.map((theme) => ({
                type: "item" as const,
                label: THEME_LABELS[theme],
                checked: theme === "mac",
                radio: true,
                onSelect: run(() => onTheme(theme)),
              })),
            },
          ],
        },
        { type: "sep" },
        {
          type: "item",
          label: "Scrapbook",
          onSelect: go({ kind: "scrapbook" }),
          balloon: "A few pages of notes kept in the spirit of a guest book.",
        },
        {
          type: "item",
          label: "Note Pad",
          onSelect: go({ kind: "readme" }),
          balloon: "Opens the Read Me, which is the best place to start.",
        },
        {
          type: "item",
          label: "QuickTime Player",
          onSelect: go({ kind: "quicktime" }),
          balloon:
            "A period-correct player, holding a netlabel collection of about the same age.",
        },
      ],
    },
    {
      id: "file",
      label: "File",
      items: [
        {
          type: "item",
          label: "Open Projects",
          onSelect: go({ kind: "projects" }),
          balloon:
            "Opens the Projects folder as a list, the way the Finder would.",
        },
        {
          type: "item",
          label: "New Message…",
          onSelect: go({ kind: "mail" }),
          balloon:
            "Opens a compose window that sends to Dylan, and says honestly whether it arrived.",
        },
        {
          type: "sub",
          label: "Get Info",
          balloon: "Get Info opens the full description of one project.",
          items: FEATURED.map((project) => ({
            type: "item" as const,
            label: project.name,
            onSelect: go({
              kind: "project",
              arg: project.slug,
              title: `${project.name} Info`,
            }),
          })),
        },
        { type: "sep" },
        {
          type: "item",
          label: "Print…",
          // Genuinely correct, and the joke is that it works: print.css strips the
          // chrome and the desk, and what comes out is a plain document (G15).
          onSelect: run(() => window.print()),
          balloon:
            "Printing gives you a plain document. The desktop and the menus are left behind.",
        },
        // §13: the résumé is only ever offered when the file really exists.
        ...(resumeAvailable
          ? [
              {
                type: "item" as const,
                label: "Résumé.pdf",
                onSelect: go({ kind: "resume" }),
                // Not "a file you can download": the window shows the document now,
                // and the balloon has to describe what the command actually does.
                balloon:
                  "Opens the résumé in a window and shows it. Saving the file is a button inside.",
              },
            ]
          : []),
      ],
    },
    {
      id: "edit",
      label: "Edit",
      items: [
        {
          type: "item",
          label: "Undo",
          balloon:
            "Nothing on this desktop can be changed, so there is nothing to undo.",
        },
        { type: "sep" },
        { type: "item", label: "Cut" },
        { type: "item", label: "Copy" },
        { type: "item", label: "Paste" },
        { type: "item", label: "Clear" },
        { type: "sep" },
        {
          type: "item",
          label: "Select Another Theme…",
          onSelect: go({ kind: "chooser" }),
          balloon:
            "The one command in this menu that does something. It opens the Chooser.",
        },
      ],
    },
    {
      id: "view",
      label: "View",
      items: [
        {
          type: "item",
          label: "as Icons",
          checked: false,
          radio: true,
          balloon:
            "The Projects folder is shown as a list, because the columns carry more of the story.",
        },
        {
          type: "item",
          label: "as List",
          checked: true,
          radio: true,
          onSelect: go({ kind: "projects" }),
          balloon:
            "Brings the Projects folder forward, where every project is one row.",
        },
        { type: "sep" },
        {
          type: "item",
          label: "Read Me",
          onSelect: go({ kind: "readme" }),
          balloon:
            "A short document introducing Dylan and the rest of this desktop.",
        },
        {
          type: "item",
          label: "Work History",
          onSelect: go({ kind: "work" }),
          balloon: "Every role, in order, with what was built in each one.",
        },
        {
          type: "item",
          label: "About Dylan Nagel",
          onSelect: go({ kind: "about" }),
          balloon:
            "The longer introduction, with a portrait and a way to get in touch.",
        },
        {
          type: "item",
          label: "Extensions Manager",
          onSelect: go({ kind: "extensions" }),
          balloon:
            "Lists the languages, frameworks and tools Dylan works with.",
        },
        {
          type: "item",
          label: "Trash",
          onSelect: go({ kind: "trash" }),
          balloon: "Older work, kept rather than thrown away.",
        },
      ],
    },
    {
      id: "special",
      label: "Special",
      items: [
        {
          type: "item",
          label: "Empty Trash…",
          onSelect: run(onEmptyTrash ?? (() => onOpen({ kind: "trash" }))),
          balloon:
            "Ask to empty the Trash and you will be told, politely, that the old projects are staying.",
        },
        { type: "sep" },
        {
          type: "item",
          label: "Restart",
          // Restart is the honest, working version of itself: it clears the stored
          // choice and returns to the chooser, which is where a restart of this site
          // genuinely begins.
          onSelect: run(returnToChooser),
          balloon:
            "Restart takes you back to the screen where you chose how this site should look.",
        },
        {
          type: "item",
          label: "Shut Down",
          onSelect: run(onShutDown),
          balloon:
            "Choose this and the Macintosh will fail dramatically on purpose. Your own computer is fine.",
        },
      ],
    },
    {
      id: "help",
      label: "Help",
      items: [
        {
          type: "item",
          label: balloons ? "Hide Balloons" : "Show Balloons",
          checked: balloons,
          onSelect: run(onToggleBalloons),
          balloon:
            "With balloons showing, resting the pointer on something explains what it does.",
        },
        {
          type: "item",
          label: "Macintosh Guide",
          onSelect: go({ kind: "guide" }),
          balloon:
            "Explains how this desktop works, in case anything here is unfamiliar.",
        },
        { type: "sep" },
        {
          type: "item",
          label: "About This Site",
          onSelect: go({ kind: "guide" }),
          balloon: "What this desktop is, and why it looks like this.",
        },
      ],
    },
  ];

  return (
    <div ref={rootRef} className="mac-menubar-root">
      <nav className="mac-menubar" data-chrome aria-label="Macintosh menu bar">
        <ul
          className="mac-menubar-list"
          role="menubar"
          aria-label="Macintosh menu bar"
        >
          {MENUS.map((menu) => {
            const open = openMenu === menu.id;
            return (
              <li
                className="mac-menubar-item"
                role="none"
                key={menu.id}
                // Classic Mac: once a menu is pulled down, sliding sideways over
                // another title pulls that one down instead.
                onPointerEnter={() => {
                  if (openMenu && openMenu !== menu.id) {
                    setOpenSub(null);
                    setOpenMenu(menu.id);
                  }
                }}
              >
                <button
                  type="button"
                  className={
                    menu.mark
                      ? "mac-menu-title mac-menu-title--mark"
                      : "mac-menu-title"
                  }
                  role="menuitem"
                  aria-haspopup="true"
                  aria-expanded={open}
                  aria-label={menu.mark ? menu.label : undefined}
                  data-menu-title={menu.id}
                  data-open={open || undefined}
                  data-balloon={
                    menu.mark
                      ? "The System menu holds the control panels, the desk accessories and the Chooser."
                      : undefined
                  }
                  onClick={() => {
                    setOpenSub(null);
                    setOpenMenu(open ? null : menu.id);
                  }}
                  onKeyDown={onTitleKeyDown(menu.id)}
                >
                  {menu.mark ? <RainbowMark /> : menu.label}
                </button>
                {open ? (
                  <MenuList
                    menuKey={menu.id}
                    label={menu.label}
                    items={menu.items}
                    openSub={openSub}
                    onOpenSub={setOpenSub}
                    onKeyDown={onRowKeyDown}
                    className="mac-menu"
                  />
                ) : null}
              </li>
            );
          })}

          <li
            className="mac-menubar-spacer"
            role="none"
            aria-hidden="true"
            data-decorative
          />

          <li className="mac-menubar-item mac-menubar-item--clock" role="none">
            <span
              className="mac-clock"
              data-balloon="The menu-bar clock. It shows the day and the time on your own computer."
            >
              {clock}
            </span>
          </li>

          {/*
            The Application menu. On a real Macintosh this is how you moved between
            open programs; here it moves between open windows, which is this theme's
            answer to the Y2K taskbar. Picking a window un-rolls its shade and brings
            it forward, so a collapsed window is never lost.
          */}
          <li className="mac-menubar-item mac-menubar-item--app" role="none">
            <button
              type="button"
              className="mac-appmenu-title"
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={openMenu === "apps"}
              disabled={windows.length === 0}
              data-menu-title="apps"
              data-open={openMenu === "apps" || undefined}
              data-balloon="Lists every open window. Choose one to bring it to the front."
              onClick={() => {
                setOpenSub(null);
                setOpenMenu(openMenu === "apps" ? null : "apps");
              }}
              onKeyDown={onTitleKeyDown("apps")}
            >
              <Icon name={activeWindow ? activeWindow.icon : "happymac"} />
              <span className="mac-appmenu-label">
                {activeWindow ? activeWindow.title : "Finder"}
              </span>
            </button>
            {openMenu === "apps" && windows.length > 0 ? (
              <MenuList
                menuKey="apps"
                label="Open windows"
                items={windows.map((win) => ({
                  type: "item" as const,
                  label: win.title,
                  checked: win.id === activeId,
                  radio: true,
                  onSelect: run(() => onSelectWindow(win.id)),
                }))}
                openSub={openSub}
                onOpenSub={setOpenSub}
                onKeyDown={onRowKeyDown}
                className="mac-menu mac-menu--apps"
              />
            ) : null}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default MenuBar;
