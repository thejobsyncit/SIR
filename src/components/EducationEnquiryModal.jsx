import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, GraduationCap, ShieldCheck } from 'lucide-react';
import { EDUCATION_SERVICES_DETAILED } from '../data/educationServicesData';
import { trackEnquiryStart, trackEnquiryValidationFailure, trackEnquiryConversion } from '../services/analytics';
import { getAttributionData } from '../utils/attribution';

export const EducationEnquiryModal = ({ isOpen, onClose, preselectedServiceId = null, preselectedSubProgram = null, preselectedLevel = null }) => {
  const [serviceId, setServiceId] = useState(preselectedServiceId || 'intl-consult');
  const [subProgram, setSubProgram] = useState(preselectedSubProgram || '');
  const [phone, setPhone] = useState('');
  const [countryInterest, setCountryInterest] = useState('All');
  const [programLevel, setProgramLevel] = useState(() => {
    if (preselectedServiceId === 'school-career' || preselectedServiceId === 'career-guidance') {
      return (preselectedLevel === 'PG' || preselectedLevel?.includes('Postgraduate'))
        ? 'Postgraduate (Master Degree / MBA)'
        : 'Undergraduate (Bachelor Degree)';
    }
    return preselectedLevel || 'Undergraduate (Bachelor Degree)';
  });
  const [consultationDate, setConsultationDate] = useState(() => {
    return new Date(Date.now() + 86400000).toISOString().split('T')[0];
  });
  const [consultationTime, setConsultationTime] = useState('11:00 AM - 12:00 PM IST');
  const [consultationMode, setConsultationMode] = useState('Virtual Video Call (Google Meet / Zoom)');
  const [consent, setConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submittedLead, setSubmittedLead] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const isCareerGuidance =
    serviceId === 'school-career' ||
    serviceId === 'career-guidance' ||
    preselectedServiceId === 'school-career' ||
    preselectedServiceId === 'career-guidance';

  useEffect(() => {
    if (preselectedServiceId) {
      setServiceId(preselectedServiceId);
    }
    if (preselectedSubProgram) {
      setSubProgram(preselectedSubProgram);
    }
    if (preselectedLevel) {
      if (preselectedServiceId === 'school-career' || preselectedServiceId === 'career-guidance') {
        setProgramLevel(
          preselectedLevel === 'PG' || preselectedLevel.includes('Postgraduate')
            ? 'Postgraduate (Master Degree / MBA)'
            : 'Undergraduate (Bachelor Degree)'
        );
      } else {
        setProgramLevel(preselectedLevel);
      }
    } else if (preselectedServiceId === 'school-career' || preselectedServiceId === 'career-guidance') {
      setProgramLevel('Undergraduate (Bachelor Degree)');
    }
  }, [preselectedServiceId, preselectedSubProgram, preselectedLevel]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const activeService = EDUCATION_SERVICES_DETAILED.find(s => s.id === serviceId) || EDUCATION_SERVICES_DETAILED[0];

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    // Allow digits, +, spaces, -, (, )
    if (/^[0-9+\s\-()]*$/.test(val) && val.length <= 25) {
      setPhone(val);
      if (formErrors.phone) {
        setFormErrors(prev => ({ ...prev, phone: null }));
      }
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
    const cleanPhone = (phone || data.phone || '').replace(/[\s\-\(\)\+]/g, '');
    if (!cleanPhone) {
      errors.phone = 'Please provide your phone or WhatsApp number.';
    } else if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      errors.phone = `Phone number must be between 7 and 15 digits (currently ${cleanPhone.length} digits).`;
    }
    if (!isCareerGuidance) {
      if (!data.message || data.message.trim().length < 10) {
        errors.message = 'Please provide inquiry details or background (minimum 10 characters).';
      }
    }
    if (isCareerGuidance) {
      if (!programLevel) {
        errors.programLevel = 'Please select your target academic level.';
      }
      if (!countryInterest) {
        errors.countryInterest = 'Please select your target study destination.';
      }
    }
    if (!consent) {
      errors.consent = 'You must acknowledge the communication consent to proceed.';
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
      trackEnquiryValidationFailure('education_modal', isCareerGuidance ? 'school-career' : activeService.id, Object.keys(errors));
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    const attribution = getAttributionData();
    const subDetail = subProgram ? ` | Sub-Track: ${subProgram}` : '';
    const levelDetail = programLevel ? ` | Level: ${programLevel}` : '';
    const destDetail = countryInterest !== 'All' ? ` | Target Country: ${countryInterest}` : '';
    const institutionDetail = data.organization ? ` | School/Institute: ${data.organization.trim()}` : '';

    const payload = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: phone.trim(),
      serviceId: isCareerGuidance ? 'school-career' : activeService.id,
      serviceTitle: isCareerGuidance ? 'Career Guidance' : `${activeService.title}${subDetail}`,
      company: isCareerGuidance ? 'Career Guidance' : (activeService.id === 'school-career' ? 'Career Guidance' : (data.organization ? data.organization.trim() : `Academic Advisory (${activeService.category})`)),
      organizationName: data.organization ? data.organization.trim() : null,
      degreeLevel: programLevel,
      countryInterest: countryInterest !== 'All' ? countryInterest : 'Global / Flexible',
      customFields: JSON.stringify({
        organization: data.organization ? data.organization.trim() : '',
        programLevel,
        countryInterest: countryInterest !== 'All' ? countryInterest : 'Global / Flexible',
        subProgram: subProgram || null,
        streamName: (subProgram && subProgram.includes('[') && subProgram.includes(']')) ? subProgram.split('[')[1].split(']')[0].trim() : null,
        courseName: subProgram ? subProgram.split(' [')[0].trim() : null,
        consent: Boolean(consent)
      }),
      consultationDate: isCareerGuidance ? null : consultationDate,
      consultationTime: isCareerGuidance ? null : consultationTime,
      consultationMode: isCareerGuidance ? null : consultationMode,
      status: 'Consultation Scheduled',
      message: isCareerGuidance
        ? `[Career Guidance Academic Consultation Request]\nTarget Academic Level: ${programLevel}\nTarget Study Destination: ${countryInterest !== 'All' ? countryInterest : 'Global / Flexible'}\nCurrent Institution: ${data.organization ? data.organization.trim() : 'Not Specified'}\nApplicant: ${data.name.trim()}`
        : `[Academic Advisory Consultation Booking: ${activeService.title}${subDetail}${levelDetail}${destDetail}${institutionDetail}]\nAppointment Date: ${consultationDate} at ${consultationTime}\nConsultation Mode: ${consultationMode}\n\nStudent/Applicant Message:\n${data.message ? data.message.trim() : ''}`,
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

      const generatedRef = result.data?.referenceNumber || result.referenceNumber || result.data?.id || `REV-CAR-${Date.now().toString().slice(-6)}`;

      setSubmittedLead({
        id: generatedRef,
        name: data.name.trim(),
        serviceTitle: isCareerGuidance ? 'Career Guidance' : activeService.title,
        programLevel,
        countryInterest: countryInterest !== 'All' ? countryInterest : 'Global / Flexible',
        consultationDate: isCareerGuidance ? null : consultationDate,
        consultationTime: isCareerGuidance ? null : consultationTime,
        consultationMode: isCareerGuidance ? null : consultationMode
      });

      // Fire confirmed conversion event (deduplicated by referenceNumber)
      trackEnquiryConversion(
        generatedRef,
        isCareerGuidance ? 'school-career' : activeService.id,
        isCareerGuidance ? 'Career Guidance' : activeService.title,
        isCareerGuidance ? 'Career' : activeService.category,
        'education_modal'
      );

      setPhone('');
    } catch (err) {
      console.error('Failed to submit education inquiry:', err);
      setSubmitError(err.message || 'Unable to submit your inquiry at this moment. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => { if (!isSubmitting) onClose(); }}
      role="presentation"
    >
      <div
        className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-luxury relative space-y-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="education-enquiry-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedLead ? (
          /* Real Backend Success Screen */
          <div className="text-center py-8 space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center shadow-gold-glow">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Inquiry Logged in Super Admin CRM
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                Thank You, {submittedLead.name}!
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Your consultation request for <strong className="text-navy-900 dark:text-white">{submittedLead.serviceTitle}</strong> has been securely registered in our advisor queue.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-left space-y-2 max-w-md mx-auto">
              <div className="flex justify-between items-center text-slate-500">
                <span>Inquiry Reference ID:</span>
                <span className="font-mono font-bold text-gold-500">#{submittedLead.id}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Applicant Name:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{submittedLead.name}</span>
              </div>
              {submittedLead.programLevel && (
                <div className="flex justify-between items-center text-slate-500">
                  <span>Target Academic Level:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{submittedLead.programLevel}</span>
                </div>
              )}
              {submittedLead.countryInterest && (
                <div className="flex justify-between items-center text-slate-500">
                  <span>Target Study Destination:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{submittedLead.countryInterest}</span>
                </div>
              )}
              {submittedLead.consultationDate && (
                <div className="flex justify-between items-center text-slate-500">
                  <span>Appointment Date & Time:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{submittedLead.consultationDate} ({submittedLead.consultationTime})</span>
                </div>
              )}
              {submittedLead.consultationMode && (
                <div className="flex justify-between items-center text-slate-500">
                  <span>Consultation Mode:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{submittedLead.consultationMode}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-500">
                <span>Advisory Hub:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Dubai HQ & Global Network</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Status in CRM:</span>
                <span className="font-semibold text-amber-600 dark:text-gold-400">Consultation Scheduled</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmittedLead(null);
                onClose();
              }}
              className="px-6 py-3 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer"
            >
              Done & Return to Advisory
            </button>
          </div>
        ) : (
          /* Consultation Request Form */
          <>
            <div className="space-y-1.5 pr-8">
              {!isCareerGuidance && (
                <div className="flex items-center gap-2">
                  <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    {activeService.category} Advisory
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                    Direct Counsellor Desk
                  </span>
                </div>
              )}
              <h2 id="education-enquiry-title" className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                Request Academic Consultation
              </h2>
              {!isCareerGuidance && (
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Complete this form to schedule a tailored roadmap session with our Dubai education advisory team.
                </p>
              )}
            </div>

            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Service Selector */}
              {!isCareerGuidance && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Service of Interest <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={serviceId}
                    onChange={(e) => {
                      setServiceId(e.target.value);
                      setSubProgram('');
                    }}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    {EDUCATION_SERVICES_DETAILED.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.title} ({srv.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sub-Program Selector (Only for Executive Seminars & Language Training) */}
              {!isCareerGuidance && activeService.subProgrammes && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Select Test or Program Focus
                  </label>
                  <select
                    value={subProgram}
                    onChange={(e) => setSubProgram(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="">General Language & Seminar Inquiry</option>
                    {activeService.subProgrammes.map((sub) => (
                      <option key={sub.id} value={sub.title}>
                        {sub.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Preselected Course / Focus Banner (e.g. from Career Guidance Catalogue) */}
              {!isCareerGuidance && subProgram && !activeService.subProgrammes && (
                <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gold-600 dark:text-gold-400 block tracking-wider">
                      Selected Academic Focus / Course
                    </span>
                    <span className="font-bold text-navy-900 dark:text-white">
                      {subProgram}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubProgram('')}
                    className="text-slate-400 hover:text-rose-500 text-xs font-semibold p-1 transition cursor-pointer"
                    title="Clear selected course"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Tariq Al-Hashimi"
                    onFocus={() => trackEnquiryStart('education_modal', isCareerGuidance ? 'school-career' : activeService.id, isCareerGuidance ? 'Career Guidance' : activeService.title)}
                    onChange={() => {
                      if (formErrors.name) setFormErrors(prev => ({ ...prev, name: null }));
                    }}
                    className={`w-full bg-slate-50 dark:bg-navy-950 border text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500 ${formErrors.name ? 'border-rose-500' : 'border-slate-200 dark:border-navy-700'
                      }`}
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. student@example.com"
                    onChange={() => {
                      if (formErrors.email) setFormErrors(prev => ({ ...prev, email: null }));
                    }}
                    className={`w-full bg-slate-50 dark:bg-navy-950 border text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500 ${formErrors.email ? 'border-rose-500' : 'border-slate-200 dark:border-navy-700'
                      }`}
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Phone & Current Organization Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Phone / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    {phone.replace(/[\s\-\(\)\+]/g, '').length >= 7 && (
                      <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="e.g. +971 50 123 4567 or +91 98765 43210"
                    required
                    className={`w-full bg-slate-50 dark:bg-navy-950 border text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-gold-500 ${formErrors.phone ? 'border-rose-500' : 'border-slate-200 dark:border-navy-700'
                      }`}
                  />
                  {formErrors.phone && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Current School / College / Employer
                  </label>
                  <input
                    type="text"
                    name="organization"
                    placeholder="e.g. Delhi Public School / IIT Madras"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              {/* Level & Target Destination Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Target Academic Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={programLevel}
                    onChange={(e) => {
                      setProgramLevel(e.target.value);
                      if (formErrors.programLevel) setFormErrors(prev => ({ ...prev, programLevel: null }));
                    }}
                    className={`w-full bg-slate-50 dark:bg-navy-950 border text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                      formErrors.programLevel ? 'border-rose-500' : 'border-slate-200 dark:border-navy-700'
                    }`}
                  >
                    {isCareerGuidance ? (
                      <>
                        <option value="Undergraduate (Bachelor Degree)">Undergraduate (Bachelor Degree)</option>
                        <option value="Postgraduate (Master Degree / MBA)">Postgraduate (Master Degree / MBA)</option>
                      </>
                    ) : (
                      <>
                        <option value="Middle School (Grades 6-8)">Middle School (Grades 6–8)</option>
                        <option value="High School / Stream Selection">High School / Stream Selection (Grades 9–12)</option>
                        <option value="Undergraduate (Bachelor Degree)">Undergraduate (Bachelor Degree)</option>
                        <option value="Postgraduate (Master Degree / MBA)">Postgraduate (Master Degree / MBA)</option>
                        <option value="Executive / Professional Certification">Executive / Professional Certification</option>
                      </>
                    )}
                  </select>
                  {formErrors.programLevel && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.programLevel}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Target Study Destination <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={countryInterest}
                    onChange={(e) => {
                      setCountryInterest(e.target.value);
                      if (formErrors.countryInterest) setFormErrors(prev => ({ ...prev, countryInterest: null }));
                    }}
                    className={`w-full bg-slate-50 dark:bg-navy-950 border text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500 ${
                      formErrors.countryInterest ? 'border-rose-500' : 'border-slate-200 dark:border-navy-700'
                    }`}
                  >
                    <option value="All">Global / Flexible (Open to Advice)</option>
                    <option value="India">India</option>
                    <option value="United Kingdom">United Kingdom (UK)</option>
                    <option value="United States">United States (USA)</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia & New Zealand</option>
                    <option value="Europe">Europe (Germany, Ireland, France)</option>
                    <option value="UAE & GCC">UAE & GCC Branch Campuses</option>
                  </select>
                  {formErrors.countryInterest && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.countryInterest}</p>
                  )}
                </div>
              </div>

              {/* Consultation Scheduling Row: Date, Time & Mode */}
              {!isCareerGuidance && (
                <div className="p-3.5 bg-gold-500/5 dark:bg-gold-500/10 border border-gold-500/20 rounded-2xl space-y-2">
                  <span className="text-[10px] font-extrabold text-gold-600 dark:text-gold-400 uppercase tracking-wider block">
                    Select Consultation Appointment
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={consultationDate}
                        onChange={(e) => setConsultationDate(e.target.value)}
                        className="w-full bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-2.5 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Time Slot
                      </label>
                      <select
                        value={consultationTime}
                        onChange={(e) => setConsultationTime(e.target.value)}
                        className="w-full bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-2.5 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
                      >
                        <option value="09:30 AM - 10:30 AM IST">09:30 AM - 10:30 AM IST</option>
                        <option value="11:00 AM - 12:00 PM IST">11:00 AM - 12:00 PM IST</option>
                        <option value="02:00 PM - 03:00 PM IST">02:00 PM - 03:00 PM IST</option>
                        <option value="04:00 PM - 05:00 PM IST">04:00 PM - 05:00 PM IST</option>
                        <option value="06:00 PM - 07:00 PM IST">06:00 PM - 07:00 PM IST</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Format / Mode
                      </label>
                      <select
                        value={consultationMode}
                        onChange={(e) => setConsultationMode(e.target.value)}
                        className="w-full bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-2.5 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
                      >
                        <option value="Virtual Video Call (Google Meet / Zoom)">Virtual Video Call</option>
                        <option value="India HQ In-Person (Chennai)">India HQ In-Person (Chennai)</option>
                        <option value="WhatsApp Consultation Call">WhatsApp Consultation</option>
                        <option value="Direct Phone Call">Direct Phone Call</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              {!isCareerGuidance && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Academic Background & Specific Questions <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    required
                    placeholder="Share details about your current grades, target intake year (e.g. Fall 2027), preferred major, or questions for our counselor..."
                    onChange={() => {
                      if (formErrors.message) setFormErrors(prev => ({ ...prev, message: null }));
                    }}
                    className={`w-full bg-slate-50 dark:bg-navy-950 border text-slate-800 dark:text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-gold-500 ${formErrors.message ? 'border-rose-500' : 'border-slate-200 dark:border-navy-700'
                      }`}
                  />
                  {formErrors.message && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{formErrors.message}</p>
                  )}
                </div>
              )}

              {/* Consent Checkbox */}
              <div className="space-y-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (formErrors.consent) {
                        setFormErrors(prev => ({ ...prev, consent: null }));
                      }
                    }}
                    className="mt-0.5 rounded text-gold-500 focus:ring-gold-500 h-4 w-4 border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    I agree to allow Revival International education advisors to contact me via Phone, WhatsApp, and Email regarding this inquiry. Private records are protected and never shared.
                  </span>
                </label>
                {formErrors.consent && (
                  <p className="text-[11px] text-rose-500 font-medium pl-6">{formErrors.consent}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-3 items-center">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting to CRM...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Book Free Consultation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
