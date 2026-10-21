/**
 * Tool registry for the NexaCore agent runtime.
 *
 * Every tool is written once here and can then be granted to any agent via
 * `company_agents.granted_tools`. Tools declare the minimum permission level
 * their install must hold; the runtime filters the tool list before the model
 * ever sees it, so a read-only agent is not merely told not to write, it is
 * never handed a writing tool.
 *
 * All queries are company-scoped through the service-role REST client. The
 * `companyId` always comes from the resolved manifest, never from model output.
 */

import type { AgentTool, ToolContext } from './types.js';

// Read lazily, not at module load: ESM hoists imports above any dotenv call,
// so a module-level capture would be empty in local scripts.
const supabaseUrl = () => process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function rpc(name: string, body: Record<string, unknown>): Promise<any> {
  const resp = await fetch(`${supabaseUrl()}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey(),
      Authorization: `Bearer ${serviceKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!resp.ok) throw new Error(`rpc ${name} ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  return resp.json();
}

async function sb(path: string): Promise<any> {
  const resp = await fetch(`${supabaseUrl()}/rest/v1/${path}`, {
    headers: {
      apikey: serviceKey(),
      Authorization: `Bearer ${serviceKey()}`,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!resp.ok) throw new Error(`supabase ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  return resp.json();
}

/**
 * Annotate a row whose deadline has already passed.
 *
 * Models reliably read dates but do not reliably compare them to today, so a
 * missed deadline can get reported as an upcoming one. Marking it in the data
 * is far more dependable than asking the prompt to notice.
 */
function withDeadlineFlag<T extends Record<string, any>>(row: T): T & { overdue_by_days?: number } {
  const due = row.deadline || row.end_date || row.due_date;
  if (!due || String(row.status).toLowerCase() === 'completed') return row;
  const days = Math.floor((Date.now() - new Date(due).getTime()) / 86_400_000);
  return days > 0 ? { ...row, overdue_by_days: days } : row;
}

/** Compact rows into something token-efficient and readable for the model. */
function table(rows: any[], limit = 40): string {
  if (!rows?.length) return 'No matching records.';
  return rows
    .slice(0, limit)
    .map((r) =>
      Object.entries(r)
        .filter(([, v]) => v !== null && v !== '' && typeof v !== 'object')
        .map(([k, v]) => `${k}=${v}`)
        .join(', '),
    )
    .join('\n');
}

// ── Knowledge (RAG over ai_knowledge_base via match_company_knowledge) ──────

async function embed(text: string): Promise<number[]> {
  const resp = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
    signal: AbortSignal.timeout(15000),
  });
  if (!resp.ok) throw new Error(`embeddings ${resp.status}`);
  return (await resp.json()).data[0].embedding;
}

const knowledgeSearch: AgentTool = {
  name: 'knowledge_search',
  description:
    'Search the company knowledge base (policies, company profile, case studies, past proposals) for passages relevant to a question. Returns excerpts with their source document titles. Use this before answering anything about company policy, positioning, or past work.',
  requires: 'read',
  parameters: {
    type: 'object',
    properties: { query: { type: 'string', description: 'what to look for' } },
    required: ['query'],
  },
  handler: async (ctx, args) => {
    const query = String(args.query || '').trim();
    if (!query) return 'No query supplied.';

    const format = (hits: any[]) =>
      hits
        .map(
          (h: any) =>
            `[${h.title}${h.page_number ? ` p${h.page_number}` : ''}] ${String(h.content).slice(0, 600)}`,
        )
        .join('\n\n');

    // Prefer semantic search when it is actually available. Today the
    // embedding column is entirely unpopulated and there is no OpenAI key,
    // so this is skipped and full-text carries the load. Kept so that
    // populating embeddings later is a pure upgrade with no code change.
    if (process.env.OPENAI_API_KEY) {
      try {
        const hits = await rpc('match_company_knowledge', {
          p_company_id: ctx.companyId,
          p_query_embedding: await embed(query),
          p_match_count: 4,
        });
        if (hits?.length) return format(hits);
      } catch {
        // fall through to text search
      }
    }

    const hits = await rpc('search_company_knowledge_text', {
      p_company_id: ctx.companyId,
      p_query: query,
      p_match_count: 4,
    });
    if (!hits?.length) return 'No relevant passages found in the knowledge base.';
    return format(hits);
  },
};

