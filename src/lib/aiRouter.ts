// AI Router - Uses Local AI for responses
// Client-side AI implementation without external API calls

import { generateLocalResponse } from './localAI';

export interface AIResponse {
  message: string;
  source: 'claude' | 'local';
  metadata?: {
    model?: string;
    tokensUsed?: number;
    inputTokens?: number;
    outputTokens?: number;
  };
}

/**
 * Get AI Response using local pattern-matching AI
 * Note: External AI API calls should be made through secure backend/edge functions
 */
export async function getAIResponse(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  forceLocal: boolean = false
): Promise<AIResponse> {
  // Always use local AI - external API calls should go through backend
  console.log('🤖 Using Local AI');
  const localResponse = await generateLocalResponse(message);
  return {
    message: localResponse,
    source: 'local',
  };
}

/**
 * Check if Claude API is available
 * Always returns false - API calls should go through backend
 */
export async function isClaudeAvailable(): Promise<boolean> {
  // External API calls should be made through secure backend/edge functions
  // Never expose API keys in client-side code
  return false;
}

/**
 * Get AI source preference
 * Always returns 'local' for client-side security
 */
export function getAISourcePreference(): 'claude' | 'local' | 'auto' {
  // For security, client-side should always use local AI
  // External AI calls should go through backend edge functions
  return 'local';
}
