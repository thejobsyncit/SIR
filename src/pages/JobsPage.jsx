import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, MapPin, Briefcase, DollarSign, Globe, CheckCircle2, Bookmark, ArrowRight, Filter, X, Sparkles, Send } from 'lucide-react';
import { JOBS_LIST } from '../data/mockData';

export const JobsPage = () => {
  const { setSelectedJob, applyForJob, applications, toggleSaveJob, savedJobs, setActiveModal, postedJobs, t } = useApp();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const isApplied = (jobId) => applications.some(a => a.jobId === jobId);
  
  // Filters
  const [keyword, setKeyword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState('All');

  // Job Detail & Apply Modal
  const [viewJob, setViewJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    let apiJobs = [];
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (selectedCountry !== 'All') params.append('country', selectedCountry);
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedJobType !== 'All') params.append('jobType', selectedJobType);

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

    const filtered = allCombined.filter(j => {
      const matchKeyword = !keyword || 
        j.title.toLowerCase().includes(keyword.toLowerCase()) || 
        j.company.toLowerCase().includes(keyword.toLowerCase()) ||
        (j.description && j.description.toLowerCase().includes(keyword.toLowerCase())) ||
        (j.skills && j.skills.some(s => s.toLowerCase().includes(keyword.toLowerCase())));

      const matchCountry = selectedCountry === 'All' || j.country.toLowerCase() === selectedCountry.toLowerCase();
      const matchCategory = selectedCategory === 'All' || 
        j.category.toLowerCase().includes(selectedCategory.toLowerCase()) || 
        selectedCategory.toLowerCase().includes(j.category.toLowerCase());
      const matchJobType = selectedJobType === 'All' || j.jobType.toLowerCase() === selectedJobType.toLowerCase();

      return matchKeyword && matchCountry && matchCategory && matchJobType;
    });

    setJobs(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [keyword, selectedCountry, selectedCategory, selectedJobType, postedJobs]);

  const handleQuickApply = (e, job) => {
    e.stopPropagation();
    applyForJob(job);
    setApplyJob(job);
    setAppliedSuccess(true);
  };

  const submitApplication = () => {
    if (applyJob) {
      applyForJob(applyJob);
      setAppliedSuccess(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3.5 py-1 rounded-full uppercase">
          {t('jobs.badge')}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-navy-900 dark:text-white">
          {t('jobs.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {t('jobs.subtitle')}
        </p>
      </div>

      {/* Advanced Filter Bar */}
      <div className="glass-card bg-navy-950 p-6 rounded-2xl border border-gold-500/30 shadow-luxury space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder={t('jobs.searchPlaceholder')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 text-white rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <select 
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold-500"
            >
              <option value="All">{t('jobs.allCountries')}</option>
              <option value="UAE">🇦🇪 UAE (Dubai / Abu Dhabi)</option>
              <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
              <option value="Qatar">🇶🇦 Qatar</option>
              <option value="Singapore">🇸🇬 Singapore</option>
            </select>
          </div>

          <div>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold-500"
            >
              <option value="All">{t('jobs.allCategories')}</option>
              <option value="Construction">Construction & MEP</option>
              <option value="Oil & Gas">Oil & Gas</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Hospitality">Hospitality</option>
              <option value="IT & Software">IT & Software</option>
              <option value="Aviation">Aviation</option>
            </select>
          </div>

          <div>
            <select 
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-gold-500"
            >
              <option value="All">{t('jobs.allTypes')}</option>
              <option value="Full-time">Full-time Permanent</option>
              <option value="Contract">Project Contract</option>
            </select>
          </div>

        </div>

        <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-navy-800">
          <span>Found <strong>{jobs.length}</strong> {t('jobs.foundVacancies')}</span>
          <button 
            onClick={() => setActiveModal('ai-resume')}
            className="text-gold-400 font-bold hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('jobs.matchAi')}</span>
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs font-bold text-slate-500">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 glass-card bg-white dark:bg-navy-900 rounded-2xl p-8">
          No jobs found matching your current filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((j) => (
            <div 
              key={j.id}
              onClick={() => setViewJob(j)}
              className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 hover:border-gold-500 transition duration-300 shadow-glass cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {j.category}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white mt-1 group-hover:text-gold-500 transition">
                      {j.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{j.company}</p>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleSaveJob(j.id); }}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-400 hover:text-gold-500"
                  >
                    <Bookmark className={`w-4 h-4 ${savedJobs.includes(j.id) ? 'fill-gold-500 text-gold-500' : ''}`} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-slate-900 dark:text-slate-100 font-semibold">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gold-500" />
                    {j.location} ({j.country})
                  </span>
                  <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                    💰 {j.salary}
                  </span>
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <Briefcase className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    {j.experience}
                  </span>
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium line-clamp-2 leading-relaxed">
                  {j.description}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {j.skills.map((s, idx) => (
                    <span key={idx} className="bg-slate-200/90 dark:bg-navy-800 text-slate-900 dark:text-slate-100 font-bold border border-slate-300/80 dark:border-navy-700 text-[10px] px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex justify-between items-center">
                <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">{j.postedDate}</span>
                {isApplied(j.id) ? (
                  <button 
                    disabled
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-1 cursor-default shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Applied</span>
                  </button>
                ) : (
                  <button 
                    onClick={(e) => handleQuickApply(e, j)}
                    className="px-4 py-2 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95"
                  >
                    Apply Now →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Job Detail Modal */}
      {viewJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-luxury space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <span className="bg-gold-500/20 text-gold-500 text-xs font-bold px-2.5 py-0.5 rounded uppercase">{viewJob.category}</span>
                <h2 className="font-serif text-2xl font-bold text-navy-900 dark:text-white mt-1">{viewJob.title}</h2>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{viewJob.company} • {viewJob.location}</p>
              </div>
              <button onClick={() => setViewJob(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-3 bg-navy-950 text-white rounded-xl text-xs flex justify-between">
              <div><p className="text-[10px] text-slate-300 font-medium">Monthly Salary</p><p className="font-bold text-gold-400 text-sm">{viewJob.salary}</p></div>
              <div><p className="text-[10px] text-slate-300 font-medium">Experience Required</p><p className="font-bold text-white text-xs">{viewJob.experience}</p></div>
              <div><p className="text-[10px] text-slate-300 font-medium">Job Type</p><p className="font-bold text-white text-xs">{viewJob.jobType}</p></div>
            </div>

            <div className="space-y-3 text-xs text-slate-800 dark:text-slate-200 font-medium">
              <div>
                <h4 className="font-bold text-navy-900 dark:text-white mb-1">Full Description:</h4>
                <p className="leading-relaxed">{viewJob.description}</p>
              </div>
              <div>
                <h4 className="font-bold text-navy-900 dark:text-white mb-1">Qualification Required:</h4>
                <p className="p-2 bg-slate-100 dark:bg-navy-800 rounded">{viewJob.qualification}</p>
              </div>
              <div>
                <h4 className="font-bold text-navy-900 dark:text-white mb-1">Key Executive Benefits:</h4>
                <ul className="list-disc pl-4 space-y-1">
                  {viewJob.benefits.map((b, idx) => <li key={idx}>{b}</li>)}
                </ul>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-200 dark:border-navy-800">
              <button onClick={() => setViewJob(null)} className="flex-1 py-2.5 bg-slate-200 dark:bg-navy-800 text-xs font-bold rounded-xl">Close</button>
              {isApplied(viewJob.id) ? (
                <button disabled className="flex-1 py-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-default">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Applied</span>
                </button>
              ) : (
                <button onClick={() => { const j = viewJob; setViewJob(null); setApplyJob(j); setAppliedSuccess(false); }} className="flex-1 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow">Apply for Position</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply Form Modal */}
      {applyJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/30 rounded-2xl max-w-lg w-full p-6 shadow-luxury space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">Apply for {applyJob.title}</h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{applyJob.company} • {applyJob.country}</p>
              </div>
              <button onClick={() => setApplyJob(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {!appliedSuccess ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Full Name</label>
                  <input type="text" defaultValue="John Doe" className="w-full bg-slate-50 dark:bg-navy-950 border rounded-lg p-2 text-navy-900 dark:text-white" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Email Address</label>
                  <input type="email" defaultValue="candidate@sirrecruitment.com" className="w-full bg-slate-50 dark:bg-navy-950 border rounded-lg p-2 text-navy-900 dark:text-white" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Attached Resume</label>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 flex justify-between items-center">
                    <span>📄 John_Doe_Executive_CV.pdf</span>
                    <span className="font-bold">Attached</span>
                  </div>
                </div>
                <button onClick={submitApplication} className="w-full py-3 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow flex items-center justify-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Submit Application to Recruiter</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-lg font-bold text-navy-900 dark:text-white">Application Received!</h4>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">Your candidate profile has been submitted directly to {applyJob.company}. Track application status in your Candidate Portal.</p>
                <button onClick={() => setApplyJob(null)} className="w-full py-2.5 bg-navy-900 text-white font-bold text-xs rounded-xl">Close</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
