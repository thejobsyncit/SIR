import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Award, CheckCircle2, Clock, Calendar, AlertCircle, FileText, 
  Download, Send, Users, DollarSign, Building2, MapPin, CheckSquare 
} from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

export const CrmOffersJoining = () => {
  const [offers, setOffers] = useState([
    {
      id: 'OFF-701',
      candidateName: 'Alexander Wright',
      role: 'Senior Civil Project Manager',
      company: 'Al Habtoor Contracting LLC',
      location: 'Dubai, UAE',
      package: '26,000 AED / month + Family Benefits',
      offerDate: '2026-11-01',
      joiningDate: '2026-12-01',
      status: 'Accepted', // 'Offered' | 'Accepted' | 'Joining Confirmed' | 'Declined'
      joiningConfirmed: false,
      contractSigned: true,
      visaStatus: 'Entry Permit Issued'
    },
    {
      id: 'OFF-702',
      candidateName: 'Dr. Priya Sharma',
      role: 'Consultant Cardiologist',
      company: 'Saudi German Hospital',
      location: 'Riyadh, KSA',
      package: '52,000 SAR / month + Housing',
      offerDate: '2026-11-03',
      joiningDate: '2026-12-15',
      status: 'Offered',
      joiningConfirmed: false,
      contractSigned: false,
      visaStatus: 'MOH Credentialing'
    },
    {
      id: 'OFF-703',
      candidateName: 'Rahul Verma',
      role: 'Lead DevOps Cloud Architect',
      company: 'TechVision International',
      location: 'Singapore',
      package: '11,500 SGD / month',
      offerDate: '2026-10-25',
      joiningDate: '2026-11-20',
      status: 'Joining Confirmed',
      joiningConfirmed: true,
      contractSigned: true,
      visaStatus: 'EP Approved'
    },
    {
      id: 'OFF-704',
      candidateName: 'Elena Rostova',
      role: 'Executive Hospitality Manager',
      company: 'Emaar Hospitality Group',
      location: 'Dubai, UAE',
      package: '18,500 AED / month + Annual Flights',
      offerDate: '2026-10-28',
      joiningDate: '2026-11-15',
      status: 'Joining Confirmed',
      joiningConfirmed: true,
      contractSigned: true,
      visaStatus: 'Residence Visa Stamped'
    },
    {
      id: 'OFF-705',
      candidateName: 'Karthik Raja',
      role: 'Senior Mechanical Site Engineer',
      company: 'L&T Construction',
      location: 'Chennai, India',
      package: '14.5 LPA (INR)',
      offerDate: '2026-11-02',
      joiningDate: '2026-12-05',
      status: 'Offered',
      joiningConfirmed: false,
      contractSigned: false,
      visaStatus: 'N/A (Domestic)'
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState('');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleUpdateOfferStatus = (offerId, newStatus) => {
    setOffers(prev => prev.map(o => {
      if (o.id === offerId) {
        return {
          ...o,
          status: newStatus,
          joiningConfirmed: newStatus === 'Joining Confirmed' ? true : o.joiningConfirmed
        };
      }
      return o;
    }));
    showToast(`✓ Offer ${offerId} status updated to "${newStatus}"`);
  };

  const handleToggleConfirmJoining = (offerId) => {
    setOffers(prev => prev.map(o => {
      if (o.id === offerId) {
        const nextConfirmed = !o.joiningConfirmed;
        return {
          ...o,
          joiningConfirmed: nextConfirmed,
          status: nextConfirmed ? 'Joining Confirmed' : 'Accepted'
        };
      }
      return o;
    }));
    showToast(`✓ Candidate joining status toggled`);
  };

  const filteredOffers = offers.filter(o => 
    filterStatus === 'all' || o.status.toLowerCase() === filterStatus.toLowerCase()
  );

  const totalOffers = offers.length;
  const acceptedOffers = offers.filter(o => o.status === 'Accepted').length;
  const pendingOffers = offers.filter(o => o.status === 'Offered').length;
  const confirmedJoiners = offers.filter(o => o.status === 'Joining Confirmed' || o.joiningConfirmed).length;

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 rounded-3xl border border-gold-500/30 shadow-lg text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-500 text-navy-950 uppercase tracking-wider">
              Recruiter Feature #10
            </span>
            <span className="text-xs text-slate-400 font-mono">OFFER-JOINING-LIFECYCLE</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
            Offers and Joining
          </h1>
          <p className="text-slate-300 text-xs mt-1">
            Track offer status, acceptance, joining date and joining confirmation.
          </p>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
            {notification}
          </div>
        )}

        {/* 4 Summary Metric Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Total Offers Extended</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{totalOffers}</span>
              <span className="p-2 bg-blue-500/10 text-blue-600 rounded-xl"><Award className="w-4 h-4" /></span>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Offers Accepted</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{acceptedOffers}</span>
              <span className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl"><CheckCircle2 className="w-4 h-4" /></span>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Acceptance Pending</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">{pendingOffers}</span>
              <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl"><Clock className="w-4 h-4" /></span>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Confirmed Joined Candidates</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-gold-600 dark:text-gold-400 font-mono">{confirmedJoiners}</span>
              <span className="p-2 bg-gold-500/10 text-gold-600 rounded-xl"><Users className="w-4 h-4" /></span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-4 rounded-2xl flex justify-between items-center shadow-sm">
          <span className="font-serif text-sm font-bold text-slate-900 dark:text-white">
            Offer & Onboarding Roster
          </span>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Offers</option>
              <option value="offered">Offered (Pending)</option>
              <option value="accepted">Accepted</option>
              <option value="joining confirmed">Joining Confirmed</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>

        {/* Offers Table */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 font-serif uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800">
                  <th className="p-4 font-bold">Candidate & Opening</th>
                  <th className="p-4 font-bold">Offer Compensation</th>
                  <th className="p-4 font-bold text-center">Offer Date</th>
                  <th className="p-4 font-bold text-center">Expected Joining</th>
                  <th className="p-4 font-bold text-center">Status</th>
                  <th className="p-4 font-bold text-center">Joining Confirmed</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {filteredOffers.map(off => (
                  <tr key={off.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 font-extrabold shrink-0">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{off.candidateName}</p>
                          <p className="text-[11px] text-slate-500">{off.role}</p>
                          <span className="text-[10px] font-mono text-indigo-500">{off.company} • {off.location}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 block text-xs">
                        {off.package}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Visa: {off.visaStatus}</span>
                    </td>

                    <td className="p-4 text-center font-mono text-slate-500 text-[11px]">
                      {off.offerDate}
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-extrabold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                        {off.joiningDate}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <select
                        value={off.status}
                        onChange={e => handleUpdateOfferStatus(off.id, e.target.value)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border focus:outline-none cursor-pointer ${
                          off.status === 'Joining Confirmed'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                            : off.status === 'Accepted'
                            ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-500/30'
                            : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30'
                        }`}
                      >
                        <option value="Offered">Offered</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Joining Confirmed">Joining Confirmed</option>
                        <option value="Declined">Declined</option>
                      </select>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleConfirmJoining(off.id)}
                        className={`px-3 py-1 rounded-xl text-[10px] font-extrabold transition cursor-pointer ${
                          off.joiningConfirmed
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-navy-800 text-slate-500 hover:text-emerald-600'
                        }`}
                      >
                        {off.joiningConfirmed ? '✓ Confirmed' : 'Mark Joined'}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => showToast(`Offer letter downloaded for ${off.candidateName}`)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:text-gold-500 transition cursor-pointer"
                          title="Download Offer Letter"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => showToast(`Joining reminder alert sent to ${off.candidateName}`)}
                          className="px-2.5 py-1 bg-gold-500 text-navy-950 hover:bg-gold-400 font-bold rounded-lg text-[10px] transition cursor-pointer"
                        >
                          Reminder
                        </button>
                      </div>
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

