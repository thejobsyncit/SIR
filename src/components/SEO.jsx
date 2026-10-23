import React, { useEffect } from 'react';

export const SITE_METADATA = {
  siteName: 'The Revival International',
  legalName: 'The Revival International Consultancy FZ-LLC',
  canonicalDomain: 'https://www.revivalinternational.com',
  defaultTitle: 'The Revival International | Premier International Recruitment, HR Consulting & Academic Advisory Dubai',
  defaultDescription: "The Revival International is Dubai's leading international recruitment agency and academic advisory firm connecting global talent and students with premier institutions across UAE, GCC, Europe, and worldwide.",
  defaultImage: 'https://www.revivalinternational.com/images/hero_dubai.png',
  phone: '+91 9003475405',
  email: 'enquiry@therevivalinternational.com',
  address: {
    street: 'Level 34, Rolex Tower, Financial Center Road, Business Bay',
    city: 'Dubai',
    region: 'Dubai',
    postalCode: '00000',
    country: 'AE'
  },
  geo: {
    latitude: 25.1972,
    longitude: 55.2744
  }
};

/**
 * Enterprise SEO & Head Manager Component for React & Vite SPA
 * Dynamically synchronizes document title, meta descriptions, canonical URLs,
 * Open Graph, Twitter cards, robots directives, and Schema.org JSON-LD structured data.
 */
export const SEO = ({
  title,
  description,
  canonicalPath = '',
  keywords,
  robots = 'index, follow',
  ogType = 'website',
  ogImage,
  structuredData,
  breadcrumbs
}) => {
  useEffect(() => {
    // 1. Title formatting
    const prevTitle = document.title;
    const pageTitle = title 
      ? (title.includes('Revival International') ? title : `${title} | Revival International`)
      : SITE_METADATA.defaultTitle;
    document.title = pageTitle;

    // Helper: set or update meta tag
    const setMetaTag = (attrName, attrVal, content) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
      return element;
    };

    // 2. Meta description
    const metaDescContent = description || SITE_METADATA.defaultDescription;
    setMetaTag('name', 'description', metaDescContent);

    // 3. Meta keywords (if provided)
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }

    // 4. Robots directive (e.g. 'index, follow' vs 'noindex, nofollow')
    setMetaTag('name', 'robots', robots);

    // 5. Canonical URL (Strictly without fragment identifiers per RFC 6596)
    const cleanPath = canonicalPath.replace(/^\/+/, '').replace(/^#+/, '');
    const canonicalHref = cleanPath 
      ? `${SITE_METADATA.canonicalDomain}/${cleanPath}`
      : `${SITE_METADATA.canonicalDomain}/`;

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalHref);

    // 6. Open Graph Tags
    const imageHref = ogImage || SITE_METADATA.defaultImage;
    setMetaTag('property', 'og:site_name', SITE_METADATA.siteName);
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', metaDescContent);
    setMetaTag('property', 'og:url', canonicalHref);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', imageHref);
    setMetaTag('property', 'og:locale', 'en_AE');

    // 7. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', metaDescContent);
    setMetaTag('name', 'twitter:image', imageHref);

    // 8. Schema.org JSON-LD Structured Data
    const schemasToInject = [];

    // Optional BreadcrumbList Schema
    if (breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
      schemasToInject.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs.map((crumb, index) => {
          const crumbPath = (crumb.item || '').replace(/^\/+/, '').replace(/^#+/, '');
          return {
            '@type': 'ListItem',
            'position': index + 1,
            'name': crumb.name,
            'item': crumbPath ? `${SITE_METADATA.canonicalDomain}/${crumbPath}` : `${SITE_METADATA.canonicalDomain}/`
          };
        })
      });
    }

    // Custom Page Structured Data
    if (structuredData) {
      if (Array.isArray(structuredData)) {
        schemasToInject.push(...structuredData);
      } else {
        schemasToInject.push(structuredData);
      }
    }

    let scriptTag = document.getElementById('seo-dynamic-structured-data');
    if (schemasToInject.length > 0) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'seo-dynamic-structured-data';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = schemasToInject.length === 1 
        ? JSON.stringify(schemasToInject[0]) 
        : JSON.stringify({ '@context': 'https://schema.org', '@graph': schemasToInject });
    } else if (scriptTag) {
      scriptTag.remove();
    }

    // Cleanup on unmount or route transition
    return () => {
      document.title = prevTitle;
      const activeScript = document.getElementById('seo-dynamic-structured-data');
      if (activeScript) {
        activeScript.remove();
      }
    };
  }, [title, description, canonicalPath, keywords, robots, ogType, ogImage, structuredData, breadcrumbs]);

  return null;
};

export default SEO;
