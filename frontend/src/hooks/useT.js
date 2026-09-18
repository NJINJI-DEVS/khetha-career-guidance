// Extracted from App.jsx (Stage 3 of frontend restructuring plan).
import { useCallback } from 'react';
import { STRINGS } from '../data/i18n';

/* t("stepOf", { n: 2, total: 6 }) -> "Step 2 of 6" */
export const useT = (lang) =>
  useCallback(
    (key, vars) => {
      let out = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
      if (vars) Object.entries(vars).forEach(([k, v]) => { out = out.replace(`{${k}}`, v); });
      return out;
    },
    [lang]
  );
