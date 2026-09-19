// Extracted from App.jsx (Stage 6 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { TierBadges } from '../ui/TierBadges';

/* ==================================================================
   Mentor / professional workspace
   ================================================================== */

export function VerificationBanner({ session, onVerify, application }) {
  const tiers = application?.status === 'approved' ? [
    application.idDocumentFilename && 'id',
    (application.transcriptFilename || application.licenceNumber) && 'degree',
    application.partnerName && 'ngo',
  ].filter(Boolean) : [];
  const status = application?.status || 'none';
  const verified = status === "approved";
  return (
    <div className={`rounded-2xl border p-4 ${verified ? "k-bd-00784A k-bg-E7F4EE" : "k-bd-D4AF37 k-bg-FBF5E7"}`}>
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white ${verified ? "k-bg-005A36" : "k-bg-D4AF37"}`}>
          {verified ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5 text-slate-900" />}
        </span>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${verified ? "k-tx-005A36" : "k-tx-6B5307"}`}>
            {status === "approved" ? "Approved — learners can reach you"
              : status === "rejected" ? "Application not approved"
              : status === "more-info" ? "More information needed"
              : status === "pending" ? "Submitted — awaiting DHET review"
              : "Verification pending"}
          </p>
          <p className={`mt-1 text-xs leading-relaxed ${verified ? "k-tx-005A36" : "k-tx-6B5307"}`}>
            {status === "approved"
              ? "Your profile shows these badges to every learner browsing the mentor network."
              : status === "rejected"
                ? (application?.note || "The verification team could not confirm the credentials supplied. You may appeal with further documents.")
                : status === "more-info"
                  ? (application?.note || "The verification team needs more from you before they can decide. Check your email for the detail.")
              : status === "pending"
                ? "A person on the DHET verification team reviews every application. Until they approve it, your profile is hidden from the directory and you cannot receive learner requests."
                : "Complete your application for administrator review. Your profile stays hidden until approval."}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5"><TierBadges tiers={tiers} /></div>
          {!verified && status !== "pending" && (
            <button onClick={onVerify}
              className="mt-3 rounded-lg k-bg-005A36 px-3 py-1.5 text-[11px] font-semibold text-white">
              Complete verification
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
