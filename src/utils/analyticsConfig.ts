/**
 * Analytics Configuration for NexaCore Innovations
 * Comprehensive tracking for SEO and business performance
 */

// Your Google Analytics 4 Measurement ID
export const GA4_MEASUREMENT_ID = 'G-M79SEPLBFQ';

// Enhanced measurement configuration
export const ANALYTICS_CONFIG = {
  // Basic configuration
  measurementId: GA4_MEASUREMENT_ID,
  
  // Enhanced tracking options
  enhanced_measurement: true,
  send_page_view: true,
  
  // SEO-focused custom parameters
  custom_map: {
    'custom_parameter_1': 'service_category',
    'custom_parameter_2': 'client_industry', 
    'custom_parameter_3': 'page_type',
    'custom_parameter_4': 'traffic_source',
    'custom_parameter_5': 'user_location'
  },
  
  // Performance tracking
  track_performance: true,
  track_core_web_vitals: true,
  
  // SEO event tracking
  seo_events: {
    search_queries: true,
    page_engagement: true,
    conversion_goals: true,
    user_journey: true
  }
};

// Custom events for SEO tracking
export const SEO_EVENTS = {
  // Page engagement events
  PAGE_SCROLL_DEPTH: 'page_scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
  PAGE_ENGAGEMENT: 'page_engagement',
  
  // SEO-specific events
  ORGANIC_SEARCH_LANDING: 'organic_search_landing',
  KEYWORD_RANKING_CLICK: 'keyword_ranking_click',
  LOCAL_SEARCH_CLICK: 'local_search_click',
  
  // Conversion events
  CONTACT_FORM_SUBMIT: 'contact_form_submit',
  SERVICE_INQUIRY: 'service_inquiry',
  CONSULTATION_REQUEST: 'consultation_request',
  QUOTE_REQUEST: 'quote_request',
  
  // Performance events
  CORE_WEB_VITALS: 'core_web_vitals',
  PAGE_LOAD_PERFORMANCE: 'page_load_performance',
  
  // Content engagement
  SERVICE_PAGE_VIEW: 'service_page_view',
  PROJECT_PORTFOLIO_VIEW: 'project_portfolio_view',
  BLOG_POST_READ: 'blog_post_read',
  
  // Business intelligence
  INDUSTRY_INTEREST: 'industry_interest',
  SERVICE_CATEGORY_INTEREST: 'service_category_interest',
  GEOGRAPHIC_INTEREST: 'geographic_interest'
};

// Conversion goals configuration
export const CONVERSION_GOALS = [
  {
    name: 'Contact Form Submission',
    event: SEO_EVENTS.CONTACT_FORM_SUBMIT,
    value: 50, // Estimated lead value
    category: 'Lead Generation'
  },
  {
    name: 'Service Inquiry',
    event: SEO_EVENTS.SERVICE_INQUIRY,
    value: 100,
    category: 'Lead Generation'
  },
  {
    name: 'Consultation Request',
    event: SEO_EVENTS.CONSULTATION_REQUEST,
    value: 200,
    category: 'High Intent Lead'
  },
  {
    name: 'Quote Request',
    event: SEO_EVENTS.QUOTE_REQUEST,
    value: 500,
    category: 'High Intent Lead'
  },
  {
    name: 'Service Page Engagement',
    event: SEO_EVENTS.SERVICE_PAGE_VIEW,
    value: 10,
    category: 'Content Engagement'
  }
];

// Service categories for tracking
export const SERVICE_CATEGORIES = {
  'CAD_DESIGN': 'CAD Design & Engineering',
  'SOFTWARE_DEV': 'Software Development',
  'AI_ML': 'AI & Machine Learning',
  'BLOCKCHAIN': 'Blockchain & Web3',
  'MOBILE_APPS': 'Mobile App Development',
  'GRAPHIC_DESIGN': 'Graphic Design & Branding',
  'DATA_ANALYTICS': 'Data Analytics',
  'CONSULTING': 'Technical Consulting'
};

// Client industries for B2B tracking
export const CLIENT_INDUSTRIES = {
  'MANUFACTURING': 'Manufacturing',
  'HEALTHCARE': 'Healthcare',
  'FINTECH': 'Financial Technology',
  'EDUCATION': 'Education',
  'ECOMMERCE': 'E-commerce',
  'STARTUP': 'Startup',
  'ENTERPRISE': 'Enterprise',
  'GOVERNMENT': 'Government',
  'NGO': 'Non-Profit Organization'
};

// Page types for content analysis
export const PAGE_TYPES = {
  'HOMEPAGE': 'Homepage',
  'SERVICE_PAGE': 'Service Page',
  'ABOUT_PAGE': 'About Page',
  'CONTACT_PAGE': 'Contact Page',
  'PORTFOLIO_PAGE': 'Portfolio Page',
  'BLOG_POST': 'Blog Post',
  'LANDING_PAGE': 'Landing Page',
  'PRICING_PAGE': 'Pricing Page'
};