const clientProjectsRead: AgentTool = {
  name: 'client_projects_read',
  description:
    'List client-facing projects with status, progress, budget, spend, hours and deadlines. This is the client delivery portfolio, distinct from internal projects returned by projects_read. Check both when asked about overall delivery.',
  requires: 'read',
  parameters: {
    type: 'object',
    properties: { status: { type: 'string', description: 'optional status filter' } },
  },
  handler: async (_ctx, args) => {
    const filter = args.status ? `&status=eq.${encodeURIComponent(String(args.status))}` : '';
    const rows = await sb(
      `projects?select=title,status,priority,progress,completion_percentage,budget,spent_amount,` +
        `estimated_hours,actual_hours,start_date,end_date,deadline,service_type${filter}&limit=50&order=deadline.asc`,
    );
    return table((rows || []).map(withDeadlineFlag));
  },
};

// ── ERP reads ──────────────────────────────────────────────────────────────

const projectsRead: AgentTool = {
  name: 'projects_read',
  description:
    'List projects for this company with status, progress, budget, hours and assigned manager. Optionally filter by status (planning, in_progress, on_hold, completed, cancelled, review).',
  requires: 'read',
  parameters: {
    type: 'object',
    properties: {
      status: { type: 'string', description: 'optional status filter' },
    },
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Number(args.limit) || 25, 100);
    const filter = args.status ? `&status=eq.${encodeURIComponent(String(args.status))}` : '';
    const rows = await sb(
      `erp_projects?select=title,status,priority,progress,budget,actual_cost,estimated_hours,actual_hours,start_date,end_date,department` +
        `&company_id=eq.${ctx.companyId}${filter}&limit=${limit}&order=end_date.asc`,
    );
    return table((rows || []).map(withDeadlineFlag));
  },
};

const tasksRead: AgentTool = {
  name: 'tasks_read',
  description:
    'List tasks for this company, optionally filtered by status or overdue. Use to find what is blocking or slipping.',
  requires: 'read',
  parameters: {
    type: 'object',
    properties: {
      status: { type: 'string' },
      overdue: { type: 'string', enum: ['true', 'false'], description: 'only tasks past their due date' },
    },
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Number(args.limit) || 30, 100);
    const parts = [`limit=${limit}`, 'order=due_date.asc'];
    if (args.status) parts.push(`status=eq.${encodeURIComponent(String(args.status))}`);
    if (String(args.overdue) === 'true') parts.push(`due_date=lt.${new Date().toISOString().slice(0, 10)}`);
    // erp_tasks joins to projects for company scoping.
    const rows = await sb(
      `erp_tasks?select=title,status,priority,due_date,estimated_hours,actual_hours,erp_projects!inner(title,company_id)` +
        `&erp_projects.company_id=eq.${ctx.companyId}&${parts.join('&')}`,
    );
    return table(
      (rows || []).map((r: any) =>
        withDeadlineFlag({ ...r, project: r.erp_projects?.title, erp_projects: undefined }),
      ),
    );
  },
};

const timeEntriesRead: AgentTool = {
  name: 'time_entries_read',
  description:
    'Read logged time entries, with hours, billable flag and approval status. Use to find unlogged or unbilled work and to gauge capacity. Optionally filter by date range (YYYY-MM-DD).',
  requires: 'read',
  parameters: {
    type: 'object',
    properties: {
      since: { type: 'string', description: 'start date YYYY-MM-DD' },
      until: { type: 'string', description: 'end date YYYY-MM-DD' },
    },
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Number(args.limit) || 50, 200);
    const parts = [`limit=${limit}`, 'order=date.desc'];
    if (args.since) parts.push(`date=gte.${encodeURIComponent(String(args.since))}`);
    if (args.until) parts.push(`date=lte.${encodeURIComponent(String(args.until))}`);
    const rows = await sb(
      `erp_time_entries?select=date,hours,billable,status,description,erp_projects!inner(title,company_id)` +
        `&erp_projects.company_id=eq.${ctx.companyId}&${parts.join('&')}`,
    );
    if (!rows?.length) {
      // Distinguish "nothing in range" from "nobody logs time here at all",
      // so the agent reports the tracking gap instead of implying zero work.
      return (
        'No time entries found. The time-entry log is empty for this company, so no one is ' +
        'currently recording hours. Use workload_read for committed estimates instead, and say ' +
        'plainly that actual effort is not being tracked rather than reporting zero work done.'
      );
    }
    return table(
      rows.map((r: any) => ({ ...r, project: r.erp_projects?.title, erp_projects: undefined })),
    );
  },
};

/**
 * Committed workload per person.
 *
 * This exists because erp_time_entries is empty and every actual_hours field
 * is zero: the company records plans but not execution. Rather than reporting
 * "no records" and stopping, this aggregates the planning data that IS real
 * (assignments, estimates, due dates) and states plainly how much execution
 * has been logged, so the gap itself becomes the answer.
 */
