// Direct Claude API client for local testing
// Note: In production, API calls should go through backend to protect API keys

import Anthropic from '@anthropic-ai/sdk';

// Only for local testing - API key from environment
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true // Only for local testing!
});

export async function sendMessageToClaude(message: string, history: Array<{role: 'user' | 'assistant', content: string}> = []) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: `You are NexaCore AI Assistant, a helpful and knowledgeable AI assistant for NexaCore, a comprehensive technology solutions provider.

ABOUT NEXACORE:
- AI/ML Services: Custom machine learning models, data analytics, computer vision, NLP
- CAD Services: 2D/3D modeling, engineering drawings, product design
- Blockchain Services: Smart contracts, DeFi, NFT platforms, Web3
- Remote Development Teams: Full-stack, mobile, DevOps teams
- Engineering Technical Services

Answer questions professionally and helpfully about NexaCore services, pricing, and capabilities.`,
      messages: [
        ...history.slice(-10),
        { role: 'user', content: message }
      ],
      temperature: 0.7,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      message: text,
      metadata: {
        model: response.model,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      }
    };
  } catch (error: any) {
    console.error('Claude API Error:', error);
    throw new Error(error.message || 'Failed to get response from Claude');
  }
}
