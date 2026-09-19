// Demo administrator shortcut.
//
// SCOPE AND SECURITY — read before changing this.
//
// Typing the shortcut below signs in as a REAL administrator account, using
// credentials supplied at build time by environment variables. It is a
// convenience for demonstrating the admin screens without typing a long
// password on a projector; it is not a second authentication path. Whatever it
// signs in as still has to be an active row in the `admins` table, and every
// admin endpoint still validates a Supabase JWT against that table.
//
// THE RISK, STATED PLAINLY: Vite inlines every VITE_* variable into the
// JavaScript bundle at build time. Any build made with these variables set
// contains a working administrator password in a file the browser downloads.
// Anyone who opens devtools on that build can read it.
//
// This is why:
//   - the credentials live in .env.local (gitignored), never in this file;
//   - the shortcut is off unless VITE_ENABLE_DEMO_ADMIN === "true";
//   - a production build should simply not set these variables, and then no
//     part of this path exists in the bundle at all.
//
// Before handing anything to DHET: unset the variables, rebuild, and rotate
// that administrator's password.

export const DEMO_ADMIN = {
  email: "admin",
  password: "njinji",
};

/** True only when this build was made with the demo shortcut explicitly on. */
export const isDemoAdminEnabled = () =>
  import.meta.env.VITE_ENABLE_DEMO_ADMIN === "true"
  && !!import.meta.env.VITE_DEMO_ADMIN_EMAIL
  && !!import.meta.env.VITE_DEMO_ADMIN_PASSWORD;

/** The real account the shortcut signs in as, or null if not configured. */
export const demoAdminCredentials = () =>
  isDemoAdminEnabled()
    ? {
        email: import.meta.env.VITE_DEMO_ADMIN_EMAIL,
        password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD,
      }
    : null;
