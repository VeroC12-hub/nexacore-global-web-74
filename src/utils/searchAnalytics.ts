/**
 * Search Analytics System
 * Tracks user search behavior, patterns, and provides insights for optimization
 */

export interface SearchAnalyticsEntry {
  id: string;
  query: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  resultCount: number;
  clickedResultId?: string;
  clickedResultType?: string;
  searchType: 'basic' | 'advanced' | 'operator' | 'voice';
  executionTime: number; // in milliseconds
  context: {
    tab: string;
    page: string;
    filters?: Record<string, any>;
    operators?: string[];
  };
  success: boolean;
  exitType?: 'result_click' | 'new_search' | 'page_exit' | 'refinement';
}

export interface SearchAnalyticsSummary {
  totalSearches: number;
  uniqueQueries: number;
  averageResultCount: number;
  averageExecutionTime: number;
  successRate: number;
  
  // Top searches
  topQueries: Array<{
    query: string;
    count: number;
    successRate: number;
    avgResultCount: number;
    lastSearched: number;
  }>;
  
  // Search patterns
  searchPatterns: {
    basicSearches: number;
    advancedSearches: number;
    operatorSearches: number;
    voiceSearches: number;
  };
  
  // Time-based analytics
  searchesByHour: Record<string, number>;
  searchesByDay: Record<string, number>;
  
  // Context analytics
  searchesByTab: Record<string, number>;
  searchesByPage: Record<string, number>;
  
  // Performance metrics
  performanceMetrics: {
    fastSearches: number; // < 100ms
    normalSearches: number; // 100-500ms
    slowSearches: number; // > 500ms
    averageTime: number;
  };
  
  // User behavior
  behaviorMetrics: {
    noResultsSearches: number;
    refinedSearches: number;
    abandonedSearches: number;
    successfulSearches: number;
  };
  
  // Trending data
  trendingQueries: Array<{
    query: string;
    count: number;
    growthRate: number; // percentage change from previous period
    period: 'hour' | 'day' | 'week';
  }>;
}

export interface SearchInsights {
  popularTerms: string[];
  emptyResultQueries: string[];
  slowQueries: string[];
  abandonedQueries: string[];
  recommendations: {
    type: 'improve_results' | 'optimize_performance' | 'add_feature' | 'content_gap';
    priority: 'high' | 'medium' | 'low';
    description: string;
    query?: string;
    metric?: number;
  }[];
}

class SearchAnalyticsManager {
  private readonly STORAGE_KEY = 'erp_search_analytics';
  private readonly SESSION_KEY = 'erp_session_id';
  private readonly MAX_ENTRIES = 1000;
  private readonly ANALYTICS_VERSION = '1.0';
  
  private analytics: SearchAnalyticsEntry[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.loadFromStorage();
  }

  /**
   * Track a search query and its results
   */
  trackSearch(
    query: string,
    resultCount: number,
    executionTime: number,
    context: SearchAnalyticsEntry['context'],
    searchType: SearchAnalyticsEntry['searchType'] = 'basic',
    userId?: string
  ): string {
    const id = this.generateId();
    const timestamp = Date.now();
    
    const entry: SearchAnalyticsEntry = {
      id,
      query: query.trim().toLowerCase(),
      timestamp,
      userId,
      sessionId: this.sessionId,
      resultCount,
      executionTime,
      searchType,
      context,
      success: resultCount > 0,
    };

    this.analytics.unshift(entry);
    
    // Maintain max entries limit
    if (this.analytics.length > this.MAX_ENTRIES) {
      this.analytics = this.analytics.slice(0, this.MAX_ENTRIES);
    }
    
    this.saveToStorage();
    return id;
  }

  /**
   * Track user interaction with search results
   */
  trackResultClick(
    searchId: string,
    resultId: string,
    resultType: string,
    exitType: SearchAnalyticsEntry['exitType'] = 'result_click'
  ): void {
    const entry = this.analytics.find(e => e.id === searchId);
    if (entry) {
      entry.clickedResultId = resultId;
      entry.clickedResultType = resultType;
      entry.exitType = exitType;
      this.saveToStorage();
    }
  }

