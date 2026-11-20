import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search, MapPin, Briefcase, DollarSign, Globe, CheckCircle2,
  Bookmark, ArrowRight, Filter, X, Sparkles, SlidersHorizontal,
  RotateCcw, ChevronLeft, ChevronRight, ChevronDown, BookmarkPlus, Check,
  Building2, Layers, Clock, AlertCircle, Tag,
  Languages, Coins, Calendar, CheckSquare, Square, Plus
} from 'lucide-react';
import { JOBS_LIST } from '../data/mockData';
import ScrollReveal from '../components/ScrollReveal';
import { SEO } from '../components/SEO';
import { QuickApplyModal } from '../components/QuickApplyModal';

// --- FILTER DEFINITIONS & CONSTANTS ---
export const COUNTRIES = [
  'UAE',
  'Qatar',
  'Saudi Arabia',
  'Oman',
  'Kuwait',
  'Bahrain',
  'India',
  'Singapore',
  'United Kingdom',
  'Germany',
  'Canada',
  'Australia'
];

export const COUNTRY_CITY_MAP = {
  'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Al Ain'],
  'Qatar': ['Doha', 'Al Wakrah', 'Lusail', 'Ras Laffan', 'Al Khor'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Dhahran', 'Jubail'],
  'Oman': ['Muscat', 'Salalah', 'Sohar', 'Seeb', 'Nizwa'],
  'Kuwait': ['Kuwait City', 'Hawalli', 'Salmiya', 'Al Ahmadi'],
  'Bahrain': ['Manama', 'Riffa', 'Muharraq', 'Hamad Town'],
  'India': ['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kochi'],
  'Singapore': ['Singapore', 'Jurong', 'Changi', 'Tampines'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Leeds'],
  'Germany': ['Berlin', 'Frankfurt', 'Munich', 'Hamburg', 'Stuttgart', 'Cologne'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide']
};

export const ALL_CITIES = Array.from(new Set(Object.values(COUNTRY_CITY_MAP).flat())).sort();

export const INDUSTRIES = [
  'IT & Software',
  'Healthcare',
  'Engineering',
  'Construction & MEP',
  'Finance & Banking',
  'Education',
  'Hospitality & Tourism',
  'Logistics & Supply Chain',
  'Sales & Marketing',
  'Oil & Gas',
  'Aviation'
];

export const FUNCTIONS = [
  'Software Development',
  'Human Resources',
  'Administration',
  'Customer Support',
  'Healthcare & Nursing',
  'Finance & Accounting',
  'Engineering & Maintenance',
  'Sales & Business Development',
  'Project Management',
  'Quality Assurance'
];

export const EXPERIENCE_LEVELS = [
  'Fresher',
  'Entry Level (0–1 Year)',
  '1–3 Years',
  '3–5 Years',
  '5–10 Years',
  '10+ Years'
];

export const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary',
  'Internship',
  'Remote'
];

export const CURRENCIES = ['All', 'AED', 'SAR', 'QAR', 'OMR', 'KWD', 'BHD', 'USD', 'EUR', 'GBP', 'INR', 'SGD'];

export const COMPANIES = [
  'Emirates Marketing Group',
  'Qatar Airways Cargo',
  'DP World Global Logistics',
  'Burjeel Medical City',
  'King Faisal Specialist Hospital',
  'ALDAR Properties',
  'Al Habtoor Contracting LLC',
  'Barclays International Advisory',
  'Zalando Technology SE',
  'Grab Financial Group',
  'Sun Life Financial Canada',
  'Riyadh Bank Digital Unit',
  'Revival Global Enterprise Solutions',
  'Gulf Petroleum Resources',
  'Atlantis Resorts & Hotels',
  'Al Khaleej Industrial Trading',
  'TechVision International',
  'FinEdge Digital Technologies'
];

export const POSTED_WITHIN_OPTIONS = [
  { id: 'all', label: 'Anytime' },
  { id: 'today', label: 'Today (Past 24 Hours)' },
  { id: '3days', label: 'Last 3 Days' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '14days', label: 'Last 14 Days' },
  { id: '30days', label: 'Last 30 Days' }
];

export const LANGUAGES = [
  'English',
  'Arabic',
  'Hindi',
  'French',
  'German',
  'Tagalog',
  'Urdu'
];

export const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'relevance', label: 'Relevance' },
  { id: 'date', label: 'Date' }
];

export const SALARY_PRESETS = [
  { label: 'Under 5,000', min: '0', max: '5000' },
  { label: '5,000 – 10,000', min: '5000', max: '10000' },
  { label: '10,000 – 20,000', min: '10000', max: '20000' },
  { label: '20,000 – 35,000', min: '20000', max: '35000' },
  { label: '35,000+', min: '35000', max: '' }
];

export const SALARY_OPTIONS = [
  'Under 10,000',
  '10,000 – 20,000',
  '20,000 – 35,000',
  '35,000 – 50,000',
  '50,000+',
  '0–3 Lakhs',
  '3–6 Lakhs',
  '6–10 Lakhs',
  '10–15 Lakhs',
  '15–25 Lakhs',
  '25–50 Lakhs',
  '50–75 Lakhs',
  '75–100 Lakhs',
  '1–5 Crore',
  '5+ Crore'
];

export const SALARY_RANGES_MAP = {
  'Under 10,000': { min: 0, max: 10000 },
  '10,000 – 20,000': { min: 10000, max: 20000 },
  '20,000 – 35,000': { min: 20000, max: 35000 },
  '35,000 – 50,000': { min: 35000, max: 50000 },
  '50,000+': { min: 50000, max: null },
  '0–3 Lakhs': { min: 0, max: 300000, annualInr: true },
  '3–6 Lakhs': { min: 300000, max: 600000, annualInr: true },
  '6–10 Lakhs': { min: 600000, max: 1000000, annualInr: true },
  '10–15 Lakhs': { min: 1000000, max: 1500000, annualInr: true },
  '15–25 Lakhs': { min: 1500000, max: 2500000, annualInr: true },
  '25–50 Lakhs': { min: 2500000, max: 5000000, annualInr: true },
  '50–75 Lakhs': { min: 5000000, max: 7500000, annualInr: true },
  '75–100 Lakhs': { min: 7500000, max: 10000000, annualInr: true },
  '1–5 Crore': { min: 10000000, max: 50000000, annualInr: true },
  '5+ Crore': { min: 50000000, max: null, annualInr: true }
};

export const matchesSalaryRange = (job, rangeLabel) => {
  const range = SALARY_RANGES_MAP[rangeLabel];
  if (!range) return true;

  let jMin = job.minSalary !== undefined && job.minSalary !== null ? Number(job.minSalary) : null;
  let jMax = job.maxSalary !== undefined && job.maxSalary !== null ? Number(job.maxSalary) : null;

  if (jMin === null || isNaN(jMin) || jMax === null || isNaN(jMax)) {
    const nums = (job.salary || '').replace(/,/g, '').match(/\d+/g)?.map(Number) || [];
    if (nums.length >= 2) {
      jMin = nums[0];
      jMax = nums[1];
    } else if (nums.length === 1) {
      jMin = nums[0];
      jMax = nums[0];
    } else {
      return false;
    }
  }

  if (range.annualInr) {
    const inrMin = jMin * 12 * 23;
    const inrMax = jMax * 12 * 23;
    if (range.max === null || range.max === undefined) {
      return inrMax >= range.min;
    }
    return inrMax >= range.min && inrMin <= range.max;
  } else {
    if (range.max === null || range.max === undefined) {
      return jMax >= range.min;
    }
    return jMax >= range.min && jMin <= range.max;
  }
};

export const parseJobExperienceRange = (expStr) => {
  if (!expStr) return { min: 0, max: 30 };
  const s = String(expStr).toLowerCase();
  if (s.includes('fresher') || s.includes('entry') || s.includes('trainee')) {
    return { min: 0, max: 1 };
  }
  const nums = s.replace(/–/g, '-').match(/\d+/g)?.map(Number) || [];
  if (nums.length >= 2) {
    return { min: nums[0], max: nums[1] };
  } else if (nums.length === 1) {
    return { min: nums[0], max: s.includes('+') ? 30 : nums[0] };
  }
  return { min: 0, max: 30 };
};

export const matchesExperienceYears = (job, years) => {
  if (years === null || years === undefined) return true;
  const y = Number(years);
  if (isNaN(y)) return true;
  const { min, max } = parseJobExperienceRange(job.experience);
  return min <= y && max >= y;
};

// Helper to match experience flexibly
const matchExperienceOption = (jobExp, filterExp) => {
  if (!filterExp) return true;
  if (!jobExp) return false;
  const je = jobExp.toLowerCase();
  const fe = filterExp.toLowerCase();

  if (fe.includes('fresher') && (je.includes('fresher') || je.includes('trainee') || je.includes('0–1') || je.includes('0 - 1') || je.includes('0 years'))) return true;
  if (fe.includes('entry') && (je.includes('entry') || je.includes('0–1') || je.includes('0 - 1') || je.includes('fresher'))) return true;
  if (fe.includes('1–3') || fe.includes('1-3')) {
    if (je.includes('1–3') || je.includes('1 - 3') || je.includes('2 years') || je.includes('2 - 4') || je.includes('1 - 3+')) return true;
  }
  if (fe.includes('3–5') || fe.includes('3-5')) {
    if (je.includes('3–5') || je.includes('3 - 5') || je.includes('4 - 7') || je.includes('3 - 6') || je.includes('3 - 5+')) return true;
  }
  if (fe.includes('5–10') || fe.includes('5-10') || fe.includes('5+')) {
    if (je.includes('5+') || je.includes('5 - 8') || je.includes('5 - 9') || je.includes('6 - 10') || je.includes('7 - 10') || je.includes('8 - 12') || je.includes('8 - 14') || je.includes('10 - 15')) return true;
  }
  if (fe.includes('10+') || fe.includes('10+ years')) {
    if (je.includes('10+') || je.includes('10 - 15') || je.includes('8 - 14') || je.includes('8 - 12')) return true;
  }
  return je.includes(fe);
};

// --- DYNAMIC FILTER COUNT CALCULATION HELPER ---
// Calculates active filter count dynamically:
// - Country, City, Industry, Function, Job Type, Company, Language: array lengths
// - Experience: 1 when value differs from default (non-null), or length of options
// - Salary: count of selected ranges, plus 1 if custom min/max/currency used
// - Posted Within: 1 if active ('all' is default)
export const calculateFilterCount = (filters = {}) => {
  let count = 0;
  count += (filters.countries || []).length;
  count += (filters.cities || []).length;
  count += (filters.industries || []).length;
  count += (filters.functions || []).length;
  if (filters.experienceYears !== null && filters.experienceYears !== undefined) {
    count += 1;
  } else {
    count += (filters.experiences || []).length;
  }
  count += (filters.jobTypes || []).length;
  count += (filters.salaryRanges || []).length;
  count += (filters.companies || []).length;
  count += (filters.languages || []).length;
  if (filters.postedWithin && filters.postedWithin !== 'all') {
    count += 1;
  }
  if (filters.salaryMin || filters.salaryMax || (filters.salaryCurrency && filters.salaryCurrency !== 'All')) {
    count += 1;
  }
  return count;
};

