import React, { useState } from 'react';
import ScrollReveal from '../../components/ScrollReveal';
import { useCrm } from '../context/CrmContext';
import {
  Calendar, Video, Clock, UserCheck, Link, Plus, CheckCircle2,
  Send, RefreshCw, X, MessageSquare, AlertCircle, Trash2
} from 'lucide-react';

export const CrmInterviews = () => {
  const { interviews, addInterview, updateInterview, deleteInterview } = useCrm();
  const [modalOpen, setModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(null);
  const [deleteConfirmInterview, setDeleteConfirmInterview] = useState(null);
  const [isDeletingInterview, setIsDeletingInterview] = useState(false);

  // Form State
  const [newInterview, setNewInterview] = useState({
    candidateName: 'Alexander Wright',
    jobTitle: 'Senior Civil Project Manager',
    clientCompany: 'Al Habtoor Contracting LLC',
    date: '2026-08-10',
    time: '15:00 GST',
    platform: 'Microsoft Teams',
    panelists: 'Eng. Hassan Al-Habtoor, Tariq Al-Hashemi'
  });

  // Feedback State
  const [feedbackText, setFeedbackText] = useState('');
  const [resultStatus, setResultStatus] = useState('Passed');

  const handleCreateInterview = (e) => {
    e.preventDefault();
    const interviewObj = {
      id: 'INT-' + Math.floor(800 + Math.random() * 200),
      candidateName: newInterview.candidateName,
      jobTitle: newInterview.jobTitle,
      clientCompany: newInterview.clientCompany,
      date: newInterview.date,
      time: newInterview.time,
      platform: newInterview.platform,
      meetingLink: `https://${newInterview.platform.toLowerCase().replace(' ', '')}.com/sir-recruitment-${Math.floor(100 + Math.random() * 900)}`,
      panelists: newInterview.panelists.split(','),
      status: 'Scheduled',
      feedback: 'Pending Panel Conduct',
      candidateConfirmed: true,
      clientConfirmed: true,
      recordingLink: `https://${newInterview.platform.toLowerCase().replace(' ', '')}.com/rec-link`
    };
    addInterview(interviewObj);
    setModalOpen(false);
  };

  const handleSaveFeedback = (e) => {
    e.preventDefault();
    if (!feedbackModalOpen) return;

    const itemToUpdate = interviews.find(item => item.id === feedbackModalOpen.id);
    if (itemToUpdate) {
      updateInterview({
        ...itemToUpdate,
        status: resultStatus === 'Passed' ? 'Completed' : resultStatus,
        feedback: feedbackText
      });
    }

    setFeedbackModalOpen(null);
    setFeedbackText('');
  };

  const sendReminderNotification = (id) => {
    alert(`Automated WhatsApp & Email interview reminder dispatched to candidate and client panel for ${id}!`);
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
          <div>
            <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Panels & Video Scheduling</span>
            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Interview Management Center</h1>
            <p className="text-slate-600 dark:text-slate-400">Schedule Google Meet, Microsoft Teams & Zoom panel interviews with feedback collection.</p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Panel Interview</span>
          </button>
        </div>

        {/* Interview Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interviews.map((item) => (
            <div key={item.id} className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 hover:border-gold-500/50 transition shadow-sm">

              <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
                <div>
                  <span className="font-mono text-gold-600 dark:text-gold-400 font-bold text-xs">{item.id}</span>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">{item.candidateName}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold">{item.jobTitle} • <span className="text-amber-600 dark:text-gold-400">{item.clientCompany}</span></p>
                </div>
                <span className={`px-2.5 py-1 rounded font-bold text-[10px] border ${item.status === 'Completed' || item.status === 'Passed'
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30'
                    : item.status === 'Failed' || item.status === 'Rejected'
                      ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-500/30'
                      : 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-400 border-amber-300 dark:border-amber-500/30'
                  }`}>
                  {item.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-100 dark:bg-navy-950 rounded-xl space-y-0.5 border border-slate-200 dark:border-navy-800">
                  <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1"><Clock className="w-3 h-3 text-gold-600 dark:text-gold-500" /> Date & Time</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{item.date} @ {item.time}</p>
                </div>
                <div className="p-2.5 bg-slate-100 dark:bg-navy-950 rounded-xl space-y-0.5 border border-slate-200 dark:border-navy-800">
                  <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1"><Video className="w-3 h-3 text-gold-600 dark:text-gold-500" /> Platform</span>
                  <p className="font-extrabold text-slate-900 dark:text-white">{item.platform}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl space-y-1.5 text-[11px] border border-slate-200 dark:border-navy-800">
                <p><strong className="text-slate-700 dark:text-slate-300 font-bold">Panel Members:</strong> <span className="text-slate-900 dark:text-slate-200 font-semibold">{Array.isArray(item.panelists) ? item.panelists.join(', ') : item.panelists}</span></p>
                <p><strong className="text-slate-700 dark:text-slate-300 font-bold">Feedback Result:</strong> <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{item.feedback}</span></p>

                <div className="flex justify-between pt-1 text-[10px]">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Candidate Status: <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">✓ Confirmed</strong></span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Client Panel: <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">✓ Confirmed</strong></span>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={item.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-navy-950 hover:bg-gold-500 hover:text-navy-950 text-gold-400 font-bold rounded-xl transition flex items-center justify-center space-x-1.5 border border-navy-800"
                >
                  <Video className="w-4 h-4" />
                  <span>Launch {item.platform}</span>
                </a>

                <button
                  onClick={() => setFeedbackModalOpen(item)}
                  className="px-3 py-2 bg-navy-800 hover:bg-navy-700 text-white font-bold rounded-xl transition"
                >
                  Submit Feedback
                </button>

                <button
                  onClick={() => sendReminderNotification(item.id)}
                  className="p-2 bg-navy-800 hover:bg-gold-500 hover:text-navy-950 text-gold-400 rounded-xl transition cursor-pointer"
                  title="Send Reminder Notification"
                >
                  <Send className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeleteConfirmInterview(item)}
                  className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-xl transition cursor-pointer"
                  title={`Delete Interview with ${item.candidateName}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Schedule Interview Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-lg w-full p-6 shadow-luxury space-y-4">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Schedule Panel Video Interview</h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleCreateInterview} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Candidate Name</label>
                  <input required type="text" value={newInterview.candidateName} onChange={e => setNewInterview({ ...newInterview, candidateName: e.target.value })} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Position / Mandate</label>
                    <input required type="text" value={newInterview.jobTitle} onChange={e => setNewInterview({ ...newInterview, jobTitle: e.target.value })} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Client Company</label>
                    <input required type="text" value={newInterview.clientCompany} onChange={e => setNewInterview({ ...newInterview, clientCompany: e.target.value })} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Interview Platform</label>
                    <select value={newInterview.platform} onChange={e => setNewInterview({ ...newInterview, platform: e.target.value })} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500">
                      <option value="Microsoft Teams">Microsoft Teams</option>
                      <option value="Google Meet">Google Meet</option>
                      <option value="Zoom">Zoom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Date & Time</label>
                    <input required type="text" value={newInterview.date} onChange={e => setNewInterview({ ...newInterview, date: e.target.value })} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500" />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-gold-shimmer text-navy-950 font-extrabold rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer">
                  Generate Video Link & Dispatch Reminders
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {feedbackModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-md w-full p-6 shadow-luxury space-y-4">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Submit Interview Feedback & Result</h3>
                <button onClick={() => setFeedbackModalOpen(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSaveFeedback} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Interview Result Outcome</label>
                  <select value={resultStatus} onChange={e => setResultStatus(e.target.value)} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500">
                    <option value="Passed">Passed (Recommend Offer)</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Panel Conduct Notes & Score Summary</label>
                  <textarea
                    rows={4}
                    required
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-medium focus:outline-none focus:border-gold-500"
                    placeholder="Candidate demonstrated exceptional technical depth..."
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-gold-shimmer text-navy-950 font-extrabold rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer">
                  Save Feedback Result
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Delete Interview Confirmation Modal */}
        {deleteConfirmInterview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="glass-card bg-white dark:bg-navy-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-luxury space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  Delete Scheduled Interview?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Are you sure you want to delete the scheduled interview for <strong className="text-slate-900 dark:text-white">{deleteConfirmInterview.candidateName}</strong> with <strong className="text-slate-900 dark:text-white">{deleteConfirmInterview.clientCompany}</strong> (#{deleteConfirmInterview.id})?
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmInterview(null)}
                  disabled={isDeletingInterview}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setIsDeletingInterview(true);
                    try {
                      if (deleteInterview) await deleteInterview(deleteConfirmInterview.id);
                      setDeleteConfirmInterview(null);
                    } catch (e) {
                      alert('Failed to delete interview: ' + (e.message || 'Error'));
                    } finally {
                      setIsDeletingInterview(false);
                    }
                  }}
                  disabled={isDeletingInterview}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDeletingInterview ? 'Deleting...' : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Interview</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ScrollReveal>
  );
};
