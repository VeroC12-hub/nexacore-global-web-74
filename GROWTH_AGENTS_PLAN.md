# NexaCore Growth Agents — Master Plan

> **Living document.** This is the plan of record for building NexaCore's AI growth engine (marketing, sales, investor, pitch agents). We revert to it every session and update statuses/checkboxes as we go. Owner: Godwin Ocloo.
> Started: 2026-07-28. Last updated: 2026-07-28.

---

## Vision / goal
Make NexaCore Innovations **always able to pitch itself and grow** — 24/7, laptop-independent — so it continuously wins clients, partners, and investors. Built on the existing JARVIS infrastructure (Groq cloud brain on Vercel + Claude Code worker + Supabase queue), at **$0 extra spend**.

## Guiding principles / decisions (locked with Godwin 2026-07-28)
- **Sequence:** Pitch Brain → Website pitch-bot → Sales/lead-gen → Marketing/content → Investor relations. (Ship each well before moving on.)
- **Autonomy = Semi-auto:** low-risk actions auto (log leads, internal notes, reply to inbound site chat); anything outbound to a real person (email, DM, post) is **draft-and-approve**. Never cold-blast.
- **Pitch source:** built from scratch off the live site; Godwin shares documents to sharpen it. Everything pitches from the **Pitch Brain** only — no invented facts.
- **Surfaces:** Admin "Growth" tab (review drafts/pipeline/content) + Telegram/cockpit + laptop.
- **Reuse, don't rebuild:** extend JARVIS (jarvis_tasks queue, api/ai/jarvis.ts, Telegram webhook, Vercel cron, Notion skill). $0 ethos.

## Architecture (how it fits together)
- **Pitch Brain** = `knowledge/nexacore-pitch.md` (canonical) + mirror in `jarvis-worker/knowledge/` (so JARVIS pitches now). Later feeds the website pitch-bot's system prompt.
- **Cloud brain** (`api/ai/jarvis.ts`, Groq, always-on) = powers the website pitch-bot + instant answers.
- **Worker** (`jarvis-worker/worker.py`, Claude Code) = heavy tasks: lead research, drafting long content, deep pitches.
- **Queue/storage** = Supabase `jarvis_tasks` + `jarvis_leads` (pipeline). Reuse `jarvis_memory` for content calendar/drafts if no new table wanted.
- **Review surface** = new Admin "Growth" tab in NexaCore portal.

---

## Roadmap & status

### Phase 0 — Pitch Brain (foundation)  ✅ DONE 2026-07-28
- [x] Extract real positioning from live site (Index/About/Services).
- [x] Write canonical `knowledge/nexacore-pitch.md` (14 sections: one-liner, ICP, 5 pillars, differentiators, proof, process, team, pricing[gap], pitch variants, objection handling, CTAs, gaps).
- [x] Mirror to `jarvis-worker/knowledge/nexacore-pitch.md` + index it → JARVIS can pitch today.
- [x] **v2 upgrade DONE 2026-07-28** from Desktop "NexaCore Innovations" doc set (Company Profile, 4 case studies, partnership proposal, Autodesk agreement). Added: official Autodesk Service Provider + Dassault Systèmes partnerships; 3 named case studies w/ metrics + testimonials (RC Engineering 50%↓ time, FCL Processing 40%↓ rework, FCL Ghana 35%↑ efficiency); certified training line; IoT pillar; full contact/legal entity; indicative pricing.
- [x] **Pricing added 2026-07-28** from the live website rate card (CAD/3D/AI-ML/Blockchain/E-Commerce hourly tiers + project budget bands). MUNISCO Ltd added as client (case study pending).
- [ ] **v3 gaps (Godwin to provide):** MUNISCO case study details (to draft), published rates for Software/Creative/Data/Training, currency policy, investor ask/financials, exact registered legal name, non-CAD case studies, public-use permission for client names, target accounts. (See §15 of the Pitch Brain.)

