# NexaCore AI Assistant - Setup Guide

## Overview

Your NexaCore AI Assistant has been built with cutting-edge AI technology! It features:

- **Claude AI Integration**: Powered by Anthropic's Claude 3.5 Sonnet for intelligent, context-aware responses
- **Learning Capabilities**: Knowledge base with RAG (Retrieval Augmented Generation)
- **Conversation Memory**: Remembers context across messages
- **Real-time Learning**: Learns from user feedback to improve responses
- **Custom Training**: Upload documents and FAQs to expand knowledge
- **Advanced Features**: Markdown rendering, code highlighting, feedback system, analytics

---

## 🚀 Quick Start (3 Steps)

### Step 1: Get Your API Keys

You need two API keys to activate the AI assistant:

#### 1. Anthropic API Key (for Claude AI)
1. Go to https://console.anthropic.com/
2. Create an account or sign in
3. Navigate to API Keys
4. Click "Create Key"
5. Copy your API key (starts with `sk-ant-`)

#### 2. OpenAI API Key (for embeddings/knowledge search)
1. Go to https://platform.openai.com/api-keys
2. Create an account or sign in
3. Click "Create new secret key"
4. Copy your API key (starts with `sk-`)

### Step 2: Add API Keys to Environment

Open your `.env` file and replace the placeholders:

```env
# AI ASSISTANT CONFIGURATION
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
OPENAI_API_KEY=sk-your-actual-key-here
```

**Important**:
- DO NOT commit these keys to git
- Add them to Vercel environment variables for production
- Keys are server-side only (not exposed to clients)

### Step 3: Run Database Migration

Apply the AI assistant database schema to Supabase:

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Open the file: `supabase/migrations/20260104000001_ai_assistant_system.sql`
4. Copy the entire content
5. Paste into Supabase SQL Editor
6. Click "Run"

**Option B: Using Supabase CLI**
```bash
# If you have Supabase CLI installed
cd "C:\Users\Vero C\nexacore-global-web-74"
supabase db push
```

---

## ✅ Testing the Assistant

### Local Testing

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:8080 in your browser

3. Look for the AI Assistant bubble in the bottom-right corner (purple gradient with sparkle icon)

4. Click to open and start chatting!

### Test Questions to Try:

- "What services does NexaCore offer?"
- "Tell me about your AI/ML capabilities"
- "How much does a mobile app development project cost?"
- "I need help with CAD design services"
- "Can you explain your project management process?"

---

## 🎨 Using the Enhanced AI Assistant

### Features:

1. **Markdown Support**: Responses render rich text, lists, and formatted content
2. **Code Highlighting**: Code blocks with syntax highlighting
3. **Copy Buttons**: Copy code snippets or entire responses
4. **Feedback System**: Thumbs up/down on responses
5. **Learning**: When you mark a response as unhelpful, you can provide feedback
6. **Conversation History**: Maintains context throughout the conversation
7. **Typing Indicators**: Shows when AI is thinking
8. **Conversation Actions**: Clear conversation, minimize, close

### Keyboard Shortcuts:

- **Enter**: Send message
- **Shift + Enter**: New line in message

---

## 📊 Knowledge Base Management

The AI assistant learns from:

1. **Pre-loaded Knowledge**: NexaCore services, pricing, contact info (already added)
2. **Portfolio Projects**: Automatically indexed
3. **Custom Training Data**: Upload via admin panel (coming soon)
4. **Conversation Feedback**: User corrections improve future responses

### Adding Knowledge (Manual)

Connect to your Supabase database and run:

```sql
INSERT INTO ai_knowledge_base (title, content, category, subcategory, source_type)
VALUES
('Custom Topic', 'Your detailed content here', 'faq', 'general', 'manual');
```

---

## 🔧 Configuration Options

### Customizing the System Prompt

Edit `api/ai/chat.ts` to modify the assistant's personality and behavior.

### Adjusting RAG Settings

In `src/hooks/useAIAssistant.ts`, modify:
- `match_threshold`: Minimum similarity score (default: 0.7)
- `match_count`: Number of knowledge entries to retrieve (default: 5)

### UI Customization

Edit `src/components/EnhancedAIAssistant.tsx` to:
- Change position (bottom-right, bottom-left, etc.)
- Modify colors and styling
- Add/remove features

---

## 📈 Analytics & Monitoring

### Built-in Analytics Tables:

- `ai_assistant_analytics`: Track usage metrics
- `ai_common_questions`: See most asked questions
- `ai_learning_feedback`: Review user feedback

### Query Common Questions:

