# NexaCore Website Maintenance Backlog

The daily maintenance run (Windows task "NexaCore Maintenance", script
`scripts/maintenance/run-maintenance.ps1`) reads this file, works the top of
**Open**, and updates it. Godwin can add items anywhere in Open; higher means
sooner.

Work happens on branch `site-maintenance`. The run commits but never pushes or
deploys. Godwin reviews and deploys.

## Needs Godwin

- **Apply storage migration** `supabase/migrations/20261021000000_project_files_storage.sql`
  in the Supabase SQL editor (project nmwfevhetlwehbuikflk). Until then, File
  Repository uploads show "File storage is not set up yet".
- **Deploy** branch `site-maintenance` to production (`npx vercel --prod`) after
  reviewing the commits, then merge it into `main`.
- **Delete or wire up** `src/components/admin/AutomatedTaskAssignmentSystem.tsx`.
  It is not used anywhere and is built entirely on mock team members, rules and
  metrics.

## Open

1. Regenerate Supabase types so ERP tables (`erp_projects`, `erp_tasks`,
   `erp_time_entries`, `erp_staff_roles`, `jarvis_tasks`) are typed, then remove
   the `(supabase as any)` casts that exist only because of the missing types.
   Needs the Supabase CLI logged into the right account; if not possible, move to
   Needs Godwin.
2. ESLint pass over `src/components/admin`: fix real problems (unused vars,
   missing hook deps that cause stale data), not style nits.
3. Admin ERP "View All" activity shows a "coming soon" toast
   (`AdminERPTab.tsx`, `view-all-activity`). Build a full activity list from
   `erp_tasks` and `erp_projects`.
4. Workflow builder "Preview" shows "coming soon"
   (`AdvancedWorkflowBuilder.tsx`). Implement a read-only step preview.
5. Audit every remaining admin panel (Users, Team, Proposals, Quotes, Invoices,
   Requests, Messages, Portfolio, Workflows, Settings, Letterhead, Growth) for:
   wrong status values (profiles use `approved`, projects and workflows use
   `in_progress`, erp_tasks starts at `new`), hardcoded or fake data, buttons
   that do nothing, and missing loading or empty states. One panel per run.
6. Staff portal and client portal: same audit as item 5.
7. Public site pages: broken links, placeholder text, outdated content, missing
   page titles and meta descriptions.
8. Bundle size: Vite warns about chunks over 500 kB. Split the largest vendor
   chunks with `manualChunks`.

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
