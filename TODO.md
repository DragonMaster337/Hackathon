# TODO

Things deliberately deferred to keep the qualification-round build moving.
Grouped by when they need to happen.

---

## Before shipping to real users

### Re-enable email confirmation — **security**
Disabled on 2026-08-18 so demo signups work without inbox round-trips.
Anyone can currently sign up with an email address they do not own.

- Dashboard: Authentication → Sign In / Providers → Email → enable **Confirm email**
- Or via Management API:
  ```
  PATCH https://api.supabase.com/v1/projects/kepnlabcvbylqgnibwrv/config/auth
  {"mailer_autoconfirm": false}
  ```
- `SignUpScreen.handleSignUp` already handles the no-session case with a
  "Check your email" alert, so no app change is needed when re-enabling.

### Tighten Row Level Security
Current policies are a permissive baseline: any signed-in user can read every
profile and every opportunity. Before real data:

- Restrict `profiles` reads to connections + employers with an active listing,
  or expose a limited public view.
- `applications` are already scoped to the student and posting employer — verify
  this holds once employers have a review screen.
- Add rate limiting on `connections` inserts to prevent spam invites.

### Revoke the Supabase management token
A personal access token was created for this build and is stored at
`scratchpad/sb-token.txt`, and also appears in the session transcript.
Revoke at https://supabase.com/dashboard/account/tokens when the hackathon ends.

### Rotate the Supabase API keys
The publishable and secret keys for this project were shared in plain text
during setup. Rotate both before any real deployment.

---

## Before the campus round (15–16 September)

### Swap the local matcher for AI
`src/lib/matching.js` is built for this — `scoreOpportunities()` is the only
function that changes.

- Implement `scoreWithAI()` against a Supabase edge function that calls the model
- Flip `USE_AI` to `true`
- Keep the local scorer as the fallback path (already wired in the catch block)
- Return the same `MatchResult` shape so nothing downstream changes

### Use the match-outcome data
Every application stores `match_score` and `match_reasons` at the time of
applying. Once there is volume, compare predicted scores against actual
outcomes to measure whether the matcher is any good — and to tune it.

### CV upload and parsing
The `cvs` storage bucket and `profiles.cv_url` column exist but nothing writes
to them yet. Parsing a CV to auto-populate skills would remove the biggest
drop-off point in onboarding (manual skill selection).

---

## Cleanup

- **`CLAUDE.md` / `AGENTS.md`** — currently only carry an Expo version note;
  worth expanding to describe this app rather than inheriting PartyFinder context.
- **Legal screens** — `TermsScreen` and `PrivacyPolicyScreen` still describe
  events, attendance records, and targeted advertising. Rewrite for an
  employability app before any public release.
- **`src/utils/imageUpload.js`** — contains a `claim-documents` upload function
  whose bucket no longer exists. Dead code, safe to delete.
- **App name** — "Springboard" is a placeholder in `app.json`. No bundle
  identifier or EAS project ID is set yet; both are needed before a real build.
- **Push notifications** — `src/utils/notifications.js` needs an EAS `projectId`
  in `app.json` before `getExpoPushTokenAsync` will issue a token.

---

## Known gaps in the current build

- Employers cannot review applicants yet — students apply, but there is no
  employer-side pipeline view.
- No messaging between connections.
- `skills` is a flat `text[]` on both profiles and opportunities. Fine at this
  scale; a normalised join table would be better once the catalogue grows.
- Search is `ilike` against title/company/location. Full-text or semantic search
  is the natural upgrade once AI lands.
