import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Building2, Users, CheckCircle2, Clock, Calendar, DollarSign, 
  Send, Phone, MessageSquare, AlertCircle, FileText, ChevronRight, 
  Award, Briefcase, Plus, Filter, Search, ArrowRight, UserCheck, 
  GraduationCap, Bell, BarChart3, ShieldCheck, Download, Edit3, Trash2, CheckSquare, Sparkles,
  LayoutDashboard, GitMerge
} from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

export const CrmPlacementCoordinatorDashboard = ({ initialSection }) => {
  const { candidates = [], clients = [], updateCandidateStage, activeModule, setActiveModule } = useCrm();

  const getTabFromModule = (mod) => {
    switch (mod) {
      case 'plc-students': return 'students';
      case 'plc-eligibility': return 'overview';
      case 'plc-companies': return 'companies';
      case 'plc-drives': return 'drives';
      case 'plc-registration': return 'registration';
      case 'plc-applications': return 'applications';
      case 'plc-events': return 'events';
      case 'plc-offers': return 'offers';
      case 'plc-announcements': return 'announcements';
      case 'plc-reports': return 'reports';
      case 'plc-approvals': return 'approvals';
      case 'plc-overview':
      case 'dashboard':
      default:
        return 'overview';
    }
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromModule(initialSection || activeModule));
  const [statusMsg, setStatusMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialSection) {
      setActiveTab(getTabFromModule(initialSection));
    } else if (activeModule && activeModule.startsWith('plc-')) {
      setActiveTab(getTabFromModule(activeModule));
    }
  }, [initialSection, activeModule]);

  const showNotification = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  // 1. Registered Students State (Feature 2)
  const [students, setStudents] = useState([
    {
      id: 'STU-2026-01',
      name: 'Rohan Deshmukh',
      rollNo: '22CS104',
      department: 'Computer Science & Engineering',
      course: 'B.Tech CSE',
      batch: '2022 - 2026',
      cgpa: 9.15,
      backlogs: 0,
      skills: ['React', 'Node.js', 'Python', 'AWS', 'DSA'],
      resumeVerified: true,
      email: 'rohan.deshmukh@velsuniv.ac.in',
      phone: '+91 98401 22334',
      driveRegistrations: 3,
      offersCount: 1,
      placementStatus: 'Offered (TechVision)'
    },
    {
      id: 'STU-2026-02',
      name: 'Ananya Sundaram',
      rollNo: '22CV045',
      department: 'Civil Engineering',
      course: 'B.E Civil',
      batch: '2022 - 2026',
      cgpa: 8.80,
      backlogs: 0,
      skills: ['AutoCAD', 'Primavera P6', 'Revit', 'Structural Analysis'],
      resumeVerified: true,
      email: 'ananya.sundaram@velsuniv.ac.in',
      phone: '+91 97890 44556',
      driveRegistrations: 2,
      offersCount: 1,
      placementStatus: 'Placed (Al Habtoor)'
    },
    {
      id: 'STU-2026-03',
      name: 'Mohammed Tariq',
      rollNo: '22ME089',
      department: 'Mechanical Engineering',
      course: 'B.E Mechanical',
      batch: '2022 - 2026',
      cgpa: 8.45,
      backlogs: 0,
      skills: ['SolidWorks', 'HVAC Design', 'Ansys', 'Thermodynamics'],
      resumeVerified: true,
      email: 'mohammed.tariq@velsuniv.ac.in',
      phone: '+91 94440 66778',
      driveRegistrations: 4,
      offersCount: 1,
      placementStatus: 'Offered (L&T)'
    },
    {
      id: 'STU-2026-04',
      name: 'Divya Krishnan',
      rollNo: '22EC012',
      department: 'Electronics & Communication',
      course: 'B.Tech ECE',
      batch: '2022 - 2026',
      cgpa: 7.95,
      backlogs: 1,
      skills: ['Embedded C', 'IoT', 'VLSI', 'MATLAB'],
      resumeVerified: false,
      email: 'divya.krishnan@velsuniv.ac.in',
      phone: '+91 98840 88990',
      driveRegistrations: 1,
      offersCount: 0,
      placementStatus: 'In Screening'
    }
  ]);

  // 2. Company Eligibility Criteria (Feature 3)
  const [eligibilityCriteria, setEligibilityCriteria] = useState([
    {
      company: 'TechVision International',
      role: 'Graduate Cloud Architect',
      degree: 'B.Tech / B.E',
      branch: ['CSE', 'ECE', 'IT'],
      minCgpa: 8.0,
      maxBacklogs: 0,
      gradYear: '2026',
      package: '9,500 SGD / month (International)',
      status: 'Active'
    },
    {
      company: 'Al Habtoor Contracting LLC',
      role: 'Junior Site Engineer',
      degree: 'B.E / B.Tech',
      branch: ['Civil', 'Mechanical'],
      minCgpa: 7.5,
      maxBacklogs: 0,
      gradYear: '2026',
      package: '18,000 AED / month (GCC)',
      status: 'Active'
    },
    {
      company: 'L&T Construction',
      role: 'Graduate Engineer Trainee (GET)',
      degree: 'B.E / B.Tech',
      branch: ['Civil', 'Mechanical', 'EEE'],
      minCgpa: 7.0,
      maxBacklogs: 1,
      gradYear: '2026',
      package: '8.5 - 12 LPA (INR)',
      status: 'Active'
    }
  ]);

  // 3. Placement Drives State (Feature 5)
  const [placementDrives, setPlacementDrives] = useState([
    {
      id: 'DRV-2026-01',
      title: 'TechVision International On-Campus Drive 2026',
      company: 'TechVision International',
      driveDate: '2026-11-15',
      deadline: '2026-11-12',
      venue: 'Auditorium Block A & Virtual Meet',
      roles: ['Graduate Cloud Architect', 'DevOps Associate'],
      cgpaCutoff: 8.0,
      registeredCount: 64,
      shortlistedCount: 18,
      status: 'Open for Registration'
    },
    {
      id: 'DRV-2026-02',
      title: 'Al Habtoor UAE Campus Recruitment Drive',
      company: 'Al Habtoor Contracting LLC',
      driveDate: '2026-11-20',
      deadline: '2026-11-16',
      venue: 'Civil Engineering Seminar Hall',
      roles: ['Junior Site Engineer', 'Planning Associate'],
      cgpaCutoff: 7.5,
      registeredCount: 42,
      shortlistedCount: 14,
      status: 'In Evaluation'
    },
    {
      id: 'DRV-2026-03',
      title: 'L&T Mega Engineering Hiring Drive',
      company: 'L&T Construction',
      driveDate: '2026-11-28',
      deadline: '2026-11-22',
      venue: 'Main Placement Cell Hub',
      roles: ['Graduate Engineer Trainee (GET)'],
      cgpaCutoff: 7.0,
      registeredCount: 88,
      shortlistedCount: 26,
      status: 'Upcoming'
    }
  ]);

  // 4. Candidate Submissions & Tracking (Feature 7, 9)
  const [placements, setPlacements] = useState([
    {
      id: 'PLC-201',
      candidateName: 'Rohan Deshmukh',
      rollNo: '22CS104',
      role: 'Graduate Cloud Architect',
      clientCompany: 'TechVision International',
      status: 'Offer Accepted',
      stage: 'Offered',
      submissionDate: '2026-11-01',
      offeredSalary: '9,500 SGD / month',
      joiningDate: '2026-12-01',
      joiningStatus: 'Offer Accepted & Visa Processing'
    },
    {
      id: 'PLC-202',
      candidateName: 'Ananya Sundaram',
      rollNo: '22CV045',
      role: 'Junior Site Engineer',
      clientCompany: 'Al Habtoor Contracting LLC',
      status: 'Placements Completed',
      stage: 'Placed',
      submissionDate: '2026-10-25',
      offeredSalary: '18,000 AED / month',
      joiningDate: '2026-11-20',
      joiningStatus: 'Joined & Verified'
    },
    {
      id: 'PLC-203',
      candidateName: 'Mohammed Tariq',
      rollNo: '22ME089',
      role: 'Graduate Engineer Trainee',
      clientCompany: 'L&T Construction',
      status: 'Offer Received',
      stage: 'Offered',
      submissionDate: '2026-10-28',
      offeredSalary: '11.5 LPA (INR)',
      joiningDate: '2026-12-15',
      joiningStatus: 'Offer Under Review'
    }
  ]);

  // 5. Announcements State (Feature 10)
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'TechVision International - Pre-Placement Talk & Registration Deadline Extended',
      target: 'Final Year CSE / IT / ECE',
      date: 'Today at 09:30 AM',
      priority: 'Urgent',
      content: 'All eligible students with CGPA 8.0+ are advised to submit verified resumes by 6:00 PM today.'
    },
    {
      id: 2,
      title: 'Mandatory Resume Verification for GCC International Drives',
      target: 'All Engineering Batches (2026)',
      date: 'Yesterday at 03:00 PM',
      priority: 'Important',
      content: 'Passport copy and MOFA attestation readiness required for Al Habtoor and Emaar shortlisting.'
    }
  ]);

  // 6. Access & Approvals Audit State (Feature 12)
  const [accessRoles] = useState([
    { role: 'Placement Coordinator', permission: 'Create Drives, Approve Registrations, Record Offers', access: 'Full Edit' },
    { role: 'Department Placement Faculty', permission: 'Verify Student Marks, View Department Status', access: 'Department Edit' },
    { role: 'Student Representative', permission: 'View Approved Circulars, Notify Batch Mates', access: 'Read Only' },
    { role: 'Super Admin', permission: 'Master Approvals, Confidential CTC Records & Audit Logs', access: 'System Admin' }
  ]);

  // Overall KPIs for Feature 1
  const totalRegisteredStudents = students.length * 48; // Scaled pool
  const eligibleStudents = 142;
  const activeDrivesCount = placementDrives.filter(d => d.status.includes('Open') || d.status.includes('Evaluation')).length;
  const totalApplications = 286;
  const totalOffersCount = 74;
  const placedStudentsCount = 68;

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Banner Header (Super Admin Style) */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Placement Suite • Feature #1
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">CAMPUS DRIVES & TALENT DISPATCH</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Placement Coordinator Command Center
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Student profile verification, company eligibility, placement drives, application tracking, offers, and analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
              ● Drive Engine Active
            </span>
            <button
              onClick={() => setActiveTab('drives')}
              className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-2xl shadow-sm transition cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Drive</span>
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
            {statusMsg}
          </div>
        )}

        {/* 11-FEATURE PILL NAVIGATION BAR */}
        <div className="flex flex-wrap gap-1.5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 p-2 rounded-2xl shadow-xs overflow-x-auto">
          {[
            { id: 'overview', label: '#1 Overview', icon: LayoutDashboard },
            { id: 'students', label: '#2 Students', icon: GraduationCap },
            { id: 'companies', label: '#3 Companies', icon: Building2 },
            { id: 'drives', label: '#4 Drives', icon: Briefcase },
            { id: 'registration', label: '#5 Registration', icon: UserCheck },
            { id: 'applications', label: '#6 Applications', icon: GitMerge },
            { id: 'events', label: '#7 Events', icon: Calendar },
            { id: 'offers', label: '#8 Offers', icon: Award },
            { id: 'announcements', label: '#9 Notices', icon: Bell },
            { id: 'reports', label: '#10 Reports', icon: BarChart3 },
            { id: 'approvals', label: '#11 Approvals', icon: ShieldCheck }
          ].map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-gold-500 text-navy-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* #1 DASHBOARD OVERVIEW METRICS */}
        {(activeTab === 'overview' || activeTab === 'reports') && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Registered Students', val: totalRegisteredStudents, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' },
              { label: 'Eligible Students', val: eligibleStudents, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20' },
              { label: 'Active Drives', val: activeDrivesCount, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20' },
              { label: 'Total Applications', val: totalApplications, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20' },
              { label: 'Offers Issued', val: totalOffersCount, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' },
              { label: 'Placed Students', val: placedStudentsCount, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' }
            ].map((kpi, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border ${kpi.bg} text-center shadow-sm`}>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">{kpi.label}</span>
                <span className={`text-2xl font-black font-mono mt-1 block ${kpi.color}`}>{kpi.val}</span>
              </div>
            ))}
          </div>
        )}

        {/* TAB 1: OVERVIEW ACTIVE DRIVES & ONBOARDING */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
            {/* Active Drives (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
                <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-teal-500" />
                  <span>Ongoing Campus Placement Drives</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">{placementDrives.length} Drives Scheduled</span>
              </div>

              <div className="space-y-3">
                {placementDrives.map(drive => (
                  <div key={drive.id} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs">{drive.title}</h4>
                        <p className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">{drive.company}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300">
                        {drive.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 font-mono pt-1">
                      <span>Drive Date: <strong className="text-slate-800 dark:text-slate-200">{drive.driveDate}</strong></span>
                      <span>•</span>
                      <span>Cutoff: <strong className="text-teal-600 font-bold">{drive.cgpaCutoff} CGPA</strong></span>
                      <span>•</span>
                      <span>Registered: <strong className="text-blue-600 font-bold">{drive.registeredCount} Students</strong></span>
                    </div>

                    <p className="text-[11px] text-slate-500">Venue: {drive.venue}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Placed Students (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
                <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-gold-500" />
                  <span>Recent Placed Students & Offers</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">Verified Offers ✓</span>
              </div>

              <div className="space-y-3">
                {placements.map(plc => (
                  <div key={plc.id} className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">{plc.candidateName}</span>
                      <span className="font-mono text-emerald-600 font-extrabold text-[11px]">{plc.offeredSalary}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{plc.role} at <strong className="text-teal-600">{plc.clientCompany}</strong></p>
                    <span className="text-[10px] text-slate-400 font-mono block">Status: {plc.joiningStatus}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENT PROFILE MANAGEMENT */}
        {activeTab === 'students' && (
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-teal-500" />
                  <span>Student Profile Management</span>
                </h3>
                <p className="text-slate-500 text-xs">Maintain student details, course, department, batch, marks, skills, resume and contact information.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-teal-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800">
                    <th className="p-3 font-bold">Student Name & Roll No</th>
                    <th className="p-3 font-bold">Course & Department</th>
                    <th className="p-3 font-bold text-center">Batch & CGPA</th>
                    <th className="p-3 font-bold">Key Skills</th>
                    <th className="p-3 font-bold text-center">Resume</th>
                    <th className="p-3 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                  {students.map(stu => (
                    <tr key={stu.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                      <td className="p-3">
                        <p className="font-bold text-slate-900 dark:text-white">{stu.name}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{stu.rollNo} • {stu.phone}</span>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{stu.course}</p>
                        <span className="text-[10px] text-slate-500">{stu.department}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-mono font-extrabold text-teal-600 dark:text-teal-400 block">{stu.cgpa} CGPA</span>
                        <span className="text-[10px] text-slate-400 font-mono">0 Backlogs</span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {stu.skills.map(s => (
                            <span key={s} className="px-1.5 py-0.5 bg-slate-100 dark:bg-navy-950 rounded text-[9px] font-semibold border border-slate-200 dark:border-navy-800">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                          Verified ✓
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">{stu.placementStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}



        {/* TAB 5: PLACEMENT DRIVE MANAGEMENT */}
        {activeTab === 'drives' && (
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-teal-500" />
                <span>Placement Drive Creation & Schedules</span>
              </h3>
              <button
                onClick={() => showNotification('✓ New Placement Drive wizard opened')}
                className="px-3 py-1.5 bg-teal-500 text-navy-950 font-bold rounded-xl text-xs"
              >
                + Schedule Drive
              </button>
            </div>

            <div className="space-y-3">
              {placementDrives.map(drive => (
                <div key={drive.id} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{drive.title}</h4>
                    <p className="text-[11px] text-teal-600 font-semibold">{drive.company} • Date: {drive.driveDate} • Deadline: {drive.deadline}</p>
                    <span className="text-[10px] text-slate-400 font-mono">Cutoff: {drive.cgpaCutoff} CGPA • Roles: {drive.roles.join(', ')}</span>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300">
                      {drive.registeredCount} Registered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: ANNOUNCEMENTS & NOTIFICATIONS */}
        {activeTab === 'announcements' && (
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4 animate-in fade-in">
            <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-navy-800 pb-3">
              <Bell className="w-4 h-4 text-amber-500" />
              <span>Placement Notices, Deadlines & Circulars</span>
            </h3>

            <div className="space-y-3">
              {announcements.map(a => (
                <div key={a.id} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{a.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-600">{a.priority}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">{a.content}</p>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>Target: {a.target}</span>
                    <span>{a.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 12: ACCESS & APPROVALS */}
        {activeTab === 'approvals' && (
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl shadow-sm space-y-4 animate-in fade-in">
            <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-navy-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Access Control & Drive Approval Matrix</span>
            </h3>

            <div className="space-y-2">
              {accessRoles.map((acc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{acc.role}</h4>
                    <p className="text-[11px] text-slate-500">{acc.permission}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 font-mono">
                    {acc.access}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </ScrollReveal>
  );
};
