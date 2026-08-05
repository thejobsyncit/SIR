import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Comprehensive Dataset
const VISA_MATRIX_DATA = [
  { country: 'UAE', commonVisa: 'Employer-sponsored work visa', requirements: 'Job offer, passport, medical fitness, educational certificates (attested), employment contract', age: '18 - 60 years', minQualification: '10th/12th / Degree', expRequired: '0 - 5+ years', language: 'English / Basic Arabic', processingTime: '7 - 14 Days', avgCost: 'AED 3,000 - 5,000 (Employer paid)', sponsorship: 'Mandatory', documentChecklist: ['Passport copy (6+ months validity)', 'Attested Degree Certificate', 'Passport size photos (white background)', 'Signed Employment Offer Letter', 'Medical Clearance Form'] },
  { country: 'Saudi Arabia', commonVisa: 'Employer-sponsored work visa (Iqama)', requirements: 'Job offer, medical examination, passport, attested educational documents for skilled jobs', age: '21 - 58 years', minQualification: 'Diploma / Degree', expRequired: '2 - 5+ years', language: 'English / Arabic', processingTime: '14 - 21 Days', avgCost: 'SAR 4,000 - 7,000', sponsorship: 'Mandatory', documentChecklist: ['Original Passport', 'Enjaz Visa Slip', 'Medical Report from authorized clinic', 'Degree Attestation by Saudi Culture & Embassy', 'Police Clearance Certificate'] },
  { country: 'Qatar', commonVisa: 'Employer-sponsored work visa', requirements: 'Employment contract, passport, medical test, police clearance (for some positions)', age: '18 - 55 years', minQualification: '10th/12th / Degree', expRequired: '1 - 3+ years', language: 'English', processingTime: '10 - 18 Days', avgCost: 'QAR 2,500 - 4,000', sponsorship: 'Mandatory', documentChecklist: ['Passport Copy', 'Good Conduct Certificate', 'Attested Educational Certificates', 'Signed Contract', 'Blood Test & X-Ray Reports'] },
  { country: 'Oman', commonVisa: 'Employer-sponsored work visa', requirements: 'Valid job offer, passport, medical fitness, employer sponsorship', age: '21 - 60 years', minQualification: 'Diploma / Degree', expRequired: '2 - 4+ years', language: 'English', processingTime: '12 - 20 Days', avgCost: 'OMR 300 - 500', sponsorship: 'Mandatory', documentChecklist: ['Passport (12m validity)', 'Gamca Medical Clearance', 'Educational Testimonials', 'Ministry Approval Letter'] },
  { country: 'Kuwait', commonVisa: 'Employer-sponsored work visa (NOC)', requirements: 'Employment contract, medical examination, security clearance, passport', age: '21 - 55 years', minQualification: 'Diploma / Degree', expRequired: '2 - 5+ years', language: 'English / Arabic', processingTime: '20 - 30 Days', avgCost: 'KWD 250 - 450', sponsorship: 'Mandatory', documentChecklist: ['Work Permit (NOC) from Ministry', 'Fingerprint Clearance', 'Attested Certificates', 'Medical Fit Report'] },
  { country: 'Bahrain', commonVisa: 'Employer-sponsored work visa', requirements: 'Employer sponsorship, passport, medical certificate', age: '18 - 60 years', minQualification: '10th/12th / Degree', expRequired: '1 - 3+ years', language: 'English', processingTime: '7 - 14 Days', avgCost: 'BHD 150 - 300', sponsorship: 'Mandatory', documentChecklist: ['Passport Copy', 'LMRA Clearance Letter', 'Medical Examination Result', 'Offer Letter'] },
  { country: 'Singapore', commonVisa: 'Employment Pass / S Pass / Work Permit', requirements: 'Job offer, minimum salary requirements, qualifications, employer application', age: '21 - 50 years', minQualification: 'Diploma / Bachelor Degree', expRequired: '3 - 5+ years', language: 'English (Fluent)', processingTime: '14 - 28 Days', avgCost: 'SGD 600 - 1,200', sponsorship: 'Mandatory', documentChecklist: ['MOM IPA Approval Letter', 'Verification Proof from Qualification Checks', 'Resume & Detailed Work History', 'Passport'] },
  { country: 'Malaysia', commonVisa: 'Employment Pass', requirements: 'Job offer, relevant qualifications, employer sponsorship', age: '27 - 55 years', minQualification: 'Bachelor Degree', expRequired: '3 - 5+ years', language: 'English', processingTime: '21 - 35 Days', avgCost: 'MYR 1,500 - 3,000', sponsorship: 'Mandatory', documentChecklist: ['ESD Approval Letter', 'Degree Certificate Attestation', 'Tax Registration Clearance', 'Passport'] },
  { country: 'Canada', commonVisa: 'Temporary Work Permit / Express Entry Skilled Worker', requirements: 'Job offer (often with LMIA), education, work experience, language requirements', age: '18 - 47 years', minQualification: 'Bachelor / Master Degree', expRequired: '2 - 6+ years', language: 'IELTS General 6.5+ / TEF French', processingTime: '60 - 90 Days', avgCost: 'CAD 155 (Permit) + Biometrics', sponsorship: 'Employer / LMIA or Provincial Nomination', documentChecklist: ['ECA Evaluation Report (WES)', 'IELTS Test Results', 'LMIA Approval Letter', 'Proof of Work Experience', 'Police Certificate & Medical'] },
  { country: 'Australia', commonVisa: 'Skilled Visa / Employer Sponsored Visa (TSS 482 / 186)', requirements: 'Skills assessment, English proficiency, age criteria, work experience, health and character checks', age: 'Under 45 years', minQualification: 'Diploma / Bachelor Degree', expRequired: '2 - 5+ years', language: 'IELTS 6.0+ / PTE 50+', processingTime: '45 - 90 Days', avgCost: 'AUD 1,455 - 3,035', sponsorship: 'Accredited Sponsor / State Nomination', documentChecklist: ['Positive Skills Assessment (VETASSESS/ACS)', 'English Proficiency Score', 'Reference Letters', 'Police Check'] },
  { country: 'New Zealand', commonVisa: 'Accredited Employer Work Visa (AEWV)', requirements: 'Job offer from an accredited employer, qualifications, health and character requirements', age: '18 - 55 years', minQualification: 'Level 7 Bachelor Degree / Diploma', expRequired: '2 - 4+ years', language: 'IELTS 6.5+', processingTime: '30 - 60 Days', avgCost: 'NZD 750 - 1,200', sponsorship: 'Accredited Employer', documentChecklist: ['Job Check Confirmation', 'NZQA Assessment', 'Police Clearance', 'Chest X-ray & Medical Certificate'] },
  { country: 'United Kingdom', commonVisa: 'Skilled Worker Visa', requirements: 'Job offer from a licensed sponsor, English proficiency, salary threshold (COS)', age: '18+ years', minQualification: 'Degree / NVQ Level 3', expRequired: '2 - 4+ years', language: 'IELTS UKVI B1 / B2', processingTime: '15 - 30 Days', avgCost: 'GBP 625 - 1,423 + IHS Surcharge', sponsorship: 'Licensed Sponsor (Certificate of Sponsorship)', documentChecklist: ['CoS Reference Number', 'TB Test Certificate (if required)', 'Proof of Knowledge of English', 'Criminal Record Certificate'] },
  { country: 'Germany', commonVisa: 'EU Blue Card / Skilled Worker Visa', requirements: 'Recognized qualification, employment contract, salary threshold', age: '18 - 55 years', minQualification: 'Recognized Bachelor / Master', expRequired: '2 - 5+ years', language: 'German B1/B2 or English (Tech)', processingTime: '30 - 60 Days', avgCost: 'EUR 75 (Visa Fee)', sponsorship: 'Employer Contract', documentChecklist: ['Anabin University Recognition Proof', 'Signed Employment Contract', 'Health Insurance Proof', 'Motivationsschreiben (Cover letter)'] },
  { country: 'Netherlands', commonVisa: 'Highly Skilled Migrant Visa (Kennismigrant)', requirements: 'Employer sponsorship, minimum salary, recognized employer', age: '18+ years', minQualification: 'Bachelor / Master Degree', expRequired: '3 - 5+ years', language: 'English (Fluent)', processingTime: '14 - 30 Days', avgCost: 'EUR 380', sponsorship: 'IND Recognized Sponsor', documentChecklist: ['IND Sponsorship Approval', 'Diploma Verification', 'Passport Copy', 'Bigger Salary Threshold Contract'] },
  { country: 'Ireland', commonVisa: 'Critical Skills Employment Permit', requirements: 'Job offer in an eligible occupation, salary threshold', age: '18+ years', minQualification: 'Degree', expRequired: '2 - 5+ years', language: 'English', processingTime: '28 - 45 Days', avgCost: 'EUR 1,000', sponsorship: 'Eligible Employer', documentChecklist: ['DETE Employment Permit', 'Degree Certificate', 'Offer Letter with EUR 38k+ Salary', 'Passport'] },
  { country: 'United States', commonVisa: 'H-1B, L-1, O-1 Visa Categories', requirements: 'Employer sponsorship, relevant qualifications, eligibility under specific visa category', age: '21+ years', minQualification: 'Bachelor / Master Degree', expRequired: '3 - 6+ years', language: 'English (Fluent)', processingTime: '60 - 180 Days (or Premium 15 Days)', avgCost: 'USD 460 - 2,500+', sponsorship: 'US Employer Sponsor', documentChecklist: ['Approved Form I-797 (Petition)', 'DS-160 Confirmation Page', 'LCA Approval', 'University Transcripts & Evaluation'] },
  { country: 'Japan', commonVisa: 'Engineer / Specialist in Humanities Work Visa', requirements: 'Job offer, degree or relevant experience, employer sponsorship', age: '20 - 50 years', minQualification: 'Bachelor Degree / 10 yrs Exp', expRequired: '1 - 5+ years', language: 'Japanese JLPT N3/N2 or English (IT)', processingTime: '30 - 60 Days', avgCost: 'JPY 3,000 (CoE Application)', sponsorship: 'Japanese Company Sponsor', documentChecklist: ['Certificate of Eligibility (CoE)', 'University Degree', 'Company Registration Document', 'Passport'] },
  { country: 'South Korea', commonVisa: 'E-7 / E-9 Series Work Visa', requirements: 'Job offer, qualifications, employer sponsorship', age: '18 - 45 years', minQualification: 'Degree / Vocational Certificate', expRequired: '1 - 3+ years', language: 'TOPIK Level 2+ or English', processingTime: '21 - 45 Days', avgCost: 'KRW 60,000 - 100,000', sponsorship: 'Korean Employer Sponsor', documentChecklist: ['Visa Issuance Confirmation Number', 'Degree Attestation', 'Employment Contract', 'Medical Certificate'] }
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
  },
  {
    id: 'job-103',
    title: 'Senior ICU Registered Nurse',
    company: 'King Faisal Specialist Hospital',
    country: 'Saudi Arabia',
    location: 'Riyadh',
    salary: 'SAR 18,000 - 24,000 / month',
    experience: '4 - 7 Years',
    jobType: 'Full-time',
    category: 'Healthcare',
    description: 'JCI-accredited tertiary care hospital hiring ICU nurses for critical care units. Full visa assistance provided by SIR Recruitment.',
    skills: ['Critical Care', 'Ventilator Management', 'BLS / ACLS Certified', 'Patient Assessment'],
    qualification: "B.Sc. Nursing + Active Nursing License (Saudi Prometric preferred)",
    benefits: ['Tax-free package', 'Free Furnished Apartment', '30 Days Annual Leave', 'Flight Allowance'],
    postedDate: '3 days ago',
    featured: true
  },
  {
    id: 'job-104',
    title: 'Executive Chef - Luxury Resort',
    company: 'Atlantis Resorts & Hotels',
    country: 'UAE',
    location: 'Dubai, Palm Jumeirah',
    salary: 'AED 28,000 - 35,000 / month',
    experience: '7 - 10 Years',
    jobType: 'Full-time',
    category: 'Hospitality',
    description: 'Oversee 5-star fine dining culinary operations, menu development, food safety compliance, and team of 40+ international chefs.',
    skills: ['Fine Dining Culinary', 'Menu Engineering', 'HACCP Certification', 'P&L Management'],
    qualification: "Diploma / Degree in Culinary Arts",
    benefits: ['Service Charge Sharing', 'Luxury Accommodation', 'Family Medical Insurance', 'Worldwide Hotel Discounts'],
    postedDate: 'Just now',
    featured: true
  },
  {
    id: 'job-105',
    title: 'Lead Cloud Solutions Architect (AWS / Azure)',
    company: 'TechVision International',
    country: 'Singapore',
    location: 'Marina Bay Financial Centre',
    salary: 'SGD 12,000 - 16,000 / month',
    experience: '8 - 14 Years',
    jobType: 'Full-time',
    category: 'IT & Software',
    description: 'Design enterprise cloud infrastructure and microservices for tier-1 fintech institutions across Southeast Asia.',
    skills: ['AWS Architect Professional', 'Kubernetes', 'Terraform', 'DevOps CI/CD', 'Security Compliance'],
    qualification: "Bachelor / Master in Computer Science or IT",
    benefits: ['Employment Pass Sponsorship', 'Equity Options', 'Flexible Remote Days', 'Comprehensive Health & Dental'],
    postedDate: '4 days ago',
    featured: false
  },
  {
    id: 'job-106',
    title: 'Senior Mechanical Maintenance Engineer',
    company: 'Emirates Global Aluminium',
    country: 'UAE',
    location: 'Abu Dhabi, KIZAD',
    salary: 'AED 22,000 - 28,000 / month',
    experience: '5 - 8 Years',
    jobType: 'Full-time',
    category: 'Engineering',
    description: 'Maintain heavy industrial smelting equipment, turbines, hydraulic systems, and lead predictive maintenance protocols.',
    skills: ['Hydraulics & Pneumatics', 'CMMS SAP', 'Root Cause Analysis', 'Preventive Maintenance'],
    qualification: "B.E. / B.Tech Mechanical Engineering",
    benefits: ['Housing Allowance', 'Schooling Allowance for Children', 'End of Service Gratuity'],
    postedDate: '5 days ago',
    featured: false
  },
  {
    id: 'job-107',
    title: 'Supply Chain & Logistics Director',
    company: 'DP World Global Logistics',
    country: 'Qatar',
    location: 'Doha, Hamad Port',
    salary: 'QAR 40,000 - 55,000 / month',
    experience: '10 - 15 Years',
    jobType: 'Full-time',
    category: 'Logistics',
    description: 'Strategic leadership of port logistics, freight forwarding, warehouse automation, and GCC distribution network.',
    skills: ['Supply Chain Strategy', 'Warehouse Automation', 'Customs Clearance', 'Vendor Management'],
    qualification: "Master in Supply Chain / MBA",
    benefits: ['Executive Bonus', 'Executive Car', 'Family Visa & Private Healthcare', 'Annual Executive Tickets'],
    postedDate: '1 day ago',
    featured: true
  },
  {
    id: 'job-108',
    title: 'Senior Commercial Aircraft Maintenance Technician',
    company: 'Qatar Airways Cargo',
    country: 'Qatar',
    location: 'Doha International Airport',
    salary: 'QAR 20,000 - 26,000 / month',
    experience: '5 - 9 Years',
    jobType: 'Full-time',
    category: 'Aviation',
    description: 'Perform line and base maintenance for Boeing 777 / Airbus A350 aircraft fleet. EASA Part-66 B1/B2 license required.',
    skills: ['EASA Part-66 B1/B2', 'Boeing 777 Type Rating', 'Aviation Safety', 'Avionics'],
    qualification: "Aircraft Maintenance License / Degree",
    benefits: ['Duty Travel Privileges', 'Tax Free Base Salary', 'Furnished Accommodation', 'Concessionary Flight Tickets'],
    postedDate: '3 days ago',
    featured: false
  }
];

