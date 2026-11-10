import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  User,
  RefreshCw,
  Globe,
  GraduationCap,
  Sparkles,
  Check,
  Tag
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';

export const CrmHrOperationsDashboard = () => {
  const { currentEmployee, currentRole, user } = useCrm();

  // Active Tab: 'daily-queue' | 'tasks' | 'documents' | 'attendance'
  const [activeTab, setActiveTab] = useState('daily-queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [operationBranch, setOperationBranch] = useState('all'); // 'all' | 'intl-ops' | 'enq-ops'

  // Selected lead for call notes / follow-up modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [callNoteText, setCallNoteText] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [newStatus, setNewStatus] = useState('');

  // Loading & refresh states
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncNotice, setSyncNotice] = useState('');

  // Canonical employee identity for Balavarshini / HR Operations
  const activeEmployee = useMemo(() => {
    return {
      name: currentEmployee?.name || user?.name || 'Balavarshini S.',
      id: currentEmployee?.employeeId || currentEmployee?.id || user?.employeeId || user?.id || 'REV-EMP-006',
      teamMemberId: currentEmployee?.teamMemberId || user?.teamMemberId || 'INTL-HR-102',
      email: currentEmployee?.email || user?.email || 'balavarshini2223@gmail.com',
      workEmail: currentEmployee?.workEmail || user?.workEmail || 'balavarshini.s@revivalcrm.com',
      role: currentRole || 'HR Operations',
      department: currentEmployee?.department || user?.department || 'HR Operations',
      team: currentEmployee?.operationTeam || user?.operationTeam || 'International HR Operations, Enquiry HR Operations'
    };
  }, [currentEmployee, user, currentRole]);

  // Daily leads queue data (Live from SQLite Backend)
  const [dailyLeads, setDailyLeads] = useState([]);

  // Fetch enquiries assigned to active employee from backend
  const fetchAssignedLeads = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoadingLeads(true);

    try {
      const queryParams = new URLSearchParams({
        userRole: 'HR Operations',
        employeeName: activeEmployee.name,
        employeeId: activeEmployee.id,
        employeeEmail: activeEmployee.email,
        limit: '150'
      });

      if (operationBranch === 'intl-ops') {
        queryParams.set('operationTeam', 'International HR Operations');
      } else if (operationBranch === 'enq-ops') {
        queryParams.set('operationTeam', 'Enquiry HR Operations');
      }

      const res = await fetch(`/api/leads?${queryParams.toString()}`, {
        headers: {
          'x-user-role': 'HR Operations',
          'x-employee-name': activeEmployee.name,
          'x-employee-id': activeEmployee.id,
          'x-employee-email': activeEmployee.email,
          'x-operation-team': operationBranch === 'intl-ops' ? 'International HR Operations' : (operationBranch === 'enq-ops' ? 'Enquiry HR Operations' : 'all')
        }
      });

      const json = await res.json();
      const rawLeads = Array.isArray(json.data) ? json.data : (Array.isArray(json.leads) ? json.leads : []);

      if (rawLeads.length > 0) {
        const mapped = rawLeads.map(l => {
          let parsedNotes = [];
          if (l.internalNotes) {
            parsedNotes = l.internalNotes.split('\n').filter(Boolean).map(n => ({
              date: l.assignedAt ? new Date(l.assignedAt).toLocaleDateString() : 'Recent',
              by: l.assignedBy || 'HR Lead',
              text: n.replace(/^📌\s*/, '')
            }));
          } else if (l.assignmentNotes) {
            parsedNotes = [{
              date: l.assignedAt ? new Date(l.assignedAt).toLocaleDateString() : 'Recent',
              by: l.assignedBy || 'HR Lead',
              text: l.assignmentNotes
            }];
          }

          const isOverdue = l.priority === 'Urgent' && l.status === 'Assigned';
          const isIntl = ['intl-adm', 'intl-consult'].includes(l.serviceId) ||
            (l.referenceNumber && (l.referenceNumber.startsWith('REV-ADM') || l.referenceNumber.startsWith('REV-IC') || l.referenceNumber.startsWith('REV-INT')));

          return {
            id: l.id,
            referenceNumber: l.referenceNumber || `#${l.id}`,
            candidateName: l.name || 'Prospective Applicant',
            email: l.email || '—',
            phone: l.phone || '—',
            serviceId: l.serviceId || (isIntl ? 'intl-adm' : 'school-career'),
            serviceName: l.serviceTitle || (l.serviceId === 'intl-adm' ? 'International Admissions' : l.serviceId === 'intl-consult' ? 'International Consulting' : 'Revival Academic Consultation'),
            operationTeam: l.operationTeam || (isIntl ? 'International HR Operations' : 'Enquiry HR Operations'),
            status: l.status || 'Assigned',
            priority: l.priority || 'Normal',
            assignedTo: l.assignedEmployee || activeEmployee.name,
            assignedEmployeeId: l.assignedEmployeeId || activeEmployee.id,
            assignedDate: l.assignedAt || l.createdAt || new Date().toISOString(),
            lastContacted: l.lastContactedDate || (l.updatedAt ? new Date(l.updatedAt).toLocaleDateString() : 'Pending initial outreach'),
            followUpDue: l.nextActionDate || (l.priority === 'Urgent' ? 'Today, 2:00 PM (Urgent)' : 'Today, 5:00 PM'),
            isOverdue,
            isToday: true,
            assignmentNotes: l.assignmentNotes || (l.internalNotes ? l.internalNotes.split('\n')[0] : 'Follow up with candidate regarding enquiry details.'),
            notes: parsedNotes,
            documents: isIntl ? [
              { name: 'Passport Copy', status: 'Verified' },
              { name: 'Attested Degree / Transcripts', status: 'Pending Verification' },
              { name: 'Police Clearance Certificate', status: 'Pending' }
            ] : [
              { name: 'Enrollment Application Form', status: 'Verified' },
              { name: 'Student Academic Records', status: 'Pending' },
              { name: 'Parent Consultation Consent', status: 'Verified' }
            ]
          };
        });

        setDailyLeads(mapped);
      } else {
        setDailyLeads([]);
      }
    } catch (err) {
      console.warn('Failed to fetch assigned leads for HR Operations:', err);
    } finally {
      setLoadingLeads(false);
      setRefreshing(false);
    }
  }, [activeEmployee, operationBranch]);

  // Fetch leads on mount and when employee identity or branch filter changes
  useEffect(() => {
    fetchAssignedLeads();
  }, [fetchAssignedLeads]);

  // Daily operations tasks
  const [dailyTasks, setDailyTasks] = useState([
    { id: 1, title: 'Call assigned candidate leads for International Admissions', priority: 'High', due: '12:00 PM', done: false },
    { id: 2, title: 'Verify attested degree copies for UAE Golden Visa / Consulting portfolio', priority: 'High', due: '2:00 PM', done: false },
    { id: 3, title: 'Follow-up overdue enquiries and update CRM dossier status', priority: 'High', due: '3:30 PM', done: false },
    { id: 4, title: 'Dispatch daily status summary report to HR Lead Priya Sharma', priority: 'Medium', due: '5:00 PM', done: false },
    { id: 5, title: 'Send reminder WhatsApp messages for evening consultation cohorts', priority: 'Medium', due: '6:00 PM', done: false }
  ]);

  // Operations attendance log
  const attendanceRecord = {
    employeeName: activeEmployee.name,
    employeeId: activeEmployee.id,
    designation: 'Lead HR Operations Specialist',
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

  // Dynamically calculated KPIs based on assigned leads
  const freshLeadsCount = dailyLeads.filter(l => l.status === 'Fresh' || l.status === 'New').length;
  const assignedLeadsCount = dailyLeads.length;
  const pendingLeadsCount = dailyLeads.filter(l => l.status === 'Pending' || l.status === 'Assigned' || l.status === 'In Progress').length;
  const completedLeadsCount = dailyLeads.filter(l => l.status === 'Completed').length;
  const overdueFollowUpsCount = dailyLeads.filter(l => l.isOverdue).length;
  const todaysFollowUpsCount = dailyLeads.filter(l => l.isToday).length;
  const totalTasksCount = dailyTasks.length;
  const completedTasksCount = dailyTasks.filter(t => t.done).length;

  // Toggle task completion
  const handleToggleTask = (taskId) => {
    setDailyTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
  };

  // Submit Call Note / Follow-up Update and persist to backend
  const handleSaveLeadInteraction = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;

    const updatedStatus = newStatus || selectedLead.status;
    const noteText = callNoteText.trim();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Optimistic local update
    setDailyLeads(prev => prev.map(l => {
      if (l.id === selectedLead.id) {
        const updatedNotes = [...l.notes];
        if (noteText) {
          updatedNotes.unshift({
            date: 'Today, ' + nowStr,
            by: activeEmployee.name,
            text: noteText
          });
        }
        return {
          ...l,
          status: updatedStatus,
          followUpDue: nextFollowUpDate || l.followUpDue,
          isOverdue: false,
          notes: updatedNotes,
          lastContacted: 'Just now'
        };
      }
      return l;
    }));

    // 2. Persist to SQLite backend
    try {
      await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'HR Operations',
          'x-employee-name': activeEmployee.name,
          'x-employee-id': activeEmployee.id
        },
        body: JSON.stringify({
          status: updatedStatus,
          nextActionDate: nextFollowUpDate || undefined,
          internalNotes: noteText ? `[HR Ops Note by ${activeEmployee.name} at ${nowStr}]: ${noteText}` : undefined
        })
      });
      setSyncNotice(`✓ Updated candidate ${selectedLead.candidateName} (Status: ${updatedStatus}) saved to CRM!`);
      setTimeout(() => setSyncNotice(''), 5000);
    } catch (err) {
      console.error('Failed to persist lead status update:', err);
    }

    setSelectedLead(null);
    setCallNoteText('');
    setNextFollowUpDate('');
    setNewStatus('');
  };

  // Quick Mark Completed
  const handleMarkCompleted = async (lead) => {
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'HR Operations',
          'x-employee-name': activeEmployee.name
        },
        body: JSON.stringify({
          status: 'Completed',
          internalNotes: `[HR Ops Task Completed by ${activeEmployee.name} on ${new Date().toLocaleDateString()}]`
        })
      });
      setDailyLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'Completed', followUpDue: 'Completed', isOverdue: false } : l));
      setSyncNotice(`✓ Enquiry ${lead.referenceNumber} marked Completed.`);
      setTimeout(() => setSyncNotice(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Leads
  const filteredLeads = dailyLeads.filter(l => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      l.candidateName.toLowerCase().includes(q) ||
      (l.phone && l.phone.includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.referenceNumber && l.referenceNumber.toLowerCase().includes(q));

    const matchesService = serviceFilter === 'all' || l.serviceId === serviceFilter;
    const matchesStatus = statusFilter === 'all' || l.status.toLowerCase() === statusFilter.toLowerCase();
    
    let matchesBranch = true;
    if (operationBranch === 'intl-ops') {
      matchesBranch = ['intl-adm', 'intl-consult'].includes(l.serviceId) ||
        (l.referenceNumber && (l.referenceNumber.startsWith('REV-ADM') || l.referenceNumber.startsWith('REV-IC') || l.referenceNumber.startsWith('REV-INT')));
    } else if (operationBranch === 'enq-ops') {
      matchesBranch = ['school-career', 'career-guidance', 'school-academy', 'student-academy', 'college-adm'].includes(l.serviceId) ||
        (l.referenceNumber && (l.referenceNumber.startsWith('REV-CAR') || l.referenceNumber.startsWith('REV-ACA') || l.referenceNumber.startsWith('REV-COL') || l.referenceNumber.startsWith('REV-CADM')));
    }

    return matchesSearch && matchesService && matchesStatus && matchesBranch;
  });

  const intlCount = dailyLeads.filter(l => ['intl-adm', 'intl-consult'].includes(l.serviceId) || (l.referenceNumber && (l.referenceNumber.startsWith('REV-ADM') || l.referenceNumber.startsWith('REV-IC') || l.referenceNumber.startsWith('REV-INT')))).length;
  const enqCount = dailyLeads.filter(l => ['school-career', 'career-guidance', 'school-academy', 'student-academy', 'college-adm'].includes(l.serviceId) || (l.referenceNumber && (l.referenceNumber.startsWith('REV-CAR') || l.referenceNumber.startsWith('REV-ACA') || l.referenceNumber.startsWith('REV-COL') || l.referenceNumber.startsWith('REV-CADM')))).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              HR Operations Control Hub • Assigned Enquiries Queue
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight">
              Daily Operations & Enquiries Dashboard
            </h1>
            <p className="text-emerald-200/80 text-sm mt-1">
              Logged in as <span className="font-semibold text-white">{activeEmployee.name}</span> ({activeEmployee.id}) • Assigned Operational Work Queue
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchAssignedLeads(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
              title="Refresh assigned enquiries from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Refresh Queue'}</span>
            </button>

            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-right">
              <span className="text-emerald-300 block font-semibold">Today's Shift</span>
              <span className="font-bold text-sm text-white">09:00 AM – 06:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Confirmation Banner */}
      {syncNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{syncNotice}</span>
          <button onClick={() => setSyncNotice('')} className="text-emerald-600 hover:text-emerald-900 font-bold ml-2">✕</button>
        </div>
      )}

      {/* 7 KPI Counters */}
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

      {/* Operation Team Branch Filter Selector */}
      <div className="bg-white dark:bg-navy-900 p-3 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 px-2">Operation Team:</span>
        <button
          type="button"
          onClick={() => setOperationBranch('all')}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            operationBranch === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          All Assigned Enquiries ({dailyLeads.length})
        </button>

        <button
          type="button"
          onClick={() => setOperationBranch('intl-ops')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            operationBranch === 'intl-ops'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-blue-50 dark:bg-navy-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Branch A: International HR Operations</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">{intlCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setOperationBranch('enq-ops')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            operationBranch === 'enq-ops'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 dark:bg-navy-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Branch B: Enquiry HR Operations</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">{enqCount}</span>
        </button>
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
          Enquiry Calling Queue ({filteredLeads.length})
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
                placeholder="Search candidate, phone, email, ref #..."
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
                <option value="all">All Revival Services</option>
                <option value="intl-adm">International Admissions</option>
                <option value="intl-consult">International Consulting</option>
                <option value="school-career">School Student Career Guidance</option>
                <option value="school-academy">Academy for School Students</option>
                <option value="college-adm">College Admission Assistance</option>
                <option value="exec-seminars-lang">Executive Seminars & Language Hub</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Fresh">Fresh</option>
              </select>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm overflow-hidden">
            {loadingLeads ? (
              <div className="p-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-500">Loading your assigned enquiries from CRM...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
                      <th className="py-3 px-4">Candidate & Reference</th>
                      <th className="py-3 px-4">Enquiry Service & Team</th>
                      <th className="py-3 px-4">Priority & Assigned</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">HR Lead Instructions</th>
                      <th className="py-3 px-4 text-right">Quick Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400 space-y-2">
                          <AlertCircle className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                          <div className="font-bold text-sm text-slate-700 dark:text-slate-300">
                            No assigned enquiries found matching the criteria.
                          </div>
                          <p className="text-xs text-slate-500 max-w-md mx-auto">
                            When the HR Lead or Super Admin assigns enquiries to you, they will appear in this work queue with pointed instructions and due dates.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50/70 dark:hover:bg-navy-800/50 transition">
                          {/* Candidate & Reference */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {lead.candidateName}
                              {lead.isOverdue && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                                  Overdue
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[10px] text-gold-600 dark:text-gold-400 font-semibold mt-0.5">
                              {lead.referenceNumber}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              {lead.phone && <span>{lead.phone}</span>}
                              {lead.phone && lead.email && <span>•</span>}
                              {lead.email && <span className="truncate max-w-[150px]">{lead.email}</span>}
                            </div>
                          </td>

                          {/* Enquiry Service & Operation Team */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-medium w-fit">
                                {lead.serviceName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {lead.operationTeam || 'Operations Queue'}
                              </span>
                            </div>
                          </td>

                          {/* Priority & Assigned Date */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                                  lead.priority === 'Urgent'
                                    ? 'bg-rose-500 text-white'
                                    : lead.priority === 'High'
                                    ? 'bg-amber-500 text-navy-950 font-bold'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                }`}
                              >
                                {lead.priority || 'Normal'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-1">
                              Assigned: {lead.assignedDate ? new Date(lead.assignedDate).toLocaleDateString() : 'Recent'}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                lead.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-300'
                                  : lead.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300'
                                  : lead.status === 'In Progress'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-300'
                              }`}
                            >
                              {lead.status}
                            </span>
                          </td>

                          {/* HR Lead Instructions */}
                          <td className="py-3 px-4 max-w-xs">
                            <div className="p-2 rounded-lg bg-amber-50/80 dark:bg-navy-950/80 border border-amber-200/80 dark:border-navy-700 text-[11px] text-slate-700 dark:text-slate-300 leading-tight">
                              <span className="font-bold text-amber-700 dark:text-gold-400">📌 Instruction: </span>
                              <span>{lead.assignmentNotes || (lead.notes && lead.notes[0]?.text) || 'Follow up with candidate regarding enquiry.'}</span>
                            </div>
                          </td>

                          {/* Quick Operations */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Call Trigger */}
                              {lead.phone && (
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition"
                                  title="Call Candidate"
                                >
                                  <PhoneCall className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* WhatsApp / Message Trigger */}
                              {lead.phone && (
                                <a
                                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition"
                                  title="WhatsApp Candidate"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* Email Trigger */}
                              {lead.email && (
                                <a
                                  href={`mailto:${lead.email}`}
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                                  title="Email Candidate"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* Update Follow-up Modal Trigger */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setNewStatus(lead.status);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition cursor-pointer text-[11px]"
                              >
                                Log Call / Status
                              </button>

                              {/* Quick Complete */}
                              {lead.status !== 'Completed' && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkCompleted(lead)}
                                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] transition cursor-pointer"
                                  title="Mark as completed"
                                >
                                  Done
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGNED DAILY TASKS */}
      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-700 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Daily Operational Tasks</h2>
              <p className="text-xs text-slate-500">Assigned by HR Lead Priya Sharma • Daily task checklists and completion tracking</p>
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
            {dailyLeads.slice(0, 9).map((lead) => (
              <div key={lead.id} className="p-4 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50/50 dark:bg-navy-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">{lead.candidateName}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold truncate max-w-[120px]">
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
                <p className="text-xs text-slate-500">{selectedLead.serviceName} • Ref: {selectedLead.referenceNumber}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
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
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
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
                  placeholder="e.g. Tomorrow, 11:00 AM or 12 Nov 2026"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Call Notes / Interaction Summary
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Summarize candidate discussion, required documents, or next steps..."
                  value={callNoteText}
                  onChange={(e) => setCallNoteText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
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
