/**
 * SEO Hook for Dynamic Meta Tag Management
 * Automatically manages page SEO metadata for better search rankings
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SEOData, generateSEOData, updateMetaTags, trackSEOMetrics } from '@/utils/seo';

export interface UseSEOOptions {
  page?: string;
  customData?: Partial<SEOData>;
  enableTracking?: boolean;
}

export const useSEO = (options: UseSEOOptions = {}) => {
  const location = useLocation();
  
  useEffect(() => {
    // Determine page from location or options
    const currentPage = options.page || getPageFromPath(location.pathname);
    
    // Generate SEO data
    const seoData = generateSEOData(currentPage, options.customData);
    
    // Update meta tags
    updateMetaTags(seoData);
    
    // Track SEO metrics if enabled
    if (options.enableTracking !== false) {
      trackSEOMetrics();
    }
    
    // Update page URL in analytics/tracking scripts if available
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: seoData.title,
        page_location: seoData.canonical || window.location.href,
      });
    }
    
  }, [location.pathname, options.page, options.customData]);
};

// Helper function to determine page from pathname
const getPageFromPath = (pathname: string): string => {
  const pathMap: Record<string, string> = {
    '/': 'home',
    '/about': 'about',
    '/services': 'services', 
    '/portfolio': 'portfolio',
    '/contact': 'contact',
    '/get-started': 'services',
    '/book-consultation': 'contact'
  };
  
  return pathMap[pathname] || 'home';
};

// Preload critical SEO resources
export const preloadSEOResources = () => {
  useEffect(() => {
    // Preload Open Graph image
    const ogImage = new Image();
    ogImage.src = 'https://www.nexacore-innovations.com/og-image.png';
    
    // Preload favicon
    const favicon = new Image();
    favicon.src = '/favicon.png';
    
    // Preload critical fonts if any
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    // Add your font URLs here if using custom fonts
    
  }, []);
};