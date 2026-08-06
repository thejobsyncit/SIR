import React from 'react';
import { useApp } from '../context/AppContext';
import { INDUSTRIES_LIST } from '../data/mockData';
import { Building, Flame, HeartPulse, Utensils, Code, Wrench, Factory, ShoppingBag, Truck, PlaneTakeoff, Landmark, GraduationCap, ArrowRight } from 'lucide-react';

export const Industries = () => {
  const { navigateTo, selectedIndustryId } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3.5 py-1 rounded-full uppercase">
          Specialized Industry Verticals
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-navy-900 dark:text-white">
          Industries We Serve
        </h1>
        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
          Dedicated recruitment desks staffed by former industry veterans across GCC, European, and Asian key growth sectors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INDUSTRIES_LIST.map((ind) => (
          <div 
            key={ind.id}
            id={`industry-${ind.id}`}
            className={`glass-card bg-white dark:bg-navy-900 border p-6 rounded-2xl space-y-4 transition duration-500 shadow-glass flex flex-col justify-between ${
              selectedIndustryId === ind.id 
                ? 'ring-2 ring-gold-500 border-gold-500 scale-[1.02] shadow-gold-glow' 
                : 'border-slate-200 dark:border-navy-800 hover:border-gold-500'
            }`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="w-10 h-10 rounded-xl bg-navy-950 text-gold-500 border border-gold-500/30 flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </span>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {ind.openJobs} Active Openings
                </span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">
                {ind.name}
              </h3>

              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {ind.description}
              </p>
            </div>

            <button 
              onClick={() => navigateTo('jobs')}
              className="w-full py-2.5 bg-slate-200/80 dark:bg-navy-800 text-slate-900 dark:text-slate-100 hover:bg-gold-500 hover:text-navy-950 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1"
            >
              <span>Explore Roles in {ind.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
