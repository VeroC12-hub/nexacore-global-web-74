/**
 * Advanced SEO Utilities for NexaCore Innovations
 * Comprehensive SEO management system for better search rankings
 */

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  schema?: any;
  robots?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

// Primary keywords for NexaCore Innovations
export const PRIMARY_KEYWORDS = [
  'engineering services',
  'software development',
  'CAD design',
  '3D modeling',
  'AI machine learning',
  'blockchain development',
  'web development',
  'mobile app development',
  'graphic design',
  'data analytics',
  'digital transformation',
  'technical consulting'
];

// Location-based keywords for local SEO
export const LOCATION_KEYWORDS = [
  'Ghana engineering company',
  'West Africa tech services',
  'global engineering solutions',
  'international software development',
  'African innovation hub',
  'Ghana tech startup'
];

// Service-specific long-tail keywords
export const SERVICE_KEYWORDS = {
  cad: [
    'professional CAD design services',
    'mechanical engineering design',
    '3D product modeling',
    'industrial design consultation',
    'CAD training programs',
    'technical drawing services'
  ],
  software: [
    'custom software development',
    'enterprise web applications',
    'mobile app development iOS Android',
    'full stack development services',
    'software consulting Ghana',
    'agile development methodology'
  ],
  ai: [
    'artificial intelligence development',
    'machine learning solutions',
    'AI automation tools',
    'data science consulting',
    'predictive analytics services',
    'AI implementation strategy'
  ],
  design: [
    'professional graphic design',
    'brand identity design',
    'UI UX design services',
    'digital marketing design',
    'logo design branding',
    'creative design agency'
  ],
  data: [
    'business intelligence dashboards',
    'data visualization services',
    'Excel automation solutions',
    'Power BI consulting',
    'database design optimization',
    'analytics implementation'
  ]
};

// Generate page-specific SEO data
export const generateSEOData = (page: string, customData?: Partial<SEOData>): SEOData => {
  const baseData: Record<string, SEOData> = {
    home: {
      title: 'NexaCore Innovations - Global Engineering & Software Development Company',
      description: 'Leading engineering and software development company in Ghana. Expert CAD design, AI/ML solutions, web development, mobile apps, and creative services for global clients.',
      keywords: [
        ...PRIMARY_KEYWORDS,
        ...LOCATION_KEYWORDS,
        'engineering company Ghana',
        'software development Africa',
        'tech innovation hub',
        'global engineering services'
      ],
      canonical: 'https://www.nexacore-innovations.com/',
      ogType: 'website',
      schema: generateOrganizationSchema()
    },
    about: {
      title: 'About NexaCore Innovations - Expert Engineering & Tech Team',
      description: 'Meet the expert team behind NexaCore Innovations. Learn about our mission to deliver world-class engineering, software development, and creative solutions globally.',
      keywords: [
        'about nexacore innovations',
        'engineering team Ghana',
        'tech company founders',
        'Ocloo Godwin',
        'Benjamin Agbesi',
        'company history',
        'mission vision values'
      ],
      canonical: 'https://www.nexacore-innovations.com/about',
      ogType: 'website',
      schema: generateAboutPageSchema()
    },
    services: {
      title: 'Engineering & Software Development Services - NexaCore Innovations',
      description: 'Comprehensive engineering and tech services: CAD design, software development, AI/ML, blockchain, mobile apps, data analytics, and creative design solutions.',
      keywords: [
        ...SERVICE_KEYWORDS.cad,
        ...SERVICE_KEYWORDS.software,
        ...SERVICE_KEYWORDS.ai,
        ...SERVICE_KEYWORDS.design,
        ...SERVICE_KEYWORDS.data,
        'comprehensive tech services',
        'engineering solutions provider'
      ],
      canonical: 'https://www.nexacore-innovations.com/services',
      ogType: 'website',
      schema: generateServicesSchema()
    },
    portfolio: {
      title: 'Portfolio - NexaCore Innovations Projects & Case Studies',
      description: 'Explore our portfolio of successful engineering projects, software applications, and creative solutions delivered for clients worldwide.',
      keywords: [
        'nexacore portfolio',
        'engineering projects showcase',
        'software development case studies',
        'client success stories',
        'project examples',
        'tech solutions portfolio'
      ],
      canonical: 'https://www.nexacore-innovations.com/portfolio',
      ogType: 'website',
      schema: generatePortfolioSchema()
    },
    contact: {
      title: 'Contact NexaCore Innovations - Get Engineering & Tech Solutions',
      description: 'Contact NexaCore Innovations for expert engineering, software development, and creative services. Free consultation for your next project.',
      keywords: [
        'contact nexacore innovations',
        'engineering consultation',
        'software development quote',
        'tech support Ghana',
        'project inquiry',
        'free consultation'
      ],
      canonical: 'https://www.nexacore-innovations.com/contact',
      ogType: 'website',
      schema: generateContactPageSchema()
    }
  };

  const data = baseData[page] || baseData.home;
  
  return {
    ...data,
    ...customData,
    keywords: [...data.keywords, ...(customData?.keywords || [])],
    ogImage: customData?.ogImage || 'https://www.nexacore-innovations.com/og-image.png',
    twitterCard: customData?.twitterCard || 'summary_large_image',
    author: customData?.author || 'NexaCore Innovations',
    robots: customData?.robots || 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'
  };
};

