// AI Assistant Type Definitions

export interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contentType?: 'text' | 'code' | 'markdown' | 'html';
  modelUsed?: string;
  tokensUsed?: number;
  responseTime?: number;
  retrievedKnowledge?: string[];
  confidenceScore?: number;
  wasHelpful?: boolean;
  feedbackComment?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AIConversation {
  id: string;
  userId?: string;
  sessionId: string;
  title?: string;
  context?: {
    userRole?: string;
    currentPage?: string;
    projectId?: string;
    [key: string]: any;
  };
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
  isResolved?: boolean;
  resolutionType?: 'answered' | 'escalated' | 'redirected' | 'unresolved';
  totalMessages: number;
  userSatisfaction?: number; // 1-5 rating
  feedback?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  startedAt: string;
  lastMessageAt: string;
  endedAt?: string;
  createdAt: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  category: 'service' | 'portfolio' | 'faq' | 'documentation' | 'policy' | 'custom';
  subcategory?: string;
  sourceType: 'manual' | 'auto_generated' | 'portfolio_project' | 'service_page' | 'document';
  sourceId?: string;
  embedding?: number[];
  metadata?: Record<string, any>;
  tags?: string[];
  version: number;
  isActive: boolean;
  searchCount: number;
  usefulnessScore: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningFeedback {
  id: string;
  messageId?: string;
  conversationId?: string;
  feedbackType: 'correction' | 'improvement' | 'positive' | 'negative' | 'suggestion';
  originalResponse?: string;
  correctedResponse?: string;
  userComment?: string;
  impactCategory?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'implemented' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  appliedToKnowledge: boolean;
  appliedAt?: string;
  createdBy?: string;
  createdAt: string;
}

export interface TrainingData {
  id: string;
  title: string;
  content: string;
  dataType: 'faq' | 'document' | 'example_conversation' | 'policy' | 'procedure' | 'guide';
  category: string;
  format: 'markdown' | 'html' | 'plain_text' | 'json';
  sourceFileUrl?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  embeddingStatus: 'pending' | 'embedded' | 'failed';
  chunkCount: number;
  isActive: boolean;
  priority: number;
  tags?: string[];
  metadata?: Record<string, any>;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommonQuestion {
  id: string;
  question: string;
  normalizedQuestion: string;
  category?: string;
  frequency: number;
  bestAnswer?: string;
  bestAnswerSource?: string;
  avgSatisfaction?: number;
  totalAsks: number;
  successfulAnswers: number;
  lastAskedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssistantAnalytics {
  id: string;
  metricType: string;
  metricValue: number;
  dimension1?: string;
  dimension1Value?: string;
  dimension2?: string;
  dimension2Value?: string;
  metadata?: Record<string, any>;
  date: string;
  createdAt: string;
}

// API Request/Response Types
export interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: {
    userId?: string;
    userRole?: string;
    currentPage?: string;
    retrievedKnowledge?: string[];
  };
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemPrompt?: string;
}

export interface ChatResponse {
  message: string;
  conversationId: string | null;
  metadata: {
    model: string;
    tokensUsed: number;
    inputTokens: number;
    outputTokens: number;
    responseTime: number;
    stopReason: string;
  };
}

export interface EmbeddingRequest {
  text: string;
  model?: string;
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  tokensUsed: number;
}

export interface SearchKnowledgeRequest {
  query: string;
  category?: string;
  limit?: number;
  threshold?: number;
}

export interface SearchKnowledgeResult {
  id: string;
  title: string;
  content: string;
  category: string;
  similarity: number;
}

// Hook return types
export interface UseAIAssistantReturn {
  messages: AIMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  provideFeedback: (messageId: string, helpful: boolean, comment?: string) => Promise<void>;
  clearConversation: () => void;
  conversationId: string | null;
  isTyping: boolean;
}

export interface UseKnowledgeBaseReturn {
  searchKnowledge: (query: string, category?: string) => Promise<SearchKnowledgeResult[]>;
  addKnowledge: (entry: Partial<KnowledgeBaseEntry>) => Promise<void>;
  updateKnowledge: (id: string, updates: Partial<KnowledgeBaseEntry>) => Promise<void>;
  deleteKnowledge: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// UI Component Props
export interface AIAssistantProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
  initialMessage?: string;
  onClose?: () => void;
  className?: string;
}

export interface MessageBubbleProps {
  message: AIMessage;
  isLatest: boolean;
  onFeedback?: (helpful: boolean, comment?: string) => void;
}

export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}
