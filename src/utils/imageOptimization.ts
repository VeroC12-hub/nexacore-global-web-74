/**
 * Image Optimization Utilities for SEO
 * Optimizes images for search engines and performance
 */

export interface ImageSEOData {
  src: string;
  alt: string;
  title?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  srcSet?: string;
  width?: number;
  height?: number;
}

// SEO-optimized alt text templates
export const ALT_TEXT_TEMPLATES = {
  hero: (company: string, service: string) => 
    `${company} - ${service} hero image showing engineering excellence`,
  team: (company: string, role?: string) => 
    `${company} expert team ${role ? `- ${role}` : ''} delivering professional services`,
  service: (service: string, description: string) => 
    `${service} - ${description} professional service illustration`,
  project: (project: string, category: string) => 
    `${project} - ${category} project showcase by NexaCore Innovations`,
  logo: (company: string) => 
    `${company} official logo and brand identity`,
  icon: (service: string) => 
    `${service} service icon representing professional capabilities`,
  before_after: (project: string, stage: string) => 
    `${project} ${stage} - professional engineering transformation`,
  certification: (cert: string) => 
    `${cert} certification badge showing professional qualification`,
  location: (place: string) => 
    `${place} - NexaCore Innovations service area and location`,
  process: (step: string, service: string) => 
    `${step} in ${service} process - professional methodology illustration`
};

// Generate SEO-optimized image props
export const generateImageSEO = (
  src: string, 
  category: keyof typeof ALT_TEXT_TEMPLATES,
  ...args: string[]
): ImageSEOData => {
  const altTextGenerator = ALT_TEXT_TEMPLATES[category];
  const alt = altTextGenerator(...args);
  
  return {
    src,
    alt,
    title: alt,
    loading: category === 'hero' ? 'eager' : 'lazy',
    fetchPriority: category === 'hero' ? 'high' : 'auto'
  };
};

// Responsive image sizes for different breakpoints
export const RESPONSIVE_SIZES = {
  hero: '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px',
  card: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px',
  thumbnail: '(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 200px',
  icon: '64px',
  logo: '(max-width: 768px) 150px, 200px'
};

// Generate srcSet for responsive images
export const generateSrcSet = (baseSrc: string, sizes: number[]): string => {
  const baseUrl = baseSrc.split('.').slice(0, -1).join('.');
  const extension = baseSrc.split('.').pop();
  
  return sizes
    .map(size => `${baseUrl}-${size}w.${extension} ${size}w`)
    .join(', ');
};

// Image optimization recommendations
export const IMAGE_OPTIMIZATION_GUIDE = {
  formats: {
    primary: 'WebP (modern browsers)',
    fallback: 'JPEG/PNG (legacy support)',
    vector: 'SVG (logos, icons)',
    animated: 'GIF/WebP (animations)'
  },
  sizes: {
    hero: { width: 1920, height: 1080, quality: 85 },
    card: { width: 800, height: 600, quality: 80 },
    thumbnail: { width: 400, height: 300, quality: 75 },
    icon: { width: 64, height: 64, quality: 90 },
    logo: { width: 400, height: 200, quality: 90 }
  },
  seo: {
    fileNaming: 'Use descriptive, keyword-rich filenames',
    altText: 'Describe image content and context',
    title: 'Provide additional context when helpful',
    captions: 'Use figure captions for important images',
    context: 'Place images near relevant text content'
  }
};

// Preload critical images for performance
export const preloadCriticalImages = (images: string[]) => {
  images.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.fetchPriority = 'high';
    document.head.appendChild(link);
  });
};

// Generate structured data for images
export const generateImageSchema = (
  url: string,
  caption: string,
  width?: number,
  height?: number
) => ({
  "@type": "ImageObject",
  "url": url,
  "caption": caption,
  "width": width,
  "height": height,
  "contentUrl": url
});

// Lazy loading observer for SEO-friendly image loading
export const createImageObserver = (callback?: (entry: IntersectionObserverEntry) => void) => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        
        // Load the image
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        
        // Load srcset if available
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
          img.removeAttribute('data-srcset');
        }
        
        // Remove loading placeholder
        img.classList.remove('lazy-loading');
        img.classList.add('lazy-loaded');
        
        // Custom callback
        if (callback) {
          callback(entry);
        }
        
        // Stop observing this image
        imageObserver.unobserve(img);
      }
    });
  }, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  });

  return imageObserver;
};

// Image compression quality recommendations by use case
export const COMPRESSION_QUALITY = {
  hero: 85,      // High quality for main visuals
  product: 80,   // Good quality for product images
  thumbnail: 75, // Optimized for small sizes
  background: 70,// Lower quality for backgrounds
  icon: 90,      // High quality for small graphics
  logo: 95       // Highest quality for brand assets
};

// SEO-friendly image file naming convention
export const generateSEOFileName = (
  description: string,
  category: string,
  company: string = 'nexacore-innovations'
): string => {
  const cleanDescription = description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  return `${company}-${category}-${cleanDescription}`;
};

// Image SEO audit checklist
export const IMAGE_SEO_CHECKLIST = {
  technical: [
    'File size under 500KB for web images',
    'WebP format with JPEG/PNG fallback',
    'Responsive images with srcset',
    'Appropriate compression quality',
    'Progressive JPEG encoding',
    'Proper image dimensions'
  ],
  seo: [
    'Descriptive, keyword-rich file names',
    'Meaningful alt text (not just keywords)',
    'Relevant title attributes',
    'Images placed near related content',
    'Structured data for important images',
    'Image sitemap submission'
  ],
  performance: [
    'Lazy loading for below-fold images',
    'Preloading for critical images',
    'CDN delivery for global reach',
    'Browser caching headers',
    'Image optimization tools',
    'Regular performance audits'
  ]
};

// Generate image sitemap data
export const generateImageSitemapData = () => {
  const images = [
    {
      loc: 'https://www.nexacore-innovations.com/',
      images: [
        {
          url: 'https://www.nexacore-innovations.com/hero-main.jpg',
          caption: 'NexaCore Innovations - Engineering Global Innovation with Excellence',
          title: 'NexaCore Innovations Hero Image'
        },
        {
          url: 'https://www.nexacore-innovations.com/og-image.png',
          caption: 'NexaCore Innovations Official Logo and Branding',
          title: 'NexaCore Innovations Logo'
        }
      ]
    },
    {
      loc: 'https://www.nexacore-innovations.com/about',
      images: [
        {
          url: 'https://www.nexacore-innovations.com/team-collaboration.jpg',
          caption: 'NexaCore Innovations Expert Team Collaboration',
          title: 'Professional Engineering Team'
        }
      ]
    },
    {
      loc: 'https://www.nexacore-innovations.com/services',
      images: [
        {
          url: 'https://www.nexacore-innovations.com/abstract-tech.jpg',
          caption: 'Advanced Technology and Engineering Services',
          title: 'NexaCore Technology Services'
        }
      ]
    }
  ];
  
  return images;
};

// Performance monitoring for images
export const trackImagePerformance = () => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    const imageObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.initiatorType === 'img') {
          console.log(`Image loaded: ${entry.name} in ${entry.duration}ms`);
          
          // Track large images that might hurt performance
          if (entry.transferSize > 500000) { // 500KB
            console.warn(`Large image detected: ${entry.name} (${entry.transferSize} bytes)`);
          }
        }
      });
    });
    
    imageObserver.observe({ entryTypes: ['resource'] });
  }
};