// --- CLIENT-SIDE JOB FILTERING ENGINE ---
export const filterJobList = (jobs, filters = {}) => {
  if (!Array.isArray(jobs)) return [];
  const {
    keyword = '',
    countries = [],
    cities = [],
    industries = [],
    functions = [],
    experienceYears = null,
    experiences = [],
    jobTypes = [],
    salaryRanges = [],
    companies = [],
    postedWithin = 'all',
    languages = [],
    salaryCurrency = 'All',
    salaryMin = '',
    salaryMax = ''
  } = filters;

  return jobs.filter(job => {
    // 1. Keyword search (matches title, company, description, location, skills, qualifications, degree, licences, visa)
    if (keyword && keyword.trim()) {
      const q = keyword.toLowerCase().trim();
      const titleMatch = (job.title || '').toLowerCase().includes(q);
      const compMatch = (job.company || '').toLowerCase().includes(q);
      const descMatch = (job.description || '').toLowerCase().includes(q);
      const locMatch = (job.location || '').toLowerCase().includes(q);
      const skillsMatch = (job.skills || []).some(s => String(s).toLowerCase().includes(q));
      const qualMatch = `${job.qualification || ''} ${job.educationLevel || ''} ${job.requiredDegree || ''} ${job.academicQualifications || ''} ${job.mandatoryLicences || ''}`.toLowerCase().includes(q);
      const visaMatch = (job.visaSponsorship || '').toLowerCase().includes(q);
      const contractMatch = `${job.contractType || ''} ${job.contractDuration || ''}`.toLowerCase().includes(q);
      if (!titleMatch && !compMatch && !descMatch && !locMatch && !skillsMatch && !qualMatch && !visaMatch && !contractMatch) return false;
    }

    // 2. Country (multi-select)
    if (countries.length > 0 && !countries.includes(job.country)) {
      return false;
    }

    // 3. City (multi-select)
    if (cities.length > 0) {
      const jobCity = job.city || '';
      const jobLoc = job.location || '';
      const matchCity = cities.some(c =>
        jobCity.toLowerCase().includes(c.toLowerCase()) || jobLoc.toLowerCase().includes(c.toLowerCase())
      );
      if (!matchCity) return false;
    }

    // 4. Industry (multi-select)
    if (industries.length > 0) {
      const jobInd = (job.industry || job.category || '').toLowerCase();
      const matchInd = industries.some(ind => jobInd.includes(ind.toLowerCase()));
      if (!matchInd) return false;
    }

    // 5. Function (multi-select)
    if (functions.length > 0) {
      const jobFn = (job.function || job.department || job.title || '').toLowerCase();
      const matchFn = functions.some(fn => jobFn.includes(fn.toLowerCase()));
      if (!matchFn) return false;
    }

    // 6. Experience (Range Slider & options)
    if (experienceYears !== null && experienceYears !== undefined) {
      if (!matchesExperienceYears(job, experienceYears)) return false;
    } else if (experiences.length > 0) {
      const matchExp = experiences.some(filterExp => matchExperienceOption(job.experience, filterExp));
      if (!matchExp) return false;
    }

    // 7. Job Type & Contract Type (multi-select)
    if (jobTypes.length > 0) {
      const jType = (job.jobType || '').toLowerCase();
      const cType = (job.contractType || '').toLowerCase();
      const matchType = jobTypes.some(jt => {
        const jtLower = jt.toLowerCase();
        return jType.includes(jtLower) || cType.includes(jtLower) || (jtLower.includes('full-time') && cType.includes('permanent'));
      });
      if (!matchType) return false;
    }

    // 8. Company (multi-select)
    if (companies.length > 0) {
      const jComp = (job.company || '').toLowerCase();
      const matchComp = companies.some(c => jComp.includes(c.toLowerCase()));
      if (!matchComp) return false;
    }

    // 9. Freshness / Posted Within
    if (postedWithin && postedWithin !== 'all') {
      const maxAgeMs = {
        'today': 24 * 60 * 60 * 1000,
        '3days': 3 * 24 * 60 * 60 * 1000,
        '7days': 7 * 24 * 60 * 60 * 1000,
        '14days': 14 * 24 * 60 * 60 * 1000,
        '30days': 30 * 24 * 60 * 60 * 1000
      }[postedWithin];

      if (maxAgeMs && job.postedDate) {
        const parsed = Date.parse(job.postedDate);
        if (!isNaN(parsed) && (Date.now() - parsed) > maxAgeMs) {
          return false;
        }
      }
    }

    // 10. Language
    if (languages.length > 0) {
      const fullJobText = `${job.title || ''} ${job.description || ''} ${(job.skills || []).join(' ')} ${job.qualification || ''}`.toLowerCase();
      const matchLang = languages.some(l => {
        const lLower = l.toLowerCase();
        if (lLower === 'english') return true;
        return fullJobText.includes(lLower);
      });
      if (!matchLang) return false;
    }

    // 11. Salary Currency
    if (salaryCurrency !== 'All') {
      const jobCurr = job.currency || (job.salary ? job.salary.split(' ')[0] : '');
      if (jobCurr && !jobCurr.toLowerCase().includes(salaryCurrency.toLowerCase())) {
        return false;
      }
    }

    // 12. Salary Range
    if (salaryRanges.length > 0) {
      const matchSal = salaryRanges.some(sal => matchesSalaryRange(job, sal));
      if (!matchSal) return false;
    }
    if (salaryMin !== '' || salaryMax !== '') {
      const minVal = salaryMin !== '' ? Number(salaryMin) : null;
      const maxVal = salaryMax !== '' ? Number(salaryMax) : null;
      const jMin = job.minSalary !== undefined ? Number(job.minSalary) : null;
      const jMax = job.maxSalary !== undefined ? Number(job.maxSalary) : null;

      if (minVal !== null && jMax !== null && jMax < minVal) return false;
      if (maxVal !== null && jMin !== null && jMin > maxVal) return false;
    }

    return true;
  });
};

// --- JOB DATE PARSING HELPER ---
export const parseJobTime = (job) => {
  if (!job) return 0;
  if (job.createdAt) {
    const t = Date.parse(job.createdAt);
    if (!isNaN(t)) return t;
  }
  if (job.postedDate) {
    const pd = String(job.postedDate).trim().toLowerCase();
    if (pd === 'just now') return Date.now();
    if (pd.includes('hour') || pd.includes('min') || pd.includes('second')) {
      const num = parseInt(pd, 10) || 1;
      return Date.now() - (num * 3600 * 1000);
    }
    if (pd.includes('day') && pd.includes('ago')) {
      const num = parseInt(pd, 10) || 1;
      return Date.now() - (num * 24 * 3600 * 1000);
    }
    const t = Date.parse(job.postedDate);
    if (!isNaN(t)) return t;
  }
  return 0;
};

// --- JOB RECOMMENDATION SCORING ENGINE ---
// Matches authenticated candidate profile criteria (role, skills, country) or falls back to featured tier-1 GCC jobs
export const getRecommendationScore = (job, user, keyword) => {
  let score = 0;
  if (!job) return 0;

  // 1. Personalized Candidate Profile Match
  if (user) {
    const userRole = (user.currentRole || user.title || '').toLowerCase().trim();
    const userLocation = (user.preferredCountry || user.location || '').toLowerCase().trim();
    const userSkills = Array.isArray(user.skills)
      ? user.skills.map(s => String(s).toLowerCase().trim())
      : (typeof user.skills === 'string' ? user.skills.toLowerCase().split(',').map(s => s.trim()) : []);

    const jobTitle = (job.title || '').toLowerCase();
    const jobCat = (job.category || job.industry || '').toLowerCase();
    const jobCountry = (job.country || job.location || '').toLowerCase();
    const jobSkills = (job.skills || []).map(s => String(s).toLowerCase());

    // Role / Title match (+25)
    if (userRole && (jobTitle.includes(userRole) || userRole.includes(jobTitle) || jobCat.includes(userRole))) {
      score += 25;
    }

    // Preferred Country / Location match (+15)
    if (userLocation && (jobCountry.includes(userLocation) || userLocation.includes(jobCountry))) {
      score += 15;
    }

    // Skills overlap (+6 per matching skill)
    if (userSkills.length > 0 && jobSkills.length > 0) {
      userSkills.forEach(us => {
        if (us && jobSkills.some(js => js.includes(us) || us.includes(js))) {
          score += 6;
        }
      });
    }
  }

  // 2. High-priority GCC Employer Openings
  if (job.featured) score += 10;
  if (job.urgent) score += 5;
  if (job.verified) score += 5;

  // 3. Search query relevance boost if a search query is active
  if (keyword && keyword.trim()) {
    const kw = keyword.toLowerCase().trim();
    if ((job.title || '').toLowerCase().includes(kw)) score += 20;
    if ((job.skills || []).some(s => String(s).toLowerCase().includes(kw))) score += 10;
    if ((job.company || '').toLowerCase().includes(kw)) score += 6;
  }

  return score;
};

// --- JOB RELEVANCE SCORING ENGINE ---
// Prioritizes exact and keyword matches in title, skills, company, category, and description
export const getRelevanceScore = (job, keyword) => {
  let score = 0;
  if (!job) return 0;

  if (keyword && keyword.trim()) {
    const kw = keyword.toLowerCase().trim();
    const title = (job.title || '').toLowerCase();
    const company = (job.company || '').toLowerCase();
    const desc = (job.description || '').toLowerCase();
    const skills = (job.skills || []).map(s => String(s).toLowerCase());
    const ind = (job.category || job.industry || '').toLowerCase();
    const country = (job.country || job.location || '').toLowerCase();

    // Exact Title match (+60) / Partial Title match (+30)
    if (title === kw) score += 60;
    else if (title.startsWith(kw) || title.includes(kw)) score += 30;

    // Skills match (+25 / +12)
    if (skills.some(s => s === kw)) score += 25;
    else if (skills.some(s => s.includes(kw))) score += 12;

    // Company match (+15)
    if (company.includes(kw)) score += 15;

    // Category / Industry match (+10)
    if (ind.includes(kw)) score += 10;

    // Country match (+8)
    if (country.includes(kw)) score += 8;

    // Description match (+4)
    if (desc.includes(kw)) score += 4;
  } else {
    // Fallback when no search query: featured and urgent verified tier-1 jobs
    if (job.featured) score += 15;
    if (job.urgent) score += 8;
  }

  return score;
};