### Phase 1 — Website pitch-bot (flagship)  ⏳ BUILT 2026-07-28, PENDING DEPLOY
Goal: NexaCore pitches itself to every visitor 24/7 + captures leads.
- [x] Public-safe Pitch Brain: `api/_lib/pitch-brain.ts` (partnerships, services, generic unnamed metrics, published pricing; NO confidential client names).
- [x] Free Groq endpoint `api/ai/pitch.ts` (llama-3.3-70b primary, 8b-instant fallback; sales-concierge persona; no dashes; English; plain text). Route added to `vercel.json`.
- [x] Lead capture: `api/_lib/leads.ts` — model emits `[LEAD] name | contact | need`, endpoint stores to `jarvis_leads` (source='website-pitchbot', stage='new') via Supabase service key. Also accepts a structured `lead` body for a future inline form.
- [x] Reused the existing global widget (`EnhancedAIAssistant`) by pointing `src/lib/aiRouter.ts` `getAIResponse` at `/api/ai/pitch` FIRST (Claude/local kept as fallback). Updated widget copy (removed "Powered by Claude AI"). `npm run build` passes.
- [x] **DEPLOYED to production 2026-07-28** (`vercel --prod`). Live at nexacore-innovations.com (chat bubble bottom-right, every page). Live endpoint `www.nexacore-innovations.com/api/ai/pitch` verified: correct Autodesk-partner answer + pricing.
- [x] Validated locally with real Groq (exact prompt): on-brand answers, correct CAD range, no confidential client names, no dashes, clean `[LEAD]` capture (captured:true). Test lead deleted from `jarvis_leads`.
- [x] **Refinement deployed 2026-07-29:** replies were too long + mispriced. Tightened `api/ai/pitch.ts` SYSTEM (1 to 3 sentences, under 50 words, one point + one question; pricing = only the specific asked service's range, "quoted per scope" for Software/Creative/Data/Training, never a giant span; collect leads in-chat) and capped `max_tokens` to 260. Verified live: mobile-app now "quoted per scope", replies ~30 to 45 words.
- [ ] Preview env could not get GROQ_API_KEY (Vercel CLI non-interactive bug hangs); local `vercel dev` breaks on the SPA catch-all rewrite. So test via prod or local `npm run dev` (UI only).
- [ ] Optional polish: hide the widget on /admin, /jarvis, /dashboard, /staff, client-portal (currently global); add a Growth-tab view of leads (folds into Phase 2 / cross-cutting).

### Phase 2 — Sales / lead-gen agent  ⬜ PLANNED
- [ ] Ingest inbound leads (site forms, service requests, pitch-bot captures) into `jarvis_leads`.
- [ ] Enrich/research each lead (worker heavy task).
- [ ] Draft personalized outreach + follow-ups (draft-and-approve).
- [ ] Pipeline stages + reminders (reuse reminders/cron).

### Phase 3 — Marketing / content agent  ⬜ PLANNED
- [ ] Content calendar; scheduled draft generation (LinkedIn/blog/X) about NexaCore work.
- [ ] Drafts queued to Notion or the Growth tab for approval (draft-and-approve).
- [ ] Optional: repurpose delivered projects into case-study drafts.

### Phase 4 — Investor relations agent  ⬜ PLANNED
- [ ] Maintain a current investor one-pager + metrics snapshot.
- [ ] Research/qualify target investors.
- [ ] Draft monthly investor updates (draft-and-approve).

### Cross-cutting — Admin "Growth" tab  ✅ LIVE 2026-07-29 (leads); drafts/content later
- [x] `src/components/admin/AdminGrowthTab.tsx` + wired into `ModernAdminDashboard.tsx` (lazy import, tab entry with Sparkles icon before Quotes, switch case 'growth'). Reads/writes `jarvis_leads` via anon client (RLS = authenticated full access). Stat cards (total/new/in-progress/won), leads table with editable stage dropdown (new→…→won/lost), inline next-action note, mailto/tel contact links, delete. Deployed to prod.
- [ ] Later: surface drafted outreach (Phase 2) + content calendar (Phase 3) in this same tab.

---

## Open questions / waiting on Godwin
- Documents to upgrade Pitch Brain to v2 (case studies, pricing, targets, testimonials, investor ask).
- Confirm target verticals + any named target accounts for the sales agent.
- Investor ask details (amount, use of funds, traction/revenue) before the investor agent goes live.

## Honest limits (set expectations)
- Draft-only for outbound to real people (no auto-cold-email/DM blasting) — by design + ethics.
- Heavy tasks (deep research, long drafts) need the laptop on; the cloud pitch-bot + instant answers are always on.
- Pricing/case-study claims blocked until Godwin fills the gaps — agents won't invent them.

## Board deliverable
- **Board strategic plan PDF:** `C:\Users\godwi\OneDrive\Desktop\NexaCore Innovations\NexaCore Growth Engine - Board Strategic Plan.pdf` (8 pages, official letterhead, brand-styled). Regenerate/update via `scripts/build_board_pdf.py` (self-contained — renders the letterhead background from `Letterhead.pdf` at runtime; needs `reportlab` + `PyMuPDF`). Edit the `story` in that script and re-run to update.

## Changelog
- 2026-07-28: Plan created. Phase 0 (Pitch Brain) completed → upgraded to v2 with client docs → pricing added from website. Board strategic-plan PDF produced on the official letterhead. Decisions locked (sequence, semi-auto, surfaces).