const workloadRead: AgentTool = {
  name: 'workload_read',
  description:
    'Committed workload per person: how many tasks they are assigned, total estimated hours, how many are overdue, and how many hours have actually been recorded against them. Use this for capacity, workload and delivery-risk questions.',
  requires: 'read',
  parameters: { type: 'object', properties: {} },
  handler: async (ctx) => {
    const today = new Date().toISOString().slice(0, 10);
    const [tasks, people] = await Promise.all([
      sb(
        `erp_tasks?select=title,status,estimated_hours,actual_hours,due_date,assigned_to,` +
          `erp_projects!inner(title,company_id)&erp_projects.company_id=eq.${ctx.companyId}&limit=500`,
      ),
      sb(`profiles?select=id,full_name,email&limit=200`),
    ]);

    if (!tasks?.length) return 'No tasks are assigned for this company.';

    const nameOf = new Map<string, string>(
      (people || []).map((p: any) => [p.id, p.full_name || p.email || p.id.slice(0, 8)]),
    );

    const byPerson = new Map<string, { tasks: number; est: number; act: number; overdue: number }>();
    let totalEst = 0;
    let totalAct = 0;
    let totalOverdue = 0;

    for (const t of tasks) {
      const who = t.assigned_to ? nameOf.get(t.assigned_to) || 'unknown user' : 'unassigned';
      const row = byPerson.get(who) || { tasks: 0, est: 0, act: 0, overdue: 0 };
      const est = Number(t.estimated_hours) || 0;
      const act = Number(t.actual_hours) || 0;
      const overdue = t.due_date && t.due_date < today && t.status !== 'completed' ? 1 : 0;
      row.tasks += 1;
      row.est += est;
      row.act += act;
      row.overdue += overdue;
      byPerson.set(who, row);
      totalEst += est;
      totalAct += act;
      totalOverdue += overdue;
    }

    const lines = [...byPerson.entries()]
      .sort((a, b) => b[1].est - a[1].est)
      .map(
        ([who, r]) =>
          `${who}: ${r.tasks} tasks, ${r.est}h estimated, ${r.act}h recorded, ${r.overdue} overdue`,
      );

    lines.push(
      `TOTALS: ${tasks.length} tasks, ${totalEst}h estimated, ${totalAct}h recorded, ${totalOverdue} overdue`,
    );

    if (totalAct === 0) {
      lines.push(
        'NOTE: zero hours have been recorded against any task, and the time-entry log is empty. ' +
          'Estimates and assignments are real, but there is no execution data, so actual progress cannot be measured from this system.',
      );
    }

    return lines.join('\n');
  },
};

const teamRead: AgentTool = {
  name: 'team_read',
  description: 'List active staff with their role and department. Use to understand who is available.',
  requires: 'read',
  parameters: { type: 'object', properties: {} },
  handler: async () => {
    const rows = await sb(`erp_staff_roles?select=role,department,position,is_active&is_active=eq.true&limit=50`);
    return table(rows);
  },
};

const invoicesRead: AgentTool = {
  name: 'invoices_read',
  description: 'Read invoices with amount, status and dates. Use for receivables and unbilled work questions.',
  requires: 'read',
  parameters: {
    type: 'object',
    properties: { status: { type: 'string' } },
  },
  handler: async (_ctx, args) => {
    const limit = Math.min(Number(args.limit) || 30, 100);
    const filter = args.status ? `&status=eq.${encodeURIComponent(String(args.status))}` : '';
    const rows = await sb(`invoices?select=*${filter}&limit=${limit}&order=created_at.desc`);
    return table(rows);
  },
};

// ── Registry ───────────────────────────────────────────────────────────────

export const TOOL_REGISTRY: Record<string, AgentTool> = Object.fromEntries(
  [knowledgeSearch, projectsRead, clientProjectsRead, tasksRead, workloadRead, timeEntriesRead, teamRead, invoicesRead].map(
    (t) => [t.name, t],
  ),
);

/** Tool definitions in OpenAI/Groq function-calling shape. */
export function toolSchemas(tools: AgentTool[]) {
  return tools.map((t) => ({
    type: 'function',
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));
}

export async function execTool(
  tool: AgentTool | undefined,
  ctx: ToolContext,
  args: Record<string, any>,
): Promise<string> {
  if (!tool) return 'Error: unknown or ungranted tool.';
  try {
    return await tool.handler(ctx, args);
  } catch (e: any) {
    return `Error: ${String(e?.message || e).slice(0, 300)}`;
  }
}
