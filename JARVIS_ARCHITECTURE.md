# NexaCore JARVIS — Architecture Plan

> Your personal AI operations assistant, built into NexaCore, running on your
> existing Claude **Pro** subscription with **$0 of extra spend**.
> Status: PLAN ONLY — no code written yet. Read this, then we build.

Last updated: 2026-06-14

---

## 1. The vision (what you asked for)

A "JARVIS" that:
- Talks (voice in/out)
- Takes tasks from your phone, anywhere
- Runs on a schedule (briefings, checks, reminders)
- Works across all your apps
- Acts as your marketing team and sales team
- Learns and remembers

All on the Claude Pro subscription you already pay for. No new monthly bills.

---

## 2. The one insight the whole thing rests on

**Your Claude Pro subscription ≠ the Claude API.** They are billed separately.

- The Claude **API** (`ANTHROPIC_API_KEY`) charges per message. Your old
  `claude-telegram-bot` uses this — it would cost money on every reply.
- Your **Pro subscription** powers **Claude Code** (the agent in your terminal).
  Claude Code can run *headless* (`claude -p "do this task"`) and consumes your
  subscription quota — **not** API dollars.

So the design makes **Claude Code the brain**, and everything else is free
plumbing around it. The Telegram bot becomes a *dumb pipe* that never thinks —
it just carries your task to a queue and carries the answer back.

```
 📱 You (Telegram — phone, anywhere)
      │   "audit my Meta ads"  /  voice note  /  "summarize CBI report"
      ▼
 Supabase task queue            ◀── free tier
      │
      ▼
 Worker on your PC  ──▶  runs:  claude -p "<your task>"   ◀── Pro subscription, $0 extra
      │                          (full Claude Code: files, web, ads skills, your apps)
      ▼
 Writes result + status back to Supabase
      │
      ├─▶ 📱 Telegram pings you with the answer
      └─▶ 🖥️  NexaCore dashboard shows task history + lets you speak replies
```

The bot never calls the paid API. The intelligence is Claude Code on your
machine, which already has every capability — your `ads` skills (that's the
marketing team), file access, web search, and your connected apps — for free.

---

## 3. The honest limitations (read these — no surprises later)

1. **Not literally 24/7.** Work runs when your PC is on, or on a schedule.
   A true always-on JARVIS needs a rented server that's awake all the time —
   that costs money. We start PC-based. Upgrading to always-on later is just
   *moving the worker process* to a cheap VM — **no rewrite**, same code.
2. **Pro usage limits are real.** Heavy, constant automation can exhaust your
   Pro quota and throttle your *interactive* Claude usage too. The design is
   deliberately frugal (see §4). If you outgrow it, the fix is a Max upgrade or
   a small API budget for the worker only — your choice, later.
3. **"Sales team" is bounded.** It can draft outreach, follow-ups, qualify and
   track leads. It will **not** blast cold email (spam laws + reputation) or
   autonomously close deals. Human stays in the loop on anything outward-facing.
4. **Voice replies live in the dashboard, not Telegram.** Free browser speech
   synthesis is in the NexaCore web app. Telegram carries text + your voice
   notes in; spoken-back answers happen when you open the dashboard.

---

## 4. Pro-tier design rules (how we stay under the limits)

- **Worker model = Sonnet**, never Opus, for routine tasks. (Opus only if you
  explicitly flag a task "deep".)
- **No constant polling.** The worker runs on a **schedule** (e.g. every 15–30
  min while your PC is on) and **batches** all pending tasks in one wake-up.
- **Scheduled jobs are few and fixed** (e.g. one morning briefing), not chatty.
- **Token-frugal prompts.** The worker passes tight, scoped instructions, not
  your whole history.
- **Hard caps.** Max N tasks per run, max runs per day — configurable, so a
  runaway loop can never silently burn your quota.

---

## 5. Components

| # | Component | Lives in | Language | Cost |
|---|-----------|----------|----------|------|
| 1 | Task queue + memory + results | Supabase (new tables) | SQL | Free tier |
| 2 | The worker (the brain loop) | new `jarvis-worker/` folder | Python or Node | $0 (uses Pro) |
| 3 | Telegram dumb-pipe bot | rewrite of `claude-telegram-bot` | Python | $0 (no API) |
| 4 | Dashboard + voice UI | NexaCore (new admin tab) | React/TS | Free (Vercel) |
| 5 | Scheduler | Claude Code `/schedule` or Windows Task Scheduler | — | $0 |

### Why the worker is its own folder, not inside NexaCore
NexaCore is a *web app* (runs in the browser / on Vercel). The worker is a
*background process on your PC* that shells out to the `claude` CLI. Different
runtimes. The dashboard (in NexaCore) and the worker both talk to the same
Supabase project — that's the integration point.

---

## 6. Supabase schema (new tables)

