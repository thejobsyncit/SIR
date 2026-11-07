import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  Award, CheckCircle2, Clock, Calendar, Download, 
  Building2, Users, DollarSign, Filter, Search 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmPlacementOffers = () => {
  const [offers, setOffers] = useState([
    {
      id: 'OFF-601',
      studentName: 'Rohan Deshmukh',
      rollNo: '22CS104',
      company: 'TechVision International',
      role: 'Graduate Cloud Architect',
      package: '9,500 SGD / month (~6.2 Lakhs INR / mo)',
      offerDate: '2026-11-02',
      joiningDate: '2026-12-01',
      acceptanceStatus: 'Accepted',
      joiningConfirmed: true,
      offerLetterUrl: '#'
    },
    {
      id: 'OFF-602',
      studentName: 'Ananya Sundaram',
      rollNo: '22CV045',
      company: 'Al Habtoor Contracting LLC',
      role: 'Junior Site Engineer',
      package: '18,000 AED / month (~4.1 Lakhs INR / mo)',
      offerDate: '2026-10-28',
      joiningDate: '2026-11-20',
      acceptanceStatus: 'Accepted',
      joiningConfirmed: true,
      offerLetterUrl: '#'
    },
    {
      id: 'OFF-603',
      studentName: 'Mohammed Tariq',
      rollNo: '22ME089',
      company: 'L&T Construction',
      role: 'Graduate Engineer Trainee',
      package: '11.5 LPA (INR)',
      offerDate: '2026-11-04',
      joiningDate: '2026-12-15',
      acceptanceStatus: 'Pending Candidate Review',
      joiningConfirmed: false,
      offerLetterUrl: '#'
    },
    {
      id: 'OFF-604',
      studentName: 'Sneha Varadarajan',
      rollNo: '22EC034',
      company: 'TechVision International',
      role: 'Junior Cloud Security Analyst',
      package: '8,500 SGD / month',
      offerDate: '2026-11-03',
      joiningDate: '2026-12-01',
      acceptanceStatus: 'Accepted',
      joiningConfirmed: true,
      offerLetterUrl: '#'
    }
  ]);

  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleConfirmJoining = (offId) => {
    setOffers(prev => prev.map(o => o.id === offId ? { ...o, joiningConfirmed: !o.joiningConfirmed } : o));
    showToast('✓ Candidate joining confirmation status updated.');
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Placement Suite • Feature #9
              </span>
              <span className="text-[10px] font-mono text-slate-400">OFFER DISPATCH & JOINING</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Offer and Placement Records
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Record offers, salary package, role, company, offer acceptance and joining status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
              ● Offers Verified
            </span>
          </div>
        </div>

        {toastMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
            {toastMsg}
          </div>
        )}

        {/* 4 Super Admin Style KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Total Offers Extended</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">74</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-1 block">↗ Highest Package: 18,000 AED</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Offers Accepted</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">68</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↗ 91.8% Acceptance Ratio</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Pending Decision</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">6</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ Under Review by Student</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Joining Confirmed</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">54</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">↗ Onboarding Scheduled</span>
          </div>
        </div>

        {/* Offers Table */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                  <th className="p-4 font-bold">Student Name & Roll No</th>
                  <th className="p-4 font-bold">Employer & Role</th>
                  <th className="p-4 font-bold">Salary Package (CTC)</th>
                  <th className="p-4 font-bold text-center">Offer Date</th>
                  <th className="p-4 font-bold text-center">Expected Joining</th>
                  <th className="p-4 font-bold text-center">Acceptance Status</th>
                  <th className="p-4 font-bold text-center">Joining Confirmed</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {offers.map(off => (
                  <tr key={off.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{off.studentName}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{off.rollNo}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{off.company}</p>
                      <span className="text-[10px] text-amber-700 dark:text-gold-400 font-bold">{off.role}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-600">
                      {off.package}
                    </td>
                    <td className="p-4 text-center font-mono text-slate-500">
                      {off.offerDate}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      {off.joiningDate}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        off.acceptanceStatus.includes('Accepted') 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200' 
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200'
                      }`}>
                        {off.acceptanceStatus}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleConfirmJoining(off.id)}
                        className={`px-3 py-1 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                          off.joiningConfirmed 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-500 hover:text-white'
                        }`}
                      >
                        {off.joiningConfirmed ? 'Confirmed ✓' : 'Mark Joined'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => showToast(`Offer letter downloaded for ${off.studentName}`)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:text-gold-500 transition cursor-pointer"
                        title="Download Offer Letter"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ScrollReveal>
  );
};

