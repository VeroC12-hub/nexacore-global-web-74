/**
 * SEO Analytics and Monitoring System
 * Comprehensive tracking and analysis for search performance
 */

export interface SEOMetrics {
  pageViews: number;
  organicTraffic: number;
  bounceRate: number;
  averageSessionDuration: number;
  clickThroughRate: number;
  keywordRankings: KeywordRanking[];
  technicalIssues: TechnicalIssue[];
  coreWebVitals: {
    fcp: number;
    lcp: number;
    cls: number;
    fid: number;
  };
}

export interface KeywordRanking {
  keyword: string;
  position: number;
  searchVolume: number;
  difficulty: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TechnicalIssue {
  type: 'crawling' | 'indexing' | 'performance' | 'content';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  url?: string;
  recommendation: string;
}

// Target keywords for NexaCore Innovations
export const TARGET_KEYWORDS = {
  primary: [
    'engineering services Ghana',
    'software development Africa',
    'CAD design services',
    'AI machine learning development',
    'blockchain development Ghana'
  ],
  secondary: [
    '3D modeling company Ghana',
    'web application development',
    'mobile app development Ghana',
    'data analytics consulting',
    'graphic design services Ghana'
  ],
  longTail: [
    'professional CAD design services in Ghana',
    'custom software development company Africa',
    'AI machine learning solutions for businesses',
    'blockchain development services West Africa',
    'engineering consultation services international'
  ],
  local: [
    'engineering company Accra Ghana',
    'software development company Accra',
    'tech services Ghana West Africa',
    'CAD training Ghana',
    'IT consulting services Accra'
  ]
};

// SEO monitoring configuration
export const SEO_MONITORING_CONFIG = {
  trackingInterval: 24 * 60 * 60 * 1000, // 24 hours
  keywordUpdateFrequency: 7 * 24 * 60 * 60 * 1000, // 7 days
  technicalAuditFrequency: 30 * 24 * 60 * 60 * 1000, // 30 days
  competitorUrls: [
    'https://competitor1.com',
    'https://competitor2.com'
  ],
  targetMetrics: {
    organicTrafficGrowth: 20, // 20% monthly growth target
    averagePosition: 10, // Top 10 average position
    coreWebVitalsThreshold: {
      fcp: 2.5, // seconds
      lcp: 4.0, // seconds
      cls: 0.1, // score
      fid: 300 // milliseconds
    }
  }
};

// Initialize Google Analytics 4
export const initializeGA4 = (measurementId: string) => {
  if (typeof window === 'undefined') return;

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  (window as any).gtag = gtag;

  gtag('js', new Date());
  gtag('config', measurementId, {
    // Enhanced ecommerce tracking
    send_page_view: true,
    // Custom parameters for B2B tracking
    custom_map: {
      custom_parameter_1: 'service_category',
      custom_parameter_2: 'client_industry'
    }
  });
};

// Initialize Google Search Console
export const initializeSearchConsole = (siteUrl: string) => {
  if (typeof window === 'undefined') return;

  // Add Search Console verification meta tag (should be in HTML head)
  const verificationMeta = document.createElement('meta');
  verificationMeta.name = 'google-site-verification';
  verificationMeta.content = 'YOUR_SEARCH_CONSOLE_VERIFICATION_CODE';
  document.head.appendChild(verificationMeta);
};

// Track custom SEO events
export const trackSEOEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window === 'undefined' || typeof gtag === 'undefined') return;

  gtag('event', eventName, {
    event_category: 'SEO',
    event_label: parameters.label || '',
    value: parameters.value || 0,
    custom_parameter_1: parameters.service_category || '',
    custom_parameter_2: parameters.client_industry || '',
    ...parameters
  });
};

// Track page performance for SEO
export const trackPagePerformance = (pageName: string) => {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    // Wait for performance data to be available
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (perfData) {
        const metrics = {
          pageLoadTime: perfData.loadEventEnd - perfData.loadEventStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          firstByteTime: perfData.responseStart - perfData.requestStart,
          dnsTime: perfData.domainLookupEnd - perfData.domainLookupStart,
          connectTime: perfData.connectEnd - perfData.connectStart
        };

        // Track performance metrics
        trackSEOEvent('page_performance', {
          label: pageName,
          page_load_time: Math.round(metrics.pageLoadTime),
          dom_content_loaded: Math.round(metrics.domContentLoaded),
          first_byte_time: Math.round(metrics.firstByteTime)
        });

        // Alert for poor performance
        if (metrics.pageLoadTime > 3000) {
          console.warn(`Slow page load detected: ${pageName} took ${metrics.pageLoadTime}ms`);
        }
      }
    }, 1000);
  });
};

// Track user engagement for SEO signals
export const trackUserEngagement = () => {
  if (typeof window === 'undefined') return;

  let startTime = Date.now();
  let scrollDepth = 0;
  let maxScrollDepth = 0;

  // Track scroll depth
  const trackScrollDepth = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    scrollDepth = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
    maxScrollDepth = Math.max(maxScrollDepth, scrollDepth);
  };

  window.addEventListener('scroll', trackScrollDepth, { passive: true });

  // Track time on page when user leaves
  const trackTimeOnPage = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    trackSEOEvent('user_engagement', {
      label: window.location.pathname,
      time_on_page: timeSpent,
      max_scroll_depth: maxScrollDepth,
      page_url: window.location.href
    });
  };

  // Track on page unload
  window.addEventListener('beforeunload', trackTimeOnPage);
  
  // Also track on visibility change (tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      trackTimeOnPage();
    } else {
      startTime = Date.now(); // Reset timer when tab becomes visible again
    }
  });
};

