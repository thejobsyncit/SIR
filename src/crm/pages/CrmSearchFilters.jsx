import React, { useState, useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Search, Filter, Users, MapPin, Briefcase, GraduationCap, 
  Award, CheckCircle2, FileText, Calendar, RotateCcw, Download, Sparkles 
} from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

export const CrmSearchFilters = () => {
  const { candidates = [], setActiveModule, setSelectedCandidate, addInterview } = useCrm();

  const [keyword, setKeyword] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedExp, setSelectedExp] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedQual, setSelectedQual] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Distinct Filter Option Sets
  const jobsList = [
    'Senior Civil Project Manager',
    'Consultant Cardiologist',
    'Lead DevOps Cloud Architect',
    'Executive Hospitality Manager',
    'Structural MEP Engineer',
    'Bilingual Legal Counsel'
  ];

  const skillsList = [
    'Primavera P6',
    'FIDIC Red Book',
    'AutoCAD',
    'High-Rise Construction',
    'Cardiology',
    'JCI Accreditation',
    'AWS',
    'Kubernetes',
    'Terraform',
    'Luxury Guest Services',
    'BIM Modelling'
  ];

  const locationsList = ['Dubai, UAE', 'Riyadh, KSA', 'Singapore', 'Doha, Qatar', 'Chennai, India', 'Kuwait'];
  const qualificationsList = ['B.E / B.Tech Civil', 'MBBS / MD Cardiology', 'B.S Computer Science', 'MBA Hospitality', 'LL.M Corporate Law'];
  const statusList = [
    { id: 'all', label: 'All Statuses' },
    { id: 'applied', label: 'Applied' },
    { id: 'screening', label: 'Screening' },
    { id: 'shortlisted', label: 'Shortlisted' },
    { id: 'interview', label: 'Interview Scheduled' },
    { id: 'selected', label: 'Selected' },
    { id: 'offer_released', label: 'Offered' },
    { id: 'joined', label: 'Hired / Joined' },
    { id: 'rejected', label: 'Rejected' }
  ];

  // Filter evaluation
  const filteredCandidates = useMemo(() => {
    return candidates.filter(cand => {
      // Keyword match
      if (keyword.trim()) {
        const q = keyword.toLowerCase();
        const candStr = `${cand.name} ${cand.email} ${cand.phone} ${cand.currentRole} ${cand.nationality} ${Array.isArray(cand.skills) ? cand.skills.join(' ') : ''}`.toLowerCase();
        if (!candStr.includes(q)) return false;
      }

      // Job / Vacancy match
      if (selectedJob !== 'all') {
        const r = (cand.currentRole || '').toLowerCase();
        if (!r.includes(selectedJob.toLowerCase())) return false;
      }

      // Skill match
      if (selectedSkill !== 'all') {
        const skillsArr = Array.isArray(cand.skills) ? cand.skills : [];
        if (!skillsArr.some(s => s.toLowerCase().includes(selectedSkill.toLowerCase()))) return false;
      }

      // Experience match
      if (selectedExp !== 'all') {
        const expStr = (cand.experience || '').toLowerCase();
        const years = parseInt(expStr) || 4;
        if (selectedExp === 'junior' && years > 3) return false;
        if (selectedExp === 'mid' && (years < 3 || years > 7)) return false;
        if (selectedExp === 'senior' && (years < 8 || years > 12)) return false;
        if (selectedExp === 'executive' && years < 12) return false;
      }

      // Location match
      if (selectedLocation !== 'all') {
        const loc = (cand.location || cand.nationality || '').toLowerCase();
        if (!loc.includes(selectedLocation.split(',')[0].toLowerCase())) return false;
      }

      // Qualification match
      if (selectedQual !== 'all') {
        const qual = (cand.qualification || cand.education || '').toLowerCase();
        if (!qual.includes(selectedQual.split(' ')[0].toLowerCase())) return false;
      }

      // Application status match
      if (selectedStatus !== 'all') {
        const st = (cand.stage || '').toLowerCase();
        if (!st.includes(selectedStatus.toLowerCase())) return false;
      }

      return true;
    });
  }, [candidates, keyword, selectedJob, selectedSkill, selectedExp, selectedLocation, selectedQual, selectedStatus]);

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedJob('all');
    setSelectedSkill('all');
    setSelectedExp('all');
    setSelectedLocation('all');
    setSelectedQual('all');
    setSelectedStatus('all');
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 rounded-3xl border border-gold-500/30 shadow-lg text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-500 text-navy-950 uppercase tracking-wider">
              Recruiter Feature #4
            </span>
            <span className="text-xs text-slate-400 font-mono">TALENT-SEARCH-ENGINE</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
            Search and Filters
          </h1>
          <p className="text-slate-300 text-xs mt-1">
            Find candidates by job, skill, experience, location, qualification and application status.
          </p>
        </div>

        {/* Multi-Dimensional Filter Control Panel */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
            <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-gold-500" />
              <span>Multi-Criteria Candidate Search Filters</span>
            </h3>

            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:text-rose-500 font-bold transition cursor-pointer text-[11px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>

          {/* Keyword Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search across candidate names, verified emails, phone numbers, skills, passport details..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-2xl text-xs font-semibold focus:outline-none focus:border-gold-500"
            />
          </div>

          {/* 6 Dimension Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {/* 1. Job Role */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Target Job / Vacancy
              </label>
              <select
                value={selectedJob}
                onChange={e => setSelectedJob(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Job Mandates</option>
                {jobsList.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>

            {/* 2. Skill */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Core Competence / Skill
              </label>
              <select
                value={selectedSkill}
                onChange={e => setSelectedSkill(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Technical Skills</option>
                {skillsList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* 3. Experience */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Experience Bracket
              </label>
              <select
                value={selectedExp}
                onChange={e => setSelectedExp(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">Any Experience Range</option>
                <option value="junior">Junior (1 - 3 Years)</option>
                <option value="mid">Mid-Senior (4 - 7 Years)</option>
                <option value="senior">Senior Lead (8 - 12 Years)</option>
                <option value="executive">Director / Exec (12+ Years)</option>
              </select>
            </div>

            {/* 4. Location */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Candidate Location / Target Region
              </label>
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Locations (Domestic & GCC)</option>
                {locationsList.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>

            {/* 5. Qualification */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Education / Qualification
              </label>
              <select
                value={selectedQual}
                onChange={e => setSelectedQual(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Academic Qualifications</option>
                {qualificationsList.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>

            {/* 6. Application Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Application Pipeline Stage
              </label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {statusList.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex justify-between items-center px-1">
          <span className="font-serif text-sm font-bold text-slate-900 dark:text-white">
            Matching Candidates: <span className="text-gold-500 font-mono font-extrabold">{filteredCandidates.length}</span> Profiles
          </span>
          <span className="text-xs text-slate-400 font-mono">Real-Time Dynamic Querying</span>
        </div>

        {/* Results Candidate Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.map(cand => (
            <div 
              key={cand.id} 
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-3xl space-y-3 hover:border-gold-500/50 transition shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <img
                    src={cand.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={cand.name}
                    className="w-11 h-11 rounded-2xl object-cover border border-gold-500/40"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{cand.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{cand.currentRole || 'Executive Candidate'}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                  {cand.score || 90}% Match
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Experience:</span>
                  <span className="font-bold">{cand.experience || '6 Years'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-bold">{cand.nationality || 'Dubai, UAE'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Pipeline Stage:</span>
                  <span className="font-bold capitalize text-gold-600 dark:text-gold-400">{cand.stage || 'Applied'}</span>
                </div>
              </div>

              {/* Skills preview */}
              <div className="flex flex-wrap gap-1 pt-1">
                {(Array.isArray(cand.skills) ? cand.skills : ['Project Execution', 'Site Supervision']).slice(0, 3).map(s => (
                  <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 rounded text-[9px] font-semibold border border-slate-200 dark:border-navy-800">
                    {s}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                <button
                  onClick={() => {
                    if (setSelectedCandidate) setSelectedCandidate(cand);
                    setActiveModule('candidates');
                  }}
                  className="flex-1 py-1.5 bg-slate-100 dark:bg-navy-800 hover:text-white text-slate-700 dark:text-slate-300 font-bold rounded-xl text-[10px] transition text-center"
                >
                  View Profile
                </button>
                <button
                  onClick={() => setActiveModule('interviews')}
                  className="flex-1 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold rounded-xl text-[10px] transition text-center shadow-xs"
                >
                  Schedule Meet
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl space-y-2">
            <Users className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
            <h4 className="font-serif text-base font-bold text-slate-800 dark:text-slate-200">No Candidates Found</h4>
            <p className="text-slate-500 text-xs">Try loosening your filter parameters or search keyword.</p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-4 py-2 bg-gold-500 text-navy-950 font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </ScrollReveal>
  );
};

