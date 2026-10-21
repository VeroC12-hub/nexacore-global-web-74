// AI Router - Smart switching between Claude API and Local AI
// Tries Claude first, falls back to local AI if unavailable

import { sendMessageToClaude } from './claudeClient';
import { generateLocalResponse } from './localAI';

export interface AIResponse {
  message: string;
  source: 'pitch' | 'claude' | 'local';
  metadata?: {
    model?: string;
    tokensUsed?: number;
    inputTokens?: number;
    outputTokens?: number;
    captured?: boolean;
  };
}

/**
 * Try the free, server-side NexaCore pitch-bot endpoint first.
 * It is grounded in the public Pitch Brain and captures leads. Returns null on
 * any failure so the caller can fall back to the existing Claude/local chain.
 */
async function tryPitchEndpoint(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<AIResponse | null> {
  try {
    const resp = await fetch('/api/ai/pitch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data?.reply || !String(data.reply).trim()) return null;
    return { message: String(data.reply).trim(), source: 'pitch', metadata: { captured: !!data.captured } };
  } catch {
    return null;
  }
}

/**
 * Smart AI routing with automatic fallback
 * 1. Try Claude API first (if credits available)
 * 2. Fall back to local pattern-matching AI if Claude fails
 */
export async function getAIResponse(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  forceLocal: boolean = false
): Promise<AIResponse> {

  // If forced to use local AI, skip everything else
  if (forceLocal) {
    console.log('🤖 Using Local AI (forced)');
    const localResponse = await generateLocalResponse(message);
    return {
      message: localResponse,
      source: 'local',
    };
  }

  // Primary: free, grounded NexaCore pitch-bot (Pitch Brain + lead capture).
  const pitch = await tryPitchEndpoint(message, history);
  if (pitch) {
    console.log('✨ NexaCore pitch-bot answered');
    return pitch;
  }

  // Fallback: try Claude API
  try {
    console.log('☁️ Trying Claude API...');
    const claudeResponse = await sendMessageToClaude(message, history);

    console.log('✅ Claude API succeeded!');
    return {
      message: claudeResponse.message,
      source: 'claude',
      metadata: claudeResponse.metadata,
    };
  } catch (error: any) {
    // Claude failed - check why
    const errorMessage = error.message || '';

    // If it's a credit/billing issue, permanently switch to local
    if (errorMessage.includes('credit') || errorMessage.includes('balance')) {
      console.warn('💳 Claude API out of credits, using Local AI');
    }
    // If it's an API key issue
    else if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      console.warn('🔑 Claude API key issue, using Local AI');
    }
    // Any other error
    else {
      console.warn('⚠️ Claude API error:', errorMessage);
    }

    // Fall back to local AI
    console.log('🤖 Falling back to Local AI...');
    const localResponse = await generateLocalResponse(message);

    return {
      message: localResponse,
      source: 'local',
    };
  }
}

/**
 * Check if Claude API is available
 * Returns true if API key is configured and credits are available
 */
export async function isClaudeAvailable(): Promise<boolean> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your-anthropic-api-key-here') {
    return false;
  }

  try {
    // Try a minimal API call to check availability
    await sendMessageToClaude('test', []);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get AI source preference from environment or config
 */
export function getAISourcePreference(): 'claude' | 'local' | 'auto' {
  const pref = import.meta.env.VITE_AI_SOURCE_PREFERENCE;

  if (pref === 'claude' || pref === 'local' || pref === 'auto') {
    return pref;
  }

  // Default: auto (try Claude, fall back to local)
  return 'auto';
}
