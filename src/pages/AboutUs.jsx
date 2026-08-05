import React from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Globe, Shield, Award, Users, CheckCircle2, MapPin, Target, Eye } from 'lucide-react';

export const AboutUs = () => {
  const { navigateTo } = useApp();

  const leadership = [
    { name: 'Sheikh Rashid Al-Maktoum', role: 'Chairman & Strategic Advisor', bio: 'Former senior advisor on GCC human capital development and cross-border trade affairs.' },
    { name: 'David Sterling, MBA', role: 'Global Managing Director', bio: '20+ years leading executive headhunting firms across London, Singapore, and Dubai.' },
    { name: 'Fatima Al-Zahra', role: 'Head of GCC Legal & Visa Compliance', bio: 'Leading authority on UAE MOHRE employment laws, Iqama quotas, and embassy attestations.' },
    { name: 'Rajesh Kumar', role: 'Director of Manpower Operations', bio: 'Overseen placement of over 35,000 skilled engineers and technicians across oil & gas and construction.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3.5 py-1 rounded-full uppercase">
          About SIR Recruitment
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-navy-900 dark:text-white tracking-tight">
          Dubai's Premier International HR & Talent Gateway
        </h1>
<<<<<<< HEAD
        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
=======
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
>>>>>>> 07ac5c3a07e2c57e0ebb677f1885544f5b93c946
          Founded in Dubai, United Arab Emirates, SIR Recruitment has established itself as the preferred partner for Fortune 500 multinationals, GCC conglomerates, and government bodies seeking world-class human capital.
        </p>
      </div>

      {/* Office Visual Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-luxury border border-gold-500/30 max-h-[420px]">
        <img 
          src="/images/dubai_office.png" 
          alt="SIR Recruitment Dubai HQ" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent flex items-end p-8">
          <div className="text-white space-y-2">
            <div className="flex items-center space-x-2 text-gold-400 text-xs font-bold">
              <MapPin className="w-4 h-4" />
              <span>Headquarters: Rolex Tower, Financial Center Road, Business Bay, Dubai</span>
            </div>
            <h3 className="font-serif text-2xl font-bold">Global Presence, Uncompromised GCC Standards</h3>
          </div>
        </div>
      </div>

      {/* Mission & Vision Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-8 rounded-3xl space-y-4 shadow-glass">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-500 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">Our Mission</h3>
<<<<<<< HEAD
          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
=======
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
>>>>>>> 07ac5c3a07e2c57e0ebb677f1885544f5b93c946
            To bridge global talent reserves with high-growth employment markets across the UAE, Saudi Arabia, Qatar, Europe, and Asia through transparent, tech-enabled, and fully compliant recruitment solutions.
          </p>
        </div>

        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-8 rounded-3xl space-y-4 shadow-glass">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-500 flex items-center justify-center font-bold">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">Our Vision</h3>
<<<<<<< HEAD
          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
=======
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
>>>>>>> 07ac5c3a07e2c57e0ebb677f1885544f5b93c946
            To be recognized globally as the most trusted human capital consultancy in the Middle East, setting benchmark standards in background verification, executive search, and ethical manpower deployment.
          </p>
        </div>
      </div>

      {/* Leadership Team */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold text-gold-500 uppercase tracking-widest">Leadership</h2>
          <h3 className="font-serif text-3xl font-extrabold text-navy-900 dark:text-white">Executive Management Team</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadership.map((member, idx) => (
            <div key={idx} className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-3 shadow-sm text-center">
              <div className="w-20 h-20 rounded-full bg-navy-950 text-gold-500 border-2 border-gold-500 flex items-center justify-center font-serif text-2xl font-bold mx-auto">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h4 className="font-bold text-sm text-navy-900 dark:text-white">{member.name}</h4>
              <p className="text-[10px] uppercase font-bold text-gold-500 tracking-wider">{member.role}</p>
<<<<<<< HEAD
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{member.bio}</p>
=======
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{member.bio}</p>
>>>>>>> 07ac5c3a07e2c57e0ebb677f1885544f5b93c946
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
