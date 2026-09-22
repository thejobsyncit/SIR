import React, { useState } from 'react';
import { LayoutTemplate, Edit3, Save } from 'lucide-react';

export const ErpCmsPages = () => {
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState('');

  const handleSave = () => {
    setToast('Changes saved successfully.');
    setTimeout(() => setToast(''), 3000);
  };

  const pages = [
    { id: 'home', title: 'Home Page', url: '/', lastUpdated: '2 days ago', status: 'Published' },
    { id: 'about', title: 'About Us', url: '/about', lastUpdated: '1 week ago', status: 'Published' },
    { id: 'services', title: 'Services', url: '/services', lastUpdated: '3 weeks ago', status: 'Published' },
    { id: 'visa', title: 'Visa Eligibility', url: '/visa-eligibility', lastUpdated: '1 month ago', status: 'Published' },
    { id: 'bgv', title: 'Background Verification', url: '/background-verification', lastUpdated: '2 months ago', status: 'Published' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center relative">
        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">Website Pages Content</h2>
        {toast && (
          <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-4 py-2 rounded-xl border border-emerald-500/30 text-sm animate-in fade-in slide-in-from-right-4">
            {toast}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-4 shadow-sm h-full">
            <h3 className="font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 px-2">Site Pages</h3>
            <div className="space-y-2">
              {pages.map(page => (
                <button
                  key={page.id}
                  onClick={() => setEditing(page.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-colors ${
                    editing === page.id 
                      ? 'bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-400' 
                      : 'hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutTemplate className={`w-5 h-5 ${editing === page.id ? 'text-gold-500' : 'text-slate-400'}`} />
                    <span className="font-bold text-sm">{page.title}</span>
                  </div>
                  {page.status === 'Published' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {editing ? (
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">{pages.find(p => p.id === editing)?.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">URL path: {pages.find(p => p.id === editing)?.url}</p>
                </div>
                <button onClick={handleSave} className="bg-gradient-to-r from-gold-600 to-gold-500 text-navy-950 font-bold px-4 py-2 rounded-xl text-sm shadow-glass-gold hover:shadow-gold-glow transition flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>

              <div key={editing} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">Meta Title (SEO)</label>
                  <input type="text" defaultValue={`${pages.find(p => p.id === editing)?.title} | Revival International`} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:border-gold-500 focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">Main Heading (H1)</label>
                  <input type="text" defaultValue={pages.find(p => p.id === editing)?.title} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:border-gold-500 focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">Page Content / Description</label>
                  <textarea rows={8} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:border-gold-500 focus:outline-none" defaultValue={`This is the editable content for the ${pages.find(p => p.id === editing)?.title} page.`} />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl border-dashed">
              <div className="w-16 h-16 bg-slate-100 dark:bg-navy-800 rounded-full flex items-center justify-center mb-4">
                <Edit3 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Select a page to edit</h3>
              <p className="text-sm text-slate-500 mt-2">Click on any page in the list to update its content, meta tags, and images.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
