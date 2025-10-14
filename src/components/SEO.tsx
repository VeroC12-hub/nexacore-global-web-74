import { Helmet } from 'react-helmet-async';

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
}

const SEO = ({
  title = 'NexaCore Innovations - Global Technology Solutions & Services',
  description = 'Leading provider of CAD design, software development, AI/ML, blockchain, and digital solutions. We deliver world-class technical, creative, and digital services to clients worldwide.',
  keywords = 'CAD design, software development, web development, mobile apps, AI solutions, machine learning, blockchain, web3, UI/UX design, data analytics, Ghana technology company, engineering services, 3D modeling, project management',
  image = 'https://nexacore-innovations.com/nexacore-logo.png',
  url = 'https://nexacore-innovations.com',
  type = 'website',
  author = 'NexaCore Innovations',
  publishedTime,
  modifiedTime
}: SEOProps) => {
  const siteTitle = title.includes('NexaCore') ? title : `${title} | NexaCore Innovations`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="NexaCore Innovations" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article specific (for blog posts) */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {type === 'article' && <meta property="article:author" content={author} />}

      {/* Additional SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />

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
