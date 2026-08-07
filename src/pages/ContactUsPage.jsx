import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2, Globe, Building2 } from 'lucide-react';
import { useCrm } from '../crm/context/CrmContext';

export const ContactUsPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const { addClient } = useCrm();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Push the website inquiry to the CRM as a Lead
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.type === 'employer' ? 'Corporate Inquiry' : 'Individual',
          message: data.message
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-16">

      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3.5 py-1 rounded-full uppercase">
          Global Office Locations
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-navy-900 dark:text-white">
          Contact SIR Recruitment
        </h1>
        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
          Speak directly with our senior headhunters, legal visa advisors, or corporate client relationship managers in Dubai.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Office Contact Info */}
        <div className="lg:col-span-5 space-y-6">

          {/* Dubai HQ Card */}
          <div className="glass-card bg-white dark:bg-navy-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-gold-500/40 shadow-luxury space-y-4">
            <div className="flex items-center space-x-3 text-gold-600 dark:text-gold-400 border-b border-slate-200 dark:border-navy-800 pb-3">
              <Building2 className="w-6 h-6" />
              <div>
                <h3 className="font-serif text-xl font-bold text-navy-950 dark:text-white">Dubai Headquarters</h3>
                <p className="text-[10px] uppercase text-gold-600 dark:text-gold-400 font-bold tracking-widest">Global Executive Hub</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-800 dark:text-slate-200 font-medium">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0 mt-0.5" />
                <span className="text-slate-800 dark:text-slate-200 font-semibold">Level 34, Rolex Tower, Financial Center Road, Business Bay, Dubai, UAE</span>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                <span className="text-slate-800 dark:text-slate-200 font-semibold">+971 4 123 4567 / +971 50 987 6543</span>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                <span className="text-slate-800 dark:text-slate-200 font-semibold">dubai@sirrecruitment.com</span>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                <span className="text-slate-800 dark:text-slate-200 font-semibold">Monday – Friday: 08:30 AM – 06:00 PM GST</span>
              </div>
            </div>

            <a
              href="https://wa.me/971509876543"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition shadow-md mt-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Instant WhatsApp Consultation</span>
            </a>
          </div>

          {/* Additional Global Branches */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="glass-card bg-white dark:bg-navy-900 border p-4 rounded-xl space-y-1">
              <h4 className="font-bold text-navy-900 dark:text-white">🇸🇦 Riyadh Branch</h4>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] font-medium">King Fahd Road, Olaya District, Riyadh</p>
              <p className="text-gold-500 font-semibold">+966 11 987 6543</p>
            </div>
            <div className="glass-card bg-white dark:bg-navy-900 border p-4 rounded-xl space-y-1">
              <h4 className="font-bold text-navy-900 dark:text-white">🇬🇧 London Office</h4>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] font-medium">30 St Mary Axe, City of London</p>
              <p className="text-gold-500 font-semibold">+44 20 7946 0912</p>
            </div>
          </div>

        </div>

        {/* Inquiry Form & Map */}
        <div className="lg:col-span-7 glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 rounded-3xl space-y-4 shadow-luxury text-xs">
          <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">Send Corporate or Candidate Inquiry</h3>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Your Name</label>
                  <input name="name" required type="text" placeholder="John Doe" className="w-full bg-slate-50 dark:bg-navy-950 border rounded-xl p-2.5 text-navy-900 dark:text-white" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Email Address</label>
                  <input name="email" required type="email" placeholder="john@company.com" className="w-full bg-slate-50 dark:bg-navy-950 border rounded-xl p-2.5 text-navy-900 dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Phone / WhatsApp</label>
                  <input name="phone" required type="text" placeholder="+971 50 ..." className="w-full bg-slate-50 dark:bg-navy-950 border rounded-xl p-2.5 text-navy-900 dark:text-white" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">I am a...</label>
                  <select name="type" className="w-full bg-slate-50 dark:bg-navy-950 border rounded-xl p-2.5 text-navy-900 dark:text-white">
                    <option value="employer">Employer looking to hire talent</option>
                    <option value="candidate">Candidate searching for jobs</option>
                    <option value="verification">Requesting Background Verification</option>
                    <option value="visa">Inquiring about GCC Visa Processing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Message Details</label>
                <textarea name="message" rows={4} placeholder="Specify your requirements, hiring volume, or visa target..." className="w-full bg-slate-50 dark:bg-navy-950 border rounded-xl p-2.5 text-navy-900 dark:text-white" />
              </div>

              <button type="submit" className="w-full py-3.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow flex items-center justify-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Submit Direct Inquiry to Dubai Team</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="font-serif text-lg font-bold text-navy-900 dark:text-white">Inquiry Received!</h4>
              <p className="text-slate-800 dark:text-slate-200 font-medium">A SIR Recruitment executive will respond to your email within 2 business hours.</p>
              <button onClick={() => setSubmitted(false)} className="px-6 py-2.5 bg-navy-900 text-white font-bold rounded-xl">Send Another Inquiry</button>
            </div>
          )}

          {/* Interactive Map Embed Visual Simulation */}
          <div className="pt-4">
            <div className="p-4 bg-slate-100 dark:bg-navy-950 border rounded-2xl text-center space-y-1">
              <p className="font-bold text-navy-900 dark:text-white">📍 Interactive Location Map</p>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Rolex Tower • Business Bay • Dubai International Financial Centre (DIFC)</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
