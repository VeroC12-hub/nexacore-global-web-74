import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  History,
  Clock,
  Star,
  TrendingUp,
  Search,
  Bookmark,
  BookmarkX,
  Trash2,
  Download,
  RotateCcw,
  ArrowRight,
  Hash,
  Calendar,
  BarChart3,
  Zap
} from 'lucide-react';
import { 
  SearchHistoryEntry,
  getRecentSearches,
  getSearchSuggestions,
  getFrequentSearches,
  getBookmarkedSearches,
  bookmarkSearch,
  searchHistoryManager,
  getSearchStats
} from '@/utils/searchHistory';

interface SearchHistoryDropdownProps {
  isVisible: boolean;
  searchInput: string;
  onSelectSearch: (query: string) => void;
  onClose: () => void;
  onBookmark?: (query: string) => void;
  onDeleteSearch?: (id: string) => void;
  maxSuggestions?: number;
}

export function SearchHistoryDropdown({
  isVisible,
  searchInput,
  onSelectSearch,
  onClose,
  onBookmark,
  onDeleteSearch,
  maxSuggestions = 8
}: SearchHistoryDropdownProps) {
  const [recentSearches, setRecentSearches] = useState<SearchHistoryEntry[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [frequentSearches, setFrequentSearches] = useState<Array<{ query: string; count: number; lastUsed: number }>>([]);
  const [bookmarkedSearches, setBookmarkedSearches] = useState<SearchHistoryEntry[]>([]);
  const [stats, setStats] = useState(getSearchStats());
  const [activeTab, setActiveTab] = useState<'suggestions' | 'recent' | 'frequent' | 'bookmarked'>('suggestions');

  useEffect(() => {
    if (isVisible) {
      updateData();
    }
  }, [isVisible, searchInput]);

  const updateData = () => {
    setRecentSearches(getRecentSearches(8));
    setSuggestions(getSearchSuggestions(searchInput, maxSuggestions));
    setFrequentSearches(getFrequentSearches(5));
    setBookmarkedSearches(getBookmarkedSearches());
    setStats(getSearchStats());
  };

  const handleSelectSearch = (query: string) => {
    onSelectSearch(query);
    onClose();
  };

  const handleBookmark = (query: string) => {
    bookmarkSearch(query);
    updateData();
    if (onBookmark) onBookmark(query);
  };

  const handleDeleteSearch = (id: string) => {
    searchHistoryManager.deleteSearch(id);
    updateData();
    if (onDeleteSearch) onDeleteSearch(id);
  };

  const handleClearHistory = () => {
    searchHistoryManager.clearRecentHistory();
    updateData();
  };

  const getQueryType = (query: string): { type: string; color: string; icon: React.ComponentType<any> } => {
    if (query.includes(':') || query.includes('@') || query.includes('#')) {
      return { type: 'Advanced', color: 'bg-purple-100 text-purple-800', icon: Zap };
    }
    if (query.includes('status:') || query.includes('priority:')) {
      return { type: 'Filtered', color: 'bg-blue-100 text-blue-800', icon: BarChart3 };
    }
    if (query.includes('due:') || query.includes('created:')) {
      return { type: 'Date', color: 'bg-green-100 text-green-800', icon: Calendar };
    }
    return { type: 'Text', color: 'bg-gray-100 text-gray-800', icon: Search };
  };

  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    
    if (diff < minute) return 'Just now';
    if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
    if (diff < day) return `${Math.floor(diff / hour)}h ago`;
    if (diff < week) return `${Math.floor(diff / day)}d ago`;
    return `${Math.floor(diff / week)}w ago`;
  };

  if (!isVisible) return null;

  // Determine which tab to show by default
  const getDefaultTab = (): 'suggestions' | 'recent' | 'frequent' | 'bookmarked' => {
    if (searchInput.trim() && suggestions.length > 0) return 'suggestions';
    if (recentSearches.length > 0) return 'recent';
    if (frequentSearches.length > 0) return 'frequent';
    return 'bookmarked';
  };

  const currentTab = activeTab === 'suggestions' ? getDefaultTab() : activeTab;

  return (
    <Card className="absolute top-16 left-0 right-0 z-50 shadow-lg border max-h-80 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-gray-500" />
            Search History
          </CardTitle>
          <div className="flex items-center gap-2">
            {stats.totalSearches > 0 && (
              <Badge variant="outline" className="text-xs">
                {stats.totalSearches} searches
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              ×
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-2">
          {searchInput.trim() && suggestions.length > 0 && (
            <Button
              variant={currentTab === 'suggestions' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('suggestions')}
              className="h-7 text-xs"
            >
              <Search className="h-3 w-3 mr-1" />
              Suggestions ({suggestions.length})
            </Button>
          )}
          
          {recentSearches.length > 0 && (
            <Button
              variant={currentTab === 'recent' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('recent')}
              className="h-7 text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              Recent ({recentSearches.length})
            </Button>
          )}
          
          {frequentSearches.length > 0 && (
            <Button
              variant={currentTab === 'frequent' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('frequent')}
              className="h-7 text-xs"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Frequent ({frequentSearches.length})
            </Button>
          )}
          
          {bookmarkedSearches.length > 0 && (
            <Button
              variant={currentTab === 'bookmarked' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('bookmarked')}
              className="h-7 text-xs"
            >
              <Bookmark className="h-3 w-3 mr-1" />
              Saved ({bookmarkedSearches.length})
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 max-h-64 overflow-y-auto">
        {/* Suggestions Tab */}
        {currentTab === 'suggestions' && suggestions.length > 0 && (
          <div className="p-3 space-y-1">
            {suggestions.map((suggestion, index) => {
              const queryInfo = getQueryType(suggestion);
              const IconComponent = queryInfo.icon;
              
              return (
                <div
                  key={`suggestion-${index}`}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
                  onClick={() => handleSelectSearch(suggestion)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <IconComponent className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {suggestion}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-xs ${queryInfo.color} flex-shrink-0`}>
                      {queryInfo.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(suggestion);
                      }}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-yellow-600"
                      title="Bookmark search"
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                    <ArrowRight className="h-3 w-3 text-gray-300" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent Searches Tab */}
        {currentTab === 'recent' && (
          <div className="space-y-1">
            {recentSearches.length > 0 ? (
              <div className="p-3 space-y-1">
                {recentSearches.map((entry) => {
                  const queryInfo = getQueryType(entry.query);
                  const IconComponent = queryInfo.icon;
                  
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
                      onClick={() => handleSelectSearch(entry.query)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <IconComponent className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {entry.query}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(entry.timestamp)}
                            </span>
                            {entry.resultCount > 0 && (
                              <>
                                <span className="text-xs text-gray-300">•</span>
                                <span className="text-xs text-gray-500">
                                  {entry.resultCount} results
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-xs ${queryInfo.color} flex-shrink-0`}>
                          {queryInfo.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmark(entry.query);
                          }}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-yellow-600"
                          title="Bookmark search"
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSearch(entry.id);
                          }}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                          title="Remove from history"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <History className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent searches</p>
              </div>
            )}
          </div>
        )}

        {/* Frequent Searches Tab */}
        {currentTab === 'frequent' && (
          <div className="space-y-1">
            {frequentSearches.length > 0 ? (
              <div className="p-3 space-y-1">
                {frequentSearches.map((item, index) => {
                  const queryInfo = getQueryType(item.query);
                  const IconComponent = queryInfo.icon;
                  
                  return (
                    <div
                      key={`frequent-${index}`}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
                      onClick={() => handleSelectSearch(item.query)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <IconComponent className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {item.query}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              Used {item.count} times
                            </span>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(item.lastUsed)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
                            {item.count}×
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${queryInfo.color}`}>
                            {queryInfo.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmark(item.query);
                          }}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-yellow-600"
                          title="Bookmark search"
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No frequent searches yet</p>
                <p className="text-xs mt-1">Search a few times to see patterns</p>
              </div>
            )}
          </div>
        )}

        {/* Bookmarked Searches Tab */}
        {currentTab === 'bookmarked' && (
          <div className="space-y-1">
            {bookmarkedSearches.length > 0 ? (
              <div className="p-3 space-y-1">
                {bookmarkedSearches.map((entry) => {
                  const queryInfo = getQueryType(entry.query);
                  const IconComponent = queryInfo.icon;
                  
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
                      onClick={() => handleSelectSearch(entry.query)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <IconComponent className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {entry.query}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Bookmark className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-gray-500">
                              Saved {formatRelativeTime(entry.timestamp)}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-xs ${queryInfo.color} flex-shrink-0`}>
                          {queryInfo.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            searchHistoryManager.unbookmarkSearch(entry.query);
                            updateData();
                          }}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                          title="Remove bookmark"
                        >
                          <BookmarkX className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bookmark className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No bookmarked searches</p>
                <p className="text-xs mt-1">Save searches for quick access</p>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        {(recentSearches.length > 0 || bookmarkedSearches.length > 0) && (
          <>
            <Separator />
            <div className="p-2 flex items-center justify-between bg-gray-50">
              <div className="text-xs text-gray-500">
                {stats.totalSearches} total • {stats.uniqueQueries} unique
              </div>
              <div className="flex items-center gap-2">
                {recentSearches.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearHistory}
                    className="h-6 text-xs text-red-600 hover:text-red-700"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear Recent
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}