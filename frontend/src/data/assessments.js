// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

export const RIASEC_TYPES = {
  R: { label: "Realistic", blurb: "Hands-on, practical, works with tools, machines or the outdoors." },
  I: { label: "Investigative", blurb: "Analytical, curious, likes solving problems and understanding why." },
  A: { label: "Artistic", blurb: "Creative, expressive, prefers open-ended work over fixed rules." },
  S: { label: "Social", blurb: "Helpful, patient, drawn to teaching, caring and community work." },
  E: { label: "Enterprising", blurb: "Persuasive, ambitious, comfortable leading and selling." },
  C: { label: "Conventional", blurb: "Organised, accurate, works well with records, systems and detail." },
};

export const CAREER_CHOICE_Q = [
  { id: "cc1", type: "R", text: "I would rather fix or build something than write about it." },
  { id: "cc2", type: "R", text: "I enjoy working outdoors or with my hands." },
  { id: "cc3", type: "I", text: "I keep asking why something works the way it does." },
  { id: "cc4", type: "I", text: "I enjoy puzzles, experiments and figuring things out." },
  { id: "cc5", type: "A", text: "I often draw, write, design or make music in my own time." },
  { id: "cc6", type: "A", text: "I prefer work where there is no single right answer." },
  { id: "cc7", type: "S", text: "People come to me when they need help or advice." },
  { id: "cc8", type: "S", text: "I would find it satisfying to teach or care for others." },
  { id: "cc9", type: "E", text: "I am comfortable speaking up and persuading a group." },
  { id: "cc10", type: "E", text: "I would like to run my own business one day." },
  { id: "cc11", type: "C", text: "I like my work neat, ordered and checked." },
  { id: "cc12", type: "C", text: "I am good with numbers, records and following a system." },
];

export const AGREE_SCALE = [
  { v: 1, label: "Not at all" },
  { v: 2, label: "A little" },
  { v: 3, label: "Somewhat" },
  { v: 4, label: "Mostly" },
  { v: 5, label: "Very much" },
];

export const JOB_FIT_Q = [
  { id: "jf1", axis: "people", text: "I want to work with people for most of the day." },
  { id: "jf2", axis: "people", text: "I would be comfortable dealing with strangers all day." },
  { id: "jf3", axis: "data", text: "I enjoy working with numbers, records or information." },
  { id: "jf4", axis: "data", text: "I would rather analyse a problem than physically fix it." },
  { id: "jf5", axis: "things", text: "I like using tools, machines or equipment." },
  { id: "jf6", axis: "things", text: "I get satisfaction from seeing something I built with my hands." },
  { id: "jf7", axis: "outdoors", text: "I would rather be outside or on site than in an office." },
  { id: "jf8", axis: "outdoors", text: "I do not mind travelling to different places for work." },
  { id: "jf9", axis: "routine", text: "I prefer a predictable routine to constant change." },
  { id: "jf10", axis: "routine", text: "I like knowing exactly what is expected of me each day." },
];
