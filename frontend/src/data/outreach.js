// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { PhoneCall, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';

export const CHANNELS = [
  { id: "c1", label: "Khetha career advice helpline", detail: "086 999 0123", note: "Toll-free from a landline, Monday to Friday, 08:00–16:30", icon: PhoneCall, action: "tel:0869990123" },
  { id: "c2", label: "WhatsApp a career practitioner", detail: "Send 'Khetha' to start", note: "Data-light. Replies within one working day.", icon: MessageSquare, action: null },
  { id: "c3", label: "Email the Khetha team", detail: "careerhelp@dhet.gov.za", note: "Attach your results if you want advice on a specific course.", icon: Mail, action: "mailto:careerhelp@dhet.gov.za" },
  { id: "c4", label: "Please Call Me", detail: "Request a call back", note: "For learners without airtime. A practitioner calls you.", icon: Phone, action: null },
  { id: "c5", label: "Walk-in career centre", detail: "Find your nearest centre", note: "Khetha practitioners at selected TVET and community centres.", icon: MapPin, action: null },
];

export const EVENTS = [
  { id: "e1", title: "Khetha Career Exhibition", date: "14 March 2027", province: "Gauteng", venue: "Soweto Theatre, Jabulani", type: "Exhibition" },
  { id: "e2", title: "NSFAS application workshop", date: "22 March 2027", province: "Gauteng", venue: "South West Gauteng TVET, Molapo", type: "Workshop" },
  { id: "e3", title: "Grade 9 subject choice evening", date: "5 April 2027", province: "KwaZulu-Natal", venue: "Durban ICC", type: "Information session" },
  { id: "e4", title: "Artisan open day", date: "18 April 2027", province: "Gauteng", venue: "Ekurhuleni West TVET, Germiston", type: "Open day" },
  { id: "e5", title: "Khetha radio career hour", date: "Every Saturday, 09:00", province: "National", venue: "Community radio stations", type: "Broadcast" },
];

export const FAQS = [
  { q: "What is APS and why does it matter?", a: "Your Admission Point Score adds up the NSC levels of your best six subjects, excluding Life Orientation. Institutions publish a minimum APS for each qualification, so it is the first gate on any application." },
  { q: "Can I change subjects after Grade 10?", a: "Schools may allow a change early in Grade 10, and sometimes into Grade 11, but it becomes difficult once the curriculum has moved on. Speak to your Life Orientation teacher as early as possible." },
  { q: "Is a TVET qualification worth less than a degree?", a: "No. They answer different needs. An artisan qualification carries a national skills shortage and an earlier income; a degree opens professional registration. Many people do both, in that order." },
  { q: "What if I do not qualify anywhere this year?", a: "You can improve marks through a second-chance matric programme, register for an NCV or N-course at a TVET college, or take a bridging programme. None of these close the door on a degree later." },
];
