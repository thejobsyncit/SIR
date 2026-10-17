import React from 'react';
import { SEO } from './SEO';

export const EducationSEO = ({ 
  title, 
  description, 
  canonicalPath = 'education', 
  structuredData = null,
  breadcrumbs = null,
  keywords = null,
  robots = 'index, follow'
}) => {
  const fullTitle = title 
    ? (title.includes('Revival International') ? title : `${title} | Revival International Academic Advisory`)
    : 'Academic & Education Advisory | Revival International Dubai';

  return (
    <SEO
      title={fullTitle}
      description={description || 'Comprehensive Academic & Education Advisory services by Revival International Dubai. College admissions, study abroad consulting, and language test preparation.'}
      canonicalPath={canonicalPath}
      structuredData={structuredData}
      breadcrumbs={breadcrumbs}
      keywords={keywords || 'Academic Advisory, Study Abroad, College Admissions, International Consulting, IELTS, OET, DET, Dubai'}
      robots={robots}
    />
  );
};

export default EducationSEO;
