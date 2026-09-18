// Extracted from App.jsx (Stage 4 of frontend restructuring plan).
import dhetArms from '../../assets/dhet-arms.png';
import khethaWordmark from '../../assets/khetha-wordmark.png';

export function DhetArms({ className = "h-9" }) {
  return (
    <img src={dhetArms} alt="Coat of arms of the Republic of South Africa" className={`${className} w-auto`} />
  );
}
export function KhethaWordmark({ className = "h-6" }) {
  return (
    <img src={khethaWordmark} alt="Khetha — make the right choice, decide your future" className={`${className} w-auto`} />
  );
}
export function SaStripe() {
  return (
    <span className="flex h-4 w-6 flex-col overflow-hidden rounded-sm" aria-hidden>
      <span className="flex-1 k-bg-B3261E" />
      <span className="flex-1 bg-white" />
      <span className="flex-1 k-bg-1E3A6E" />
    </span>
  );
}
