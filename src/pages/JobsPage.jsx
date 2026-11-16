import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search, MapPin, Briefcase, DollarSign, Globe, CheckCircle2,
  Bookmark, ArrowRight, Filter, X, Sparkles, SlidersHorizontal,
  RotateCcw, ChevronLeft, ChevronRight, BookmarkPlus, Check,
  Building2, Layers, Clock, AlertCircle, Tag, ChevronDown,
  ChevronUp, ArrowUpDown, Sliders
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

export const SORT_OPTIONS = [
  { id: 'latest', label: 'Latest' },
  { id: 'relevant', label: 'Most Relevant' },
  { id: 'salary-high', label: 'Salary: High to Low' },
  { id: 'salary-low', label: 'Salary: Low to High' }
];

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
  if (fe.includes('5–10') || fe.includes('5-10')) {
    if (je.includes('5+') || je.includes('5 - 8') || je.includes('5 - 9') || je.includes('6 - 10') || je.includes('7 - 10') || je.includes('8 - 12')) return true;
  }
  if (fe.includes('10+') || fe.includes('10+ years')) {
    if (je.includes('10+') || je.includes('10 - 15') || je.includes('8 - 14') || je.includes('8 - 12')) return true;
  }
  return je.includes(fe);
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

  // --- FILTER STATES (Supports multi-select within category) ---
  const [keyword, setKeyword] = useState('');
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState(selectedCategory && selectedCategory !== 'All' ? [selectedCategory] : []);
  const [selectedFunctions, setSelectedFunctions] = useState([]);
  const [selectedExperiences, setSelectedExperiences] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryCurrency, setSalaryCurrency] = useState('All');
  const [sortBy, setSortBy] = useState('latest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Mobile drawer filter toggle
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Accordion collapsible sections
  const [openSections, setOpenSections] = useState({
    country: true,
    city: true,
    industry: true,
    function: true,
    experience: true,
    salary: true,
    jobType: true
  });

  const toggleSection = (sectionKey) => {
    setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  // City list search within sidebar
  const [citySearchQuery, setCitySearchQuery] = useState('');

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

  const isApplied = (jobId) => applications.some(a => a.jobId === jobId);

  // Available Cities based on selected countries
  const availableCities = useMemo(() => {
    if (selectedCountries.length === 0) {
      return ALL_CITIES;
    }
    const citiesSet = new Set();
    selectedCountries.forEach(country => {
      const cities = COUNTRY_CITY_MAP[country] || [];
      cities.forEach(c => citiesSet.add(c));
    });
    return Array.from(citiesSet).sort();
  }, [selectedCountries]);

  // Filtered cities list for city search input in sidebar
  const filteredAvailableCities = useMemo(() => {
    if (!citySearchQuery.trim()) return availableCities;
    return availableCities.filter(c => c.toLowerCase().includes(citySearchQuery.toLowerCase()));
  }, [availableCities, citySearchQuery]);

  // Clean invalid cities if country selection changes
  const toggleCountry = (country) => {
    setSelectedCountries(prev => {
      const next = prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country];
      // prune cities if needed
      if (next.length > 0) {
        const allowedCities = new Set();
        next.forEach(cntry => {
          (COUNTRY_CITY_MAP[cntry] || []).forEach(ci => allowedCities.add(ci));
        });
        setSelectedCities(currCities => currCities.filter(ci => allowedCities.has(ci)));
      }
      return next;
    });
    setCurrentPage(1);
  };

  const toggleCity = (city) => {
    setSelectedCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
    setCurrentPage(1);
  };

  const toggleIndustry = (ind) => {
    setSelectedIndustries(prev => prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]);
    setCurrentPage(1);
  };

  const toggleFunction = (fn) => {
    setSelectedFunctions(prev => prev.includes(fn) ? prev.filter(f => f !== fn) : [...prev, fn]);
    setCurrentPage(1);
  };

  const toggleExperience = (exp) => {
    setSelectedExperiences(prev => prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp]);
    setCurrentPage(1);
  };

  const toggleJobType = (jt) => {
    setSelectedJobTypes(prev => prev.includes(jt) ? prev.filter(t => t !== jt) : [...prev, jt]);
    setCurrentPage(1);
  };

  // Restore Search Criteria dispatched from CandidatePortal
  useEffect(() => {
    if (activeSearchCriteria) {
      if (activeSearchCriteria.keyword !== undefined) setKeyword(activeSearchCriteria.keyword || '');

      if (activeSearchCriteria.country) {
        setSelectedCountries(activeSearchCriteria.country === 'All' ? [] : (Array.isArray(activeSearchCriteria.country) ? activeSearchCriteria.country : activeSearchCriteria.country.split(',').map(s => s.trim())));
      }
      if (activeSearchCriteria.city) {
        setSelectedCities(activeSearchCriteria.city === 'All' ? [] : (Array.isArray(activeSearchCriteria.city) ? activeSearchCriteria.city : activeSearchCriteria.city.split(',').map(s => s.trim())));
      }
      if (activeSearchCriteria.industry) {
        setSelectedIndustries(activeSearchCriteria.industry === 'All' ? [] : (Array.isArray(activeSearchCriteria.industry) ? activeSearchCriteria.industry : activeSearchCriteria.industry.split(',').map(s => s.trim())));
      }
      if (activeSearchCriteria.function) {
        setSelectedFunctions(activeSearchCriteria.function === 'All' ? [] : (Array.isArray(activeSearchCriteria.function) ? activeSearchCriteria.function : activeSearchCriteria.function.split(',').map(s => s.trim())));
      }
      if (activeSearchCriteria.experience) {
        setSelectedExperiences(activeSearchCriteria.experience === 'All' ? [] : (Array.isArray(activeSearchCriteria.experience) ? activeSearchCriteria.experience : activeSearchCriteria.experience.split(',').map(s => s.trim())));
      }
      if (activeSearchCriteria.salaryMin !== undefined) setSalaryMin(activeSearchCriteria.salaryMin || '');
      if (activeSearchCriteria.salaryMax !== undefined) setSalaryMax(activeSearchCriteria.salaryMax || '');
      if (activeSearchCriteria.salaryCurrency !== undefined) setSalaryCurrency(activeSearchCriteria.salaryCurrency || 'All');
      if (activeSearchCriteria.jobType) {
        setSelectedJobTypes(activeSearchCriteria.jobType === 'All' ? [] : (Array.isArray(activeSearchCriteria.jobType) ? activeSearchCriteria.jobType : activeSearchCriteria.jobType.split(',').map(s => s.trim())));
      }
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
    if (selectedCategory && selectedCategory !== 'All' && selectedIndustries.length === 0) {
      setSelectedIndustries([selectedCategory]);
    }
  }, [selectedCategory]);

  // Fetch all jobs from backend API or fallback mock
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    let apiJobs = [];
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (selectedCountries.length > 0) params.append('country', selectedCountries.join(','));
      if (selectedCities.length > 0) params.append('city', selectedCities.join(','));
      if (selectedIndustries.length > 0) params.append('industry', selectedIndustries.join(','));
      if (selectedFunctions.length > 0) params.append('function', selectedFunctions.join(','));
      if (selectedExperiences.length > 0) params.append('experience', selectedExperiences.join(','));
      if (selectedJobTypes.length > 0) params.append('jobType', selectedJobTypes.join(','));
      if (salaryMin !== '') params.append('minSalary', salaryMin);
      if (salaryMax !== '') params.append('maxSalary', salaryMax);
      if (salaryCurrency !== 'All') params.append('currency', salaryCurrency);
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

    // Combine newly posted jobs (from local state/context) with server or mock dataset
    const allCombined = [...postedJobs];
    const baseList = apiJobs.length > 0 ? apiJobs : JOBS_LIST;
    baseList.forEach(item => {
      if (!allCombined.some(existing => existing.id === item.id)) {
        allCombined.push(item);
      }
    });

    setRawJobs(allCombined);
    setLoading(false);
  }, [keyword, selectedCountries, selectedCities, selectedIndustries, selectedFunctions, selectedExperiences, selectedJobTypes, salaryMin, salaryMax, salaryCurrency, sortBy, postedJobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Multi-Filter Matching Engine (AND logic between categories, OR logic within category)
  const filteredJobs = useMemo(() => {
    let result = rawJobs.filter(j => {
      // 1. Keyword search (title, company, description, skills)
      if (keyword.trim()) {
        const kw = keyword.toLowerCase().trim();
        const matchTitle = (j.title || '').toLowerCase().includes(kw);
        const matchComp = (j.company || '').toLowerCase().includes(kw);
        const matchDesc = (j.description || '').toLowerCase().includes(kw);
        const matchSkills = j.skills && j.skills.some(s => String(s).toLowerCase().includes(kw));
        if (!matchTitle && !matchComp && !matchDesc && !matchSkills) return false;
      }

      // 2. Country (OR among selected countries)
      if (selectedCountries.length > 0) {
        const jCountry = (j.country || '').toLowerCase();
        const matchesCountry = selectedCountries.some(c => jCountry === c.toLowerCase());
        if (!matchesCountry) return false;
      }

      // 3. City (OR among selected cities)
      if (selectedCities.length > 0) {
        const jCity = (j.city || '').toLowerCase();
        const jLoc = (j.location || '').toLowerCase();
        const matchesCity = selectedCities.some(c => {
          const ckw = c.toLowerCase();
          return jCity.includes(ckw) || jLoc.includes(ckw);
        });
        if (!matchesCity) return false;
      }

      // 4. Industry (OR among selected industries)
      if (selectedIndustries.length > 0) {
        const jInd = (j.industry || '').toLowerCase();
        const jCat = (j.category || '').toLowerCase();
        const matchesInd = selectedIndustries.some(ind => {
          const ikw = ind.toLowerCase();
          return jInd.includes(ikw) || jCat.includes(ikw) || ikw.includes(jCat);
        });
        if (!matchesInd) return false;
      }

      // 5. Function (OR among selected functions)
      if (selectedFunctions.length > 0) {
        const jFn = (j.function || '').toLowerCase();
        const jTitle = (j.title || '').toLowerCase();
        const matchesFn = selectedFunctions.some(fn => {
          const fkw = fn.toLowerCase();
          return jFn.includes(fkw) || jTitle.includes(fkw);
        });
        if (!matchesFn) return false;
      }

      // 6. Experience (OR among selected experiences)
      if (selectedExperiences.length > 0) {
        const matchesExp = selectedExperiences.some(exp => matchExperienceOption(j.experience, exp));
        if (!matchesExp) return false;
      }

      // 7. Salary Currency
      if (salaryCurrency && salaryCurrency !== 'All') {
        const jCurr = j.currency || (j.salary ? j.salary.split(' ')[0] : '');
        if (jCurr && !jCurr.toUpperCase().includes(salaryCurrency.toUpperCase()) && !(j.salary || '').toUpperCase().includes(salaryCurrency.toUpperCase())) {
          return false;
        }
      }

      // 8. Salary Range
      const minVal = salaryMin !== '' && !isNaN(Number(salaryMin)) ? Number(salaryMin) : null;
      const maxVal = salaryMax !== '' && !isNaN(Number(salaryMax)) ? Number(salaryMax) : null;
      if (minVal !== null || maxVal !== null) {
        const jMin = j.minSalary != null ? Number(j.minSalary) : null;
        const jMax = j.maxSalary != null ? Number(j.maxSalary) : null;
        if (jMin != null && maxVal != null && jMin > maxVal) return false;
        if (jMax != null && minVal != null && jMax < minVal) return false;
      }

      // 9. Job Type (OR among selected types)
      if (selectedJobTypes.length > 0) {
        const jt = (j.jobType || '').toLowerCase();
        const matchesType = selectedJobTypes.some(t => {
          const tkw = t.toLowerCase();
          if (tkw === 'remote') {
            return jt.includes('remote') || (j.location && j.location.toLowerCase().includes('remote'));
          }
          return jt === tkw;
        });
        if (!matchesType) return false;
      }

      return true;
    });

    // Client-side Sort
    if (sortBy === 'salary-high') {
      result.sort((a, b) => (Number(b.maxSalary || b.minSalary || 0) - Number(a.maxSalary || a.minSalary || 0)));
    } else if (sortBy === 'salary-low') {
      result.sort((a, b) => (Number(a.minSalary || a.maxSalary || 0) - Number(b.minSalary || b.maxSalary || 0)));
    } else if (sortBy === 'relevant') {
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    } else {
      // 'latest' default
      result.sort((a, b) => (b.id > a.id ? 1 : -1));
    }

    return result;
  }, [rawJobs, keyword, selectedCountries, selectedCities, selectedIndustries, selectedFunctions, selectedExperiences, salaryMin, salaryMax, salaryCurrency, selectedJobTypes, sortBy]);

  // Paginated View
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage, pageSize]);

  // Count active filter criteria
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (keyword) count++;
    count += selectedCountries.length;
    count += selectedCities.length;
    count += selectedIndustries.length;
    count += selectedFunctions.length;
    count += selectedExperiences.length;
    count += selectedJobTypes.length;
    if (salaryCurrency && salaryCurrency !== 'All') count++;
    if (salaryMin !== '' && salaryMin !== undefined) count++;
    if (salaryMax !== '' && salaryMax !== undefined) count++;
    return count;
  }, [keyword, selectedCountries, selectedCities, selectedIndustries, selectedFunctions, selectedExperiences, selectedJobTypes, salaryCurrency, salaryMin, salaryMax]);

  // Clear / Reset All Filters
  const clearAllFilters = () => {
    setKeyword('');
    setSelectedCountries([]);
    setSelectedCities([]);
    setSelectedIndustries([]);
    setSelectedFunctions([]);
    setSelectedExperiences([]);
    setSelectedJobTypes([]);
    setSalaryMin('');
    setSalaryMax('');
    setSalaryCurrency('All');
    setSortBy('latest');
    setCurrentPage(1);
    setLoadedSavedSearchName('');
    if (setSelectedCategory) setSelectedCategory('All');
  };

  // Open Save Search Modal
  const handleOpenSaveSearch = () => {
    if (!user) {
      openAuthModal('login', 'candidate');
      return;
    }

    const parts = [];
    if (selectedIndustries.length > 0) parts.push(selectedIndustries.join(', '));
    if (selectedFunctions.length > 0) parts.push(selectedFunctions.join(', '));
    if (keyword) parts.push(`"${keyword}"`);
    if (selectedCities.length > 0) parts.push(selectedCities.join(', '));
    else if (selectedCountries.length > 0) parts.push(selectedCountries.join(', '));

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
      country: selectedCountries.join(','),
      city: selectedCities.join(','),
      industry: selectedIndustries.join(','),
      function: selectedFunctions.join(','),
      experience: selectedExperiences.join(','),
      salaryMin,
      salaryMax,
      salaryCurrency,
      jobType: selectedJobTypes.join(','),
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

  // Auto-apply when user registers or logs in with a pending job
  useEffect(() => {
    if (user && user.email && pendingJobToApply) {
      const targetJob = pendingJobToApply;
      setPendingJobToApply(null);
      applyForJob(targetJob);
      setApplyJob(targetJob);
      setAppliedSuccess(true);
    }
  }, [user, pendingJobToApply]);

  const handleQuickApply = (e, job) => {
    e.stopPropagation();
    setApplyJob(job);
    setAppliedSuccess(false);
  };

  // Sidebar Filter Content (Reusable between Desktop Sticky Sidebar & Mobile Drawer)
  const renderSidebarContent = () => (
    <div className="space-y-5">

      {/* 1. Sidebar Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gold-500/15 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white leading-none">
              Filter Jobs
            </h3>
            {activeFilterCount > 0 && (
              <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400">
                {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer transition"
            title="Reset all filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 2. Country Section */}
      <div className="border-b border-slate-100 dark:border-navy-800/80 pb-4">
        <button
          type="button"
          onClick={() => toggleSection('country')}
          className="w-full flex items-center justify-between text-xs font-bold text-navy-950 dark:text-white py-1 hover:text-gold-500 transition cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-gold-500" />
            <span>Country</span>
            {selectedCountries.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 text-[10px] flex items-center justify-center">
                {selectedCountries.length}
              </span>
            )}
          </span>
          {openSections.country ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.country && (
          <div className="mt-2.5 space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
            {COUNTRIES.map(country => {
              const checked = selectedCountries.includes(country);
              return (
                <label
                  key={country}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition select-none ${checked
                    ? 'bg-gold-500/15 text-navy-950 dark:text-gold-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-900 font-medium'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCountry(country)}
                      className="w-3.5 h-3.5 rounded text-navy-900 focus:ring-gold-500 accent-[#102B45] cursor-pointer"
                    />
                    <span>{country}</span>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. City Section (Dynamic based on selected country) */}
      <div className="border-b border-slate-100 dark:border-navy-800/80 pb-4">
        <button
          type="button"
          onClick={() => toggleSection('city')}
          className="w-full flex items-center justify-between text-xs font-bold text-navy-950 dark:text-white py-1 hover:text-gold-500 transition cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gold-500" />
            <span>City {selectedCountries.length > 0 ? `(${selectedCountries.join(', ')})` : ''}</span>
            {selectedCities.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 text-[10px] flex items-center justify-center">
                {selectedCities.length}
              </span>
            )}
          </span>
          {openSections.city ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.city && (
          <div className="mt-2.5 space-y-2">
            {availableCities.length > 6 && (
              <input
                type="text"
                placeholder="Search cities..."
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-xs focus:outline-none focus:border-gold-500"
              />
            )}
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-xs">
              {filteredAvailableCities.map(city => {
                const checked = selectedCities.includes(city);
                return (
                  <label
                    key={city}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition select-none ${checked
                      ? 'bg-gold-500/15 text-navy-950 dark:text-gold-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-900 font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCity(city)}
                        className="w-3.5 h-3.5 rounded text-navy-900 focus:ring-gold-500 accent-[#102B45] cursor-pointer"
                      />
                      <span>{city}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Industry Section */}
      <div className="border-b border-slate-100 dark:border-navy-800/80 pb-4">
        <button
          type="button"
          onClick={() => toggleSection('industry')}
          className="w-full flex items-center justify-between text-xs font-bold text-navy-950 dark:text-white py-1 hover:text-gold-500 transition cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-gold-500" />
            <span>Industry</span>
            {selectedIndustries.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 text-[10px] flex items-center justify-center">
                {selectedIndustries.length}
              </span>
            )}
          </span>
          {openSections.industry ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.industry && (
          <div className="mt-2.5 space-y-1 max-h-48 overflow-y-auto pr-1 text-xs">
            {INDUSTRIES.map(ind => {
              const checked = selectedIndustries.includes(ind);
              return (
                <label
                  key={ind}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition select-none ${checked
                    ? 'bg-gold-500/15 text-navy-950 dark:text-gold-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-900 font-medium'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleIndustry(ind)}
                      className="w-3.5 h-3.5 rounded text-navy-900 focus:ring-gold-500 accent-[#102B45] cursor-pointer"
                    />
                    <span>{ind}</span>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Function / Department Section */}
      <div className="border-b border-slate-100 dark:border-navy-800/80 pb-4">
        <button
          type="button"
          onClick={() => toggleSection('function')}
          className="w-full flex items-center justify-between text-xs font-bold text-navy-950 dark:text-white py-1 hover:text-gold-500 transition cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-gold-500" />
            <span>Function / Department</span>
            {selectedFunctions.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 text-[10px] flex items-center justify-center">
                {selectedFunctions.length}
              </span>
            )}
          </span>
          {openSections.function ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.function && (
          <div className="mt-2.5 space-y-1 max-h-48 overflow-y-auto pr-1 text-xs">
            {FUNCTIONS.map(fn => {
              const checked = selectedFunctions.includes(fn);
              return (
                <label
                  key={fn}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition select-none ${checked
                    ? 'bg-gold-500/15 text-navy-950 dark:text-gold-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-900 font-medium'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFunction(fn)}
                      className="w-3.5 h-3.5 rounded text-navy-900 focus:ring-gold-500 accent-[#102B45] cursor-pointer"
                    />
                    <span>{fn}</span>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Experience Level Section */}
      <div className="border-b border-slate-100 dark:border-navy-800/80 pb-4">
        <button
          type="button"
          onClick={() => toggleSection('experience')}
          className="w-full flex items-center justify-between text-xs font-bold text-navy-950 dark:text-white py-1 hover:text-gold-500 transition cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gold-500" />
            <span>Experience Level</span>
            {selectedExperiences.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 text-[10px] flex items-center justify-center">
                {selectedExperiences.length}
              </span>
            )}
          </span>
          {openSections.experience ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.experience && (
          <div className="mt-2.5 space-y-1 text-xs">
            {EXPERIENCE_LEVELS.map(exp => {
              const checked = selectedExperiences.includes(exp);
              return (
                <label
                  key={exp}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition select-none ${checked
                    ? 'bg-gold-500/15 text-navy-950 dark:text-gold-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-900 font-medium'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleExperience(exp)}
                      className="w-3.5 h-3.5 rounded text-navy-900 focus:ring-gold-500 accent-[#102B45] cursor-pointer"
                    />
                    <span>{exp}</span>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Salary Range & Currency Section */}
      <div className="border-b border-slate-100 dark:border-navy-800/80 pb-4">
        <button
          type="button"
          onClick={() => toggleSection('salary')}
          className="w-full flex items-center justify-between text-xs font-bold text-navy-950 dark:text-white py-1 hover:text-gold-500 transition cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-gold-500" />
            <span>Salary Range</span>
            {(salaryMin || salaryMax || salaryCurrency !== 'All') && (
              <span className="w-2 h-2 rounded-full bg-gold-500" />
            )}
          </span>
          {openSections.salary ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.salary && (
          <div className="mt-2.5 space-y-2.5 text-xs">
            {/* Currency selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">Currency</label>
              <select
                value={salaryCurrency}
                onChange={(e) => {
                  setSalaryCurrency(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-gold-500 font-semibold"
              >
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Currencies' : c}</option>
                ))}
              </select>
            </div>

            {/* Min - Max Inputs */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">Monthly Compensation</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={salaryMin}
                  onChange={(e) => {
                    setSalaryMin(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-1/2 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-gold-500"
                />
                <span className="text-slate-400 font-bold">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={salaryMax}
                  onChange={(e) => {
                    setSalaryMax(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-1/2 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            {/* Quick Range Presets */}
            <div className="flex flex-wrap gap-1 pt-1">
              {[
                { label: '< 10k', min: '', max: '10000' },
                { label: '10k–20k', min: '10000', max: '20000' },
                { label: '20k–35k', min: '20000', max: '35000' },
                { label: '35k+', min: '35000', max: '' }
              ].map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setSalaryMin(preset.min);
                    setSalaryMax(preset.max);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition cursor-pointer ${salaryMin === preset.min && salaryMax === preset.max
                    ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 border-transparent'
                    : 'bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-800 hover:border-gold-500'
                    }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 8. Job Type Section */}
      <div className="pb-2">
        <button
          type="button"
          onClick={() => toggleSection('jobType')}
          className="w-full flex items-center justify-between text-xs font-bold text-navy-950 dark:text-white py-1 hover:text-gold-500 transition cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-gold-500" />
            <span>Job Type</span>
            {selectedJobTypes.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 text-[10px] flex items-center justify-center">
                {selectedJobTypes.length}
              </span>
            )}
          </span>
          {openSections.jobType ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.jobType && (
          <div className="mt-2.5 space-y-1 text-xs">
            {JOB_TYPES.map(jt => {
              const checked = selectedJobTypes.includes(jt);
              return (
                <label
                  key={jt}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition select-none ${checked
                    ? 'bg-gold-500/15 text-navy-950 dark:text-gold-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-900 font-medium'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleJobType(jt)}
                      className="w-3.5 h-3.5 rounded text-navy-900 focus:ring-gold-500 accent-[#102B45] cursor-pointer"
                    />
                    <span>{jt}</span>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 9. Sidebar Sticky Action Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-navy-800 space-y-2">
        <button
          type="button"
          onClick={() => {
            fetchJobs();
            setMobileFilterOpen(false);
            document.getElementById('jobs-results-header')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full py-3 px-4 rounded-2xl bg-[#102B45] hover:bg-[#0c2236] dark:bg-gold-500 dark:hover:bg-gold-400 text-white dark:text-navy-950 font-bold text-xs shadow-md transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Apply Filters ({filteredJobs.length} Jobs)</span>
        </button>

        <button
          type="button"
          onClick={clearAllFilters}
          className="w-full py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          Clear All
        </button>
      </div>

    </div>
  );

  return (
    <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-6 xl:px-8 py-6 sm:py-8 space-y-6">
      <SEO
        title="Global Job Openings & Executive Vacancies | Revival International"
        description="Search verified international vacancies across Dubai, GCC, Europe, and Asia in Oil & Gas, Healthcare, Construction, Finance, and IT with full visa sponsorship support."
        canonicalPath="jobs"
        keywords="international jobs Dubai, GCC executive vacancies, overseas recruitment Dubai, Dubai engineering jobs, healthcare jobs Middle East"
        breadcrumbs={[
          { name: 'Home', item: '' },
          { name: 'Job Opportunities', item: 'jobs' }
        ]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Global Job Openings & Executive Vacancies',
          description: 'Verified international employment listings across the UAE, GCC, UK, Europe, and Asia.',
          url: 'https://www.revivalinternational.com/jobs'
        }}
      />

      {/* Page Header */}
      <ScrollReveal>
        <div className="text-center space-y-2 max-w-4xl mx-auto py-1">
          <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
            {t('jobs.badge')}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-900 dark:text-white">
            {t('jobs.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {t('jobs.subtitle')}
          </p>
        </div>
      </ScrollReveal>

      {/* Restored Saved Search Toast */}
      {loadedSavedSearchName && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
            <Bookmark className="w-4 h-4 text-gold-500 shrink-0" />
            <span>Active Saved Search: <strong>{loadedSavedSearchName}</strong></span>
          </div>
          <button
            onClick={() => setLoadedSavedSearchName('')}
            className="text-amber-700 dark:text-amber-400 hover:text-amber-950 dark:hover:text-white text-xs font-semibold px-2 py-1 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Save Success Alert */}
      {saveSuccessToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{saveSuccessToast}</span>
          </div>
          <button
            onClick={() => setSaveSuccessToast('')}
            className="text-emerald-700 dark:text-emerald-300 p-1 hover:opacity-80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Filter Trigger Bar (Visible only on < lg) */}
      <div className="lg:hidden flex items-center justify-between gap-3 bg-white dark:bg-navy-950 p-3.5 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="flex-1 py-2.5 px-4 rounded-xl bg-[#102B45] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-gold-400" />
          <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
        </button>

        <button
          onClick={handleOpenSaveSearch}
          className="py-2.5 px-3.5 rounded-xl border border-gold-500/40 bg-gold-500/10 text-gold-700 dark:text-gold-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <BookmarkPlus className="w-4 h-4 text-gold-500" />
          <span>Save</span>
        </button>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT: Expanded to full width with responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)] 2xl:grid-cols-[330px_minmax(0,1fr)] gap-5 xl:gap-6 items-start w-full">

        {/* ============================================================ */}
        {/* LEFT COLUMN: DESKTOP STICKY FILTER SIDEBAR                   */}
        {/* ============================================================ */}
        <aside className="hidden lg:block w-full shrink-0 sticky top-20 self-start max-h-[calc(100vh-5.5rem)] overflow-y-auto pr-1 z-10">
          <div className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-sm p-4.5">
            {renderSidebarContent()}
          </div>
        </aside>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: JOB SEARCH RESULTS SECTION                     */}
        {/* ============================================================ */}
        <main className="min-w-0 w-full space-y-5">

          {/* Top Search & Controls Bar */}
          <div id="jobs-results-header" className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Keyword Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search by job title, company name, skills (e.g. 'Software Engineer', 'ICU Nurse')..."
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-2xl pl-10 pr-9 py-2.5 text-xs focus:outline-none focus:border-gold-500 transition shadow-inner font-medium"
                />
                {keyword && (
                  <button
                    onClick={() => { setKeyword(''); setCurrentPage(1); }}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Save Search Button (Desktop) */}
              <button
                onClick={handleOpenSaveSearch}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-gold-500/40 bg-gold-500/10 hover:bg-gold-500/20 text-gold-700 dark:text-gold-300 font-bold text-xs shrink-0 cursor-pointer transition shadow-xs"
                title="Save this search criteria to candidate account"
              >
                <BookmarkPlus className="w-4 h-4 text-gold-500" />
                <span>Save Search</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden md:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters as Removable Chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-navy-800 text-xs">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Active:</span>

                {keyword && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gold-500/15 text-gold-800 dark:text-gold-300 border border-gold-500/30">
                    <span>"{keyword}"</span>
                    <button onClick={() => { setKeyword(''); setCurrentPage(1); }} className="hover:text-gold-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedCountries.map(c => (
                  <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                    <span>{c}</span>
                    <button onClick={() => toggleCountry(c)} className="hover:text-blue-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {selectedCities.map(ci => (
                  <span key={ci} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                    <span>{ci}</span>
                    <button onClick={() => toggleCity(ci)} className="hover:text-indigo-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {selectedIndustries.map(ind => (
                  <span key={ind} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    <span>{ind}</span>
                    <button onClick={() => toggleIndustry(ind)} className="hover:text-emerald-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {selectedFunctions.map(fn => (
                  <span key={fn} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                    <span>{fn}</span>
                    <button onClick={() => toggleFunction(fn)} className="hover:text-purple-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {selectedExperiences.map(exp => (
                  <span key={exp} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                    <span>{exp}</span>
                    <button onClick={() => toggleExperience(exp)} className="hover:text-teal-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {(salaryMin || salaryMax || salaryCurrency !== 'All') && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-mono">
                    <span>Salary: {salaryMin || '0'}{salaryMax ? `–${salaryMax}` : '+'} {salaryCurrency !== 'All' ? salaryCurrency : ''}</span>
                    <button onClick={() => { setSalaryMin(''); setSalaryMax(''); setSalaryCurrency('All'); setCurrentPage(1); }} className="hover:text-amber-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedJobTypes.map(jt => (
                  <span key={jt} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                    <span>{jt}</span>
                    <button onClick={() => toggleJobType(jt)} className="hover:text-sky-950">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer ml-1"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Total Results Summary Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-slate-100 dark:border-navy-800 text-xs text-slate-500 dark:text-slate-400">
              <div>
                Showing <strong className="text-navy-900 dark:text-white font-bold">{filteredJobs.length}</strong> matching international jobs
                {totalPages > 1 && (
                  <span className="text-slate-400 font-mono text-[11px] ml-2">
                    (Page {currentPage} of {totalPages})
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  if (!user) {
                    openAuthModal('login', 'candidate');
                  } else {
                    setActiveModal('ai-resume');
                  }
                }}
                className="text-gold-500 dark:text-gold-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('jobs.matchAi')}</span>
              </button>
            </div>

          </div>

          {/* Job Listings Grid */}
          {loading ? (
            <div className="py-24 text-center text-xs font-bold text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Searching verified positions...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-16 text-center text-xs bg-white dark:bg-navy-950 rounded-3xl p-10 border border-slate-200 dark:border-navy-800 space-y-4 shadow-sm max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-gold-500 flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white">
                No Jobs Match Your Filter Criteria
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We couldn't find any positions matching the selected criteria. Try adjusting your sidebar filters or resetting to view all available positions.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md cursor-pointer transition"
                >
                  Reset All Filters
                </button>
                <button
                  onClick={handleOpenSaveSearch}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-navy-900 transition cursor-pointer"
                >
                  Save This Search Alert
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4.5 w-full">
                {paginatedJobs.map((j) => (
                  <div
                    key={j.id}
                    onClick={() => setViewJob(j)}
                    className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 p-5 sm:p-5.5 rounded-2xl space-y-3.5 hover:border-gold-500 transition duration-300 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="space-y-3">

                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {j.industry || j.category || 'Executive'}
                            </span>
                            {j.jobType && (
                              <span className="bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                {j.jobType}
                              </span>
                            )}
                          </div>

                          <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white mt-1 group-hover:text-gold-500 transition line-clamp-1">
                            {j.title}
                          </h3>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-gold-500" />
                            <span>{j.company}</span>
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveJob(j.id);
                          }}
                          className="p-2 rounded-xl bg-slate-50 dark:bg-navy-900 text-slate-400 hover:text-gold-500 transition cursor-pointer"
                          title={savedJobs.includes(j.id) ? 'Remove bookmark' : 'Bookmark job'}
                        >
                          <Bookmark className={`w-4 h-4 ${savedJobs.includes(j.id) ? 'fill-gold-500 text-gold-500' : ''}`} />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gold-500" />
                          <span>{j.city ? `${j.city}, ${j.country}` : (j.location || j.country)}</span>
                        </span>
                        <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          💰 {j.salary}
                        </span>
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{j.experience}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed">
                        {j.description}
                      </p>

                      {j.skills && Array.isArray(j.skills) && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {j.skills.slice(0, 4).map((s, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-lg border border-slate-200 dark:border-navy-800"
                            >
                              {s}
                            </span>
                          ))}
                          {j.skills.length > 4 && (
                            <span className="text-[10px] text-slate-400 font-bold self-center">
                              +{j.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-medium font-mono">
                        Posted: {j.postedDate && !j.postedDate.includes('ago') && j.postedDate.toLowerCase() !== 'just now' ? j.postedDate : '12 Nov 2026'}
                      </span>

                      {isApplied(j.id) ? (
                        <button
                          disabled
                          onClick={(e) => e.stopPropagation()}
                          className="px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-1 cursor-default shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Applied</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleQuickApply(e, j)}
                          className="px-4 py-2 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer"
                        >
                          Apply Now →
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200 dark:border-navy-800 text-xs">
                  <span className="text-slate-500 font-medium">
                    Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filteredJobs.length)}</strong> of <strong>{filteredJobs.length}</strong> vacancies
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                        document.getElementById('jobs-results-header')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-900 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                      <button
                        key={pNum}
                        onClick={() => {
                          setCurrentPage(pNum);
                          document.getElementById('jobs-results-header')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 rounded-xl font-bold transition cursor-pointer ${currentPage === pNum
                          ? 'bg-[#102B45] text-white dark:bg-gold-500 dark:text-navy-950 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-900 border border-slate-200 dark:border-navy-800'
                          }`}
                      >
                        {pNum}
                      </button>
                    ))}

                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                        document.getElementById('jobs-results-header')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-900 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      </div>

      {/* ============================================================ */}
      {/* MOBILE SLIDE-OUT FILTER DRAWER                               */}
      {/* ============================================================ */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-start bg-slate-900/80 dark:bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-navy-950 w-full max-w-sm h-full overflow-y-auto p-6 shadow-2xl space-y-5 animate-in slide-in-from-left">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-gold-500" />
                <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white">
                  Filter Criteria
                </h3>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SAVE SEARCH MODAL                                            */}
      {/* ============================================================ */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 dark:bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-gold-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-luxury space-y-5">

            <div className="flex justify-between items-start border-b border-slate-100 dark:border-navy-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider">Candidate Job Alert</span>
                <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white mt-0.5">
                  Save Search Criteria
                </h3>
              </div>
              <button
                onClick={() => setSaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSearchSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Search Alert Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dubai IT & Software Engineer, Healthcare Roles"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-gold-500"
                />
                <p className="text-[10px] text-slate-500">
                  Save this search to your candidate account to rerun and monitor matching jobs anytime.
                </p>
              </div>

              {/* Summary of criteria */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                  Parameters Being Saved:
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {keyword && (
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200 font-mono">
                      Keyword: "{keyword}"
                    </span>
                  )}
                  {selectedCountries.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                      Countries: {selectedCountries.join(', ')}
                    </span>
                  )}
                  {selectedCities.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                      Cities: {selectedCities.join(', ')}
                    </span>
                  )}
                  {selectedIndustries.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                      Industries: {selectedIndustries.join(', ')}
                    </span>
                  )}
                  {selectedFunctions.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                      Functions: {selectedFunctions.join(', ')}
                    </span>
                  )}
                  {selectedExperiences.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                      Exp: {selectedExperiences.join(', ')}
                    </span>
                  )}
                  {(salaryMin || salaryMax || salaryCurrency !== 'All') && (
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                      Salary: {salaryMin || '0'}{salaryMax ? `–${salaryMax}` : '+'} {salaryCurrency !== 'All' ? salaryCurrency : ''}
                    </span>
                  )}
                  {selectedJobTypes.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                      Types: {selectedJobTypes.join(', ')}
                    </span>
                  )}
                  {activeFilterCount === 0 && (
                    <span className="text-[11px] text-slate-500 italic">
                      All international vacancies (General Search)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSearch}
                  className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {savingSearch ? 'Saving...' : 'Save Search Alert'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW JOB DETAIL MODAL                                        */}
      {/* ============================================================ */}
      {viewJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 dark:bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-navy-950 border border-slate-200 dark:border-gold-500/30 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-luxury space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-navy-800 pb-3">
              <div>
                <span className="bg-gold-500/20 text-gold-500 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">{viewJob.category || viewJob.industry}</span>
                <h2 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">{viewJob.title}</h2>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{viewJob.company} • {viewJob.city ? `${viewJob.city}, ${viewJob.country}` : viewJob.location}</p>
              </div>
              <button onClick={() => setViewJob(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white rounded-2xl text-xs flex justify-between border border-slate-100 dark:border-navy-800">
              <div><p className="text-[10px] text-slate-500 font-medium">Monthly Compensation</p><p className="font-bold text-gold-500 text-sm font-mono">{viewJob.salary}</p></div>
              <div><p className="text-[10px] text-slate-500 font-medium">Experience Required</p><p className="font-bold text-slate-900 dark:text-white text-xs">{viewJob.experience}</p></div>
              <div><p className="text-[10px] text-slate-500 font-medium">Job Type</p><p className="font-bold text-slate-900 dark:text-white text-xs">{viewJob.jobType}</p></div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <div>
                <h4 className="font-bold text-navy-900 dark:text-white mb-1">Full Description:</h4>
                <p className="leading-relaxed">{viewJob.description}</p>
              </div>
              {viewJob.qualification && (
                <div>
                  <h4 className="font-bold text-navy-900 dark:text-white mb-1">Qualification Required:</h4>
                  <p className="p-2.5 bg-slate-50 dark:bg-navy-900 rounded-xl border border-slate-100 dark:border-navy-800">{viewJob.qualification}</p>
                </div>
              )}
              {viewJob.benefits && Array.isArray(viewJob.benefits) && (
                <div>
                  <h4 className="font-bold text-navy-900 dark:text-white mb-1">Key Executive Benefits:</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {viewJob.benefits.map((b, idx) => <li key={idx}>{b}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
              <button onClick={() => setViewJob(null)} className="flex-1 py-2.5 bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer">Close</button>
              {isApplied(viewJob.id) ? (
                <button disabled className="flex-1 py-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-default">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Applied</span>
                </button>
              ) : (
                <button onClick={() => {
                  const j = viewJob;
                  setViewJob(null);
                  if (!user || !user.email) {
                    setPendingJobToApply(j);
                    openAuthModal('register', 'candidate');
                    return;
                  }
                  setApplyJob(j);
                  setAppliedSuccess(false);
                }} className="flex-1 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow cursor-pointer">Apply for Position</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Apply Modal */}
      <QuickApplyModal
        job={applyJob}
        isOpen={Boolean(applyJob)}
        onClose={() => setApplyJob(null)}
        onSuccess={() => fetchJobs()}
      />

    </div>
  );
};