  /**
   * Track search refinement or abandonment
   */
  trackSearchExit(searchId: string, exitType: SearchAnalyticsEntry['exitType']): void {
    const entry = this.analytics.find(e => e.id === searchId);
    if (entry && !entry.exitType) {
      entry.exitType = exitType;
      this.saveToStorage();
    }
  }

  /**
   * Get comprehensive search analytics summary
   */
  getAnalyticsSummary(timeRange?: { start: number; end: number }): SearchAnalyticsSummary {
    const filteredAnalytics = timeRange
      ? this.analytics.filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end)
      : this.analytics;

    if (filteredAnalytics.length === 0) {
      return this.getEmptySummary();
    }

    // Basic metrics
    const totalSearches = filteredAnalytics.length;
    const uniqueQueries = new Set(filteredAnalytics.map(e => e.query)).size;
    const averageResultCount = filteredAnalytics.reduce((sum, e) => sum + e.resultCount, 0) / totalSearches;
    const averageExecutionTime = filteredAnalytics.reduce((sum, e) => sum + e.executionTime, 0) / totalSearches;
    const successfulSearches = filteredAnalytics.filter(e => e.success).length;
    const successRate = (successfulSearches / totalSearches) * 100;

    // Top queries
    const queryStats = this.calculateQueryStats(filteredAnalytics);
    const topQueries = Array.from(queryStats.entries())
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        successRate: (stats.successful / stats.count) * 100,
        avgResultCount: stats.totalResults / stats.count,
        lastSearched: stats.lastSearched
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Search patterns
    const searchPatterns = {
      basicSearches: filteredAnalytics.filter(e => e.searchType === 'basic').length,
      advancedSearches: filteredAnalytics.filter(e => e.searchType === 'advanced').length,
      operatorSearches: filteredAnalytics.filter(e => e.searchType === 'operator').length,
      voiceSearches: filteredAnalytics.filter(e => e.searchType === 'voice').length,
    };

    // Time-based analytics
    const searchesByHour = this.groupByTimeUnit(filteredAnalytics, 'hour');
    const searchesByDay = this.groupByTimeUnit(filteredAnalytics, 'day');

    // Context analytics
    const searchesByTab = this.groupBy(filteredAnalytics, e => e.context.tab);
    const searchesByPage = this.groupBy(filteredAnalytics, e => e.context.page);

    // Performance metrics
    const fastSearches = filteredAnalytics.filter(e => e.executionTime < 100).length;
    const normalSearches = filteredAnalytics.filter(e => e.executionTime >= 100 && e.executionTime <= 500).length;
    const slowSearches = filteredAnalytics.filter(e => e.executionTime > 500).length;

    // Behavior metrics
    const noResultsSearches = filteredAnalytics.filter(e => e.resultCount === 0).length;
    const refinedSearches = filteredAnalytics.filter(e => e.exitType === 'refinement').length;
    const abandonedSearches = filteredAnalytics.filter(e => e.exitType === 'page_exit').length;

    // Trending queries
    const trendingQueries = this.calculateTrendingQueries(filteredAnalytics);

