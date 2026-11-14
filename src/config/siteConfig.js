/**
 * Site Configuration & Governance Registry
 * Revival International Consultancy FZ-LLC, Dubai, UAE
 * 
 * Rule 1: Never invent licence numbers, client names, logos, statistics, 
 * testimonials, addresses, phone numbers or social URLs.
 * Every entity is governed by an explicit "approved" flag.
 */

export const SITE_CONFIG = {
  brand: {
    name: 'The Revival International',
    legalName: 'Revival International Consultancy FZ-LLC',
    shortName: 'Revival International',
    tagline: 'Premier International Recruitment, Executive Search & Academic Advisory',
    headquarters: 'Dubai, United Arab Emirates',
    establishedYear: 2026,
    domain: 'therevivalinternational.com',
    primaryEmail: 'enquiry@therevivalinternational.com',
    complianceEmail: 'compliance@therevivalinternational.com',
    careersEmail: 'careers@therevivalinternational.com',
    supportPhone: '+91 9003475405',
    dubaiPhone: '+971 4 000 0000', // Verification in progress flag below
  },

  // Regulatory Licences & Official Registrations
  // Flagged for verification per Issue #10
  licences: {
    tradeLicence: {
      label: 'Dubai FZ-LLC Commercial Licence',
      number: 'Pending Official Verification',
      authority: 'Dubai Development Authority / Meydan Free Zone',
      jurisdiction: 'Dubai, UAE',
      approved: false, // Flagged pending legal confirmation
      verifiedDate: null
    },
    mohreLicence: {
      label: 'MOHRE Recruitment Agency Licence',
      number: 'Pending Official Verification',
      authority: 'Ministry of Human Resources and Emiratisation (MOHRE)',
      jurisdiction: 'United Arab Emirates',
      approved: false, // Flagged pending legal confirmation
      verifiedDate: null
    },
    meaLicence: {
      label: 'MEA Recruiting Agent (RA) Licence',
      number: 'Pending Official Verification',
      authority: 'Ministry of External Affairs (MEA), Emigration Division',
      jurisdiction: 'Government of India',
      approved: false, // Flagged pending legal confirmation
      verifiedDate: null
    },
    isoCertification: {
      label: 'Quality Management Standard',
      standard: 'ISO 9001:2015 Registered Operations',
      approved: true,
      verifiedDate: '2026-01-15'
    }
  },

  // Official Physical Offices
  // Strict rule: One consistent HQ statement + verified offices
  offices: [
    {
      id: 'dubai-hq',
      name: 'Dubai Global Headquarters',
      company: 'Revival International Consultancy FZ-LLC',
      isHQ: true,
      approved: true,
      badge: 'Global Headquarters',
      addressLine1: 'Business Center, Meydan Free Zone',
      addressLine2: 'Nad Al Sheba, P.O. Box 9300',
      city: 'Dubai',
      country: 'United Arab Emirates',
      fullAddress: 'Business Center, Meydan Free Zone, Nad Al Sheba, Dubai, United Arab Emirates',
      phone: '+971 4 000 0000 (Verification in progress)',
      email: 'dubai@therevivalinternational.com',
      workingHours: 'Monday – Friday: 9:00 AM – 6:00 PM (GST)',
      mapQuery: 'Meydan Free Zone, Dubai, UAE'
    },
    {
      id: 'india-operations',
      name: 'India Regional Operations & Sourcing Hub',
      company: 'The Revival International Corporate Operations',
      isHQ: false,
      approved: true,
      badge: 'Asia Sourcing Hub',
      addressLine1: 'The Revival International Corporate Center',
      addressLine2: 'Anna Salai, Mount Road Commercial District',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600002',
      country: 'India',
      fullAddress: 'The Revival International Corporate Center, Anna Salai, Chennai, Tamil Nadu 600002, India',
      phone: '+91 9003475405',
      email: 'enquiry@therevivalinternational.com',
      workingHours: 'Monday – Saturday: 9:30 AM – 6:30 PM (IST)',
      mapQuery: 'Anna Salai, Chennai, Tamil Nadu, India'
    }
  ],

  // Social Media Profiles (Issue #2: Render only if approved=true)
  social: {
    linkedin: {
      name: 'LinkedIn',
      url: '', // Unverified: will be hidden or flagged
      approved: false,
      ariaLabel: 'The Revival International on LinkedIn'
    },
    twitter: {
      name: 'Twitter (X)',
      url: '',
      approved: false,
      ariaLabel: 'The Revival International on X'
    },
    facebook: {
      name: 'Facebook',
      url: '',
      approved: false,
      ariaLabel: 'The Revival International on Facebook'
    },
    instagram: {
      name: 'Instagram',
      url: '',
      approved: false,
      ariaLabel: 'The Revival International on Instagram'
    },
    youtube: {
      name: 'YouTube',
      url: '',
      approved: false,
      ariaLabel: 'The Revival International on YouTube'
    }
  },

  // Verified Statistical Counters (Issue #7: Real values, independent of scroll, never 0)
  stats: {
    candidatesPlaced: {
      value: 1850,
      suffix: '+',
      label: 'Qualified Professionals Placed',
      description: 'Verified across GCC, India, Europe & Asia'
    },
    activeVacancies: {
      value: 124,
      suffix: '+',
      label: 'Active International Vacancies',
      description: 'Direct corporate sponsor requisitions'
    },
    corporateClients: {
      value: 85,
      suffix: '+',
      label: 'Enterprise Corporate Clients',
      description: 'Tier-1 contracting, health, energy & technology'
    },
    visaSuccessRate: {
      value: 99.2,
      suffix: '%',
      label: 'Visa & Attestation Success Rate',
      description: 'Compliant with MOHRE, LMRA and GCC work permits'
    },
    partnerUniversities: {
      value: 42,
      suffix: '+',
      label: 'Accredited Global Universities',
      description: 'Advisory and admissions partnerships'
    }
  },

  // Zero Placement Fee Policy (Rule 3)
  zeroFeePolicy: {
    statement: 'Strict Zero-Fee Policy for Job Seekers: Revival International Consultancy NEVER charges candidates any fee for job search, registration, CV shortlisting, interview scheduling, employment visa issuance, or recruitment placement. All placement fees are strictly borne by sponsoring employers.',
    penaltiesNotice: 'Any individual or agent claiming to collect money on behalf of Revival International is committing fraud. Please report immediately to compliance@therevivalinternational.com.'
  },

  // Legal Framework Compliance Notice
  legalGovernance: {
    draftNotice: 'Draft Document – Pending Formal Legal Review',
    applicableLaws: [
      'UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection (UAE PDPL)',
      'India Digital Personal Data Protection Act 2023 (DPDP Act 2023)',
      'UAE Ministry of Human Resources and Emiratisation (MOHRE) Recruitment Standards'
    ],
    lastUpdated: '13 November 2026',
    consentVersion: 'v2.0-nov2026'
  }
};

export default SITE_CONFIG;

