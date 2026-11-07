import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  Building2, Users, MapPin, Mail, Phone, Briefcase, 
  Plus, Search, ExternalLink, Award, CheckCircle2, Globe 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmPlacementCompanies = () => {
  const [companies, setCompanies] = useState([
    {
      id: 'CMP-101',
      name: 'TechVision International',
      industry: 'Cloud Infrastructure & Fintech',
      location: 'Singapore (APAC HQ)',
      contactPerson: 'David Tan (Head of Campus Talent)',
      email: 'david.tan@techvision.sg',
      phone: '+65 6789 0123',
      hiringHistory: '28 Students Placed across 3 Batches',
      currentDrives: 2,
      activeRoles: ['Graduate Cloud Architect', 'DevOps Associate'],
      packageRange: '9,000 - 12,000 SGD / month',
      tier: 'Tier-1 International'
    },
    {
      id: 'CMP-102',
      name: 'Al Habtoor Contracting LLC',
      industry: 'Mega Infrastructure & EPC',
      location: 'Dubai, UAE',
      contactPerson: 'Eng. Khalid Al-Habtoor',
      email: 'khalid.hiring@habtoorcontracting.ae',
      phone: '+971 4 399 5555',
      hiringHistory: '42 Engineers Placed since 2023',
      currentDrives: 1,
      activeRoles: ['Junior Site Engineer', 'Planning Associate'],
      packageRange: '18,000 - 24,000 AED / month',
      tier: 'Tier-1 GCC Global'
    },
    {
      id: 'CMP-103',
      name: 'L&T Construction',
      industry: 'Industrial & Civil EPC',
      location: 'Chennai, India',
      contactPerson: 'S. Ramanathan (Lead HR)',
      email: 'ramanathan@intecc.com',
      phone: '+91 44 2256 7000',
      hiringHistory: '94 Engineers Placed since 2021',
      currentDrives: 1,
      activeRoles: ['Graduate Engineer Trainee (GET)'],
      packageRange: '8.5 - 14 LPA (INR)',
      tier: 'Marquee Domestic'
    },
    {
      id: 'CMP-104',
      name: 'Emaar Hospitality Group',
      industry: 'Luxury Hospitality & Resorts',
      location: 'Dubai, UAE',
      contactPerson: 'Priya Nambiar (Talent Partner)',
      email: 'pnambiar@emaar.ae',
      phone: '+971 4 367 3333',
      hiringHistory: '19 Associates Placed',
      currentDrives: 1,
      activeRoles: ['Executive Management Trainee'],
      packageRange: '14,000 - 18,000 AED / month',
      tier: 'Tier-1 Luxury'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const filtered = companies.filter(c => 
    !searchQuery || 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Placement Suite • Feature #4
              </span>
              <span className="text-[10px] font-mono text-slate-400">CORPORATE RELATIONS</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Company Management
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Maintain employer profiles, contact persons, job details and hiring history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
              ● Corporate Partners Active
            </span>
            <button
              onClick={() => showToast('New corporate employer modal opened')}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Employer</span>
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
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Corporate Partners</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center border border-purple-100">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">48</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-1 block">↗ MoUs & Campus Mandates</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">International Recruiters</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center border border-blue-100">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">18</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">↗ GCC & Singapore Firms</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Live Active Drives</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center border border-amber-100">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">6</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ In Progress This Month</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Historical Placements</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">183</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↗ Cumulative Hires</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search company by name, location, or industry..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold focus:outline-none"
          />
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(cmp => (
            <div key={cmp.id} className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-5 rounded-3xl space-y-3 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{cmp.name}</h3>
                  <p className="text-[11px] text-slate-500">{cmp.industry}</p>
                  <span className="text-[10px] font-mono text-amber-700 dark:text-gold-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {cmp.location}
                  </span>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200">
                  {cmp.tier}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-100 dark:border-navy-800 space-y-1 text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Contact: <span className="font-medium">{cmp.contactPerson}</span>
                </p>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>{cmp.email}</span>
                  <span>{cmp.phone}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs font-mono pt-1 text-slate-600 dark:text-slate-300">
                <p>Track Record: <strong className="text-emerald-600">{cmp.hiringHistory}</strong></p>
                <p>Package Offered: <strong className="text-amber-700 dark:text-gold-400">{cmp.packageRange}</strong></p>
                <p>Open Roles: <strong className="text-slate-800 dark:text-slate-200">{cmp.activeRoles.join(', ')}</strong></p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </ScrollReveal>
  );
};

