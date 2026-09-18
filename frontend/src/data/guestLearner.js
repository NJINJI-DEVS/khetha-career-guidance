// Guest mode: the whole app, no account, nothing leaving the device.
//
// Every screen downstream expects the `learner` shape that adapters/learner.js
// produces from a real Matriculant. Rather than teaching each screen about a
// "no learner" case, guest mode supplies a complete stand-in so the directories,
// APS calculator and questionnaires all work exactly as they do for a real
// account — the difference is that nothing is ever written to the backend.

export const GUEST_LEARNER = {
  id: "guest",
  name: "Guest",
  grade: 12,
  school: "",
  province: "Gauteng",
  gr9Marks: null,
  subjects: [
    { key: "english", label: "English", pct: 68, excluded: false },
    { key: "isizulu", label: "isiZulu", pct: 74, excluded: false },
    { key: "maths", label: "Mathematics", pct: 61, excluded: false },
    { key: "physci", label: "Physical Sciences", pct: 58, excluded: false },
    { key: "lifesci", label: "Life Sciences", pct: 65, excluded: false },
    { key: "geography", label: "Geography", pct: 70, excluded: false },
    { key: "lo", label: "Life Orientation", pct: 79, excluded: true },
  ],
};

export const GUEST_SESSION = {
  method: "guest",
  identity: "Guest",
  guest: true,
  trustDevice: false,
  consent: { core: true, ncap: false, notify: false, research: false },
  ageGate: null,
};
