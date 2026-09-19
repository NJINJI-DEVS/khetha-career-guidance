// Verification badges for a mentor.
//
// The lookup is guarded on purpose. These keys come from the server, and an
// unrecognised one used to read `.tone` off undefined -- which does not
// degrade a badge, it unmounts the entire React tree and white-screens the
// app. A decorative badge must never be able to do that, so an unknown tier
// renders as a neutral pill instead of throwing.
import { TIERS } from '../../data/roles';
import { Pill } from './Pill';

export function TierBadges({ tiers }) {
  if (!tiers || tiers.length === 0) return <Pill tone="slate">Verification pending</Pill>;
  return (
    <>
      {tiers.map((k) => {
        const tier = TIERS[k];
        if (!tier) return <Pill key={k} tone="slate">{k}</Pill>;
        return <Pill key={k} tone={tier.tone} icon={tier.icon}>{tier.label}</Pill>;
      })}
    </>
  );
}
