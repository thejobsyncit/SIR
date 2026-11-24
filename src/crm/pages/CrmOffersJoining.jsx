import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Award, CheckCircle2, Clock, Calendar, AlertCircle, FileText, 
  Download, Send, Users, DollarSign, Building2, MapPin, CheckSquare, Plus, X, Sparkles, GraduationCap 
} from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

export const CrmOffersJoining = () => {
  const { candidates = [], issueOfferLetter, updateCandidateStage } = useCrm();

  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState('');

  // Selected candidates for offer modal
  const [offerModalCandidate, setOfferModalCandidate] = useState(null);
  const [offerForm, setOfferForm] = useState({
    offerType: 'job_offer', // 'job_offer' | 'college_admission'
    companyName: 'Al Habtoor Engineering Group',
    institutionName: 'Revival Partner University',
    designation: 'Senior Project Engineer',
    courseName: 'B.Tech Computer Science & AI',
    compensation: 'AED 16,500 / Month + Family Visa',
    tuitionFee: 'USD 8,500 / Academic Year',
    joiningDate: '2026-12-15',
    commencementDate: 'Fall Intake (Sep 2026)',
    workLocation: 'Dubai, UAE',
    campusLocation: 'Academic City Campus, Dubai',
    termsAndConditions: 'Standard 30-day probation, medical insurance tier A, annual return flight tickets included.'
  });
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Candidates who passed the interview and are selected
  const selectedCandidates = candidates.filter(c => c.stage === 'selected');

  // Derive offers from candidates who have offers issued or joined
  const candidateOffers = candidates
    .filter(c => c.stage === 'offer_released' || c.stage === 'offer_accepted' || c.stage === 'joined' || c.offerDetails)
    .map(c => {
      let details = {};
      try {
        details = typeof c.offerDetails === 'string' ? JSON.parse(c.offerDetails) : (c.offerDetails || {});
      } catch (_) {}

      return {
        id: details.offerId || `OFF-${c.id}`,
        candidateId: c.id,
        candidateName: c.name,
        role: details.targetRole || c.currentRole || 'Appointed Specialist',
        company: details.targetEntity || details.companyName || 'Revival Partner Corporation',
        package: details.targetComp || c.expectedSalary || 'AED 15,000 / Month',
        offerDate: details.issuedAt ? new Date(details.issuedAt).toLocaleDateString() : 'Recent',
        joiningDate: details.targetDate || 'Immediate / 30 Days',
        location: details.targetLocation || c.location || 'UAE / Global',
        status: c.stage === 'joined' ? 'Joining Confirmed' : (c.stage === 'offer_accepted' ? 'Accepted' : 'Offered'),
        joiningConfirmed: c.stage === 'joined',
        visaStatus: 'Processed',
        offerType: details.offerType || 'job_offer'
      };
    });

  const handleOpenOfferModal = (cand) => {
    setOfferModalCandidate(cand);
    setOfferForm(prev => ({
      ...prev,
      designation: cand.currentRole || 'Executive Candidate',
      workLocation: cand.location || cand.preferredCountry || 'Dubai, UAE'
    }));
  };

  const handleDispatchOffer = async (e) => {
    e.preventDefault();
    if (!offerModalCandidate) return;

    setIsSubmittingOffer(true);
    try {
      if (issueOfferLetter) {
        await issueOfferLetter(offerModalCandidate.id, offerForm);
      }
      showToast(`✓ Official ${offerForm.offerType === 'college_admission' ? 'Admission' : 'Offer'} Letter issued and emailed to ${offerModalCandidate.name}!`);
      setOfferModalCandidate(null);
    } catch (err) {
      showToast(`⚠️ Error issuing offer: ${err.message}`);
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const handleUpdateOfferStatus = (candidateId, newStatus) => {
    if (newStatus === 'Joining Confirmed') {
      updateCandidateStage(candidateId, 'joined');
    } else if (newStatus === 'Accepted') {
      updateCandidateStage(candidateId, 'offer_accepted');
    } else if (newStatus === 'Declined') {
      updateCandidateStage(candidateId, 'rejected');
    }
    showToast(`✓ Candidate status updated to "${newStatus}"`);
  };

  const filteredOffers = candidateOffers.filter(o => 
    filterStatus === 'all' || o.status.toLowerCase() === filterStatus.toLowerCase()
  );

  const totalOffers = candidateOffers.length;
  const acceptedOffers = candidateOffers.filter(o => o.status === 'Accepted').length;
  const pendingOffers = candidateOffers.filter(o => o.status === 'Offered').length;
  const confirmedJoiners = candidateOffers.filter(o => o.status === 'Joining Confirmed').length;

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

        {/* Selected Candidates Awaiting Placement / Offer Release */}
        <div className="bg-white dark:bg-navy-900 border border-gold-500/30 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-500" />
                <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  Candidates Selected in Interview (Ready for Offer / Admission)
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                These candidates have passed interview evaluations and are ready for official Offer Letter or University Admission dispatch.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold rounded-full">
              {selectedCandidates.length} Pending Placement
            </span>
          </div>

          {selectedCandidates.length === 0 ? (
            <div className="p-6 bg-slate-50 dark:bg-navy-950 rounded-2xl text-center space-y-2 border border-slate-200 dark:border-navy-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                All selected candidates have been processed with official offers!
              </p>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                When an interviewer marks a candidate as "Passed / Selected" in the Interview Center, they will automatically appear here for offer generation and email dispatch.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedCandidates.map(c => (
                <div key={c.id} className="p-4 bg-slate-50 dark:bg-navy-950 border border-gold-500/30 rounded-2xl space-y-3 hover:border-gold-500 transition shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif font-bold text-slate-900 dark:text-white text-sm">{c.name}</h4>
                      <p className="text-slate-500 text-[11px]">{c.currentRole || 'Candidate'} • <span className="text-gold-600 dark:text-gold-400 font-mono font-bold">{c.id}</span></p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      ★ Selected
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <p><strong>Email:</strong> {c.email || 'N/A'}</p>
                    <p><strong>Location:</strong> {c.location || c.preferredCountry || 'UAE'}</p>
                    <p><strong>Expected:</strong> {c.expectedSalary || 'Market Standard'}</p>
                  </div>

                  <button
                    onClick={() => handleOpenOfferModal(c)}
                    className="w-full py-2 bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Issue Offer / Admission Letter →</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Issue Offer / Admission Modal */}
        {offerModalCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-luxury space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold-500/20 text-gold-600 dark:text-gold-400 uppercase tracking-wider">
                    Official Document Dispatch
                  </span>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">
                    Issue Placement Letter for {offerModalCandidate.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Candidate will receive an official email notification via Zoho Mail, and the letter will be published to their Candidate Dashboard.
                  </p>
                </div>
                <button
                  onClick={() => setOfferModalCandidate(null)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Offer Type Selector */}
              <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setOfferForm({ ...offerForm, offerType: 'job_offer' })}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    offerForm.offerType === 'job_offer'
                      ? 'bg-gold-500 text-navy-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-navy-950 dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Job Offer Letter (Corporate)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOfferForm({ ...offerForm, offerType: 'college_admission' })}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    offerForm.offerType === 'college_admission'
                      ? 'bg-gold-500 text-navy-950 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-navy-950 dark:hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>University Admission Letter (Academic)</span>
                </button>
              </div>

              <form onSubmit={handleDispatchOffer} className="space-y-4 text-xs">
                {offerForm.offerType === 'job_offer' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Hiring Corporation / Employer</label>
                        <input
                          required
                          type="text"
                          value={offerForm.companyName}
                          onChange={e => setOfferForm({ ...offerForm, companyName: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Designation / Job Title</label>
                        <input
                          required
                          type="text"
                          value={offerForm.designation}
                          onChange={e => setOfferForm({ ...offerForm, designation: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Compensation / Monthly CTC</label>
                        <input
                          required
                          type="text"
                          value={offerForm.compensation}
                          onChange={e => setOfferForm({ ...offerForm, compensation: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Target Joining Date</label>
                        <input
                          required
                          type="text"
                          value={offerForm.joiningDate}
                          onChange={e => setOfferForm({ ...offerForm, joiningDate: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Work Location</label>
                      <input
                        required
                        type="text"
                        value={offerForm.workLocation}
                        onChange={e => setOfferForm({ ...offerForm, workLocation: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Partner University / Institution</label>
                        <input
                          required
                          type="text"
                          value={offerForm.institutionName}
                          onChange={e => setOfferForm({ ...offerForm, institutionName: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Enrolled Degree / Program</label>
                        <input
                          required
                          type="text"
                          value={offerForm.courseName}
                          onChange={e => setOfferForm({ ...offerForm, courseName: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Annual / Semester Tuition Fee</label>
                        <input
                          required
                          type="text"
                          value={offerForm.tuitionFee}
                          onChange={e => setOfferForm({ ...offerForm, tuitionFee: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Academic Intake Commencement</label>
                        <input
                          required
                          type="text"
                          value={offerForm.commencementDate}
                          onChange={e => setOfferForm({ ...offerForm, commencementDate: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Campus Location</label>
                      <input
                        required
                        type="text"
                        value={offerForm.campusLocation}
                        onChange={e => setOfferForm({ ...offerForm, campusLocation: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Terms, Benefits & Formal Instructions</label>
                  <textarea
                    rows={3}
                    value={offerForm.termsAndConditions}
                    onChange={e => setOfferForm({ ...offerForm, termsAndConditions: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl p-2.5 font-medium focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOfferModalCandidate(null)}
                    disabled={isSubmittingOffer}
                    className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingOffer}
                    className="flex-1 py-3 bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingOffer ? (
                      <>
                        <Send className="w-4 h-4 animate-spin" />
                        <span>Dispatching Letter & Email...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Dispatch Official Letter & Notify Candidate</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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

