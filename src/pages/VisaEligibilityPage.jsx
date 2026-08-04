import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Globe, Award, CheckCircle2, AlertTriangle, FileText, Clock, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';
import { VisaMatrixTable } from '../components/VisaMatrixTable';

export const VisaEligibilityPage = () => {
  const { navigateTo } = useApp();
  
  // Interactive Calculator State
  const [country, setCountry] = useState('UAE');
  const [qualification, setQualification] = useState("Bachelor's Degree");
  const [experience, setExperience] = useState('5');
  const [age, setAge] = useState('29');
  const [language, setLanguage] = useState('English');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/visa/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, qualification, experience, age, language })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3.5 py-1 rounded-full uppercase">
          International Work Visa Intelligence
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-navy-900 dark:text-white">
          GCC & Global Visa Eligibility Checker
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Evaluate your profile against official MOHRE, Saudi Iqama, Qatar Work Residence, and EU Blue Card rules.
        </p>
      </div>

      {/* Interactive Form & Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Column */}
        <div className="lg:col-span-5 glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 rounded-3xl space-y-4 shadow-luxury text-xs">
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-navy-800 pb-3">
            <Globe className="w-5 h-5 text-gold-500" />
            <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white">Personal Profile Evaluation</h3>
          </div>

          <form onSubmit={handleEvaluate} className="space-y-4">
            
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Destination Country</label>
              <select 
                value={country} 
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white font-semibold"
              >
                <option value="UAE">🇦🇪 United Arab Emirates</option>
                <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                <option value="Qatar">🇶🇦 Qatar</option>
                <option value="Oman">🇴🇲 Oman</option>
                <option value="Kuwait">🇰🇼 Kuwait</option>
                <option value="Bahrain">🇧🇭 Bahrain</option>
                <option value="Singapore">🇸🇬 Singapore</option>
                <option value="Canada">🇨🇦 Canada</option>
                <option value="Australia">🇦🇺 Australia</option>
                <option value="United Kingdom">🇬🇧 United Kingdom</option>
                <option value="Germany">🇩🇪 Germany</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Highest Qualification</label>
              <select 
                value={qualification} 
                onChange={(e) => setQualification(e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white"
              >
                <option value="10th/12th Pass">10th / 12th Secondary Pass (Labor / Hospitality)</option>
                <option value="Diploma">Technical Diploma (Technician / Trade)</option>
                <option value="Bachelor's Degree">Bachelor's Degree (Professional / Engineer / Executive)</option>
                <option value="Master's Degree">Master's Degree / Doctorate (Senior Executive / Specialist)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Work Experience (Years)</label>
                <select 
                  value={experience} 
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white"
                >
                  <option value="1">0 - 2 Years (Entry)</option>
                  <option value="4">3 - 5 Years (Skilled)</option>
                  <option value="7">5 - 10 Years (Senior)</option>
                  <option value="12">10+ Years (Executive)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Candidate Age</label>
                <input 
                  type="number" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Language Proficiency</label>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white"
              >
                <option value="English">Fluent English</option>
                <option value="Arabic">Fluent Arabic & English</option>
                <option value="German">German B1 / B2</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Embassy Rules...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Calculate Visa Eligibility Score</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {!result ? (
            <div className="glass-card bg-navy-950 text-white rounded-3xl p-8 border border-gold-500/30 shadow-luxury text-center py-16 space-y-3">
              <Globe className="w-12 h-12 text-gold-500 mx-auto animate-pulse" />
              <h3 className="font-serif text-2xl font-bold">Calculate Your Work Visa Readiness</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Fill in your destination country, degree qualification, and years of experience to calculate your score and view mandatory document checklists.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              {/* Score Card */}
              <div className="glass-card bg-navy-950 text-white border border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-luxury space-y-4">
                <div className="flex justify-between items-start border-b border-navy-800 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-gold-400 tracking-wider">Visa Eligibility Index</p>
                    <h3 className="font-serif text-3xl font-extrabold text-white mt-1">{result.status}</h3>
                    <p className="text-xs text-slate-400">Target Country: <strong className="text-white">{result.countryData.country}</strong></p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-gold-500 flex items-center justify-center font-extrabold text-gold-400 text-xl">
                    {result.score}%
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-navy-900 rounded-xl">
                    <p className="text-[10px] text-slate-400">Processing Time</p>
                    <p className="font-bold text-emerald-400">{result.processingTime}</p>
                  </div>
                  <div className="p-3 bg-navy-900 rounded-xl">
                    <p className="text-[10px] text-slate-400">Estimated Cost</p>
                    <p className="font-bold text-gold-400">{result.estimatedCost}</p>
                  </div>
                  <div className="p-3 bg-navy-900 rounded-xl">
                    <p className="text-[10px] text-slate-400">Employer Sponsorship</p>
                    <p className="font-bold text-white">Mandatory</p>
                  </div>
                </div>
              </div>

              {/* Document Checklist */}
              <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-3 text-xs shadow-glass">
                <h4 className="font-serif font-bold text-navy-900 dark:text-white text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold-500" />
                  Mandatory Document Checklist for {result.countryData.country} Visa:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.checklist.map((doc, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Matching Jobs */}
              <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-3 text-xs">
                <h4 className="font-serif font-bold text-navy-900 dark:text-white text-base">
                  Recommended Vacancies in {result.countryData.country}:
                </h4>
                <div className="space-y-2">
                  {result.recommendedJobs.map((j) => (
                    <div key={j.id} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border flex justify-between items-center">
                      <div>
                        <p className="font-bold text-navy-900 dark:text-white">{j.title}</p>
                        <p className="text-[11px] text-slate-500">{j.company} • {j.salary}</p>
                      </div>
                      <button onClick={() => navigateTo('jobs')} className="px-3 py-1.5 bg-navy-900 text-gold-400 font-bold rounded-lg hover:bg-gold-500 hover:text-navy-950 transition">
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* FULL COUNTRY VISA MATRIX TABLE */}
      <div className="space-y-6 pt-8">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold text-gold-500 uppercase tracking-widest">Master Database</h2>
          <h3 className="font-serif text-3xl font-extrabold text-navy-900 dark:text-white">
            Country-Wise Visa Eligibility Matrix (18 Countries)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare work visa requirements, minimum qualifications, age rules, processing times, and average costs.
          </p>
        </div>

        <VisaMatrixTable />
      </div>

    </div>
  );
};
