# NexaCore Website Maintenance Backlog

The daily maintenance run (Windows task "NexaCore Maintenance", script
`scripts/maintenance/run-maintenance.ps1`) reads this file, works the top of
**Open**, and updates it. Godwin can add items anywhere in Open; higher means
sooner.

Work happens on branch `site-maintenance`. The run commits but never pushes or
deploys. Godwin reviews and deploys.

**Shared database:** Supabase project nmwfevhetlwehbuikflk also hosts the
Eltuff app (schema `eltuff`, the `product-images` bucket, the "Eltuff staff ..."
storage policies, edge function `admin-create-user`). Never change or remove
those when working on NexaCore.

## Needs Godwin

- **URGENT, run migration `20261024010000_profiles_privilege_guard.sql`:**
  any signed-in user could set their own profile role to `admin`, and every
  public signup (role `member`) counted as internal staff. Not applied yet.
- **Eltuff app (not NexaCore, not changed):** `eltuff.handle_new_user` takes
  the role from signup metadata, so anyone can sign up to Eltuff as `admin`.
  Fix it in the Eltuff project.

- **Client payments:** there is no working online payment. Client portals now
  show honest "ask for payment details" instructions instead of fake card
  forms. Decide the payment route (Paystack, MTN MoMo, Stripe, or bank
  transfer only) and supply the real bank / MoMo details, then re-enable.
  The `payments` table points at a legacy `bookings` table, so it needs a
  small schema fix as part of that.
- **Phone numbers disagree:** Contact page and Footer show +233 20 962 8907,
  the Footer also shows +233 50 158 8710, and Book Consultation calls and
  WhatsApps +233 55 833 0610. Say which is correct for each use.
- **Engineering services page case studies and testimonials:** check they
  describe real clients and results; buttons for case study pages and video
  testimonials that do not exist were removed.
- **Client portal Services page** lists generic services (Web Development,
  Mobile, Digital Marketing, Cloud). Confirm whether that matches what NexaCore
  sells.

- **Deploy** branch `site-maintenance` to production (`npx vercel --prod`) after
  reviewing the commits, then merge it into `main`.
- **Delete or keep** four unused components, none of which appear anywhere on
  the site: `admin/AutomatedTaskAssignmentSystem.tsx` (all mock data),
  `admin/AdvancedWorkflowBuilder.tsx` (its Preview is a stub),
  `admin/StaffPermissionManagement.tsx`, and `staff/StaffDashboard.tsx`
  (replaced by ModernStaffDashboard).
- **Proposal emails:** "Send" on a proposal only marks it sent; no email goes
  out (the message now says so). Decide whether proposals should be emailed
  automatically, from which address, and as a PDF attachment or a link to a
  client page. Same question for the message composer's "Send email
  notification" checkbox, which currently does nothing.
- **Staff portal menu:** 13 of 18 items (Calendar, Documents, Contacts,
  Communication, CRM, Sales, Inventory, Accounting, HR, Reporting, Workflow,
  Business Intelligence, Administration, System) open a "coming soon" page.
  Recommendation: hide them until built. Say the word and it is a small change.
- **Public quote confirmation email** (`quote_request_confirmation` in
  send-email) can still be triggered for any address by anyone; content is now
  escaped, so the risk is low-volume nuisance mail. Fixing it properly needs
  rate limiting or a captcha on the Get Started form.

## Open

1. Audit every remaining admin panel (Users, Team, Proposals, Quotes, Invoices,
   Requests, Messages, Portfolio, Workflows, Settings, Letterhead, Growth) for:
   wrong status values (profiles use `approved`, projects and workflows use
   `in_progress`, erp_tasks starts at `new`), hardcoded or fake data, buttons
   that do nothing (search for `<Button` without `onClick` or `type="submit"`),
   and missing loading or empty states. One panel per run.
2. Client portal: same audit as item 1.
3. Lint: 33 `react-hooks/exhaustive-deps` warnings across `src`. Review each for
   stale data bugs; fix real ones only, do not blindly add deps (risk of loops).
