// Two CV templates, both deliberately plain.
//
// ATS PARSERS ARE THE AUDIENCE FIRST. Applicant tracking systems read a PDF as
// a linear text stream, so the things that make a CV look designed are exactly
// the things that break it: multi-column layouts interleave into nonsense, text
// inside images is invisible, and tables used for layout scramble reading
// order. Both templates are therefore single-column with standard section
// headings ("Work Experience", not "Where I've Been"), because those headings
// are what parsers match on.
//
// The difference between them is typographic weight and rule styling only —
// never structure.

const SECTION_ORDER = ["summary", "experience", "education", "skills", "languages", "references"];

const HEADINGS = {
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Skills",
  languages: "Languages",
  references: "References",
};

const nonEmpty = (v) => (v || "").trim().length > 0;

function ContactLine({ personal }) {
  const bits = [personal?.phone, personal?.email, [personal?.city, personal?.province].filter(nonEmpty).join(", ")]
    .filter(nonEmpty);
  return bits.length ? <p className="cv-contact">{bits.join("  ·  ")}</p> : null;
}

function Body({ cv }) {
  const { personal = {}, summary = {}, education = {}, experience = [], skills = {}, languages = [], references = [] } = cv || {};

  const blocks = {
    summary: nonEmpty(summary.text) && <p className="cv-para">{summary.text}</p>,

    experience: experience.length > 0 && (
      <div className="cv-stack">
        {experience.map((x, i) => (
          <div key={i} className="cv-entry">
            <p className="cv-entry-title">
              {x.title || "Role"}{x.organisation ? ` — ${x.organisation}` : ""}
            </p>
            {(nonEmpty(x.startDate) || nonEmpty(x.endDate)) && (
              <p className="cv-entry-meta">{[x.startDate, x.endDate || "Present"].filter(nonEmpty).join(" – ")}</p>
            )}
            {(x.bullets || []).filter(nonEmpty).length > 0 && (
              <ul className="cv-bullets">
                {x.bullets.filter(nonEmpty).map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    ),

    education: (nonEmpty(education.school) || (education.tertiary || []).length > 0) && (
      <div className="cv-stack">
        {nonEmpty(education.school) && (
          <div className="cv-entry">
            <p className="cv-entry-title">
              National Senior Certificate{nonEmpty(education.matricYear) ? ` (${education.matricYear})` : ""}
            </p>
            <p className="cv-entry-meta">{education.school}</p>
            {(education.subjects || []).length > 0 && (
              <p className="cv-para">
                <span className="cv-label">Subjects: </span>
                {education.subjects.map((s) => (s.mark ? `${s.name} (${s.mark}%)` : s.name)).join(", ")}
              </p>
            )}
          </div>
        )}
        {(education.tertiary || []).map((t, i) => (
          <div key={i} className="cv-entry">
            <p className="cv-entry-title">{t.qualification || "Qualification"}</p>
            <p className="cv-entry-meta">
              {[t.institution, t.year, t.status].filter(nonEmpty).join(" · ")}
            </p>
          </div>
        ))}
      </div>
    ),

    skills: ((skills.hard || []).length > 0 || (skills.soft || []).length > 0) && (
      <div className="cv-stack">
        {(skills.hard || []).length > 0 && (
          <p className="cv-para"><span className="cv-label">Technical: </span>{skills.hard.join(", ")}</p>
        )}
        {(skills.soft || []).length > 0 && (
          <p className="cv-para"><span className="cv-label">Personal: </span>{skills.soft.join(", ")}</p>
        )}
      </div>
    ),

    languages: languages.length > 0 && (
      <p className="cv-para">
        {languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(", ")}
      </p>
    ),

    references: references.length > 0 && (
      <div className="cv-stack">
        {references.map((r, i) => (
          <div key={i} className="cv-entry">
            <p className="cv-entry-title">{r.name || "Referee"}</p>
            <p className="cv-entry-meta">
              {[r.relationship, r.organisation, r.phone, r.email].filter(nonEmpty).join(" · ")}
            </p>
          </div>
        ))}
      </div>
    ),
  };

  return (
    <>
      {SECTION_ORDER.map((key) =>
        blocks[key] ? (
          <section key={key} className="cv-section">
            <h2 className="cv-heading">{HEADINGS[key]}</h2>
            {blocks[key]}
          </section>
        ) : null
      )}
    </>
  );
}

/** Serif, centred header, hairline rules. Reads as a conventional CV. */
export function ClassicTemplate({ cv }) {
  const p = cv?.personal || {};
  return (
    <article className="cv-doc cv-classic">
      <header className="cv-head">
        <h1 className="cv-name">{p.fullName || "Your name"}</h1>
        <ContactLine personal={p} />
      </header>
      <Body cv={cv} />
    </article>
  );
}

/** Sans-serif, left-aligned, heavier headings. Same structure underneath. */
export function ModernTemplate({ cv }) {
  const p = cv?.personal || {};
  return (
    <article className="cv-doc cv-modern">
      <header className="cv-head">
        <h1 className="cv-name">{p.fullName || "Your name"}</h1>
        <ContactLine personal={p} />
      </header>
      <Body cv={cv} />
    </article>
  );
}

export const TEMPLATES = {
  classic: { key: "classic", label: "Classic", blurb: "Serif, centred heading. The safest choice for formal applications.", Component: ClassicTemplate },
  modern: { key: "modern", label: "Modern", blurb: "Sans-serif, left-aligned. Cleaner on screen, equally ATS-safe.", Component: ModernTemplate },
};

export function CvRender({ cv, template = "classic" }) {
  const T = (TEMPLATES[template] || TEMPLATES.classic).Component;
  return <T cv={cv} />;
}
