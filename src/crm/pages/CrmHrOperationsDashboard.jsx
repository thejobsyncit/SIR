import React, { useState } from 'react';
import {
  PhoneCall,
  Mail,
  MessageSquare,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Briefcase,
  Upload,
  CheckSquare,
  Square,
  PhoneForwarded,
  ShieldAlert,
  User
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import CrmHrTaskAssignment from '../components/CrmHrTaskAssignment';

export const CrmHrOperationsDashboard = ({ initialSection }) => {
  const { currentEmployee, currentRole } = useCrm();

  // Active Tab
  const [activeTab, setActiveTab] = useState(() => initialSection === 'tasks' ? 'tasks' : 'daily-queue');

  useEffect(() => {
    if (initialSection) {
      setActiveTab(initialSection === 'hr-tasks' ? 'tasks' : initialSection);
    }
  }, [initialSection]); // 'daily-queue' | 'enquiries' | 'documents' | 'tasks' | 'attendance'
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected lead for call notes / follow-up modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [callNoteText, setCallNoteText] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [newStatus, setNewStatus] = useState('');

  // Daily leads queue data
  const [dailyLeads, setDailyLeads] = useState([
    {
      id: 'OP-L101',
      candidateName: 'Zubair Al Mansoor',
      email: 'zubair.m@gmail.com',
      phone: '+971 50 876 5432',
      serviceId: 'intl-consult',
      serviceName: 'International Consulting',
      status: 'Assigned',
      assignedTo: 'Balavarshini S. (HR Operations)',
      lastContacted: '2 hours ago',
      followUpDue: 'Today, 4:30 PM',
      isOverdue: false,
      isToday: true,
      notes: [
        { date: '04 Nov 2026', by: 'Fatima', text: 'Candidate showed interest in Dubai Golden Visa consultation. Needs document checklist.' }
      ],
      documents: [
        { name: 'Passport Copy', status: 'Verified' },
        { name: 'Attested Degree Certificate', status: 'Pending' },
        { name: 'Police Clearance Certificate', status: 'Missing' }
      ]
    },
    {
      id: 'OP-L102',
      candidateName: 'Pooja Ramakrishnan',
      email: 'pooja.ram@yahoo.com',
      phone: '+91 98401 23456',
      serviceId: 'college-adm',
      serviceName: 'College Admission Assistance',
      status: 'Pending',
      assignedTo: 'Balavarshini S. (HR Operations)',
      lastContacted: 'Yesterday',
      followUpDue: 'Yesterday (Overdue)',
      isOverdue: true,
      isToday: false,
      notes: [
        { date: '03 Nov 2026', by: 'Fatima', text: 'Shortlisted Canadian universities for Fall 2027. Awaiting IELTS score card.' }
      ],
      documents: [
        { name: 'Passport Copy', status: 'Verified' },
        { name: 'Transcripts & Marks Card', status: 'Verified' },
        { name: 'IELTS / TOEFL Score', status: 'Pending' }
      ]
    },
    {
      id: 'OP-L103',
      candidateName: 'Karthik Subburaj',
      email: 'karthik.s@gmail.com',
      phone: '+91 97890 87654',
      serviceId: 'intl-adm',
      serviceName: 'International Admissions',
      status: 'Assigned',
      assignedTo: 'Balavarshini S. (HR Operations)',
      lastContacted: 'Today, 11:15 AM',
      followUpDue: 'Today, 5:30 PM',
      isOverdue: false,
      isToday: true,
      notes: [
        { date: '05 Nov 2026', by: 'Fatima', text: 'Discussed German public university intake. Scheduled follow-up call with parents.' }
      ],
      documents: [
        { name: 'Passport Copy', status: 'Verified' },
        { name: 'Bachelors Degree', status: 'Verified' },
        { name: 'Motivation Letter', status: 'Pending' }
      ]
    },
    {
      id: 'OP-L104',
      candidateName: 'Naveen Vignesh',
      email: 'naveen.v@outlook.com',
      phone: '+971 55 345 6789',
      serviceId: 'school-career',
      serviceName: 'School Student Career Guidance',
      status: 'Fresh',
      assignedTo: 'Balavarshini S. (HR Operations)',
      lastContacted: 'Never',
      followUpDue: 'Today, 3:00 PM',
      isOverdue: false,
      isToday: true,
      notes: [],
      documents: [
        { name: 'Aptitude Test Assessment Form', status: 'Pending' }
      ]
    },
    {
      id: 'OP-L105',
      candidateName: 'Deepa Narayanan',
      email: 'deepa.n@gmail.com',
      phone: '+91 94441 22334',
      serviceId: 'school-academy',
      serviceName: 'Academy for School Students',
      status: 'Completed',
      assignedTo: 'Balavarshini S. (HR Operations)',
      lastContacted: '03 Nov 2026',
      followUpDue: 'Completed',
      isOverdue: false,
      isToday: false,
      notes: [
        { date: '03 Nov 2026', by: 'Fatima', text: 'Enrollment confirmed for STEM Olympiad Batch. Payment receipt issued.' }
      ],
      documents: [
        { name: 'Enrollment Form', status: 'Verified' },
        { name: 'Payment Receipt', status: 'Verified' }
      ]
    },
    {
      id: 'OP-L106',
      candidateName: 'Ahmed Tariq',
      email: 'ahmed.t@gmail.com',
      phone: '+971 52 112 2334',
      serviceId: 'exec-seminars-lang',
      serviceName: 'Executive Seminars & Language Hub',
      status: 'Assigned',
      assignedTo: 'Balavarshini S. (HR Operations)',
      lastContacted: '2 days ago',
      followUpDue: '04 Nov 2026 (Overdue)',
      isOverdue: true,
      isToday: false,
      notes: [
        { date: '02 Nov 2026', by: 'Fatima', text: 'Corporate client enquiry for Business Arabic executive batch for 5 executives.' }
      ],
      documents: [
        { name: 'Trade License Copy', status: 'Verified' },
        { name: 'Executive Nomination List', status: 'Pending' }
      ]
    }
  ]);

  // Daily operations tasks
  const [dailyTasks, setDailyTasks] = useState([
    { id: 1, title: 'Call 4 fresh candidate leads for International Admissions', priority: 'High', due: '12:00 PM', done: true },
    { id: 2, title: 'Verify attested degree copies for UAE Golden Visa client (Zubair)', priority: 'High', due: '2:00 PM', done: true },
    { id: 3, title: 'Follow-up overdue enquiry with Pooja Ramakrishnan (Canada admissions)', priority: 'High', due: '3:30 PM', done: false },
    { id: 4, title: 'Dispatch weekly status summary report to HR Lead (Sarah)', priority: 'Medium', due: '5:00 PM', done: false },
    { id: 5, title: 'Send reminder WhatsApp messages for evening IELTS counseling cohort', priority: 'Medium', due: '6:00 PM', done: false },
    { id: 6, title: 'Upload MOHRE contract copies to document repository', priority: 'Low', due: '6:30 PM', done: false }
  ]);

  // Operations attendance log
  const attendanceRecord = {
    employeeName: currentEmployee?.name || 'Balavarshini S.',
    employeeId: currentEmployee?.employeeId || 'EMP-7014',
    designation: 'HR Operations Specialist',
    checkInTime: '08:52 AM',
    expectedCheckIn: '09:00 AM',
    status: 'Present (On Time)',
    workingHoursToday: '6h 18m',
    monthlyAttendanceRate: '98.4%',
    presentDays: 22,
    lateDays: 1,
    leavesTaken: 0,
    leaveBalance: 14
  };

  // KPIs
  const freshLeadsCount = dailyLeads.filter(l => l.status === 'Fresh').length;
  const assignedLeadsCount = dailyLeads.length;
  const pendingLeadsCount = dailyLeads.filter(l => l.status === 'Pending' || l.status === 'Assigned').length;
  const completedLeadsCount = dailyLeads.filter(l => l.status === 'Completed').length;
  const overdueFollowUpsCount = dailyLeads.filter(l => l.isOverdue).length;
  const todaysFollowUpsCount = dailyLeads.filter(l => l.isToday).length;
  const totalTasksCount = dailyTasks.length;
  const completedTasksCount = dailyTasks.filter(t => t.done).length;

  // Toggle task completion
  const handleToggleTask = (taskId) => {
    setDailyTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
  };

  // Submit Call Note / Follow-up Update
  const handleSaveLeadInteraction = (e) => {
    e.preventDefault();
    if (!selectedLead) return;

    setDailyLeads(prev => prev.map(l => {
      if (l.id === selectedLead.id) {
        const updatedNotes = [...l.notes];
        if (callNoteText.trim()) {
          updatedNotes.unshift({
            date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            by: currentEmployee?.name || 'HR Operations',
            text: callNoteText.trim()
          });
        }
        return {
          ...l,
          status: newStatus || l.status,
          followUpDue: nextFollowUpDate || l.followUpDue,
          isOverdue: false,
          notes: updatedNotes,
          lastContacted: 'Just now'
        };
      }
      return l;
    }));

    setSelectedLead(null);
    setCallNoteText('');
    setNextFollowUpDate('');
    setNewStatus('');
  };

  // Filtered Leads
  const filteredLeads = dailyLeads.filter(l => {
    const matchesSearch =
      l.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService = serviceFilter === 'all' || l.serviceId === serviceFilter;
    const matchesStatus = statusFilter === 'all' || l.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesService && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              HR Operations Control Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight">
              Daily Operations & Enquiries Dashboard
            </h1>
            <p className="text-emerald-200/80 text-sm mt-1">
              Logged in as <span className="font-semibold text-white">{currentEmployee?.name || 'HR Operations Specialist'}</span> • Revival International Corporate Operations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-right">
              <span className="text-emerald-300 block font-semibold">Today's Shift</span>
              <span className="font-bold text-sm text-white">09:00 AM – 06:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7 KPI Counters Required by Master Prompt */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. Today's Fresh Leads */}
        <div className="bg-white dark:bg-navy-900 p-4 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Fresh Leads</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{freshLeadsCount}</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">New intake today</div>
        </div>

        {/* 2. Assigned Leads */}
        <div className="bg-white dark:bg-navy-900 p-4 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Assigned Leads</span>
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{assignedLeadsCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">In your active queue</div>
        </div>

        {/* 3. Pending Leads */}
        <div className="bg-white dark:bg-navy-900 p-4 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Pending Leads</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingLeadsCount}</div>
          <div className="text-[11px] text-amber-600/80 mt-1 font-medium">Awaiting response</div>
        </div>

        {/* 4. Completed Leads */}
        <div className="bg-white dark:bg-navy-900 p-4 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Completed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedLeadsCount}</div>
          <div className="text-[11px] text-emerald-600/80 mt-1 font-medium">Successfully processed</div>
        </div>

        {/* 5. Overdue Follow-ups */}
        <div className="bg-white dark:bg-navy-900 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/20 shadow-sm">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs mb-1">
            <span className="font-semibold">Overdue</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{overdueFollowUpsCount}</div>
          <div className="text-[11px] text-rose-500 mt-1 font-semibold">Immediate action needed</div>
        </div>

        {/* 6. Today's Follow-ups */}
        <div className="bg-white dark:bg-navy-900 p-4 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Today's Calls</span>
            <Calendar className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{todaysFollowUpsCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Scheduled for today</div>
        </div>

        {/* 7. Tasks Assigned */}
        <div className="bg-white dark:bg-navy-900 p-4 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Daily Tasks</span>
            <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {completedTasksCount}/{totalTasksCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Tasks completed</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-navy-700 space-x-2">
        <button
          onClick={() => setActiveTab('daily-queue')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-lg transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'daily-queue'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <PhoneForwarded className="w-4 h-4" />
          Enquiry Calling Queue ({dailyLeads.length})
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-lg transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'tasks'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Assigned Tasks ({dailyTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-lg transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          Document Completion Tracking
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`py-2.5 px-4 text-xs font-semibold rounded-t-lg transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          My Attendance & Shift
        </button>
      </div>

      {/* TAB 1: DAILY ENQUIRIES CALLING QUEUE */}
      {activeTab === 'daily-queue' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-navy-900 p-4 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidate name, phone or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="all">All 6 Revival Services</option>
                <option value="intl-consult">International Consulting</option>
                <option value="college-adm">College Admission Assistance</option>
                <option value="school-career">School Student Career Guidance</option>
                <option value="intl-adm">International Admissions</option>
                <option value="school-academy">Academy for School Students</option>
                <option value="exec-seminars-lang">Executive Seminars & Language Hub</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="fresh">Fresh</option>
                <option value="assigned">Assigned</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
                    <th className="py-3 px-4">Candidate & Contact</th>
                    <th className="py-3 px-4">Revival Service</th>
                    <th className="py-3 px-4">Follow-up Due</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Interaction Note</th>
                    <th className="py-3 px-4 text-right">Quick Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        No assigned enquiries found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/70 dark:hover:bg-navy-800/50 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {lead.candidateName}
                            {lead.isOverdue && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                                Overdue
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{lead.phone}</span>
                            <span>•</span>
                            <span>{lead.email}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-medium">
                            {lead.serviceName}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className={`font-semibold ${lead.isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {lead.followUpDue}
                          </div>
                          <div className="text-[10px] text-slate-400">Last: {lead.lastContacted}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                              lead.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                                : lead.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                                : lead.status === 'Fresh'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-navy-700 dark:text-slate-300'
                            }`}
                          >
                            {lead.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-400">
                          {lead.notes && lead.notes.length > 0 ? (
                            <span>{lead.notes[0].text}</span>
                          ) : (
                            <span className="text-slate-400 italic">No notes recorded yet</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Call Trigger */}
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition"
                              title="Call Candidate"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                            </a>

                            {/* WhatsApp / Message Trigger */}
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition"
                              title="WhatsApp Candidate"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>

                            {/* Email Trigger */}
                            <a
                              href={`mailto:${lead.email}`}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                              title="Email Candidate"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>

                            {/* Update Follow-up Modal Trigger */}
                            <button
                              onClick={() => {
                                setSelectedLead(lead);
                                setNewStatus(lead.status);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition cursor-pointer text-[11px]"
                            >
                              Log Call / Status
                            </button>
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
      )}

      {/* TAB 2: ASSIGNED DAILY TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <CrmHrTaskAssignment />
        </div>
      )}
      {false && activeTab === 'tasks' && (
        <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-700 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Daily Operational Tasks</h2>
              <p className="text-xs text-slate-500">Assigned by HR Lead Sarah • Daily task checklists and completion tracking</p>
            </div>
            <div className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              {completedTasksCount} of {totalTasksCount} Completed ({Math.round((completedTasksCount / totalTasksCount) * 100)}%)
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-navy-800">
            {dailyTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`py-3 flex items-center justify-between cursor-pointer rounded-lg px-2 transition ${
                  task.done ? 'bg-slate-50/50 dark:bg-navy-800/20 text-slate-400' : 'hover:bg-slate-50 dark:hover:bg-navy-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {task.done ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 dark:text-navy-600 shrink-0" />
                  )}
                  <div>
                    <p className={`text-xs font-semibold ${task.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                      {task.title}
                    </p>
                    <p className="text-[11px] text-slate-400">Due: {task.due}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.priority === 'High'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                        : task.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-navy-700 dark:text-slate-400'
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENT COMPLETION TRACKING */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-700 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Required Document Compliance & Attestations</h2>
              <p className="text-xs text-slate-500">Service-wise document checklists: UAE Golden Visa, Student Admissions & MOHRE contracts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dailyLeads.map((lead) => (
              <div key={lead.id} className="p-4 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">{lead.candidateName}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                    {lead.serviceName}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {lead.documents && lead.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-navy-900 border border-slate-200/70 dark:border-navy-700">
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[180px]">{doc.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          doc.status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                            : doc.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>

                <button className="w-full py-1.5 rounded-lg border border-dashed border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-xs font-semibold transition flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Attested Document
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PERMITTED ATTENDANCE INFO */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-700 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">My Attendance & Duty Records</h2>
            <p className="text-xs text-slate-500">HR Operations self-service attendance, biometric shift logs and leave balances</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
              <span className="text-xs text-slate-500 block">Check-in Today</span>
              <span className="text-lg font-bold text-emerald-600">{attendanceRecord.checkInTime}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">{attendanceRecord.status}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
              <span className="text-xs text-slate-500 block">Hours Logged Today</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{attendanceRecord.workingHoursToday}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Shift Target: 8h 00m</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
              <span className="text-xs text-slate-500 block">Monthly Attendance Rate</span>
              <span className="text-lg font-bold text-blue-600">{attendanceRecord.monthlyAttendanceRate}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">{attendanceRecord.presentDays} days present this month</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
              <span className="text-xs text-slate-500 block">Paid Leave Balance</span>
              <span className="text-lg font-bold text-emerald-600">{attendanceRecord.leaveBalance} Days</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">0 leaves taken this cycle</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Log Call & Follow-up Details */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-navy-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-700">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Log Interaction: {selectedLead.candidateName}
                </h3>
                <p className="text-xs text-slate-500">{selectedLead.serviceName} • {selectedLead.phone}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLeadInteraction} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Update Lead Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-900 dark:text-white"
                >
                  <option value="Fresh">Fresh</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Next Follow-up Date & Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tomorrow, 11:00 AM or 07 Nov 2026"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Call Notes / Candidate Interaction Summary
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Summarize the discussion, required documents, or next steps..."
                  value={callNoteText}
                  onChange={(e) => setCallNoteText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Call Record & Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