// Generate Organization Schema
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "NexaCore Innovations",
  "url": "https://www.nexacore-innovations.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.nexacore-innovations.com/og-image.png",
    "width": 512,
    "height": 512
  },
  "description": "Leading engineering and software development company providing CAD design, AI/ML solutions, web development, and creative services globally.",
  "foundingDate": "2023",
  "founders": [
    {
      "@type": "Person",
      "name": "Ocloo Godwin",
      "jobTitle": "Co-Founder & Project Manager"
    },
    {
      "@type": "Person", 
      "name": "Benjamin Agbesi",
      "jobTitle": "Co-Founder & Operations Manager"
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "GH",
    "addressRegion": "Greater Accra",
    "addressLocality": "Accra"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+233-XXX-XXX-XXX",
    "contactType": "Customer Service",
    "areaServed": "Worldwide",
    "availableLanguage": ["English"]
  },
  "sameAs": [
    "https://www.linkedin.com/company/nexacore-innovations",
    "https://www.facebook.com/nexacore-innovations",
    "https://twitter.com/nexacoreglobal"
  ],
  "serviceArea": {
    "@type": "Place",
    "name": "Worldwide"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "NexaCore Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "CAD Design & Engineering",
          "description": "Professional CAD design, 3D modeling, mechanical engineering, and technical drawing services"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Software Development",
          "description": "Custom software development, web applications, mobile apps, and enterprise solutions"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "AI & Machine Learning",
          "description": "Artificial intelligence solutions, machine learning models, automation, and data analytics"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Creative & Branding",
          "description": "Graphic design, UI/UX design, branding, video editing, and creative content creation"
        }
      }
    ]
  }
});

// Generate Breadcrumb Schema
export const generateBreadcrumbSchema = (breadcrumbs: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

// Generate Article Schema for blog posts
export const generateArticleSchema = (article: {
  title: string;
  description: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  image: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "image": [article.image],
  "datePublished": article.publishedTime,
  "dateModified": article.modifiedTime || article.publishedTime,
  "author": {
    "@type": "Person",
    "name": article.author
  },
  "publisher": {
    "@type": "Organization",
    "name": "NexaCore Innovations",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.nexacore-innovations.com/og-image.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": article.url
  }
});

// Additional schema generators
export const generateAboutPageSchema = () => ({
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About NexaCore Innovations",
  "description": "Learn about NexaCore Innovations, our expert team, mission, and commitment to delivering world-class engineering and technology solutions.",
  "url": "https://www.nexacore-innovations.com/about",
  "mainEntity": generateOrganizationSchema()
});

export const generateServicesSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Engineering & Software Development Services",
  "description": "Comprehensive engineering and technology services including CAD design, software development, AI/ML solutions, and creative services.",
  "provider": {
    "@type": "Organization",
    "name": "NexaCore Innovations"
  },
  "serviceArea": {
    "@type": "Place",
    "name": "Worldwide"
  },
  "hasOfferCatalog": generateOrganizationSchema().hasOfferCatalog
});

export const generatePortfolioSchema = () => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "NexaCore Innovations Portfolio",
  "description": "Portfolio showcasing our engineering projects, software applications, and creative solutions for clients worldwide.",
  "url": "https://www.nexacore-innovations.com/portfolio"
});

