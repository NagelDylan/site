/**
 * guestbook.cgi — read-only gag. The entries are fictional and pre-seeded; there is
 * no form, no store and no submission path, so there's nothing to moderate.
 */
type Entry = { who: string; when: string; body: string };

const ENTRIES: Entry[] = [
  {
    who: 'xXx_SkAtEr_BoI_98',
    when: '14 Nov 1999, 11:42 PM',
    body: 'sick page dude. the tank game is the best one. how do u make the enemies chase u like that',
  },
  {
    who: 'webmaster@angelfire',
    when: '02 Dec 1999, 4:07 PM',
    body: 'u NEED a midi on this page. i have a good one. e-mail me and i will send it (2mb sry)',
  },
  {
    who: '56k_survivor',
    when: '18 Dec 1999, 9:15 AM',
    body: 'took four minutes to load on dialup. worth it. tell your mom im on the phone line',
  },
  {
    who: 'Y2K_TRUTHER_JIM',
    when: '01 Jan 2000, 12:03 AM',
    body: 'WE SURVIVED. all my clocks say 1900 but the important thing is we survived',
  },
  {
    who: 'QueenOfHearts_85',
    when: '09 Feb 2000, 7:31 PM',
    body: '~*~ hi from my geocities page ~*~ i signed urs now u sign mine :) :) :)',
  },
  {
    who: 'Netscape_Nate',
    when: '21 Mar 2000, 1:58 PM',
    body: 'does this work in navigator 4. nvm it does. adding u to my webring',
  },
  {
    who: 'mom',
    when: '05 Apr 2000, 6:00 PM',
    body: 'dylan dinner is ready. turn off the computer. i mean it this time',
  },
  {
    who: 'dogsRcool2001',
    when: '30 Jun 2001, 3:22 AM',
    body: 'came here for the word puzzle left with a new opinion about pathfinding. 10/10',
  },
];

const GuestbookWindow = ({ onSign }: { onSign: () => void }) => (
  <div className="y2k-client">
    <h2>SIGN MY GUESTBOOK!!</h2>
    <p style={{ fontSize: 11 }}>
      {ENTRIES.length} entries. Read-only — this guestbook is a museum exhibit, not a
      database. Nothing you type anywhere on this site is stored.
    </p>
    <p>
      <button type="button" className="y2k-btn y2k-btn-lg" onClick={onSign}>
        ✎ SIGN IT!
      </button>
    </p>

    {ENTRIES.map((entry) => (
      <article key={entry.who} className="y2k-guest">
        <div className="y2k-guest-head">{entry.who}</div>
        <div className="y2k-guest-date">{entry.when}</div>
        <p style={{ margin: '5px 0 0' }}>{entry.body}</p>
      </article>
    ))}
  </div>
);

export default GuestbookWindow;
