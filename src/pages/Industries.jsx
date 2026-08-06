import React from 'react';
import { useApp } from '../context/AppContext';
import { INDUSTRIES_LIST } from '../data/mockData';
import { 
  Building, Flame, HeartPulse, Utensils, Code, Wrench, 
  Factory, ShoppingBag, Truck, PlaneTakeoff, Landmark, GraduationCap, 
  ArrowRight, CheckCircle2, MapPin, Briefcase, DollarSign, Filter, Sparkles, RefreshCw
} from 'lucide-react';

const ICON_MAP = {
  Building,
  Flame,
  HeartPulse,
  Utensils,
  Code,
  Wrench,
  Factory,
  ShoppingBag,
  Truck,
  PlaneTakeoff,
  Landmark,
  GraduationCap
};

export const Industries = () => {
  const { navigateTo, selectedIndustryId, setSelectedIndustryId, navigateToCategoryJobs } = useApp();

  const isFilteredSingle = selectedIndustryId && selectedIndustryId !== 'all';
  const displayedIndustries = isFilteredSingle
    ? INDUSTRIES_LIST.filter((ind) => ind.id === selectedIndustryId)
    : INDUSTRIES_LIST;

  const currentSelectedIndustry = isFilteredSingle 
    ? INDUSTRIES_LIST.find((ind) => ind.id === selectedIndustryId) || INDUSTRIES_LIST[0]
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
          Specialized Industry Verticals
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-navy-900 dark:text-white">
          {currentSelectedIndustry ? `${currentSelectedIndustry.name} Industry Portal` : 'Industries We Serve'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
          Dedicated recruitment desks staffed by former industry veterans across GCC, European, and Asian key growth sectors.
        </p>
      </div>

      {/* Industry Selector Tab Bar */}
      <div className="glass-card bg-slate-50 dark:bg-navy-950 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 dark:border-navy-800 pb-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gold-500" />
            Filter by Sector / Domain:
          </span>
          {isFilteredSingle && (
            <button 
              onClick={() => setSelectedIndustryId('all')}
              className="text-gold-500 hover:underline font-bold flex items-center gap-1 text-[11px]"
            >
              <RefreshCw className="w-3 h-3" />
              Show All Industries ({INDUSTRIES_LIST.length})
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setSelectedIndustryId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
              !selectedIndustryId || selectedIndustryId === 'all'
                ? 'bg-gold-500 text-navy-950 border-gold-500 shadow-gold-glow'
                : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-800 hover:border-gold-500'
            }`}
          >
            ✨ All Industries ({INDUSTRIES_LIST.length})
          </button>
          {INDUSTRIES_LIST.map((ind) => {
            const IconComp = ICON_MAP[ind.icon] || Building;
            const isSelected = selectedIndustryId === ind.id;
            return (
              <button
                key={ind.id}
                onClick={() => setSelectedIndustryId(ind.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-gold-500 text-navy-950 border-gold-500 shadow-gold-glow'
                    : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-800 hover:border-gold-500'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-navy-950' : 'text-gold-500'}`} />
                <span>{ind.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SINGLE INDUSTRY DEDICATED SPOTLIGHT VIEW */}
      {isFilteredSingle && currentSelectedIndustry && (() => {
        const IconComp = ICON_MAP[currentSelectedIndustry.icon] || Building;
        return (
          <div className="glass-card bg-white dark:bg-navy-900 border-2 border-gold-500/60 p-8 rounded-3xl space-y-8 shadow-luxury animate-in fade-in zoom-in-95">
            
            {/* Spotlight Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 dark:border-navy-800 pb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-navy-950 text-gold-500 border-2 border-gold-500/50 flex items-center justify-center font-bold shadow-gold-glow">
                  <IconComp className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-gold-500/20 text-gold-600 dark:text-gold-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase">
                      Dedicated Recruitment Desk
                    </span>
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white mt-1">
                    {currentSelectedIndustry.name} Domain
                  </h2>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-2xl text-right">
                <span className="text-xs text-slate-500 font-semibold block">Live Industry Vacancies</span>
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {currentSelectedIndustry.openJobs} Active Mandates
                </span>
              </div>
            </div>

            {/* Overview & Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              
              {/* Col 1: Overview */}
              <div className="md:col-span-2 space-y-4 glass-card bg-slate-50 dark:bg-navy-950 p-6 rounded-2xl border border-slate-200 dark:border-navy-800">
                <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-500" />
                  Industry Overview & Strategic Focus
                </h3>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-sm">
                  {currentSelectedIndustry.description} SIR Recruitment provides specialized executive search, technical workforce deployment, and MOHRE compliance for tier-1 enterprises operating across this vertical in UAE, Saudi Arabia, Qatar, and international markets.
                </p>

                {/* Key Roles Recrypted */}
                {currentSelectedIndustry.keyRoles && (
                  <div className="pt-2 space-y-2">
                    <h4 className="font-bold text-navy-900 dark:text-white">Primary Executive & Technical Roles Recrypted:</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentSelectedIndustry.keyRoles.map((role, idx) => (
                        <span key={idx} className="bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-navy-700 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Col 2: Salary & Locations */}
              <div className="space-y-4 glass-card bg-navy-950 text-white p-6 rounded-2xl border border-gold-500/40 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-serif text-base font-bold text-gold-400 border-b border-navy-800 pb-2">
                    Key Hiring Metrics
                  </h3>

                  {currentSelectedIndustry.destinations && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Top GCC & Global Locations</span>
                      <div className="space-y-1.5">
                        {currentSelectedIndustry.destinations.map((loc, idx) => (
                          <div key={idx} className="flex items-center gap-2 font-bold text-slate-200">
                            <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                            <span>{loc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentSelectedIndustry.avgSalary && (
                    <div className="pt-2 border-t border-navy-800">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Typical Tax-Free Salary Bracket</span>
                      <p className="font-bold text-gold-400 text-base">{currentSelectedIndustry.avgSalary}</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => navigateToCategoryJobs(currentSelectedIndustry.category || currentSelectedIndustry.name)}
                  className="w-full mt-4 py-3 bg-gold-shimmer text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center space-x-2"
                >
                  <span>Explore Jobs in {currentSelectedIndustry.name} ({currentSelectedIndustry.openJobs})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Back Button */}
            <div className="flex justify-between items-center pt-2">
              <button 
                onClick={() => setSelectedIndustryId('all')}
                className="px-5 py-2.5 bg-slate-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-2 border border-slate-300 dark:border-navy-700"
              >
                ← View All 12 Industries
              </button>
            </div>

          </div>
        );
      })()}

      {/* ALL INDUSTRIES GRID (Displayed when 'All' is selected) */}
      {!isFilteredSingle && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedIndustries.map((ind) => {
            const IconComp = ICON_MAP[ind.icon] || Building;
            return (
              <div 
                key={ind.id}
                id={`industry-${ind.id}`}
                className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 transition duration-300 hover:border-gold-500 shadow-glass flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="w-12 h-12 rounded-xl bg-navy-950 text-gold-500 border border-gold-500/30 flex items-center justify-center font-bold shadow-sm group-hover:scale-110 transition duration-300">
                      <IconComp className="w-6 h-6" />
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
                      {ind.openJobs} Openings
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white group-hover:text-gold-500 transition">
                    {ind.name}
                  </h3>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {ind.description}
                  </p>

                  {ind.keyRoles && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {ind.keyRoles.slice(0, 3).map((r, idx) => (
                        <span key={idx} className="bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-navy-800">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-navy-800">
                  <button 
                    onClick={() => setSelectedIndustryId(ind.id)}
                    className="w-full py-2.5 bg-gold-500/10 hover:bg-gold-500 text-gold-600 hover:text-navy-950 dark:text-gold-400 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1 border border-gold-500/30"
                  >
                    <span>View {ind.name} Domain Only</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={() => navigateToCategoryJobs(ind.category || ind.name)}
                    className="w-full py-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition text-center"
                  >
                    Explore {ind.openJobs} Open Jobs →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
