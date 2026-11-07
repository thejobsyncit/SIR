import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  CheckCircle2, Plus, Search, Building2, GraduationCap, 
  Award, Clock, Edit3, Trash2, ShieldCheck, Filter 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmPlacementEligibility = () => {
  const [criteria, setCriteria] = useState([
    {
      id: 'CRIT-1',
      company: 'TechVision International',
      role: 'Graduate Cloud Architect',
      degree: 'B.Tech / B.E',
      branch: ['Computer Science', 'Information Technology', 'ECE'],
      minCgpa: 8.0,
      maxBacklogs: 0,
      gradYear: '2026',
      package: '9,500 SGD / month (Singapore)',
      status: 'Active Criteria'
    },
    {
      id: 'CRIT-2',
      company: 'Al Habtoor Contracting LLC',
      role: 'Junior Site Engineer',
      degree: 'B.E / B.Tech',
      branch: ['Civil Engineering', 'Mechanical Engineering'],
      minCgpa: 7.5,
      maxBacklogs: 0,
      gradYear: '2026',
      package: '18,000 AED / month (Dubai)',
      status: 'Active Criteria'
    },
    {
      id: 'CRIT-3',
      company: 'L&T Construction',
      role: 'Graduate Engineer Trainee (GET)',
      degree: 'B.E / B.Tech',
      branch: ['Civil', 'Mechanical', 'EEE'],
      minCgpa: 7.0,
      maxBacklogs: 1,
      gradYear: '2026',
      package: '8.5 - 12 LPA (Domestic India)',
      status: 'Active Criteria'
    },
    {
      id: 'CRIT-4',
      company: 'Emaar Hospitality Group',
      role: 'Executive Management Associate',
      degree: 'BBA / MBA / Hotel Mgmt',
      branch: ['Hospitality Management', 'Business Admin'],
      minCgpa: 6.8,
      maxBacklogs: 0,
      gradYear: '2026',
      package: '14,000 AED / month (Dubai)',
      status: 'Under Review'
    }
  ]);

  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Placement Suite • Feature #3
              </span>
              <span className="text-[10px] font-mono text-slate-400">CRITERIA GOVERNANCE</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Eligibility Management
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Set company-specific criteria such as degree, branch, CGPA, backlogs and graduation year.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
              ● Policy Enforced
            </span>
            <button
              onClick={() => showToast('New eligibility criteria modal opened')}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Configure Criteria</span>
            </button>
          </div>
        </div>

        {toastMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
            {toastMsg}
          </div>
        )}

        {/* 4 Super Admin Style KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Configured Companies</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center border border-blue-100">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">{criteria.length}</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">↗ Employer Hiring Mandates</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Average CGPA Cutoff</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center border border-amber-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">7.3</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ Standard Baseline Cutoff</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Zero Backlog Mandates</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center border border-purple-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">3</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-1 block">↗ Tier-1 Strict Rules</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Eligible Student Pool</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">182</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↗ Qualified Candidates</span>
          </div>
        </div>

        {/* Criteria Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criteria.map(c => (
            <div key={c.id} className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-5 rounded-3xl space-y-3 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{c.company}</h3>
                  <p className="text-xs text-amber-700 dark:text-gold-400 font-bold">{c.role}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                  {c.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-mono pt-1 border-t border-slate-100 dark:border-navy-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Degree:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{c.degree}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Allowed Branches:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{c.branch.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Minimum CGPA:</span>
                  <span className="font-bold text-amber-700 dark:text-gold-400">{c.minCgpa} CGPA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Backlogs:</span>
                  <span className="font-bold">{c.maxBacklogs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Graduation Year:</span>
                  <span className="font-bold">{c.gradYear}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-navy-800">
                  <span className="text-slate-400">Offered CTC:</span>
                  <span className="font-bold text-emerald-600">{c.package}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </ScrollReveal>
  );
};

