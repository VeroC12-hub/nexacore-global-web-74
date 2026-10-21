# NexaCore Enterprise AI Platform, Architecture and Build Plan

**Status:** Phase 0 written, not yet applied
**Started:** 2026-07-28
**Mode:** Internal first, multi-tenant shaped (NexaCore Innovations is company #1)

---

## 1. What this is

An AI employee platform: many specialised agents (HR, Finance, Sales, Ops, BI and so on)
sharing one runtime, one knowledge base, one permission model and one cost ledger.

**The core insight:** we already built one of these. JARVIS is agent #0, with a cloud brain
on Vercel/Groq, a heavy brain via Claude Code, Telegram plus a web cockpit, tool calling
loops for Notion and Calendar, reminders, cron briefings and a knowledge base. This platform
is that same pattern generalised, so that agent #2 costs a manifest instead of an app.

**Company #1 is NexaCore Innovations itself**, an Accra based multidisciplinary engineering,
software, creative and data agency. The agents run our own agency operations first. That is
what makes them real before they are sellable.

---

## 2. Critical finding: the repo does not describe production

Inspected 2026-07-28 against the live database (`nmwfevhetlwehbuikflk`) via the REST OpenAPI
spec. **Do not trust `supabase/migrations/` as a description of production.**

* **12 local migrations were never applied remotely**, including
  `20241204_create_erp_foundation.sql`.
* **18 remote migrations have no local file**, applied directly on 2 July, 14 July and
  21 July 2026, presumably through Studio or Lovable.
* Consequently there is **no `tenants` table and no `user_roles` table** in production.

The real shape of production:

| Concern | Actual table |
|---|---|
| Tenant anchor | `erp_companies` (id, name, legal_name, currency, timezone, is_active) |
| Roles | `erp_user_roles` (user_id, company_id, role, department, is_active) |
| Staff detail | `erp_staff_roles` (position, hourly_rate, permissions jsonb) |
| Projects | `erp_projects` (company_id, department, assigned_manager, estimated_hours, actual_hours) |
| Time | `erp_time_entries` (user_id, erp_project_id, hours, billable, status) |

**Consequence:** `supabase db push` must not be run. It would attempt to replay the 12 stale
local migrations against the live database. Apply new SQL through the Supabase SQL editor,
or reconcile the ledger first with `supabase migration repair`.

---

## 3. Starting position by layer

Considerably stronger than the repo suggests, which is the single most important fact for
sequencing. We are extending, not greenfielding.

| Layer | Status | What already exists | What is missing |
|---|---|---|---|
| **1. User Management** | 🟡 ~70% | `erp_companies`, `erp_user_roles`, `erp_staff_roles`, `erp_permissions`, `erp_role_permissions`, `erp_user_permissions`, Supabase Auth | Real `departments` and `teams` tables (currently free text), team membership, agent level permissions |
| **2. AI Brain** | 🟡 ~55% | `@anthropic-ai/sdk`, `openai`, Groq via `api/ai/jarvis.ts`, tool loop in `api/_lib/notion.ts`, marker dispatch, `ai_conversations` and `ai_messages` (with `tokens_used`, `response_time_ms`) | Unified agent runtime, prompt management, per agent memory, model routing |
| **3. Company Knowledge** | 🟡 ~45% | **pgvector already enabled**, `ai_knowledge_base` already has `embedding vector(1536)` plus source_type, tags, metadata; `search_knowledge_base` RPC; `api/ai/embeddings.ts`; `pdfjs-dist` | Document level tracking, chunking and ingestion pipeline, company scoping, citations |
| **4. AI Agents** | 🟡 ~25% | JARVIS proves the whole pattern end to end | Agent registry and manifests, per agent tools and permissions, marketplace UI |
| **5. Automation Engine** | 🟢 ~80% | `workflow_templates`, `workflow_steps`, `workflow_instances`, `workflow_approvals`, `workflow_automation_rules`, `AdvancedWorkflowBuilder.tsx` | AI as a step type, agent triggered workflow starts |
| **6. Integrations** | 🟡 ~40% | Notion (read/write/edit), Google Calendar (read), Telegram webhook, **`google_drive_tokens` and `google_drive_folders`**, Resend, Stripe | Gmail, Slack, M365, GitHub, generic connector framework with OAuth |
| **7. Dashboard** | 🟡 ~50% | `ModernAdminDashboard.tsx`, `AdminAnalytics.tsx`, ERP tabs, `ai_assistant_analytics` | AI usage, cost tracking, agent performance |

**Do not add n8n, Temporal or Trigger.dev.** Layer 5 is the most complete layer we have.
A second orchestrator would fragment it. Wire AI into the existing workflow engine as a new
step type instead.

**Do not build a parallel knowledge base.** `ai_knowledge_base` already has the right
embedding column at the right dimension. It becomes the chunk store.

---

## 4. Architecture

### 4.1 The runtime

Every agent is a **manifest**, not an application:

```
ai_agents (catalog)       key, name, icon, category, system prompt,
                          default tools[], required connectors[]
company_agents (installs) company_id + agent_id + config + permission level
                          + granted connectors + department scope
```

One generic tool calling loop, the `runNotionAgent()` pattern from `api/_lib/notion.ts`
parameterised by manifest, serves all of them. Adding "Procurement AI" is a catalog row plus
any tools it uniquely needs.

**The marketplace is this registry rendered as a page.** Installing an agent is an insert
into `company_agents`. It is not a separate product; it falls out of the design.

### 4.2 Permission model

Carried forward from the guardrail level already chosen for the Notion skill:
**read, append, update, never delete.** Destructive verbs stay off the tool surface entirely
rather than being blocked by prompt instructions. Deletion remains a human action.

### 4.3 Cost ledger

`agent_runs` records every invocation: provider, model, tokens in and out, cost, latency,
tool calls, status. `ai_messages` tracks `tokens_used` but no cost and no tool calls, so this
is genuinely new. It is the only honest way to know whether the platform is economic.

---

## 5. Build order

**Phase 0, Foundation. APPLIED 2026-07-28.**
`supabase/migrations/20260728000000_ai_platform_foundation.sql` plus
`20260728000001_fix_role_resolution.sql`. Departments and teams, agent registry and installs,
`agent_memory`, `knowledge_documents`, `connections`, `agent_runs`, RLS, seeded catalog.
Extends `ai_conversations`, `ai_messages` and `ai_knowledge_base` additively. 77 to 87 tables.

The second migration exists because `erp_user_roles` turned out to be **empty**, which would
have made every new table invisible to every user. Role resolution now falls back to
`profiles` for internal staff while that table is unpopulated.

**Apply DDL through the `exec_sql(query)` RPC**, not `supabase db push`. It takes
multi-statement SQL and is atomic: a failing statement rolls the whole call back.

**Phase 1, Runtime. WORKING 2026-07-28.** `api/_lib/agents/{types,tools,runtime}.ts`. Verified
end to end: the Operations agent answered a live projects question via `projects_read`, logged
to `agent_runs` at 1872 in / 76 out tokens, $0.001165, 1968 ms.

Still to do in this phase: port JARVIS onto the runtime (it currently has its own loop in
`api/_lib/notion.ts`), and expose an HTTP endpoint so the cockpit can call agents by key.

**Phase 2, Knowledge. RETRIEVAL WORKING 2026-07-28; ingestion still to do.**
The 48 existing `ai_knowledge_base` rows are now company-scoped and searchable via
`search_company_knowledge_text`, a full-text RPC that needs no external API key. The agent
answers real questions about our CAD services and pricing process from this content today.

Discovery that changed the plan: **none of those 48 rows had embeddings**, so the missing
`OPENAI_API_KEY` was never the real blocker. The empty vector column was. `knowledge_search`
prefers vectors when they exist and falls back to text, so adding embeddings later is a pure
upgrade with no code change.

Still to do: ingest PDF, DOCX and XLSX into chunks with citations. First corpus is the company
profile, compliance and ethics policy, whistleblower policy, and the four case studies in
`Desktop/NexaCore Innovations`.

**Phase 3, Agent #1: AI Operations Manager.** Runs on `erp_projects`, `erp_tasks`,
`erp_time_entries`, `workflow_instances`. Chosen because it needs no external OAuth, the data
is already populated, and it does not duplicate the Growth Agents Pitch Brain.

**Phase 4, Dashboard.** AI usage, cost and agent performance, reading `agent_runs`.

**Phase 5, Connector framework**, then Gmail and Slack.

**Phase 6, Marketplace UI** and agents #2 to N.

---

## 6. Hard constraints

1. **Claude Pro cannot serve this.** JARVIS costs nothing because it is one person on a
   personal subscription on one laptop. A multi user platform needs the paid API and real per
   company unit economics. This is why `agent_runs` sits in Phase 0, not Phase 4.

2. **M365 and Google Workspace will gate us.** We hit this exactly once already: not being an
   M365 admin killed Graph API access and forced a OneDrive sync fallback. As a vendor it is
   worse, because every customer's IT admin must consent to a NexaCore app. Slack, Notion,
   GitHub and databases are far cheaper to land, so sequence accordingly.

3. **Twelve agents is a program, not a build.** One excellent agent on a real runtime beats
   twelve shallow ones. The registry makes the long tail cheap later.

4. **The migration ledger is broken.** Until it is reconciled, all schema changes go through
   the SQL editor. Fixing it properly means pulling the 18 remote migrations into files and
   running `supabase migration repair --status applied` for the 12 stale local ones.