4. Public site pages: broken links, placeholder text ("Portfolio Examples Coming
   Soon" on `services/EngineeringTechnical.tsx`), missing titles and meta
   descriptions.
5. Bundle size: Vite warns about chunks over 500 kB. Split the largest vendor
   chunks with `manualChunks`. Build currently takes about 5 to 6 minutes.

## Done

- 2026-10-24: Admin API (`/api/admin/*`) now verifies the caller's Supabase
  token and role in `api/admin/[action].ts`. Before, delete-user trusted an
  admin id from the request body, and send-project-emails was an open,
  unescaped email relay. Emails now go only to staff profiles, HTML escaped.
- 2026-10-24: Team "Add Member" uses a server invite (`invite-member`) instead
  of a browser signUp with a throwaway password; role list matches the
  database (three roles always failed); invite links go to
  `/auth/reset-password` (old `/reset-password` was a dead link).
- 2026-10-24: Project Analytics: removed fake trend lines; On-Time Delivery and
  Team Utilization (always ~100% and 0%) replaced by Overdue Projects and
  Average Completion.

- 2026-10-21: Fixed all 80 TypeScript errors (duplicate exports in
  performanceOptimization/seoAnalytics, gtag globals, PDF letterhead types,
  growth view type).
- 2026-10-21: ERP overview activity feed and upcoming tasks now live data (were
  fake John Doe / Jane Smith entries). ERP search now searches real projects and
  tasks.
- 2026-10-21: Duplicate Task fixed (status `todo` rejected by constraint, now
  `new`).
- 2026-10-21: File uploads now store real files (were simulated); download and
  delete use storage. Fixed File spread losing name/size/type.
- 2026-10-23: ERP Time tab crashed on every load (hook called after early
  return). Fixed.
- 2026-10-23: ERP overview View All works; Create Invoice / Add Client quick
  actions open the real Invoices and Users panels instead of "Phase 7" toasts.
- 2026-10-23: Client portal invoice card Download now generates the real PDF.
- 2026-10-23: Staff portfolio submissions now upload files (were never stored).
- 2026-10-23: ERP bulk Export of tasks and projects works (modals were passed
  empty lists).
- 2026-10-23: Proposals: Send in the creation modal now marks the proposal sent
  (was "coming in Phase 6"); the sent message no longer claims an email went
  out.
- 2026-10-23: Security: email edge functions escape all caller input and only
  staff can send quote emails to a chosen address; stopped logging client
  personal data. Needs deploying (see Needs Godwin).
- 2026-10-23: Client invoice detail: Pay Now did nothing, now opens the payment
  window; removed the dead Email button.
- 2026-10-23: Portfolio export: removed PowerPoint, Web and Excel options that
  only said "coming soon"; PDF remains.
- 2026-10-23: Godwin deployed both secured email functions (send-email,
  send-enhanced-quote-emails). Phishing hole closed in production.
- 2026-10-23: Regenerated `src/integrations/supabase/types.ts` from the live
  database (`npx supabase gen types typescript --project-id nmwfevhetlwehbuikflk
  --schema public`). ERP and JARVIS tables are now typed; removed the casts in
  ERP overview and export code. Casts remain only where TypeScript hits its
  depth limit (EnhancedProjectManagement, ModernStaffDashboard) and in Jarvis.tsx.
- 2026-10-23: Both storage migrations applied in production and verified
  (project-files private, portfolio-files public, 4 policies).
- 2026-10-24: Audited all deployed edge functions. create-payment is a
  login-gated placeholder (no money moves); admin-create-user belongs to Eltuff
  and correctly checks the caller's Eltuff admin/staff role. No further holes.
- 2026-10-24: Vercel deploys were failing (14 functions, Hobby limit 12).
  Merged admin endpoints into api/admin/[action].ts. Production live again.
- 2026-10-24: Admin dashboard: replaced invented figures (12.5% growth, 98%
  satisfaction, 92% efficiency), revenue counts paid invoices only, badge
  counts are real.
- 2026-10-24: Client payments: removed the fake Visa success and the
  placeholder bank details (account 1234567890, a real US routing number).
- 2026-10-24: Client portal: unpaid badge, Pay Now, Make Payment, project
  statuses, progress, drafts hidden, message replies, signed file downloads,
  stored invoice line items in views and PDFs.
- 2026-10-24: Staff portal: own tasks and hours only, real open-task count,
  task status picker, working New Task and Log Time.
- 2026-10-24: ERP lock-down migration applied. Verified as real accounts: a
  client sees 0 ERP rows, a developer still sees 4 projects and 20 tasks.
- 2026-10-24: Admin invoices: creating an invoice always failed (status
  'pending' rejected by the database); now drafts with Send and Mark Paid.
  Service requests: approve/reject never appeared for new ('submitted')
  requests; fixed, plus a details view.
- 2026-10-24: Dead buttons: ~25 across the public site, staff portal and admin
  now link to real pages or work; ones promising content that does not exist
  were removed.
