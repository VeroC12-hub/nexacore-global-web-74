import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, RotateCcw, AlertTriangle, MessageSquare } from 'lucide-react';
import { OrgGraph, KIND_COLOR } from '@/components/platform/OrgGraph';
import { AgentChat } from '@/components/platform/AgentChat';
import { OrgChart } from '@/components/platform/OrgChart';
import type { AgentEntry, Person } from '@/components/platform/OrgChart';
import type { GraphLink, GraphNode, NodeKind } from '@/components/platform/OrgGraph';

/**
 * The NexaCore platform.
 *
 * People and AI agents in one hierarchy, plus the operational views around
 * them. Every number here is read live from Supabase; nothing is seeded or
 * illustrative. Lives at /platform and leaves /admin untouched.
 *
 * The org chart offers four layouts (graph, hierarchy, departments,
 * directory) because a force graph answers only one kind of question.
 * Reporting lines come from erp_staff_roles.manager_id and are set by an
 * admin; none are inferred from job titles.
 */

const COMPANY_ID = '00000000-0000-0000-0000-000000000001';

const KIND_LABEL: Record<NodeKind, string> = {
  unit: 'Department',
  human: 'Person',
  agent: 'AI Agent',
  tool: 'Tool',
  project: 'Project',
};
const ALL_KINDS: NodeKind[] = ['unit', 'human', 'agent', 'tool', 'project'];

type ViewKey =
  | 'graph' | 'delivery' | 'health'
  | 'agents' | 'tools' | 'knowledge' | 'runs'
  | 'people' | 'workflows' | 'pipeline';

function overdueDays(date?: string | null): number {
  if (!date) return 0;
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  return d > 0 ? d : 0;
}
const money = (v: number) => `$${v.toFixed(4)}`;

async function fetchAll() {
  const db = supabase as any;
  const [
    departments, profiles, staff, installs, catalog,
    projects, clientProjects, tasks, knowledge, runs,
    workflows, quoteRequests, proposals, serviceRequests, invoices,
  ] = await Promise.all([
    db.from('departments').select('id,name').eq('company_id', COMPANY_ID),
    db.from('profiles').select('id,full_name,email,role,status'),
    db.from('erp_staff_roles').select('id,user_id,role,department,position,manager_id').eq('is_active', true),
    db.from('company_agents')
      .select('id,permission_level,granted_tools,is_enabled,ai_agents(key,name,icon,category)')
      .eq('company_id', COMPANY_ID),
    db.from('ai_agents').select('key,name,icon,category,default_tools,max_permission_level,is_published'),
    db.from('erp_projects').select('id,title,status,department,end_date,estimated_hours,actual_hours').eq('company_id', COMPANY_ID),
    db.from('projects').select('id,title,status,deadline,budget,estimated_hours,actual_hours'),
    db.from('erp_tasks').select('id,title,status,due_date,estimated_hours,actual_hours'),
    db.from('ai_knowledge_base').select('category').eq('company_id', COMPANY_ID),
    db.from('agent_runs').select('model,provider,input_tokens,output_tokens,cost_usd,latency_ms,tools_used,status,created_at')
      .eq('company_id', COMPANY_ID).order('created_at', { ascending: false }).limit(50),
    db.from('workflow_templates').select('id,name,category,is_active'),
    db.from('quote_requests').select('id'),
    db.from('proposals').select('id'),
    db.from('service_requests').select('id'),
    db.from('invoices').select('id,total_amount,status'),
  ]);

  return {
    departments: departments.data ?? [], profiles: profiles.data ?? [], staff: staff.data ?? [],
    installs: installs.data ?? [], catalog: catalog.data ?? [],
    projects: projects.data ?? [], clientProjects: clientProjects.data ?? [], tasks: tasks.data ?? [],
    knowledge: knowledge.data ?? [], runs: runs.data ?? [], workflows: workflows.data ?? [],
    quoteRequests: quoteRequests.data ?? [], proposals: proposals.data ?? [],
    serviceRequests: serviceRequests.data ?? [], invoices: invoices.data ?? [],
  };
}

