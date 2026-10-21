import React, { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, GitBranch, Columns3, Table2, Pencil, Check, X, Loader2 } from 'lucide-react';
import { OrgGraph, KIND_COLOR } from './OrgGraph';
import type { GraphLink, GraphNode, NodeKind } from './OrgGraph';

/**
 * The org chart, in four layouts.
 *
 * A force graph is good for exploring how things connect and bad for
 * nearly everything else, so the layout is a choice rather than a given:
 *
 *   Graph        how people, agents and tools interconnect
 *   Hierarchy    who reports to whom (needs manager_id set)
 *   Departments  headcount and coverage per function
 *   Directory    the scannable list people actually use
 *
 * Editing writes through the authenticated Supabase client, so row level
 * security applies. It is not routed through the agent runtime: a human
 * changing the org chart is a direct action, not an agent action.
 */

export type Layout = 'graph' | 'tree' | 'departments' | 'directory';

export interface Person {
  userId: string;
  name: string;
  email: string;
  role: string;
  position: string | null;
  department: string | null;
  managerId: string | null;
  staffRowId: string | null;
}
export interface AgentEntry {
  id: string;
  name: string;
  icon: string | null;
  category: string | null;
  permission: string;
  enabled: boolean;
  tools: string[];
}

interface Props {
  people: Person[];
  agents: AgentEntry[];
  departments: { id: string; name: string }[];
  nodes: GraphNode[];
  links: GraphLink[];
  selectedId: string | null;
  visibleKinds: Set<NodeKind>;
  onSelect: (id: string | null) => void;
  onChanged: () => void;
  canEdit: boolean;
  /** Rendered over the canvas, graph layout only. */
  graphOverlay?: React.ReactNode;
}

const LAYOUTS: { key: Layout; label: string; icon: React.ElementType; blurb: string }[] = [
  { key: 'graph', label: 'Graph', icon: Network, blurb: 'How people, agents and tools interconnect.' },
  { key: 'tree', label: 'Hierarchy', icon: GitBranch, blurb: 'Who reports to whom.' },
  { key: 'departments', label: 'Departments', icon: Columns3, blurb: 'Headcount and coverage per function.' },
  { key: 'directory', label: 'Directory', icon: Table2, blurb: 'A scannable list of everyone.' },
];

