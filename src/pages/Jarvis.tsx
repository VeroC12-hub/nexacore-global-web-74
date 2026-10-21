import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send, Mic, MicOff, Volume2, VolumeX, Loader2, Bot, User as UserIcon, Sparkles, Bell, BellOff,
} from 'lucide-react';

/**
 * JARVIS cockpit — the web interface to the same assistant that runs on Telegram.
 *
 * Every request is dropped into the shared `jarvis_tasks` queue in Supabase
 * (source = 'dashboard'). The worker on your machine (Claude Code on the Pro
 * subscription) processes it and writes the result back; this page polls for
 * that result and shows it. Voice in/out uses the browser's built-in Web Speech
 * API — no extra service, no cost.
 */

type Status = 'queued' | 'running' | 'done' | 'error';

interface ChatMsg {
  id: string;            // local id
  role: 'user' | 'jarvis';
  content: string;
  status?: Status;       // for jarvis messages awaiting the worker
  taskId?: string;       // jarvis_tasks row id we're waiting on
}

// Web Speech API isn't in the TS lib by default.
const SpeechRecognitionImpl: any =
  (typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
  null;

const POLL_MS = 2500;
// If a queued task isn't claimed by the worker within this window, answer
// best-effort from the cloud rather than leaving him watching a spinner. Kept
// short on purpose: if his laptop IS on and later finishes the task, the poller
// upgrades the bubble with the fuller result, so a quick cloud answer first is
// strictly better. If the laptop is off, this is the answer.
const OFFLINE_FALLBACK_MS = 12000;

// VAPID public key (base64url) → Uint8Array, for pushManager.subscribe.
function urlB64ToUint8(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

const Jarvis: React.FC = () => {
  const { user, loading } = useEnhancedAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = React.useState<ChatMsg[]>([]);
  const [input, setInput] = React.useState('');
  const [listening, setListening] = React.useState(false);
  const [speak, setSpeak] = React.useState(false);
  // TTS voice selection (which voice JARVIS speaks replies in).
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = React.useState<string>(() => {
    try { return localStorage.getItem('jarvis_tts_voice') || ''; } catch { return ''; }
  });
  const voiceURIRef = React.useRef<string>(voiceURI);
  React.useEffect(() => { voiceURIRef.current = voiceURI; }, [voiceURI]);
  // Web Push (JARVIS's own phone notifications).
  const [pushOn, setPushOn] = React.useState(false);
  const [pushBusy, setPushBusy] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  const recognitionRef = React.useRef<any>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const pendingRef = React.useRef<Map<string, string>>(new Map()); // taskId -> local msg id
  const offlineFallbackRef = React.useRef<Set<string>>(new Set());  // local msg ids that got a cloud best-effort reply (laptop asleep)
  const chatHistoryRef = React.useRef<{ role: 'user' | 'assistant'; content: string }[]>([]); // fast-brain context
  const handsFreeRef = React.useRef(false);    // hands-free voice conversation on/off
  const speakingRef = React.useRef(false);     // true while TTS is talking (pause the mic)
  const startListenRef = React.useRef<() => void>(() => {}); // latest startRecognition()
  const wakeWordRef = React.useRef(true);      // require "Jarvis" to start a new exchange
  const convoOpenRef = React.useRef(0);        // timestamp until which follow-ups skip the wake word
  const [wakeWord, setWakeWord] = React.useState(true);

  // ── auth gate ───────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!loading && !user) navigate('/auth', { replace: true });
  }, [user, loading, navigate]);

  // ── reflect existing push-notification subscription ───────────────────────
  React.useEffect(() => {
    (async () => {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return;
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setPushOn(!!sub && Notification.permission === 'granted');
      } catch { /* ignore */ }
    })();
  }, []);

  const enablePush = React.useCallback(async () => {
    if (pushBusy) return;
    setPushBusy(true);
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return;
      const key = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
      if (!key) return;
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return;
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8(key) });
      }
      const resp = await fetch('/api/push/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub }),
      });
      if (resp.ok) {
        setPushOn(true);
        try { new Notification('JARVIS', { body: "Notifications are on — I'll buzz you here." }); } catch { /* ignore */ }
      }
    } catch { /* ignore */ } finally { setPushBusy(false); }
  }, [pushBusy]);

  // ── load available TTS voices (English) ───────────────────────────────────
  React.useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      const en = all.filter((v) => v.lang?.toLowerCase().startsWith('en'));
      setVoices(en.length ? en : all);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;   // voices load async in most browsers
    return () => { try { window.speechSynthesis.onvoiceschanged = null; } catch { /* ignore */ } };
  }, []);

  // ── load recent history once ────────────────────────────────────────────
  // Guard so this runs ONCE per signed-in user. The auth provider can hand us a
  // new `user` object (cache hydrate → background revalidation, token refresh,
  // tab refocus) with the SAME id; without this guard, each one re-ran this
  // effect and REPLACED the message list with DB rows — wiping instant
  // fast-brain answers (which aren't stored in jarvis_tasks). That's what made
  // a fresh question+answer flash and then vanish.
  const loadedForUserRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!user) return;
    if (loadedForUserRef.current === user.id) return;
    loadedForUserRef.current = user.id;
    (async () => {
      const { data } = await (supabase as any)
        .from('jarvis_tasks')
        .select('id,request,result,status,error,created_at')
        .eq('source', 'dashboard')
        .order('created_at', { ascending: false })
        .limit(15);
      if (!data) return;
      const hist: ChatMsg[] = [];
      const ctx: { role: 'user' | 'assistant'; content: string }[] = [];
      for (const t of [...data].reverse()) {
        hist.push({ id: `u-${t.id}`, role: 'user', content: t.request });
        const reply =
          t.status === 'done'
            ? t.result || '(no output)'
            : t.status === 'error'
              ? `⚠️ ${t.error || 'failed'}`
              : '…';
        hist.push({ id: `j-${t.id}`, role: 'jarvis', status: t.status, taskId: t.id, content: reply });
        ctx.push({ role: 'user', content: t.request });
        if (t.status === 'done' && t.result) ctx.push({ role: 'assistant', content: t.result });
      }
      setMessages(hist);
      chatHistoryRef.current = ctx.slice(-12);
    })();
  }, [user]);

  // ── scroll to bottom on new message ──────────────────────────────────────
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // ── poll for results of pending tasks ────────────────────────────────────
  React.useEffect(() => {
    const timer = setInterval(async () => {
      if (pendingRef.current.size === 0) return;
      const ids = Array.from(pendingRef.current.keys());
      const { data } = await (supabase as any)
        .from('jarvis_tasks')
        .select('id,result,status,error')
        .in('id', ids);
      if (!data) return;
      for (const t of data) {
        const localId = pendingRef.current.get(t.id);
        if (!localId) continue;
        if (t.status === 'done' || t.status === 'error') {
          pendingRef.current.delete(t.id);
          offlineFallbackRef.current.delete(localId);
          const text =
            t.status === 'done' ? t.result || '(no output)' : `⚠️ ${t.error || 'failed'}`;
          setMessages((prev) =>
            prev.map((m) => (m.id === localId ? { ...m, content: text, status: t.status } : m)),
          );
          if (t.status === 'done' && t.result) {
            chatHistoryRef.current.push({ role: 'assistant', content: t.result });
            chatHistoryRef.current = chatHistoryRef.current.slice(-12);
          }
          if (t.status === 'done') {
            if (speak) speakText(t.result || '');
            else if (handsFreeRef.current) startListenRef.current();
          }
        } else if (!offlineFallbackRef.current.has(localId)) {
          // Don't clobber a delivered cloud fallback by flipping it back to a spinner.
          setMessages((prev) =>
            prev.map((m) => (m.id === localId ? { ...m, status: t.status } : m)),
          );
        }
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [speak]);

  // ── send a request ───────────────────────────────────────────────────────
  const send = React.useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || !user) return;
      setSending(true);
      setInput('');

      const localUserId = `u-${Date.now()}`;
      const localJarvisId = `j-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: localUserId, role: 'user', content: text },
        { id: localJarvisId, role: 'jarvis', content: '…', status: 'running' },
      ]);

      // Drop into the Claude Code queue (used on escalation or fast-brain failure).
      const escalate = async (request: string) => {
        const { data, error } = await (supabase as any)
          .from('jarvis_tasks')
          .insert({ source: 'dashboard', request, status: 'queued', notified: true })
          .select('id')
          .single();
        if (error) throw error;
        const taskId = data.id;
        pendingRef.current.set(taskId, localJarvisId);
        setMessages((prev) =>
          prev.map((m) => (m.id === localJarvisId ? { ...m, taskId, status: 'queued' } : m)),
        );

        // Graceful offline: if the worker hasn't claimed this task within the
        // window, his laptop is asleep — don't leave him waiting. Answer
        // best-effort from the cloud now; the queued task still runs (and
        // upgrades this bubble) whenever the laptop comes back.
        setTimeout(async () => {
          if (!pendingRef.current.has(taskId)) return;            // already resolved
          const { data: row } = await (supabase as any)
            .from('jarvis_tasks').select('status').eq('id', taskId).single();
          if (!row || row.status !== 'queued') return;            // worker picked it up — it's online
          try {
            const r = await fetch('/api/ai/jarvis', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: request, history: chatHistoryRef.current.slice(-12), forceAnswer: true }),
            });
            const d = await r.json();
            if (!r.ok || !d.reply) return;
            offlineFallbackRef.current.add(localJarvisId);
            const reply = `${d.reply}\n\n— your laptop looks asleep, so that's from the cloud; I've queued the full version to run as soon as it's back.`;
            setMessages((prev) =>
              prev.map((m) => (m.id === localJarvisId ? { ...m, content: reply, status: 'done' } : m)),
            );
            if (speak) speakText(d.reply);
            else if (handsFreeRef.current) startListenRef.current();
          } catch { /* leave it queued; the poller will deliver the real result */ }
        }, OFFLINE_FALLBACK_MS);
      };

      try {
        // 1) Fast brain (Groq, ~1-8s) answers most things itself.
        const resp = await fetch('/api/ai/jarvis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, history: chatHistoryRef.current.slice(-12) }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || 'fast brain failed');

        chatHistoryRef.current.push({ role: 'user', content: text });
        chatHistoryRef.current = chatHistoryRef.current.slice(-12);

        if (data.escalate) {
          // 2) Needs his files/tools/machine → hand off to Claude Code.
          await escalate(data.refined || text);
        } else {
          const reply: string = data.reply || '(no reply)';
          chatHistoryRef.current.push({ role: 'assistant', content: reply });
          chatHistoryRef.current = chatHistoryRef.current.slice(-12);
          setMessages((prev) =>
            prev.map((m) => (m.id === localJarvisId ? { ...m, content: reply, status: 'done' } : m)),
          );
          if (speak) speakText(reply);
          else if (handsFreeRef.current) startListenRef.current();
        }
      } catch (e: any) {
        // Fast brain unreachable → fall back to the queue so nothing is lost.
        try {
          await escalate(text);
        } catch (e2: any) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === localJarvisId
                ? { ...m, content: `⚠️ Couldn't reach JARVIS: ${e2.message || e2}`, status: 'error' }
                : m,
            ),
          );
        }
      } finally {
        setSending(false);
      }
    },
    [user, speak],
  );

  // ── voice input (hands-free conversation) ─────────────────────────────────
  // Click the mic once → it listens, sends when you pause, then resumes itself
  // after JARVIS replies. It pauses while JARVIS is speaking so it doesn't
  // transcribe its own voice. Click again to stop.
  const startRecognition = () => {
    if (!SpeechRecognitionImpl || !handsFreeRef.current || speakingRef.current) return;
    try { recognitionRef.current?.abort?.(); } catch { /* ignore */ }
    const rec = new SpeechRecognitionImpl();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = '';
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const tr = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += tr;
        else interim += tr;
      }
      setInput((finalText + interim).trim());
    };
    rec.onerror = () => { /* keep hands-free state; onend will retry */ };
    const keepWaiting = () => {
      if (handsFreeRef.current && !speakingRef.current) {
        setTimeout(() => startListenRef.current(), 400);
      }
    };
    rec.onend = () => {
      const t = finalText.trim();
      if (!t) { keepWaiting(); return; }

      let toSend = t;
      // Wake-word gate: outside an open conversation, only act on utterances
      // addressed to "Jarvis" — otherwise ignore ambient speech and keep waiting.
      if (wakeWordRef.current && Date.now() >= convoOpenRef.current) {
        const idx = t.toLowerCase().indexOf('jarvis');
        if (idx === -1) { setInput(''); keepWaiting(); return; }
        toSend = t.slice(idx + 'jarvis'.length).replace(/^[\s,.:;!?-]+/, '').trim();
        if (!toSend) {                    // just "Jarvis" → open the floor, wait for the ask
          convoOpenRef.current = Date.now() + 30000;
          setInput('');
          keepWaiting();
          return;
        }
      }
      convoOpenRef.current = Date.now() + 30000;   // follow-ups for 30s need no wake word
      setInput('');
      send(toSend);                       // reply flow resumes listening when done
    };
    recognitionRef.current = rec;
    try { rec.start(); } catch { /* already running */ }
  };
  startListenRef.current = startRecognition;

  const toggleMic = () => {
    if (!SpeechRecognitionImpl) return;
    if (handsFreeRef.current) {            // turn OFF
      handsFreeRef.current = false;
      setListening(false);
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
      try { window.speechSynthesis?.cancel?.(); } catch { /* ignore */ }
      return;
    }
    handsFreeRef.current = true;           // turn ON
    convoOpenRef.current = 0;              // start fresh — first utterance needs the wake word
    setListening(true);
    startRecognition();
  };

  const toggleWakeWord = () => {
    const v = !wakeWordRef.current;
    wakeWordRef.current = v;
    setWakeWord(v);
  };

  // ── voice output (text-to-speech) ─────────────────────────────────────────
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !text) {
      if (handsFreeRef.current) startListenRef.current();
      return;
    }
    const clean = text.replace(/[*_`#>]/g, '').slice(0, 600);
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'en-US';
    // Use the voice Godwin picked, if any.
    if (voiceURIRef.current) {
      const chosen = window.speechSynthesis.getVoices().find((v) => v.voiceURI === voiceURIRef.current);
      if (chosen) { u.voice = chosen; u.lang = chosen.lang; }
    }
    speakingRef.current = true;
    try { recognitionRef.current?.abort?.(); } catch { /* ignore */ }  // mute mic while talking
    const done = () => {
      speakingRef.current = false;
      convoOpenRef.current = Date.now() + 30000;   // let Godwin reply without the wake word
      if (handsFreeRef.current) startListenRef.current();   // resume listening
    };
    u.onend = done;
    u.onerror = done;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  // While on this page, advertise a "JARVIS" web app manifest so "Add to Home
  // screen / Install app" creates an app that opens straight into /jarvis (listening),
  // instead of a generic shortcut that lands on the site root. Removed on unmount so
  // the rest of the portal is unaffected.
  React.useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/jarvis.webmanifest';
    link.setAttribute('data-jarvis-manifest', '1');
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch { /* ignore */ } };
  }, []);

  // Auto-start listening when opened with ?listen=1 — lets a phone voice command
  // ("Hey Google, open JARVIS") land straight in a live conversation. Browsers may
  // still require one tap if mic permission hasn't been granted yet; harmless if so.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('listen') === '1' && SpeechRecognitionImpl && user && !handsFreeRef.current) {
      const t = setTimeout(() => { try { toggleMic(); } catch { /* needs a tap */ } }, 700);
      return () => clearTimeout(t);
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-none">JARVIS</h1>
            <p className="text-xs text-muted-foreground">NexaCore assistant · {user.profile.full_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {voices.length > 0 && (
            <select
              className="h-9 max-w-[8rem] rounded-md border bg-background px-2 text-xs sm:max-w-[12rem]"
              value={voiceURI}
              title="Choose JARVIS's voice"
              onChange={(e) => {
                const v = e.target.value;
                setVoiceURI(v);
                voiceURIRef.current = v;
                try { localStorage.setItem('jarvis_tts_voice', v); } catch { /* ignore */ }
                // Preview the chosen voice.
                try {
                  window.speechSynthesis.cancel();
                  const u = new SpeechSynthesisUtterance("Hi Godwin, this is how I'll sound.");
                  const chosen = window.speechSynthesis.getVoices().find((x) => x.voiceURI === v);
                  if (chosen) { u.voice = chosen; u.lang = chosen.lang; }
                  window.speechSynthesis.speak(u);
                } catch { /* ignore */ }
              }}
            >
              <option value="">Default voice</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>{v.name.replace(/Microsoft |Google /,'')} ({v.lang})</option>
              ))}
            </select>
          )}
          <Button
            variant={speak ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSpeak((s) => !s)}
            title="Speak replies aloud"
          >
            {speak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">{speak ? 'Voice on' : 'Voice off'}</span>
          </Button>
          <Button
            variant={pushOn ? 'default' : 'outline'}
            size="sm"
            onClick={enablePush}
            disabled={pushBusy || pushOn}
            title={pushOn ? 'Notifications enabled' : 'Enable notifications on this device'}
          >
            {pushOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">{pushOn ? 'Alerts on' : 'Enable alerts'}</span>
          </Button>
        </div>
      </header>

      {/* messages */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
          {messages.length === 0 && (
            <div className="mt-20 text-center text-muted-foreground">
              <Bot className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p className="font-medium">Ask me anything.</p>
              <p className="text-sm">
                I run on your machine via Claude Code — I can read your files, projects, and tools.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  m.role === 'user' ? 'bg-secondary' : 'bg-primary/10'
                }`}
              >
                {m.role === 'user' ? (
                  <UserIcon className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4 text-primary" />
                )}
              </div>
              <Card
                className={`max-w-[80%] px-4 py-2.5 ${
                  m.role === 'user' ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                {m.role === 'jarvis' && m.status && m.status !== 'done' && m.status !== 'error' ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {m.status === 'running' ? 'Working…' : 'Queued — waiting for the worker…'}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                )}
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* composer */}
      <div className="border-t bg-background px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          {SpeechRecognitionImpl && (
            <>
              <Button
                variant={listening ? 'default' : 'outline'}
                size="icon"
                onClick={toggleMic}
                title={listening ? 'Stop listening' : 'Speak'}
                className={listening ? 'animate-pulse' : ''}
              >
                {listening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button
                variant={wakeWord ? 'secondary' : 'ghost'}
                size="sm"
                onClick={toggleWakeWord}
                title={
                  wakeWord
                    ? 'Wake word ON — say "Jarvis …" to address it (follow-ups need no wake word for 30s)'
                    : 'Wake word OFF — it acts on everything it hears'
                }
                className="whitespace-nowrap text-xs"
              >
                {wakeWord ? '“Jarvis”' : 'Wake off'}
              </Button>
            </>
          )}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Message JARVIS… (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="max-h-40 min-h-[44px] resize-none"
          />
          <Button size="icon" onClick={() => send(input)} disabled={sending || !input.trim()}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mx-auto mt-1.5 max-w-3xl text-center text-[11px] text-muted-foreground">
          Quick questions answer instantly. Anything needing your files, apps, or machine runs there via Claude Code and may take up to a minute.
        </p>
      </div>
    </div>
  );
};

export default Jarvis;
