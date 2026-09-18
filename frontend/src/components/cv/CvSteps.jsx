// The six wizard steps. Split from CvWizard so the orchestration (autosave,
// preview, export) stays readable separately from the forms.

import { useState } from 'react';
import {
  Plus, Trash2, Sparkles, Lightbulb, ChevronDown, Check, Briefcase, Star, AlertTriangle,
} from 'lucide-react';
import {
  ACTION_VERBS, VERB_CATEGORY_LABEL, BULLET_PATTERNS, SUMMARY_PROMPTS,
  EXPERIENCE_PROMPTS, SOFT_SKILLS, HARD_SKILL_GROUPS, SA_LANGUAGES,
  LANGUAGE_LEVELS, REFERENCE_GUIDANCE,
} from '../../data/cvAssistant';
import { occById } from '../../data/occupations';
import { SUBJECT_LABELS } from '../../data/subjects';
import { Pill } from '../ui/Pill';
import { SectionTitle } from '../ui/SectionTitle';

const input =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 " +
  "placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37";

function Field({ label, hint, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-slate-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[10px] leading-relaxed text-slate-600">{hint}</p>}
    </div>
  );
}

function Text({ id, value, onChange, placeholder, type = "text", inputMode }) {
  return (
    <input id={id} type={type} inputMode={inputMode} value={value || ""} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)} className={input} />
  );
}

/** Collapsible helper panel — advice should be available, not in the way. */
function Helper({ title, icon: Icon = Lightbulb, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
        className="flex w-full items-center gap-2 p-3 text-left">
        <Icon className="h-4 w-4 shrink-0 k-tx-6B5307" />
        <span className="flex-1 text-xs font-semibold text-slate-900">{title}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-slate-200 p-3">{children}</div>}
    </div>
  );
}

/* ---------------- Step 1: personal and contact ---------------- */
export function StepPersonal({ cv, patch }) {
  const p = cv.personal || {};
  const set = (k) => (v) => patch({ personal: { ...p, [k]: v } });

  return (
    <div className="space-y-4">
      <p className="rounded-xl k-bg-E7F4EE p-3 text-[11px] leading-relaxed k-tx-005A36">
        An employer who cannot reach you cannot hire you. Check the phone number twice — a wrong digit here
        costs more interviews than a weak summary ever will.
      </p>

      <Field label="Full name" id="cv-name" hint="As it appears on your ID document.">
        <Text id="cv-name" value={p.fullName} onChange={set("fullName")} placeholder="Thandi Mokoena" />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Phone number" id="cv-phone" hint="The number you actually answer.">
          <Text id="cv-phone" value={p.phone} onChange={set("phone")} inputMode="tel" placeholder="071 234 5678" />
        </Field>
        <Field label="Email address" id="cv-email" hint="Use a plain name-based address, not a nickname.">
          <Text id="cv-email" value={p.email} onChange={set("email")} type="email" placeholder="thandi.mokoena@gmail.com" />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Town or city" id="cv-city">
          <Text id="cv-city" value={p.city} onChange={set("city")} placeholder="Soweto" />
        </Field>
        <Field label="Province" id="cv-province">
          <Text id="cv-province" value={p.province} onChange={set("province")} placeholder="Gauteng" />
        </Field>
      </div>

      <Field label="Driver's licence (optional)" id="cv-licence"
        hint="Worth listing even as a learner's licence — many entry-level jobs ask.">
        <Text id="cv-licence" value={p.driversLicence} onChange={set("driversLicence")} placeholder="Code B, or Learner's" />
      </Field>

      <p className="rounded-xl k-bg-FBF5E7 p-3 text-[11px] leading-relaxed k-tx-6B5307">
        Do not put your ID number, date of birth, marital status or a photo on a CV you send out. South African
        employers do not need them to shortlist you, and they invite discrimination.
      </p>
    </div>
  );
}

