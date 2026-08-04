import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Public Visa Matrix Data
const VISA_MATRIX_DATA = [
  { country: 'UAE', commonVisa: 'Employer-sponsored work visa', requirements: 'Job offer, passport, medical fitness, educational certificates (attested), employment contract', age: '18 - 60 years', minQualification: '10th/12th / Degree', expRequired: '0 - 5+ years', language: 'English / Basic Arabic', processingTime: '7 - 14 Days', avgCost: 'AED 3,000 - 5,000 (Employer paid)', sponsorship: 'Mandatory', documentChecklist: ['Passport copy (6+ months validity)', 'Attested Degree Certificate', 'Passport size photos (white background)', 'Signed Employment Offer Letter', 'Medical Clearance Form'] },
  { country: 'Saudi Arabia', commonVisa: 'Employer-sponsored work visa (Iqama)', requirements: 'Job offer, medical examination, passport, attested educational documents for skilled jobs', age: '21 - 58 years', minQualification: 'Diploma / Degree', expRequired: '2 - 5+ years', language: 'English / Arabic', processingTime: '14 - 21 Days', avgCost: 'SAR 4,000 - 7,000', sponsorship: 'Mandatory', documentChecklist: ['Original Passport', 'Enjaz Visa Slip', 'Medical Report from authorized clinic', 'Degree Attestation by Saudi Culture & Embassy', 'Police Clearance Certificate'] },
  { country: 'Qatar', commonVisa: 'Employer-sponsored work visa', requirements: 'Employment contract, passport, medical test, police clearance (for some positions)', age: '18 - 55 years', minQualification: '10th/12th / Degree', expRequired: '1 - 3+ years', language: 'English', processingTime: '10 - 18 Days', avgCost: 'QAR 2,500 - 4,000', sponsorship: 'Mandatory', documentChecklist: ['Passport Copy', 'Good Conduct Certificate', 'Attested Educational Certificates', 'Signed Contract', 'Blood Test & X-Ray Reports'] },
  { country: 'Singapore', commonVisa: 'Employment Pass / S Pass / Work Permit', requirements: 'Job offer, minimum salary requirements, qualifications, employer application', age: '21 - 50 years', minQualification: 'Diploma / Bachelor Degree', expRequired: '3 - 5+ years', language: 'English (Fluent)', processingTime: '14 - 28 Days', avgCost: 'SGD 600 - 1,200', sponsorship: 'Mandatory', documentChecklist: ['MOM IPA Approval Letter', 'Verification Proof from Qualification Checks', 'Resume & Detailed Work History', 'Passport'] },
  { country: 'Germany', commonVisa: 'EU Blue Card / Skilled Worker Visa', requirements: 'Recognized qualification, employment contract, salary threshold', age: '18 - 55 years', minQualification: 'Recognized Bachelor / Master', expRequired: '2 - 5+ years', language: 'German B1/B2 or English (Tech)', processingTime: '30 - 60 Days', avgCost: 'EUR 75 (Visa Fee)', sponsorship: 'Employer Contract', documentChecklist: ['Anabin University Recognition Proof', 'Signed Employment Contract', 'Health Insurance Proof', 'Motivationsschreiben (Cover letter)'] }
];

const JOBS_DATA = [
  {
    id: 'job-101',
    title: 'Senior Civil Project Manager',
    company: 'Al Habtoor Contracting LLC',
    country: 'UAE',
    location: 'Dubai, Business Bay',
    salary: 'AED 35,000 - 45,000 / month',
    experience: '8 - 12 Years',
    jobType: 'Full-time',
    category: 'Construction',
    description: 'Leading Dubai tier-1 contractor seeking an experienced Civil Project Manager to oversee luxury high-rise residential & commercial developments in Downtown Dubai.',
    skills: ['Project Management', 'FIDIC Contracts', 'Primavera P6', 'Site Leadership', 'Budget Control'],
    qualification: "Bachelor's / Master's Degree in Civil Engineering",
    benefits: ['Tax-free salary', 'Family Visa Sponsorship', 'Private Medical Insurance', 'Annual Flight Tickets', 'Performance Bonus'],
    postedDate: '2 days ago',
    featured: true
  },
  {
    id: 'job-102',
    title: 'Offshore Drilling Engineer',
    company: 'Gulf Petroleum Resources',
    country: 'Saudi Arabia',
    location: 'Dhahran / Offshore',
    salary: 'SAR 38,000 - 52,000 / month',
    experience: '6 - 10 Years',
    jobType: 'Contract',
    category: 'Oil & Gas',
    description: 'Supervise deepwater offshore drilling operations, well construction, and safety protocols in compliance with Aramco standards.',
    skills: ['Drilling Operations', 'Well Control', 'IWCF Certified', 'HSE Management', 'Subsea Engineering'],
    qualification: "B.Sc. Petroleum / Mechanical Engineering",
    benefits: ['Rotational Schedule (28/28)', 'Free Housing & Transportation', 'Full Health Coverage', 'Completion Bonus'],
    postedDate: '1 day ago',
    featured: true
  }
];

