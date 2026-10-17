import React from 'react';
import { useApp } from '../context/AppContext';
import { SEO } from '../components/SEO';
import { Compass, Home, Briefcase, Sparkles, Phone, ArrowRight } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

export const NotFound = () => {
  const { navigateTo } = useApp();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-8 py-16">
      <SEO
        title="Page Not Found (404) | Revival International"
        description="The page you are looking for does not exist or has been relocated. Explore Revival International executive recruitment and academic advisory services."
        canonicalPath="404"
        robots="noindex, nofollow"
      />

      <div className="max-w-2xl mx-auto text-center space-y-8">
        <ScrollReveal>
          <div className="relative inline-flex items-center justify-center">
            <span className="text-8xl sm:text-9xl font-serif font-black tracking-tighter text-slate-200 dark:text-navy-800 select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gold-500/10 dark:bg-gold-500/20 text-gold-500 border border-gold-500/30 flex items-center justify-center shadow-gold-glow">
                <Compass className="w-8 h-8 sm:w-10 sm:h-10 animate-spin-slow" />
              </span>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="space-y-3">
            <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
              Error 404 • Resource Not Found
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white">
              The Requested Page Does Not Exist
            </h1>
            <p className="text-sm text-slate-700 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
              The URL you entered may have expired, changed, or does not exist on our server. Use the verified links below to find what you need.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
            <button
              onClick={() => navigateTo('home')}
              className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500/50 hover:shadow-gold-glow transition flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center shrink-0">
                <Home className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-gold-500 transition">Return to Home</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Visit our homepage</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-gold-500 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => navigateTo('services')}
              className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500/50 hover:shadow-gold-glow transition flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-gold-500 transition">Browse Services</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Executive & Education</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-gold-500 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => navigateTo('jobs')}
              className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500/50 hover:shadow-gold-glow transition flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-gold-500 transition">Explore Jobs</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Global Vacancies</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-gold-500 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => navigateTo('contact')}
              className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500/50 hover:shadow-gold-glow transition flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-gold-500 transition">Contact Us</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Dubai HQ consultation</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-gold-500 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};