// Monitor and report technical SEO issues
export const monitorTechnicalSEO = (): TechnicalIssue[] => {
  const issues: TechnicalIssue[] = [];

  // Check for missing meta descriptions
  const metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription || !metaDescription.getAttribute('content')?.trim()) {
    issues.push({
      type: 'content',
      severity: 'high',
      description: 'Missing meta description',
      url: window.location.href,
      recommendation: 'Add a compelling meta description (150-160 characters)'
    });
  }

  // Check for missing title tag
  if (!document.title || document.title.trim().length === 0) {
    issues.push({
      type: 'content',
      severity: 'critical',
      description: 'Missing or empty title tag',
      url: window.location.href,
      recommendation: 'Add a descriptive title tag (50-60 characters)'
    });
  }

  // Check for images without alt text
  const imagesWithoutAlt = document.querySelectorAll('img:not([alt]), img[alt=""]');
  if (imagesWithoutAlt.length > 0) {
    issues.push({
      type: 'content',
      severity: 'medium',
      description: `${imagesWithoutAlt.length} images missing alt text`,
      url: window.location.href,
      recommendation: 'Add descriptive alt text to all images'
    });
  }

  // Check for broken internal links
  const links = document.querySelectorAll('a[href^="/"], a[href^="./"]');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href !== '#') {
      // This would typically be done server-side or with a more sophisticated tool
      // For client-side, we can only do basic checks
      if (href.includes('404') || href.includes('error')) {
        issues.push({
          type: 'crawling',
          severity: 'medium',
          description: `Potentially broken internal link: ${href}`,
          url: window.location.href,
          recommendation: 'Check and fix broken internal links'
        });
      }
    }
  });

  // Check for duplicate H1 tags
  const h1Tags = document.querySelectorAll('h1');
  if (h1Tags.length > 1) {
    issues.push({
      type: 'content',
      severity: 'medium',
      description: `Multiple H1 tags found (${h1Tags.length})`,
      url: window.location.href,
      recommendation: 'Use only one H1 tag per page'
    });
  }

  // Check for missing canonical URL
  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    issues.push({
      type: 'indexing',
      severity: 'medium',
      description: 'Missing canonical URL',
      url: window.location.href,
      recommendation: 'Add canonical URL to prevent duplicate content issues'
    });
  }

  return issues;
};

// Generate SEO report
export const generateSEOReport = async (): Promise<{
  score: number;
  issues: TechnicalIssue[];
  recommendations: string[];
  keywordDensity: Record<string, number>;
}> => {
  const issues = monitorTechnicalSEO();
  const criticalIssues = issues.filter(issue => issue.severity === 'critical').length;
  const highIssues = issues.filter(issue => issue.severity === 'high').length;
  const mediumIssues = issues.filter(issue => issue.severity === 'medium').length;
  
  // Calculate SEO score (100 - penalty points)
  let score = 100;
  score -= criticalIssues * 20; // -20 for each critical issue
  score -= highIssues * 10;     // -10 for each high severity issue
  score -= mediumIssues * 5;    // -5 for each medium severity issue
  score = Math.max(0, score);   // Minimum score of 0

  // Analyze keyword density
  const pageText = document.body.innerText.toLowerCase();
  const words = pageText.split(/\s+/);
  const keywordDensity: Record<string, number> = {};
  
  [...TARGET_KEYWORDS.primary, ...TARGET_KEYWORDS.secondary].forEach(keyword => {
    const keywordOccurrences = (pageText.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    const density = (keywordOccurrences / words.length) * 100;
    keywordDensity[keyword] = Math.round(density * 100) / 100; // Round to 2 decimals
  });

  // Generate recommendations
  const recommendations = [
    score < 80 ? 'Address critical and high-severity SEO issues' : null,
    issues.some(i => i.type === 'content') ? 'Improve content optimization' : null,
    issues.some(i => i.type === 'performance') ? 'Optimize page performance' : null,
    Object.values(keywordDensity).some(density => density < 0.5) ? 'Increase keyword density for target terms' : null,
    'Monitor and track keyword rankings regularly',
    'Build high-quality backlinks to improve domain authority',
    'Create fresh, valuable content regularly'
  ].filter(Boolean) as string[];

  return {
    score,
    issues,
    recommendations,
    keywordDensity
  };
};

// Initialize comprehensive SEO tracking
export const initializeSEOTracking = (config: {
  gaTrackingId?: string;
  searchConsoleUrl?: string;
  enableUserEngagement?: boolean;
  enablePerformanceTracking?: boolean;
}) => {
  if (typeof window === 'undefined') return;

  // Initialize Google Analytics
  if (config.gaTrackingId) {
    initializeGA4(config.gaTrackingId);
  }

  // Initialize Search Console
  if (config.searchConsoleUrl) {
    initializeSearchConsole(config.searchConsoleUrl);
  }

  // Enable user engagement tracking
  if (config.enableUserEngagement !== false) {
    trackUserEngagement();
  }

  // Enable performance tracking
  if (config.enablePerformanceTracking !== false) {
    trackPagePerformance(document.title || window.location.pathname);
  }

  // Periodic technical SEO monitoring
  setInterval(() => {
    const issues = monitorTechnicalSEO();
    if (issues.some(issue => issue.severity === 'critical')) {
      console.warn('Critical SEO issues detected:', issues);
    }
  }, SEO_MONITORING_CONFIG.technicalAuditFrequency);

  console.log('SEO tracking initialized successfully');
};

// Export all utilities
export {
  initializeGA4,
  initializeSearchConsole,
  trackSEOEvent,
  trackPagePerformance,
  trackUserEngagement,
  monitorTechnicalSEO,
  generateSEOReport
};