export const generateContactPageSchema = () => ({
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact NexaCore Innovations",
  "description": "Get in touch with NexaCore Innovations for your engineering and technology needs. Free consultation available.",
  "url": "https://www.nexacore-innovations.com/contact",
  "mainEntity": {
    "@type": "Organization",
    "name": "NexaCore Innovations",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+233-XXX-XXX-XXX",
      "contactType": "Customer Service",
      "areaServed": "Worldwide"
    }
  }
});

// SEO utility functions
export const updateMetaTags = (seoData: SEOData) => {
  // Update title
  document.title = seoData.title;
  
  // Update or create meta tags
  const updateMetaTag = (name: string, content: string, property = false) => {
    const attribute = property ? 'property' : 'name';
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };
  
  // Basic meta tags
  updateMetaTag('description', seoData.description);
  updateMetaTag('keywords', seoData.keywords.join(', '));
  updateMetaTag('author', seoData.author || 'NexaCore Innovations');
  updateMetaTag('robots', seoData.robots || 'index,follow');
  
  // Open Graph tags
  updateMetaTag('og:title', seoData.title, true);
  updateMetaTag('og:description', seoData.description, true);
  updateMetaTag('og:type', seoData.ogType || 'website', true);
  updateMetaTag('og:image', seoData.ogImage || 'https://www.nexacore-innovations.com/og-image.png', true);
  updateMetaTag('og:url', seoData.canonical || window.location.href, true);
  
  // Twitter Card tags
  updateMetaTag('twitter:card', seoData.twitterCard || 'summary_large_image');
  updateMetaTag('twitter:title', seoData.title);
  updateMetaTag('twitter:description', seoData.description);
  updateMetaTag('twitter:image', seoData.ogImage || 'https://www.nexacore-innovations.com/og-image.png');
  
  // Canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical && seoData.canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  if (canonical && seoData.canonical) {
    canonical.setAttribute('href', seoData.canonical);
  }
  
  // JSON-LD Schema
  if (seoData.schema) {
    let existingScript = document.querySelector('script[data-schema="page"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-schema', 'page');
    script.textContent = JSON.stringify(seoData.schema);
    document.head.appendChild(script);
  }
};

// Generate sitemap data
export const generateSitemapData = () => {
  const baseUrl = 'https://www.nexacore-innovations.com';
  const pages = [
    { url: '', priority: 1.0, changefreq: 'weekly' },
    { url: '/about', priority: 0.8, changefreq: 'monthly' },
    { url: '/services', priority: 0.9, changefreq: 'weekly' },
    { url: '/portfolio', priority: 0.7, changefreq: 'weekly' },
    { url: '/contact', priority: 0.8, changefreq: 'monthly' },
    { url: '/get-started', priority: 0.9, changefreq: 'weekly' },
    { url: '/book-consultation', priority: 0.7, changefreq: 'monthly' },
    { url: '/privacy', priority: 0.3, changefreq: 'yearly' },
    { url: '/terms', priority: 0.3, changefreq: 'yearly' }
  ];
  
  return pages.map(page => ({
    ...page,
    url: `${baseUrl}${page.url}`,
    lastmod: new Date().toISOString().split('T')[0]
  }));
};

// Performance monitoring for SEO
export const trackSEOMetrics = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const metrics = {
          fcp: 0, // First Contentful Paint
          lcp: 0, // Largest Contentful Paint  
          cls: 0, // Cumulative Layout Shift
          fid: 0, // First Input Delay
          ttfb: perfData.responseStart - perfData.requestStart,
          domLoad: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          windowLoad: perfData.loadEventEnd - perfData.loadEventStart
        };
        
        // Track Core Web Vitals
        if ('PerformanceObserver' in window) {
          // Track FCP
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (entry.name === 'first-contentful-paint') {
                metrics.fcp = entry.startTime;
              }
            });
          }).observe({ entryTypes: ['paint'] });
          
          // Track LCP
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            metrics.lcp = lastEntry.startTime;
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Track CLS
          new PerformanceObserver((list) => {
            let clsScore = 0;
            list.getEntries().forEach((entry) => {
              if (!entry.hadRecentInput) {
                clsScore += (entry as any).value;
              }
            });
            metrics.cls = clsScore;
          }).observe({ entryTypes: ['layout-shift'] });
        }
        
        // Log metrics for analysis (in production, send to analytics)
        console.log('SEO Performance Metrics:', metrics);
      }, 1000);
    });
  }
};