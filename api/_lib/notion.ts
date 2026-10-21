/**
 * Notion skill for the JARVIS cloud brain (shared by the Telegram webhook and
 * the /jarvis cockpit endpoint).
 *
 * The main brain (Groq gpt-oss-120b, with web search) handles normal chat. When
 * it decides a request needs Godwin's Notion, it emits the marker `[NOTION] ...`
 * and the caller hands off to `runNotionAgent()` here — a small tool-calling loop
 * on gpt-oss-120b that can search, read, and append to the pages the JARVIS
 * Notion integration has been shared on.
 *
 * Guardrails (matches what Godwin chose): read + append + update only. No delete.
 * The integration can only ever see pages explicitly connected to it in Notion.
 *
 * Env: NOTION_TOKEN, GROQ_API_KEY, optional NOTION_COMPANY_PAGE_ID.
 */

const NOTION_TOKEN = process.env.NOTION_TOKEN || '';
const NOTION_VERSION = '2022-06-28';
const COMPANY_PAGE_ID = process.env.NOTION_COMPANY_PAGE_ID || '';
const TOOL_MODEL = process.env.GROQ_TOOL_MODEL || 'openai/gpt-oss-120b';
const TOOL_FALLBACK = process.env.GROQ_TOOL_FALLBACK || 'openai/gpt-oss-20b'; // higher TPM, supports tools

export const NOTION_MARKER = '[NOTION]';

interface Msg { role: 'system' | 'user' | 'assistant' | 'tool'; content: string; tool_call_id?: string; tool_calls?: any[]; name?: string; }

async function notionApi(path: string, method = 'GET', body?: unknown): Promise<any> {
  const resp = await fetch(`https://api.notion.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.message || `notion ${resp.status}`);
  return data;
}

function pageTitle(page: any): string {
  const props = page?.properties || {};
  for (const key of Object.keys(props)) {
    const p = props[key];
    if (p?.type === 'title') return (p.title || []).map((t: any) => t.plain_text).join('') || '(untitled)';
  }
  return page?.title?.map?.((t: any) => t.plain_text).join('') || '(untitled)';
}

function blockText(block: any): string {
  const t = block?.[block.type];
  const rich = t?.rich_text || t?.caption;
  if (Array.isArray(rich)) {
    const text = rich.map((r: any) => r.plain_text).join('');
    if (block.type.startsWith('heading')) return `\n${text}`;
    if (block.type === 'to_do') return `- [${t.checked ? 'x' : ' '}] ${text}`;
    if (block.type.includes('list_item')) return `- ${text}`;
    return text;
  }
  return '';
}

// ── the three tools ────────────────────────────────────────────────────────
async function notionSearch(query: string): Promise<string> {
  const data = await notionApi('search', 'POST', { query, page_size: 10 });
  const rows = (data.results || []).map((r: any) => ({
    id: r.id,
    type: r.object,
    title: r.object === 'page' ? pageTitle(r) : (r.title?.map?.((t: any) => t.plain_text).join('') || '(db)'),
  }));
  return rows.length ? JSON.stringify(rows) : 'No matching pages. (The integration only sees pages it has been shared on.)';
}

async function notionReadPage(pageId: string): Promise<string> {
  const page = await notionApi(`pages/${pageId}`);
  const blocks = await notionApi(`blocks/${pageId}/children?page_size=100`);
  const body = (blocks.results || []).map(blockText).filter(Boolean).join('\n');
  return `# ${pageTitle(page)}\n\n${body}`.slice(0, 3500);
}

function richPlain(block: any): string {
  const t = block?.[block.type];
  const rich = t?.rich_text;
  return Array.isArray(rich) ? rich.map((r: any) => r.plain_text).join('') : '';
}

async function notionEdit(pageId: string, find: string, replace: string): Promise<string> {
  if (!find) return 'Tell me which text to replace (the "find" text).';
  const blocks = await notionApi(`blocks/${pageId}/children?page_size=100`);
  const lc = find.toLowerCase();
  for (const b of blocks.results || []) {
    const cur = richPlain(b);
    if (cur && cur.toLowerCase().includes(lc)) {
      const next = cur.split(find).join(replace);
      await notionApi(`blocks/${b.id}`, 'PATCH', {
        [b.type]: { rich_text: [{ type: 'text', text: { content: next.slice(0, 1900) } }] },
      });
      return `Updated that line to: "${next.slice(0, 200)}"`;
    }
  }
  return `Couldn't find a line containing "${find}" on that page. Read the page first to get the exact wording.`;
}

async function notionAppend(pageId: string, text: string): Promise<string> {
  const children = text.split('\n').filter((l) => l.trim()).map((line) => ({
    object: 'block',
    type: 'paragraph',
    paragraph: { rich_text: [{ type: 'text', text: { content: line.slice(0, 1900) } }] },
  }));
  await notionApi(`blocks/${pageId}/children`, 'PATCH', { children });
  return `Appended ${children.length} line(s) to the page.`;
}

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'notion_search',
      description: "Search Godwin's Notion for pages by keyword. Returns matching pages with their ids and titles.",
      parameters: { type: 'object', properties: { query: { type: 'string', description: 'keywords to search for' } }, required: ['query'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'notion_read_page',
      description: 'Read the full text of a Notion page by its id.',
      parameters: { type: 'object', properties: { page_id: { type: 'string' } }, required: ['page_id'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'notion_append',
      description: 'Append new text (one paragraph per line) to the end of a Notion page by its id. Use this to add notes. Does not delete or overwrite anything.',
      parameters: { type: 'object', properties: { page_id: { type: 'string' }, text: { type: 'string' } }, required: ['page_id', 'text'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'notion_edit',
      description: 'Replace text on an existing line/block of a page. Finds the line containing "find" and substitutes it with "replace". Use to fill in a placeholder or correct a value (e.g. fill in an address). Read the page first to get the exact wording of the text to find.',
      parameters: { type: 'object', properties: { page_id: { type: 'string' }, find: { type: 'string', description: 'exact existing text to locate' }, replace: { type: 'string', description: 'text to substitute in' } }, required: ['page_id', 'find', 'replace'] },
    },
  },
];

async function execTool(name: string, args: any): Promise<string> {
  try {
    if (name === 'notion_search') return await notionSearch(String(args.query || ''));
    if (name === 'notion_read_page') return await notionReadPage(String(args.page_id || ''));
    if (name === 'notion_append') return await notionAppend(String(args.page_id || ''), String(args.text || ''));
    if (name === 'notion_edit') return await notionEdit(String(args.page_id || ''), String(args.find || ''), String(args.replace || ''));
    return `Unknown tool: ${name}`;
  } catch (e: any) {
    return `Error: ${String(e?.message || e).slice(0, 300)}`;
  }
}

async function groqWithToolsModel(messages: Msg[], model: string): Promise<Response> {
  return fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, tools: TOOLS, temperature: 0.3, max_tokens: 2048 }),
    signal: AbortSignal.timeout(45000),
  });
}

