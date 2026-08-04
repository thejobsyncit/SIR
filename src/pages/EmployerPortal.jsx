import React, { useState } from 'react';
import { Building2, Users, PlusCircle, Search, Calendar, BarChart3, CheckCircle2, FileText, Send, Sparkles } from 'lucide-react';

export const EmployerPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'post-job' | 'candidates'
  const [postedSuccess, setPostedSuccess] = useState(false);

  const [jobForm, setJobForm] = useState({
    title: '',
    country: 'UAE',
    category: 'Construction',
    salary: '',
    experience: '',
    description: '',
    vacancies: '5'
  });

  const sampleCandidates = [
    { name: 'Dr. Rahul Sharma', role: 'Senior ICU Consultant', exp: '8 Yrs', location: 'India (Relocating to KSA)', match: '98%' },
    { name: 'Elena Rostova', role: 'DevOps & Cloud Lead', exp: '6 Yrs', location: 'Poland (Relocating to UAE)', match: '95%' },
    { name: 'Mohammed Al-Kindi', role: 'Civil Project Director', exp: '14 Yrs', location: 'Dubai, UAE', match: '92%' }
  ];

  const handlePostJob = (e) => {
    e.preventDefault();
    setPostedSuccess(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      
      {/* Employer Header Banner */}
      <div className="glass-card bg-navy-950 text-white rounded-3xl p-6 sm:p-8 border border-gold-500/30 shadow-luxury flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gold-500 text-navy-950 flex items-center justify-center font-bold text-2xl border-2 border-white">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Enterprise Employer Portal</span>
            <h1 className="font-serif text-2xl font-bold text-white mt-1">Al Habtoor Contracting LLC</h1>
            <p className="text-xs text-slate-400">Account ID: SIR-EMP-9902 • Active Mandates: 8 Jobs</p>
          </div>
        </div>

        <button 
          onClick={() => setActiveTab('post-job')}
          className="px-6 py-3 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow flex items-center space-x-2 hover:opacity-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post a New Job Mandate</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-navy-800 text-xs font-bold">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`pb-3 px-4 transition ${activeTab === 'dashboard' ? 'border-b-2 border-gold-500 text-gold-500' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Employer Dashboard & Analytics
        </button>
        <button 
          onClick={() => setActiveTab('post-job')} 
          className={`pb-3 px-4 transition ${activeTab === 'post-job' ? 'border-b-2 border-gold-500 text-gold-500' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Post a Job Wizard
        </button>
        <button 
          onClick={() => setActiveTab('candidates')} 
          className={`pb-3 px-4 transition ${activeTab === 'candidates' ? 'border-b-2 border-gold-500 text-gold-500' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Search Candidate Database
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center text-xs">
            <div className="glass-card bg-white dark:bg-navy-900 border p-4 rounded-xl space-y-1">
              <span className="text-slate-500 font-bold">Active Postings</span>
              <p className="font-serif text-3xl font-extrabold text-navy-900 dark:text-white">8</p>
            </div>
            <div className="glass-card bg-white dark:bg-navy-900 border p-4 rounded-xl space-y-1">
              <span className="text-slate-500 font-bold">Candidates Received</span>
              <p className="font-serif text-3xl font-extrabold text-gold-500">142</p>
            </div>
            <div className="glass-card bg-white dark:bg-navy-900 border p-4 rounded-xl space-y-1">
              <span className="text-slate-500 font-bold">Interviews Conducted</span>
              <p className="font-serif text-3xl font-extrabold text-emerald-500">24</p>
            </div>
            <div className="glass-card bg-white dark:bg-navy-900 border p-4 rounded-xl space-y-1">
              <span className="text-slate-500 font-bold">Visas Issued</span>
              <p className="font-serif text-3xl font-extrabold text-navy-900 dark:text-white">12</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'post-job' && (
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 rounded-2xl max-w-3xl mx-auto space-y-4 text-xs">
          <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">Create Job Vacancy Mandate</h3>

          {!postedSuccess ? (
            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Job Title</label>
                <input required type="text" placeholder="e.g. Senior Project Manager" className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Destination Country</label>
                  <select className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white">
                    <option value="UAE">🇦🇪 UAE (Dubai)</option>
                    <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                    <option value="Qatar">🇶🇦 Qatar</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Industry Sector</label>
                  <select className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white">
                    <option value="Construction">Construction</option>
                    <option value="Oil & Gas">Oil & Gas</option>
                    <option value="IT">IT & Software</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Offered Monthly Salary (Tax Free)</label>
                  <input type="text" placeholder="e.g. AED 30,000 - 40,000" className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Vacancies Count (Bulk Hiring)</label>
                  <input type="number" defaultValue="5" className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Role Description & Requirements</label>
                <textarea rows={4} placeholder="Specify skills, qualifications, degree attestation requirements..." className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white" />
              </div>

              <button type="submit" className="w-full py-3 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow">
                Publish Mandate to SIR Talent Portal →
              </button>
            </form>
          ) : (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="font-serif text-lg font-bold text-navy-900 dark:text-white">Job Mandate Published Successfully!</h4>
              <p className="text-slate-500">SIR AI Matching Engine is scanning 50,000+ candidates for your position.</p>
              <button onClick={() => setPostedSuccess(false)} className="py-2.5 px-6 bg-navy-900 text-white font-bold rounded-xl">Post Another Role</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="space-y-4">
          <div className="glass-card bg-white dark:bg-navy-900 border p-6 rounded-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white">Headhunter Pre-Screened Candidates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sampleCandidates.map((c, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-navy-950 border rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-navy-900 dark:text-white">{c.name}</h4>
                    <span className="bg-emerald-500/20 text-emerald-500 font-bold px-2 py-0.5 rounded text-[10px]">{c.match} Match</span>
                  </div>
                  <p className="text-slate-500">{c.role} • {c.exp} Exp</p>
                  <p className="text-slate-400">{c.location}</p>
                  <button className="w-full py-1.5 bg-navy-900 text-gold-400 font-bold rounded-lg text-[11px]">Request Candidate Interview</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
