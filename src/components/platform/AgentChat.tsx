import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Wrench } from 'lucide-react';

/**
 * Chat with an AI employee.
 *
 * Shared by /platform and /jarvis so both talk to the same runtime through
 * /api/agents/run. The session's access token is attached on every request:
 * the endpoint resolves the company from it rather than trusting anything
 * the browser sends, because the tools behind it bypass row level security.
 */

interface Turn {
  role: 'user' | 'assistant';
  content: string;
  tools?: string[];
  ms?: number;
  failed?: boolean;
}

interface Props {
  agentKey: string;
  agentName: string;
  /** Shown before the first message. */
  suggestions?: string[];
  className?: string;
}

export function AgentChat({ agentKey, agentName, suggestions = [], className }: Props) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, busy]);

  // Switching agent starts a fresh conversation rather than carrying another
  // agent's context across, which would confuse both the model and the reader.
  useEffect(() => {
    setTurns([]);
    setInput('');
  }, [agentKey]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;

    setInput('');
    const history = turns.slice(-8).map((t) => ({ role: t.role, content: t.content }));
    setTurns((prev) => [...prev, { role: 'user', content: message }]);
    setBusy(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Your session expired. Sign in again.');

      const resp = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ agentKey, message, history }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || `Request failed (${resp.status})`);

      setTurns((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || '(no reply)',
          tools: data.toolsUsed ?? [],
          ms: data.latencyMs,
          failed: data.status !== 'success',
        },
      ]);
    } catch (err: any) {
      setTurns((prev) => [
        ...prev,
        { role: 'assistant', content: err?.message || 'Something went wrong.', failed: true },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`flex flex-col min-h-0 ${className ?? ''}`}>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-3">
          {turns.length === 0 && (
            <div className="text-xs text-muted-foreground">
              <p className="mb-2">
                Ask <span className="font-medium text-foreground">{agentName}</span> anything about the
                company. It answers from live data and says so when the data does not support an answer.
              </p>
              <div className="flex flex-col gap-1.5 mt-3">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left rounded border border-border bg-muted/40 px-2.5 py-1.5 hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {turns.map((t, i) => (
            <div key={i} className={t.role === 'user' ? 'text-right' : ''}>
              <div
                className={`inline-block max-w-[92%] rounded-lg px-2.5 py-1.5 text-xs whitespace-pre-wrap text-left ${
                  t.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : t.failed
                      ? 'bg-destructive/10 border border-destructive/30'
                      : 'bg-muted'
                }`}
              >
                {t.content}
              </div>
              {t.role === 'assistant' && t.tools && t.tools.length > 0 && (
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Wrench className="h-2.5 w-2.5" />
                  <span className="truncate">{t.tools.join(', ')}</span>
                  {t.ms != null && <span className="tabular-nums ml-auto">{(t.ms / 1000).toFixed(1)}s</span>}
                </div>
              )}
            </div>
          ))}

          {busy && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Working…
            </div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <form
        className="border-t border-border p-2 flex gap-2 shrink-0"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask ${agentName}…`}
          aria-label={`Message ${agentName}`}
          disabled={busy}
          className="flex-1 h-8 px-2.5 text-xs rounded border border-border bg-muted/50 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        />
        <Button type="submit" size="sm" className="h-8 px-2.5" disabled={busy || !input.trim()}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
