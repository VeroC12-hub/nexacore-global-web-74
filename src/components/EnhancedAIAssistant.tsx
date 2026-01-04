import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle, X, Send, Bot, User, Minimize2, ThumbsUp, ThumbsDown,
  Copy, Check, Sparkles, RotateCw, Trash2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useToast } from '@/hooks/use-toast';
import type { AIMessage } from '@/types/ai-assistant';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageBubbleProps {
  message: AIMessage;
  onFeedback?: (helpful: boolean, comment?: string) => void;
}

const MessageBubble = ({ message, onFeedback }: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (helpful: boolean) => {
    if (showFeedback && feedbackComment.trim()) {
      onFeedback?.(helpful, feedbackComment);
      setShowFeedback(false);
      setFeedbackComment('');
    } else if (!helpful) {
      setShowFeedback(true);
    } else {
      onFeedback?.(helpful);
    }
  };

  return (
    <div
      className={`flex items-start space-x-3 animate-fade-in ${
        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        message.role === 'user'
          ? 'bg-gradient-to-br from-primary to-primary/80 text-white'
          : 'bg-gradient-to-br from-success via-primary-glow to-primary text-white shadow-lg'
      }`}>
        {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'flex justify-end' : ''}`}>
        <div className={`p-3 rounded-2xl ${
          message.role === 'user'
            ? 'bg-gradient-to-br from-primary to-primary/90 text-white rounded-br-md shadow-md'
            : 'bg-card border border-border rounded-bl-md'
        }`}>
          {/* Markdown Content */}
          <div className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-invert' : 'prose-slate'}`}>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');

                  return !inline && match ? (
                    <div className="relative group">
                      <button
                        onClick={() => copyToClipboard(codeString)}
                        className="absolute top-2 right-2 p-1 bg-white/10 hover:bg-white/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between mt-2 text-xs opacity-70">
            <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {message.responseTime && (
              <span>{(message.responseTime / 1000).toFixed(1)}s</span>
            )}
          </div>
        </div>

        {/* Feedback Buttons (only for assistant messages) */}
        {message.role === 'assistant' && (
          <div className="mt-2 flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(true)}
                    className={`h-6 px-2 ${message.wasHelpful === true ? 'bg-success/20 text-success' : ''}`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Helpful response</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(false)}
                    className={`h-6 px-2 ${message.wasHelpful === false ? 'bg-destructive/20 text-destructive' : ''}`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Not helpful</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(message.content)}
              className="h-6 px-2"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
        )}

        {/* Feedback Form */}
        {showFeedback && message.role === 'assistant' && (
          <div className="mt-2 p-3 bg-muted rounded-lg border border-border">
            <p className="text-sm font-medium mb-2">Help us improve:</p>
            <Textarea
              placeholder="What could be better about this response?"
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              className="mb-2 text-sm"
              rows={2}
            />
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleFeedback(false)}
                disabled={!feedbackComment.trim()}
              >
                Submit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowFeedback(false);
                  setFeedbackComment('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EnhancedAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    provideFeedback,
    clearConversation,
    isTyping
  } = useAIAssistant({ autoLoad: true });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageToSend = inputValue;
    setInputValue('');

    try {
      await sendMessage(messageToSend);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      clearConversation();
      toast({
        title: "Conversation cleared",
        description: "Starting a fresh conversation",
      });
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary via-primary-glow to-success shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-110 transition-all duration-300 z-50 group"
        >
          <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-success to-success/80 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </Button>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <Card className={`fixed bottom-6 right-6 w-[28rem] bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[36rem]'
        } flex flex-col`}>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary via-primary-glow to-success rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-white flex items-center">
                  NexaCore AI Assistant
                  <Sparkles className="w-3 h-3 ml-1" />
                </h3>
                <p className="text-xs text-white/90">Powered by Claude AI • Always learning</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearChat}
                      className="w-8 h-8 p-0 text-white hover:bg-white/20 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear conversation</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 p-0 text-white hover:bg-white/20 rounded-full"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 p-0 text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-success rounded-full flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-lg mb-2">Welcome to NexaCore AI</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      I'm your intelligent assistant powered by Claude AI. I can help you with:
                    </p>
                    <div className="text-sm text-muted-foreground text-left space-y-1">
                      <p>• Information about our services</p>
                      <p>• Technical questions and guidance</p>
                      <p>• Project estimates and recommendations</p>
                      <p>• Platform features and navigation</p>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onFeedback={(helpful, comment) => provideFeedback(message.id, helpful, comment)}
                  />
                ))}

                {isTyping && (
                  <div className="flex items-start space-x-3 animate-fade-in">
                    <div className="w-8 h-8 bg-gradient-to-br from-success via-primary-glow to-primary rounded-full flex items-center justify-center shadow-lg">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-card border border-border p-3 rounded-2xl rounded-bl-md">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary-glow rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-success rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border bg-background">
                <div className="flex items-end space-x-2">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask me anything about NexaCore..."
                    className="min-h-[44px] max-h-32 resize-none border-border focus:border-primary transition-colors duration-300"
                    rows={1}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="h-11 w-11 p-0 bg-gradient-to-br from-primary via-primary-glow to-success hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex-shrink-0"
                  >
                    {isLoading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Powered by Claude AI • Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  );
};

export default EnhancedAIAssistant;