    return {
      totalSearches,
      uniqueQueries,
      averageResultCount,
      averageExecutionTime,
      successRate,
      topQueries,
      searchPatterns,
      searchesByHour,
      searchesByDay,
      searchesByTab,
      searchesByPage,
      performanceMetrics: {
        fastSearches,
        normalSearches,
        slowSearches,
        averageTime: averageExecutionTime
      },
      behaviorMetrics: {
        noResultsSearches,
        refinedSearches,
        abandonedSearches,
        successfulSearches
      },
      trendingQueries
    };
  }

  /**
   * Generate actionable insights from analytics data
   */
  generateInsights(timeRange?: { start: number; end: number }): SearchInsights {
    const summary = this.getAnalyticsSummary(timeRange);
    const recommendations: SearchInsights['recommendations'] = [];

    // Popular terms
    const popularTerms = summary.topQueries.slice(0, 10).map(q => q.query);

    // Empty result queries
    const emptyResultQueries = this.analytics
      .filter(e => e.resultCount === 0)
      .map(e => e.query)
      .filter((query, index, array) => array.indexOf(query) === index)
      .slice(0, 10);

    // Slow queries
    const slowQueries = this.analytics
      .filter(e => e.executionTime > 500)
      .map(e => e.query)
      .filter((query, index, array) => array.indexOf(query) === index)
      .slice(0, 10);

    // Abandoned queries
    const abandonedQueries = this.analytics
      .filter(e => e.exitType === 'page_exit' && e.resultCount > 0)
      .map(e => e.query)
      .filter((query, index, array) => array.indexOf(query) === index)
      .slice(0, 10);

    // Generate recommendations
    if (summary.behaviorMetrics.noResultsSearches / summary.totalSearches > 0.2) {
      recommendations.push({
        type: 'improve_results',
        priority: 'high',
        description: `${Math.round((summary.behaviorMetrics.noResultsSearches / summary.totalSearches) * 100)}% of searches return no results. Consider improving search indexing or adding synonyms.`,
        metric: summary.behaviorMetrics.noResultsSearches
      });
    }

    if (summary.performanceMetrics.averageTime > 300) {
      recommendations.push({
        type: 'optimize_performance',
        priority: 'medium',
        description: `Average search time is ${Math.round(summary.performanceMetrics.averageTime)}ms. Consider optimizing search algorithms or adding caching.`,
        metric: summary.performanceMetrics.averageTime
      });
    }

    if (summary.behaviorMetrics.abandonedSearches / summary.totalSearches > 0.15) {
      recommendations.push({
        type: 'add_feature',
        priority: 'medium',
        description: `${Math.round((summary.behaviorMetrics.abandonedSearches / summary.totalSearches) * 100)}% of searches are abandoned. Consider adding search suggestions or better result previews.`,
        metric: summary.behaviorMetrics.abandonedSearches
      });
    }

    // Content gap recommendations
    emptyResultQueries.forEach(query => {
      recommendations.push({
        type: 'content_gap',
        priority: 'low',
        description: `Users frequently search for "${query}" with no results. Consider adding relevant content or data.`,
        query
      });
    });

    return {
      popularTerms,
      emptyResultQueries,
      slowQueries,
      abandonedQueries,
      recommendations: recommendations.slice(0, 10)
    };
  }

  /**
   * Export analytics data
   */
  exportAnalytics(): string {
    return JSON.stringify({
      analytics: this.analytics,
      summary: this.getAnalyticsSummary(),
      insights: this.generateInsights(),
      exportDate: new Date().toISOString(),
      version: this.ANALYTICS_VERSION
    }, null, 2);
  }

  /**
   * Clear analytics data
   */
  clearAnalytics(): void {
    this.analytics = [];
    this.saveToStorage();
  }

  /**
   * Get real-time search stats (last 24 hours)
   */
  getRealTimeStats(): {
    searchesLastHour: number;
    searchesToday: number;
    topQueriesLastHour: string[];
    currentTrends: string[];
  } {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    const lastHour = this.analytics.filter(e => now - e.timestamp < oneHour);
    const today = this.analytics.filter(e => now - e.timestamp < oneDay);

    const topQueriesLastHour = this.getTopQueries(lastHour, 5);
    const currentTrends = this.calculateTrendingQueries(today).slice(0, 5).map(t => t.query);

    return {
      searchesLastHour: lastHour.length,
      searchesToday: today.length,
      topQueriesLastHour,
      currentTrends
    };
  }

  // Private helper methods

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem(this.SESSION_KEY);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(this.SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  private generateId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateQueryStats(analytics: SearchAnalyticsEntry[]): Map<string, {
    count: number;
    successful: number;
    totalResults: number;
    lastSearched: number;
  }> {
    const stats = new Map();
    
    analytics.forEach(entry => {
      const existing = stats.get(entry.query) || {
        count: 0,
        successful: 0,
        totalResults: 0,
        lastSearched: 0
      };
      
      existing.count++;
      if (entry.success) existing.successful++;
      existing.totalResults += entry.resultCount;
      existing.lastSearched = Math.max(existing.lastSearched, entry.timestamp);
      
      stats.set(entry.query, existing);
    });
    
    return stats;
  }

  private groupByTimeUnit(analytics: SearchAnalyticsEntry[], unit: 'hour' | 'day'): Record<string, number> {
    const grouped: Record<string, number> = {};
    
    analytics.forEach(entry => {
      const date = new Date(entry.timestamp);
      let key: string;
      
      if (unit === 'hour') {
        key = `${date.getHours()}:00`;
      } else {
        key = date.toLocaleDateString();
      }
      
      grouped[key] = (grouped[key] || 0) + 1;
    });
    
    return grouped;
  }

  private groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
    const grouped: Record<string, number> = {};
    items.forEach(item => {
      const key = keyFn(item);
      grouped[key] = (grouped[key] || 0) + 1;
    });
    return grouped;
  }

  private calculateTrendingQueries(analytics: SearchAnalyticsEntry[]): SearchAnalyticsSummary['trendingQueries'] {
    // Simple trending calculation based on frequency in recent time periods
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    const recent = analytics.filter(e => now - e.timestamp < oneHour);
    const earlier = analytics.filter(e => 
      now - e.timestamp >= oneHour && now - e.timestamp < 2 * oneHour
    );
    
    const recentCounts = this.getQueryCounts(recent);
    const earlierCounts = this.getQueryCounts(earlier);
    
    const trending = Array.from(recentCounts.entries())
      .map(([query, recentCount]) => {
        const earlierCount = earlierCounts.get(query) || 0;
        const growthRate = earlierCount === 0 ? 100 : ((recentCount - earlierCount) / earlierCount) * 100;
        
        return {
          query,
          count: recentCount,
          growthRate,
          period: 'hour' as const
        };
      })
      .filter(item => item.count >= 2)
      .sort((a, b) => b.growthRate - a.growthRate);
    
    return trending.slice(0, 10);
  }

  private getQueryCounts(analytics: SearchAnalyticsEntry[]): Map<string, number> {
    const counts = new Map<string, number>();
    analytics.forEach(entry => {
      counts.set(entry.query, (counts.get(entry.query) || 0) + 1);
    });
    return counts;
  }

  private getTopQueries(analytics: SearchAnalyticsEntry[], limit: number): string[] {
    const counts = this.getQueryCounts(analytics);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query]) => query);
  }

  private getEmptySummary(): SearchAnalyticsSummary {
    return {
      totalSearches: 0,
      uniqueQueries: 0,
      averageResultCount: 0,
      averageExecutionTime: 0,
      successRate: 0,
      topQueries: [],
      searchPatterns: { basicSearches: 0, advancedSearches: 0, operatorSearches: 0, voiceSearches: 0 },
      searchesByHour: {},
      searchesByDay: {},
      searchesByTab: {},
      searchesByPage: {},
      performanceMetrics: { fastSearches: 0, normalSearches: 0, slowSearches: 0, averageTime: 0 },
      behaviorMetrics: { noResultsSearches: 0, refinedSearches: 0, abandonedSearches: 0, successfulSearches: 0 },
      trendingQueries: []
    };
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.analytics = Array.isArray(parsed) ? parsed : parsed.analytics || [];
      }
    } catch (error) {
      console.warn('Failed to load search analytics from storage:', error);
      this.analytics = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.analytics));
    } catch (error) {
      console.warn('Failed to save search analytics to storage:', error);
    }
  }
}

// Create singleton instance
export const searchAnalyticsManager = new SearchAnalyticsManager();

// Utility functions for easy access
export const trackSearch = (
  query: string,
  resultCount: number,
  executionTime: number,
  context: SearchAnalyticsEntry['context'],
  searchType: SearchAnalyticsEntry['searchType'] = 'basic',
  userId?: string
) => searchAnalyticsManager.trackSearch(query, resultCount, executionTime, context, searchType, userId);

export const trackResultClick = (
  searchId: string,
  resultId: string,
  resultType: string,
  exitType?: SearchAnalyticsEntry['exitType']
) => searchAnalyticsManager.trackResultClick(searchId, resultId, resultType, exitType);

export const getSearchAnalytics = (timeRange?: { start: number; end: number }) =>
  searchAnalyticsManager.getAnalyticsSummary(timeRange);

export const getSearchInsights = (timeRange?: { start: number; end: number }) =>
  searchAnalyticsManager.generateInsights(timeRange);

export const getRealTimeSearchStats = () => searchAnalyticsManager.getRealTimeStats();