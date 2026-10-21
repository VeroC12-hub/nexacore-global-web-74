import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Trash2, Sparkles, Mail, Phone, Inbox } from 'lucide-react';
import { toast } from 'sonner';

// jarvis_leads is not in the generated Supabase types, so we use an untyped client.
const db = supabase as any;

interface Lead {
  id: string;
  name: string | null;
  contact: string | null;
  source: string | null;
  stage: string;
  notes: string | null;
  next_action: string | null;
  created_at: string;
  updated_at: string;
}

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] as const;

const stageStyle: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'bg-amber-100 text-amber-700 border-amber-200',
  qualified: 'bg-purple-100 text-purple-700 border-purple-200',
  proposal: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  won: 'bg-green-100 text-green-700 border-green-200',
  lost: 'bg-gray-100 text-gray-600 border-gray-200',
};

interface AdminGrowthTabProps {
  onStatsUpdate?: () => void;
}

export function AdminGrowthTab({ onStatsUpdate }: AdminGrowthTabProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await db
        .from('jarvis_leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLeads((data || []) as Lead[]);
    } catch (err) {
      console.error('Error loading leads:', err);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const updateStage = async (id: string, stage: string) => {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, stage } : l)));
    try {
      const { error } = await db
        .from('jarvis_leads')
        .update({ stage, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Moved to "${stage}"`);
      onStatsUpdate?.();
    } catch (err) {
      console.error('Error updating stage:', err);
      toast.error('Could not update stage');
      setLeads(prev);
    }
  };

  const saveNextAction = async (id: string, next_action: string) => {
    try {
      const { error } = await db
        .from('jarvis_leads')
        .update({ next_action, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error saving next action:', err);
      toast.error('Could not save note');
    }
  };

  const deleteLead = async (id: string) => {
    if (!window.confirm('Delete this lead? This cannot be undone.')) return;
    const prev = leads;
    setLeads((ls) => ls.filter((l) => l.id !== id));
    try {
      const { error } = await db.from('jarvis_leads').delete().eq('id', id);
      if (error) throw error;
      toast.success('Lead deleted');
      onStatsUpdate?.();
    } catch (err) {
      console.error('Error deleting lead:', err);
      toast.error('Could not delete lead');
      setLeads(prev);
    }
  };

  const count = (fn: (l: Lead) => boolean) => leads.filter(fn).length;
  const stats = [
    { label: 'Total leads', value: leads.length, tone: 'text-foreground' },
    { label: 'New', value: count((l) => l.stage === 'new'), tone: 'text-blue-600' },
    { label: 'In progress', value: count((l) => ['contacted', 'qualified', 'proposal'].includes(l.stage)), tone: 'text-amber-600' },
    { label: 'Won', value: count((l) => l.stage === 'won'), tone: 'text-green-600' },
  ];

  const contactLink = (contact: string | null) => {
    if (!contact) return <span className="text-muted-foreground">—</span>;
    const isEmail = /\S+@\S+\.\S+/.test(contact);
    const href = isEmail ? `mailto:${contact}` : `tel:${contact.replace(/[^\d+]/g, '')}`;
    const Icon = isEmail ? Mail : Phone;
    return (
      <a href={href} className="inline-flex items-center gap-1 text-primary hover:underline">
        <Icon className="w-3.5 h-3.5" /> {contact}
      </a>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> Growth &amp; Leads
          </h2>
          <p className="text-sm text-muted-foreground">
            Leads captured by the website pitch-bot and other sources. Move each lead through your pipeline.
          </p>
        </div>
        <Button variant="outline" onClick={loadLeads} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-3xl font-bold ${s.tone}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leads table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground py-8 text-center">Loading leads…</p>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Inbox className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-medium">No leads yet</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                When the website pitch-bot captures a visitor&apos;s details, they show up here ready for you to follow up.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>What they need</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Next action</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name || 'Visitor'}</TableCell>
                      <TableCell>{contactLink(lead.contact)}</TableCell>
                      <TableCell className="max-w-[220px]">
                        <span className="text-sm text-muted-foreground line-clamp-2">{lead.notes || '—'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{lead.source || 'unknown'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select value={lead.stage} onValueChange={(v) => updateStage(lead.id, v)}>
                          <SelectTrigger className={`h-8 w-[130px] border ${stageStyle[lead.stage] || ''}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STAGES.map((s) => (
                              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="min-w-[160px]">
                        <Input
                          defaultValue={lead.next_action || ''}
                          placeholder="Add a note…"
                          className="h-8 text-sm"
                          onBlur={(e) => {
                            if (e.target.value !== (lead.next_action || '')) saveNextAction(lead.id, e.target.value);
                          }}
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteLead(lead.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminGrowthTab;