/* ---------------- Step 2: summary ---------------- */
export function StepSummary({ cv, patch, learner }) {
  const text = cv.summary?.text || "";
  const province = cv.personal?.province || learner?.province || "your province";

  return (
    <div className="space-y-4">
      <Field label="Professional summary" id="cv-summary"
        hint="Two lines. Who you are, and what you want to do next.">
        <textarea id="cv-summary" rows={5} value={text}
          onChange={(e) => patch({ summary: { text: e.target.value } })}
          placeholder="A Grade 12 learner from Soweto with strong Mathematics and Physical Sciences marks, looking for an apprenticeship in electrical engineering while studying part-time."
          className={input} />
      </Field>
      <div className="flex items-start justify-between gap-3">
        {/* An opener pasted with its blanks left in is the most likely way this
            feature embarrasses a learner, so it is called out here rather than
            only counted in the score. */}
        {/\{[^}]+\}/.test(text) ? (
          <p className="flex items-start gap-1.5 text-[10px] leading-relaxed k-tx-9B1C14">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            Still to fill in: {(text.match(/\{[^}]+\}/g) || []).join(", ")}. Replace these before you send the CV.
          </p>
        ) : <span />}
        <p className="shrink-0 text-[10px] text-slate-600">{text.trim().length} characters</p>
      </div>

      <Helper title="Not sure how to start? Use an opener" icon={Sparkles}>
        <p className="mb-2 text-[11px] leading-relaxed text-slate-600">
          Tap one to drop it in, then replace the parts in braces with your own details.
        </p>
        <div className="space-y-2">
          {SUMMARY_PROMPTS.map((s) => {
            const filled = s.replace("{province}", province);
            return (
              <button key={s} type="button"
                onClick={() => patch({ summary: { text: text ? `${text.trim()} ${filled}` : filled } })}
                className="w-full rounded-lg bg-white p-2.5 text-left text-[11px] leading-relaxed text-slate-700 ring-1 ring-slate-200">
                {filled}
              </button>
            );
          })}
        </div>
      </Helper>
    </div>
  );
}