export const JobsPage = () => {
  const {
    user,
    openAuthModal,
    pendingJobToApply,
    setPendingJobToApply,
    setSelectedJob,
    applyForJob,
    applications,
    toggleSaveJob,
    savedJobs,
    setActiveModal,
    postedJobs,
    t,
    selectedJobCategory: selectedCategory,
    setSelectedJobCategory: setSelectedCategory,
    savedSearches,
    saveSearch,
    activeSearchCriteria,
    setActiveSearchCriteria
  } = useApp();

  const [rawJobs, setRawJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- APPLIED FILTER STATES (Committed filters controlling active job results & applied chips) ---
  const [appliedCountries, setAppliedCountries] = useState([]);
  const [appliedCities, setAppliedCities] = useState([]);
  const [appliedIndustries, setAppliedIndustries] = useState(selectedCategory && selectedCategory !== 'All' ? [selectedCategory] : []);
  const [appliedFunctions, setAppliedFunctions] = useState([]);
  const [appliedExperiences, setAppliedExperiences] = useState([]);
  const [appliedExperienceYears, setAppliedExperienceYears] = useState(null);
  const [appliedJobTypes, setAppliedJobTypes] = useState([]);
  const [appliedSalaryRanges, setAppliedSalaryRanges] = useState([]);
  const [appliedCompanies, setAppliedCompanies] = useState([]);
  const [appliedLanguages, setAppliedLanguages] = useState([]);
  const [appliedPostedWithin, setAppliedPostedWithin] = useState('all');
  const [appliedSalaryMin, setAppliedSalaryMin] = useState('');
  const [appliedSalaryMax, setAppliedSalaryMax] = useState('');
  const [appliedSalaryCurrency, setAppliedSalaryCurrency] = useState('All');

  // --- PENDING FILTER STATES (Working selections in sidebar checkboxes & slider preview) ---
  const [pendingCountries, setPendingCountries] = useState([]);
  const [pendingCities, setPendingCities] = useState([]);
  const [pendingIndustries, setPendingIndustries] = useState(selectedCategory && selectedCategory !== 'All' ? [selectedCategory] : []);
  const [pendingFunctions, setPendingFunctions] = useState([]);
  const [pendingExperiences, setPendingExperiences] = useState([]);
  const [pendingExperienceYears, setPendingExperienceYears] = useState(null);
  const [sliderExperienceYears, setSliderExperienceYears] = useState(0);
  const [pendingJobTypes, setPendingJobTypes] = useState([]);
  const [pendingSalaryRanges, setPendingSalaryRanges] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [pendingLanguages, setPendingLanguages] = useState([]);
  const [pendingPostedWithin, setPendingPostedWithin] = useState('all');
  const [pendingSalaryMin, setPendingSalaryMin] = useState('');
  const [pendingSalaryMax, setPendingSalaryMax] = useState('');
  const [pendingSalaryCurrency, setPendingSalaryCurrency] = useState('All');

  // Search keyword & sorting
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  // Close Sort Dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setSortDropdownOpen(false);
      }
    };
    if (sortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [sortDropdownOpen]);

  // Slider change handler
  const handleSliderChange = (val) => {
    setSliderExperienceYears(val);
    setPendingExperienceYears(val);
  };

  useEffect(() => {
    if (pendingExperienceYears !== null) {
      setSliderExperienceYears(pendingExperienceYears);
    } else {
      setSliderExperienceYears(0);
    }
  }, [pendingExperienceYears]);

  // Search input queries for categories with many options
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [industrySearchQuery, setIndustrySearchQuery] = useState('');
  const [functionSearchQuery, setFunctionSearchQuery] = useState('');
  const [companySearchQuery, setCompanySearchQuery] = useState('');


  // --- NAUKRI-STYLE FILTER POPUP STATE & HANDLERS ---
  const [popupCategory, setPopupCategory] = useState(null);
  const [tempSelected, setTempSelected] = useState([]);
  const [popupSearchQuery, setPopupSearchQuery] = useState('');

  const openFilterPopup = (categoryKey) => {
    let initialSelected = [];
    if (categoryKey === 'country') initialSelected = [...pendingCountries];
    else if (categoryKey === 'city') initialSelected = [...pendingCities];
    else if (categoryKey === 'industry') initialSelected = [...pendingIndustries];
    else if (categoryKey === 'function') initialSelected = [...pendingFunctions];
    else if (categoryKey === 'experience') initialSelected = [...pendingExperiences];
    else if (categoryKey === 'jobType') initialSelected = [...pendingJobTypes];
    else if (categoryKey === 'salary') initialSelected = [...pendingSalaryRanges];

    setTempSelected(initialSelected);
    setPopupSearchQuery('');
    setPopupCategory(categoryKey);
  };

  const closeFilterPopup = () => {
    setPopupCategory(null);
    setTempSelected([]);
    setPopupSearchQuery('');
  };

  const toggleTempItem = (item) => {
    setTempSelected(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleSalaryRange = (rangeLabel) => {
    setPendingSalaryRanges(prev =>
      prev.includes(rangeLabel) ? prev.filter(r => r !== rangeLabel) : [...prev, rangeLabel]
    );
  };

  const applyFilterPopup = () => {
    let updatedPendingCountries = pendingCountries;
    let updatedPendingCities = pendingCities;
    let updatedPendingIndustries = pendingIndustries;
    let updatedPendingFunctions = pendingFunctions;
    let updatedPendingExperiences = pendingExperiences;
    let updatedPendingJobTypes = pendingJobTypes;
    let updatedPendingSalaryRanges = pendingSalaryRanges;

    if (popupCategory === 'country') {
      updatedPendingCountries = tempSelected;
      setPendingCountries(tempSelected);
      if (tempSelected.length > 0) {
        const allowedCities = new Set();
        tempSelected.forEach(cntry => {
          (COUNTRY_CITY_MAP[cntry] || []).forEach(ci => allowedCities.add(ci));
        });
        updatedPendingCities = pendingCities.filter(ci => allowedCities.has(ci));
        setPendingCities(updatedPendingCities);
      }
    } else if (popupCategory === 'city') {
      updatedPendingCities = tempSelected;
      setPendingCities(tempSelected);
    } else if (popupCategory === 'industry') {
      updatedPendingIndustries = tempSelected;
      setPendingIndustries(tempSelected);
    } else if (popupCategory === 'function') {
      updatedPendingFunctions = tempSelected;
      setPendingFunctions(tempSelected);
    } else if (popupCategory === 'experience') {
      updatedPendingExperiences = tempSelected;
      setPendingExperiences(tempSelected);
    } else if (popupCategory === 'jobType') {
      updatedPendingJobTypes = tempSelected;
      setPendingJobTypes(tempSelected);
    } else if (popupCategory === 'salary') {
      updatedPendingSalaryRanges = tempSelected;
      setPendingSalaryRanges(tempSelected);
    }

    // Apply popup changes immediately to committed applied state as well
    setAppliedCountries([...updatedPendingCountries]);
    setAppliedCities([...updatedPendingCities]);
    setAppliedIndustries([...updatedPendingIndustries]);
    setAppliedFunctions([...updatedPendingFunctions]);
    setAppliedExperiences([...updatedPendingExperiences]);
    setAppliedJobTypes([...updatedPendingJobTypes]);
    setAppliedSalaryRanges([...updatedPendingSalaryRanges]);

    setCurrentPage(1);
    closeFilterPopup();

    fetchJobs({
      countries: updatedPendingCountries,
      cities: updatedPendingCities,
      industries: updatedPendingIndustries,
      functions: updatedPendingFunctions,
      experienceYears: pendingExperienceYears,
      experiences: updatedPendingExperiences,
      jobTypes: updatedPendingJobTypes,
      salaryRanges: updatedPendingSalaryRanges,
      companies: pendingCompanies,
      languages: pendingLanguages,
      postedWithin: pendingPostedWithin,
      salaryMin: pendingSalaryMin,
      salaryMax: pendingSalaryMax,
      salaryCurrency: pendingSalaryCurrency
    });
  };

  // Lock document scroll and listen for Escape key when popup is open
  useEffect(() => {
    if (popupCategory) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') closeFilterPopup();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [popupCategory]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Mobile drawer filter toggle
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Restored Saved Search Toast
  const [loadedSavedSearchName, setLoadedSavedSearchName] = useState('');

  // Save Search Modal state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [savingSearch, setSavingSearch] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccessToast, setSaveSuccessToast] = useState('');

  // Job Detail & Apply Modal
  const [viewJob, setViewJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [dbAppliedJobIds, setDbAppliedJobIds] = useState(new Set());

  // Keep applied job status in sync with database for candidate
  const syncAppliedJobsFromDb = useCallback(() => {
    if (user?.email || user?.candidateId) {
      const emailParam = user?.email ? encodeURIComponent(user.email.toLowerCase().trim()) : '';
      const cidParam = user?.candidateId ? encodeURIComponent(user.candidateId) : '';
      fetch(`/api/jobs/apply-email/history?email=${emailParam}&candidateId=${cidParam}`)
        .then(r => r.json())
        .then(d => {
          if (d?.data && Array.isArray(d.data)) {
            const ids = new Set(d.data.map(app => String(app.jobId)));
            setDbAppliedJobIds(ids);
          } else {
            setDbAppliedJobIds(new Set());
          }
        })
        .catch(() => {
          setDbAppliedJobIds(new Set());
        });
    } else {
      setDbAppliedJobIds(new Set());
    }
  }, [user]);

  useEffect(() => {
    syncAppliedJobsFromDb();
  }, [syncAppliedJobsFromDb, applications]);

  const isApplied = (jobId) => {
    if (!jobId) return false;
    const strId = String(jobId);
    return dbAppliedJobIds.has(strId) || (Array.isArray(applications) && applications.some(a => String(a.jobId) === strId));
  };
  const isSaved = (jobId) => Boolean(savedJobs && savedJobs.includes(jobId));

  // Available Cities based on pending countries
  const availableCities = useMemo(() => {
    if (pendingCountries.length === 0) {
      return ALL_CITIES;
    }
    const citiesSet = new Set();
    pendingCountries.forEach(country => {
      const cities = COUNTRY_CITY_MAP[country] || [];
      cities.forEach(c => citiesSet.add(c));
    });
    return Array.from(citiesSet).sort();
  }, [pendingCountries]);

  // Clean invalid cities if country selection changes
  const toggleCountry = (country) => {
    setPendingCountries(prev => {
      const next = prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country];
      if (next.length > 0) {
        const allowedCities = new Set();
        next.forEach(cntry => {
          (COUNTRY_CITY_MAP[cntry] || []).forEach(ci => allowedCities.add(ci));
        });
        setPendingCities(currCities => currCities.filter(ci => allowedCities.has(ci)));
      }
      return next;
    });
  };

  const toggleCity = (city) => {
    setPendingCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  };

  const toggleIndustry = (ind) => {
    setPendingIndustries(prev => prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]);
  };

  const toggleFunction = (fn) => {
    setPendingFunctions(prev => prev.includes(fn) ? prev.filter(f => f !== fn) : [...prev, fn]);
  };

  const toggleExperience = (exp) => {
    setPendingExperiences(prev => prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp]);
  };

  const toggleJobType = (jt) => {
    setPendingJobTypes(prev => prev.includes(jt) ? prev.filter(t => t !== jt) : [...prev, jt]);
  };

  const toggleCompany = (comp) => {
    setPendingCompanies(prev => prev.includes(comp) ? prev.filter(c => c !== comp) : [...prev, comp]);
  };

  const toggleLanguage = (lang) => {
    setPendingLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  // Restore Search Criteria dispatched from CandidatePortal
  useEffect(() => {
    if (activeSearchCriteria) {
      if (activeSearchCriteria.keyword !== undefined) setKeyword(activeSearchCriteria.keyword || '');
      const restoredCountries = activeSearchCriteria.country && activeSearchCriteria.country !== 'All'
        ? (Array.isArray(activeSearchCriteria.country) ? activeSearchCriteria.country : activeSearchCriteria.country.split(',').map(s => s.trim()))
        : [];
      setAppliedCountries(restoredCountries);
      setPendingCountries(restoredCountries);

      const restoredCities = activeSearchCriteria.city && activeSearchCriteria.city !== 'All'
        ? (Array.isArray(activeSearchCriteria.city) ? activeSearchCriteria.city : activeSearchCriteria.city.split(',').map(s => s.trim()))
        : [];
      setAppliedCities(restoredCities);
      setPendingCities(restoredCities);

      const restoredIndustries = activeSearchCriteria.industry && activeSearchCriteria.industry !== 'All'
        ? (Array.isArray(activeSearchCriteria.industry) ? activeSearchCriteria.industry : activeSearchCriteria.industry.split(',').map(s => s.trim()))
        : [];
      setAppliedIndustries(restoredIndustries);
      setPendingIndustries(restoredIndustries);

      const restoredFunctions = activeSearchCriteria.function && activeSearchCriteria.function !== 'All'
        ? (Array.isArray(activeSearchCriteria.function) ? activeSearchCriteria.function : activeSearchCriteria.function.split(',').map(s => s.trim()))
        : [];
      setAppliedFunctions(restoredFunctions);
      setPendingFunctions(restoredFunctions);

      const restoredExperiences = activeSearchCriteria.experience && activeSearchCriteria.experience !== 'All'
        ? (Array.isArray(activeSearchCriteria.experience) ? activeSearchCriteria.experience : activeSearchCriteria.experience.split(',').map(s => s.trim()))
        : [];
      setAppliedExperiences(restoredExperiences);
      setPendingExperiences(restoredExperiences);

      if (activeSearchCriteria.experienceYears !== undefined && activeSearchCriteria.experienceYears !== '') {
        const expNum = Number(activeSearchCriteria.experienceYears);
        setAppliedExperienceYears(expNum);
        setPendingExperienceYears(expNum);
        setSliderExperienceYears(expNum);
      } else {
        setAppliedExperienceYears(null);
        setPendingExperienceYears(null);
        setSliderExperienceYears(0);
      }

      const restoredSalaryRanges = activeSearchCriteria.salaryRanges && activeSearchCriteria.salaryRanges !== 'All'
        ? (Array.isArray(activeSearchCriteria.salaryRanges) ? activeSearchCriteria.salaryRanges : activeSearchCriteria.salaryRanges.split(',').map(s => s.trim()))
        : [];
      setAppliedSalaryRanges(restoredSalaryRanges);
      setPendingSalaryRanges(restoredSalaryRanges);

      setAppliedSalaryMin(activeSearchCriteria.salaryMin || '');
      setPendingSalaryMin(activeSearchCriteria.salaryMin || '');
      setAppliedSalaryMax(activeSearchCriteria.salaryMax || '');
      setPendingSalaryMax(activeSearchCriteria.salaryMax || '');
      setAppliedSalaryCurrency(activeSearchCriteria.salaryCurrency || 'All');
      setPendingSalaryCurrency(activeSearchCriteria.salaryCurrency || 'All');

      const restoredJobTypes = activeSearchCriteria.jobType && activeSearchCriteria.jobType !== 'All'
        ? (Array.isArray(activeSearchCriteria.jobType) ? activeSearchCriteria.jobType : activeSearchCriteria.jobType.split(',').map(s => s.trim()))
        : [];
      setAppliedJobTypes(restoredJobTypes);
      setPendingJobTypes(restoredJobTypes);

      const restoredCompanies = activeSearchCriteria.company && activeSearchCriteria.company !== 'All'
        ? (Array.isArray(activeSearchCriteria.company) ? activeSearchCriteria.company : activeSearchCriteria.company.split(',').map(s => s.trim()))
        : [];
      setAppliedCompanies(restoredCompanies);
      setPendingCompanies(restoredCompanies);

      setAppliedPostedWithin(activeSearchCriteria.postedWithin || 'all');
      setPendingPostedWithin(activeSearchCriteria.postedWithin || 'all');

      const restoredLanguages = activeSearchCriteria.language && activeSearchCriteria.language !== 'All'
        ? (Array.isArray(activeSearchCriteria.language) ? activeSearchCriteria.language : activeSearchCriteria.language.split(',').map(s => s.trim()))
        : [];
      setAppliedLanguages(restoredLanguages);
      setPendingLanguages(restoredLanguages);

      setCurrentPage(1);
      setLoadedSavedSearchName(activeSearchCriteria._name || 'Restored Saved Search');
      setActiveSearchCriteria(null);

      setTimeout(() => {
        const el = document.getElementById('jobs-results-header');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    }
  }, [activeSearchCriteria, setActiveSearchCriteria]);

  // Synchronize with global selectedJobCategory if provided from navigation
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'All' && appliedIndustries.length === 0) {
      setAppliedIndustries([selectedCategory]);
      setPendingIndustries([selectedCategory]);
    }
  }, [selectedCategory]);

  // Fetch all jobs from backend API or fallback mock
  const fetchJobs = useCallback(async (filtersOverride = null) => {
    setLoading(true);
    let apiJobs = [];
    try {
      const active = filtersOverride || {
        countries: appliedCountries,
        cities: appliedCities,
        industries: appliedIndustries,
        functions: appliedFunctions,
        experienceYears: appliedExperienceYears,
        experiences: appliedExperiences,
        jobTypes: appliedJobTypes,
        salaryRanges: appliedSalaryRanges,
        companies: appliedCompanies,
        languages: appliedLanguages,
        postedWithin: appliedPostedWithin,
        salaryMin: appliedSalaryMin,
        salaryMax: appliedSalaryMax,
        salaryCurrency: appliedSalaryCurrency
      };

      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (active.countries && active.countries.length > 0) params.append('country', active.countries.join(','));
      if (active.cities && active.cities.length > 0) params.append('city', active.cities.join(','));
      if (active.industries && active.industries.length > 0) params.append('industry', active.industries.join(','));
      if (active.functions && active.functions.length > 0) params.append('function', active.functions.join(','));
      if (active.experienceYears !== null && active.experienceYears !== undefined) {
        params.append('experienceYears', active.experienceYears);
      } else if (active.experiences && active.experiences.length > 0) {
        params.append('experience', active.experiences.join(','));
      }
      if (active.jobTypes && active.jobTypes.length > 0) params.append('jobType', active.jobTypes.join(','));
      if (active.salaryMin) params.append('minSalary', active.salaryMin);
      if (active.salaryMax) params.append('maxSalary', active.salaryMax);
      if (active.salaryCurrency && active.salaryCurrency !== 'All') params.append('currency', active.salaryCurrency);
      if (active.companies && active.companies.length > 0) params.append('company', active.companies.join(','));
      if (active.postedWithin && active.postedWithin !== 'all') params.append('postedWithin', active.postedWithin);
      if (active.languages && active.languages.length > 0) params.append('language', active.languages.join(','));
      if (active.salaryRanges && active.salaryRanges.length > 0) params.append('salaryRanges', active.salaryRanges.join(','));
      if (sortBy) params.append('sortBy', sortBy);

      const res = await fetch('/api/jobs?' + params.toString());
      if (res.ok) {
        const data = await res.json();
        if (data && data.data && data.data.length > 0) {
          apiJobs = data.data;
        }
      }
    } catch (err) {
      console.warn('Backend API offline. Using mock job dataset fallback:', err);
    }

    const allCombined = [...postedJobs];
    const baseList = apiJobs.length > 0 ? apiJobs : JOBS_LIST;
    baseList.forEach(item => {
      if (!allCombined.some(existing => existing.id === item.id)) {
        allCombined.push(item);
      }
    });

    setRawJobs(allCombined);
    setLoading(false);
  }, [
    keyword, appliedCountries, appliedCities, appliedIndustries, appliedFunctions,
    appliedExperienceYears, appliedExperiences, appliedJobTypes, appliedSalaryRanges,
    appliedSalaryMin, appliedSalaryMax, appliedSalaryCurrency, appliedCompanies,
    appliedPostedWithin, appliedLanguages, sortBy, postedJobs
  ]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Real option counts for labels e.g. "UAE (14)"
  const itemCounts = useMemo(() => {
    const counts = {
      country: {},
      city: {},
      industry: {},
      function: {},
      experience: {},
      jobType: {},
      company: {},
      salary: {}
    };

    rawJobs.forEach(j => {
      if (j.country) counts.country[j.country] = (counts.country[j.country] || 0) + 1;
      if (j.city) counts.city[j.city] = (counts.city[j.city] || 0) + 1;
      const ind = j.industry || j.category;
      if (ind) counts.industry[ind] = (counts.industry[ind] || 0) + 1;
      const fn = j.function || j.department;
      if (fn) counts.function[fn] = (counts.function[fn] || 0) + 1;
      if (j.experience) counts.experience[j.experience] = (counts.experience[j.experience] || 0) + 1;
      if (j.jobType) counts.jobType[j.jobType] = (counts.jobType[j.jobType] || 0) + 1;
      if (j.company) counts.company[j.company] = (counts.company[j.company] || 0) + 1;
    });

    SALARY_OPTIONS.forEach(opt => {
      counts.salary[opt] = rawJobs.filter(j => matchesSalaryRange(j, opt)).length;
    });

    return counts;
  }, [rawJobs]);

  // Config for the centered Naukri-style Filter Popup Modal
  const popupConfig = useMemo(() => {
    if (!popupCategory) return null;
    switch (popupCategory) {
      case 'country':
        return {
          title: 'Select Country',
          icon: Globe,
          items: COUNTRIES,
          counts: itemCounts.country,
          placeholder: 'Search Country (e.g. UAE, Qatar, Saudi Arabia)...'
        };
      case 'city':
        return {
          title: pendingCountries.length > 0 ? `Select City (${pendingCountries.join(', ')})` : 'Select City',
          icon: MapPin,
          items: availableCities,
          counts: itemCounts.city,
          placeholder: 'Search City (e.g. Dubai, Doha, Riyadh)...'
        };
      case 'industry':
        return {
          title: 'Select Industry',
          icon: Briefcase,
          items: INDUSTRIES,
          counts: itemCounts.industry,
          placeholder: 'Search Industry (e.g. IT, Healthcare, Engineering)...'
        };
      case 'function':
        return {
          title: 'Select Function / Department',
          icon: Building2,
          items: FUNCTIONS,
          counts: itemCounts.function,
          placeholder: 'Search Department (e.g. Software, Nursing, Sales)...'
        };
      case 'experience':
        return {
          title: 'Select Experience Level',
          icon: Clock,
          items: EXPERIENCE_LEVELS,
          counts: itemCounts.experience,
          placeholder: 'Search Experience (e.g. 1–3 Years, 5–10 Years)...'
        };
      case 'jobType':
        return {
          title: 'Select Job Type',
          icon: Tag,
          items: JOB_TYPES,
          counts: itemCounts.jobType,
          placeholder: 'Search Job Type (e.g. Full-time, Remote)...'
        };
      case 'salary':
        return {
          title: 'Select Salary Range',
          icon: Coins,
          items: SALARY_OPTIONS,
          counts: itemCounts.salary,
          placeholder: 'Search Salary Range (e.g. 10k, Lakhs, Crore)...'
        };
      default:
        return null;
    }
  }, [popupCategory, availableCities, itemCounts, pendingCountries]);

  // PREVIEW matching jobs for PENDING filters (updates Apply (N) button count)
  const previewFilteredJobs = useMemo(() => {
    return filterJobList(rawJobs, {
      keyword,
      countries: pendingCountries,
      cities: pendingCities,
      industries: pendingIndustries,
      functions: pendingFunctions,
      experienceYears: pendingExperienceYears,
      experiences: pendingExperiences,
      jobTypes: pendingJobTypes,
      salaryRanges: pendingSalaryRanges,
      companies: pendingCompanies,
      languages: pendingLanguages,
      postedWithin: pendingPostedWithin,
      salaryMin: pendingSalaryMin,
      salaryMax: pendingSalaryMax,
      salaryCurrency: pendingSalaryCurrency
    });
  }, [
    rawJobs, keyword, pendingCountries, pendingCities, pendingIndustries,
    pendingFunctions, pendingExperienceYears, pendingExperiences, pendingJobTypes,
    pendingSalaryRanges, pendingCompanies, pendingLanguages, pendingPostedWithin,
    pendingSalaryMin, pendingSalaryMax, pendingSalaryCurrency
  ]);

  // ACTUAL displayed jobs based on APPLIED filters
  const filteredJobs = useMemo(() => {
    return filterJobList(rawJobs, {
      keyword,
      countries: appliedCountries,
      cities: appliedCities,
      industries: appliedIndustries,
      functions: appliedFunctions,
      experienceYears: appliedExperienceYears,
      experiences: appliedExperiences,
      jobTypes: appliedJobTypes,
      salaryRanges: appliedSalaryRanges,
      companies: appliedCompanies,
      languages: appliedLanguages,
      postedWithin: appliedPostedWithin,
      salaryMin: appliedSalaryMin,
      salaryMax: appliedSalaryMax,
      salaryCurrency: appliedSalaryCurrency
    }).sort((a, b) => {
      if (sortBy === 'recommended') {
        const scoreA = getRecommendationScore(a, user, keyword);
        const scoreB = getRecommendationScore(b, user, keyword);
        if (scoreB !== scoreA) return scoreB - scoreA;
        const timeA = parseJobTime(a);
        const timeB = parseJobTime(b);
        if (timeB !== timeA) return timeB - timeA;
        return String(b.id || '').localeCompare(String(a.id || ''));
      }
      if (sortBy === 'relevance') {
        const scoreA = getRelevanceScore(a, keyword);
        const scoreB = getRelevanceScore(b, keyword);
        if (scoreB !== scoreA) return scoreB - scoreA;
        const timeA = parseJobTime(a);
        const timeB = parseJobTime(b);
        if (timeB !== timeA) return timeB - timeA;
        return String(b.id || '').localeCompare(String(a.id || ''));
      }
      if (sortBy === 'date') {
        const timeA = parseJobTime(a);
        const timeB = parseJobTime(b);
        if (timeB !== timeA) return timeB - timeA;
        return String(b.id || '').localeCompare(String(a.id || ''));
      }
      // Fallback: Date newest first
      const timeA = parseJobTime(a);
      const timeB = parseJobTime(b);
      if (timeB !== timeA) return timeB - timeA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [
    rawJobs, keyword, appliedCountries, appliedCities, appliedIndustries,
    appliedFunctions, appliedExperienceYears, appliedExperiences, appliedJobTypes,
    appliedSalaryRanges, appliedCompanies, appliedLanguages, appliedPostedWithin,
    appliedSalaryMin, appliedSalaryMax, appliedSalaryCurrency, sortBy, user
  ]);

  // Total applied active filter count (Strictly counts committed filter selections across all categories)
  const appliedFilterCount = useMemo(() => {
    return calculateFilterCount({
      countries: appliedCountries,
      cities: appliedCities,
      industries: appliedIndustries,
      functions: appliedFunctions,
      experienceYears: appliedExperienceYears,
      experiences: appliedExperiences,
      jobTypes: appliedJobTypes,
      salaryRanges: appliedSalaryRanges,
      companies: appliedCompanies,
      languages: appliedLanguages,
      postedWithin: appliedPostedWithin,
      salaryMin: appliedSalaryMin,
      salaryMax: appliedSalaryMax,
      salaryCurrency: appliedSalaryCurrency
    });
  }, [
    appliedCountries, appliedCities, appliedIndustries, appliedFunctions,
    appliedExperienceYears, appliedExperiences, appliedJobTypes, appliedSalaryRanges,
    appliedCompanies, appliedLanguages, appliedPostedWithin, appliedSalaryMin,
    appliedSalaryMax, appliedSalaryCurrency
  ]);

  // Pending filter count for sidebar preview
  const pendingFilterCount = useMemo(() => {
    return calculateFilterCount({
      countries: pendingCountries,
      cities: pendingCities,
      industries: pendingIndustries,
      functions: pendingFunctions,
      experienceYears: pendingExperienceYears,
      experiences: pendingExperiences,
      jobTypes: pendingJobTypes,
      salaryRanges: pendingSalaryRanges,
      companies: pendingCompanies,
      languages: pendingLanguages,
      postedWithin: pendingPostedWithin,
      salaryMin: pendingSalaryMin,
      salaryMax: pendingSalaryMax,
      salaryCurrency: pendingSalaryCurrency
    });
  }, [
    pendingCountries, pendingCities, pendingIndustries, pendingFunctions,
    pendingExperienceYears, pendingExperiences, pendingJobTypes, pendingSalaryRanges,
    pendingCompanies, pendingLanguages, pendingPostedWithin, pendingSalaryMin,
    pendingSalaryMax, pendingSalaryCurrency
  ]);

  // Whether user has staged pending selections that differ from applied selections
  const hasPendingChanges = useMemo(() => {
    if (pendingCountries.length !== appliedCountries.length || !pendingCountries.every(c => appliedCountries.includes(c))) return true;
    if (pendingCities.length !== appliedCities.length || !pendingCities.every(c => appliedCities.includes(c))) return true;
    if (pendingIndustries.length !== appliedIndustries.length || !pendingIndustries.every(i => appliedIndustries.includes(i))) return true;
    if (pendingFunctions.length !== appliedFunctions.length || !pendingFunctions.every(f => appliedFunctions.includes(f))) return true;
    if (pendingExperienceYears !== appliedExperienceYears) return true;
    if (pendingExperiences.length !== appliedExperiences.length || !pendingExperiences.every(e => appliedExperiences.includes(e))) return true;
    if (pendingJobTypes.length !== appliedJobTypes.length || !pendingJobTypes.every(jt => appliedJobTypes.includes(jt))) return true;
    if (pendingSalaryRanges.length !== appliedSalaryRanges.length || !pendingSalaryRanges.every(sr => appliedSalaryRanges.includes(sr))) return true;
    if (pendingCompanies.length !== appliedCompanies.length || !pendingCompanies.every(cp => appliedCompanies.includes(cp))) return true;
    if (pendingLanguages.length !== appliedLanguages.length || !pendingLanguages.every(l => appliedLanguages.includes(l))) return true;
    if (pendingPostedWithin !== appliedPostedWithin) return true;
    if (pendingSalaryMin !== appliedSalaryMin || pendingSalaryMax !== appliedSalaryMax || pendingSalaryCurrency !== appliedSalaryCurrency) return true;
    return false;
  }, [
    pendingCountries, appliedCountries,
    pendingCities, appliedCities,
    pendingIndustries, appliedIndustries,
    pendingFunctions, appliedFunctions,
    pendingExperienceYears, appliedExperienceYears,
    pendingExperiences, appliedExperiences,
    pendingJobTypes, appliedJobTypes,
    pendingSalaryRanges, appliedSalaryRanges,
    pendingCompanies, appliedCompanies,
    pendingLanguages, appliedLanguages,
    pendingPostedWithin, appliedPostedWithin,
    pendingSalaryMin, appliedSalaryMin,
    pendingSalaryMax, appliedSalaryMax,
    pendingSalaryCurrency, appliedSalaryCurrency
  ]);

  // Apply pending filters: Commits staged selections to applied selections and refreshes job list
  const applyPendingFilters = () => {
    setAppliedCountries([...pendingCountries]);
    setAppliedCities([...pendingCities]);
    setAppliedIndustries([...pendingIndustries]);
    setAppliedFunctions([...pendingFunctions]);
    setAppliedExperienceYears(pendingExperienceYears);
    setAppliedExperiences([...pendingExperiences]);
    setAppliedJobTypes([...pendingJobTypes]);
    setAppliedSalaryRanges([...pendingSalaryRanges]);
    setAppliedCompanies([...pendingCompanies]);
    setAppliedLanguages([...pendingLanguages]);
    setAppliedPostedWithin(pendingPostedWithin);
    setAppliedSalaryMin(pendingSalaryMin);
    setAppliedSalaryMax(pendingSalaryMax);
    setAppliedSalaryCurrency(pendingSalaryCurrency);

    setCurrentPage(1);
    setMobileFilterOpen(false);

    fetchJobs({
      countries: pendingCountries,
      cities: pendingCities,
      industries: pendingIndustries,
      functions: pendingFunctions,
      experienceYears: pendingExperienceYears,
      experiences: pendingExperiences,
      jobTypes: pendingJobTypes,
      salaryRanges: pendingSalaryRanges,
      companies: pendingCompanies,
      languages: pendingLanguages,
      postedWithin: pendingPostedWithin,
      salaryMin: pendingSalaryMin,
      salaryMax: pendingSalaryMax,
      salaryCurrency: pendingSalaryCurrency
    });

    setTimeout(() => {
      document.getElementById('jobs-results-header')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Discard pending changes: Restores pending selections from current applied selections
  const discardPendingFilters = () => {
    setPendingCountries([...appliedCountries]);
    setPendingCities([...appliedCities]);
    setPendingIndustries([...appliedIndustries]);
    setPendingFunctions([...appliedFunctions]);
    setPendingExperienceYears(appliedExperienceYears);
    setSliderExperienceYears(appliedExperienceYears !== null ? appliedExperienceYears : 0);
    setPendingExperiences([...appliedExperiences]);
    setPendingJobTypes([...appliedJobTypes]);
    setPendingSalaryRanges([...appliedSalaryRanges]);
    setPendingCompanies([...appliedCompanies]);
    setPendingLanguages([...appliedLanguages]);
    setPendingPostedWithin(appliedPostedWithin);
    setPendingSalaryMin(appliedSalaryMin);
    setPendingSalaryMax(appliedSalaryMax);
    setPendingSalaryCurrency(appliedSalaryCurrency);
  };

  // Reset all filters: Clears both applied and pending filters, resets experience to null/0, preserves keyword search
  const clearAllFilters = () => {
    setPendingCountries([]);
    setAppliedCountries([]);
    setPendingCities([]);
    setAppliedCities([]);
    setPendingIndustries([]);
    setAppliedIndustries([]);
    setPendingFunctions([]);
    setAppliedFunctions([]);
    setPendingExperiences([]);
    setAppliedExperiences([]);
    setPendingExperienceYears(null);
    setAppliedExperienceYears(null);
    setSliderExperienceYears(0);
    setPendingJobTypes([]);
    setAppliedJobTypes([]);
    setPendingSalaryRanges([]);
    setAppliedSalaryRanges([]);
    setPendingCompanies([]);
    setAppliedCompanies([]);
    setPendingLanguages([]);
    setAppliedLanguages([]);
    setPendingPostedWithin('all');
    setAppliedPostedWithin('all');
    setPendingSalaryMin('');
    setAppliedSalaryMin('');
    setPendingSalaryMax('');
    setAppliedSalaryMax('');
    setPendingSalaryCurrency('All');
    setAppliedSalaryCurrency('All');

    // Section 10: "Preserve the keyword search unless the existing application explicitly treats it as part of Clear All"
    setSortBy('recommended');
    setCurrentPage(1);
    setLoadedSavedSearchName('');
    if (setSelectedCategory) setSelectedCategory('All');

    fetchJobs({
      countries: [],
      cities: [],
      industries: [],
      functions: [],
      experienceYears: null,
      experiences: [],
      jobTypes: [],
      salaryRanges: [],
      companies: [],
      languages: [],
      postedWithin: 'all',
      salaryMin: '',
      salaryMax: '',
      salaryCurrency: 'All'
    });
  };

  // Remove individual active filter chip: Immediately updates both applied and pending states and refreshes results
  const removeAppliedFilter = (category, value) => {
    if (category === 'country') {
      const next = appliedCountries.filter(c => c !== value);
      setAppliedCountries(next);
      setPendingCountries(next);
      if (next.length > 0) {
        const allowed = new Set();
        next.forEach(cntry => (COUNTRY_CITY_MAP[cntry] || []).forEach(ci => allowed.add(ci)));
        const nextCities = appliedCities.filter(ci => allowed.has(ci));
        setAppliedCities(nextCities);
        setPendingCities(nextCities);
      }
    } else if (category === 'city') {
      const next = appliedCities.filter(ci => ci !== value);
      setAppliedCities(next);
      setPendingCities(next);
    } else if (category === 'industry') {
      const next = appliedIndustries.filter(i => i !== value);
      setAppliedIndustries(next);
      setPendingIndustries(next);
    } else if (category === 'function') {
      const next = appliedFunctions.filter(f => f !== value);
      setAppliedFunctions(next);
      setPendingFunctions(next);
    } else if (category === 'experienceYears') {
      setAppliedExperienceYears(null);
      setPendingExperienceYears(null);
      setSliderExperienceYears(0);
    } else if (category === 'experience') {
      const next = appliedExperiences.filter(e => e !== value);
      setAppliedExperiences(next);
      setPendingExperiences(next);
    } else if (category === 'jobType') {
      const next = appliedJobTypes.filter(jt => jt !== value);
      setAppliedJobTypes(next);
      setPendingJobTypes(next);
    } else if (category === 'salary') {
      const next = appliedSalaryRanges.filter(s => s !== value);
      setAppliedSalaryRanges(next);
      setPendingSalaryRanges(next);
    } else if (category === 'company') {
      const next = appliedCompanies.filter(c => c !== value);
      setAppliedCompanies(next);
      setPendingCompanies(next);
    }
    setCurrentPage(1);
  };

  // Open Save Search Modal
  const handleOpenSaveSearch = () => {
    if (!user) {
      openAuthModal('login', 'candidate');
      return;
    }

    const parts = [];
    if (appliedIndustries.length > 0) parts.push(appliedIndustries.join(', '));
    if (appliedFunctions.length > 0) parts.push(appliedFunctions.join(', '));
    if (keyword) parts.push(`"${keyword}"`);
    if (appliedCities.length > 0) parts.push(appliedCities.join(', '));
    else if (appliedCountries.length > 0) parts.push(appliedCountries.join(', '));

    const defaultName = parts.length > 0 ? `${parts.join(' - ')} Search` : 'My Saved Job Search';
    setSearchName(defaultName);
    setSaveError('');
    setSaveModalOpen(true);
  };

  // Submit Save Search to Backend API & Candidate State
  const handleSaveSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchName.trim()) {
      setSaveError('Please enter a descriptive name for this search.');
      return;
    }

    setSavingSearch(true);
    setSaveError('');

    const criteria = {
      keyword,
      country: appliedCountries.join(','),
      city: appliedCities.join(','),
      industry: appliedIndustries.join(','),
      function: appliedFunctions.join(','),
      experience: appliedExperiences.join(','),
      experienceYears: appliedExperienceYears !== null ? appliedExperienceYears : '',
      salaryRanges: appliedSalaryRanges.join(','),
      salaryMin: appliedSalaryMin,
      salaryMax: appliedSalaryMax,
      salaryCurrency: appliedSalaryCurrency,
      jobType: appliedJobTypes.join(','),
      company: appliedCompanies.join(','),
      postedWithin: appliedPostedWithin,
      language: appliedLanguages.join(','),
      sortBy
    };

    const res = await saveSearch(searchName.trim(), criteria);
    setSavingSearch(false);

    if (res.success) {
      setSaveModalOpen(false);
      setSaveSuccessToast(`✓ Saved search "${searchName.trim()}" saved to your candidate account!`);
      setTimeout(() => setSaveSuccessToast(''), 5000);
    } else {
      setSaveError(res.message || 'Failed to save search criteria.');
    }
  };

  // Auto-open application modal when user registers or logs in with a pending job
  useEffect(() => {
    if (user && user.email && pendingJobToApply) {
      const targetJob = pendingJobToApply;
      setPendingJobToApply(null);
      setApplyJob(targetJob);
      setAppliedSuccess(false);
    }
  }, [user, pendingJobToApply]);

  const handleQuickApply = (e, job) => {
    e.stopPropagation();
    if (!user || !user.email) {
      setPendingJobToApply(job);
      openAuthModal('register', 'candidate');
      return;
    }
    setApplyJob(job);
    setAppliedSuccess(false);
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage, pageSize]);

  // Reusable multi-select filter category: each topic with 2 options vertically + "+ View More" popup modal
  const renderFilterCategory = ({
    title,
    icon: Icon,
    sectionKey,
    items,
    selectedItems,
    toggleItem,
    counts = {},
    isLast = false
  }) => {
    const selectedCount = selectedItems.length;

    // Display initial 2 options vertically, plus any additional selected items so user sees their active selections
    const visibleItems = useMemo(() => {
      const initialTwo = items.slice(0, 2);
      const set = new Set(initialTwo);
      selectedItems.forEach(it => {
        if (items.includes(it)) set.add(it);
      });
      return Array.from(set);
    }, [items, selectedItems]);

    return (
      <div className={isLast ? "pb-1" : "border-b border-slate-100 dark:border-navy-800/80 pb-3"}>
        <div className="w-full flex items-center justify-between text-xs font-bold text-navy-950 dark:text-white py-1">
          <span className="flex items-center gap-2">
            <Icon className="w-3.5 h-3.5 text-gold-500 shrink-0" />
            <span>{title}</span>
          </span>
        </div>

        <div className="mt-2 space-y-1.5">
          <div className="space-y-1">
            {visibleItems.map(item => {
              const checked = selectedItems.includes(item);
              const count = counts[item] || 0;
              return (
                <label
                  key={item}
                  className={`flex items-start gap-1.5 py-1 px-1.5 rounded-lg cursor-pointer select-none transition ${checked
                    ? 'bg-gold-500/10 text-gold-700 dark:text-gold-300 font-bold'
                    : 'hover:bg-slate-50 dark:hover:bg-navy-900/60 text-slate-700 dark:text-slate-300'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItem(item)}
                    className="w-3.5 h-3.5 rounded text-[#102B45] focus:ring-gold-500 accent-[#102B45] cursor-pointer shrink-0 mt-0.5"
                  />
                  <span className="text-xs break-words min-w-0 flex-1 leading-tight">{item}</span>
                  {count > 0 && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0 ml-auto pl-1">
                      ({count})
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {items.length > 2 && (
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => openFilterPopup(sectionKey)}
                className="text-[11px] font-bold text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 hover:underline cursor-pointer flex items-center gap-1 transition"
              >
                <span>View More</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Body scroll lock on mobile when drawer is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setMobileFilterOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileFilterOpen]);

  // ============================================================
  // REUSABLE FILTER PANEL CONTENT (Desktop Sidebar & Mobile Drawer)
  // ============================================================
  const renderFilterContent = () => (
    <div className="flex flex-col h-full min-h-0 text-xs font-sans">

      {/* 1. Header with Icon, Title, and Reset (Pinned at Top) */}
      <div className="shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3 bg-white dark:bg-navy-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gold-500/15 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white leading-tight">
            Filters
          </h3>
        </div>

        {(appliedFilterCount > 0 || pendingFilterCount > 0) && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer transition"
            title="Reset all filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* 2. Scrollable Body: Selected Filters + Categories */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-3.5 pr-1.5 min-h-0 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] dark:[scrollbar-color:#334155_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">

        {/* Selected Filters Section (Shows pending filter chips inside the panel) */}
        {pendingFilterCount > 0 && (
          <div className="p-3 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200 dark:border-navy-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Selected Filters ({pendingFilterCount})
              </span>
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] font-semibold text-gold-600 dark:text-gold-400 hover:underline cursor-pointer"
              >
                Clear all
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {pendingCountries.map(c => (
                <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                  <span>{c}</span>
                  <button type="button" onClick={() => toggleCountry(c)} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {pendingCities.map(ci => (
                <span key={ci} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                  <span>{ci}</span>
                  <button type="button" onClick={() => toggleCity(ci)} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {pendingIndustries.map(ind => (
                <span key={ind} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                  <span>{ind}</span>
                  <button type="button" onClick={() => toggleIndustry(ind)} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {pendingFunctions.map(fn => (
                <span key={fn} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                  <span>{fn}</span>
                  <button type="button" onClick={() => toggleFunction(fn)} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {pendingExperienceYears !== null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                  <span>Experience: {pendingExperienceYears} Yrs</span>
                  <button type="button" onClick={() => { setPendingExperienceYears(null); setSliderExperienceYears(0); }} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {pendingExperiences.map(exp => (
                <span key={exp} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                  <span>{exp}</span>
                  <button type="button" onClick={() => toggleExperience(exp)} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {pendingJobTypes.map(jt => (
                <span key={jt} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                  <span>{jt}</span>
                  <button type="button" onClick={() => toggleJobType(jt)} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {pendingCompanies.map(comp => (
                <span key={comp} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                  <span>{comp}</span>
                  <button type="button" onClick={() => toggleCompany(comp)} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {pendingSalaryRanges.map(sal => (
                <span key={sal} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                  <span>{sal}</span>
                  <button type="button" onClick={() => toggleSalaryRange(sal)} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {(pendingSalaryMin || pendingSalaryMax || pendingSalaryCurrency !== 'All') && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30 font-mono">
                  <span>Salary: {pendingSalaryMin || '0'}{pendingSalaryMax ? `–${pendingSalaryMax}` : '+'} {pendingSalaryCurrency !== 'All' ? pendingSalaryCurrency : ''}</span>
                  <button type="button" onClick={() => { setPendingSalaryMin(''); setPendingSalaryMax(''); setPendingSalaryCurrency('All'); }} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Filter Categories (7 Categories with clean in-place expansion) */}
        <div className="space-y-3.5">

          {/* --- CATEGORY 1: COUNTRY --- */}
          {renderFilterCategory({
            title: 'Country',
            icon: Globe,
            sectionKey: 'country',
            items: COUNTRIES,
            selectedItems: pendingCountries,
            toggleItem: toggleCountry,
            counts: itemCounts.country
          })}

          {/* --- CATEGORY 2: CITY --- */}
          {renderFilterCategory({
            title: 'City',
            icon: MapPin,
            sectionKey: 'city',
            items: availableCities,
            selectedItems: pendingCities,
            toggleItem: toggleCity,
            counts: itemCounts.city
          })}

          {/* --- CATEGORY 3: INDUSTRY --- */}
          {renderFilterCategory({
            title: 'Industry',
            icon: Briefcase,
            sectionKey: 'industry',
            items: INDUSTRIES,
            selectedItems: pendingIndustries,
            toggleItem: toggleIndustry,
            counts: itemCounts.industry
          })}

          {/* --- CATEGORY 4: FUNCTION / DEPARTMENT --- */}
          {renderFilterCategory({
            title: 'Function / Department',
            icon: Building2,
            sectionKey: 'function',
            items: FUNCTIONS,
            selectedItems: pendingFunctions,
            toggleItem: toggleFunction,
            counts: itemCounts.function
          })}

          {/* --- CATEGORY 5: EXPERIENCE RANGE SLIDER --- */}
          <div className="border-b border-slate-100 dark:border-navy-800/80 pb-3">
            <div className="w-full flex items-center justify-between text-xs font-bold text-navy-950 dark:text-white py-1">
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                <span>Experience{pendingExperienceYears !== null ? ` (${pendingExperienceYears} Yrs)` : ''}</span>
              </span>
            </div>

            <div className="mt-2 pt-6 pb-1 px-1">
              {/* Horizontal Range Slider with Tooltip */}
              <div className="relative w-full">
                {/* Dynamic Tooltip / Bubble Indicator above Thumb */}
                {(() => {
                  const pct = Math.min(Math.max((sliderExperienceYears / 30) * 100, 0), 100);
                  return (
                    <>
                      <div
                        className="absolute -top-7 transform -translate-x-1/2 pointer-events-none transition-all duration-75 z-10"
                        style={{ left: `calc(${pct}% + ${(0.5 - pct / 100) * 18}px)` }}
                      >
                        <div className="relative bg-[#102B45] text-white dark:bg-gold-500 dark:text-navy-950 font-bold text-[11px] px-2 py-0.5 rounded-md shadow-md whitespace-nowrap">
                          {sliderExperienceYears} Yrs
                          <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-[#102B45] dark:bg-gold-500" />
                        </div>
                      </div>

                      {/* Draggable Slider Input with Fill Track */}
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="1"
                        value={sliderExperienceYears}
                        aria-label="Experience in years"
                        onChange={(e) => handleSliderChange(Number(e.target.value))}
                        className="slider-revival"
                        style={{
                          background: `linear-gradient(to right, #D5A33B 0%, #D5A33B ${pct}%, var(--slider-track-bg, #e2e8f0) ${pct}%, var(--slider-track-bg, #e2e8f0) 100%)`
                        }}
                      />
                    </>
                  );
                })()}
              </div>

              {/* Min / Max Labels and Optional Reset Button */}
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500 pt-1.5">
                <span>0 Yrs</span>
                {pendingExperienceYears !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setPendingExperienceYears(null);
                      setSliderExperienceYears(0);
                    }}
                    className="text-[10px] text-gold-600 dark:text-gold-400 hover:underline cursor-pointer font-bold"
                  >
                    Reset
                  </button>
                )}
                <span>30 Yrs</span>
              </div>
            </div>
          </div>

          {/* --- CATEGORY 6: SALARY --- */}
          {renderFilterCategory({
            title: 'Salary',
            icon: Coins,
            sectionKey: 'salary',
            items: SALARY_OPTIONS,
            selectedItems: pendingSalaryRanges,
            toggleItem: toggleSalaryRange,
            counts: itemCounts.salary
          })}

          {/* --- CATEGORY 7: JOB TYPE --- */}
          {renderFilterCategory({
            title: 'Job Type',
            icon: Tag,
            sectionKey: 'jobType',
            items: JOB_TYPES,
            selectedItems: pendingJobTypes,
            toggleItem: toggleJobType,
            counts: itemCounts.jobType,
            isLast: true
          })}

        </div>
      </div>

      {/* 3. Footer Actions inside Filter Card (Pinned at Bottom) */}
      <div className="shrink-0 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center gap-2 bg-white dark:bg-navy-950">
        <button
          type="button"
          onClick={clearAllFilters}
          disabled={appliedFilterCount === 0 && pendingFilterCount === 0}
          className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition duration-150 text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Clear All
        </button>

        <button
          type="button"
          onClick={applyPendingFilters}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs shadow-xs transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${hasPendingChanges
            ? 'bg-gold-500 hover:bg-gold-400 text-navy-950 shadow-md ring-2 ring-gold-500/30'
            : 'bg-[#102B45] hover:bg-[#0c2236] text-white dark:bg-gold-500 dark:hover:bg-gold-400 dark:text-navy-950'
            }`}
        >
          {loading ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Filter className={`w-3.5 h-3.5 shrink-0 ${hasPendingChanges ? 'text-navy-950' : 'text-gold-400 dark:text-navy-950'}`} />
          )}
          <span>Apply ({pendingFilterCount})</span>
        </button>
      </div>

    </div>
  );

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 pt-5 sm:pt-7 pb-2 space-y-5">
      <SEO
        title="Discover Global Career Opportunities | Revival International"
        description="Explore professional opportunities across the GCC and international markets with Revival International."
        canonicalPath="jobs"
        keywords="international jobs Dubai, GCC executive vacancies, overseas recruitment Dubai, Dubai engineering jobs, healthcare jobs Middle East"
        breadcrumbs={[
          { name: 'Home', item: '' },
          { name: 'Job Opportunities', item: 'jobs' }
        ]}
      />

      {/* Page Header */}
      <ScrollReveal className="w-full flex justify-center">
        <div className="w-full text-center space-y-2 max-w-3xl mx-auto py-1 flex flex-col items-center justify-center">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 dark:text-white text-center w-full">
            {t('jobs.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 text-center mx-auto max-w-2xl leading-relaxed w-full">
            {t('jobs.subtitle')}
          </p>
        </div>
      </ScrollReveal>

      {/* Restored Saved Search Toast */}
      {loadedSavedSearchName && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
            <Bookmark className="w-4 h-4 text-gold-500 shrink-0" />
            <span>Active Saved Search: <strong>{loadedSavedSearchName}</strong></span>
          </div>
          <button
            onClick={() => setLoadedSavedSearchName('')}
            className="text-amber-700 dark:text-amber-400 hover:text-amber-950 dark:hover:text-white text-xs font-semibold px-2 py-0.5 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Save Success Alert */}
      {saveSuccessToast && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{saveSuccessToast}</span>
          </div>
          <button
            onClick={() => setSaveSuccessToast('')}
            className="text-emerald-700 dark:text-emerald-300 p-1 hover:opacity-80 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Filter Trigger Bar (Visible only on < lg screens) */}
      <div className="lg:hidden flex items-center justify-between gap-2.5 bg-white dark:bg-navy-950 p-3 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-xs">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="w-full py-2 px-3.5 rounded-xl bg-[#102B45] text-white dark:bg-gold-500 dark:text-navy-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-gold-400 dark:text-navy-950" />
          <span>Filters {appliedFilterCount > 0 ? `(${appliedFilterCount})` : ''}</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* MAIN TWO-COLUMN RESPONSIVE LAYOUT                             */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[330px_minmax(0,1fr)] gap-5 xl:gap-6 items-start w-full">

        {/* ------------------------------------------------------------ */}
        {/* LEFT COLUMN: DESKTOP FILTER CARD                             */}
        {/* Starts at the same vertical position as right column         */}
        {/* Does NOT attach to browser edge, does NOT cover results      */}
        {/* Scrollable with pinned header & footer (max-h viewport)      */}
        {/* ------------------------------------------------------------ */}
        <aside className="hidden lg:block w-full sticky top-24 self-start z-10">
          <div className="bg-white dark:bg-navy-950 border border-gold-500/30 dark:border-navy-800 rounded-2xl shadow-sm p-4 sm:p-4.5 max-h-[calc(100vh-7.5rem)] flex flex-col">
            {renderFilterContent()}
          </div>
        </aside>

        {/* ------------------------------------------------------------ */}
        {/* RIGHT COLUMN: SEARCH, CONTROLS, AND JOB RESULTS              */}
        {/* ------------------------------------------------------------ */}
        <main className="min-w-0 w-full space-y-4.5">

          {/* Top Search & Controls Bar */}
          <div id="jobs-results-header" className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl p-4 sm:p-4.5 shadow-xs space-y-3">

            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">

              {/* Keyword Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by job title, company name, skills (e.g. 'Software Engineer', 'ICU Nurse')..."
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl pl-10 pr-8 py-2 text-xs focus:outline-none focus:border-gold-500 transition font-medium"
                />
                {keyword && (
                  <button
                    type="button"
                    onClick={() => { setKeyword(''); setCurrentPage(1); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div ref={sortDropdownRef} className="relative flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">Sort:</span>

                <button
                  type="button"
                  onClick={() => setSortDropdownOpen(prev => !prev)}
                  aria-expanded={sortDropdownOpen}
                  aria-haspopup="listbox"
                  aria-label="Sort jobs by"
                  className="h-9 px-3 rounded-xl bg-white dark:bg-navy-900 border border-gold-500/50 hover:border-gold-500 text-navy-950 dark:text-white text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-gold-500"
                >
                  <span>{SORT_OPTIONS.find(o => o.id === sortBy)?.label || 'Recommended'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gold-600 dark:text-gold-400 transition-transform duration-200 ${sortDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {sortDropdownOpen && (
                  <div
                    role="listbox"
                    aria-label="Sort options"
                    className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-navy-900 border border-gold-500/40 dark:border-gold-500/30 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-fade-in"
                  >
                    {SORT_OPTIONS.map((opt, idx) => {
                      const isSelected = sortBy === opt.id;
                      const isLast = idx === SORT_OPTIONS.length - 1;

                      return (
                        <button
                          key={opt.id}
                          role="option"
                          aria-selected={isSelected}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.id);
                            setCurrentPage(1);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${!isLast ? 'border-b border-slate-100 dark:border-navy-800/80' : ''
                            } ${isSelected
                              ? 'bg-amber-50/80 dark:bg-amber-950/40 text-navy-950 dark:text-gold-300 font-bold'
                              : 'text-navy-950 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800/60 font-medium'
                            }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters as Removable Chips */}
            {appliedFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-slate-100 dark:border-navy-800 text-xs">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Applied ({appliedFilterCount}):</span>

                {appliedCountries.map(c => (
                  <span key={c} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                    <span>{c}</span>
                    <button type="button" onClick={() => removeAppliedFilter('country', c)} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {appliedCities.map(ci => (
                  <span key={ci} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                    <span>{ci}</span>
                    <button type="button" onClick={() => removeAppliedFilter('city', ci)} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {appliedIndustries.map(ind => (
                  <span key={ind} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                    <span>{ind}</span>
                    <button type="button" onClick={() => removeAppliedFilter('industry', ind)} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {appliedFunctions.map(fn => (
                  <span key={fn} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                    <span>{fn}</span>
                    <button type="button" onClick={() => removeAppliedFilter('function', fn)} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {appliedExperienceYears !== null && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                    <span>Experience: {appliedExperienceYears} Yrs</span>
                    <button type="button" onClick={() => removeAppliedFilter('experienceYears', appliedExperienceYears)} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {appliedExperiences.map(exp => (
                  <span key={exp} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                    <span>{exp}</span>
                    <button type="button" onClick={() => removeAppliedFilter('experience', exp)} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {appliedJobTypes.map(jt => (
                  <span key={jt} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                    <span>{jt}</span>
                    <button type="button" onClick={() => removeAppliedFilter('jobType', jt)} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {appliedCompanies.map(comp => (
                  <span key={comp} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                    <span>{comp}</span>
                    <button type="button" onClick={() => removeAppliedFilter('company', comp)} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {appliedSalaryRanges.map(sal => (
                  <span key={sal} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                    <span>{sal}</span>
                    <button type="button" onClick={() => removeAppliedFilter('salary', sal)} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {(appliedSalaryMin || appliedSalaryMax || appliedSalaryCurrency !== 'All') && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30 font-mono">
                    <span>Salary: {appliedSalaryMin || '0'}{appliedSalaryMax ? `–${appliedSalaryMax}` : '+'} {appliedSalaryCurrency !== 'All' ? appliedSalaryCurrency : ''}</span>
                    <button type="button" onClick={() => { setAppliedSalaryMin(''); setAppliedSalaryMax(''); setAppliedSalaryCurrency('All'); setPendingSalaryMin(''); setPendingSalaryMax(''); setPendingSalaryCurrency('All'); setCurrentPage(1); }} className="hover:text-gold-950 dark:hover:text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline ml-2 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Job Listings Grid / Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4 gap-4.5">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="bg-white dark:bg-navy-950 rounded-2xl p-5 border border-slate-200 dark:border-navy-800 animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-navy-800 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 dark:bg-navy-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-navy-800 rounded w-1/2" />
                  <div className="h-10 bg-slate-100 dark:bg-navy-900 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white dark:bg-navy-950 rounded-2xl p-8 sm:p-12 text-center border border-dashed border-slate-300 dark:border-navy-800 space-y-3.5">
              <div className="w-14 h-14 bg-gold-500/10 text-gold-500 rounded-full flex items-center justify-center mx-auto">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-navy-900 dark:text-white">
                No Jobs Match Your Selected Criteria
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                We couldn't find any vacancies matching your combination of filters. Try broadening your location, removing salary restrictions, or clearing filters.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Responsive Job Cards Grid (expands across available width without compression) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4 gap-4.5">
                {paginatedJobs.map((job) => {
                  const saved = savedJobs.includes(job.id);
                  const applied = isApplied(job.id);
                  const isExpired = Boolean(
                    job.closingDate && new Date(job.closingDate).setHours(23, 59, 59, 999) < Date.now()
                  );

                  return (
                    <div
                      key={job.id}
                      onClick={() => setViewJob(job)}
                      className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 p-5 sm:p-5.5 rounded-2xl space-y-3.5 hover:border-gold-500 transition duration-300 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="space-y-3">

                        {/* Top: Title & Company */}
                        <div className="space-y-1 min-w-0">
                          <h3 className="font-serif text-lg font-bold text-navy-950 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition truncate">
                            {job.title}
                          </h3>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                            <span className="truncate">{job.company}</span>
                          </p>
                        </div>

                        {/* Specs Row: Location, Salary, Experience */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                            <span>{job.city ? `${job.city}, ${job.country}` : (job.location || job.country)}</span>
                          </span>
                          <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            💰 {job.salary}
                          </span>
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{job.experience}</span>
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Key Skills Tags */}
                        {job.skills && Array.isArray(job.skills) && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {job.skills.slice(0, 4).map((s, idx) => (
                              <span
                                key={idx}
                                className="bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-navy-800"
                              >
                                {s}
                              </span>
                            ))}
                            {job.skills.length > 4 && (
                              <span className="text-[10px] text-slate-400 font-bold self-center">
                                +{job.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Posted Date & Save / Apply Actions */}
                      <div className="pt-3.5 mt-3 border-t border-slate-100 dark:border-navy-800 flex justify-between items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-medium font-mono shrink-0">
                          Posted: {job.postedDate && !job.postedDate.includes('ago') && job.postedDate.toLowerCase() !== 'just now' ? job.postedDate : '12 Nov 2026'}
                        </span>

                        <div className="flex items-center gap-2">
                          {applied ? (
                            <button
                              disabled
                              onClick={(e) => e.stopPropagation()}
                              className="px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-1 cursor-default shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Applied</span>
                            </button>
                          ) : isExpired ? (
                            <button
                              disabled
                              onClick={(e) => e.stopPropagation()}
                              className="px-3.5 py-1.5 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-400 dark:text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed flex items-center gap-1"
                            >
                              <span>Closed</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleQuickApply(e, job)}
                              className="px-4 py-2 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer flex items-center gap-1"
                            >
                              <span>Apply Now</span>
                              <span>→</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveJob(job.id);
                            }}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-400 hover:text-gold-500 transition cursor-pointer shrink-0"
                            title={saved ? 'Remove bookmark' : 'Bookmark job'}
                          >
                            <Bookmark className={`w-4 h-4 ${saved ? 'fill-gold-500 text-gold-500' : ''}`} />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(p => Math.max(1, p - 1));
                      document.getElementById('jobs-results-header')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-navy-700 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-navy-900 transition flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pNum => {
                      if (
                        pNum === 1 ||
                        pNum === totalPages ||
                        (pNum >= currentPage - 1 && pNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pNum}
                            type="button"
                            onClick={() => {
                              setCurrentPage(pNum);
                              document.getElementById('jobs-results-header')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={`w-7 h-7 rounded-lg font-bold transition cursor-pointer text-xs ${currentPage === pNum
                              ? 'bg-[#102B45] text-white dark:bg-gold-500 dark:text-navy-950 shadow-xs'
                              : 'bg-slate-50 dark:bg-navy-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800'
                              }`}
                          >
                            {pNum}
                          </button>
                        );
                      }
                      if (pNum === currentPage - 2 || pNum === currentPage + 2) {
                        return <span key={pNum} className="text-slate-400 px-1 text-xs">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                      document.getElementById('jobs-results-header')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-navy-700 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-navy-900 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Results Summary Bar (Down of all jobs) */}
              <div className="flex items-center justify-center pt-3 text-xs">
                <p className="text-slate-600 dark:text-slate-400 font-medium text-center">
                  Showing <strong className="font-bold text-navy-950 dark:text-white">{filteredJobs.length}</strong> matching international jobs{' '}
                  <span className="text-slate-400 font-normal">
                    (Page {currentPage} of {totalPages})
                  </span>
                </p>
              </div>

            </div>
          )}

        </main>

      </div>

      {/* ============================================================ */}
      {/* MOBILE FILTER DRAWER (Slide-In on < lg screens only)         */}
      {/* ============================================================ */}
      {mobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-navy-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative ml-auto w-full max-w-sm bg-white dark:bg-navy-950 shadow-2xl h-full flex flex-col z-10 border-l border-slate-200 dark:border-navy-800">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gold-500" />
                <h3 className="font-serif text-base font-bold text-navy-950 dark:text-white">
                  Filters
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {renderFilterContent()}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SAVE SEARCH MODAL                                            */}
      {/* ============================================================ */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-3.5">

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-2.5">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4 text-gold-500" />
                <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white">
                  Save Search Alert
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSearchSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Search Name <span className="text-gold-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dubai Staff Nurse, Saudi Civil Engineer"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Summary of Saved Criteria */}
              <div className="p-2.5 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 space-y-1 text-xs">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Included Criteria:
                </p>
                <div className="flex flex-wrap gap-1 text-[11px]">
                  {keyword && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                      Keyword: "{keyword}"
                    </span>
                  )}
                  {appliedCountries.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                      Countries: {appliedCountries.join(', ')}
                    </span>
                  )}
                  {appliedCities.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                      Cities: {appliedCities.join(', ')}
                    </span>
                  )}
                  {appliedIndustries.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                      Industries: {appliedIndustries.join(', ')}
                    </span>
                  )}
                  {appliedFunctions.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                      Functions: {appliedFunctions.join(', ')}
                    </span>
                  )}
                  {appliedExperienceYears !== null ? (
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                      Exp: {appliedExperienceYears} Yrs
                    </span>
                  ) : appliedExperiences.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                      Exp: {appliedExperiences.join(', ')}
                    </span>
                  )}
                  {(appliedSalaryMin || appliedSalaryMax || appliedSalaryCurrency !== 'All') && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                      Salary: {appliedSalaryMin || '0'}{appliedSalaryMax ? `–${appliedSalaryMax}` : '+'} {appliedSalaryCurrency !== 'All' ? appliedSalaryCurrency : ''}
                    </span>
                  )}
                  {appliedSalaryRanges.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                      Salary: {appliedSalaryRanges.join(', ')}
                    </span>
                  )}
                  {appliedJobTypes.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                      Types: {appliedJobTypes.join(', ')}
                    </span>
                  )}
                  {appliedFilterCount === 0 && (
                    <span className="text-[11px] text-slate-500 italic">
                      All international vacancies
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSearch}
                  className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {savingSearch ? 'Saving...' : 'Save Alert'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW JOB DETAIL MODAL                                        */}
      {/* ============================================================ */}
      {viewJob && (() => {
        const isJobExpired = Boolean(
          viewJob.closingDate && new Date(viewJob.closingDate).setHours(23, 59, 59, 999) < Date.now()
        );
        let benefitsList = [];
        if (Array.isArray(viewJob.benefits)) {
          benefitsList = viewJob.benefits;
        } else if (typeof viewJob.benefits === 'string' && viewJob.benefits.startsWith('[')) {
          try {
            benefitsList = JSON.parse(viewJob.benefits);
          } catch {
            benefitsList = [];
          }
        } else if (typeof viewJob.benefits === 'string' && viewJob.benefits.trim()) {
          benefitsList = viewJob.benefits.split(',').map(s => s.trim()).filter(Boolean);
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 dark:bg-navy-950/80 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-gold-500/30 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] dark:[scrollbar-color:#334155_transparent]">

              {/* MODAL HEADER */}
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-navy-800 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-gold-500/15 text-gold-600 dark:text-gold-400 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                      {viewJob.category || viewJob.industry || 'Executive'}
                    </span>
                    {viewJob.contractType && (
                      <span className="bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {viewJob.contractDuration && viewJob.contractType !== 'Permanent' ? `${viewJob.contractType} (${viewJob.contractDuration})` : viewJob.contractType}
                      </span>
                    )}
                    {viewJob.visaSponsorship === 'Visa sponsorship provided' && (
                      <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        Visa Sponsored
                      </span>
                    )}
                    {isJobExpired ? (
                      <span className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        Closed / Expired
                      </span>
                    ) : viewJob.closingDate ? (
                      <span className="bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 text-xs font-medium px-2.5 py-0.5 rounded-full font-mono">
                        Deadline: {viewJob.closingDate}
                      </span>
                    ) : null}
                    {viewJob.featured && (
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy-950 dark:text-white mt-1 leading-snug">
                    {viewJob.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>{viewJob.company}</span>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{viewJob.city ? `${viewJob.city}, ${viewJob.country}` : (viewJob.location || viewJob.country)}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewJob(null)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-900 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Expired Alert Notice */}
              {isJobExpired && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-700 dark:text-rose-300 flex items-center gap-2.5 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Applications for this vacancy closed on {viewJob.closingDate}. New candidate submissions are disabled.</span>
                </div>
              )}

              {/* 8 STRUCTURED SECTIONS */}
              <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">

                {/* SECTION 1: JOB OVERVIEW */}
                <div className="p-3.5 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200 dark:border-navy-800 space-y-2">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-1.5">
                    <Briefcase className="w-4 h-4 text-gold-500" />
                    <h4 className="font-bold text-navy-950 dark:text-white text-xs uppercase tracking-wider">1. Job Overview</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Destination</p>
                      <p className="font-bold text-slate-900 dark:text-white">{viewJob.country || 'International'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">City / Work Site</p>
                      <p className="font-bold text-slate-900 dark:text-white">{viewJob.city || viewJob.location || 'On-site'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Industry</p>
                      <p className="font-bold text-slate-900 dark:text-white">{viewJob.industry || viewJob.category || 'Executive'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Open Positions</p>
                      <p className="font-bold text-slate-900 dark:text-white">{viewJob.vacancies || '1'} {Number(viewJob.vacancies || 1) > 1 ? 'Vacancies' : 'Vacancy'}</p>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: SALARY AND BENEFITS */}
                <div className="p-3.5 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200 dark:border-navy-800 space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-1.5">
                    <DollarSign className="w-4 h-4 text-gold-500" />
                    <h4 className="font-bold text-navy-950 dark:text-white text-xs uppercase tracking-wider">2. Salary and Benefits</h4>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Offered Monthly Compensation (Tax Free)</p>
                    <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{viewJob.salary}</p>
                  </div>
                  {benefitsList.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-200 dark:border-navy-800/80">
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1.5">Employer Provided Benefits:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {benefitsList.map((benefit, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200">
                            <Check className="w-3 h-3 text-gold-500" />
                            <span>{benefit}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 3: REQUIRED SKILLS AND EXPERIENCE */}
                <div className="p-3.5 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200 dark:border-navy-800 space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-1.5">
                    <Layers className="w-4 h-4 text-gold-500" />
                    <h4 className="font-bold text-navy-950 dark:text-white text-xs uppercase tracking-wider">3. Required Skills and Experience</h4>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Minimum Experience</p>
                    <p className="font-bold text-slate-900 dark:text-white">{viewJob.experience || 'Industry Standard'}</p>
                  </div>
                  {viewJob.skills && Array.isArray(viewJob.skills) && viewJob.skills.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1.5">Key Core Skills:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {viewJob.skills.map((skill, idx) => (
                          <span key={idx} className="bg-slate-200/80 dark:bg-navy-800 text-slate-900 dark:text-slate-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewJob.description && (
                    <div className="pt-1.5 border-t border-slate-200 dark:border-navy-800/80">
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">Role Description:</p>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">{viewJob.description}</p>
                    </div>
                  )}
                </div>

                {/* SECTION 4: QUALIFICATIONS & MANDATORY LICENCES */}
                {(viewJob.educationLevel || viewJob.requiredDegree || viewJob.academicQualifications || viewJob.mandatoryLicences || viewJob.qualification) && (
                  <div className="p-3.5 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200 dark:border-navy-800 space-y-2.5">
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-1.5">
                      <CheckCircle2 className="w-4 h-4 text-gold-500" />
                      <h4 className="font-bold text-navy-950 dark:text-white text-xs uppercase tracking-wider">4. Qualifications & Mandatory Licences</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {viewJob.educationLevel && (
                        <div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Minimum Education Level</p>
                          <p className="font-bold text-slate-900 dark:text-white">{viewJob.educationLevel}</p>
                        </div>
                      )}
                      {viewJob.requiredDegree && (
                        <div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Required Degree / Certification</p>
                          <p className="font-bold text-slate-900 dark:text-white">{viewJob.requiredDegree}</p>
                        </div>
                      )}
                      {viewJob.academicQualifications && (
                        <div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Academic / Professional Credentials</p>
                          <p className="font-bold text-slate-900 dark:text-white">{viewJob.academicQualifications}</p>
                        </div>
                      )}
                      {viewJob.mandatoryLicences && (
                        <div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Mandatory Professional Licences</p>
                          <p className="font-bold text-slate-900 dark:text-white">{viewJob.mandatoryLicences}</p>
                        </div>
                      )}
                    </div>
                    {viewJob.qualification && !viewJob.requiredDegree && (
                      <p className="text-xs text-slate-600 dark:text-slate-300">{viewJob.qualification}</p>
                    )}
                  </div>
                )}

                {/* SECTION 5: EMPLOYMENT TYPE AND CONTRACT LENGTH */}
                <div className="p-3.5 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200 dark:border-navy-800 space-y-2">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-1.5">
                    <Clock className="w-4 h-4 text-gold-500" />
                    <h4 className="font-bold text-navy-950 dark:text-white text-xs uppercase tracking-wider">5. Employment Type and Contract Length</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Contract Type</p>
                      <p className="font-bold text-slate-900 dark:text-white">{viewJob.contractType || viewJob.jobType || 'Permanent'}</p>
                    </div>
                    {viewJob.contractDuration && viewJob.contractType !== 'Permanent' && (
                      <div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Contract Duration</p>
                        <p className="font-bold text-slate-900 dark:text-white">{viewJob.contractDuration}</p>
                      </div>
                    )}
                    {viewJob.contractRenewal && (
                      <div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Renewal Possibility</p>
                        <p className="font-bold text-slate-900 dark:text-white">{viewJob.contractRenewal}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 6: ACCOMMODATION AND TRANSPORTATION */}
                {(viewJob.accommodation || viewJob.transportation || viewJob.livingAllowancesDetails) && (
                  <div className="p-3.5 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200 dark:border-navy-800 space-y-2">
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-1.5">
                      <Building2 className="w-4 h-4 text-gold-500" />
                      <h4 className="font-bold text-navy-950 dark:text-white text-xs uppercase tracking-wider">6. Accommodation and Transportation</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {viewJob.accommodation && (
                        <div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Accommodation Status</p>
                          <p className="font-bold text-slate-900 dark:text-white">{viewJob.accommodation}</p>
                        </div>
                      )}
                      {viewJob.transportation && (
                        <div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Transportation Status</p>
                          <p className="font-bold text-slate-900 dark:text-white">{viewJob.transportation}</p>
                        </div>
                      )}
                    </div>
                    {viewJob.livingAllowancesDetails && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-navy-800/80">
                        <strong>Living Allowance Specifics:</strong> {viewJob.livingAllowancesDetails}
                      </p>
                    )}
                  </div>
                )}

                {/* SECTION 7: VISA SPONSORSHIP */}
                <div className="p-3.5 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200 dark:border-navy-800 space-y-2">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-1.5">
                    <Globe className="w-4 h-4 text-gold-500" />
                    <h4 className="font-bold text-navy-950 dark:text-white text-xs uppercase tracking-wider">7. Visa Sponsorship & Work Authorisation</h4>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Sponsorship Status</p>
                    <p className="font-bold text-slate-900 dark:text-white">{viewJob.visaSponsorship || 'Sponsorship details to be confirmed'}</p>
                  </div>
                  {viewJob.visaSupportDetails && (
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <strong>Employer Support:</strong> {viewJob.visaSupportDetails}
                    </p>
                  )}
                  <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-800 dark:text-blue-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Immigration Regulatory Disclaimer:</strong> Work visa issuance is subject to destination immigration authority approval and candidate background clearance.
                    </span>
                  </div>
                </div>

                {/* SECTION 8: APPLICATION DEADLINE & STATUS */}
                <div className="p-3.5 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200 dark:border-navy-800 space-y-2">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-1.5">
                    <Calendar className="w-4 h-4 text-gold-500" />
                    <h4 className="font-bold text-navy-950 dark:text-white text-xs uppercase tracking-wider">8. Application Deadline</h4>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Closing Date (23:59:59 Local Time)</p>
                      <p className="font-bold text-slate-900 dark:text-white font-mono text-sm">{viewJob.closingDate || 'Open until filled'}</p>
                    </div>
                    <div>
                      {isJobExpired ? (
                        <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 font-bold text-xs">
                          Closed / Expired
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs">
                          Actively Recruiting
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* FOOTER BUTTONS */}
              <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-navy-800 items-center">
                <button
                  type="button"
                  onClick={() => setViewJob(null)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-navy-900 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
                {isApplied(viewJob.id) ? (
                  <button
                    disabled
                    className="flex-1 py-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-default"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Applied</span>
                  </button>
                ) : isJobExpired ? (
                  <button
                    disabled
                    className="flex-1 py-2.5 bg-slate-200 dark:bg-navy-800 text-slate-400 dark:text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed text-center"
                  >
                    Applications Closed
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const j = viewJob;
                      setViewJob(null);
                      if (!user || !user.email) {
                        setPendingJobToApply(j);
                        openAuthModal('register', 'candidate');
                        return;
                      }
                      setApplyJob(j);
                      setAppliedSuccess(false);
                    }}
                    className="flex-1 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer"
                  >
                    Apply for Position →
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveJob(viewJob.id);
                  }}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-400 hover:text-gold-500 transition cursor-pointer shrink-0"
                  title={isSaved(viewJob.id) ? 'Remove bookmark' : 'Bookmark job'}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved(viewJob.id) ? 'fill-gold-500 text-gold-500' : ''}`} />
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Quick Apply Modal */}
      {applyJob && (
        <QuickApplyModal
          key={applyJob.id}
          job={applyJob}
          isOpen={Boolean(applyJob)}
          onClose={() => setApplyJob(null)}
          onSuccess={() => {
            fetchJobs();
            syncAppliedJobsFromDb();
          }}
        />
      )}

      {/* ============================================================ */}
      {/* NAUKRI-STYLE FILTER SELECTION POPUP MODAL                     */}
      {/* ============================================================ */}
      {popupCategory && popupConfig && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-900/60 dark:bg-navy-950/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={closeFilterPopup}
        >
          <div
            className="relative w-full max-w-[920px] max-h-[80vh] bg-white dark:bg-navy-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-navy-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-popup-title"
          >
            {/* 1. Fixed Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-navy-800 space-y-3 bg-white dark:bg-navy-950 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gold-500/15 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0">
                    {React.createElement(popupConfig.icon, { className: 'w-4 h-4' })}
                  </div>
                  <div>
                    <h3 id="filter-popup-title" className="font-serif text-lg sm:text-xl font-bold text-navy-950 dark:text-white leading-tight">
                      {popupConfig.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Select one or more options to filter available jobs
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeFilterPopup}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-900 transition cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Real-time Search Input beneath Title */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  placeholder={popupConfig.placeholder || `Search ${popupConfig.title}...`}
                  value={popupSearchQuery}
                  onChange={(e) => setPopupSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyFilterPopup();
                    }
                  }}
                  className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-gold-500 transition"
                />
                {popupSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setPopupSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Scrollable Body with 3-Column Horizontal Desktop Grid */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 md:p-6 min-h-[220px] max-h-[56vh] [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] dark:[scrollbar-color:#334155_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
              {(() => {
                const query = popupSearchQuery.trim().toLowerCase();
                const filtered = query
                  ? popupConfig.items.filter(item => item.toLowerCase().includes(query))
                  : popupConfig.items;

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-navy-900 text-slate-400 flex items-center justify-center mx-auto">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        No options found matching "{popupSearchQuery}"
                      </p>
                      <button
                        type="button"
                        onClick={() => setPopupSearchQuery('')}
                        className="text-xs text-gold-600 dark:text-gold-400 font-bold hover:underline cursor-pointer"
                      >
                        Clear search filter
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-4 sm:gap-x-5 gap-y-2.5">
                    {filtered.map(item => {
                      const checked = tempSelected.includes(item);
                      const count = popupConfig.counts[item] || 0;

                      return (
                        <label
                          key={item}
                          className={`flex items-center gap-2.5 py-2 px-3 rounded-xl cursor-pointer select-none border transition ${checked
                            ? 'bg-gold-500/10 border-gold-500/40 text-navy-950 dark:text-gold-300 font-bold shadow-2xs'
                            : 'bg-slate-50/50 dark:bg-navy-900/40 border-slate-200/80 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-navy-900 hover:border-slate-300 dark:hover:border-navy-700'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTempItem(item)}
                            className="w-4 h-4 rounded text-[#102B45] focus:ring-gold-500 accent-[#102B45] cursor-pointer shrink-0"
                          />
                          <span className="text-xs break-words min-w-0 flex-1 leading-snug">
                            {item}
                          </span>
                          {count > 0 && (
                            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0 ml-auto pl-1">
                              ({count})
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* 3. Fixed Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900/60 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={applyFilterPopup}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#102B45] hover:bg-[#0c2236] text-white dark:bg-gold-500 dark:hover:bg-gold-400 dark:text-navy-950 font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Apply Filters</span>
                {tempSelected.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 dark:bg-navy-950/20 text-[11px] font-extrabold">
                    ({tempSelected.length})
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