// Geographic markets for location-based analysis
export const GEOGRAPHIC_MARKETS = {
  'GHANA_LOCAL': 'Ghana (Local)',
  'WEST_AFRICA': 'West Africa',
  'AFRICA': 'Africa',
  'NORTH_AMERICA': 'North America',
  'EUROPE': 'Europe',
  'ASIA': 'Asia',
  'OCEANIA': 'Oceania',
  'OTHER': 'Other International'
};

// Initialize enhanced analytics tracking
export const initializeAnalytics = () => {
  if (typeof window === 'undefined' || !window.gtag) return;

  // Set up enhanced ecommerce for B2B tracking
  window.gtag('config', GA4_MEASUREMENT_ID, {
    ...ANALYTICS_CONFIG,
    // B2B specific configuration
    business_vertical: 'Technology Services',
    industry: 'Engineering & Software Development',
    target_market: 'B2B',
    geographic_focus: ['Ghana', 'West Africa', 'International']
  });

  console.log('✅ Enhanced Analytics initialized for NexaCore Innovations');
};

// Track service category interest
export const trackServiceInterest = (
  serviceCategory: keyof typeof SERVICE_CATEGORIES,
  pagePath: string,
  additionalData: Record<string, any> = {}
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', SEO_EVENTS.SERVICE_CATEGORY_INTEREST, {
    event_category: 'Service Interest',
    event_label: SERVICE_CATEGORIES[serviceCategory],
    service_category: serviceCategory,
    page_location: pagePath,
    value: 10,
    ...additionalData
  });
};

// Track geographic interest
export const trackGeographicInterest = (
  market: keyof typeof GEOGRAPHIC_MARKETS,
  action: string = 'page_view'
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', SEO_EVENTS.GEOGRAPHIC_INTEREST, {
    event_category: 'Geographic Interest',
    event_label: GEOGRAPHIC_MARKETS[market],
    user_location: market,
    action: action,
    value: 5
  });
};

// Track conversion events
export const trackConversion = (
  goalName: string,
  value: number = 0,
  additionalData: Record<string, any> = {}
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  const goal = CONVERSION_GOALS.find(g => g.name === goalName);
  if (!goal) return;

  window.gtag('event', goal.event, {
    event_category: goal.category,
    event_label: goalName,
    value: value || goal.value,
    currency: 'USD',
    ...additionalData
  });

  // Also track as a conversion
  window.gtag('event', 'conversion', {
    send_to: `${GA4_MEASUREMENT_ID}/${goal.event}`,
    value: value || goal.value,
    currency: 'USD'
  });
};

// Track Core Web Vitals for SEO
export const trackCoreWebVitals = (metrics: {
  fcp?: number;
  lcp?: number;
  cls?: number;
  fid?: number;
  ttfb?: number;
}) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  Object.entries(metrics).forEach(([metric, value]) => {
    if (value !== undefined) {
      window.gtag('event', SEO_EVENTS.CORE_WEB_VITALS, {
        event_category: 'Core Web Vitals',
        event_label: metric.toUpperCase(),
        metric_name: metric,
        metric_value: Math.round(value),
        value: Math.round(value)
      });
    }
  });
};

// Track organic search traffic
export const trackOrganicTraffic = (
  keyword: string = 'unknown',
  searchEngine: string = 'google',
  position: number = 0
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', SEO_EVENTS.ORGANIC_SEARCH_LANDING, {
    event_category: 'SEO Traffic',
    event_label: keyword,
    search_engine: searchEngine,
    keyword: keyword,
    estimated_position: position,
    traffic_source: 'organic_search',
    value: 20
  });
};

// Initialize all tracking when page loads
export const initializeComprehensiveTracking = () => {
  if (typeof window === 'undefined') return;

  // Initialize basic analytics
  initializeAnalytics();

  // Detect and track organic traffic
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const referrer = document.referrer;

  // Track organic search traffic
  if (referrer.includes('google.com') || referrer.includes('bing.com') || referrer.includes('yahoo.com')) {
    const searchEngine = referrer.includes('google.com') ? 'google' : 
                        referrer.includes('bing.com') ? 'bing' : 'yahoo';
    trackOrganicTraffic('(not provided)', searchEngine);
  }

  // Track geographic market based on URL or other indicators
  const hostname = window.location.hostname;
  if (hostname.includes('.gh') || urlParams.get('market') === 'ghana') {
    trackGeographicInterest('GHANA_LOCAL');
  }

  console.log('✅ Comprehensive tracking initialized');
};

// All functions are already exported above