export function OrgChart(props: Props) {
  const { people, agents, departments, canEdit, onChanged } = props;
  const [layout, setLayout] = useState<Layout>('graph');
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ managerId: string; department: string; position: string }>({
    managerId: '', department: '', position: '',
  });

  const byUser = useMemo(() => new Map(people.map((p) => [p.userId, p])), [people]);

  /** Roots are people with no manager. Cycles are broken defensively. */
  const tree = useMemo(() => {
    const children = new Map<string | null, Person[]>();
    for (const p of people) {
      const key = p.managerId && byUser.has(p.managerId) && p.managerId !== p.userId ? p.managerId : null;
      children.set(key, [...(children.get(key) ?? []), p]);
    }
    return children;
  }, [people, byUser]);

  const unassigned = people.filter((p) => !p.managerId).length;

  async function save(person: Person) {
    setSaving(true);
    setSaveError(null);
    try {
      const patch: Record<string, unknown> = {
        manager_id: draft.managerId || null,
        department: draft.department || null,
        position: draft.position || null,
      };
      const db = supabase as any;
      const { error } = person.staffRowId
        ? await db.from('erp_staff_roles').update(patch).eq('id', person.staffRowId)
        : await db.from('erp_staff_roles').insert({ ...patch, user_id: person.userId, role: person.role, is_active: true });
      if (error) throw new Error(error.message);
      setEditing(null);
      onChanged();
    } catch (e: any) {
      setSaveError(e?.message ?? 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(p: Person) {
    setSaveError(null);
    setDraft({ managerId: p.managerId ?? '', department: p.department ?? '', position: p.position ?? '' });
    setEditing(p.userId);
  }

  const EditRow = ({ p }: { p: Person }) => (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      <select value={draft.department} onChange={(e) => setDraft({ ...draft, department: e.target.value })}
        className="h-7 text-[11px] rounded border border-border bg-background px-1.5" aria-label="Department">
        <option value="">No department</option>
        {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
      </select>
      <select value={draft.managerId} onChange={(e) => setDraft({ ...draft, managerId: e.target.value })}
        className="h-7 text-[11px] rounded border border-border bg-background px-1.5" aria-label="Reports to">
        <option value="">Reports to nobody</option>
        {people.filter((x) => x.userId !== p.userId).map((x) => <option key={x.userId} value={x.userId}>{x.name}</option>)}
      </select>
      <input value={draft.position} onChange={(e) => setDraft({ ...draft, position: e.target.value })}
        placeholder="Position" aria-label="Position"
        className="h-7 w-36 text-[11px] rounded border border-border bg-background px-1.5" />
      <Button size="sm" className="h-7 px-2" disabled={saving} onClick={() => save(p)}>
        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
      </Button>
      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setEditing(null)}><X className="h-3 w-3" /></Button>
      {saveError && <span className="text-[11px] text-destructive w-full">{saveError}</span>}
    </div>
  );

  const PersonCard = ({ p, depth = 0 }: { p: Person; depth?: number }) => (
    <div style={{ marginLeft: depth * 20 }}>
      <div className="rounded-md border border-border bg-card px-2.5 py-1.5 inline-flex flex-col min-w-[220px]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: KIND_COLOR.human }} />
          <span className="text-xs font-semibold truncate">{p.name}</span>
          {canEdit && editing !== p.userId && (
            <button onClick={() => startEdit(p)} className="ml-auto text-muted-foreground hover:text-foreground" aria-label={`Edit ${p.name}`}>
              <Pencil className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground truncate">{p.position ?? 'No position set'}{p.department ? ` · ${p.department}` : ''}</div>
        {editing === p.userId && <EditRow p={p} />}
      </div>
      {(tree.get(p.userId) ?? []).map((c) => <PersonCard key={c.userId} p={c} depth={depth + 1} />)}
    </div>
  );

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-card shrink-0 flex-wrap">
        {LAYOUTS.map((l) => {
          const Icon = l.icon;
          return (
            <button key={l.key} onClick={() => setLayout(l.key)} aria-pressed={layout === l.key}
              className={`flex items-center gap-1.5 rounded px-2 py-1 text-[11px] border ${
                layout === l.key ? 'border-border bg-muted text-foreground font-semibold' : 'border-transparent text-muted-foreground hover:bg-muted'}`}>
              <Icon className="h-3 w-3" />{l.label}
            </button>
          );
        })}
        <span className="ml-auto text-[11px] text-muted-foreground hidden md:inline">
          {LAYOUTS.find((l) => l.key === layout)?.blurb}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-auto relative">
        {layout === 'graph' && (
          <>
            <OrgGraph nodes={props.nodes} links={props.links} selectedId={props.selectedId}
              visibleKinds={props.visibleKinds} onSelect={props.onSelect} className="h-full w-full" />
            {props.graphOverlay}
          </>
        )}

        {layout === 'tree' && (
          <div className="p-4">
            {unassigned === people.length && (
              <div className="mb-4 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground max-w-[60ch]">
                <span className="font-semibold text-foreground">No reporting lines are set yet.</span> The
                schema only gained a manager column today, and nothing was guessed from job titles, because a
                hierarchy that looks authoritative and is wrong is worse than none.
                {canEdit && ' Use the pencil on any person to set who they report to.'}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              {(tree.get(null) ?? []).map((p) => <PersonCard key={p.userId} p={p} />)}
            </div>
          </div>
        )}

        {layout === 'departments' && (
          <div className="p-4 grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))' }}>
            {departments.map((d) => {
              const members = people.filter((p) => p.department === d.name);
              const bots = agents.filter((a) => (a.category ?? '').toLowerCase() === d.name.toLowerCase());
              return (
                <div key={d.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-baseline gap-2 mb-2">
                    <h3 className="text-[13px] font-semibold m-0">{d.name}</h3>
                    <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
                      {members.length + bots.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {members.map((p) => (
                      <div key={p.userId} className="flex items-center gap-2 text-xs">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: KIND_COLOR.human }} />
                        <span className="truncate">{p.name}</span>
                      </div>
                    ))}
                    {bots.map((a) => (
                      <div key={a.id} className="flex items-center gap-2 text-xs">
                        <span className="h-2 w-2 rounded-[2px] shrink-0" style={{ background: KIND_COLOR.agent }} />
                        <span className="truncate">{a.name}</span>
                        {a.enabled && <Badge variant="secondary" className="text-[9px] ml-auto">live</Badge>}
                      </div>
                    ))}
                    {!members.length && !bots.length && (
                      <div className="text-[11px] text-muted-foreground italic">Nobody assigned</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {layout === 'directory' && (
          <div className="p-4">
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>{['Name', 'Position', 'Department', 'Reports to', ''].map((h) => (
                    <th key={h} className="text-left text-[9.5px] uppercase tracking-wider text-muted-foreground font-semibold px-2.5 pt-2.5 pb-2 border-b border-border">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {people.map((p) => (
                    <tr key={p.userId} className="border-b border-border last:border-0 align-top">
                      <td className="px-2.5 py-2">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-[10.5px] text-muted-foreground">{p.email}</div>
                        {editing === p.userId && <EditRow p={p} />}
                      </td>
                      <td className="px-2.5 py-2">{p.position ?? <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-2.5 py-2">{p.department ?? <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-2.5 py-2">{p.managerId ? (byUser.get(p.managerId)?.name ?? '—') : <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-2.5 py-2 text-right">
                        {canEdit && editing !== p.userId && (
                          <button onClick={() => startEdit(p)} className="text-muted-foreground hover:text-foreground" aria-label={`Edit ${p.name}`}>
                            <Pencil className="h-3 w-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
