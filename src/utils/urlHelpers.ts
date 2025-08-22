// src/utils/urlHelpers.ts - Updated for Vercel
export const getBaseUrl = (): string => {
  // Get base URL from environment or fallback to current origin
  if (typeof window !== 'undefined') {
    return import.meta.env.VITE_APP_URL || 
           import.meta.env.SITE_URL || 
           window.location.origin;
  }
  
  // Server-side fallback
  return process.env.VITE_APP_URL || 
         process.env.SITE_URL || 
         'https://nexacore-innovations.com';
};

export const getQuoteUrl = (quoteId: string): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/quote/${quoteId}`;
};

export const getQuotePDFUrl = (quoteId: string): string => {
  const baseUrl = getBaseUrl();
  // Updated for Vercel API routes
  return `${baseUrl}/api/quotes/${quoteId}/pdf`;
};

export const getAdminQuoteUrl = (requestId: string, token?: string): string => {
  const baseUrl = getBaseUrl();
  const params = new URLSearchParams();
  params.set('request_id', requestId);
  if (token) params.set('token', token);
  return `${baseUrl}/admin/create-quote?${params.toString()}`;
};

export const getClientPortalUrl = (): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/client-portal`;
};

// Helper for Vercel deployments
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production' || 
         process.env.VERCEL_ENV === 'production';
};

// Helper for development URLs
export const getDevUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};
