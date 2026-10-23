# NexaCore Website Maintenance Backlog

The daily maintenance run (Windows task "NexaCore Maintenance", script
`scripts/maintenance/run-maintenance.ps1`) reads this file, works the top of
**Open**, and updates it. Godwin can add items anywhere in Open; higher means
sooner.

Work happens on branch `site-maintenance`. The run commits but never pushes or
deploys. Godwin reviews and deploys.

## Needs Godwin

- **Apply two storage migrations** in the Supabase SQL editor (project
  nmwfevhetlwehbuikflk), in order:
  `supabase/migrations/20261021000000_project_files_storage.sql` (admin File
  Repository) and `supabase/migrations/20261023000000_portfolio_files_storage.sql`
  (staff portfolio submissions). Until then those uploads fail with an error.
- **Deploy** branch `site-maintenance` to production (`npx vercel --prod`) after
  reviewing the commits, then merge it into `main`.
- **Delete or keep** three unused admin components, none of which appear
  anywhere on the site: `AutomatedTaskAssignmentSystem.tsx` (all mock data),
  `AdvancedWorkflowBuilder.tsx` (its Preview is a stub), and
  `StaffPermissionManagement.tsx`.

## Open

1. Regenerate Supabase types so ERP tables (`erp_projects`, `erp_tasks`,
   `erp_time_entries`, `erp_staff_roles`, `jarvis_tasks`) are typed, then remove
   the `(supabase as any)` casts that exist only because of the missing types.
   Needs the Supabase CLI logged into the right account; if not possible, move to
   Needs Godwin.
2. Proposals: creating a proposal says "Send functionality coming in Phase 6"
   (`proposals/ProposalCreationModal.tsx`). Check whether proposals can be
   emailed elsewhere (Resend is set up) and wire it in.
3. Client invoice detail: Email button is a "coming soon" stub
   (`client/InvoiceDetailModal.tsx` handleEmail). Either implement or remove the
   button.
4. Staff portal: `staff/ModernStaffDashboard.tsx` shows "This ERP module is
   coming soon" for some modules, and `staff/StaffDashboard.tsx` has five
   "coming soon" cards. Check whether StaffDashboard is still used; wire modules
   to the existing ERP components where they exist.
5. Portfolio export: only some formats work, others say "coming soon"
   (`portfolio/PortfolioExport.tsx`). Hide unsupported formats or implement.
6. Audit every remaining admin panel (Users, Team, Proposals, Quotes, Invoices,
   Requests, Messages, Portfolio, Workflows, Settings, Letterhead, Growth) for:
   wrong status values (profiles use `approved`, projects and workflows use
   `in_progress`, erp_tasks starts at `new`), hardcoded or fake data, buttons
   that do nothing, and missing loading or empty states. One panel per run.
7. Lint: 33 `react-hooks/exhaustive-deps` warnings across `src`. Review each for
   stale data bugs; fix real ones only, do not blindly add deps (risk of loops).
8. Public site pages: broken links, placeholder text ("Portfolio Examples Coming
   Soon" on `services/EngineeringTechnical.tsx`), missing titles and meta
   descriptions.
9. Bundle size: Vite warns about chunks over 500 kB. Split the largest vendor
   chunks with `manualChunks`. Build currently takes about 5 minutes.

## Done

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
