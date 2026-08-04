import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SERVICES_LIST } from '../data/mockData';
import { Briefcase, ArrowRight, CheckCircle2, Phone, Mail, FileText } from 'lucide-react';

export const Services = () => {
  const { navigateTo, setActiveModal } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedService, setSelectedService] = useState(null);

  const categories = ['All', 'Recruitment', 'Executive', 'Staffing', 'Visa & Legal', 'Verification', 'Consulting', 'Operations', 'Career'];

  const filteredServices = selectedCategory === 'All' 
    ? SERVICES_LIST 
    : SERVICES_LIST.filter(s => s.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3.5 py-1 rounded-full uppercase">
          Full-Service HR Portfolio
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-navy-900 dark:text-white">
          Our Executive Services
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Complete end-to-end talent solutions, visa processing, background checks, and strategic HR consulting tailored to UAE & global standards.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedCategory === cat
                ? 'bg-gold-shimmer text-navy-950 shadow-gold-glow'
                : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:border-gold-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid (18 Services) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((srv) => (
          <div 
            key={srv.id}
            className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 hover:border-gold-500 transition duration-300 shadow-glass flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  {srv.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">#{srv.id}</span>
              </div>
              
              <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                {srv.title}
              </h3>
              
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {srv.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex justify-between items-center">
              <button 
                onClick={() => setSelectedService(srv)}
                className="text-xs font-bold text-navy-900 dark:text-gold-400 hover:underline flex items-center gap-1"
              >
                <span>Service Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => navigateTo('contact')}
                className="px-3 py-1.5 bg-navy-900 text-gold-400 hover:bg-gold-500 hover:text-navy-950 font-bold text-[11px] rounded-lg transition"
              >
                Inquire
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/40 p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-luxury">
            <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">{selectedService.title}</h3>
            <span className="bg-gold-500/20 text-gold-500 text-xs font-bold px-2 py-1 rounded">{selectedService.category}</span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{selectedService.description}</p>
            <div className="p-3 bg-slate-100 dark:bg-navy-800 rounded-xl text-xs space-y-1">
              <p className="font-bold text-navy-900 dark:text-white">Key Deliverables:</p>
              <p>• Full SLA compliance with 90-day retention guarantee.</p>
              <p>• Direct coordination with Dubai MOHRE & Embassy offices.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setSelectedService(null)} className="flex-1 py-2 bg-slate-200 dark:bg-navy-800 text-xs font-bold rounded-xl">Close</button>
              <button onClick={() => { setSelectedService(null); navigateTo('contact'); }} className="flex-1 py-2 bg-gold-shimmer text-navy-950 text-xs font-bold rounded-xl">Inquire Now</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
