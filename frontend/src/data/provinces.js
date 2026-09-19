// The nine provinces, spelled exactly as they are stored on a learner's
// profile. Shared rather than redeclared because event visibility is matched by
// string equality against `matriculant.province` — a second copy that drifts by
// one character (Kwazulu-Natal, North-West) silently hides every event in that
// province from the learners it was meant for.
export const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
  "Mpumalanga", "Northern Cape", "North West", "Western Cape",
];
