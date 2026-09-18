// R8: Khetha advice channels, events and the common-questions pool.

import { PhoneCall, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';

// Every Khetha contact detail in one place so DHET can swap them without
// hunting through components. The helpline is the real published number; the
// WhatsApp line is a demonstration number pending DHET provisioning, which the
// UI states rather than hides.
export const KHETHA_CONTACT = {
  helpline: "086 999 0123",
  helplineTel: "0869990123",
  whatsapp: "060 999 0123",
  whatsappE164: "27609990123",
  whatsappKeyword: "Khetha",
  whatsappVerified: false,
  email: "careerhelp@dhet.gov.za",
  // "Please Call Me" is free on every SA network — the learner sends it, a
  // practitioner calls back, so no airtime is needed at the learner's end.
  pleaseCallUssd: "*140*086 999 0123#",
  pleaseCallUssdTel: "*140*0869990123#",
  hours: "Monday to Friday, 08:00–16:30",
};

export const CHANNELS = [
  {
    id: "c1", kind: "call", icon: PhoneCall,
    label: "Khetha career advice helpline",
    detail: KHETHA_CONTACT.helpline,
    note: `Toll-free from a landline, ${KHETHA_CONTACT.hours}`,
    action: `tel:${KHETHA_CONTACT.helplineTel}`,
  },
  {
    id: "c2", kind: "whatsapp", icon: MessageSquare,
    label: "WhatsApp a career practitioner",
    detail: `Send '${KHETHA_CONTACT.whatsappKeyword}' to start`,
    note: "Data-light. Replies within one working day.",
    action: null,
  },
  {
    id: "c3", kind: "email", icon: Mail,
    label: "Email the Khetha team",
    detail: KHETHA_CONTACT.email,
    note: "Attach your results if you want advice on a specific course.",
    action: `mailto:${KHETHA_CONTACT.email}`,
  },
  {
    id: "c4", kind: "callback", icon: Phone,
    label: "Please Call Me",
    detail: "Request a call back",
    note: "For learners without airtime. A practitioner calls you.",
    action: null,
  },
  {
    id: "c5", kind: "walkin", icon: MapPin,
    label: "Walk-in career centre",
    detail: "Find your nearest centre",
    note: "Khetha practitioners at selected TVET and community centres.",
    action: null,
  },
];

export const EVENTS = [
  { id: "e1", title: "Khetha Career Exhibition", date: "14 March 2027", province: "Gauteng", venue: "Soweto Theatre, Jabulani", type: "Exhibition", lat: -26.2485, lng: 27.8540 },
  { id: "e2", title: "NSFAS application workshop", date: "22 March 2027", province: "Gauteng", venue: "South West Gauteng TVET, Molapo", type: "Workshop", lat: -26.2560, lng: 27.8770 },
  { id: "e3", title: "Grade 9 subject choice evening", date: "5 April 2027", province: "KwaZulu-Natal", venue: "Durban ICC", type: "Information session", lat: -29.8470, lng: 31.0290 },
  { id: "e4", title: "Artisan open day", date: "18 April 2027", province: "Gauteng", venue: "Ekurhuleni West TVET, Germiston", type: "Open day", lat: -26.2180, lng: 28.1670 },
  { id: "e5", title: "Khetha radio career hour", date: "Every Saturday, 09:00", province: "National", venue: "Community radio stations", type: "Broadcast", lat: null, lng: null },
];

// Common questions. `grades` narrows a question to the learners it actually
// applies to, and `topic` groups them — both feed engines/faqRotation.js, which
// shows a different, relevant handful each day rather than the same four
// forever to someone whose grade and marks the app already knows.
export const FAQS = [
  { topic: "aps", grades: [10, 11, 12], q: "What is APS and why does it matter?", a: "Your Admission Point Score adds up the NSC levels of your best six subjects, excluding Life Orientation. Institutions publish a minimum APS for each qualification, so it is the first gate on any application." },
  { topic: "subjects", grades: [9, 10], q: "Can I change subjects after Grade 10?", a: "Schools may allow a change early in Grade 10, and sometimes into Grade 11, but it becomes difficult once the curriculum has moved on. Speak to your Life Orientation teacher as early as possible." },
  { topic: "tvet", q: "Is a TVET qualification worth less than a degree?", a: "No. They answer different needs. An artisan qualification carries a national skills shortage and an earlier income; a degree opens professional registration. Many people do both, in that order." },
  { topic: "results", grades: [12], q: "What if I do not qualify anywhere this year?", a: "You can improve marks through a second-chance matric programme, register for an NCV or N-course at a TVET college, or take a bridging programme. None of these close the door on a degree later." },
  { topic: "funding", q: "Who qualifies for NSFAS?", a: "South African citizens with a combined household income of R350 000 a year or less, or R600 000 if you have a disability. It covers tuition, registration, accommodation and a learning-material allowance at public universities and TVET colleges." },
  { topic: "funding", grades: [11, 12], q: "When do NSFAS applications open and close?", a: "The window runs from roughly September to January, and it is separate from your institution application. Applying to a university does not apply you for funding — you must do both." },
  { topic: "subjects", grades: [9], q: "Does Maths Literacy close doors?", a: "It closes engineering, most science degrees and many commerce degrees, which need Pure Maths. It does not close TVET artisan routes, most diplomas in IT and business, nursing at some institutions, or the humanities. Choose it deliberately, not by default." },
  { topic: "applications", grades: [11, 12], q: "How many institutions should I apply to?", a: "Three to five, spread across your realistic APS range: one reach, two matches and one safe option including a TVET route. Application fees and closing dates differ, so check each one." },
  { topic: "applications", grades: [12], q: "What documents do I need to apply?", a: "A certified copy of your ID, your latest results, and for funding your parents' payslips or an affidavit. Certify copies early — queues at police stations get long in September." },
  { topic: "aps", grades: [11, 12], q: "Does Life Orientation count toward my APS?", a: "Almost never. Most institutions exclude it entirely, and a few count it at half weight. Plan on it not counting, which is why the app leaves it out of your score." },
  { topic: "careers", q: "What if I do not know what I want to do?", a: "That is the normal starting point, not a failure. Do the Career Choice questionnaire under Tools — it works from what you enjoy rather than what you have heard of, and most learners recognise themselves in the result." },
  { topic: "tvet", q: "What is the difference between NCV and an N-course?", a: "NCV is a three-year full qualification you can start after Grade 9, covering theory and practical together. N-courses (N1–N6) are shorter trimester blocks usually paired with workplace time, and lead to a trade test. Both are NSFAS funded." },
  { topic: "results", grades: [12], q: "Can I still apply after results come out?", a: "Late applications and the Central Applications Clearing House open in January, but the choices left are far narrower. Applying before your results, on your Grade 11 marks, is the single highest-value thing you can do." },
  { topic: "careers", grades: [9, 10, 11], q: "Do I have to decide on a career now?", a: "No. You have to keep doors open now and decide later. Subject choice is the only decision with a real deadline — everything else can change well into your twenties." },
  { topic: "funding", q: "What happens to NSFAS if I fail a year?", a: "NSFAS funds a qualification for its normal length plus one extra year. Fail more than that and funding stops, so a repeated year is expensive in more than time. Talk to the institution's financial aid office early if you are struggling." },
];
