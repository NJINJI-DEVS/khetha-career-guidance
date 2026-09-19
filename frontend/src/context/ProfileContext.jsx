// Extracted from App.jsx's root component (KhethaCareerGuidance): the
// `profile` career-journey record (favourites, careerChoice, jobFit,
// subjectResult, apsVisited, requestSent). Cross-cutting like settings —
// Dashboard, MeScreen, CareerDetail (favourites), the questionnaires, and
// the journey progress bar all read/write pieces of it. The derived
// `journey` value (via useJourney) stays computed in the root, not here —
// this Context only owns the raw state.
import { createContext, useContext, useState } from 'react';

const ProfileContext = createContext(null);

export const DEFAULT_PROFILE = {
  favourites: [], careerChoice: null, jobFit: null, subjectResult: null,
  // Past attempts per instrument, so a retake compares against the previous
  // result instead of silently overwriting it (see engines/history.js).
  history: {},
  // What the app calls this learner, and their avatar. Both ride in the
  // profileData jsonb column — no extra table, no migration.
  displayName: null,
  avatar: null,
};

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
