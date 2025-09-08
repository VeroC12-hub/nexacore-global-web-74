import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { cn } from '@/lib/utils';

interface VoiceSearchButtonProps {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  language?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  disabled?: boolean;
  showTranscript?: boolean;
  autoSubmitOnFinal?: boolean;
}

export function VoiceSearchButton({
  onTranscript,
  onError,
  language = 'en-US',
  className,
  size = 'default',
  variant = 'outline',
  disabled = false,
  showTranscript = false,
  autoSubmitOnFinal = true
}: VoiceSearchButtonProps) {
  const pulseAnimationRef = useRef<HTMLDivElement>(null);
  
  const {
    isListening,
    isSupported,
    transcript,
    finalTranscript,
    interimTranscript,
    error,
    confidence,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceSearch({
    language,
    continuous: false,
    interimResults: true,
    onResult: (text, isFinal) => {
      onTranscript(text, isFinal);
      
      // Auto-submit on final transcript if enabled
      if (isFinal && autoSubmitOnFinal && text.trim()) {
        // Small delay to ensure the input is updated
        setTimeout(() => {
          // Trigger search or form submission here if needed
        }, 100);
      }
    },
    onError: (errorMsg) => {
      onError?.(errorMsg);
    },
    onStart: () => {
      resetTranscript();
    }
  });

  // Handle button click
  const handleClick = () => {
    if (disabled) return;
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Get button content and styling based on state
  const getButtonContent = () => {
    if (!isSupported) {
      return {
        icon: <MicOff className="h-4 w-4" />,
        tooltip: 'Voice search not supported in this browser',
        className: 'opacity-50 cursor-not-allowed'
      };
    }

    if (error) {
      return {
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
        tooltip: error,
        className: 'border-destructive text-destructive hover:bg-destructive/10'
      };
    }

    if (isListening) {
      return {
        icon: (
          <div className="relative">
            <Mic className="h-4 w-4 text-red-500" />
            <div 
              ref={pulseAnimationRef}
              className="absolute -inset-1 rounded-full border border-red-500 animate-ping opacity-75"
            />
          </div>
        ),
        tooltip: 'Listening... Click to stop',
        className: 'border-red-500 bg-red-50 hover:bg-red-100 animate-pulse'
      };
    }

    return {
      icon: <Mic className="h-4 w-4" />,
      tooltip: 'Click to start voice search',
      className: 'hover:border-primary hover:text-primary'
    };
  };

  const buttonContent = getButtonContent();

  // Get confidence color
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'bg-green-500';
    if (conf >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={disabled || !isSupported}
        className={cn(
          'transition-all duration-200',
          buttonContent.className,
          className
        )}
        title={buttonContent.tooltip}
      >
        {buttonContent.icon}
        {isListening && size !== 'sm' && (
          <span className="ml-2 text-sm font-medium">
            Listening...
          </span>
        )}
      </Button>

      {/* Transcript Display */}
      {showTranscript && (transcript || error) && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 border rounded-lg shadow-lg min-w-[200px] max-w-[400px] z-50">
          {error ? (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Confidence Indicator */}
              {confidence > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Volume2 className="h-3 w-3" />
                  <span>Confidence:</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                    <div 
                      className={cn(
                        'h-1 rounded-full transition-all',
                        getConfidenceColor(confidence)
                      )}
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>
                  <span>{Math.round(confidence * 100)}%</span>
                </div>
              )}

              {/* Transcript */}
              <div className="text-sm">
                {finalTranscript && (
                  <span className="text-gray-900 dark:text-gray-100">
                    {finalTranscript}
                  </span>
                )}
                {interimTranscript && (
                  <span className="text-gray-500 dark:text-gray-400 italic">
                    {interimTranscript}
                  </span>
                )}
              </div>

              {/* Status */}
              {isListening && (
                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Listening for speech...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Language Badge */}
      {isSupported && size !== 'sm' && (
        <Badge 
          variant="outline" 
          className="absolute -top-2 -right-2 text-xs px-1 py-0 h-4 bg-white dark:bg-gray-800"
        >
          {language.split('-')[0].toUpperCase()}
        </Badge>
      )}

      {/* Recording Indicator Dot */}
      {isListening && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-gray-800" />
      )}
    </div>
  );
}

// Mini version for compact spaces
export function VoiceSearchButtonMini({
  onTranscript,
  onError,
  language = 'en-US',
  className
}: Pick<VoiceSearchButtonProps, 'onTranscript' | 'onError' | 'language' | 'className'>) {
  return (
    <VoiceSearchButton
      onTranscript={onTranscript}
      onError={onError}
      language={language}
      className={cn('h-8 w-8 p-0', className)}
      size="sm"
      variant="ghost"
      showTranscript={false}
    />
  );
}

// Floating voice search button for better UX
export function FloatingVoiceSearchButton({
  onTranscript,
  onError,
  language = 'en-US',
  className,
  position = 'bottom-right'
}: VoiceSearchButtonProps & { position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' }) {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  return (
    <div className={cn('fixed z-50', positionClasses[position], className)}>
      <VoiceSearchButton
        onTranscript={onTranscript}
        onError={onError}
        language={language}
        className="shadow-lg"
        size="lg"
        variant="default"
        showTranscript={true}
      />
    </div>
  );
}