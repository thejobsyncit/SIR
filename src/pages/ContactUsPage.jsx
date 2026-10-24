import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2, Globe, Building2, AlertCircle, X, Sparkles, Loader2, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useCrm } from '../crm/context/CrmContext';
import { useApp } from '../context/AppContext';
import { SERVICES_LIST } from '../data/mockData';
import ScrollReveal from '../components/ScrollReveal';
import { SEO } from '../components/SEO';
import { trackEnquiryStart, trackEnquiryValidationFailure, trackEnquiryConversion, trackContactClick } from '../services/analytics';
import { getAttributionData } from '../utils/attribution';

export const ContactUsPage = () => {
  const { selectedServiceId, setSelectedServiceId, navigateTo } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [phone, setPhone] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const contactFaqs = [
    {
      q: 'Where is the Revival International headquarters located in Dubai?',
      a: 'Our corporate headquarters are located at Level 34, Rolex Tower, Financial Center Road, Business Bay, Dubai, United Arab Emirates. We are centrally situated adjacent to the Dubai International Financial Centre (DIFC) and Downtown Dubai.'
    },
    {
      q: 'How quickly does the team respond to submitted enquiries?',
      a: 'All verified business enquiries submitted via our website are logged immediately in our CRM with a unique reference number. Our specialized account managers and education consultants respond within 2 to 4 business hours.'
    },
    {
      q: 'Are consultations available online for international candidates and families?',
      a: 'Yes. In addition to in-person meetings at our Dubai office, our consultants host secure 1-on-1 virtual sessions for corporate clients, candidates, and students across Saudi Arabia, Qatar, Oman, India, the UK, and globally.'
    },
    {
      q: 'What preliminary information is required when reaching out?',
      a: 'For recruitment mandates, please share your company profile, required job roles, and target deployment timeline. For academic advisory, having your latest academic transcripts, current CV, and target study destinations helps us provide immediate clarity.'
    }
  ];

  // Local state for currently selected service dropdown
  const [activeServiceId, setActiveServiceId] = useState(selectedServiceId || '');

  // Keep in sync if context changes
  useEffect(() => {
    if (selectedServiceId) {
      setActiveServiceId(selectedServiceId);
    }
  }, [selectedServiceId]);

  const activeService = SERVICES_LIST.find(s => s.id === activeServiceId) || null;

  // Controlled form state to ensure 100% data preservation on error
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'individual',
    message: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    // Allow standard international/mobile formats: digits, +, spaces, -, (, )
    if (/^[0-9+\s\-()]*$/.test(val) && val.length <= 25) {
      setPhone(val);
      if (formErrors.phone) {
        setFormErrors(prev => ({ ...prev, phone: null }));
      }
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Please provide your full name (minimum 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
    const cleanPhone = (phone || '').replace(/[\s\-\(\)\+]/g, '');
    if (!cleanPhone) {
      errors.phone = 'Please provide your phone or WhatsApp number.';
    } else if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      errors.phone = `Phone number must be between 7 and 15 digits (currently ${cleanPhone.length} digits).`;
    }
    if (!formData.message || formData.message.trim().length < 10) {
      errors.message = 'Please provide message details (minimum 10 characters).';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      trackEnquiryValidationFailure('contact_page', activeService?.id || 'general', Object.keys(errors));
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);

    const attribution = getAttributionData();

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: phone.trim(),
      serviceId: activeService ? activeService.id : null,
      serviceTitle: activeService ? activeService.title : null,
      company: activeService
        ? `Service Inquiry: ${activeService.title}`
        : (formData.type === 'employer' ? 'Corporate Inquiry' : 'Individual'),
      message: activeService
        ? `[Inquiring about: ${activeService.title} (${activeService.category})]\n\n${formData.message.trim()}`
        : formData.message.trim(),
      utmSource: attribution.utmSource,
      utmMedium: attribution.utmMedium,
      utmCampaign: attribution.utmCampaign,
      referrer: attribution.referrer
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
      setFormData({
        name: '',
        email: '',
        type: 'individual',
        message: ''
      });

      // Fire confirmed conversion event (deduplicated by referenceNumber)
      if (generatedRef) {
        trackEnquiryConversion(
          generatedRef,
          activeService?.id || 'general',
          activeService?.title || 'General Contact',
          activeService?.category || 'General',
          'contact_page'
        );
      }

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
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'Contact Revival International',
            description: 'Official contact portal for executive recruitment, academic advisory, and corporate consulting at Revival International Dubai.',
            url: 'https://www.revivalinternational.com/contact',
            mainEntity: {
              '@type': 'Organization',
              name: 'Revival International',
              telephone: '+91 9003475405',
              email: 'enquiry@therevivalinternational.com',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Level 34, Rolex Tower, Financial Center Road, Business Bay',
                addressLocality: 'Dubai',
                addressCountry: 'AE'
              }
            }
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: contactFaqs.map(faq => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a
              }
            }))
          }
        ]}
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
            Connect directly with our senior talent acquisition leads, international education counselors, and corporate client managers.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Office Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <ScrollReveal delay={0.2}>
            {/* India Head Office Card */}
            <div className="glass-card bg-white dark:bg-navy-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-gold-500/40 shadow-luxury space-y-4">
              <div className="flex items-center space-x-3 text-gold-600 dark:text-gold-400 border-b border-slate-200 dark:border-navy-800 pb-3">
                <Building2 className="w-6 h-6" />
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">India Head Office</h3>
                  <p className="text-[10px] uppercase text-gold-600 dark:text-gold-400 font-bold tracking-widest">Global Operations & Recruitment Hub</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-800 dark:text-slate-200 font-medium">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0 mt-0.5" />
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">The Revival International Corporate Tower, India & Global Network</span>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                  <a href="tel:+919003475405" className="text-slate-800 dark:text-slate-200 font-bold text-sm hover:text-gold-500 transition">+91 9003475405</a>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                  <a href="mailto:enquiry@therevivalinternational.com" className="text-slate-800 dark:text-slate-200 font-semibold hover:text-gold-500 transition">enquiry@therevivalinternational.com</a>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">Monday – Saturday: 09:00 AM – 06:30 PM IST</span>
                </div>
              </div>

              <a
                href="https://wa.me/919003475405"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition shadow-md mt-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Instant WhatsApp Consultation (+91 9003475405)</span>
              </a>
            </div>
          </ScrollReveal>

          {/* Additional Global Branches */}
          <ScrollReveal delay={0.3}>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="glass-card bg-white dark:bg-navy-900 border p-4 rounded-xl space-y-1">
                <h4 className="font-bold text-navy-900 dark:text-white">🇦🇪 Dubai Regional Hub</h4>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] font-medium">Level 34, Rolex Tower, Financial Center Road, Business Bay, Dubai</p>
              </div>
              <div className="glass-card bg-white dark:bg-navy-900 border p-4 rounded-xl space-y-1">
                <h4 className="font-bold text-navy-900 dark:text-white">🇸🇦 Riyadh & GCC Hub</h4>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] font-medium">King Fahd Road, Olaya District, Riyadh, Saudi Arabia</p>
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
              Please provide your details below. Our advisory and recruitment team will review your requirements and get in touch promptly.
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
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Please complete all required fields marked with <span className="text-rose-500 font-bold">*</span>. All enquiries are reviewed within 2–4 business hours.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="contact-name" className="block font-bold text-slate-700 dark:text-slate-200">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    {formData.name.trim().length >= 2 && (
                      <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </div>
                  <input
                    id="contact-name"
                    name="name"
                    required
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.name}
                    aria-required="true"
                    aria-invalid={!!formErrors.name}
                    aria-describedby={formErrors.name ? "contact-name-error" : undefined}
                    onFocus={() => trackEnquiryStart('contact_page', activeService?.id || 'general', activeService?.title || 'General Contact')}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full bg-slate-50 dark:bg-navy-950 border rounded-xl p-2.5 text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-gold-500 transition ${formErrors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
                      }`}
                  />
                  {formErrors.name && (
                    <p id="contact-name-error" className="text-[10px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="contact-email" className="block font-bold text-slate-700 dark:text-slate-200">
                      Business or Personal Email <span className="text-rose-500">*</span>
                    </label>
                    {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) && (
                      <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </div>
                  <input
                    id="contact-email"
                    name="email"
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="e.g. s.jenkins@company.com"
                    value={formData.email}
                    aria-required="true"
                    aria-invalid={!!formErrors.email}
                    aria-describedby={formErrors.email ? "contact-email-error" : undefined}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full bg-slate-50 dark:bg-navy-950 border rounded-xl p-2.5 text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-gold-500 transition ${formErrors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
                      }`}
                  />
                  {formErrors.email && (
                    <p id="contact-email-error" className="text-[10px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="contact-phone" className="block font-bold text-slate-700 dark:text-slate-200">
                      Phone / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    {phone.replace(/[\s\-\(\)\+]/g, '').length >= 7 && (
                      <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Valid format
                      </span>
                    )}
                  </div>
                  <input
                    id="contact-phone"
                    name="phone"
                    required
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    aria-required="true"
                    aria-invalid={!!formErrors.phone}
                    aria-describedby={formErrors.phone ? "contact-phone-error" : "contact-phone-hint"}
                    onChange={handlePhoneChange}
                    placeholder="e.g. +971 50 123 4567 or 5098765432"
                    className={`w-full bg-slate-50 dark:bg-navy-950 border rounded-xl p-2.5 text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono tracking-wider transition ${formErrors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
                      }`}
                  />
                  {formErrors.phone ? (
                    <p id="contact-phone-error" className="text-[10px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.phone}
                    </p>
                  ) : (
                    <p id="contact-phone-hint" className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Include country code for international inquiries (e.g. +971, +966, +44)
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-type" className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Inquiry Profile Category
                  </label>
                  <select
                    id="contact-type"
                    name="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="individual">Individual Candidate or Career Seeker</option>
                    <option value="corporate">Institutional or Corporate Advisory Inquiry</option>
                    <option value="student_parent">Student or Parent seeking Academic Guidance</option>
                    <option value="verification">Requesting Background & Credential Verification</option>
                    <option value="visa">Inquiring about GCC Visa Processing & Attestation</option>
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
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
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
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="contact-message" className="block font-bold text-slate-700 dark:text-slate-200">
                    Message Details <span className="text-rose-500">*</span>
                  </label>
                  {formData.message.trim().length >= 10 && (
                    <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Valid ({formData.message.trim().length} chars)
                    </span>
                  )}
                </div>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  aria-required="true"
                  aria-invalid={!!formErrors.message}
                  aria-describedby={formErrors.message ? "contact-message-error" : undefined}
                  placeholder={
                    activeService
                      ? `Please specify your target country, course, timeline, or requirements for ${activeService.title}...`
                      : 'Specify your requirements, hiring volume, visa target, or educational goals...'
                  }
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-navy-950 border rounded-xl p-2.5 text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-gold-500 transition ${formErrors.message ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-navy-700'
                    }`}
                />
                {formErrors.message && (
                  <p id="contact-message-error" className="text-[10px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow flex items-center justify-center space-x-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-95'
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
                    <span>Submit Direct Inquiry</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-10 space-y-4 animate-in fade-in duration-300">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 mx-auto flex items-center justify-center shadow-gold-glow">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">Inquiry Registered Successfully!</h4>

              {submittedRef && (
                <div className="inline-block px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-extrabold">
                  CRM Tracking Reference: {submittedRef}
                </div>
              )}

              <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium max-w-md mx-auto leading-relaxed">
                Thank you for connecting with Revival International. Your inquiry has been securely logged into our CRM system. A senior consultant from our Dubai headquarters will review your requirements and reach out within <strong className="text-emerald-600 dark:text-emerald-400">2 to 4 business hours</strong>.
              </p>

              <div className="p-3.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl max-w-sm mx-auto text-[11px] text-slate-600 dark:text-slate-400 space-y-1 text-left">
                <div className="flex justify-between">
                  <span>Advisory Office:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Rolex Tower, Business Bay, Dubai</span>
                </div>
                <div className="flex justify-between">
                  <span>Urgent Queries:</span>
                  <span className="font-semibold text-gold-600 dark:text-gold-400">+971 4 123 4567</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setSubmittedRef(null);
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl transition shadow-sm"
                >
                  Submit Another Inquiry
                </button>

                <button
                  onClick={() => navigateTo('services')}
                  className="px-5 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition"
                >
                  Explore All Services →
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

      {/* Frequently Asked Questions Section */}
      <ScrollReveal>
        <div className="space-y-6 pt-10 border-t border-slate-200 dark:border-navy-800">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-gold-500 uppercase tracking-widest block">Client & Candidate Guidance</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Clear answers regarding response timelines, consultation formats, and preliminary requirements.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {contactFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 hover:text-gold-500 transition focus:outline-none"
                  aria-expanded={openFaqIndex === idx}
                >
                  <span className="font-serif text-sm sm:text-base font-bold text-navy-900 dark:text-white flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  {openFaqIndex === idx ? (
                    <ChevronUp className="w-4 h-4 text-gold-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium border-t border-slate-100 dark:border-navy-800/60 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
};

