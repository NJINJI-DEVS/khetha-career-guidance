# Administrator access and mentor approval

Administrators use the small shield icon on the role-selection screen. There is no admin signup option. Supabase authenticates the email and password; `GET /api/admin/me` then requires an active row in the dedicated `admins` table. Every admin API uses the same table. Neither a `user_roles` value nor editable Supabase metadata grants admin permissions.

`admins` stores `user_id` (the Supabase Auth user ID and primary key), `email` (contact email captured at provisioning), `is_active`, and `created_at`. Passwords remain in Supabase Auth. Set `is_active` to false to revoke access on subsequent requests. The table has row-level security enabled and no public access policies; browser clients cannot read or write it directly.

Apply the `AddDedicatedAdmins` migration before starting the updated API:

```powershell
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet ef database update --project backend
```

The migration transfers existing admin roles linked to Supabase Auth users into `admins`, then removes their legacy admin role rows. Other public account roles are unchanged.

## Provision an administrator

From the repository root, run the backend's operator-only command:

```powershell
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet run --project backend --no-launch-profile -- --provision-admin admin@example.com
```

If that email already belongs to a Supabase Auth user, the command inserts or reactivates its `admins` row and leaves its password unchanged. Any legacy admin role is removed. Use a dedicated administrator account; active admin membership takes precedence over public roles during login.

For a new account, first set `Supabase__SecretKey` (a Supabase server secret or legacy service-role key) and `AdminBootstrap__Password` (at least 12 characters) through your local secret configuration or server environment. Do not commit either value or put them in frontend variables. The command creates a confirmed Auth user and assigns its backend role, then exits without starting the server. Re-running it is safe if account creation succeeded but the role write failed. It does not reset an existing password.

The currently configured publishable key cannot create administrator accounts. See [Supabase admin user creation](https://supabase.com/docs/reference/javascript/auth-admin-createuser).

## Application lifecycle

1. Register or sign in as a Peer Tutor / Institutional Mentor or Industry Professional.
2. Open the workspace and choose Complete verification. Supply identity, subjects, institution and experience, plus credentials. Upload an actual ID document and optionally a transcript (PDF, JPEG or PNG; maximum 5 MB each).
3. Submit. The account remains pending and is not listed in the learner mentor directory. Only one pending/approved application is allowed per account.
4. Sign in separately through the administrator icon. The dashboard shows Pending, Approved and Rejected applications. Review the details and download documents before approving or rejecting.
5. Approval creates the active mentor profile, records the decision and notifies the applicant. Rejection records a decision and notification and allows another application. The workspace and admin queue refresh every 15 seconds and on window focus; both also have a Refresh control.

The backend enforces admin permissions on list-all, decisions, analytics and document downloads. Submissions take their role and identity from the authenticated account, and decisions are serialized in database transactions so two administrators cannot decide the same application twice.

## Document storage

Files are stored outside the public web root in `backend/App_Data/mentor-documents`, which is gitignored. Downloads require administrator authentication and are served as attachments. Configure `Documents__Path` to a private persistent volume when hosting; include it in restricted backups. A filename from the earlier simulated upload flow has no document behind it: reject those applications and ask the mentor to reapply.

## Verification

Run `dotnet run --project tests/ApprovalFlow` from the repository root for the HTTP/database integration checks. These use the configured development connection (or `ApprovalTestConnection`) to create a randomly named isolated schema, exercise the real controllers and authorization policy with test identities, then remove the schema and fixture documents. No Supabase Auth users or existing application data are modified. Run `node tests/admin-ui.mjs` for the UI rendering checks.

Use separate browser sessions for a learner, mentor and admin. Confirm a learner/mentor receives 403 from the admin application endpoints, cannot self-claim `admin`, and cannot see the admin dashboard. Confirm a pending mentor is absent from the directory, approval makes the profile available, repeated decisions return 409, and rejected applicants can resubmit. Test logging out and signing back in to verify persisted state.
