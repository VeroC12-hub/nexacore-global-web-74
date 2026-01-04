import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Initialize OpenAI client for embeddings (cost-effective for embeddings)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface EmbeddingRequest {
  text: string;
  model?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, model = 'text-embedding-3-small' }: EmbeddingRequest = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables.'
      });
    }

    // Generate embedding
    const response = await openai.embeddings.create({
      model: model,
      input: text,
      encoding_format: 'float',
    });

    const embedding = response.data[0].embedding;

    return res.status(200).json({
      embedding,
      model: response.model,
      tokensUsed: response.usage.total_tokens
    });

  } catch (error: any) {
    console.error('Embedding API Error:', error);

    if (error.status === 401) {
      return res.status(401).json({
        error: 'Invalid OpenAI API key'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again.'
      });
    }

    return res.status(500).json({
      error: 'Failed to generate embedding',
      details: error.message
    });
  }
}
