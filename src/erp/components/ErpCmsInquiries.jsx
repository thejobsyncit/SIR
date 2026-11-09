import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, ExternalLink, Reply, RefreshCw, GraduationCap, CheckCircle2, User, Clock, Phone } from 'lucide-react';
import { getLocalFallbackLeads } from '../../services/leadSubmissionService';

export const ErpCmsInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'student-academy' | 'consulting'

  const loadInquiries = async () => {
    setLoading(true);
    let allInquiries = [];

    // 1. Fetch from leads API
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.data)) {
          allInquiries.push(...data.data.map(item => ({
            id: item.id,
            referenceNumber: item.referenceNumber,
            name: item.name || 'Anonymous',
            email: item.email || 'N/A',
            phone: item.phone || '',
            subject: item.serviceTitle || item.assistanceType || item.serviceId || 'General Inquiry',
            serviceId: item.serviceId,
            category: item.serviceId?.includes('academy') || item.company === 'Student Academy' ? 'Student Academy' : 'Consulting',
            date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent',
            status: item.status || 'New',
            message: item.message || ''
          })));
        }
      }
    } catch (_) {}

    // 2. Fetch from student-academy/enquiries API
    try {
      const res = await fetch('/api/student-academy/enquiries');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.data)) {
          const existingIds = new Set(allInquiries.map(i => i.id));
          const existingRefs = new Set(allInquiries.map(i => i.referenceNumber).filter(Boolean));
          data.data.forEach(item => {
            if (!existingIds.has(item.id) && (!item.referenceNumber || !existingRefs.has(item.referenceNumber))) {
              allInquiries.unshift({
                id: item.id,
                referenceNumber: item.referenceNumber,
                name: item.studentName || item.name || 'Student Applicant',
                email: item.email || item.studentEmail || 'N/A',
                phone: item.phone || item.studentPhone || '',
                subject: `Student Academy: ${item.examName || item.courseName || 'Exam Coaching'}`,
                serviceId: 'school-academy',
                category: 'Student Academy',
                date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent',
                status: item.status || 'New',
                message: item.questions || item.message || ''
              });
            }
          });
        }
      }
    } catch (_) {}

    // 3. Check localStorage for local student academy enquiries
    try {
      const localSa = JSON.parse(localStorage.getItem('revival_academy_enquiries') || '[]');
      const existingRefs = new Set(allInquiries.map(i => i.referenceNumber).filter(Boolean));
      localSa.forEach(item => {
        if (!item.referenceNumber || !existingRefs.has(item.referenceNumber)) {
          allInquiries.unshift({
            id: item.id || `LOCAL-SA-${Date.now()}`,
            referenceNumber: item.referenceNumber,
            name: item.studentName || 'Student Applicant',
            email: item.email || 'N/A',
            phone: item.phone || '',
            subject: `Student Academy: ${item.examName || item.courseName || 'Exam Coaching'}`,
            serviceId: 'school-academy',
            category: 'Student Academy',
            date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Just now',
            status: item.status || 'New',
            message: item.questions || item.message || ''
          });
        }
      });
    } catch (_) {}

    // 4. Check fallback leads storage
    try {
      const fallback = getLocalFallbackLeads();
      const existingRefs = new Set(allInquiries.map(i => i.referenceNumber).filter(Boolean));
      fallback.forEach(item => {
        if (!item.referenceNumber || !existingRefs.has(item.referenceNumber)) {
          allInquiries.unshift({
            id: item.id,
            referenceNumber: item.referenceNumber,
            name: item.name || 'Applicant',
            email: item.email || 'N/A',
            phone: item.phone || '',
            subject: item.serviceTitle || 'Service Consultation',
            serviceId: item.serviceId,
            category: item.serviceId?.includes('academy') || item.company === 'Student Academy' ? 'Student Academy' : 'Consulting',
            date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent',
            status: item.status || 'New',
            message: item.message || ''
          });
        }
      });
    } catch (_) {}

    setInquiries(allInquiries);
    setLoading(false);
  };

  useEffect(() => {
    loadInquiries();
    const handleSub = () => loadInquiries();
    window.addEventListener('lead-submitted', handleSub);
    return () => window.removeEventListener('lead-submitted', handleSub);
  }, []);

  const filtered = inquiries.filter(inq => {
    if (filter === 'student-academy') return inq.category === 'Student Academy' || inq.serviceId?.includes('academy');
    if (filter === 'consulting') return inq.category !== 'Student Academy' && !inq.serviceId?.includes('academy');
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            ERP Contact & Enquiries Inbox
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time synchronization across Student Academy, International Consulting, and website admissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter Pills */}
          <div className="bg-slate-100 dark:bg-navy-950 p-1 rounded-xl flex gap-1 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({inquiries.length})
            </button>
            <button
              onClick={() => setFilter('student-academy')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                filter === 'student-academy'
                  ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Academy ({inquiries.filter(i => i.category === 'Student Academy' || i.serviceId?.includes('academy')).length})</span>
            </button>
            <button
              onClick={() => setFilter('consulting')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filter === 'consulting'
                  ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Consulting
            </button>
          </div>

          <button
            onClick={loadInquiries}
            disabled={loading}
            className="p-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-navy-800 transition cursor-pointer"
            title="Refresh enquiries"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-gold-500' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-navy-950/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-200 dark:border-navy-800">
                <th className="p-4 font-bold">Applicant / Sender</th>
                <th className="p-4 font-bold">Program / Service Track</th>
                <th className="p-4 font-bold">Reference #</th>
                <th className="p-4 font-bold">Date Received</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 dark:text-slate-500 font-medium">
                    {loading ? 'Loading enquiries from database...' : 'No enquiries found for the selected category.'}
                  </td>
                </tr>
              ) : (
                filtered.map(inq => (
                  <tr key={inq.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {inq.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{inq.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                            <Mail className="w-3 h-3" /> {inq.email}
                          </p>
                          {inq.phone && (
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                              <Phone className="w-2.5 h-2.5" /> {inq.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {inq.category === 'Student Academy' ? (
                          <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-extrabold px-2 py-0.5 rounded text-[10px] border border-amber-300 dark:border-amber-700/40 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            <span>Student Academy</span>
                          </span>
                        ) : null}
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {inq.subject}
                        </span>
                      </div>
                      {inq.message && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs mt-1">
                          {inq.message}
                        </p>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold text-gold-600 dark:text-gold-400 text-[11px]">
                      {inq.referenceNumber || inq.id}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">{inq.date}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {inq.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`mailto:${inq.email}?subject=Regarding Your Enquiry: ${encodeURIComponent(inq.subject)}&body=Dear ${encodeURIComponent(inq.name)},%0D%0A%0D%0A`}
                          className="p-1.5 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:text-gold-500 rounded-lg transition-colors cursor-pointer"
                          title="Reply via Email"
                        >
                          <Reply className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
