import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  MessageSquare, Mail, Phone, Send, Clock, CheckCircle2, 
  FileText, Copy, Sparkles, Filter, ChevronRight, User 
} from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

export const CrmCandidateCommunication = () => {
  const { candidates = [] } = useCrm();

  const [selectedCandId, setSelectedCandId] = useState(candidates[0]?.id || 'REV-CAN-101');
  const [selectedChannel, setSelectedChannel] = useState('email'); // 'email' | 'whatsapp' | 'sms'
  const [selectedTemplate, setSelectedTemplate] = useState('interview-invite');
  const [customSubject, setCustomSubject] = useState('Interview Invitation: Senior Civil Project Manager - Revival International');
  const [customBody, setCustomBody] = useState('');
  const [notification, setNotification] = useState('');

  // Pre-configured Communication Templates
  const templates = [
    {
      id: 'interview-invite',
      title: '1. Interview Invitation',
      category: 'Interview',
      subject: 'Interview Invitation: {job_title} at {company}',
      body: `Dear {candidate_name},

We are pleased to inform you that following the review of your credentials for the position of {job_title} with {company}, our client has shortlisted your profile for a formal video interview.

Interview Details:
• Date: Thursday, 12th November 2026
• Time: 11:00 AM (GST / Dubai Time)
• Mode: Google Meet Video Conference
• Meeting Link: https://meet.google.com/sir-rec-talent

Please confirm your availability for this schedule by replying to this message.

Warm regards,
Recruitment Operations Team
The Revival International`
    },
    {
      id: 'shortlist-alert',
      title: '2. Shortlisting Notification',
      category: 'Screening',
      subject: 'Application Status Update: Shortlisted for {job_title}',
      body: `Dear {candidate_name},

Congratulations! Your profile has been reviewed and successfully shortlisted for the role of {job_title} at {company}.

Our senior headhunter will contact you within the next 24 hours to discuss salary packaging, relocation benefits, and schedule client technical rounds.

Best regards,
The Revival International`
    },
    {
      id: 'offer-dispatch',
      title: '3. Official Offer Letter Dispatch',
      category: 'Offer',
      subject: 'Official Offer of Employment: {job_title} - {company}',
      body: `Dear {candidate_name},

On behalf of {company}, The Revival International is thrilled to extend our formal employment offer for the position of {job_title}.

Key Offer Highlights:
• Base Salary & Allowances: As agreed in formal contract
• Location: Dubai, UAE / GCC
• Expected Joining Date: 1st December 2026

Please find the official employment contract attached. Kindly sign and return the countersigned copy within 4 business days.

Warm congratulations!
Recruitment Team`
    },
    {
      id: 'doc-request',
      title: '4. Document & Passport Request',
      category: 'Verification',
      subject: 'Urgent: Submission of Documents for {job_title} Processing',
      body: `Dear {candidate_name},

To proceed with your client credentialing and visa clearance, please upload high-resolution PDF copies of the following documents:
1. Passport bio-data pages (minimum 8 months validity)
2. Degree Certificate attested by Ministry of Foreign Affairs (MOFA)
3. Latest Experience Certificates and Salary Slips

Kindly upload these via your candidate portal or reply directly to this email.

Thank you,
The Revival International Compliance`
    },
    {
      id: 'rejection-notice',
      title: '5. Rejection & Talent Pool Notification',
      category: 'Status',
      subject: 'Application Update: {job_title}',
      body: `Dear {candidate_name},

Thank you for your interest in the {job_title} position with {company}. After careful consideration, the hiring team has decided to advance with other candidates whose experience more closely matches current project demands.

We have retained your CV in our executive talent database and will reach out promptly when matching international mandates open.

We wish you every success in your career endeavors.

Sincerely,
The Revival International Team`
    }
  ];

  // Communication History Log
  const [history, setHistory] = useState([
    {
      id: 'MSG-901',
      candidateName: 'Alexander Wright',
      channel: 'email',
      templateTitle: 'Interview Invitation',
      subject: 'Interview Invitation: Senior Civil Project Manager',
      timestamp: 'Today at 09:15 AM',
      status: 'Delivered & Opened',
      recipient: 'alexander.wright@gmail.com'
    },
    {
      id: 'MSG-902',
      candidateName: 'Alexander Wright',
      channel: 'whatsapp',
      templateTitle: 'Shortlisting Notification',
      subject: 'Quick Shortlist Confirmation Alert',
      timestamp: 'Yesterday at 04:30 PM',
      status: 'Delivered (Read Receipt ✓✓)',
      recipient: '+971 50 123 4567'
    },
    {
      id: 'MSG-903',
      candidateName: 'Dr. Priya Sharma',
      channel: 'email',
      templateTitle: 'Document & Passport Request',
      subject: 'SCFHS Medical Registration Clearance',
      timestamp: '2 days ago',
      status: 'Delivered',
      recipient: 'priya.sharma@aims.edu'
    }
  ]);

  const selectedCandidate = candidates.find(c => c.id === selectedCandId) || candidates[0] || {
    id: 'REV-CAN-101',
    name: 'Alexander Wright',
    email: 'alexander.wright@gmail.com',
    phone: '+971 50 123 4567',
    currentRole: 'Senior Civil Project Manager'
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Populate template when changed
  const handleSelectTemplate = (tmplId) => {
    setSelectedTemplate(tmplId);
    const tmpl = templates.find(t => t.id === tmplId);
    if (tmpl) {
      const renderedSubject = tmpl.subject
        .replace('{job_title}', selectedCandidate.currentRole || 'Senior Civil Project Manager')
        .replace('{company}', 'Al Habtoor Contracting LLC');

      const renderedBody = tmpl.body
        .replace(/{candidate_name}/g, selectedCandidate.name)
        .replace(/{job_title}/g, selectedCandidate.currentRole || 'Senior Civil Project Manager')
        .replace(/{company}/g, 'Al Habtoor Contracting LLC');

      setCustomSubject(renderedSubject);
      setCustomBody(renderedBody);
    }
  };

  // Initialize body on first load
  React.useEffect(() => {
    handleSelectTemplate('interview-invite');
  }, [selectedCandId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const newMsg = {
      id: `MSG-${Math.floor(100 + Math.random() * 900)}`,
      candidateName: selectedCandidate.name,
      channel: selectedChannel,
      templateTitle: templates.find(t => t.id === selectedTemplate)?.title || 'Custom Message',
      subject: customSubject,
      timestamp: 'Just now',
      status: 'Delivered ✓',
      recipient: selectedChannel === 'whatsapp' ? selectedCandidate.phone || '+971 50 123 4567' : selectedCandidate.email
    };

    setHistory(prev => [newMsg, ...prev]);
    showToast(`✓ ${selectedChannel.toUpperCase()} message sent successfully to ${selectedCandidate.name}!`);
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 rounded-3xl border border-gold-500/30 shadow-lg text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-500 text-navy-950 uppercase tracking-wider">
              Recruiter Feature #9
            </span>
            <span className="text-xs text-slate-400 font-mono">OUTREACH-DISPATCHER</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
            Candidate Communication
          </h1>
          <p className="text-slate-300 text-xs mt-1">
            Send email or message templates and maintain communication history.
          </p>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
            {notification}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT 7 COLS: DISPATCH COMPOSER & TEMPLATES */}
          <div className="lg:col-span-7 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-gold-500" />
                <span>Compose & Send Candidate Communication</span>
              </h3>

              {/* Channel Selector Pills */}
              <div className="flex gap-1 bg-slate-100 dark:bg-navy-950 p-1 rounded-xl">
                {[
                  { id: 'email', label: 'Email', icon: Mail },
                  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                  { id: 'sms', label: 'SMS', icon: Phone }
                ].map(ch => {
                  const ChIcon = ch.icon;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setSelectedChannel(ch.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                        selectedChannel === ch.id
                          ? 'bg-gold-500 text-navy-950 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <ChIcon className="w-3 h-3" />
                      <span>{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3">
              {/* Recipient candidate dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Recipient Candidate:
                </label>
                <select
                  value={selectedCandId}
                  onChange={e => setSelectedCandId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email || c.phone}) — {c.currentRole || 'Candidate'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template picker */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Select Communication Template:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {templates.map(tmpl => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tmpl.id)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        selectedTemplate === tmpl.id
                          ? 'bg-gold-500/15 border-gold-500 text-gold-700 dark:text-gold-400 font-extrabold'
                          : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 font-semibold hover:border-gold-500/40'
                      }`}
                    >
                      <p className="text-[11px] truncate">{tmpl.title}</p>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">{tmpl.category}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              {selectedChannel === 'email' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Email Subject Line:
                  </label>
                  <input
                    type="text"
                    required
                    value={customSubject}
                    onChange={e => setCustomSubject(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl font-bold text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
              )}

              {/* Message Body */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Message Body & Dynamic Merged Fields:
                </label>
                <textarea
                  rows={8}
                  required
                  value={customBody}
                  onChange={e => setCustomBody(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-2xl font-mono text-[11px] leading-relaxed focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  Target: {selectedChannel === 'whatsapp' ? selectedCandidate.phone || '+971 50 123 4567' : selectedCandidate.email}
                </span>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold rounded-2xl shadow-gold-glow transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send {selectedChannel.toUpperCase()} Now</span>
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT 5 COLS: AUDIT COMMUNICATION HISTORY */}
          <div className="lg:col-span-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>Outreach Communication History</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">{history.length} Messages Sent</span>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {history.map(item => (
                <div 
                  key={item.id}
                  className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-1.5 shadow-xs"
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {item.channel === 'email' ? <Mail className="w-3.5 h-3.5 text-blue-500" /> : <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />}
                      <span>{item.candidateName}</span>
                    </span>
                    <span className="text-slate-400 font-mono">{item.timestamp}</span>
                  </div>

                  <p className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] truncate">
                    {item.subject}
                  </p>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200/60 dark:border-navy-800/60">
                    <span className="truncate max-w-[160px]">{item.recipient}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </ScrollReveal>
  );
};