```sql
-- Tasks you assign from anywhere
create table jarvis_tasks (
  id           uuid primary key default gen_random_uuid(),
  source       text not null,              -- 'telegram' | 'dashboard' | 'schedule'
  request      text not null,              -- what you asked
  status       text not null default 'queued',  -- queued|running|done|error
  priority     int  not null default 5,
  result       text,                       -- Claude Code's output
  error        text,
  model_used   text,
  created_at   timestamptz default now(),
  started_at   timestamptz,
  finished_at  timestamptz
);

-- Things it learns / facts to reuse (complements your memory files)
create table jarvis_memory (
  id          uuid primary key default gen_random_uuid(),
  topic       text not null,
  fact        text not null,
  source_task uuid references jarvis_tasks(id),
  created_at  timestamptz default now()
);

-- Recurring jobs (morning briefing, deploy check, etc.)
create table jarvis_schedules (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  cron        text not null,               -- e.g. '0 7 * * *'
  request     text not null,
  enabled     boolean default true,
  last_run    timestamptz
);

-- Sales / lead tracking (the "sales team" workspace)
create table jarvis_leads (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  contact     text,
  source      text,
  stage       text default 'new',          -- new|contacted|qualified|proposal|won|lost
  notes       text,
  next_action text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
```
RLS: locked to your user only. The worker uses a service role key kept on your
PC (never shipped to the browser).

---

## 7. How each of your 4 wants is delivered

- **Voice** — Telegram voice notes in (free transcription step in the worker);
  spoken replies via the browser Web Speech API in the NexaCore dashboard.
- **Assign tasks from phone** — Telegram, from anywhere. Lands in `jarvis_tasks`.
- **Schedules** — `jarvis_schedules` table + a scheduled worker run. Morning
  briefing (CBI report summary, Vercel deploy status, calendar, Gmail triage).
- **Learns** — every task + result logged; useful facts distilled into
  `jarvis_memory` and my memory files, reused on later tasks.
- **Marketing team** — your installed `ads` skill suite. "Audit my Meta ads",
  "generate e-ventslate campaign creative" → worker runs the skill, returns it.
- **Sales team** — `jarvis_leads` + worker actions: draft follow-ups, qualify,
  summarize pipeline. You approve anything that goes out.

---

## 8. Phased build plan

**Phase 0 — Spine (foundation for all 4)**
- Create the 4 Supabase tables in your NexaCore Supabase project.
- Build the worker loop: poll `jarvis_tasks`, run `claude -p` per queued task,
  write results back. Add the Pro-tier caps (§4).
- Test by inserting a task row by hand and watching it complete.

**Phase 1 — Phone control**
- Rewrite `claude-telegram-bot` as the dumb pipe: message in → insert task;
  worker result → push back to you on Telegram. Lock to your Telegram user ID.

**Phase 2 — Dashboard**
- New "JARVIS" tab in NexaCore: task feed, statuses, results, a box to assign
  tasks, and browser voice-reply on results.

**Phase 3 — Schedules + briefings**
- Wire `jarvis_schedules`; ship the morning briefing job.

**Phase 4 — The teams**
- Marketing: route ad-related tasks through your `ads` skills.
- Sales: lead capture + follow-up drafting on `jarvis_leads`.

**Phase 5 — Voice in**
- Telegram voice-note transcription so you can just talk to it from your phone.

We build and verify one phase at a time. Each phase is usable on its own.

---

## 9. Cost summary

| Item | Cost |
|------|------|
| Claude Code brain (Pro subscription) | already paying |
| Supabase (queue, memory, leads) | free tier |
| Telegram bot | free |
| NexaCore dashboard (Vercel) | free tier |
| Worker on your PC | $0 |
| **Total extra** | **$0/mo** |

Only future *optional* spend, if you outgrow Pro limits or want true 24/7:
Max upgrade, or a small API budget for the worker, or a cheap always-on VM.

### Cost tiers (cheapest first)

The **brain** is the only thing that can cost money. Two ways to pay for it:
your Pro subscription (Claude Code headless = $0 extra) or the Claude API
(pay-per-token). For an *agentic* worker the API is the **expensive** path —
a single tool-looping task burns 50K–200K+ tokens, so ~30 tasks/day runs
~$15–60/mo on Haiku, more on Sonnet, and it's unpredictable. The Pro
subscription is the cheap brain.

Current API token prices (per 1M tokens): Haiku 4.5 $1/$5 · Sonnet 4.6 $3/$15
· Opus 4.8 $5/$25.

| Tier | What you get | Monthly |
|---|---|---|
| **0 — Pure $0** | Brain = Pro. Worker on your PC. Runs when PC is on / scheduled. | **$0** |
| **1 — Always-on, still $0** | Worker + bot on an Oracle Cloud **Always Free** VM, driving Claude Code on your Pro login. True 24/7. | **$0** |
| **2 — Always-on, reliable** | Same, on a cheap VPS (Hetzner ~$4) instead of the free tier. | **~$4–6** |
| **3 — Don't touch Pro limits** | Pro + a **capped** Haiku API budget for the worker only, so automation never eats interactive quota. | **~$5–15** |

Voice stays ~$0 either way (browser speech is free; Telegram voice-note
transcription runs on Groq's free Whisper tier).

**Recommendation:** start at **Tier 0** (this build), graduate to **Tier 1**
($0, always-on) once it's proven. Upgrading tiers never requires a rewrite —
only moving where the worker process runs.

---

## 10. Open decisions before we start Phase 0

1. **Worker language** — Python (matches your existing bot, easy) vs Node
   (matches NexaCore, one fewer toolchain). *Recommendation: Python.*
2. **Same Supabase project as NexaCore, or a separate free project?**
   *Recommendation: same project, new tables — simpler, still free.*
3. **Scheduler** — Claude Code `/schedule` vs Windows Task Scheduler for waking
   the worker. *Recommendation: Windows Task Scheduler (runs even when Claude
   Code isn't open).*
4. Confirm the **Telegram bot** is the phone interface you want (vs a PWA).