// API Routes
app.get('/api/jobs', (req, res) => {
  let filtered = [...JOBS_DATA];
  const { keyword, country, category, experience, jobType } = req.query;

  if (keyword) {
    const k = keyword.toString().toLowerCase();
    filtered = filtered.filter(j => j.title.toLowerCase().includes(k) || j.company.toLowerCase().includes(k) || j.skills.some(s => s.toLowerCase().includes(k)));
  }
  if (country && country !== 'All') {
    filtered = filtered.filter(j => j.country.toLowerCase() === country.toString().toLowerCase());
  }
  if (category && category !== 'All') {
    filtered = filtered.filter(j => j.category.toLowerCase() === category.toString().toLowerCase());
  }
  if (jobType && jobType !== 'All') {
    filtered = filtered.filter(j => j.jobType.toLowerCase() === jobType.toString().toLowerCase());
  }

  res.json({ success: true, count: filtered.length, data: filtered });
});

app.get('/api/jobs/:id', (req, res) => {
  const job = JOBS_DATA.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  res.json({ success: true, data: job });
});

app.post('/api/jobs', (req, res) => {
  const { title, company, country, location, salary, experience, jobType, category, description, vacancies, skills, qualification, benefits } = req.body;

  const newJob = {
    id: req.body.id || `job-${Date.now()}`,
    title: title || 'Untitled Job Position',
    company: company || 'Al Habtoor Contracting LLC',
    country: country || 'UAE',
    location: location || `${country || 'UAE'}, Business District`,
    salary: salary || 'Negotiable',
    experience: experience || '2 - 5 Years',
    jobType: jobType || 'Full-time',
    category: category || 'Construction',
    description: description || 'No description provided.',
    vacancies: vacancies || '1',
    skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : ['Management']),
    qualification: qualification || "Bachelor's Degree",
    benefits: Array.isArray(benefits) ? benefits : (benefits ? benefits.split(',').map(b => b.trim()) : ['Tax-free salary', 'Visa Sponsorship']),
    postedDate: 'Just now',
    featured: true
  };

  JOBS_DATA.unshift(newJob);
  res.json({ success: true, message: 'Job posted successfully', data: newJob });
});

