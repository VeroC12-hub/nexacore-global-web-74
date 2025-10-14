import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type?: 'organization' | 'service' | 'product' | 'article' | 'breadcrumb';
  data?: any;
}

const StructuredData = ({ type = 'organization', data }: StructuredDataProps) => {
  const getStructuredData = () => {
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "NexaCore Innovations",
          "alternateName": "NexaCore",
          "url": "https://nexacore-innovations.com",
          "logo": "https://nexacore-innovations.com/nexacore-logo.png",
          "description": "Leading provider of CAD design, software development, AI/ML, blockchain, and digital solutions worldwide.",
          "email": "info@nexacore-innovations.com",
          "telephone": "+233-XXX-XXXX",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "GH",
            "addressRegion": "Ghana"
          },
          "sameAs": [
            "https://www.linkedin.com/company/nexacore-innovations",
            "https://github.com/nexacore-innovations",
            "https://nexacoreinn.blogspot.com/"
          ],
          "founder": [
            {
              "@type": "Person",
              "name": "Godwin Ocloo",
              "jobTitle": "Co-Founder & Project Manager",
              "url": "https://www.linkedin.com/in/godwin-ocloo"
            },
            {
              "@type": "Person",
              "name": "Benjamin Agbesi",
              "jobTitle": "Co-Founder & Operations Manager",
              "url": "https://www.linkedin.com/in/benjamin-agbesi"
            },
            {
              "@type": "Person",
              "name": "Manasseh Kabutey",
              "jobTitle": "Lead Software Developer",
              "url": "https://manassehkabutey.vercel.app"
            }
          ],
          "numberOfEmployees": {
            "@type": "QuantitativeValue",
            "value": "3-10"
          },
          "areaServed": {
            "@type": "Place",
            "name": "Worldwide"
          },
          "slogan": "Engineering Global Innovation with Excellence",
          "foundingDate": "2023",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "25",
            "bestRating": "5"
          },
          "offers": {
            "@type": "AggregateOffer",
            "availability": "https://schema.org/InStock",
            "priceCurrency": "USD"
          }
        };

      case 'service':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": data?.serviceType || "Technology Consulting",
          "provider": {
            "@type": "Organization",
            "name": "NexaCore Innovations"
          },
          "areaServed": {
            "@type": "Place",
            "name": "Worldwide"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Technology Services",
            "itemListElement": [
              {
                "@type": "OfferCatalog",
                "name": "Software Development",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Web Development"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Mobile App Development"
                    }
                  }
                ]
              },
              {
                "@type": "OfferCatalog",
                "name": "Engineering Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "CAD Design"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "3D Modeling"
                    }
                  }
                ]
              }
            ]
          }
        };

      case 'breadcrumb':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data || []
        };

      default:
        return null;
    }
  };

  const structuredData = getStructuredData();

  if (!structuredData) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