async function groqWithTools(messages: Msg[]): Promise<any> {
  let resp = await groqWithToolsModel(messages, TOOL_MODEL);
  if (resp.status === 429 || resp.status >= 500) {
    // Rate-limited or transient on the big model — fall back to the lighter, higher-TPM one.
    resp = await groqWithToolsModel(messages, TOOL_FALLBACK);
  }
  if (!resp.ok) throw new Error(`groq tools ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  return (await resp.json()).choices?.[0]?.message;
}

/**
 * Run the Notion tool-calling loop and return a plain-text answer for the user.
 * `request` is the user's actual message; `history` is recent conversation context.
 */
export async function runNotionAgent(
  request: string,
  history: { role: 'user' | 'assistant'; content: string }[] = [],
): Promise<string> {
  if (!NOTION_TOKEN) return "Notion isn't connected yet, so I can't reach your workspace.";

  const system = `You are JARVIS helping Godwin with his Notion workspace. Use the tools to actually look things up or write — never invent page contents or claim you did something you didn't.
${COMPANY_PAGE_ID ? `His main company page is "CBI Ghana — Company Info", page id ${COMPANY_PAGE_ID} — use it directly for company questions or notes without searching first.` : ''}
IMPORTANT: Only append/write when Godwin EXPLICITLY asks you to add, save, note, or record something. For questions and lookups, just read and answer — never add anything to a page unasked.
You can read, search, append (add) content, and edit/replace text on an existing line (notion_edit) — e.g. fill in a placeholder like an address. To edit, first read the page to get the exact wording, then call notion_edit with that exact text as "find". You cannot delete whole blocks.
CRITICAL editing rule: only ever change the exact line Godwin asked about. If notion_edit reports the "find" text wasn't found, do NOT edit a different line and do NOT guess — tell him you couldn't find that line and ask for the exact wording. Never improvise which line to change.
Reply in plain text (no markdown symbols), warm and concise.`;

  const messages: Msg[] = [
    { role: 'system', content: system },
    ...history.slice(-6).map((m) => ({ role: m.role, content: m.content } as Msg)),
    { role: 'user', content: request },
  ];

  for (let i = 0; i < 5; i++) {
    const msg = await groqWithTools(messages);
    if (!msg) return "I couldn't reach my Notion reasoning step — try again in a moment.";
    const calls = msg.tool_calls || [];
    if (!calls.length) return (msg.content || '').trim() || '(no reply)';

    messages.push({ role: 'assistant', content: msg.content || '', tool_calls: calls });
    for (const c of calls) {
      let args: any = {};
      try { args = JSON.parse(c.function?.arguments || '{}'); } catch { /* ignore */ }
      const result = await execTool(c.function?.name, args);
      messages.push({ role: 'tool', tool_call_id: c.id, name: c.function?.name, content: result.slice(0, 6000) });
    }
  }
  // Ran out of tool iterations — ask the model for a final answer with no tools.
  const finalResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: TOOL_MODEL, messages, temperature: 0.3, max_tokens: 2048 }),
    signal: AbortSignal.timeout(30000),
  });
  const data = await finalResp.json().catch(() => ({}));
  return (data.choices?.[0]?.message?.content || 'I looked but couldn’t wrap that up cleanly — try rephrasing?').trim();
}
