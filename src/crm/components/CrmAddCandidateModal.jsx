import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { X, User, Mail, Phone, Globe, Briefcase, DollarSign, Calendar, Shield, Sparkles, CheckCircle2, FileText, Upload } from 'lucide-react';
import { PIPELINE_STAGES } from '../data/mockCrmData';

export const CrmAddCandidateModal = ({ isOpen, onClose }) => {
  const { addCandidate, user } = useCrm();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'professional' | 'compliance'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    gender: 'Male',
    dob: '1992-05-15',
    nationality: 'United Kingdom',
    passport: 'GB' + Math.floor(10000000 + Math.random() * 90000000),
    passportExpiry: '2030-12-31',
    currentLocation: 'Dubai, UAE',
    preferredLocation: 'Riyadh, KSA',
    visaStatus: 'Employment Visa (Transferable)',
    currentEmployer: 'Emaar Properties PJSC',
    designation: 'Senior Project Engineer',
    experience: '8 Years',
    currentSalary: 'AED 28,000 / month',
    expectedSalary: 'AED 35,000 / month',
    noticePeriod: '30 Days',
    skills: 'Primavera P6, FIDIC Contracts, High-Rise Construction, MOHRE Compliance',
    stage: 'lead',
    assignedRecruiter: 'Fatima Al-Zahra',
    aiSummary: 'Verified candidate profile added into SIR Recruitment Enterprise CRM.'
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [addedCandId, setAddedCandId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;

    const skillsArray = typeof formData.skills === 'string' 
      ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      : formData.skills;

    const candObj = {
      ...formData,
      skills: skillsArray.length ? skillsArray : ['Executive Leadership', 'GCC Compliance'],
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 99999)}?w=150&auto=format&fit=crop&q=80`
    };

    addCandidate(candObj);
    setAddedCandId('SIR-CAN-' + Math.floor(2000 + Math.random() * 8000));
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card bg-white dark:bg-[#0c1428] border border-gold-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-luxury space-y-4 max-h-[92vh] overflow-y-auto text-slate-900 dark:text-white font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <span className="bg-gold-500/20 text-gold-600 dark:text-gold-400 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded">Corporate Talent Gateway</span>
            <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Register Executive Candidate</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add complete profile details to the SIR Candidate Database.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-gold-500"><X className="w-5 h-5" /></button>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center space-y-3 animate-in zoom-in-95">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Candidate Registered Successfully!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-300">
              Candidate profile added to CRM with ID <strong className="text-gold-500">{addedCandId}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Form Navigation Tabs */}
            <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 font-bold text-xs">
              <button 
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`pb-2 px-3 transition flex items-center gap-1.5 ${activeTab === 'personal' ? 'border-b-2 border-gold-500 text-gold-600 dark:text-gold-400' : 'text-slate-400'}`}
              >
                <User className="w-3.5 h-3.5" />
                <span>1. Personal & Contact</span>
              </button>

              <button 
                type="button"
                onClick={() => setActiveTab('professional')}
                className={`pb-2 px-3 transition flex items-center gap-1.5 ${activeTab === 'professional' ? 'border-b-2 border-gold-500 text-gold-600 dark:text-gold-400' : 'text-slate-400'}`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>2. Employment & Salary</span>
              </button>

              <button 
                type="button"
                onClick={() => setActiveTab('compliance')}
                className={`pb-2 px-3 transition flex items-center gap-1.5 ${activeTab === 'compliance' ? 'border-b-2 border-gold-500 text-gold-600 dark:text-gold-400' : 'text-slate-400'}`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>3. Passport & Visa Compliance</span>
              </button>
            </div>

            {/* Tab 1: Personal & Contact */}
            {activeTab === 'personal' && (
              <div className="space-y-3 animate-in fade-in">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Candidate Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Dr. Sarah Al-Mansoori"
                    value={formData.name}
                    onChange={e=>setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-100 dark:bg-[#060a17] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:border-gold-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Corporate Email Address *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="name@domain.com"
                      value={formData.email}
                      onChange={e=>setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#060a17] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Telephone *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="+971 50 123 4567"
                      value={formData.phone}
                      onChange={e=>setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#060a17] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nationality</label>
                    <select 
                      value={formData.nationality}
                      onChange={e=>setFormData({...formData, nationality: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#060a17] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:border-gold-500 cursor-pointer"
                    >
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="India">India</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Philippines">Philippines</option>
                      <option value="Poland">Poland</option>
                      <option value="Egypt">Egypt</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                    <select 
                      value={formData.gender}
                      onChange={e=>setFormData({...formData, gender: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#060a17] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:border-gold-500 cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Residence</label>
                    <input 
                      type="text"
                      value={formData.currentLocation}
                      onChange={e=>setFormData({...formData, currentLocation: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#060a17] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:border-gold-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Employment & Salary */}
            {activeTab === 'professional' && (
              <div className="space-y-3 animate-in fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Employer</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Al Habtoor Group LLC"
                      value={formData.currentEmployer}
                      onChange={e=>setFormData({...formData, currentEmployer: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#060a17] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Designation / Role</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Senior DevOps Architect"
                      value={formData.designation}
                      onChange={e=>setFormData({...formData, designation: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#060a17] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Total Experience</label>
                    <input 
                      type="text"
                      value={formData.experience}
                      onChange={e=>setFormData({...formData, experience: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#060a17] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Salary</label>
                    <input 
                      type="text" 
                      value={formData.currentSalary}
                      onChange={e=>setFormData({...formData, currentSalary: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#060a17] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Expected Salary</label>
                    <input 
                      type="text" 
                      value={formData.expectedSalary}
                      onChange={e=>setFormData({...formData, expectedSalary: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#060a17] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:border-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Key Skills (Comma Separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. AWS Architect, Kubernetes, Terraform, DevOps CI/CD"
                    value={formData.skills}
                    onChange={e=>setFormData({...formData, skills: e.target.value})}
                    className="w-full bg-slate-100 dark:bg-[#060a17] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:border-gold-500"
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Compliance & Pipeline Stage */}
            {activeTab === 'compliance' && (
              <div className="space-y-3 animate-in fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Passport Number</label>
                    <input 
                      type="text" 
                      value={formData.passport}
                      onChange={e=>setFormData({...formData, passport: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#060a17] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:border-gold-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Visa Status</label>
                    <select 
                      value={formData.visaStatus}
                      onChange={e=>setFormData({...formData, visaStatus: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#060a17] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:border-gold-500 cursor-pointer"
                    >
                      <option value="Employment Visa (Transferable)">Employment Visa (Transferable)</option>
                      <option value="Visit Visa / Tourist">Visit Visa / Tourist</option>
                      <option value="UAE Golden Visa">UAE Golden Visa</option>
                      <option value="GCC Resident">GCC Resident</option>
                      <option value="Overseas / Out-of-Country">Overseas / Out-of-Country</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Pipeline Stage</label>
                    <select 
                      value={formData.stage}
                      onChange={e=>setFormData({...formData, stage: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#060a17] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:border-gold-500 cursor-pointer"
                    >
                      {PIPELINE_STAGES.map(st => (
                        <option key={st.id} value={st.id}>{st.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Executive Recruiter</label>
                    <select 
                      value={formData.assignedRecruiter}
                      onChange={e=>setFormData({...formData, assignedRecruiter: e.target.value})}
                      className="w-full bg-slate-100 dark:bg-[#060a17] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs font-semibold focus:border-gold-500 cursor-pointer"
                    >
                      <option value="Fatima Al-Zahra">Fatima Al-Zahra</option>
                      <option value="Tariq Al-Hashemi">Tariq Al-Hashemi</option>
                      <option value="David Sterling">David Sterling</option>
                      <option value="Rajesh Kumar">Rajesh Kumar</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Controls */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              {activeTab !== 'personal' ? (
                <button 
                  type="button" 
                  onClick={() => setActiveTab(activeTab === 'compliance' ? 'professional' : 'personal')}
                  className="px-4 py-2 bg-slate-200 dark:bg-[#060a17] text-slate-800 dark:text-slate-200 font-bold rounded-xl"
                >
                  ← Previous Step
                </button>
              ) : <div></div>}

              {activeTab !== 'compliance' ? (
                <button 
                  type="button" 
                  onClick={() => setActiveTab(activeTab === 'personal' ? 'professional' : 'compliance')}
                  className="px-5 py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow"
                >
                  Next Step →
                </button>
              ) : (
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-gold-500 text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition"
                >
                  ✓ Save Candidate to SIR CRM
                </button>
              )}
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