app.delete('/api/jobs/:id', (req, res) => {
  const index = JOBS_DATA.findIndex(j => j.id === req.params.id);
  if (index !== -1) {
    const deleted = JOBS_DATA.splice(index, 1);
    return res.json({ success: true, message: 'Job deleted successfully', data: deleted[0] });
  }
  res.status(404).json({ success: false, message: 'Job not found' });
});

app.get('/api/visa/countries-matrix', (req, res) => {
  res.json({ success: true, data: VISA_MATRIX_DATA });
});

app.post('/api/visa/check', (req, res) => {
  const { country, qualification, experience, age, language } = req.body;
  
  const targetCountryData = VISA_MATRIX_DATA.find(c => c.country.toLowerCase() === (country || 'uae').toLowerCase()) || VISA_MATRIX_DATA[0];

  const target = (country || 'uae').toLowerCase();
  const ageVal = parseInt(age) || 30;
  const expVal = parseInt(experience) || 2;
  const qualStr = (qualification || '').toLowerCase();
  const langStr = (language || '').toLowerCase();

  let baseScore = 20;
  const reasons = [];

  // --- 1. AGE EVALUATION (Country-Specific Cutoffs & Point Grids) ---
  let ageScore = 0;

  if (target === 'australia') {
    if (ageVal < 18) {
      ageScore = 0;
      reasons.push('Below minimum working age (18) for Australia independent visa.');
    } else if (ageVal <= 24) {
      ageScore = 25;
      reasons.push('Age 18-24 grants 25 points on Australia Skilled Points Grid.');
    } else if (ageVal <= 32) {
      ageScore = 30;
      reasons.push('Peak Age Bracket (25-32) grants maximum 30 points for Australia Visa.');
    } else if (ageVal <= 39) {
      ageScore = 25;
      reasons.push('Age 33-39 grants 25 points on Australia Migration Grid.');
    } else if (ageVal <= 44) {
      ageScore = 15;
      reasons.push('Age 40-44 grants 15 points on Australia Skilled Migration.');
    } else {
      ageScore = -25;
      reasons.push('Exceeds Australia Skilled Migration age threshold (Maximum 45 years limit). Employer sponsorship pathway required.');
    }
  } else if (target === 'canada') {
    if (ageVal >= 20 && ageVal <= 29) {
      ageScore = 30;
      reasons.push('Peak age bracket (20-29) yields maximum CRS points for Canada Express Entry.');
    } else if (ageVal >= 30 && ageVal <= 44) {
      const reduction = (ageVal - 29) * 2;
      ageScore = Math.max(5, 30 - reduction);
      reasons.push(`Age ${ageVal} receives reduced CRS age points (-2 pts/yr after 30).`);
    } else {
      ageScore = 0;
      reasons.push('Age 45+ awards 0 points under Canada Express Entry CRS.');
    }
  } else if (target === 'germany' || target === 'united kingdom' || target === 'singapore') {
    if (ageVal >= 21 && ageVal <= 42) {
      ageScore = 25;
      reasons.push('Optimal prime executive working age bracket (21-42).');
    } else if (ageVal <= 50) {
      ageScore = 18;
      reasons.push('Standard eligible age range.');
    } else {
      ageScore = 8;
      reasons.push('Above standard prime age; requires high salary threshold.');
    }
  } else if (['saudi arabia', 'qatar', 'kuwait', 'oman', 'bahrain'].includes(target)) {
    if (ageVal >= 21 && ageVal <= 50) {
      ageScore = 25;
      reasons.push('Optimal demographic for GCC Iqama & Work Permits.');
    } else if (ageVal <= 58) {
      ageScore = 18;
      reasons.push('Eligible for GCC Work Residence Visa (under 58 cutoff).');
    } else {
      ageScore = -10;
      reasons.push('Above standard GCC Iqama issuance age ceiling (58+ requires ministry exemption).');
    }
  } else {
    // UAE & General
    if (ageVal >= 21 && ageVal <= 55) {
      ageScore = 25;
      reasons.push('Meets standard UAE MOHRE work visa age criteria (18-60).');
    } else if (ageVal <= 65) {
      ageScore = 15;
      reasons.push('Senior visa approval required for ages 60-65.');
    } else {
      ageScore = 5;
      reasons.push('Over 65 requires special MOHRE high-tier authorization.');
    }
  }

  // --- 2. QUALIFICATION EVALUATION ---
  let qualScore = 0;
  if (qualStr.includes('master') || qualStr.includes('doctorate')) {
    qualScore = 30;
    reasons.push("Master's / Doctorate degree meets highest tier qualification standards.");
  } else if (qualStr.includes('bachelor')) {
    qualScore = 25;
    reasons.push("Bachelor's Degree recognized for professional & engineering visa streams.");
  } else if (qualStr.includes('diploma')) {
    if (target === 'australia' || target === 'germany') {
      qualScore = 12;
      reasons.push('Diploma qualifies for VETASSESS / technical skilled trades.');
    } else {
      qualScore = 18;
      reasons.push('Technical Diploma qualifies for Skilled Worker Visa.');
    }
  } else {
    if (target === 'australia' || target === 'canada' || target === 'germany' || target === 'singapore') {
      qualScore = 0;
      reasons.push('Secondary education alone does NOT meet points criteria for direct skilled visas in this country.');
    } else {
      qualScore = 12;
      reasons.push('Secondary qualification eligible for general labor, hospitality, & service visas in GCC.');
    }
  }

  // --- 3. WORK EXPERIENCE EVALUATION ---
  let expScore = 0;
  if (expVal >= 10) {
    expScore = 25;
    reasons.push('10+ years executive experience unlocks Golden Visa / Senior Specialist pathways.');
  } else if (expVal >= 5) {
    expScore = 20;
    reasons.push('5+ years experience qualifies for mid-senior supervisory visas.');
  } else if (expVal >= 3) {
    expScore = 14;
    reasons.push('3-5 years experience satisfies standard work permit rules.');
  } else {
    expScore = 8;
    reasons.push('Entry level (0-2 yrs) requires entry job sponsorship.');
  }

  // --- 4. LANGUAGE PROFICIENCY ---
  let langScore = 0;
  if (target === 'germany') {
    if (langStr.includes('german')) {
      langScore = 20;
      reasons.push('German B1/B2 fluency provides major boost for EU Blue Card approval.');
    } else if (langStr.includes('english')) {
      langScore = 12;
      reasons.push('English accepted for International Tech & Corporate roles in Germany.');
    } else {
      langScore = 5;
    }
  } else if (['saudi arabia', 'qatar', 'oman', 'kuwait', 'bahrain', 'uae'].includes(target)) {
    if (langStr.includes('arabic')) {
      langScore = 20;
      reasons.push('Arabic & English bilingual proficiency is highly prioritized in GCC government & corporate sectors.');
    } else {
      langScore = 15;
      reasons.push('English proficiency accepted across all GCC private sector mandates.');
    }
  } else {
    if (langStr.includes('english')) {
      langScore = 20;
      reasons.push('Fluent English satisfies mandatory IELTS / PTE visa requirements.');
    } else {
      langScore = 2;
      reasons.push('English language proficiency is mandatory for work visas in this jurisdiction.');
    }
  }

  let totalScore = baseScore + ageScore + qualScore + expScore + langScore;
  totalScore = Math.max(10, Math.min(100, totalScore));

  let status = 'Eligible';
  if (totalScore >= 85) {
    status = 'Highly Eligible';
  } else if (totalScore >= 70) {
    status = 'Eligible (Standard Pathway)';
  } else if (totalScore >= 50) {
    status = 'Conditional Eligibility (Sponsorship Required)';
  } else {
    status = 'Low Eligibility (Criteria Not Fully Met)';
  }

  const matchingJobs = JOBS_DATA.filter(j => j.country.toLowerCase() === targetCountryData.country.toLowerCase());

  res.json({
    success: true,
    score: totalScore,
    status,
    countryData: targetCountryData,
    reasons,
    processingTime: targetCountryData.processingTime,
    estimatedCost: targetCountryData.avgCost,
    checklist: targetCountryData.documentChecklist,
    recommendedJobs: matchingJobs.length ? matchingJobs : JOBS_DATA.slice(0, 3)
  });
});

