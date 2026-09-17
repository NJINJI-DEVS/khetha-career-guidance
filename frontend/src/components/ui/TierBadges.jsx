// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
import { TIERS } from '../../data/roles';
import { Pill } from './Pill';

export function TierBadges({ tiers }) {
  if (!tiers || tiers.length === 0) return <Pill tone="slate">Verification pending</Pill>;
  return (
    <>
      {tiers.map((k) => {
        const tier = TIERS[k];
        return <Pill key={k} tone={tier.tone} icon={tier.icon}>{tier.label}</Pill>;
      })}
    </>
  );
}