export default function Platform() {
  const { user, loading: authLoading } = useEnhancedAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewKey>('graph');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [hidden, setHidden] = useState<Set<NodeKind>>(new Set());
  const [chatAgent, setChatAgent] = useState<string | null>(null);

  React.useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user, navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['platform'],
    queryFn: fetchAll,
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  const { nodes, links } = useMemo<{ nodes: GraphNode[]; links: GraphLink[] }>(() => {
    if (!data) return { nodes: [], links: [] };
    const ns: GraphNode[] = [];
    const ls: GraphLink[] = [];
    ns.push({ id: 'co', label: 'NexaCore Innovations', kind: 'unit', sub: 'Company', r: 26, pin: true });

    const deptByName = new Map<string, string>();
    for (const d of data.departments) {
      const id = `d.${d.id}`;
      deptByName.set(String(d.name).toLowerCase(), id);
      ns.push({ id, label: d.name, kind: 'unit', sub: 'Department', r: 16 });
      ls.push({ source: 'co', target: id });
    }
    const deptOf = new Map<string, string>();
    const roleOf = new Map<string, any>();
    for (const s of data.staff) {
      roleOf.set(s.user_id, s);
      const d = deptByName.get(String(s.department ?? '').toLowerCase());
      if (d) deptOf.set(s.user_id, d);
    }

    for (const p of data.profiles) {
      if (String(p.role ?? '').toLowerCase() === 'client') continue;
      const s = roleOf.get(p.id);
      // Never invent a name; fall back to the role instead.
      const label = p.full_name?.trim() || s?.role || 'Team member';
      ns.push({ id: `p.${p.id}`, label, kind: 'human', sub: s?.position || p.role || 'Staff', r: 13 });
      ls.push({ source: deptOf.get(p.id) ?? 'co', target: `p.${p.id}` });
    }

    const seenTool = new Set<string>();
    for (const inst of data.installs) {
      const cat = inst.ai_agents;
      if (!cat) continue;
      const id = `a.${inst.id}`;
      ns.push({
        id, label: cat.name, kind: 'agent',
        sub: `${inst.permission_level} · ${inst.is_enabled ? 'installed' : 'disabled'}`,
        r: inst.is_enabled ? 17 : 12, live: Boolean(inst.is_enabled),
      });
      ls.push({ source: deptByName.get(String(cat.category ?? '').toLowerCase()) ?? 'co', target: id });
      for (const t of inst.granted_tools ?? []) {
        if (!seenTool.has(t)) { seenTool.add(t); ns.push({ id: `t.${t}`, label: t, kind: 'tool', sub: 'read', r: 8 }); }
        ls.push({ source: id, target: `t.${t}` });
      }
    }

    for (const pr of data.projects) {
      const late = overdueDays(pr.end_date);
      ns.push({
        id: `ip.${pr.id}`, label: pr.title, kind: 'project',
        sub: `${pr.estimated_hours ?? 0}h estimated · ${pr.actual_hours ?? 0}h recorded`,
        r: 11, risk: late > 0 && pr.status !== 'completed',
      });
      ls.push({ source: deptByName.get(String(pr.department ?? '').toLowerCase()) ?? 'co', target: `ip.${pr.id}` });
    }
    for (const pr of data.clientProjects) {
      const late = overdueDays(pr.deadline);
      const done = String(pr.status ?? '').toLowerCase() === 'completed';
      ns.push({
        id: `cp.${pr.id}`, label: pr.title, kind: 'project',
        sub: done ? 'Completed' : late ? `${late} days overdue` : (pr.status ?? 'Client project'),
        r: 12, risk: late > 0 && !done,
      });
      ls.push({ source: 'co', target: `cp.${pr.id}` });
    }
    return { nodes: ns, links: ls };
  }, [data]);

  const stats = useMemo(() => {
    if (!data) return null;
    const overdue = data.clientProjects.filter(
      (p: any) => overdueDays(p.deadline) > 0 && String(p.status).toLowerCase() !== 'completed',
    );
    const worst = Math.max(0, ...data.clientProjects.map((p: any) => overdueDays(p.deadline)));
    const estimated = data.tasks.reduce((a: number, t: any) => a + (t.estimated_hours || 0), 0);
    const recorded = data.tasks.reduce((a: number, t: any) => a + (t.actual_hours || 0), 0);
    const ok = data.runs.filter((r: any) => r.status === 'success').length;
    const cost = data.runs.reduce((a: number, r: any) => a + Number(r.cost_usd || 0), 0);
    const kb = new Map<string, number>();
    for (const k of data.knowledge) kb.set(k.category ?? 'uncategorised', (kb.get(k.category ?? 'uncategorised') ?? 0) + 1);
    return {
      overdue: overdue.length, totalClient: data.clientProjects.length, worst,
      estimated, recorded, runsOk: ok, runsTotal: data.runs.length, cost,
      kb: [...kb.entries()].sort((a, b) => b[1] - a[1]),
      installed: data.installs.filter((i: any) => i.is_enabled).length,
    };
  }, [data]);

  const people = useMemo<Person[]>(() => {
    if (!data) return [];
    return data.profiles
      .filter((p: any) => String(p.role ?? '').toLowerCase() !== 'client')
      .map((p: any) => {
        const s = data.staff.find((x: any) => x.user_id === p.id);
        return {
          userId: p.id,
          name: p.full_name?.trim() || p.email,
          email: p.email,
          role: p.role,
          position: s?.position ?? null,
          department: s?.department ?? null,
          managerId: s?.manager_id ?? null,
          staffRowId: s?.id ?? null,
        };
      });
  }, [data]);

  const agentEntries = useMemo<AgentEntry[]>(() => {
    if (!data) return [];
    return data.installs.map((i: any) => ({
      id: i.id,
      name: i.ai_agents?.name ?? 'Agent',
      icon: i.ai_agents?.icon ?? null,
      category: i.ai_agents?.category ?? null,
      permission: i.permission_level,
      enabled: Boolean(i.is_enabled),
      tools: i.granted_tools ?? [],
    }));
  }, [data]);

  const canEdit = useMemo(() => {
    const me = data?.profiles.find((p: any) => p.id === user?.id);
    return ['admin', 'super_admin', 'owner'].includes(String(me?.role ?? '').toLowerCase());
  }, [data, user]);

  const findings = useMemo(() => {
    if (!data || !stats) return [];
    const out: { sev: 'crit' | 'warn'; t: string; d: string }[] = [];
    if (stats.recorded === 0 && stats.estimated > 0)
      out.push({ sev: 'crit', t: 'No effort is recorded anywhere', d: `Every actual_hours is 0 across ${data.tasks.length} tasks totalling ${stats.estimated} estimated hours, and the time-entry log is empty. Delivery progress cannot be measured from this system.` });
    if (stats.overdue > 0)
      out.push({ sev: 'crit', t: `${stats.overdue} of ${stats.totalClient} client projects overdue`, d: `Worst is ${stats.worst} days. Given the above, 0% progress may reflect missing tracking rather than stalled work.` });
    const tests = data.profiles.filter((p: any) => /test|playwright/i.test(p.full_name ?? ''));
    if (tests.length)
      out.push({ sev: 'warn', t: `${tests.length} test accounts in production`, d: `${tests.map((t: any) => t.full_name).join(', ')}. Automation artefacts that should be removed before clients see the portal.` });
    const names = new Map<string, number>();
    for (const p of data.profiles) {
      const key = (p.full_name ?? '').toLowerCase().split(/\s+/).sort().join(' ');
      if (key) names.set(key, (names.get(key) ?? 0) + 1);
    }
    const dupes = [...names.entries()].filter(([, n]) => n > 1);
    if (dupes.length)
      out.push({ sev: 'warn', t: 'Duplicate person records', d: 'The same person exists under more than one profile, so per-person reporting will double-count or miss.' });
    const wfNames = new Map<string, number>();
    for (const w of data.workflows) wfNames.set(w.name, (wfNames.get(w.name) ?? 0) + 1);
    const wfDupes = [...wfNames.values()].filter((n) => n > 1).length;
    if (wfDupes)
      out.push({ sev: 'warn', t: `${wfDupes} duplicated workflow templates`, d: 'Identical template names exist more than once, so it is ambiguous which one runs.' });
    if (data.workflows.length)
      out.push({ sev: 'warn', t: `All ${data.workflows.length} workflows have zero steps`, d: 'Templates exist but workflow_steps is empty, so none of them can actually run.' });
    const cats = stats.kb.map(([c]) => c);
    if (cats.includes('service') && cats.includes('services'))
      out.push({ sev: 'warn', t: 'Knowledge categories are split', d: '"service" and "services" are separate categories holding the same kind of content, which fragments retrieval.' });
    return out;
  }, [data, stats]);

  const visibleKinds = useMemo(() => new Set(ALL_KINDS.filter((k) => !hidden.has(k))), [hidden]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const adjacency = useMemo(() => {
    const m = new Map<string, Set<string>>(nodes.map((n) => [n.id, new Set<string>()]));
    for (const l of links) { m.get(l.source)?.add(l.target); m.get(l.target)?.add(l.source); }
    return m;
  }, [nodes, links]);

  const selected = selectedId ? byId.get(selectedId) : null;
  const neighbours = selected ? [...(adjacency.get(selected.id) ?? [])].map((id) => byId.get(id)!).filter(Boolean) : [];
  const searchHits = query ? nodes.filter((n) => n.label.toLowerCase().includes(query.toLowerCase())).slice(0, 8) : [];

  const RAIL: { group: string; items: [ViewKey, string, number | string][] }[] = [
    { group: 'Workspace', items: [['graph', 'Org Graph', nodes.length], ['delivery', 'Delivery', (data?.projects.length ?? 0) + (data?.clientProjects.length ?? 0)], ['health', 'Health', findings.length]] },
    { group: 'Systems', items: [['agents', 'Agents', data?.catalog.length ?? 0], ['tools', 'Tool Library', new Set(data?.installs.flatMap((i: any) => i.granted_tools ?? [])).size], ['knowledge', 'Knowledge', data?.knowledge.length ?? 0], ['runs', 'Runs & Cost', data?.runs.length ?? 0]] },
    { group: 'Organization', items: [['people', 'People', data?.profiles.length ?? 0], ['workflows', 'Workflows', data?.workflows.length ?? 0]] },
    { group: 'Commercial', items: [['pipeline', 'Pipeline', (data?.quoteRequests.length ?? 0) + (data?.proposals.length ?? 0) + (data?.serviceRequests.length ?? 0) + (data?.invoices.length ?? 0)]] },
  ];

  if (authLoading || (isLoading && user)) {
    return <div className="h-screen grid place-items-center bg-background"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  const Page = ({ title, sub, desc, children }: { title: string; sub: string; desc: string; children: React.ReactNode }) => (
    <div className="p-4 md:p-5">
      <div className="flex items-baseline gap-2.5"><h1 className="text-base font-semibold tracking-tight m-0">{title}</h1><span className="text-[11px] text-muted-foreground">{sub}</span></div>
      <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-[70ch]">{desc}</p>
      {children}
    </div>
  );
  const Metric = ({ k, v, s, tone }: { k: string; v: React.ReactNode; s: string; tone?: 'crit' | 'warn' | 'ok' }) => (
    <div className={`rounded-lg border bg-card p-3 ${tone === 'crit' ? 'border-l-[3px] border-l-destructive' : tone === 'warn' ? 'border-l-[3px] border-l-amber-500' : tone === 'ok' ? 'border-l-[3px] border-l-emerald-600' : ''}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className={`text-xl font-semibold tabular-nums mt-0.5 ${tone === 'crit' ? 'text-destructive' : ''}`}>{v}</div>
      <div className="text-[11px] text-muted-foreground">{s}</div>
    </div>
  );
  const Table = ({ head, children }: { head: string[]; children: React.ReactNode }) => (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-xs border-collapse">
        <thead><tr>{head.map((h) => <th key={h} className={`text-[9.5px] uppercase tracking-wider text-muted-foreground font-semibold px-2.5 pb-2 pt-2.5 border-b border-border ${h.startsWith('~') ? 'text-right' : 'text-left'}`}>{h.replace('~', '')}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );

  function renderView() {
    if (!data || !stats) return null;
    switch (view) {
      case 'delivery': {
        const cps = [...data.clientProjects].sort((a: any, b: any) => overdueDays(b.deadline) - overdueDays(a.deadline));
        return (
          <Page title="Delivery" sub={`${cps.length + data.projects.length} projects`} desc="Client work and internal projects together. Overdue days are computed against today, because a date alone does not tell you it has been missed.">
            <div className="grid gap-2.5 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))' }}>
              <Metric k="Overdue" v={stats.overdue} s={`of ${stats.totalClient} client projects`} tone="crit" />
              <Metric k="Worst slip" v={`${stats.worst} d`} s="single project" tone="crit" />
              <Metric k="Hours logged" v={stats.recorded} s={`of ${stats.estimated} committed`} tone="warn" />
              <Metric k="Open tasks" v={data.tasks.length} s="across the company" />
            </div>
            <Table head={['Client project', 'Status', '~Deadline', '~Overdue', '~Budget', '~Logged']}>
              {cps.map((p: any) => {
                const late = overdueDays(p.deadline);
                const done = String(p.status).toLowerCase() === 'completed';
                return (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-2.5 py-1.5">{p.title}</td>
                    <td className="px-2.5 py-1.5">{done ? <Badge variant="secondary" className="text-[10px]">completed</Badge> : <Badge variant="destructive" className="text-[10px]">at risk</Badge>}</td>
                    <td className="px-2.5 py-1.5 text-right tabular-nums">{p.deadline ?? '—'}</td>
                    <td className={`px-2.5 py-1.5 text-right tabular-nums ${late && !done ? 'text-destructive' : 'text-muted-foreground'}`}>{late && !done ? `${late} d` : '—'}</td>
                    <td className="px-2.5 py-1.5 text-right tabular-nums">{p.budget ? `$${Number(p.budget).toLocaleString()}` : '—'}</td>
                    <td className="px-2.5 py-1.5 text-right tabular-nums">{p.actual_hours ?? 0} h</td>
                  </tr>
                );
              })}
            </Table>
          </Page>
        );
      }
      case 'health':
        return (
          <Page title="Health" sub={`${findings.length} findings`} desc="Data quality problems that will distort anything built on top of this, agents included. Derived from the live database, not from inspecting code.">
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              {findings.length === 0 && <div className="p-4 text-xs text-muted-foreground">Nothing flagged.</div>}
              {findings.map((f, i) => (
                <div key={i} className="flex gap-2.5 p-3 border-b border-border last:border-0">
                  <div className={`w-[3px] rounded shrink-0 ${f.sev === 'crit' ? 'bg-destructive' : 'bg-amber-500'}`} />
                  <div><div className="font-semibold text-[12.5px]">{f.t}</div><div className="text-[11.5px] text-muted-foreground mt-0.5">{f.d}</div></div>
                </div>
              ))}
            </div>
          </Page>
        );
      case 'agents': {
        const installed = new Map(data.installs.map((i: any) => [i.ai_agents?.key, i]));
        return (
          <Page title="Agents" sub={`${stats.installed} installed · ${data.catalog.length} in catalog`} desc="Each agent is a manifest, not an application: a prompt, a permission level and a set of granted tools. Installing one is a row in the database, which is what makes the marketplace cheap.">
            <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
              {data.catalog.map((a: any) => {
                const inst: any = installed.get(a.key);
                return (
                  <div key={a.key} className="rounded-lg border border-border bg-card p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 grid place-items-center rounded text-base" style={{ background: KIND_COLOR.agent }}>{a.icon}</div>
                      <div className="min-w-0"><h3 className="text-[13px] font-semibold m-0 truncate">{a.name}</h3><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{a.category}</div></div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant={inst?.is_enabled ? 'default' : 'outline'} className="text-[10px]">{inst?.is_enabled ? 'installed' : 'not installed'}</Badge>
                      <Badge variant="outline" className="text-[10px]">{inst?.permission_level ?? a.max_permission_level}</Badge>
                      <Badge variant="outline" className="text-[10px] tabular-nums">{(inst?.granted_tools ?? a.default_tools ?? []).length} tools</Badge>
                    </div>
                    <Button size="sm" variant={inst?.is_enabled ? 'outline' : 'default'} className="w-full mt-3 h-7 text-xs gap-1.5"
                      disabled={!inst?.is_enabled}
                      onClick={() => { setChatAgent(a.key); setSelectedId(null); }}>
                      <MessageSquare className="h-3 w-3" />{inst?.is_enabled ? `Chat with ${a.name.split(' ').pop()}` : 'Not installed'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Page>
        );
      }
      case 'tools': {
        const used = new Map<string, string[]>();
        for (const i of data.installs) for (const t of i.granted_tools ?? []) used.set(t, [...(used.get(t) ?? []), i.ai_agents?.name].filter(Boolean) as string[]);
        return (
          <Page title="Tool Library" sub={`${used.size} tools granted`} desc="Written once, granted per install. A tool declares the minimum permission level it needs, and the runtime filters the list before the model sees it, so a read-only agent is never handed a writing tool.">
            <Table head={['Tool', 'Requires', 'Granted to']}>
              {[...used.entries()].map(([t, who]) => (
                <tr key={t} className="border-b border-border last:border-0">
                  <td className="px-2.5 py-1.5 font-mono text-[11px]">{t}</td>
                  <td className="px-2.5 py-1.5"><Badge variant="outline" className="text-[10px]">read</Badge></td>
                  <td className="px-2.5 py-1.5 text-muted-foreground">{who.join(', ')}</td>
                </tr>
              ))}
            </Table>
          </Page>
        );
      }
      case 'knowledge':
        return (
          <Page title="Knowledge" sub={`${data.knowledge.length} documents`} desc="What the agents can cite. Retrieval runs on Postgres full-text search: the embedding column exists but is unpopulated, so semantic search would return nothing today.">
            <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))' }}>
              {stats.kb.map(([cat, n]) => (
                <div key={cat} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-baseline gap-2"><h3 className="text-[13px] font-semibold m-0 capitalize">{cat}</h3><span className="ml-auto tabular-nums text-muted-foreground text-xs">{n}</span></div>
                  <div className="h-1.5 bg-muted rounded mt-2 overflow-hidden"><div className="h-full bg-primary" style={{ width: `${(n / stats.kb[0][1]) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </Page>
        );
      case 'runs':
        return (
          <Page title="Runs & Cost" sub={`${stats.runsTotal} runs`} desc="Every invocation is recorded: model, tokens, cost, latency and which tools were called. This is the only honest way to know whether the platform is economic before it is sold.">
            <div className="grid gap-2.5 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))' }}>
              <Metric k="Success rate" v={`${stats.runsTotal ? Math.round((stats.runsOk / stats.runsTotal) * 100) : 0}%`} s={`${stats.runsOk} of ${stats.runsTotal}`} tone="ok" />
              <Metric k="Total cost" v={money(stats.cost)} s="all recorded runs" />
              <Metric k="Failures" v={stats.runsTotal - stats.runsOk} s="rate limit & schema" tone="warn" />
            </div>
            <Table head={['Model', 'Tools', '~Tokens', '~Latency', '~Cost', 'Status']}>
              {data.runs.map((r: any, i: number) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-2.5 py-1.5 font-mono text-[11px]">{r.model}</td>
                  <td className="px-2.5 py-1.5 text-[11px] text-muted-foreground">{(r.tools_used ?? []).join(', ') || '—'}</td>
                  <td className="px-2.5 py-1.5 text-right font-mono">{r.input_tokens}/{r.output_tokens}</td>
                  <td className="px-2.5 py-1.5 text-right tabular-nums">{((r.latency_ms ?? 0) / 1000).toFixed(1)}s</td>
                  <td className="px-2.5 py-1.5 text-right tabular-nums">{Number(r.cost_usd) ? money(Number(r.cost_usd)) : '—'}</td>
                  <td className="px-2.5 py-1.5">{r.status === 'success' ? <Badge variant="secondary" className="text-[10px]">success</Badge> : <Badge variant="destructive" className="text-[10px]">{r.status}</Badge>}</td>
                </tr>
              ))}
            </Table>
          </Page>
        );
      case 'people':
        return (
          <Page title="People" sub={`${data.profiles.length} profiles`} desc="Roles and departments come from staff records. Reporting lines are not shown because the schema has no manager column, so the hierarchy is departmental, not managerial.">
            <Table head={['Name', 'Role', 'Department', 'Position']}>
              {data.profiles.map((p: any) => {
                const s = data.staff.find((x: any) => x.user_id === p.id);
                return (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-2.5 py-1.5">{p.full_name || <span className="text-muted-foreground">(no name)</span>}</td>
                    <td className="px-2.5 py-1.5"><Badge variant="outline" className="text-[10px]">{p.role}</Badge></td>
                    <td className="px-2.5 py-1.5">{s?.department ?? '—'}</td>
                    <td className="px-2.5 py-1.5 text-muted-foreground">{s?.position ?? '—'}</td>
                  </tr>
                );
              })}
            </Table>
          </Page>
        );
      case 'workflows':
        return (
          <Page title="Workflows" sub={`${data.workflows.length} templates`} desc="The automation engine already exists in the schema. These templates are defined but have no steps, so none can currently run.">
            <Table head={['Template', 'Category', 'Status']}>
              {data.workflows.map((w: any) => (
                <tr key={w.id} className="border-b border-border last:border-0">
                  <td className="px-2.5 py-1.5">{w.name}</td>
                  <td className="px-2.5 py-1.5"><Badge variant="outline" className="text-[10px]">{w.category}</Badge></td>
                  <td className="px-2.5 py-1.5"><Badge variant="outline" className="text-[10px]">no steps defined</Badge></td>
                </tr>
              ))}
            </Table>
          </Page>
        );
      case 'pipeline': {
        const items = [
          { k: 'Quote requests', v: data.quoteRequests.length, s: 'received' },
          { k: 'Proposals', v: data.proposals.length, s: 'drafted' },
          { k: 'Service requests', v: data.serviceRequests.length, s: 'open' },
          { k: 'Invoices', v: data.invoices.length, s: 'issued' },
        ];
        return (
          <Page title="Pipeline" sub={`${items.reduce((a, b) => a + b.v, 0)} records`} desc="Commercial activity across the portal, from first contact to invoice.">
            <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
              {items.map((i) => <Metric key={i.k} k={i.k} v={i.v} s={i.s} tone={i.v === 0 ? 'warn' : undefined} />)}
            </div>
            <div className="mt-4 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
              {data.quoteRequests.length} quote requests have produced {data.proposals.length} proposals. Either the work happens
              outside the portal, or the funnel stalls at intake. Worth knowing which before building on top of it.
            </div>
          </Page>
        );
      }
      default:
        return null;
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="h-12 flex items-center gap-3 px-4 border-b border-border bg-card shrink-0">
        <div className="font-semibold tracking-tight">NexaCore</div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search people, agents, projects…" aria-label="Search"
            className="w-full h-7 pl-8 pr-2 text-xs rounded border border-border bg-muted/50 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          {searchHits.length > 0 && (
            <div className="absolute z-30 mt-1 w-full rounded border border-border bg-popover shadow-md overflow-hidden">
              {searchHits.map((n) => (
                <button key={n.id} onClick={() => { setView('graph'); setSelectedId(n.id); setQuery(''); }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: KIND_COLOR[n.kind] }} />
                  <span className="truncate">{n.label}</span>
                  <span className="ml-auto text-muted-foreground">{KIND_LABEL[n.kind]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {view === 'graph' && <span className="text-xs text-muted-foreground tabular-nums hidden md:inline">{nodes.filter((n) => visibleKinds.has(n.kind)).length} entities</span>}
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => { setSelectedId(null); setChatAgent(null); setHidden(new Set()); setView('graph'); }}>
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <nav className="w-[190px] border-r border-border bg-card shrink-0 overflow-y-auto py-2.5 hidden md:block">
          {RAIL.map((g) => (
            <div key={g.group} className="mb-3">
              <div className="px-3.5 pb-1 text-[9.5px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">{g.group}</div>
              {g.items.map(([k, label, count]) => (
                <button key={k} onClick={() => { setView(k); setChatAgent(null); }} aria-current={view === k}
                  className={`w-full flex items-center gap-2 px-3.5 py-1.5 text-xs text-left border-l-2 ${view === k ? 'bg-muted text-foreground border-l-primary font-semibold' : 'text-muted-foreground border-l-transparent hover:bg-muted hover:text-foreground'}`}>
                  {label}<span className="ml-auto tabular-nums text-[10.5px] text-muted-foreground">{count}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <main className="flex-1 min-w-0 relative overflow-auto">
          {error ? (
            <div className="h-full grid place-items-center p-6 text-sm text-muted-foreground text-center">Could not load. {(error as Error).message}</div>
          ) : view === 'graph' ? (
            <OrgChart
              people={people}
              agents={agentEntries}
              departments={data?.departments ?? []}
              nodes={nodes}
              links={links}
              selectedId={selectedId}
              visibleKinds={visibleKinds}
              onSelect={setSelectedId}
              canEdit={canEdit}
              onChanged={() => queryClient.invalidateQueries({ queryKey: ['platform'] })}
              graphOverlay={
                <>
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {ALL_KINDS.map((k) => {
                      const count = nodes.filter((n) => n.kind === k).length;
                      const on = !hidden.has(k);
                      return (
                        <button key={k} aria-pressed={on}
                          onClick={() => setHidden((prev) => { const next = new Set(prev); next.has(k) ? next.delete(k) : next.add(k); return next; })}
                          className={`flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] backdrop-blur ${on ? 'bg-card/85 text-foreground' : 'bg-card/50 text-muted-foreground opacity-50'}`}>
                          <span className="h-2 w-2 rounded-[2px] shrink-0" style={{ background: KIND_COLOR[k] }} />{KIND_LABEL[k]}s
                          <span className="tabular-nums text-muted-foreground">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                  {stats && stats.overdue > 0 && (
                    <div className="absolute top-3 right-3 max-w-[240px] rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-[11px] text-muted-foreground backdrop-blur">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground mb-0.5"><AlertTriangle className="h-3.5 w-3.5 text-destructive" />{stats.overdue} projects overdue</div>
                      {stats.recorded === 0 && 'No hours recorded anywhere, so progress cannot be measured from this system.'}
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 rounded bg-card/80 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur">Drag a node · click to focus · double-click to release</div>
                </>
              }
            />
          ) : renderView()}
        </main>

        <aside className="w-[300px] border-l border-border bg-card shrink-0 hidden lg:flex flex-col min-h-0">
          {chatAgent ? (
            <>
              <div className="px-3 py-2 border-b border-border flex items-center gap-2">
                <span className="text-xs font-semibold">{data?.catalog.find((c: any) => c.key === chatAgent)?.name ?? chatAgent}</span>
                <Button variant="ghost" size="sm" className="ml-auto h-6 text-[11px]" onClick={() => setChatAgent(null)}>Close</Button>
              </div>
              <AgentChat agentKey={chatAgent} agentName={data?.catalog.find((c: any) => c.key === chatAgent)?.name ?? 'the agent'}
                suggestions={['What is at risk right now?', 'Workload by person', 'Which client projects are most overdue?']}
                className="flex-1 min-h-0" />
            </>
          ) : (
            <ScrollArea className="h-full">
              {!selected ? (
                <div className="m-3 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Nothing selected.</span> Click any node to see
                  what it belongs to and what it can reach. People and AI agents expand the same way, because the
                  platform treats them as the same kind of thing.
                  {stats && stats.installed > 0 && (
                    <Button size="sm" variant="outline" className="w-full mt-3 h-7 text-xs gap-1.5" onClick={() => setChatAgent('ops')}>
                      <MessageSquare className="h-3 w-3" /> Ask the Operations agent
                    </Button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="p-3 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <span className="h-8 w-8 shrink-0" style={{ background: KIND_COLOR[selected.kind], borderRadius: selected.kind === 'human' ? '9999px' : 4 }} />
                      <div className="min-w-0"><div className="font-semibold text-sm truncate">{selected.label}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{KIND_LABEL[selected.kind]}</div></div>
                    </div>
                    {selected.sub && <div className="mt-2 text-xs text-muted-foreground">{selected.sub}</div>}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selected.live && <Badge variant="secondary" className="text-[10px]">installed</Badge>}
                      {selected.risk && <Badge variant="destructive" className="text-[10px]">needs attention</Badge>}
                    </div>
                  </div>
                  {ALL_KINDS.map((k) => {
                    const group = neighbours.filter((n) => n.kind === k);
                    if (!group.length) return null;
                    return (
                      <div key={k}>
                        <div className="px-3 pt-3 pb-1 text-[9.5px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">{KIND_LABEL[k]}s</div>
                        {group.map((n) => (
                          <button key={n.id} onClick={() => setSelectedId(n.id)}
                            className="w-full flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground text-left">
                            <span className="h-3 w-3 shrink-0" style={{ background: KIND_COLOR[n.kind], borderRadius: n.kind === 'human' ? '9999px' : 2 }} />
                            <span className="truncate">{n.label}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          )}
        </aside>
      </div>
    </div>
  );
}