app.post('/api/verification/verify', (req, res) => {
  const { candidateName, passportNumber, verificationType } = req.body;
  const caseId = 'SIR-BGV-' + Math.floor(100000 + Math.random() * 900000);
  
  res.json({
    success: true,
    caseId,
    status: 'In Progress - Document Dispatch',
    estimatedCompletionDays: 3,
    candidateName: candidateName || 'Submitted Candidate',
    verificationType: verificationType || 'Comprehensive 6-Point Check',
    steps: [
      { step: 'Identity Check', status: 'Verified', date: 'Today' },
      { step: 'Education Document Verification', status: 'In Progress', date: 'Pending Embassy' },
      { step: 'Employment History Audit', status: 'Pending', date: 'Queued' },
      { step: 'Criminal & Police Clearance', status: 'In Progress', date: 'In Review' },
      { step: 'Address Physical Check', status: 'Queued', date: 'Pending' }
    ]
  });
});

app.post('/api/ai/analyze-resume', (req, res) => {
  const { resumeText } = req.body;
  
  const score = Math.floor(78 + Math.random() * 18);
  const detectedSkills = ['Project Leadership', 'Client Relations', 'Process Optimization', 'Strategic Planning', 'Cross-functional Collaboration', 'Budget Management'];
  const missingKeywords = ['GCC Work Permit Standards', 'ISO Compliance', 'FIDIC Contracts', 'Executive Stakeholder Management'];

  res.json({
    success: true,
    atsScore: score,
    grade: score >= 90 ? 'A+ (Executive Level)' : 'A (Strong Professional)',
    extractedSkills: detectedSkills,
    missingKeywords,
    summary: 'Your CV exhibits strong technical leadership and corporate experience. Adding GCC-specific certification keywords will boost your profile match for Dubai and Saudi Arabia employers by 28%.',
    recommendedJobs: JOBS_DATA.slice(0, 3)
  });
});

