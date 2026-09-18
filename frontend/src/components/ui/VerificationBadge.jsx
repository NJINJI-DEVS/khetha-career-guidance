// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
import { ShieldCheck } from 'lucide-react';
import { partnerById } from '../../data/mentors';
import { Pill } from './Pill';

export function VerificationBadge({ mentor }) {
  const partner = mentor.partner ? partnerById[mentor.partner] : null;
  if (partner) {
    return (
      <Pill tone="green" icon={ShieldCheck}>
        Verified via {partner.name.length > 28 ? partner.name.slice(0, 26) + "…" : partner.name}
      </Pill>
    );
  }
  if (mentor.employerVerified) {
    return <Pill tone="blue" icon={ShieldCheck}>Employer-verified professional</Pill>;
  }
  return <Pill tone="slate">Unverified</Pill>;
}
