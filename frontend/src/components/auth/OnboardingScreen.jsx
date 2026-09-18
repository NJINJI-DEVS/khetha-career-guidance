// Shown once, right after a real sign-in, when no Matriculant profile exists yet
// (see useMatriculantProfile's "no-profile" status). Collects the minimum needed
// to use the rest of the app for real: name, grade, province, and — for grade
// 10-12 — NSC subjects with percentages (APS/eligibility depend on these). Grade 9
// learners skip subject entry; Subject Chooser (unaffected by any of this) is
// where they figure out their Grade 10 package, and they'll add real NSC subjects
// here once they have them.
import { useState } from 'react';
import { Plus, Trash2, Loader2, AlertTriangle, Camera } from 'lucide-react';
import { SUBJECT_LABELS, SUBJECT_CATEGORIES } from '../../data/subjects';
import { Screen } from '../ui/Screen';
import { SectionTitle } from '../ui/SectionTitle';
import { OcrScanModal } from '../learner/OcrScanModal';

// What the simulated scan "reads" off a report card. Every label matches a
// SUBJECT_LABELS value so the rows drop straight into the selects below.
const MOCK_SCAN = [
  { label: "English", pct: 68 },
  { label: "isiZulu", pct: 74 },
  { label: "Mathematics", pct: 61 },
  { label: "Physical Sciences", pct: 58 },
  { label: "Life Sciences", pct: 65 },
  { label: "Geography", pct: 70 },
  { label: "Life Orientation", pct: 79 },
];

const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
  "Mpumalanga", "Northern Cape", "North West", "Western Cape",
];

const SUBJECT_OPTIONS = Object.values(SUBJECT_LABELS);

export function OnboardingScreen({ onSubmit, onSignOut, dateOfBirth }) {
  const [fullName, setFullName] = useState('');
  const [grade, setGrade] = useState(12);
  const [province, setProvince] = useState(PROVINCES[2]);
  const [school, setSchool] = useState('');
  const [subjects, setSubjects] = useState([{ subjectName: SUBJECT_OPTIONS[0], percentage: 60 }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [scanOpen, setScanOpen] = useState(false);
  const [scanned, setScanned] = useState(false);

  const needsSubjects = grade >= 10;

  const addSubject = () =>
    setSubjects((s) => [...s, { subjectName: SUBJECT_OPTIONS[0], percentage: 60 }]);
  const removeSubject = (i) => setSubjects((s) => s.filter((_, idx) => idx !== i));
  const updateSubject = (i, patch) =>
    setSubjects((s) => s.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const valid = fullName.trim().length > 1 && (!needsSubjects || subjects.length > 0);

  const submit = async () => {
    setError('');
    if (!valid) { setError('Add your name, and at least one subject if you\'re in grade 10-12.'); return; }
    setBusy(true);
    try {
      await onSubmit({
        fullName: fullName.trim(),
        matricYear: new Date().getFullYear() + (12 - grade),
        grade,
        school: school.trim() || null,
        province,
        dateOfBirth: dateOfBirth || null,
        subjects: needsSubjects ? subjects : [],
      });
    } catch (err) {
      setError(err.message || 'Something went wrong saving your profile.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Set up your profile" subtitle="This is what powers your APS, matched qualifications, and mentor requests — it only takes a minute.">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-700">Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-700">Grade</label>
            <select value={grade} onChange={(e) => setGrade(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37">
              {[9, 10, 11, 12].map((g) => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">Province</label>
            <select value={province} onChange={(e) => setProvince(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37">
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700">School (optional)</label>
          <input value={school} onChange={(e) => setSchool(e.target.value)}
            placeholder="Your school's name"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
        </div>

        {dateOfBirth && (
          <p className="rounded-xl bg-slate-100 px-3 py-2.5 text-xs text-slate-600">
            Date of birth: <span className="font-semibold text-slate-900">
              {new Date(dateOfBirth).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}
            </span> — captured when you signed up.
          </p>
        )}

        {needsSubjects ? (
          <div>
            <SectionTitle hint="Best six count toward your APS">Your subjects and marks</SectionTitle>

            <button onClick={() => setScanOpen(true)}
              className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-dashed k-bd-00784A k-bg-E7F4EE p-3 text-left">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl k-bg-005A36 text-white">
                <Camera className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold k-tx-005A36">
                  {scanned ? "Scan again" : "Scan your report card"}
                </span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-600">
                  {scanned
                    ? "Marks filled in below — check them against the page before saving."
                    : "Point the camera at your latest report and we fill this in for you. Faster than typing seven rows."}
                </span>
              </span>
            </button>

            <div className="space-y-2.5">
              {subjects.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select value={row.subjectName} onChange={(e) => updateSubject(i, { subjectName: e.target.value })}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37">
                    {SUBJECT_CATEGORIES.map((cat) => (
                      <optgroup key={cat.category} label={cat.category}>
                        {cat.keys.map((k) => <option key={k} value={SUBJECT_LABELS[k]}>{SUBJECT_LABELS[k]}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <input type="number" min={0} max={100} value={row.percentage}
                    onChange={(e) => updateSubject(i, { percentage: Math.max(0, Math.min(100, Number(e.target.value))) })}
                    className="w-16 rounded-xl border border-slate-200 bg-white px-2 py-2 text-center text-xs text-slate-900 k-fb-00784A focus:outline-none focus-visible:ring-2 k-fvr-D4AF37" />
                  <span className="text-xs text-slate-500">%</span>
                  <button onClick={() => removeSubject(i)} disabled={subjects.length <= 1}
                    aria-label="Remove subject" className="shrink-0 text-slate-400 disabled:opacity-30">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addSubject}
              className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold k-tx-005A36">
              <Plus className="h-3.5 w-3.5" />Add subject
            </button>
          </div>
        ) : (
          <p className="rounded-xl bg-slate-100 p-3 text-xs leading-relaxed text-slate-600">
            You can add your NSC subjects here once you have Grade 10 marks. In the meantime, use the Subject Chooser
            (under Tools) to work out your Grade 10 package from your Grade 9 marks.
          </p>
        )}

        {error && (
          <p className="flex items-start gap-1.5 text-xs k-tx-9B1C14">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}
          </p>
        )}

        <button onClick={submit} disabled={busy || !valid}
          className="flex w-full items-center justify-center gap-2 rounded-xl k-bg-005A36 py-3 text-sm font-semibold text-white transition-colors k-dis">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? 'Saving…' : 'Save and continue'}
        </button>
        {onSignOut && (
          <button onClick={onSignOut} className="w-full text-center text-xs font-semibold text-slate-600">
            Sign out
          </button>
        )}
      </div>

      {scanOpen && (
        <OcrScanModal
          detected={MOCK_SCAN}
          applyLabel="Fill in my subjects"
          onClose={() => setScanOpen(false)}
          onApply={(rows) => {
            setSubjects(rows.map((r) => ({ subjectName: r.label, percentage: r.pct })));
            setScanned(true);
            setScanOpen(false);
          }}
        />
      )}
    </Screen>
  );
}