/* ---------------- Step 3: education ---------------- */
export function StepEducation({ cv, patch, learner, subjects }) {
  const e = cv.education || {};
  const set = (k) => (v) => patch({ education: { ...e, [k]: v } });
  const rows = e.subjects || [];

  const pullFromProfile = () => {
    const mapped = (subjects || []).map((s) => ({ name: s.label || SUBJECT_LABELS[s.key] || s.key, mark: String(s.pct ?? "") }));
    patch({
      education: {
        ...e,
        school: e.school || learner?.school || "",
        matricYear: e.matricYear || (learner?.grade ? String(new Date().getFullYear() + (12 - learner.grade)) : ""),
        subjects: mapped.length ? mapped : rows,
      },
    });
  };

  return (
    <div className="space-y-4">
      {(subjects || []).length > 0 && (
        <button type="button" onClick={pullFromProfile}
          className="flex w-full items-center gap-3 rounded-xl border border-dashed k-bd-00784A k-bg-E7F4EE p-3 text-left">
          <Sparkles className="h-4 w-4 shrink-0 k-tx-005A36" />
          <span className="flex-1 text-xs font-semibold k-tx-005A36">
            Fill in from your Khetha profile
          </span>
          <span className="text-[10px] text-slate-600">{subjects.length} subjects</span>
        </button>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="School" id="cv-school">
          <Text id="cv-school" value={e.school} onChange={set("school")} placeholder="Morris Isaacson High School" />
        </Field>
        <Field label="Matric year" id="cv-matric" hint="The year you finish or finished.">
          <Text id="cv-matric" value={e.matricYear} onChange={set("matricYear")} inputMode="numeric" placeholder="2026" />
        </Field>
      </div>

      <div>
        <SectionTitle hint="Employers read these">Subjects and marks</SectionTitle>
        <div className="space-y-2">
          {rows.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input aria-label={`Subject ${i + 1}`} value={s.name || ""} placeholder="Mathematics"
                onChange={(ev) => set("subjects")(rows.map((r, j) => j === i ? { ...r, name: ev.target.value } : r))}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
              <input aria-label={`Mark for subject ${i + 1}`} value={s.mark || ""} placeholder="%" inputMode="numeric"
                onChange={(ev) => set("subjects")(rows.map((r, j) => j === i ? { ...r, mark: ev.target.value.replace(/\D/g, "").slice(0, 3) } : r))}
                className="w-16 rounded-xl border border-slate-200 bg-white px-2 py-2 text-center text-xs text-slate-900 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
              <button type="button" aria-label={`Remove subject ${i + 1}`}
                onClick={() => set("subjects")(rows.filter((_, j) => j !== i))}
                className="shrink-0 text-slate-400"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => set("subjects")([...rows, { name: "", mark: "" }])}
          className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold k-tx-005A36">
          <Plus className="h-3.5 w-3.5" />Add subject
        </button>
      </div>

      <div>
        <SectionTitle hint="Only if you have started">After school</SectionTitle>
        <div className="space-y-2.5">
          {(e.tertiary || []).map((t, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <input aria-label="Qualification" value={t.qualification || ""} placeholder="Diploma in IT"
                  onChange={(ev) => set("tertiary")((e.tertiary || []).map((r, j) => j === i ? { ...r, qualification: ev.target.value } : r))}
                  className={input} />
                <input aria-label="Institution" value={t.institution || ""} placeholder="Tshwane University of Technology"
                  onChange={(ev) => set("tertiary")((e.tertiary || []).map((r, j) => j === i ? { ...r, institution: ev.target.value } : r))}
                  className={input} />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input aria-label="Year" value={t.year || ""} placeholder="2027" inputMode="numeric"
                  onChange={(ev) => set("tertiary")((e.tertiary || []).map((r, j) => j === i ? { ...r, year: ev.target.value } : r))}
                  className={`${input} mt-0`} />
                <select aria-label="Status" value={t.status || "In progress"}
                  onChange={(ev) => set("tertiary")((e.tertiary || []).map((r, j) => j === i ? { ...r, status: ev.target.value } : r))}
                  className={`${input} mt-0`}>
                  {["In progress", "Completed", "Not completed"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <button type="button" aria-label="Remove qualification"
                  onClick={() => set("tertiary")((e.tertiary || []).filter((_, j) => j !== i))}
                  className="shrink-0 text-slate-400"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => set("tertiary")([...(e.tertiary || []), { qualification: "", institution: "", year: "", status: "In progress" }])}
          className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold k-tx-005A36">
          <Plus className="h-3.5 w-3.5" />Add a qualification
        </button>
      </div>
    </div>
  );
}

/* ---------------- Step 4: experience ---------------- */
export function StepExperience({ cv, patch }) {
  const xs = cv.experience || [];
  const setXs = (v) => patch({ experience: v });
  const update = (i, k, v) => setXs(xs.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  return (
    <div className="space-y-4">
      <p className="rounded-xl k-bg-E7F4EE p-3 text-[11px] leading-relaxed k-tx-005A36">
        Most learners think they have no experience. Almost none of them are right. Work in a family shop, minding
        younger siblings, captaining a team, helping at church — an employer reads all of it as evidence you turn up
        and take responsibility.
      </p>

      <Helper title="What counts as experience?">
        <div className="space-y-2">
          {EXPERIENCE_PROMPTS.map((p) => (
            <button key={p.label} type="button"
              onClick={() => setXs([...xs, { title: p.label, organisation: "", startDate: "", endDate: "", bullets: [""] }])}
              className="flex w-full items-start gap-2 rounded-lg bg-white p-2.5 text-left ring-1 ring-slate-200">
              <Plus className="mt-0.5 h-3 w-3 shrink-0 k-tx-005A36" />
              <span className="flex-1">
                <span className="block text-[11px] font-semibold text-slate-900">{p.label}</span>
                <span className="block text-[10px] leading-relaxed text-slate-600">{p.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </Helper>

      {xs.map((x, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-3.5">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 space-y-2">
              <input aria-label={`Role ${i + 1}`} value={x.title || ""} placeholder="What you did — e.g. Shop assistant"
                onChange={(ev) => update(i, "title", ev.target.value)} className={`${input} mt-0`} />
              <input aria-label={`Organisation ${i + 1}`} value={x.organisation || ""} placeholder="Where — e.g. Nomsa's Spaza, Soweto"
                onChange={(ev) => update(i, "organisation", ev.target.value)} className={`${input} mt-0`} />
              <div className="grid grid-cols-2 gap-2">
                <input aria-label={`Start date ${i + 1}`} value={x.startDate || ""} placeholder="From — Jan 2025"
                  onChange={(ev) => update(i, "startDate", ev.target.value)} className={`${input} mt-0`} />
                <input aria-label={`End date ${i + 1}`} value={x.endDate || ""} placeholder="To — or Present"
                  onChange={(ev) => update(i, "endDate", ev.target.value)} className={`${input} mt-0`} />
              </div>
            </div>
            <button type="button" aria-label={`Remove entry ${i + 1}`}
              onClick={() => setXs(xs.filter((_, j) => j !== i))}
              className="shrink-0 text-slate-400"><Trash2 className="h-4 w-4" /></button>
          </div>

          <div className="mt-3">
            <p className="text-[11px] font-medium text-slate-700">What you actually did</p>
            <div className="mt-1.5 space-y-2">
              {(x.bullets || [""]).map((b, bi) => (
                <div key={bi} className="flex items-start gap-2">
                  <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <textarea aria-label={`Detail ${bi + 1} for entry ${i + 1}`} rows={2} value={b}
                    onChange={(ev) => update(i, "bullets", (x.bullets || [""]).map((r, j) => j === bi ? ev.target.value : r))}
                    placeholder="Served about 40 customers a day and balanced the till at closing"
                    className={`${input} mt-0`} />
                  {(x.bullets || []).length > 1 && (
                    <button type="button" aria-label="Remove line"
                      onClick={() => update(i, "bullets", x.bullets.filter((_, j) => j !== bi))}
                      className="mt-2 shrink-0 text-slate-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => update(i, "bullets", [...(x.bullets || []), ""])}
              className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold k-tx-005A36">
              <Plus className="h-3 w-3" />Add a line
            </button>
          </div>
        </div>
      ))}

      <button type="button"
        onClick={() => setXs([...xs, { title: "", organisation: "", startDate: "", endDate: "", bullets: [""] }])}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-xs font-semibold text-slate-700">
        <Plus className="h-4 w-4" />Add experience
      </button>

      <Helper title="Start a line with a strong verb" icon={Sparkles}>
        <div className="space-y-3">
          {Object.entries(ACTION_VERBS).map(([key, verbs]) => (
            <div key={key}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{VERB_CATEGORY_LABEL[key]}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {verbs.map((v) => <Pill key={v}>{v}</Pill>)}
              </div>
            </div>
          ))}
        </div>
      </Helper>

      <Helper title="Patterns that work">
        <div className="space-y-2.5">
          {BULLET_PATTERNS.map((b) => (
            <div key={b.pattern} className="rounded-lg bg-white p-2.5 ring-1 ring-slate-200">
              <p className="text-[11px] font-medium text-slate-900">{b.pattern}</p>
              <p className="mt-0.5 text-[10px] italic leading-relaxed text-slate-600">{b.example}</p>
            </div>
          ))}
        </div>
      </Helper>
    </div>
  );
}

/* ---------------- Step 5: skills ---------------- */
export function StepSkills({ cv, patch, favourites }) {
  const s = cv.skills || { hard: [], soft: [] };
  const toggle = (bucket, value) => {
    const list = s[bucket] || [];
    patch({ skills: { ...s, [bucket]: list.includes(value) ? list.filter((x) => x !== value) : [...list, value] } });
  };

  /* NCAP pathway integration: the subjects a saved career needs are the
     strongest honest signal of what to claim, because the learner has already
     said that career interests them. */
  const savedCareers = (favourites || []).map((id) => occById[id]).filter(Boolean);
  const suggested = [...new Set(savedCareers.flatMap((o) => (o.subjects || []).map((k) => SUBJECT_LABELS[k]).filter(Boolean)))];

  return (
    <div className="space-y-4">
      {savedCareers.length > 0 && (
        <div className="rounded-2xl border k-bd-E4CE8A k-bg-FBF5E7 p-3.5">
          <p className="flex items-center gap-2 text-xs font-semibold k-tx-6B5307">
            <Briefcase className="h-4 w-4" />From the careers you saved
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-700">
            {savedCareers.slice(0, 3).map((o) => o.title).join(", ")} need these. Add any you can genuinely claim.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {suggested.map((label) => {
              const on = (s.hard || []).includes(label);
              return (
                <button key={label} type="button" onClick={() => toggle("hard", label)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${
                    on ? "k-bg-005A36 text-white ring-transparent" : "bg-white text-slate-700 ring-slate-200"
                  }`}>
                  {on && <Check className="mr-1 inline h-3 w-3" />}{label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {Object.entries(HARD_SKILL_GROUPS).map(([key, group]) => (
        <div key={key}>
          <SectionTitle>{group.label}</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {group.skills.map((skill) => {
              const on = (s.hard || []).includes(skill);
              return (
                <button key={skill} type="button" onClick={() => toggle("hard", skill)} aria-pressed={on}
                  className={`rounded-full px-2.5 py-1.5 text-[11px] font-medium ring-1 ${
                    on ? "k-bg-005A36 text-white ring-transparent" : "bg-white text-slate-700 ring-slate-200"
                  }`}>
                  {on && <Check className="mr-1 inline h-3 w-3" />}{skill}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div>
        <SectionTitle hint="Pick the ones you could give an example of">Personal skills</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {SOFT_SKILLS.map((skill) => {
            const on = (s.soft || []).includes(skill);
            return (
              <button key={skill} type="button" onClick={() => toggle("soft", skill)} aria-pressed={on}
                className={`rounded-full px-2.5 py-1.5 text-[11px] font-medium ring-1 ${
                  on ? "k-bg-1E3A6E text-white ring-transparent" : "bg-white text-slate-700 ring-slate-200"
                }`}>
                {on && <Check className="mr-1 inline h-3 w-3" />}{skill}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-600">
          Only claim what you could back up if asked in the interview. "Teamwork" with nothing behind it is
          the most ignored line on any CV.
        </p>
      </div>
    </div>
  );
}

/* ---------------- Step 6: languages and references ---------------- */
export function StepLanguagesReferences({ cv, patch }) {
  const langs = cv.languages || [];
  const refs = cv.references || [];

  return (
    <div className="space-y-5">
      <div>
        <SectionTitle hint="This matters here">Languages</SectionTitle>
        <p className="mb-2 text-[11px] leading-relaxed text-slate-600">
          In South Africa this genuinely affects hiring — in retail, healthcare, call centres and government especially.
          List every language you can actually work in.
        </p>
        <div className="space-y-2">
          {langs.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <select aria-label={`Language ${i + 1}`} value={l.name || ""}
                onChange={(e) => patch({ languages: langs.map((r, j) => j === i ? { ...r, name: e.target.value } : r) })}
                className={`${input} mt-0 flex-1`}>
                <option value="">Choose a language</option>
                {SA_LANGUAGES.map((n) => <option key={n}>{n}</option>)}
              </select>
              <select aria-label={`Level for language ${i + 1}`} value={l.level || "Fluent"}
                onChange={(e) => patch({ languages: langs.map((r, j) => j === i ? { ...r, level: e.target.value } : r) })}
                className={`${input} mt-0 w-36`}>
                {LANGUAGE_LEVELS.map((n) => <option key={n}>{n}</option>)}
              </select>
              <button type="button" aria-label={`Remove language ${i + 1}`}
                onClick={() => patch({ languages: langs.filter((_, j) => j !== i) })}
                className="shrink-0 text-slate-400"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => patch({ languages: [...langs, { name: "", level: "Fluent" }] })}
          className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold k-tx-005A36">
          <Plus className="h-3.5 w-3.5" />Add a language
        </button>
      </div>

      <div>
        <SectionTitle hint="Ask them first">References</SectionTitle>
        <div className="space-y-2.5">
          {refs.map((r, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <input aria-label={`Referee name ${i + 1}`} value={r.name || ""} placeholder="Mr S. Dlamini"
                  onChange={(e) => patch({ references: refs.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })}
                  className={`${input} mt-0`} />
                <input aria-label={`Relationship ${i + 1}`} value={r.relationship || ""} placeholder="Mathematics teacher"
                  onChange={(e) => patch({ references: refs.map((x, j) => j === i ? { ...x, relationship: e.target.value } : x) })}
                  className={`${input} mt-0`} />
                <input aria-label={`Organisation ${i + 1}`} value={r.organisation || ""} placeholder="Morris Isaacson High"
                  onChange={(e) => patch({ references: refs.map((x, j) => j === i ? { ...x, organisation: e.target.value } : x) })}
                  className={`${input} mt-0`} />
                <input aria-label={`Referee phone ${i + 1}`} value={r.phone || ""} placeholder="011 123 4567" inputMode="tel"
                  onChange={(e) => patch({ references: refs.map((x, j) => j === i ? { ...x, phone: e.target.value } : x) })}
                  className={`${input} mt-0`} />
              </div>
              <button type="button" onClick={() => patch({ references: refs.filter((_, j) => j !== i) })}
                className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold k-tx-9B1C14">
                <Trash2 className="h-3 w-3" />Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => patch({ references: [...refs, { name: "", relationship: "", organisation: "", phone: "" }] })}
          className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold k-tx-005A36">
          <Plus className="h-3.5 w-3.5" />Add a referee
        </button>

        <Helper title="Who to ask" icon={Star}>
          <ul className="space-y-1.5">
            {REFERENCE_GUIDANCE.map((g) => (
              <li key={g} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-700">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />{g}
              </li>
            ))}
          </ul>
        </Helper>
      </div>
    </div>
  );
}

export const CV_STEPS = [
  { key: "personal",  label: "Contact",     title: "Personal and contact details",  Component: StepPersonal },
  { key: "summary",   label: "Summary",     title: "Professional summary",          Component: StepSummary },
  { key: "education", label: "Education",   title: "Education and subjects",        Component: StepEducation },
  { key: "experience",label: "Experience",  title: "Work, volunteer and leadership", Component: StepExperience },
  { key: "skills",    label: "Skills",      title: "Hard and soft skills",          Component: StepSkills },
  { key: "extras",    label: "Languages",   title: "Languages and references",      Component: StepLanguagesReferences },
];
