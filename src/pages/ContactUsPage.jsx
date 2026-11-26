import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2, Globe, Building2, AlertCircle, X, Sparkles, Loader2, ChevronDown, ChevronUp, HelpCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { useCrm } from '../crm/context/CrmContext';
import { useApp } from '../context/AppContext';
import { SERVICES_LIST } from '../data/mockData';
import ScrollReveal from '../components/ScrollReveal';
import { SEO } from '../components/SEO';
import SITE_CONFIG from '../config/siteConfig';
import CountryPhoneInput from '../components/common/CountryPhoneInput';
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
  const [phoneValidation, setPhoneValidation] = useState({ isValid: false, error: null });
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [parentConsent, setParentConsent] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const contactFaqs = [
    {
      q: 'Where is the Revival International headquarters located in Dubai?',
      a: 'Our registered global headquarters are located at Business Center, Meydan Free Zone, Nad Al Sheba, Dubai, United Arab Emirates, with regional sourcing and academic operations at The Revival International Corporate Center, Anna Salai, Chennai, India.'
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
    purpose: 'callback',
    preferredOffice: 'dubai_hq',
    contactChannel: 'phone',
    preferredTime: 'anytime',
    visitDate: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (field, value) => {
    let finalValue = value;
    if (field === 'name') {
      finalValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    setFormData(prev => ({ ...prev, [field]: finalValue }));
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
    const trimmedName = (formData.name || '').trim();
    if (!trimmedName || trimmedName.length < 2) {
      errors.name = 'Please provide your full name (minimum 2 characters).';
    } else if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      errors.name = 'Full name must contain alphabetic characters only. Numbers and special characters are not allowed.';
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
    if (!consentAgreed) {
      errors.consent = 'Please agree to the Privacy Policy before submitting your enquiry.';
    }
    return errors;
  };

  const [lastSubmittedKey, setLastSubmittedKey] = useState('');

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

    const submissionKey = `${formData.email.trim().toLowerCase()}::${formData.message.trim()}`;
    if (submissionKey === lastSubmittedKey) {
      setSubmitError('This exact enquiry was already submitted. Please modify your message if you need to send a new request.');
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    const attribution = getAttributionData();

    const purposeLabels = {
      callback: 'Request a Direct Callback',
      corporate_recruitment: 'Corporate Recruitment Enquiry',
      partnership: 'Submit a Partnership Proposal',
      office_visit: 'Schedule an Office Visit',
      study_abroad: 'Study Abroad Consultation',
      visa_verification: 'Visa & Verification Enquiry',
      job_support: 'Job Application Support',
      general: 'General Enquiry'
    };
    const officeLabels = {
      dubai_hq: 'Dubai Global HQ (UAE & GCC)',
      chennai_hub: 'Chennai Operations Hub (India)',
      international: 'International Operations'
    };
    const channelLabels = {
      phone: 'Direct Phone Call',
      whatsapp: 'WhatsApp',
      email: 'Email'
    };
    const timeLabels = {
      anytime: 'Anytime During Business Hours',
      morning: 'Morning (9 AM – 12 PM)',
      afternoon: 'Afternoon (12 PM – 4 PM)',
      evening: 'Evening (4 PM – 7 PM)'
    };

    const metaSummary = [
      `Purpose: ${purposeLabels[formData.purpose] || 'General Enquiry'}`,
      `Preferred Desk: ${officeLabels[formData.preferredOffice] || 'Dubai Global HQ (UAE & GCC)'}`,
      `Contact Method: ${channelLabels[formData.contactChannel] || 'Direct Phone Call'}`,
      `Preferred Time: ${timeLabels[formData.preferredTime] || 'Anytime During Business Hours'}`,
      ...(formData.purpose === 'office_visit' && formData.visitDate ? [`Preferred Visit Date: ${formData.visitDate}`] : []),
      ...(formData.subject.trim() ? [`Subject: ${formData.subject.trim()}`] : [])
    ].join(' | ');

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: phone.trim(),
      serviceId: activeService ? activeService.id : 'contact_us',
      serviceTitle: activeService ? activeService.title : (purposeLabels[formData.purpose] || 'General Enquiry'),
      preferredContactMethod: channelLabels[formData.contactChannel] || 'Direct Phone Call',
      company: activeService
        ? `Service Inquiry: ${activeService.title}`
        : `${purposeLabels[formData.purpose] || 'Contact Desk'} (${officeLabels[formData.preferredOffice] || 'Global'})`,
      message: activeService
        ? `[Inquiring about: ${activeService.title} (${activeService.category})]\n[${metaSummary}]\n\n${formData.message.trim()}`
        : `[${metaSummary}]\n\n${formData.message.trim()}`,
      customFields: {
        source: 'Contact Us Page',
        purpose: purposeLabels[formData.purpose] || 'General Enquiry',
        preferredOffice: officeLabels[formData.preferredOffice] || 'Dubai Global HQ (UAE & GCC)',
        preferredContactMethod: channelLabels[formData.contactChannel] || 'Direct Phone Call',
        preferredTime: timeLabels[formData.preferredTime] || 'Anytime During Business Hours',
        visitDate: formData.visitDate || null,
        subject: formData.subject.trim() || null
      },
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
      setLastSubmittedKey(submissionKey);
      setSubmittedRef(generatedRef);
      setSubmitted(true);
      setPhone('');
      setConsentAgreed(false);
      setFormData({
        name: '',
        email: '',
        type: 'individual',
        purpose: 'callback',
        preferredOffice: 'dubai_hq',
        contactChannel: 'phone',
        preferredTime: 'anytime',
        visitDate: '',
        subject: '',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-24 space-y-16">
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
            DIRECT EXECUTIVE & ADVISORY CONSULTATION
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-navy-900 dark:text-white">
            Contact The Revival International
          </h1>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            Connect with our international recruitment specialists, education consultants and corporate client relationship managers for professional assistance, business enquiries and personalized consultation.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Office Contact Info (Issue #8: Consistent HQ statement + Verified Offices) */}
        <div className="lg:col-span-5 space-y-6">
          <ScrollReveal delay={0.2}>
            {/* Dubai Global Headquarters Card */}
            <div className="glass-card bg-white dark:bg-navy-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-gold-500/40 shadow-luxury space-y-4">
              <div className="flex items-center space-x-3 text-gold-600 dark:text-gold-400 border-b border-slate-200 dark:border-navy-800 pb-3">
                <Building2 className="w-6 h-6" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Dubai Global HQ</h3>
                    <span className="bg-gold-500/20 text-gold-700 dark:text-gold-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      Headquarters
                    </span>
                  </div>
                  <p className="text-[10px] uppercase text-gold-600 dark:text-gold-400 font-bold tracking-widest">{SITE_CONFIG.brand.legalName}</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-800 dark:text-slate-200 font-medium">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0 mt-0.5" />
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{SITE_CONFIG.offices[0].fullAddress}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                  <span className="text-slate-800 dark:text-slate-200 font-bold text-sm">{SITE_CONFIG.offices[0].phone}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                  <a href={`mailto:${SITE_CONFIG.offices[0].email}`} className="text-slate-800 dark:text-slate-200 font-semibold hover:text-gold-500 transition">{SITE_CONFIG.offices[0].email}</a>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{SITE_CONFIG.offices[0].workingHours}</span>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE_CONFIG.offices[0].fullAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-slate-900 dark:text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition border border-slate-200 dark:border-navy-800"
              >
                <ExternalLink className="w-3.5 h-3.5 text-gold-500" />
                <span>View Dubai HQ on Google Maps</span>
              </a>
            </div>
          </ScrollReveal>

          {/* India Regional Operations Hub Card */}
          <ScrollReveal delay={0.3}>
            <div className="glass-card bg-white dark:bg-navy-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-gold-500/40 shadow-luxury space-y-4">
              <div className="flex items-center space-x-3 text-gold-600 dark:text-gold-400 border-b border-slate-200 dark:border-navy-800 pb-3">
                <Building2 className="w-6 h-6" />
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">India Operations Hub</h3>
                  <p className="text-[10px] uppercase text-gold-600 dark:text-gold-400 font-bold tracking-widest">{SITE_CONFIG.offices[1].name}</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-800 dark:text-slate-200 font-medium">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0 mt-0.5" />
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{SITE_CONFIG.offices[1].fullAddress}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                  <a href={`tel:${SITE_CONFIG.offices[1].phone.replace(/\s+/g, '')}`} className="text-slate-800 dark:text-slate-200 font-bold text-sm hover:text-gold-500 transition">{SITE_CONFIG.offices[1].phone}</a>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                  <a href={`mailto:${SITE_CONFIG.offices[1].email}`} className="text-slate-800 dark:text-slate-200 font-semibold hover:text-gold-500 transition">{SITE_CONFIG.offices[1].email}</a>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{SITE_CONFIG.offices[1].workingHours}</span>
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

        </div>

        {/* Inquiry Form */}
        <div className="lg:col-span-7 glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 rounded-3xl space-y-4 shadow-luxury text-xs">
          <div>
            <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
              Request a Callback, Office Visit or Partnership
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
              Connect with our Dubai Global HQ or Chennai Operations Hub for direct callbacks, scheduled office meetings, corporate partnerships, or application support.
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
                  <CountryPhoneInput
                    value={phone}
                    onChange={setPhone}
                    onValidationChange={(res) => {
                      setPhoneValidation(res);
                      if (formErrors.phone && res.isValid) {
                        setFormErrors(prev => ({ ...prev, phone: null }));
                      }
                    }}
                    label="Phone / WhatsApp"
                    placeholder="Enter phone number"
                    required
                  />
                  {formErrors.phone && (
                    <p id="contact-phone-error" className="text-[10px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-purpose" className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Purpose of Contact
                  </label>
                  <select
                    id="contact-purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="callback">Request a Direct Callback</option>
                    <option value="corporate_recruitment">Corporate Recruitment Enquiry</option>
                    <option value="partnership">Submit a Partnership Proposal</option>
                    <option value="office_visit">Schedule an Office Visit</option>
                    <option value="study_abroad">Study Abroad Consultation</option>
                    <option value="visa_verification">Visa & Verification Enquiry</option>
                    <option value="job_support">Job Application Support</option>
                    <option value="general">General Enquiry</option>
                  </select>
                </div>
              </div>

              {/* Regional Office & Contact Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="contact-office" className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Preferred Regional Desk
                  </label>
                  <select
                    id="contact-office"
                    value={formData.preferredOffice}
                    onChange={(e) => handleInputChange('preferredOffice', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="dubai_hq">Dubai Global HQ (UAE & GCC)</option>
                    <option value="chennai_hub">Chennai Operations Hub (India)</option>
                    <option value="international">International Operations</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-channel" className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Preferred Contact Method
                  </label>
                  <select
                    id="contact-channel"
                    value={formData.contactChannel}
                    onChange={(e) => handleInputChange('contactChannel', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="phone">Direct Phone Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              {/* Callback Time Window & Conditional Office Visit Date */}
              <div className={`grid grid-cols-1 ${formData.purpose === 'office_visit' ? 'sm:grid-cols-2' : ''} gap-3`}>
                <div>
                  <label htmlFor="contact-time" className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Preferred Time Window
                  </label>
                  <select
                    id="contact-time"
                    value={formData.preferredTime}
                    onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="anytime">Anytime During Business Hours</option>
                    <option value="morning">Morning (9 AM – 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM – 4 PM)</option>
                    <option value="evening">Evening (4 PM – 7 PM)</option>
                  </select>
                </div>

                {formData.purpose === 'office_visit' && (
                  <div>
                    <label htmlFor="contact-visit-date" className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Preferred Office Visit Date
                    </label>
                    <input
                      id="contact-visit-date"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.visitDate}
                      onChange={(e) => handleInputChange('visitDate', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                )}
              </div>

              {/* Subject Line */}
              <div>
                <label htmlFor="contact-subject" className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Subject / Topic
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  placeholder="e.g. Callback request for Dubai office meeting / Institutional collaboration"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
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

              {/* Parent/Guardian Consent for Under-18s on Student Inquiries (Issue #4 & Section 6 P1) */}
              {formData.type === 'student_parent' && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={parentConsent}
                      onChange={(e) => setParentConsent(e.target.checked)}
                      className="mt-0.5 rounded text-gold-500 focus:ring-gold-500 h-4 w-4"
                    />
                    <span className="text-[11px] text-amber-900 dark:text-amber-300 leading-snug font-medium">
                      <strong>Parent / Guardian Consent:</strong> For applicants under 18 years of age, I confirm parent or legal guardian consent for academic counselling, aptitude evaluation, and admissions advisory.
                    </span>
                  </label>
                </div>
              )}

              {/* Mandatory General Data Consent Checkbox (Issue #4) */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={consentAgreed}
                    onChange={(e) => {
                      setConsentAgreed(e.target.checked);
                      if (e.target.checked && formErrors.consent) {
                        setFormErrors(prev => ({ ...prev, consent: null }));
                      }
                    }}
                    className="mt-0.5 rounded text-gold-500 focus:ring-gold-500 h-4 w-4 border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-950"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    I agree to The Revival International collecting and processing my enquiry data in accordance with the{' '}
                    <button
                      type="button"
                      onClick={() => navigateTo('legal/privacy-policy')}
                      className="text-gold-500 font-bold hover:underline cursor-pointer"
                    >
                      Privacy Policy
                    </button>{' '}
                    and applicable data protection regulations. <span className="text-rose-500 font-bold">*</span>
                  </span>
                </label>
                {formErrors.consent && (
                  <p className="text-[10px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {formErrors.consent}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow flex items-center justify-center space-x-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 cursor-pointer ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-95'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Enquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Enquiry</span>
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

              <div className="p-3.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl max-w-md mx-auto text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 text-left">
                <div className="flex justify-between gap-2">
                  <span className="shrink-0">Headquarters:</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-right">{SITE_CONFIG.offices[0].fullAddress}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="shrink-0">Direct Helpline:</span>
                  <span className="font-semibold text-gold-600 dark:text-gold-400">{SITE_CONFIG.offices[1].phone}</span>
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
              <p className="font-bold text-navy-900 dark:text-white">📍 Global & Regional Office Locations</p>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">{SITE_CONFIG.offices[0].fullAddress}</p>
            </div>
          </div>

        </div>

      </div>

      {/* Contact Information 4-Card Directory Section */}
      <ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Dubai Global Headquarters */}
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl shadow-sm space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-navy-900 dark:text-white">Dubai Global Headquarters</h4>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">UAE & GCC Regional Operations</p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{SITE_CONFIG.offices[0].fullAddress}</p>
            <p className="text-xs font-bold text-navy-900 dark:text-white">{SITE_CONFIG.offices[0].phone}</p>
          </div>

          {/* Card 2: Chennai Operations Hub */}
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl shadow-sm space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-navy-900 dark:text-white">Chennai Operations Hub</h4>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">India Operations & Client Support</p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{SITE_CONFIG.offices[1].fullAddress}</p>
            <p className="text-xs font-bold text-navy-900 dark:text-white">{SITE_CONFIG.offices[1].phone}</p>
          </div>

          {/* Card 3: Email Enquiries */}
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl shadow-sm space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-navy-900 dark:text-white">Email Enquiries</h4>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Official Advisory Desks</p>
            </div>
            <div className="space-y-1 text-xs">
              <a href={`mailto:${SITE_CONFIG.offices[1].email}`} className="block font-semibold text-navy-900 dark:text-white hover:text-gold-500 truncate">{SITE_CONFIG.offices[1].email}</a>
              <a href={`mailto:${SITE_CONFIG.offices[0].email}`} className="block font-semibold text-slate-600 dark:text-slate-300 hover:text-gold-500 truncate">{SITE_CONFIG.offices[0].email}</a>
            </div>
          </div>

          {/* Card 4: Business Hours */}
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl shadow-sm space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-navy-900 dark:text-white">Business Hours</h4>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Regional Consultation Windows</p>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
              <p><strong>Dubai HQ:</strong> {SITE_CONFIG.offices[0].workingHours}</p>
              <p><strong>India Hub:</strong> {SITE_CONFIG.offices[1].workingHours}</p>
            </div>
          </div>
        </div>
      </ScrollReveal>

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

