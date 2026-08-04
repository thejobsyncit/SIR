import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, FileText, Sparkles, CheckCircle2, Clock, Calendar, Bookmark, Bell, Upload, Shield, ArrowRight } from 'lucide-react';

export const CandidatePortal = () => {
  const { user, applications, savedJobs, setActiveModal, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'applications' | 'saved' | 'interviews'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      
      {/* Profile Header */}
      <div className="glass-card bg-navy-950 text-white rounded-3xl p-6 sm:p-8 border border-gold-500/30 shadow-luxury flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gold-500 text-navy-950 font-serif font-extrabold text-2xl flex items-center justify-center border-2 border-white">
            {user.name.split(' ').map(n=>n[0]).join('')}
          </div>
          <div>
            <span className="bg-gold-500/20 text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Verified Executive Profile</span>
            <h1 className="font-serif text-2xl font-bold text-white mt-1">{user.name}</h1>
            <p className="text-xs text-slate-400">{user.email} • Candidate ID: SIR-CAN-88219</p>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setActiveModal('ai-resume')}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-gold-500/20 text-gold-400 border border-gold-500/40 hover:bg-gold-500 hover:text-navy-950 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI ATS Score CV</span>
          </button>
          
          <button 
            onClick={() => setActiveModal('resume-builder')}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow flex items-center justify-center space-x-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>PDF Resume Builder</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-navy-800 text-xs font-bold">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`pb-3 px-4 transition ${activeTab === 'dashboard' ? 'border-b-2 border-gold-500 text-gold-500' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Profile Overview
        </button>
        <button 
          onClick={() => setActiveTab('applications')} 
          className={`pb-3 px-4 transition ${activeTab === 'applications' ? 'border-b-2 border-gold-500 text-gold-500' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Applications ({applications.length})
        </button>
        <button 
          onClick={() => setActiveTab('saved')} 
          className={`pb-3 px-4 transition ${activeTab === 'saved' ? 'border-b-2 border-gold-500 text-gold-500' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Saved Jobs ({savedJobs.length})
        </button>
        <button 
          onClick={() => setActiveTab('interviews')} 
          className={`pb-3 px-4 transition ${activeTab === 'interviews' ? 'border-b-2 border-gold-500 text-gold-500' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Interview Schedule (1)
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Resume Card */}
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-500" />
              Active CV & Documents
            </h3>
            <div className="p-4 bg-slate-100 dark:bg-navy-800 rounded-xl space-y-2 text-xs">
              <p className="font-bold text-navy-900 dark:text-white">{user.resumeName}</p>
              <p className="text-slate-500">Uploaded 2 days ago • PDF Format</p>
              <div className="flex items-center gap-1 text-emerald-500 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>GCC ATS Score: 92% (High Compatibility)</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveModal('ai-resume')}
              className="w-full py-2.5 bg-navy-900 text-white font-bold text-xs rounded-xl hover:bg-navy-800"
            >
              Re-Analyze CV with AI
            </button>
          </div>

          {/* Active Application Timeline Tracker */}
          <div className="lg:col-span-2 glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold-500" />
              Real-Time Application Status Tracker
            </h3>

            {applications.map((app) => (
              <div key={app.id} className="p-4 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl space-y-3">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <h4 className="font-bold text-navy-900 dark:text-white text-sm">{app.jobTitle}</h4>
                    <p className="text-slate-500">{app.company} • {app.country}</p>
                  </div>
                  <span className="bg-gold-500/20 text-gold-500 font-bold px-2.5 py-1 rounded text-[11px]">
                    {app.status}
                  </span>
                </div>

                {/* Progress Steps */}
                <div className="grid grid-cols-6 gap-1 pt-2 text-[10px] text-center font-bold">
                  <div className="p-1 bg-emerald-500 text-white rounded">1. Applied</div>
                  <div className="p-1 bg-emerald-500 text-white rounded">2. Screened</div>
                  <div className="p-1 bg-gold-500 text-navy-950 rounded animate-pulse">3. Interview</div>
                  <div className="p-1 bg-slate-200 dark:bg-navy-800 text-slate-400 rounded">4. Offer</div>
                  <div className="p-1 bg-slate-200 dark:bg-navy-800 text-slate-400 rounded">5. Visa</div>
                  <div className="p-1 bg-slate-200 dark:bg-navy-800 text-slate-400 rounded">6. Placed</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl flex justify-between items-center text-xs">
              <div>
                <h4 className="font-bold text-base text-navy-900 dark:text-white">{app.jobTitle}</h4>
                <p className="text-slate-500">{app.company} • Applied on {app.appliedDate}</p>
              </div>
              <span className="px-3 py-1 bg-gold-500/20 text-gold-500 font-bold rounded-lg">{app.status}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'interviews' && (
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl text-xs space-y-3">
          <div className="flex items-center space-x-3 text-gold-500 font-bold">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">Upcoming Panel Interview with Al Habtoor Contracting LLC</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300">Scheduled Date: <strong>August 8, 2026 at 14:00 GST (Dubai Time)</strong></p>
          <p className="text-slate-500">Format: Executive Microsoft Teams Video Panel with HR Director & VP of Construction.</p>
          <button className="px-4 py-2 bg-navy-900 text-white font-bold rounded-lg hover:bg-gold-500 hover:text-navy-950 transition">
            Join MS Teams Meeting Link →
          </button>
        </div>
      )}

    </div>
  );
};