app.post('/api/ai/chat', (req, res) => {
  const { message } = req.body;
  const query = (message || '').toLowerCase();

  let reply = "Welcome to SIR Recruitment! I am your AI Career & Visa Assistant. How can I assist you with job applications, GCC work visas, or executive recruitment in Dubai?";

  if (query.includes('visa') || query.includes('work permit')) {
    reply = "In the UAE and Saudi Arabia, work visas are sponsored directly by the hiring employer. Essential requirements include an attested degree certificate, medical fitness clearance, and a valid employment contract. You can test your profile in our interactive Visa Eligibility Checker on this site!";
  } else if (query.includes('job') || query.includes('apply') || query.includes('vacancy')) {
    reply = "We currently have active vacancies across Dubai, Abu Dhabi, Saudi Arabia, Qatar, Singapore, and Europe in Construction, Oil & Gas, Healthcare, Hospitality, IT, and Aviation. Visit our Jobs section to apply directly with your CV!";
  } else if (query.includes('salary') || query.includes('pay')) {
    reply = "Salaries in the UAE and Saudi Arabia are generally 100% tax-free! Packages usually include housing allowance, medical insurance, annual flight tickets, and end-of-service gratuity.";
  } else if (query.includes('verification') || query.includes('background')) {
    reply = "SIR Recruitment provides 6-Point Background Verification including Education Attestation, Employment History Audit, Police Clearance, and Reference Verification. You can initiate a check in our Verification section.";
  }

  res.json({ success: true, reply });
});

app.post('/api/payments/checkout', (req, res) => {
  const { gateway, serviceName, amount, currency } = req.body;
  const transactionId = 'TXN-' + gateway.toUpperCase() + '-' + Date.now();
  
  res.json({
    success: true,
    transactionId,
    gateway,
    serviceName: serviceName || 'VIP Recruitment Package',
    amount: amount || 299,
    currency: currency || 'USD',
    status: 'Completed',
    receiptUrl: '#',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`SIR Recruitment Express API Server running on port ${PORT}`);
});