// Public Website API Routes
app.get('/api/jobs', (req, res) => {
  res.json({ success: true, count: JOBS_DATA.length, data: JOBS_DATA });
});

app.get('/api/visa/countries-matrix', (req, res) => {
  res.json({ success: true, data: VISA_MATRIX_DATA });
});

app.post('/api/visa/check', (req, res) => {
  const { country, qualification, experience, age } = req.body;
  const target = VISA_MATRIX_DATA.find(c => c.country.toLowerCase() === (country || 'uae').toLowerCase()) || VISA_MATRIX_DATA[0];
  res.json({
    success: true,
    score: 88,
    status: 'Highly Eligible',
    countryData: target,
    reasons: ['Strong educational background', 'Relevant years of work experience'],
    processingTime: target.processingTime,
    estimatedCost: target.avgCost,
    checklist: target.documentChecklist,
    recommendedJobs: JOBS_DATA
  });
});

app.post('/api/verification/verify', (req, res) => {
  res.json({
    success: true,
    caseId: 'SIR-BGV-' + Math.floor(100000 + Math.random() * 900000),
    status: 'In Progress - Document Dispatch',
    estimatedCompletionDays: 3
  });
});

app.post('/api/ai/analyze-resume', (req, res) => {
  res.json({
    success: true,
    atsScore: 92,
    grade: 'A+ (Executive Level)',
    extractedSkills: ['Project Leadership', 'FIDIC Contracts', 'MOHRE Compliance', 'Budget Control'],
    missingKeywords: ['GCC Work Permit Standards', 'ISO 9001:2025 Audit'],
    summary: 'Your CV demonstrates outstanding senior engineering leadership. Adding GCC-specific certification keywords will optimize your headhunter match rate.'
  });
});

app.post('/api/ai/chat', (req, res) => {
  res.json({ success: true, reply: 'Welcome to SIR Recruitment! How can I assist with your executive placement or visa inquiries?' });
});

app.post('/api/payments/checkout', (req, res) => {
  res.json({
    success: true,
    transactionId: 'TXN-STRIPE-' + Date.now(),
    gateway: req.body.gateway || 'stripe',
    serviceName: req.body.serviceName || 'Verification Service',
    amount: req.body.amount || 199,
    currency: 'USD',
    status: 'Completed'
  });
});

// ==========================================
// PRIVATE ENTERPRISE CRM REST API ENDPOINTS
// ==========================================

app.post('/api/crm/auth/login', (req, res) => {
  const { email, password, otp } = req.body;
  if (email && password) {
    return res.json({
      success: true,
      token: 'jwt_sir_crm_enterprise_' + Date.now(),
      refreshToken: 'ref_sir_crm_' + Date.now(),
      user: {
        id: 'usr-901',
        name: 'Tariq Al-Mansoori',
        email: email,
        role: 'Super Admin',
        department: 'Executive Board',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        lastLogin: new Date().toISOString(),
        ipAddress: '194.170.21.90 (Dubai, UAE)'
      }
    });
  }
  res.status(401).json({ success: false, message: 'Invalid CRM Credentials' });
});

app.get('/api/crm/metrics', (req, res) => {
  res.json({
    success: true,
    totalCandidates: 54210,
    activeRecruiters: 38,
    domesticRoles: 1420,
    internationalRoles: 2180,
    clientCompanies: 520,
    openRequirements: 340,
    closedRequirements: 890,
    todayInterviews: 28,
    todayFollowups: 64,
    offersReleased: 45,
    candidatesJoined: 32,
    visaInProgress: 84,
    bgvPending: 19,
    monthlyRevenueUSD: 485000,
    placementConversionRate: '78.4%'
  });
});

app.post('/api/crm/ai/tools', (req, res) => {
  const { action, text, candidateName, targetRole } = req.body;

  if (action === 'parse-resume') {
    return res.json({
      success: true,
      parsedData: {
        name: candidateName || 'Alexander Wright',
        email: 'a.wright@executive-tech.com',
        phone: '+971 50 123 9876',
        nationality: 'United Kingdom',
        skills: ['Primavera P6', 'FIDIC Contracts', 'MOHRE Compliance', 'High-Rise Construction'],
        experienceYears: 12,
        currentEmployer: 'Al Habtoor Contracting',
        expectedSalary: 'AED 42,000/month',
        aiScore: 94,
        summary: 'Top tier British civil project manager with 12 years of proven GCC high-rise building experience.'
      }
    });
  }

  if (action === 'generate-email') {
    return res.json({
      success: true,
      draft: `Dear ${candidateName || 'Candidate'},\n\nWe are pleased to inform you that your profile has been shortlisted for the ${targetRole || 'Executive Position'} with our premier Dubai client.\n\nPlease confirm your availability for an interview scheduled via Microsoft Teams.\n\nBest regards,\nSIR Recruitment Executive Team`
    });
  }

  res.json({ success: true, message: 'AI tool processed successfully' });
});

app.listen(PORT, () => {
  console.log(`SIR Recruitment Full-Stack Server & Private CRM API running on port ${PORT}`);
});
