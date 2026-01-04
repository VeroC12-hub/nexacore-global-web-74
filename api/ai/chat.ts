import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: {
    userId?: string;
    userRole?: string;
    currentPage?: string;
    retrievedKnowledge?: string[];
  };
  history?: ChatMessage[];
  systemPrompt?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      message,
      conversationId,
      context = {},
      history = [],
      systemPrompt
    }: ChatRequest = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to environment variables.'
      });
    }

    // Build system prompt with context
    const defaultSystemPrompt = `You are NexaCore AI Assistant, a helpful and knowledgeable AI assistant for NexaCore, a comprehensive technology solutions provider.

ABOUT NEXACORE:
NexaCore specializes in:
- AI/ML Services: Custom machine learning models, data analytics, computer vision, NLP
- CAD Services: 2D/3D modeling, engineering drawings, product design, architectural design
- Blockchain Services: Smart contracts, DeFi, NFT platforms, Web3 integration
- Remote Development Teams: Full-stack, mobile, DevOps, agile teams
- Engineering Technical Services: Technical consulting and solutions

YOUR CAPABILITIES:
- Answer questions about NexaCore services, pricing, and processes
- Help users understand technical concepts
- Guide users through the platform features
- Provide project estimates and recommendations
- Learn from user feedback to improve responses

YOUR PERSONALITY:
- Professional yet friendly and approachable
- Clear and concise in explanations
- Patient and helpful
- Proactive in offering relevant information
- Honest when you don't know something

GUIDELINES:
- Always provide accurate, helpful information
- If asked about pricing, mention that custom quotes are provided within 24-48 hours
- For complex technical questions, offer to connect users with specialists
- Use the retrieved knowledge base context when available
- Remember conversation context and refer back to previous messages
- If users seem frustrated, offer to escalate to human support

${context.userRole ? `USER ROLE: ${context.userRole}` : ''}
${context.currentPage ? `CURRENT PAGE: ${context.currentPage}` : ''}
${context.retrievedKnowledge && context.retrievedKnowledge.length > 0 ? `\nRETRIEVED KNOWLEDGE:\n${context.retrievedKnowledge.join('\n\n')}` : ''}`;

    const finalSystemPrompt = systemPrompt || defaultSystemPrompt;

    // Build messages array with history
    const messages: ChatMessage[] = [
      ...history.slice(-10), // Keep last 10 messages for context
      {
        role: 'user',
        content: message
      }
    ];

    // Call Claude API
    const startTime = Date.now();
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Latest Claude model
      max_tokens: 2048,
      system: finalSystemPrompt,
      messages: messages,
      temperature: 0.7,
    });

    const responseTime = Date.now() - startTime;

    // Extract text from response
    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : 'I apologize, but I encountered an issue generating a response.';

    // Return response with metadata
    return res.status(200).json({
      message: assistantMessage,
      conversationId: conversationId || null,
      metadata: {
        model: response.model,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        responseTime: responseTime,
        stopReason: response.stop_reason,
      }
    });

  } catch (error: any) {
    console.error('Claude API Error:', error);

    // Handle specific error types
    if (error.status === 401) {
      return res.status(401).json({
        error: 'Invalid Anthropic API key'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again in a moment.'
      });
    }

    if (error.status === 529) {
      return res.status(503).json({
        error: 'Anthropic API is temporarily overloaded. Please try again.'
      });
    }

    return res.status(500).json({
      error: 'Failed to process message',
      details: error.message
    });
  }
}
