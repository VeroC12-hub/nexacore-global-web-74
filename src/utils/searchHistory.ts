/**
 * Search History Management System
 * Handles storing, retrieving, and managing recent search queries
 */

export interface SearchHistoryEntry {
  id: string;
  query: string;
  timestamp: number;
  resultCount: number;
  category?: 'recent' | 'frequent' | 'bookmarked';
  tags?: string[];
  context?: {
    tab?: string;
    filters?: Record<string, any>;
    resultTypes?: string[];
  };
}

export interface SearchHistoryStats {
  totalSearches: number;
  uniqueQueries: number;
  averageResultCount: number;
  topQueries: Array<{ query: string; count: number; lastUsed: number }>;
  searchFrequency: Record<string, number>;
}

class SearchHistoryManager {
  private readonly STORAGE_KEY = 'erp_search_history';
  private readonly STATS_KEY = 'erp_search_stats';
  private readonly MAX_HISTORY_ITEMS = 100;
  private readonly MAX_SUGGESTIONS = 10;
  
  private history: SearchHistoryEntry[] = [];
  private stats: SearchHistoryStats = {
    totalSearches: 0,
    uniqueQueries: 0,
    averageResultCount: 0,
    topQueries: [],
    searchFrequency: {}
  };

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Add a new search to history
   */
  addSearch(query: string, resultCount: number = 0, context?: SearchHistoryEntry['context']): void {
    if (!query.trim()) return;

    const normalizedQuery = query.trim();
    const timestamp = Date.now();
    const id = this.generateId(normalizedQuery, timestamp);

    // Check if this exact query exists in recent history (last 5 searches)
    const recentHistory = this.history.slice(0, 5);
    const existingIndex = recentHistory.findIndex(item => item.query === normalizedQuery);
    
    if (existingIndex !== -1) {
      // Move to top and update timestamp
      const existing = this.history.splice(existingIndex, 1)[0];
      existing.timestamp = timestamp;
      existing.resultCount = resultCount;
      if (context) existing.context = context;
      this.history.unshift(existing);
    } else {
      // Add new entry
      const newEntry: SearchHistoryEntry = {
        id,
        query: normalizedQuery,
        timestamp,
        resultCount,
        category: 'recent',
        context
      };

      this.history.unshift(newEntry);
    }

    // Update statistics
    this.updateStats(normalizedQuery, resultCount);

    // Limit history size
    if (this.history.length > this.MAX_HISTORY_ITEMS) {
      this.history = this.history.slice(0, this.MAX_HISTORY_ITEMS);
    }

    this.saveToStorage();
  }

  /**
   * Get recent search history
   */
  getRecentSearches(limit: number = 10): SearchHistoryEntry[] {
    return this.history
      .filter(entry => entry.category !== 'bookmarked')
      .slice(0, limit);
  }

  /**
   * Get search suggestions based on input
   */
  getSuggestions(input: string, limit: number = this.MAX_SUGGESTIONS): string[] {
    if (!input.trim()) {
      // Return recent searches when no input
      return this.getRecentSearches(limit).map(entry => entry.query);
    }

    const normalizedInput = input.toLowerCase().trim();
    const suggestions = new Set<string>();

    // Add exact matches first
    this.history.forEach(entry => {
      if (entry.query.toLowerCase() === normalizedInput) {
        suggestions.add(entry.query);
      }
    });

    // Add queries that start with input
    this.history.forEach(entry => {
      if (entry.query.toLowerCase().startsWith(normalizedInput) && 
          entry.query.toLowerCase() !== normalizedInput) {
        suggestions.add(entry.query);
      }
    });

    // Add queries that contain input
    this.history.forEach(entry => {
      if (entry.query.toLowerCase().includes(normalizedInput) && 
          !entry.query.toLowerCase().startsWith(normalizedInput)) {
        suggestions.add(entry.query);
      }
    });

    // Sort by frequency and recency
    const sortedSuggestions = Array.from(suggestions).sort((a, b) => {
      const aEntry = this.history.find(e => e.query === a);
      const bEntry = this.history.find(e => e.query === b);
      
      if (!aEntry || !bEntry) return 0;
      
      // Combine frequency and recency scores
      const aFrequency = this.stats.searchFrequency[a] || 0;
      const bFrequency = this.stats.searchFrequency[b] || 0;
      const frequencyScore = bFrequency - aFrequency;
      
      const recencyScore = bEntry.timestamp - aEntry.timestamp;
      
      // Weight: 70% frequency, 30% recency
      return (frequencyScore * 0.7) + (recencyScore * 0.3);
    });

    return sortedSuggestions.slice(0, limit);
  }

  /**
   * Get frequently used searches
   */
  getFrequentSearches(limit: number = 5): Array<{ query: string; count: number; lastUsed: number }> {
    return this.stats.topQueries
      .sort((a, b) => b.count - a.count || b.lastUsed - a.lastUsed)
      .slice(0, limit);
  }

  /**
   * Bookmark a search for quick access
   */
  bookmarkSearch(query: string): void {
    const existingIndex = this.history.findIndex(entry => entry.query === query);
    
    if (existingIndex !== -1) {
      this.history[existingIndex].category = 'bookmarked';
    } else {
      // Add as bookmarked entry
      const newEntry: SearchHistoryEntry = {
        id: this.generateId(query, Date.now()),
        query,
        timestamp: Date.now(),
        resultCount: 0,
        category: 'bookmarked'
      };
      
      this.history.push(newEntry);
    }
    
    this.saveToStorage();
  }

