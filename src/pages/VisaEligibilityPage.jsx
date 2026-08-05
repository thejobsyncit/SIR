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
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      console.warn('Using client evaluation engine fallback:', err);
      // Client-side fallback calculation matching backend
      const target = (country || 'uae').toLowerCase();
      const ageVal = parseInt(age) || 30;
      const expVal = parseInt(experience) || 2;
      const qualStr = (qualification || '').toLowerCase();
      const langStr = (language || '').toLowerCase();
      
      let baseScore = 20;
      const reasons = [];

      let ageScore = 0;
      if (target === 'australia') {
        if (ageVal < 18) { ageScore = 0; reasons.push('Below minimum working age (18) for Australia independent visa.'); }
        else if (ageVal <= 24) { ageScore = 25; reasons.push('Age 18-24 grants 25 points on Australia Skilled Points Grid.'); }
        else if (ageVal <= 32) { ageScore = 30; reasons.push('Peak Age Bracket (25-32) grants maximum 30 points for Australia Visa.'); }
        else if (ageVal <= 39) { ageScore = 25; reasons.push('Age 33-39 grants 25 points on Australia Migration Grid.'); }
        else if (ageVal <= 44) { ageScore = 15; reasons.push('Age 40-44 grants 15 points on Australia Skilled Migration.'); }
        else { ageScore = -25; reasons.push('Exceeds Australia Skilled Migration age threshold (Maximum 45 years limit). Employer sponsorship pathway required.'); }
      } else if (target === 'canada') {
        if (ageVal >= 20 && ageVal <= 29) { ageScore = 30; reasons.push('Peak age bracket (20-29) yields maximum CRS points for Canada Express Entry.'); }
        else if (ageVal >= 30 && ageVal <= 44) { ageScore = Math.max(5, 30 - (ageVal - 29) * 2); reasons.push(`Age ${ageVal} receives reduced CRS age points (-2 pts/yr after 30).`); }
        else { ageScore = 0; reasons.push('Age 45+ awards 0 points under Canada Express Entry CRS.'); }
      } else {
        if (ageVal >= 21 && ageVal <= 50) { ageScore = 25; reasons.push('Optimal working age demographic for work visa approval.'); }
        else if (ageVal <= 58) { ageScore = 18; reasons.push('Standard eligible age range.'); }
        else { ageScore = 5; reasons.push('Above standard prime age; requires ministry exemption or high salary.'); }
      }

      let qualScore = qualStr.includes('master') ? 30 : qualStr.includes('bachelor') ? 25 : qualStr.includes('diploma') ? 18 : 10;
      reasons.push(`${qualification} evaluated for destination country standard.`);

      let expScore = expVal >= 10 ? 25 : expVal >= 5 ? 20 : expVal >= 3 ? 14 : 8;
      reasons.push(`${experience} years experience added to professional profile rating.`);

      let langScore = langStr.includes('english') || langStr.includes('arabic') || langStr.includes('german') ? 20 : 10;

      let score = Math.max(10, Math.min(100, baseScore + ageScore + qualScore + expScore + langScore));
      let status = score >= 85 ? 'Highly Eligible' : score >= 70 ? 'Eligible (Standard Pathway)' : score >= 50 ? 'Conditional Eligibility' : 'Low Eligibility';

      setResult({
        score,
        status,
        countryData: { country },
        reasons,
        processingTime: '7 - 21 Days',
        estimatedCost: 'Standard Employer Paid',
        checklist: ['Passport (6+ months validity)', 'Educational Certificate Attestation', 'Medical Clearance', 'Signed Employment Offer Letter'],
        recommendedJobs: []
      });
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
        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
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
            <div className="glass-card bg-white dark:bg-navy-950 text-slate-900 dark:text-white rounded-3xl p-8 border border-slate-200 dark:border-gold-500/30 shadow-xl text-center py-16 space-y-3">
              <Globe className="w-12 h-12 text-gold-500 mx-auto animate-pulse" />
              <h3 className="font-serif text-2xl font-bold text-navy-950 dark:text-white">Calculate Your Work Visa Readiness</h3>
              <p className="text-xs text-slate-800 dark:text-slate-200 max-w-md mx-auto font-medium">
                Fill in your destination country, degree qualification, and years of experience to calculate your score and view mandatory document checklists.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              {/* Score Card - White Card in Light Mode with Black Text / Dark Navy in Dark Mode */}
              <div className="glass-card bg-white dark:bg-navy-950 border border-slate-200 dark:border-gold-500/50 rounded-3xl p-6 sm:p-8 shadow-luxury space-y-4">
                <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-gold-600 dark:text-gold-400 tracking-wider">Visa Eligibility Index</p>
                    <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-950 dark:text-white mt-1">{result.status}</h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">Target Country: <strong className="text-gold-600 dark:text-gold-400 font-bold">{result.countryData ? result.countryData.country : country}</strong></p>
                  </div>
                  <div className="w-20 h-20 rounded-full border-4 border-gold-500 bg-gold-500/10 dark:bg-navy-900 flex flex-col items-center justify-center font-extrabold text-gold-600 dark:text-gold-400 text-2xl shadow-gold-glow shrink-0">
                    <span>{result.score}%</span>
                  </div>
                </div>

                {/* Criteria Reasons Breakdown */}
                {result.reasons && result.reasons.length > 0 && (
                  <div className="space-y-2 pt-1 border-b border-slate-200 dark:border-navy-800 pb-4">
                    <p className="text-[11px] font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider">Evaluation Breakdown & Points Criteria:</p>
                    <ul className="space-y-2 text-xs">
                      {result.reasons.map((r, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5 text-slate-800 dark:text-slate-200 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-3 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl">
                    <p className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">Processing Time</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">{result.processingTime || '7 - 21 Days'}</p>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl">
                    <p className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">Estimated Cost</p>
                    <p className="font-bold text-gold-600 dark:text-gold-400 text-xs mt-0.5">{result.estimatedCost || 'Employer Sponsored'}</p>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl col-span-2 sm:col-span-1">
                    <p className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">Employer Sponsorship</p>
                    <p className="font-bold text-navy-950 dark:text-white text-xs mt-0.5">Mandatory</p>
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
                    <div key={idx} className="p-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
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
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">{j.company} • {j.salary}</p>
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
          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
            Compare work visa requirements, minimum qualifications, age rules, processing times, and average costs.
          </p>
        </div>

        <VisaMatrixTable />
      </div>

    </div>
  );
};
