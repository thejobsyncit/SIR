import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2, Globe, Building2, AlertCircle, X, Sparkles, Loader2 } from 'lucide-react';
import { useCrm } from '../crm/context/CrmContext';
import { useApp } from '../context/AppContext';
import { SERVICES_LIST } from '../data/mockData';
import ScrollReveal from '../components/ScrollReveal';
import { SEO } from '../components/SEO';

export const ContactUsPage = () => {
  const { selectedServiceId, setSelectedServiceId, navigateTo } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [phone, setPhone] = useState('');

  // Local state for currently selected service dropdown
  const [activeServiceId, setActiveServiceId] = useState(selectedServiceId || '');

  // Keep in sync if context changes
  useEffect(() => {
    if (selectedServiceId) {
      setActiveServiceId(selectedServiceId);
    }
  }, [selectedServiceId]);

  const activeService = SERVICES_LIST.find(s => s.id === activeServiceId) || null;

  const handlePhoneChange = (e) => {
    // Only allow numeric digits and strictly limit to 10 digits
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
    if (formErrors.phone) {
      setFormErrors(prev => ({ ...prev, phone: null }));
    }
  };

  const handlePhoneKeyDown = (e) => {
    // Allow control/navigation keys: Backspace, Delete, Tab, Arrow keys, Enter
    if (
      ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(e.key) ||
      e.ctrlKey || e.metaKey
    ) {
      return;
    }
    // Block any non-numeric key
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }
    // Block typing if already 10 digits and nothing is selected
    const selection = window.getSelection()?.toString() || '';
    if (phone.length >= 10 && selection.length === 0) {
      e.preventDefault();
    }
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    const digitsOnly = paste.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
    if (formErrors.phone) {
      setFormErrors(prev => ({ ...prev, phone: null }));
    }
  };

  const validate = (data) => {
    const errors = {};
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Please provide your full name (minimum 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
    const cleanPhone = (phone || data.phone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      errors.phone = 'Please provide your 10-digit phone or WhatsApp number.';
    } else if (cleanPhone.length !== 10) {
      errors.phone = `Phone number must be exactly 10 digits (currently ${cleanPhone.length}/10).`;
    }
    if (!data.message || data.message.trim().length < 10) {
      errors.message = 'Please provide message details (minimum 10 characters).';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const errors = validate(data);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);

    const payload = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: (phone || data.phone || '').trim(),
      serviceId: activeService ? activeService.id : null,
      serviceTitle: activeService ? activeService.title : null,
      company: activeService 
        ? `Service Inquiry: ${activeService.title}` 
        : (data.type === 'employer' ? 'Corporate Inquiry' : 'Individual'),
      message: activeService 
        ? `[Inquiring about: ${activeService.title} (${activeService.category})]\n\n${data.message.trim()}`
        : data.message.trim()
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Server was unable to record your inquiry. Please try again.');
      }

      const generatedRef = result.referenceNumber || (result.data && result.data.referenceNumber) || (result.lead && result.lead.referenceNumber) || null;
      setSubmittedRef(generatedRef);
      setSubmitted(true);
      setPhone('');
      if (setSelectedServiceId) setSelectedServiceId(null);
      setActiveServiceId('');
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      setSubmitError(err.message || 'Unable to submit your inquiry at this moment. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-16">
      <SEO
        title="Contact Revival International Dubai | Executive Recruitment & Academic Advisory"
        description="Connect directly with Revival International Dubai for international executive search, corporate staffing, university admissions advisory, and exam preparation."
        canonicalPath="contact"
        keywords="contact Revival International, Dubai recruitment agency, international consulting Dubai, study abroad advisory contact, Rolex Tower Dubai"
        breadcrumbs={[
          { name: 'Home', item: '' },
          { name: 'Contact Us', item: 'contact' }
        ]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact Revival International',
          description: 'Official contact portal for executive recruitment, academic advisory, and corporate consulting at Revival International Dubai.',
          url: 'https://www.revivalinternational.com/contact',
          mainEntity: {
            '@type': 'Organization',
            name: 'Revival International',
            telephone: '+971-4-123-4567',
            email: 'dubai@revivalinternational.com',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Level 34, Rolex Tower, Financial Center Road, Business Bay',
              addressLocality: 'Dubai',
              addressCountry: 'AE'
            }
          }
        }}
      />

      {/* Header */}
      <ScrollReveal>
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
            Direct Executive & Advisory Consultation
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-navy-900 dark:text-white">
            Contact Revival International
          </h1>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            Connect directly with our senior talent acquisition leads, international education counselors, and corporate client managers in Dubai.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Office Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <ScrollReveal delay={0.2}>
            {/* Dubai HQ Card */}
            <div className="glass-card bg-white dark:bg-navy-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-gold-500/40 shadow-luxury space-y-4">
              <div className="flex items-center space-x-3 text-gold-600 dark:text-gold-400 border-b border-slate-200 dark:border-navy-800 pb-3">
                <Building2 className="w-6 h-6" />
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Dubai Headquarters</h3>
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
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">dubai@revivalinternational.com</span>
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
          </ScrollReveal>

          {/* Additional Global Branches */}
          <ScrollReveal delay={0.3}>
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
          </ScrollReveal>

        </div>

        {/* Inquiry Form */}
        <div className="lg:col-span-7 glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 rounded-3xl space-y-4 shadow-luxury text-xs">
          <div>
            <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
              Send Direct Inquiry or Consultation Request
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
              Please provide your details below. Our advisory and recruitment team in Dubai will review your requirements and get in touch promptly.
            </p>
          </div>

          {/* Carried Service Context Pill */}
          {activeService && !submitted && (
            <div className="p-3.5 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gold-600 dark:text-gold-400 tracking-wider">Selected Service of Interest</p>
                  <p className="font-serif font-bold text-sm text-navy-900 dark:text-white">{activeService.title}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setActiveServiceId('');
                  if (setSelectedServiceId) setSelectedServiceId(null);
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-rose-500 flex items-center gap-1 p-1 rounded hover:bg-slate-200 dark:hover:bg-navy-800 transition"
                title="Clear selected service"
                aria-label="Clear selected service"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-start gap-2.5" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Submission Error</p>
                <p className="text-[11px]">{submitError}</p>
              </div>
            </div>
          )}

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="contact-name" className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    id="contact-name"
                    name="name" 
                    required 
                    type="text" 
                    autoComplete="name"
                    placeholder="John Doe" 
                    onChange={() => {
                      if (formErrors.name) setFormErrors(prev => ({ ...prev, name: null }));
                    }}
                    className={`w-full bg-slate-50 dark:bg-navy-950 border rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                      formErrors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
                    }`} 
                  />
                  {formErrors.name && (
                    <p className="text-[10px] text-rose-500 mt-1 font-semibold">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="contact-email" className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    id="contact-email"
                    name="email" 
                    required 
                    type="email" 
                    autoComplete="email"
                    placeholder="john@company.com" 
                    onChange={() => {
                      if (formErrors.email) setFormErrors(prev => ({ ...prev, email: null }));
                    }}
                    className={`w-full bg-slate-50 dark:bg-navy-950 border rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                      formErrors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
                    }`} 
                  />
                  {formErrors.email && (
                    <p className="text-[10px] text-rose-500 mt-1 font-semibold">{formErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="contact-phone" className="block font-bold text-slate-700 dark:text-slate-200">
                      Phone / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-[10px] font-mono font-bold ${phone.length === 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {phone.length}/10 digits
                    </span>
                  </div>
                  <input 
                    id="contact-phone"
                    name="phone" 
                    required 
                    type="tel" 
                    autoComplete="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={phone}
                    onChange={handlePhoneChange}
                    onKeyDown={handlePhoneKeyDown}
                    onPaste={handlePhonePaste}
                    placeholder="Enter 10-digit mobile number" 
                    className={`w-full bg-slate-50 dark:bg-navy-950 border rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono tracking-wider ${
                      formErrors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
                    }`} 
                  />
                  {formErrors.phone ? (
                    <p className="text-[10px] text-rose-500 mt-1 font-semibold">{formErrors.phone}</p>
                  ) : (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Only numbers allowed • Maximum 10 digits</p>
                  )}
                </div>
                <div>
                  <label htmlFor="contact-type" className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    I am a...
                  </label>
                  <select 
                    id="contact-type"
                    name="type" 
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="individual">Individual Candidate or Student</option>
                    <option value="employer">Employer looking to hire talent</option>
                    <option value="student_parent">Student or Parent seeking Guidance</option>
                    <option value="verification">Requesting Background Verification</option>
                    <option value="visa">Inquiring about GCC Visa Processing</option>
                  </select>
                </div>
              </div>

              {/* Service Selection Dropdown */}
              <div>
                <label htmlFor="contact-service" className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Specific Service Requirement
                </label>
                <select 
                  id="contact-service"
                  value={activeServiceId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setActiveServiceId(newId);
                    if (setSelectedServiceId) setSelectedServiceId(newId || null);
                  }}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">-- General Inquiry (No specific service) --</option>
                  <optgroup label="Education & Admissions">
                    {SERVICES_LIST.filter(s => s.category === 'Education' || s.subCategory === 'Education').map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.title}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Consulting & Recruitment">
                    {SERVICES_LIST.filter(s => s.category !== 'Education' && s.subCategory !== 'Education').map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.title}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Message Details <span className="text-rose-500">*</span>
                </label>
                <textarea 
                  id="contact-message"
                  name="message" 
                  rows={4} 
                  required
                  placeholder={
                    activeService 
                      ? `Please specify your target country, course, timeline, or requirements for ${activeService.title}...`
                      : 'Specify your requirements, hiring volume, visa target, or educational goals...'
                  } 
                  onChange={() => {
                    if (formErrors.message) setFormErrors(prev => ({ ...prev, message: null }));
                  }}
                  className={`w-full bg-slate-50 dark:bg-navy-950 border rounded-xl p-2.5 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                    formErrors.message ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
                  }`} 
                />
                {formErrors.message && (
                  <p className="text-[10px] text-rose-500 mt-1 font-semibold">{formErrors.message}</p>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-3.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow flex items-center justify-center space-x-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-95'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Inquiry to Dubai Team...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Direct Inquiry to Dubai Team</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-12 space-y-4 animate-in fade-in duration-300">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="font-serif text-xl font-bold text-navy-900 dark:text-white">Inquiry Received Successfully!</h4>
              
              {submittedRef && (
                <div className="inline-block px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
                  Reference: {submittedRef}
                </div>
              )}

              <p className="text-slate-700 dark:text-slate-300 text-xs font-medium max-w-md mx-auto leading-relaxed">
                Thank you for reaching out. Your inquiry has been registered in our CRM. A senior consultant will review your requirements and follow up with you promptly.
              </p>
              
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button 
                  onClick={() => {
                    setSubmitted(false);
                    setSubmittedRef(null);
                  }} 
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl transition shadow-sm"
                >
                  Send Another Inquiry
                </button>

                <button 
                  onClick={() => navigateTo('services')} 
                  className="px-5 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition"
                >
                  Explore Services Portfolio →
                </button>
              </div>
            </div>
          )}

          {/* Interactive Map Embed Visual Simulation */}
          <div className="pt-4">
            <div className="p-4 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl text-center space-y-1">
              <p className="font-bold text-navy-900 dark:text-white">📍 Interactive Location Map</p>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Rolex Tower • Business Bay • Dubai International Financial Centre (DIFC)</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