```sql
SELECT question, frequency, avg_satisfaction
FROM ai_common_questions
ORDER BY frequency DESC
LIMIT 10;
```

---

## 🚨 Troubleshooting

### "API key not configured" Error

**Problem**: API keys not set in environment variables

**Solution**:
1. Verify keys are in `.env` file
2. Restart development server
3. For production, add keys to Vercel environment variables

### "Failed to generate embedding" Error

**Problem**: OpenAI API key issue or rate limit

**Solution**:
1. Check OpenAI API key is valid
2. Verify billing is set up on OpenAI account
3. Check rate limits: https://platform.openai.com/account/rate-limits

### Assistant Not Responding

**Problem**: Database connection or migration not applied

**Solution**:
1. Check Supabase connection in browser console
2. Verify migration was applied successfully
3. Check browser console for errors

### "Rate limit exceeded" Error

**Problem**: Too many requests to AI APIs

**Solution**:
- Wait a moment before next request
- Consider upgrading API plan for higher limits
- Implement caching for common questions

---

## 💰 Cost Estimates

### Anthropic Claude Pricing (as of 2025):
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens
- Average conversation: $0.001 - $0.01

### OpenAI Embeddings Pricing:
- text-embedding-3-small: $0.02 per million tokens
- Average knowledge base entry: $0.0001

### Monthly Estimates:
- 1,000 conversations: ~$5-10
- 10,000 conversations: ~$50-100

**Tip**: Set up budget alerts in Anthropic and OpenAI dashboards

---

## 🔒 Security Best Practices

1. **Never commit API keys to git**
   - Add `.env` to `.gitignore` (already done)
   - Use environment variables

2. **Row Level Security (RLS)**
   - Already configured in migration
   - Users can only access their own conversations

3. **Rate Limiting**
   - Consider adding rate limiting to API routes
   - Monitor usage in API dashboards

4. **Content Filtering**
   - Claude has built-in safety features
   - Add custom filters if needed

---

## 🎯 Next Steps

1. ✅ Get API keys
2. ✅ Add keys to `.env`
3. ✅ Run database migration
4. ✅ Test locally
5. 🔄 Deploy to production (add keys to Vercel)
6. 📚 Build knowledge base (add company docs, FAQs)
7. 📊 Monitor analytics
8. 🎨 Customize UI to match brand
9. 🤖 Train with more data
10. 🚀 Launch to users!

---

## 📚 Additional Resources

- [Anthropic Claude API Docs](https://docs.anthropic.com/)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Supabase Vector Documentation](https://supabase.com/docs/guides/ai/vector-columns)
- [RAG Best Practices](https://www.anthropic.com/index/retrieval-augmented-generation)

---

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console for errors
3. Check Supabase logs
4. Verify API keys are valid and have credits

---

## 🎉 What's Been Built

### Files Created:

1. **Database Schema**: `supabase/migrations/20260104000001_ai_assistant_system.sql`
   - 7 tables for conversations, knowledge, learning, analytics
   - Vector search capabilities (pgvector)
   - Row-level security policies

2. **API Routes**:
   - `api/ai/chat.ts` - Claude AI integration
   - `api/ai/embeddings.ts` - Embeddings generation

3. **Types**: `src/types/ai-assistant.ts`
   - TypeScript interfaces for all AI features

4. **Custom Hook**: `src/hooks/useAIAssistant.ts`
   - Conversation management
   - Knowledge base search
   - Feedback handling

5. **UI Component**: `src/components/EnhancedAIAssistant.tsx`
   - Modern chat interface
   - Markdown rendering
   - Code highlighting
   - Feedback system

6. **Dependencies Added**:
   - @anthropic-ai/sdk
   - openai
   - react-markdown
   - react-syntax-highlighter
   - remark-gfm

---

## 🌟 Features Summary

### ✨ Core Features:
- Claude 3.5 Sonnet AI integration
- Real-time conversational AI
- Context-aware responses
- Markdown & code support

### 🧠 Learning System:
- Vector-based knowledge search (RAG)
- Conversation memory
- User feedback learning
- Custom training data support

### 💎 Advanced Features:
- Semantic search with pgvector
- Automatic question categorization
- Response quality tracking
- Conversation analytics
- Multi-user support with RLS

### 🎨 UI/UX:
- Beautiful gradient design
- Typing indicators
- Copy to clipboard
- Thumbs up/down feedback
- Conversation history
- Mobile responsive

---

**Ready to make it even better?** The foundation is built - now you can customize, train, and scale your AI assistant to become the best customer support tool for NexaCore!
