import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PUBLIC_PITCH_BRAIN } from '../_lib/pitch-brain.js';
import { LEAD_MARKER, createLeadFromMarker, storeLead, LeadInput } from '../_lib/leads.js';

/**
 * NexaCore website pitch-bot endpoint (Phase 1 of the Growth Engine).
 *
 * A free Groq model plays a warm, professional NexaCore sales concierge, grounded
 * ONLY in the public Pitch Brain. It answers visitor questions, pitches our
 * services, gives published price ranges, and, when a visitor is genuinely
 * interested, collects their name + contact + need and captures a lead.
 *
 * Public + unauthenticated (this is the marketing site). No laptop dependency.
 * Env: GROQ_API_KEY (free) + Supabase service key (for lead capture).
 */

export const config = { maxDuration: 30 };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const MODEL = process.env.GROQ_PITCH_MODEL || 'openai/gpt-oss-120b';
const FALLBACK_MODEL = process.env.GROQ_PITCH_FALLBACK || 'openai/gpt-oss-20b';

export const SYSTEM = `You are the NexaCore Innovations website assistant: a warm, sharp, professional concierge who helps visitors and turns genuine interest into a conversation with our team. You represent NexaCore in the first person ("we", "our team").

${PUBLIC_PITCH_BRAIN}

HOW TO TALK:
- Keep it SHORT. This is a small chat window. Most replies are 1 to 3 sentences and under 50 words. Never write long paragraphs, never repeat yourself, never list every option. Make one clear point, then ask one short question or offer one next step.
- Be warm and human, not salesy or robotic. Plain text only, English only. No markdown, no asterisks, no headings, no bullet dumps, and no long dashes (use commas, colons, or the word "to").
- Speak ONLY from the company facts above. If you do not know something, say you will connect them with the team rather than guessing. Never invent clients, prices, numbers, dates, or promises. Describe client results generically (for example "a structural engineering firm") and never name a client.

PRICING: Give only the published hourly range for the SPECIFIC service the visitor asks about (CAD, E-Commerce, 3D Animation, AI/ML, or Blockchain), and give just that one range, briefly. Never recite multiple tiers and never quote a giant span like "$45 to $1000". For Software/App, Creative, Data, or Training there is no published hourly rate, so do not give a number, just say it is quoted to scope. Always add that the exact price depends on scope and a free quote is the fastest way to get one.

CAPTURING A LEAD: When a visitor wants a quote, wants to start, or asks us to reach out, ask in ONE short line for their name, an email or phone, and a one-line note on what they need. Collect it here in the chat, do not tell them to email info@ instead. The moment you have all three (name, a valid contact, and their need), reply with EXACTLY this and nothing else:
${LEAD_MARKER} <name> | <email or phone> | <what they need>
Nothing else on that turn. The system saves the lead and replies for you. Do not pressure anyone who is just browsing.`;

interface Msg { role: 'user' | 'assistant' | 'system'; content: string; }

function toPlain(text: string): string {
  if (!text) return text;
  return text
    .replace(/^\s*\|?[\s:|-]{3,}\|?\s*$/gm, '')
    .replace(/\*\*/g, '').replace(/__/g, '')
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/^(\s*)[*•]\s+/gm, '$1- ')
    .replace(/[—–]/g, ', ')   // strip em/en dashes (brand preference)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function groqChat(messages: Msg[], model: string): Promise<string> {
  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 1200 }),
    signal: AbortSignal.timeout(22000),
  });
  if (!resp.ok) throw new Error(`groq ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  const data = await resp.json();
  return (data.choices?.[0]?.message?.content || '').trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'Pitch assistant is not configured.' });

  try {
    const { message, history = [], lead } = (req.body || {}) as
      { message?: string; history?: Msg[]; lead?: LeadInput };

    // Direct structured lead (e.g. a future inline form) — store and confirm.
    if (lead && (lead.contact || lead.name)) {
      const ok = await storeLead({ ...lead, source: lead.source || 'website-pitchbot-form' });
      return res.status(200).json({
        reply: ok
          ? 'Thank you. Our team has your details and will be in touch shortly.'
          : 'That contact did not look complete. Could you share a valid email or phone number?',
        captured: ok,
      });
    }

    if (!message || !message.trim()) return res.status(400).json({ error: 'message is required' });

    const messages: Msg[] = [
      { role: 'system', content: SYSTEM },
      ...history.slice(-10),
      { role: 'user', content: message },
    ];

    let raw: string;
    try {
      raw = await groqChat(messages, MODEL);
    } catch {
      raw = await groqChat(messages, FALLBACK_MODEL);
    }

    // Lead marker -> store the lead, return a warm confirmation.
    if (raw.trim().toUpperCase().startsWith(LEAD_MARKER)) {
      const payload = raw.trim().slice(LEAD_MARKER.length).trim();
      const confirm = await createLeadFromMarker(payload);
      if (confirm) return res.status(200).json({ reply: confirm, captured: true });
      // Couldn't store (bad contact) — ask again naturally instead of leaking the marker.
      return res.status(200).json({
        reply: 'Could you share a valid email or phone number so the team can reach you?',
        captured: false,
      });
    }

    return res.status(200).json({ reply: toPlain(raw), captured: false });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'pitch endpoint failed' });
  }
}