  /**
   * Remove bookmark from a search
   */
  unbookmarkSearch(query: string): void {
    const existingIndex = this.history.findIndex(entry => entry.query === query);
    
    if (existingIndex !== -1 && this.history[existingIndex].category === 'bookmarked') {
      this.history[existingIndex].category = 'recent';
    }
    
    this.saveToStorage();
  }

  /**
   * Get bookmarked searches
   */
  getBookmarkedSearches(): SearchHistoryEntry[] {
    return this.history
      .filter(entry => entry.category === 'bookmarked')
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Delete a specific search from history
   */
  deleteSearch(id: string): void {
    const index = this.history.findIndex(entry => entry.id === id);
    if (index !== -1) {
      const removedEntry = this.history.splice(index, 1)[0];
      
      // Update stats
      if (this.stats.searchFrequency[removedEntry.query]) {
        this.stats.searchFrequency[removedEntry.query]--;
        if (this.stats.searchFrequency[removedEntry.query] <= 0) {
          delete this.stats.searchFrequency[removedEntry.query];
        }
      }
      
      this.updateTopQueries();
      this.saveToStorage();
    }
  }

  /**
   * Clear all search history
   */
  clearHistory(): void {
    this.history = [];
    this.stats = {
      totalSearches: 0,
      uniqueQueries: 0,
      averageResultCount: 0,
      topQueries: [],
      searchFrequency: {}
    };
    this.saveToStorage();
  }

  /**
   * Clear only recent searches (keep bookmarked)
   */
  clearRecentHistory(): void {
    this.history = this.history.filter(entry => entry.category === 'bookmarked');
    // Reset stats but keep bookmarked searches
    const bookmarkedQueries = this.history.map(entry => entry.query);
    const newFrequency: Record<string, number> = {};
    
    bookmarkedQueries.forEach(query => {
      if (this.stats.searchFrequency[query]) {
        newFrequency[query] = this.stats.searchFrequency[query];
      }
    });
    
    this.stats = {
      totalSearches: 0,
      uniqueQueries: Object.keys(newFrequency).length,
      averageResultCount: 0,
      topQueries: [],
      searchFrequency: newFrequency
    };
    
    this.updateTopQueries();
    this.saveToStorage();
  }

  /**
   * Get search statistics
   */
  getStats(): SearchHistoryStats {
    return { ...this.stats };
  }

  /**
   * Export search history
   */
  exportHistory(): string {
    return JSON.stringify({
      history: this.history,
      stats: this.stats,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  /**
   * Import search history
   */
  importHistory(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.history && Array.isArray(data.history)) {
        this.history = data.history;
      }
      
      if (data.stats) {
        this.stats = { ...this.stats, ...data.stats };
      }
      
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('Failed to import search history:', error);
      return false;
    }
  }

  /**
   * Private methods
   */
  private generateId(query: string, timestamp: number): string {
    return `search_${btoa(query).replace(/[^a-zA-Z0-9]/g, '')}_${timestamp}`;
  }

  private updateStats(query: string, resultCount: number): void {
    this.stats.totalSearches++;
    
    // Update frequency
    if (!this.stats.searchFrequency[query]) {
      this.stats.searchFrequency[query] = 0;
      this.stats.uniqueQueries++;
    }
    this.stats.searchFrequency[query]++;

    // Update average result count
    const totalResults = (this.stats.averageResultCount * (this.stats.totalSearches - 1)) + resultCount;
    this.stats.averageResultCount = totalResults / this.stats.totalSearches;

    this.updateTopQueries();
  }

  private updateTopQueries(): void {
    this.stats.topQueries = Object.entries(this.stats.searchFrequency)
      .map(([query, count]) => {
        const entry = this.history.find(h => h.query === query);
        return {
          query,
          count,
          lastUsed: entry?.timestamp || 0
        };
      })
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count || b.lastUsed - a.lastUsed)
      .slice(0, 10);
  }

  private loadFromStorage(): void {
    try {
      const historyData = localStorage.getItem(this.STORAGE_KEY);
      const statsData = localStorage.getItem(this.STATS_KEY);

      if (historyData) {
        this.history = JSON.parse(historyData);
      }

      if (statsData) {
        this.stats = { ...this.stats, ...JSON.parse(statsData) };
      }
    } catch (error) {
      console.warn('Failed to load search history from storage:', error);
      this.history = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history));
      localStorage.setItem(this.STATS_KEY, JSON.stringify(this.stats));
    } catch (error) {
      console.warn('Failed to save search history to storage:', error);
    }
  }
}

// Create singleton instance
export const searchHistoryManager = new SearchHistoryManager();

// Utility functions for easy access
export const addSearchToHistory = (query: string, resultCount?: number, context?: SearchHistoryEntry['context']) => 
  searchHistoryManager.addSearch(query, resultCount, context);

export const getRecentSearches = (limit?: number) => 
  searchHistoryManager.getRecentSearches(limit);

export const getSearchSuggestions = (input: string, limit?: number) => 
  searchHistoryManager.getSuggestions(input, limit);

export const getFrequentSearches = (limit?: number) => 
  searchHistoryManager.getFrequentSearches(limit);

export const bookmarkSearch = (query: string) => 
  searchHistoryManager.bookmarkSearch(query);

export const getBookmarkedSearches = () => 
  searchHistoryManager.getBookmarkedSearches();

export const clearSearchHistory = () => 
  searchHistoryManager.clearHistory();

export const getSearchStats = () => 
  searchHistoryManager.getStats();