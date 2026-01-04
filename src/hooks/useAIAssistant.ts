import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedAuth } from './useEnhancedAuth';
import { getAIResponse } from '@/lib/aiRouter';
import type {
  AIMessage,
  AIConversation,
  ChatRequest,
  ChatResponse,
  SearchKnowledgeResult,
  UseAIAssistantReturn
} from '@/types/ai-assistant';

export function useAIAssistant(options?: {
  autoLoad?: boolean;
  conversationId?: string;
}): UseAIAssistantReturn {
  const { user, userRole } = useEnhancedAuth();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const isLoadingConversation = useRef(false);

  // Initialize or load conversation
  useEffect(() => {
    if (options?.autoLoad !== false && !isLoadingConversation.current) {
      loadOrCreateConversation();
    }
  }, [user?.id]);

  const loadOrCreateConversation = async () => {
    if (isLoadingConversation.current) return;
    isLoadingConversation.current = true;

    try {
      let conv: AIConversation | null = null;

      // Try to load existing conversation by ID
      if (options?.conversationId) {
        const { data, error: fetchError } = await supabase
          .from('ai_conversations')
          .select('*')
          .eq('id', options.conversationId)
          .single();

        if (!fetchError && data) {
          conv = data as AIConversation;
        }
      }

      // If no conversation yet, try to find by session_id
      if (!conv) {
        const { data: existingConv, error: existingError } = await supabase
          .from('ai_conversations')
          .select('*')
          .eq('session_id', sessionIdRef.current)
          .maybeSingle();

        if (!existingError && existingConv) {
          conv = existingConv as AIConversation;
        }
      }

      // Create new conversation only if none exists
      if (!conv) {
        const { data, error: createError } = await supabase
          .from('ai_conversations')
          .insert([{
            user_id: user?.id || null,
            session_id: sessionIdRef.current,
            context: {
              userRole: userRole || 'visitor',
              currentPage: window.location.pathname,
            },
            total_messages: 0,
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          // If it's a duplicate key error, try to fetch the existing one
          if (createError.code === '23505') {
            const { data: retryData } = await supabase
              .from('ai_conversations')
              .select('*')
              .eq('session_id', sessionIdRef.current)
              .single();

            if (retryData) {
              conv = retryData as AIConversation;
            }
          }
        } else {
          conv = data as AIConversation;
        }
      }

      setConversation(conv);

      // Load messages if conversation exists
      if (conv) {
        await loadMessages(conv.id);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
    } finally {
      isLoadingConversation.current = false;
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error loading messages:', fetchError);
      } else {
        setMessages((data as AIMessage[]) || []);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  // Search knowledge base for relevant context
  const searchKnowledge = async (query: string): Promise<SearchKnowledgeResult[]> => {
    try {
      // First, generate embedding for the query
      const embeddingResponse = await fetch('/api/ai/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query }),
      });

      if (!embeddingResponse.ok) {
        console.error('Failed to generate embedding');
        return [];
      }

      const { embedding } = await embeddingResponse.json();

      // Search knowledge base using vector similarity
      const { data, error } = await supabase.rpc('search_knowledge_base', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 5,
        filter_category: null
      });

      if (error) {
        console.error('Knowledge search error:', error);
        return [];
      }

      return data as SearchKnowledgeResult[];
    } catch (err) {
      console.error('Error searching knowledge:', err);
      return [];
    }
  };

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || !conversation) return;

    setIsLoading(true);
    setError(null);
    setIsTyping(true);

    try {
      // Create user message
      const userMessage: Partial<AIMessage> = {
        conversation_id: conversation.id,
        role: 'user',
        content: messageText,
        content_type: 'text',
      };

      // Insert user message to DB
      const { data: savedUserMessage, error: userMsgError } = await supabase
        .from('ai_messages')
        .insert([userMessage])
        .select()
        .single();

      if (userMsgError) throw userMsgError;

      // Update local state
      setMessages(prev => [...prev, savedUserMessage as AIMessage]);

      // Search knowledge base for context (disabled for now - needs OpenAI key)
      // const knowledgeResults = await searchKnowledge(messageText);
      // const retrievedKnowledge = knowledgeResults.map(k => `${k.title}: ${k.content}`);
      const retrievedKnowledge: string[] = [];

      // Prepare chat history (last 10 messages)
      const history = messages.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

      // Build request
      const chatRequest: ChatRequest = {
        message: messageText,
        conversationId: conversation.id,
        context: {
          userId: user?.id,
          userRole: userRole || 'visitor',
          currentPage: window.location.pathname,
          retrievedKnowledge
        },
        history
      };

      // Use smart AI router (tries Claude, falls back to local AI)
      const startTime = Date.now();
      const aiResponse = await getAIResponse(messageText, history);
      const responseTime = Date.now() - startTime;

      // Log which AI source was used
      console.log(`🤖 AI Response from: ${aiResponse.source === 'claude' ? 'Claude API ☁️' : 'Local AI 🤖'}`);

      // Create assistant message
      const assistantMessage: Partial<AIMessage> = {
        conversation_id: conversation.id,
        role: 'assistant',
        content: aiResponse.message,
        content_type: 'text',
        model_used: aiResponse.source === 'claude' ? (aiResponse.metadata?.model || 'claude-3-5-sonnet-20241022') : 'local-ai-v1',
        tokens_used: aiResponse.metadata?.tokensUsed || 0,
        response_time_ms: responseTime,
        retrieved_knowledge: [], // knowledgeResults.map(k => k.id),
      };

      // Save assistant message to DB
      const { data: savedAssistantMessage, error: assistantMsgError } = await supabase
        .from('ai_messages')
        .insert([assistantMessage])
        .select()
        .single();

      if (assistantMsgError) throw assistantMsgError;

      // Update local state
      setMessages(prev => [...prev, savedAssistantMessage as AIMessage]);

      // Update conversation title if first message
      if (messages.length === 0) {
        const title = messageText.slice(0, 50) + (messageText.length > 50 ? '...' : '');
        await supabase
          .from('ai_conversations')
          .update({ title })
          .eq('id', conversation.id);
      }

      // Track common question
      try {
        await supabase.rpc('increment_common_question', {
          q_text: messageText,
          q_category: 'general'
        });
      } catch (err) {
        console.error('Error tracking common question:', err);
      }

    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [conversation, messages, user, userRole]);

  const provideFeedback = useCallback(async (
    messageId: string,
    helpful: boolean,
    comment?: string
  ) => {
    try {
      // Update message feedback
      await supabase
        .from('ai_messages')
        .update({
          was_helpful: helpful,
          feedback_comment: comment
        })
        .eq('id', messageId);

      // Create learning feedback if not helpful or has comment
      if (!helpful || comment) {
        await supabase
          .from('ai_learning_feedback')
          .insert([{
            message_id: messageId,
            conversation_id: conversation?.id,
            feedback_type: helpful ? 'improvement' : 'negative',
            user_comment: comment,
            priority: helpful ? 'medium' : 'high',
            created_by: user?.id
          }]);
      }

      // Update local state
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, wasHelpful: helpful, feedbackComment: comment }
          : msg
      ));
    } catch (err) {
      console.error('Error providing feedback:', err);
    }
  }, [conversation, user]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversation(null);
    loadOrCreateConversation();
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    provideFeedback,
    clearConversation,
    conversationId: conversation?.id || null,
    isTyping,
  };
}
