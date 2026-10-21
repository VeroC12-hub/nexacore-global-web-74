import { readFileSync } from 'node:fs';
import { SYSTEM } from './api/ai/sales-draft.js';
const env = readFileSync('C:/Users/godwi/Projects/jarvis-worker/.env', 'utf8');
const key = (env.match(/^GROQ_API_KEY=(.*)$/m)?.[1] || '').trim().replace(/^"|"$/g, '');
const user = `Draft outreach for this inbound lead:
Name: Ama Boateng
Contact: ama.boateng@example.com
What they need: a full 3D plant model and P&IDs for a new bottling plant
Source: website-pitchbot`;
const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'llama-3.3-70b-versatile', temperature: 0.5, max_tokens: 650,
    response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }] }),
});
const raw = ((await r.json()).choices?.[0]?.message?.content || '').trim();
const p = JSON.parse(raw);
console.log('KEYS:', Object.keys(p).join(', '));
console.log('\nSUBJECT:', p.subject);
console.log('\nEMAIL:\n' + p.email);
console.log('\nFOLLOWUP:\n' + p.followup);
console.log('\nNEXT_ACTION:', p.next_action);
console.log('\nchecks -> dash:', /[—–]/.test(raw), '| names client:', /RC Engineering|FCL|MUNISCO/i.test(raw), '| email words:', p.email.split(/\s+/).length);
