/**
 * SEO Enhancements Component
 * Adds comprehensive SEO features to pages
 */

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export interface SEOEnhancementsProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: any;
  breadcrumbs?: Array<{name: string; url: string}>;
}

const SEOEnhancements: React.FC<SEOEnhancementsProps> = ({
  title,
  description,
  keywords = [],
  canonical,
  ogImage = 'https://www.nexacore-innovations.com/og-image.png',
  ogType = 'website',
  jsonLd,
  breadcrumbs = []
}) => {
  
  useEffect(() => {
    // Track page view for analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: title,
        page_location: canonical || window.location.href,
      });
    }
  }, [title, canonical]);

  // Generate breadcrumb JSON-LD
  const breadcrumbSchema = breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  } : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical || window.location.href} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={`${title} - NexaCore Innovations`} />
      <meta property="og:site_name" content="NexaCore Innovations" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical || window.location.href} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      <meta property="twitter:image:alt" content={`${title} - NexaCore Innovations`} />
      <meta property="twitter:site" content="@NexaCoreGlobal" />
      <meta property="twitter:creator" content="@NexaCoreGlobal" />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="NexaCore Innovations" />
      <meta name="publisher" content="NexaCore Innovations" />
      <meta name="copyright" content="NexaCore Innovations" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      
      {/* Geo Meta Tags for Local SEO */}
      <meta name="geo.region" content="GH-AA" />
      <meta name="geo.placename" content="Accra, Ghana" />
      <meta name="geo.position" content="5.6037;-0.1870" />
      <meta name="ICBM" content="5.6037, -0.1870" />
      
      {/* Article Meta Tags (if applicable) */}
      {ogType === 'article' && (
        <>
          <meta property="article:publisher" content="https://www.facebook.com/nexacore-innovations" />
          <meta property="article:author" content="NexaCore Innovations" />
          <meta property="article:published_time" content={new Date().toISOString()} />
          <meta property="article:modified_time" content={new Date().toISOString()} />
          <meta property="article:section" content="Technology" />
          <meta property="article:tag" content="Engineering, Software Development, Technology" />
        </>
      )}
      
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
      
      {/* Breadcrumb JSON-LD */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      
      {/* Preconnect to important domains */}
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch for performance */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      
    </Helmet>
  );
};

export default SEOEnhancements;