import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE = 'https://www.nexacore-innovations.com';
// The bare domain redirects to www, so canonical and share links must use www
// Defaults written into index.html for crawlers that do not run JavaScript.
// Helmet adds its own copies, so remove these to leave one of each tag.
const STATIC_TAGS = [
  'meta[name="description"]', 'meta[name="keywords"]', 'meta[name="author"]',
  'meta[property^="og:"]', 'meta[name^="twitter:"]:not([name="twitter:site"])', 'link[rel="canonical"]',
].map(selector => `head > ${selector}:not([data-rh])`).join(', ');

const toSiteUrl = (value: string) => value.replace(/^https?:\/\/(www\.)?nexacore-innovations\.com/, SITE);

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
}

const SEO = ({
  title = 'NexaCore Innovations - Global Technology Solutions & Services',
  description = 'Leading provider of CAD design, software development, AI/ML, blockchain, and digital solutions. We deliver world-class technical, creative, and digital services to clients worldwide.',
  keywords = 'CAD design, software development, web development, mobile apps, AI solutions, machine learning, blockchain, web3, UI/UX design, data analytics, Ghana technology company, engineering services, 3D modeling, project management',
  image = `${SITE}/nexacore-logo.png`,
  url,
  type = 'website',
  author = 'NexaCore Innovations',
  publishedTime,
  modifiedTime,
  noindex = false
}: SEOProps) => {
  const location = useLocation();
  useEffect(() => {
    document.querySelectorAll(STATIC_TAGS).forEach(tag => tag.remove());
  }, []);
  const siteTitle = title.includes('NexaCore') ? title : `${title} | NexaCore Innovations`;
  // Without an explicit url, each page is canonical to itself, never the home page
  const pageUrl = toSiteUrl(url || `${SITE}${location.pathname === '/' ? '' : location.pathname}`);
  const imageUrl = toSiteUrl(image);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* Canonical URL */}
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="NexaCore Innovations" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Article specific (for blog posts) */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {type === 'article' && <meta property="article:author" content={author} />}

      {/* Additional SEO */}
      <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />

      {/* Geo Tags */}
      <meta name="geo.region" content="GH" />
      <meta name="geo.placename" content="Ghana" />

      {/* Business Info */}
      <meta name="rating" content="general" />
      <meta name="revisit-after" content="7 days" />
    </Helmet>
  );
};

export default SEO;
