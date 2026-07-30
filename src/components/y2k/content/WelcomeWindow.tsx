/** Welcome.htm — the hero, framed as a Netscape window. */
import { IDENTITY, SOCIALS } from "../../../data";
import { COPY } from "../../../data/copy";
import { Blink, RainbowRule } from "../deco";
import type { Resume } from "../wm";

type Props = {
  onOpen: (
    kind:
      "projects" | "contact" | "about" | "experience" | "guestbook" | "resume",
  ) => void;
  resume: Resume;
};

const WelcomeWindow = ({ onOpen, resume }: Props) => (
  <div className="y2k-client">
    <p style={{ textAlign: "center", fontWeight: 700 }} className="y2k-rainbow">
      {COPY.greeting}
    </p>
    <h2 style={{ textAlign: "center" }}>{IDENTITY.name}</h2>
    <p style={{ textAlign: "center" }}>
      <strong>{IDENTITY.headline}</strong>
      <br />
      {IDENTITY.location}
    </p>
    <p style={{ textAlign: "center" }}>
      <span className="y2k-avail">
        <Blink>★</Blink> {IDENTITY.availability.toUpperCase()} <Blink>★</Blink>
      </span>
    </p>

    <RainbowRule />

    <p>{COPY.heroSub}</p>

    <div
      style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0" }}
    >
      <button
        type="button"
        className="y2k-btn y2k-btn-lg"
        onClick={() => onOpen("projects")}
      >
        {COPY.ctaPrimary}
      </button>
      <button
        type="button"
        className="y2k-btn y2k-btn-lg"
        onClick={() => onOpen("contact")}
      >
        {COPY.ctaSecondary}
      </button>
      <button
        type="button"
        className="y2k-btn"
        onClick={() => onOpen("experience")}
      >
        {COPY.headings.experience}
      </button>
      <button type="button" className="y2k-btn" onClick={() => onOpen("about")}>
        {COPY.headings.about}
      </button>
    </div>

    {/* Both buttons only exist when the PDF does. Read opens the in-desktop
        viewer; download is the plain escape hatch for anyone who just wants the file. */}
    {resume.available ? (
      <p style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button
          type="button"
          className="y2k-btn"
          onClick={() => onOpen("resume")}
        >
          📄 READ MY RÉSUMÉ RIGHT HERE
        </button>
        <a className="y2k-btn" href={resume.href} download={resume.filename}>
          💾 DOWNLOAD MY RÉSUMÉ (.pdf)
        </a>
      </p>
    ) : null}

    <RainbowRule />

    <p
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
      }}
    >
      <a href={SOCIALS.github} target="_blank" rel="noreferrer noopener">
        GitHub
      </a>
      <span aria-hidden="true">•</span>
      <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer noopener">
        LinkedIn
      </a>
      <span aria-hidden="true">•</span>
      <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a>
      <span aria-hidden="true">•</span>
      <button
        type="button"
        className="y2k-btn"
        onClick={() => onOpen("guestbook")}
      >
        SIGN MY GUESTBOOK
      </button>
    </p>
  </div>
);

export default WelcomeWindow;
