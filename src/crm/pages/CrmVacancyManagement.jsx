import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Briefcase, Plus, Search, Filter, MapPin, Calendar, DollarSign, 
  Users, CheckCircle2, PauseCircle, XCircle, Clock, Edit3, Trash2, 
  ExternalLink, Sparkles, Building2
} from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

export const CrmVacancyManagement = () => {
  const { setActiveModule } = useCrm();

  const [vacancies, setVacancies] = useState([
    {
      id: 'VAC-101',
      title: 'Senior Civil Project Manager',
      company: 'Al Habtoor Contracting LLC',
      location: 'Dubai, UAE',
      department: 'Construction & Engineering',
      type: 'International',
      openings: 4,
      experience: '8-12 Years',
      salary: '22,000 - 28,000 AED / month',
      closingDate: '2026-12-15',
      skills: ['Primavera P6', 'FIDIC Red Book', 'AutoCAD', 'High-Rise Construction'],
      status: 'Active',
      applicantsCount: 24,
      description: 'Leading mega high-rise tower project in Business Bay. Requires FIDIC Red Book mastery and GCC site execution experience.'
    },
    {
      id: 'VAC-102',
      title: 'Consultant Cardiologist',
      company: 'Saudi German Hospital',
      location: 'Riyadh, KSA',
      department: 'Healthcare & Medical',
      type: 'International',
      openings: 2,
      experience: '10+ Years',
      salary: '45,000 - 60,000 SAR / month',
      closingDate: '2026-11-30',
      skills: ['Cardiology', 'JCI Accreditation', 'Prometric License', 'Catheterization'],
      status: 'Active',
      applicantsCount: 9,
      description: 'Senior clinical specialist position. Requires Saudi SCFHS consultant license eligibility and advanced interventional experience.'
    },
    {
      id: 'VAC-103',
      title: 'Lead DevOps Cloud Architect',
      company: 'TechVision International',
      location: 'Singapore',
      department: 'Information Technology',
      type: 'International',
      openings: 3,
      experience: '6-10 Years',
      salary: '9,500 - 13,000 SGD / month',
      closingDate: '2026-12-05',
      skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD Pipelines'],
      status: 'Paused',
      applicantsCount: 18,
      description: 'Architecting containerized cloud infrastructure for fintech clients. Experience with multi-region deployment required.'
    },
    {
      id: 'VAC-104',
      title: 'Executive Hospitality Manager',
      company: 'Emaar Hospitality Group',
      location: 'Dubai, UAE',
      department: 'Hospitality & Tourism',
      type: 'International',
      openings: 5,
      experience: '5-8 Years',
      salary: '16,000 - 20,000 AED / month',
      closingDate: '2026-11-25',
      skills: ['Luxury Guest Services', 'F&B Operations', 'Staff Leadership'],
      status: 'Active',
      applicantsCount: 31,
      description: '5-star luxury downtown property management. Focus on guest satisfaction, VIP protocols, and revenue optimization.'
    },
    {
      id: 'VAC-105',
      title: 'Senior Mechanical Site Engineer',
      company: 'L&T Construction',
      location: 'Chennai, India',
      department: 'Domestic EPC Projects',
      type: 'Domestic',
      openings: 6,
      experience: '4-7 Years',
      salary: '12 - 16 LPA (INR)',
      closingDate: '2026-12-20',
      skills: ['HVAC Design', 'BIM Modelling', 'Piping Layouts', 'Site Commissioning'],
      status: 'Active',
      applicantsCount: 42,
      description: 'Industrial plant expansion project. Directing MEP subcontractors and equipment commissioning.'
    },
    {
      id: 'VAC-106',
      title: 'Bilingual Corporate Legal Counsel',
      company: 'Al Tamimi & Company',
      location: 'Doha, Qatar',
      department: 'Legal & Compliance',
      type: 'International',
      openings: 1,
      experience: '7-10 Years',
      salary: '30,000 - 38,000 QAR / month',
      closingDate: '2026-10-31',
      skills: ['GCC Commercial Law', 'Cross-Border M&A', 'Arabic Fluency'],
      status: 'Closed',
      applicantsCount: 12,
      description: 'Corporate M&A advisory. Successfully filled vacancy with shortlisted senior legal associate.'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [notification, setNotification] = useState('');

  const [newVacancy, setNewVacancy] = useState({
    title: '',
    company: '',
    location: 'Dubai, UAE',
    department: 'Engineering & Construction',
    type: 'International',
    openings: 1,
    experience: '3-5 Years',
    salary: '',
    closingDate: '',
    skills: '',
    description: ''
  });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleCreateVacancy = (e) => {
    e.preventDefault();
    if (!newVacancy.title || !newVacancy.company) return;

    const created = {
      id: `VAC-${Math.floor(100 + Math.random() * 900)}`,
      title: newVacancy.title,
      company: newVacancy.company,
      location: newVacancy.location,
      department: newVacancy.department,
      type: newVacancy.type,
      openings: Number(newVacancy.openings) || 1,
      experience: newVacancy.experience,
      salary: newVacancy.salary || 'Negotiable based on experience',
      closingDate: newVacancy.closingDate || '2026-12-31',
      skills: newVacancy.skills.split(',').map(s => s.trim()).filter(Boolean),
      status: 'Active',
      applicantsCount: 0,
      description: newVacancy.description || 'Newly published recruiter vacancy.'
    };

    setVacancies(prev => [created, ...prev]);
    setCreateModalOpen(false);
    setNewVacancy({
      title: '',
      company: '',
      location: 'Dubai, UAE',
      department: 'Engineering & Construction',
      type: 'International',
      openings: 1,
      experience: '3-5 Years',
      salary: '',
      closingDate: '',
      skills: '',
      description: ''
    });
    showToast(`✓ Vacancy "${created.title}" published successfully!`);
  };

  const handleUpdateStatus = (vacId, newStatus) => {
    setVacancies(prev => prev.map(v => v.id === vacId ? { ...v, status: newStatus } : v));
    showToast(`✓ Vacancy ${vacId} marked as "${newStatus}"`);
  };

  const filteredVacancies = vacancies.filter(v => {
    const matchesSearch = !searchQuery || 
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || v.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === 'all' || v.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesType;
  });

  const activeCount = vacancies.filter(v => v.status === 'Active').length;
  const pausedCount = vacancies.filter(v => v.status === 'Paused').length;
  const closedCount = vacancies.filter(v => v.status === 'Closed').length;
  const totalOpenings = vacancies.filter(v => v.status === 'Active').reduce((sum, v) => sum + v.openings, 0);

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Banner Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 rounded-3xl border border-gold-500/30 shadow-lg text-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-500 text-navy-950 uppercase tracking-wider">
                Recruiter Feature #2
              </span>
              <span className="text-xs text-slate-400 font-mono">VACANCY-MANDATES</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
              Job / Vacancy Management
            </h1>
            <p className="text-slate-300 text-xs mt-1">
              Create, edit, publish, pause and close vacancies; define role, skills, experience, location and closing date.
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold rounded-2xl shadow-gold-glow transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Vacancy</span>
          </button>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
            {notification}
          </div>
        )}

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Active Published Vacancies</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{activeCount}</span>
              <span className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl"><CheckCircle2 className="w-4 h-4" /></span>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Total Open Positions</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{totalOpenings}</span>
              <span className="p-2 bg-blue-500/10 text-blue-600 rounded-xl"><Users className="w-4 h-4" /></span>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Paused Vacancies</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">{pausedCount}</span>
              <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl"><PauseCircle className="w-4 h-4" /></span>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Closed / Filled Positions</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-slate-600 dark:text-slate-400 font-mono">{closedCount}</span>
              <span className="p-2 bg-slate-500/10 text-slate-500 rounded-xl"><XCircle className="w-4 h-4" /></span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vacancy by title, employer, or required skills..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="paused">Paused Only</option>
              <option value="closed">Closed Only</option>
            </select>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">Domestic & GCC</option>
              <option value="international">International GCC</option>
              <option value="domestic">Domestic India</option>
            </select>
          </div>
        </div>

        {/* Vacancies List */}
        <div className="space-y-4">
          {filteredVacancies.map(vac => (
            <div 
              key={vac.id}
              className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-3xl space-y-3 hover:border-gold-500/50 transition shadow-sm"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20 shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">{vac.title}</h3>
                      <span className="text-[10px] font-mono text-slate-400">({vac.id})</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-2 mt-0.5">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{vac.company}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gold-500" />{vac.location}</span>
                      <span>•</span>
                      <span className="text-indigo-500 font-bold">{vac.department}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    vac.status === 'Active' 
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30' 
                      : vac.status === 'Paused'
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    ● {vac.status}
                  </span>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-mono">
                    {vac.openings} Openings
                  </span>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{vac.description}</p>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {vac.skills.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-semibold border border-slate-200 dark:border-navy-800">
                    {s}
                  </span>
                ))}
              </div>

              {/* Footer Details & Action Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-100 dark:border-navy-800/80 text-[11px] font-mono text-slate-500">
                <div className="flex flex-wrap items-center gap-4">
                  <span>Experience: <strong className="text-slate-800 dark:text-slate-200">{vac.experience}</strong></span>
                  <span>Salary: <strong className="text-emerald-600 dark:text-emerald-400">{vac.salary}</strong></span>
                  <span>Closing Date: <strong className="text-rose-600 dark:text-rose-400">{vac.closingDate}</strong></span>
                  <span>Applicants: <strong className="text-blue-600 dark:text-blue-400">{vac.applicantsCount} Candidates</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {vac.status === 'Active' ? (
                    <button
                      onClick={() => handleUpdateStatus(vac.id, 'Paused')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 font-bold text-[10px] transition cursor-pointer"
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(vac.id, 'Active')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 font-bold text-[10px] transition cursor-pointer"
                    >
                      Publish Active
                    </button>
                  )}

                  {vac.status !== 'Closed' && (
                    <button
                      onClick={() => handleUpdateStatus(vac.id, 'Closed')}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 font-bold text-[10px] transition cursor-pointer"
                    >
                      Close Vacancy
                    </button>
                  )}

                  <button
                    onClick={() => setActiveModule('candidates')}
                    className="px-3 py-1 rounded-lg bg-gold-500 text-navy-950 font-bold text-[10px] hover:bg-gold-400 transition cursor-pointer"
                  >
                    View Applicants →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CREATE VACANCY MODAL */}
        {createModalOpen && (
          <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 animate-in fade-in max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-gold-500" />
                  <span>Create & Publish New Vacancy</span>
                </h3>
                <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateVacancy} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Job Title / Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Project Manager, Consultant Cardiologist"
                    value={newVacancy.title}
                    onChange={e => setNewVacancy({ ...newVacancy, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hiring Client / Company *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Al Habtoor, Saudi German Hospital"
                      value={newVacancy.company}
                      onChange={e => setNewVacancy({ ...newVacancy, company: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dubai, UAE / Riyadh, KSA / Chennai, India"
                      value={newVacancy.location}
                      onChange={e => setNewVacancy({ ...newVacancy, location: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Experience *</label>
                    <input
                      type="text"
                      placeholder="e.g. 5-8 Years"
                      value={newVacancy.experience}
                      onChange={e => setNewVacancy({ ...newVacancy, experience: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">No. of Openings</label>
                    <input
                      type="number"
                      min="1"
                      value={newVacancy.openings}
                      onChange={e => setNewVacancy({ ...newVacancy, openings: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Closing Date</label>
                    <input
                      type="date"
                      value={newVacancy.closingDate}
                      onChange={e => setNewVacancy({ ...newVacancy, closingDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Salary Range</label>
                    <input
                      type="text"
                      placeholder="e.g. 25,000 - 30,000 AED / month"
                      value={newVacancy.salary}
                      onChange={e => setNewVacancy({ ...newVacancy, salary: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hiring Region</label>
                    <select
                      value={newVacancy.type}
                      onChange={e => setNewVacancy({ ...newVacancy, type: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="International">International GCC / Cross-Border</option>
                      <option value="Domestic">Domestic India</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Primavera P6, FIDIC, AutoCAD, Site Execution"
                    value={newVacancy.skills}
                    onChange={e => setNewVacancy({ ...newVacancy, skills: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Job Description & Responsibilities</label>
                  <textarea
                    rows={3}
                    placeholder="Describe main responsibilities, client requirements, and candidate expectations..."
                    value={newVacancy.description}
                    onChange={e => setNewVacancy({ ...newVacancy, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold rounded-xl shadow-sm"
                  >
                    Publish Vacancy Now
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </ScrollReveal>
  );
};

