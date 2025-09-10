import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Search,
  Mic,
  Clock,
  TrendingUp,
  Filter,
  Sparkles,
  Command,
  ArrowRight,
  X,
  History,
  Zap
} from 'lucide-react';
import { VoiceSearchButtonMini } from './VoiceSearchButton';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'history' | 'suggestion' | 'operator';
  icon?: React.ReactNode;
  description?: string;
}

interface EnhancedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onVoiceTranscript: (transcript: string, isFinal: boolean) => void;
  onVoiceError: (error: string) => void;
  suggestions?: SearchSuggestion[];
  loading?: boolean;
  showSuggestions?: boolean;
  className?: string;
}

export function EnhancedSearchBar({
  value,
  onChange,
  onSubmit,
  onFocus,
  onBlur,
  onVoiceTranscript,
  onVoiceError,
  suggestions = [],
  loading = false,
  showSuggestions = false,
  className
}: EnhancedSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to clear search
      if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur();
        setShowDropdown(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    setIsFocused(true);
    setShowDropdown(true);
    onFocus?.();
  };

  const handleInputBlur = () => {
    // Delay to allow clicking on dropdown items
    setTimeout(() => {
      setIsFocused(false);
      setShowDropdown(false);
      onBlur?.();
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    onSubmit(suggestion.text);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    onChange('');
    inputRef.current?.focus();
  };

  // Default suggestions when no custom ones provided
  const defaultSuggestions: SearchSuggestion[] = [
    {
      id: '1',
      text: 'status:active',
      type: 'operator',
      icon: <Filter className="h-4 w-4" />,
      description: 'Find active items'
    },
    {
      id: '2', 
      text: 'type:project',
      type: 'operator',
      icon: <Command className="h-4 w-4" />,
      description: 'Search only projects'
    },
    {
      id: '3',
      text: '@john',
      type: 'operator', 
      icon: <Command className="h-4 w-4" />,
      description: 'Find items assigned to John'
    },
    {
      id: '4',
      text: 'priority:high',
      type: 'operator',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Show high priority items'
    }
  ];

  const currentSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <div className={cn("relative", className)}>
      {/* Main Search Container */}
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 shadow-lg",
        "bg-gradient-to-r from-blue-50 via-white to-purple-50",
        "dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
        "border-2",
        isFocused 
          ? "border-blue-500 shadow-blue-500/25 shadow-xl" 
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
        loading && "animate-pulse"
      )}>
        {/* Animated Background Gradient */}
        <div className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300",
          "bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10",
          isFocused && "opacity-100"
        )} />
        
        {/* Search Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center p-1">
            {/* Search Icon */}
            <div className={cn(
              "flex items-center justify-center w-12 h-12 transition-colors duration-200",
              isFocused ? "text-blue-600" : "text-gray-400"
            )}>
              <Search className={cn(
                "transition-transform duration-200",
                isFocused ? "scale-110" : "scale-100",
                loading && "animate-spin"
              )} size={20} />
            </div>

            {/* Input Field */}
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search projects, tasks, team... (Ctrl+K)"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className={cn(
                "flex-1 border-0 bg-transparent text-lg placeholder:text-gray-400",
                "focus:ring-0 focus:outline-none",
                "dark:text-white dark:placeholder:text-gray-500"
              )}
              autoComplete="off"
            />

            {/* Action Buttons Container */}
            <div className="flex items-center gap-2 pr-2">
              {/* Clear Button */}
              {value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className={cn(
                    "h-8 w-8 p-0 text-gray-400 hover:text-gray-600",
                    "hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  )}
                >
                  <X size={16} />
                </Button>
              )}

              {/* Voice Search Button */}
              <VoiceSearchButtonMini
                onTranscript={onVoiceTranscript}
                onError={onVoiceError}
                language="en-US"
                className={cn(
                  "h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50",
                  "dark:hover:bg-blue-900/20 transition-all duration-200"
                )}
              />

              {/* Search Button */}
              <Button
                type="submit"
                className={cn(
                  "h-10 px-6 bg-gradient-to-r from-blue-600 to-purple-600",
                  "hover:from-blue-700 hover:to-purple-700",
                  "text-white font-medium rounded-lg shadow-lg",
                  "transition-all duration-200 hover:shadow-xl",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                disabled={!value.trim() || loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} />
                    <span>Search</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Loading Progress Bar */}
        {loading && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse" />
          </div>
        )}
      </Card>

      {/* Search Suggestions Dropdown */}
      {showDropdown && (showSuggestions || currentSuggestions.length > 0) && (
        <Card 
          ref={dropdownRef}
          className={cn(
            "absolute top-full mt-2 w-full z-50 shadow-xl",
            "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg",
            "border border-gray-200 dark:border-gray-700",
            "animate-in slide-in-from-top-2 duration-200"
          )}
        >
          <div className="p-3 space-y-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                <Zap size={14} />
                <span>Quick Search</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Ctrl+K
              </Badge>
            </div>

            {/* Suggestions List */}
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {currentSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-150",
                    "hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20",
                    "border border-transparent",
                    "group"
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 p-2 rounded-md transition-colors",
                    suggestion.type === 'history' && "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                    suggestion.type === 'suggestion' && "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                    suggestion.type === 'operator' && "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                  )}>
                    {suggestion.icon || <Search size={16} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {suggestion.text}
                      </span>
                      {suggestion.type === 'operator' && (
                        <Badge variant="secondary" className="text-xs">
                          operator
                        </Badge>
                      )}
                    </div>
                    {suggestion.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {suggestion.description}
                      </p>
                    )}
                  </div>

                  {/* Arrow Icon */}
                  <ArrowRight 
                    size={16} 
                    className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" 
                  />
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span>Press ↵ to search</span>
                  <span>ESC to close</span>
                </div>
                <div className="flex items-center gap-1">
                  <History size={12} />
                  <span>Recent searches</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}