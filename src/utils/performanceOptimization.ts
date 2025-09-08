/**
 * Performance Optimization Utilities
 * Comprehensive performance enhancements for better SEO rankings
 */

// Core Web Vitals monitoring and optimization
export interface WebVitalsMetrics {
  fcp?: number;  // First Contentful Paint
  lcp?: number;  // Largest Contentful Paint
  fid?: number;  // First Input Delay
  cls?: number;  // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

// Performance optimization configuration
export const PERFORMANCE_CONFIG = {
  criticalResources: [
    'https://www.nexacore-innovations.com/og-image.png',
    '/favicon.png',
    '/hero-main.jpg'
  ],
  lazyLoadThreshold: '50px',
  imageCompressionQuality: {
    hero: 85,
    card: 80,
    thumbnail: 75
  },
  cacheStrategies: {
    static: '1 year',
    dynamic: '1 hour',
    api: '5 minutes'
  }
};

// Critical resource preloading
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return;

  const criticalResources = [
    // Critical images
    { href: '/hero-main.jpg', as: 'image', type: 'image/jpeg' },
    { href: '/og-image.png', as: 'image', type: 'image/png' },
    { href: '/favicon.png', as: 'image', type: 'image/png' },
    
    // Critical fonts (add if you use custom fonts)
    // { href: '/fonts/main-font.woff2', as: 'font', type: 'font/woff2', crossorigin: true },
    
    // Critical CSS (for above-the-fold content)
    { href: '/critical.css', as: 'style', type: 'text/css' }
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = resource.as;
    link.href = resource.href;
    if (resource.type) link.type = resource.type;
    if (resource.crossorigin) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// DNS prefetch for external resources
export const prefetchExternalResources = () => {
  if (typeof window === 'undefined') return;

  const externalDomains = [
    'https://www.google-analytics.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdnjs.cloudflare.com',
    'https://cdn.jsdelivr.net'
  ];

  externalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
};

// Service Worker for caching strategy
export const registerServiceWorker = () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
};

// Lazy loading implementation with Intersection Observer
export const createLazyLoader = () => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return null;

  const lazyImageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        
        // Load the actual image
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        
        // Load srcset if available
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
          img.removeAttribute('data-srcset');
        }
        
        // Remove lazy class and add loaded class
        img.classList.remove('lazy');
        img.classList.add('lazy-loaded');
        
        lazyImageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: PERFORMANCE_CONFIG.lazyLoadThreshold
  });

  return lazyImageObserver;
};

// Core Web Vitals tracking
export const trackWebVitals = (): Promise<WebVitalsMetrics> => {
  return new Promise((resolve) => {
    const metrics: WebVitalsMetrics = {};
    
    // Performance API availability check
    if (typeof window === 'undefined' || !('performance' in window)) {
      resolve(metrics);
      return;
    }

    // Track First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      metrics.fcp = fcpEntry.startTime;
    }

    // Track Time to First Byte
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
    }

    // Track other metrics with PerformanceObserver
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          metrics.fid = (entry as any).processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            metrics.cls = clsValue;
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Resolve after a reasonable time to collect metrics
      setTimeout(() => resolve(metrics), 3000);
    } else {
      resolve(metrics);
    }
  });
};

// Resource hints for better loading
export const addResourceHints = () => {
  if (typeof window === 'undefined') return;

  const hints = [
    // Preconnect to critical origins
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
    
    // DNS prefetch for other domains
    { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
    { rel: 'dns-prefetch', href: '//cdnjs.cloudflare.com' },
    
    // Preload critical CSS
    { rel: 'preload', href: '/critical.css', as: 'style' }
  ];

  hints.forEach(hint => {
    const existing = document.querySelector(`link[href="${hint.href}"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      if (hint.as) link.setAttribute('as', hint.as);
      if (hint.crossorigin) link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });
};

// Image optimization helpers
export const optimizeImages = () => {
  if (typeof window === 'undefined') return;

  // Add loading="lazy" to images that don't have it
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach((img, index) => {
    // First few images should load eagerly
    if (index < 3) {
      (img as HTMLImageElement).loading = 'eager';
    } else {
      (img as HTMLImageElement).loading = 'lazy';
    }
  });

  // Add decoding="async" for better performance
  const allImages = document.querySelectorAll('img');
  allImages.forEach(img => {
    if (!(img as HTMLImageElement).decoding) {
      (img as HTMLImageElement).decoding = 'async';
    }
  });
};

// Performance monitoring and reporting
export const monitorPerformance = () => {
  if (typeof window === 'undefined') return;

  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          console.warn(`Long task detected: ${entry.duration}ms`);
        }
      });
    });
    
    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Longtask API not supported
    }

    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 1000) {
          console.warn(`Slow resource: ${entry.name} took ${entry.duration}ms`);
        }
      });
    });
    
    resourceObserver.observe({ entryTypes: ['resource'] });
  }
};

// Bundle size optimization recommendations
export const OPTIMIZATION_RECOMMENDATIONS = {
  bundleSize: {
    javascript: 'Keep JS bundles under 250KB gzipped',
    css: 'Keep CSS under 100KB gzipped',
    total: 'Target total page weight under 1MB'
  },
  images: {
    format: 'Use WebP with JPEG/PNG fallback',
    compression: 'Optimize images to under 500KB each',
    responsive: 'Implement responsive images with srcset'
  },
  fonts: {
    loading: 'Use font-display: swap',
    preload: 'Preload critical font files',
    subset: 'Use font subsetting for smaller files'
  },
  caching: {
    static: 'Cache static assets for 1 year',
    html: 'Cache HTML for short periods (1 hour)',
    api: 'Implement appropriate API caching'
  }
};

// Initialize all performance optimizations
export const initializePerformanceOptimizations = () => {
  if (typeof window === 'undefined') return;

  // Run optimizations on load
  window.addEventListener('load', () => {
    preloadCriticalResources();
    prefetchExternalResources();
    addResourceHints();
    optimizeImages();
    monitorPerformance();
    
    // Track web vitals after page load
    trackWebVitals().then(metrics => {
      console.log('Web Vitals:', metrics);
      
      // Send to analytics if needed
      if (typeof gtag !== 'undefined') {
        Object.entries(metrics).forEach(([metric, value]) => {
          if (value !== undefined) {
            gtag('event', 'web_vitals', {
              event_category: 'Performance',
              event_label: metric,
              value: Math.round(value)
            });
          }
        });
      }
    });
  });

  // Initialize lazy loading
  const lazyLoader = createLazyLoader();
  if (lazyLoader) {
    // Observe all lazy images
    document.querySelectorAll('img[data-src], img.lazy').forEach(img => {
      lazyLoader.observe(img);
    });
  }
};

// Export performance utilities
export {
  preloadCriticalResources,
  prefetchExternalResources,
  createLazyLoader,
  trackWebVitals,
  addResourceHints,
  optimizeImages,
  monitorPerformance
};