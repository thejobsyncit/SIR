import React, { useState, useMemo, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import {
  Globe, GraduationCap, Compass, Plane, CheckSquare, Search, Filter, 
  Send, UserCheck, CheckCircle2, Clock, AlertCircle, ArrowRight, 
  ChevronLeft, ChevronRight, Sparkles, ShieldCheck, ShieldAlert,
  Calendar, Phone, Mail, MessageSquare, Tag, Eye, RefreshCw,
  FileText, Check, AlertTriangle, Layers, BookOpen, School, X, Edit3, User
} from 'lucide-react';

// Team members strictly classified by operation as defined in the flowchart
export const INTL_HR_OPERATIONS_TEAM = [
  { id: 'INTL-HR-101', employeeId: 'REV-EMP-107', name: 'Fatima', role: 'International HR Operations Specialist', email: 'fatima.intl@revivalinternational.com', loginEmail: 'fatima.intl@revivalinternational.com', activeTasks: 3, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  { id: 'INTL-HR-102', employeeId: 'REV-EMP-006', name: 'Balavarshini S.', role: 'Lead HR Operations Specialist', email: 'balavarshini.s@revivalinternational.com', loginEmail: 'balavarshini2223@gmail.com', activeTasks: 2, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
];

export const ENQUIRY_HR_OPERATIONS_TEAM = [
  { id: 'ENQ-HR-201', employeeId: 'REV-EMP-102', name: 'Divya R.', role: 'HR Operations Specialist', email: 'divya.enq@revivalinternational.com', loginEmail: 'divya.enq@revivalinternational.com', activeTasks: 2, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { id: 'ENQ-HR-202', employeeId: 'REV-EMP-108', name: 'Praveen Kumar', role: 'HR Operations Specialist', email: 'praveen.enq@revivalinternational.com', loginEmail: 'praveen.enq@revivalinternational.com', activeTasks: 1, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' }
];

// Baseline enquiries with clear assignments to team members
const INITIAL_BASELINE_ENQUIRIES = [
  // Branch A: International HR Operations (intl-adm, intl-consult)
  { id: 'LEAD-INT-101', referenceNumber: 'REV-INT-2026-001', name: 'Dr. Sarah Al-Mansoori', email: 'sarah.mansoori@gmail.com', phone: '+971 50 123 4567', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'United Arab Emirates', status: 'New', createdAt: '2026-11-08T10:30:00Z', notes: 'Consultation for Dubai Golden Visa executive portfolio.' },
  { id: 'LEAD-INT-102', referenceNumber: 'REV-INT-2026-002', name: 'Alexander Wright', email: 'alex.wright@contractor.co.uk', phone: '+44 7911 123456', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'United Kingdom', status: 'Assigned', assignedEmployee: 'Balavarshini S.', assignedEmployeeId: 'REV-EMP-006', assignedEmployeeEmail: 'balavarshini.s@revivalinternational.com', priority: 'High', assignmentNotes: '📌 Review UK civil engineering degree attestation and Golden Visa sponsorship eligibility.', assignedDate: '2026-11-08T11:15:00Z', createdAt: '2026-11-08T11:15:00Z' },
  { id: 'LEAD-INT-103', referenceNumber: 'REV-ADM-2026-003', name: 'Elena Rostova', email: 'elena.rostova@cloudtech.de', phone: '+49 151 2345678', serviceId: 'intl-adm', serviceTitle: 'International Admissions', country: 'Germany', status: 'Assigned', assignedEmployee: 'Balavarshini S.', assignedEmployeeId: 'REV-EMP-006', assignedEmployeeEmail: 'balavarshini.s@revivalinternational.com', priority: 'Normal', assignmentNotes: '📌 Verify German bachelor transcripts and coordinate Dubai campus MSc application.', assignedDate: '2026-11-08T14:20:00Z', createdAt: '2026-11-08T14:20:00Z' },
  { id: 'LEAD-INT-104', referenceNumber: 'REV-INT-2026-004', name: 'Zubair Al Mansoor', email: 'zubair.mansoor@qatarcorp.qa', phone: '+974 55 123456', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'Qatar', status: 'Assigned', assignedEmployee: 'Fatima', assignedEmployeeId: 'REV-EMP-107', assignedEmployeeEmail: 'fatima.intl@revivalinternational.com', priority: 'High', assignmentNotes: '📌 Urgent: Verify attested degree copies & police clearance for GCC residency.', assignedDate: '2026-11-07T09:00:00Z', createdAt: '2026-11-07T08:00:00Z' },
  { id: 'LEAD-INT-105', referenceNumber: 'REV-ADM-2026-005', name: 'Karthik Subburaj', email: 'karthik.subburaj@gmail.com', phone: '+91 97890 87654', serviceId: 'intl-adm', serviceTitle: 'International Admissions', country: 'India', status: 'Assigned', assignedEmployee: 'Fatima', assignedEmployeeId: 'REV-EMP-107', assignedEmployeeEmail: 'fatima.intl@revivalinternational.com', priority: 'Normal', assignmentNotes: '📌 Call candidate to review IELTS scorecard and Spring 2027 university intake deadlines.', assignedDate: '2026-11-07T11:30:00Z', createdAt: '2026-11-07T10:00:00Z' },
  { id: 'LEAD-INT-106', referenceNumber: 'REV-INT-2026-006', name: 'Nadia El-Sayed', email: 'nadia.elsayed@cairoinvest.eg', phone: '+20 100 987 6543', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'Egypt', status: 'New', createdAt: '2026-11-06T15:45:00Z', notes: 'Medical consultancy licensing in Abu Dhabi Department of Health.' },
  { id: 'LEAD-INT-107', referenceNumber: 'REV-ADM-2026-007', name: 'Ahmed Bin Rashid', email: 'ahmed.rashid@emirates.ae', phone: '+971 52 334 5566', serviceId: 'intl-adm', serviceTitle: 'International Admissions', country: 'United Arab Emirates', status: 'New', createdAt: '2026-11-06T16:10:00Z', notes: 'Undergraduate business analytics admissions guidance.' },
  { id: 'LEAD-INT-108', referenceNumber: 'REV-INT-2026-008', name: 'Carlos Mendez', email: 'carlos.mendez@solarenergy.es', phone: '+34 612 345 678', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'Spain', status: 'New', createdAt: '2026-11-05T09:15:00Z', notes: 'Renewable energy engineering consultancy in Saudi NEOM sector.' },
  { id: 'LEAD-INT-109', referenceNumber: 'REV-ADM-2026-009', name: 'Priya Sundaram', email: 'priya.sundaram@gmail.com', phone: '+91 98401 55667', serviceId: 'intl-adm', serviceTitle: 'International Admissions', country: 'India', status: 'New', createdAt: '2026-11-05T11:40:00Z', notes: 'MBBS international pathway counseling for European medical universities.' },
  { id: 'LEAD-INT-110', referenceNumber: 'REV-INT-2026-010', name: 'Hassan Al-Nuaimi', email: 'hassan.nuaimi@omanpetro.om', phone: '+968 9123 4567', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'Oman', status: 'New', createdAt: '2026-11-05T13:00:00Z', notes: 'Petrochemical plant senior project director executive relocation.' },
  { id: 'LEAD-INT-111', referenceNumber: 'REV-ADM-2026-011', name: 'Mei-Ling Chen', email: 'meiling.chen@taipeitech.tw', phone: '+886 912 345 678', serviceId: 'intl-adm', serviceTitle: 'International Admissions', country: 'Taiwan', status: 'New', createdAt: '2026-11-04T10:20:00Z', notes: 'Artificial Intelligence postgraduate research program admission.' },
  { id: 'LEAD-INT-112', referenceNumber: 'REV-INT-2026-012', name: 'Marcus Sterling', email: 'marcus.sterling@londonfin.co.uk', phone: '+44 7890 654321', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'United Kingdom', status: 'New', createdAt: '2026-11-04T12:30:00Z', notes: 'DIFC financial regulatory advisory and dual residency consultation.' },
  { id: 'LEAD-INT-113', referenceNumber: 'REV-ADM-2026-013', name: 'Rohan Deshmukh', email: 'rohan.deshmukh@gmail.com', phone: '+91 99201 33445', serviceId: 'intl-adm', serviceTitle: 'International Admissions', country: 'India', status: 'New', createdAt: '2026-11-03T16:00:00Z', notes: 'Aerospace engineering bachelor admissions in Canada & Australia.' },
  { id: 'LEAD-INT-114', referenceNumber: 'REV-INT-2026-014', name: 'Fatima Al-Kuwari', email: 'f.kuwari@dohabank.qa', phone: '+974 66 778899', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'Qatar', status: 'New', createdAt: '2026-11-03T17:15:00Z', notes: 'Family office wealth governance and European golden visa.' },
  { id: 'LEAD-INT-115', referenceNumber: 'REV-ADM-2026-015', name: 'Ananya Roy', email: 'ananya.roy@calcuttauniv.in', phone: '+91 98310 99887', serviceId: 'intl-adm', serviceTitle: 'International Admissions', country: 'India', status: 'New', createdAt: '2026-11-02T11:00:00Z', notes: 'Public Health policy masters program in London School of Hygiene.' },
  { id: 'LEAD-INT-116', referenceNumber: 'REV-INT-2026-016', name: 'Saeed Al-Mutawa', email: 'saeed.mutawa@dubaiports.ae', phone: '+971 50 889 0011', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'United Arab Emirates', status: 'Completed', assignedEmployee: 'Fatima', assignedEmployeeId: 'REV-EMP-107', assignedEmployeeEmail: 'fatima.intl@revivalinternational.com', priority: 'High', assignmentNotes: 'Verify port logistics consultancy credentials.', completionNote: 'Consultancy dossier verified and signed off with MOHRE compliance.', completedDate: '2026-11-06T14:00:00Z', createdAt: '2026-11-01T09:00:00Z' },
  { id: 'LEAD-INT-117', referenceNumber: 'REV-ADM-2026-017', name: 'Farhan Zaidi', email: 'farhan.zaidi@karachitech.pk', phone: '+92 300 1234567', serviceId: 'intl-adm', serviceTitle: 'International Admissions', country: 'Pakistan', status: 'New', createdAt: '2026-11-01T12:00:00Z', notes: 'Biomedical engineering masters application in Ireland.' },
  { id: 'LEAD-INT-118', referenceNumber: 'REV-INT-2026-018', name: 'Chloe Dubois', email: 'chloe.dubois@parisdesign.fr', phone: '+33 6 12 34 56 78', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'France', status: 'New', createdAt: '2026-10-31T14:30:00Z', notes: 'Luxury retail architecture consultancy licensing in Riyadh.' },

  // Branch B: Enquiry HR Operations (school-career, school-academy, college-adm)
  { id: 'LEAD-ENQ-201', referenceNumber: 'REV-CAR-2026-001', name: 'Arunmozhi Varman', email: 'arunmozhi.v@gmail.com', phone: '+91 98401 22334', serviceId: 'school-career', serviceTitle: 'Career Guidance', country: 'India', status: 'Assigned', assignedEmployee: 'Divya R.', assignedEmployeeId: 'REV-EMP-102', assignedEmployeeEmail: 'divya.enq@revivalinternational.com', priority: 'Normal', assignmentNotes: '📌 Grade 10 stream selection counseling (Bio-Math vs Computer Science).', assignedDate: '2026-11-08T09:30:00Z', createdAt: '2026-11-08T09:30:00Z' },
  { id: 'LEAD-ENQ-202', referenceNumber: 'REV-ACA-2026-002', name: 'Kavitha Ramachandran', email: 'kavitha.ram@yahoo.com', phone: '+91 94441 55667', serviceId: 'school-academy', serviceTitle: 'School Student Academy', country: 'India', status: 'New', createdAt: '2026-11-08T10:45:00Z', notes: 'NEET 2027 integrated coaching cohort enrollment enquiry.' },
  { id: 'LEAD-ENQ-203', referenceNumber: 'REV-COL-2026-003', name: 'Pooja Ramakrishnan', email: 'pooja.ram@yahoo.com', phone: '+91 98401 23456', serviceId: 'college-adm', serviceTitle: 'College Admission Assistance', country: 'India', status: 'Assigned', assignedEmployee: 'Praveen Kumar', assignedEmployeeId: 'REV-EMP-108', assignedEmployeeEmail: 'praveen.enq@revivalinternational.com', priority: 'High', assignmentNotes: '📌 Review board exam cut-off and coordinate university quota counseling with parents.', assignedDate: '2026-11-07T10:00:00Z', createdAt: '2026-11-07T08:30:00Z' },
  { id: 'LEAD-ENQ-204', referenceNumber: 'REV-CAR-2026-004', name: 'Siddharth Iyer', email: 'siddharth.iyer@gmail.com', phone: '+91 98840 99881', serviceId: 'school-career', serviceTitle: 'Career Guidance', country: 'India', status: 'New', createdAt: '2026-11-07T14:00:00Z', notes: 'Comprehensive psychometric aptitude assessment and engineering roadmap.' },
  { id: 'LEAD-ENQ-205', referenceNumber: 'REV-ACA-2026-005', name: 'Naveen Kumar M.', email: 'naveen.m@rediffmail.com', phone: '+91 97909 11223', serviceId: 'school-academy', serviceTitle: 'School Student Academy', country: 'India', status: 'New', createdAt: '2026-11-06T11:20:00Z', notes: 'JEE Mains & Advanced foundation weekend academy for 11th standard.' },
  { id: 'LEAD-ENQ-206', referenceNumber: 'REV-COL-2026-006', name: 'Deepa Narayanan', email: 'deepa.narayanan@gmail.com', phone: '+91 98410 44556', serviceId: 'college-adm', serviceTitle: 'College Admission Assistance', country: 'India', status: 'New', createdAt: '2026-11-06T13:40:00Z', notes: 'B.Tech Artificial Intelligence & Data Science admission in Anna University affiliated colleges.' },
  { id: 'LEAD-ENQ-207', referenceNumber: 'REV-CAR-2026-007', name: 'Gautam Raghavan', email: 'gautam.r@outlook.com', phone: '+91 98402 77889', serviceId: 'school-career', serviceTitle: 'Career Guidance', country: 'India', status: 'New', createdAt: '2026-11-05T10:15:00Z', notes: 'Law entrance CLAT coaching and humanities stream planning.' },
  { id: 'LEAD-ENQ-208', referenceNumber: 'REV-ACA-2026-008', name: 'Shreya Venkatesh', email: 'shreya.v@gmail.com', phone: '+91 94450 33445', serviceId: 'school-academy', serviceTitle: 'School Student Academy', country: 'India', status: 'New', createdAt: '2026-11-05T15:00:00Z', notes: 'Olympiad mathematics & science training for 8th standard student.' },
  { id: 'LEAD-ENQ-209', referenceNumber: 'REV-COL-2026-009', name: 'Manish Tiwari', email: 'manish.tiwari@gmail.com', phone: '+91 97110 55667', serviceId: 'college-adm', serviceTitle: 'College Admission Assistance', country: 'India', status: 'New', createdAt: '2026-11-04T09:45:00Z', notes: 'B.Com / BBA Honours in top tier private management institutes.' },
  { id: 'LEAD-ENQ-210', referenceNumber: 'REV-CAR-2026-010', name: 'Harini Sundar', email: 'harini.sundar@yahoo.co.in', phone: '+91 98841 22339', serviceId: 'school-career', serviceTitle: 'Career Guidance', country: 'India', status: 'Assigned', assignedEmployee: 'Divya R.', assignedEmployeeId: 'REV-EMP-102', assignedEmployeeEmail: 'divya.enq@revivalinternational.com', priority: 'Normal', assignmentNotes: '📌 Administer career assessment test & draft recommendation dossier.', assignedDate: '2026-11-04T11:00:00Z', createdAt: '2026-11-04T10:00:00Z' },
  { id: 'LEAD-ENQ-211', referenceNumber: 'REV-ACA-2026-011', name: 'Vigneshwaran P.', email: 'vignesh.p@gmail.com', phone: '+91 99400 88776', serviceId: 'school-academy', serviceTitle: 'School Student Academy', country: 'India', status: 'New', createdAt: '2026-11-03T14:15:00Z', notes: 'CUET preparation batch for Central University entrance.' },
  { id: 'LEAD-ENQ-212', referenceNumber: 'REV-COL-2026-012', name: 'Aakash Bhattacharya', email: 'aakash.b@gmail.com', phone: '+91 98301 44556', serviceId: 'college-adm', serviceTitle: 'College Admission Assistance', country: 'India', status: 'New', createdAt: '2026-11-03T16:30:00Z', notes: 'Direct lateral entry B.E. Mechanical Engineering admission assistance.' },
  { id: 'LEAD-ENQ-213', referenceNumber: 'REV-CAR-2026-013', name: 'Lavanya Chandran', email: 'lavanya.c@gmail.com', phone: '+91 98403 66778', serviceId: 'school-career', serviceTitle: 'Career Guidance', country: 'India', status: 'New', createdAt: '2026-11-02T10:30:00Z', notes: 'Design careers counseling (NID, NIFT, UCEED entrance guidance).' },
  { id: 'LEAD-ENQ-214', referenceNumber: 'REV-ACA-2026-014', name: 'Rithvik Sriram', email: 'rithvik.s@gmail.com', phone: '+91 94444 11223', serviceId: 'school-academy', serviceTitle: 'School Student Academy', country: 'India', status: 'New', createdAt: '2026-11-02T13:00:00Z', notes: 'CBSE 10th board crash course and science doubt clearance.' },
  { id: 'LEAD-ENQ-215', referenceNumber: 'REV-COL-2026-015', name: 'Sneha Patel', email: 'sneha.patel@gujarattech.in', phone: '+91 98250 99881', serviceId: 'college-adm', serviceTitle: 'College Admission Assistance', country: 'India', status: 'New', createdAt: '2026-11-01T15:20:00Z', notes: 'B.Pharm and allied healthcare courses admission counseling.' },
  { id: 'LEAD-ENQ-216', referenceNumber: 'REV-CAR-2026-016', name: 'Rahul Varma', email: 'rahul.varma@gmail.com', phone: '+91 98400 77112', serviceId: 'school-career', serviceTitle: 'Career Guidance', country: 'India', status: 'Completed', assignedEmployee: 'Praveen Kumar', assignedEmployeeId: 'REV-EMP-108', assignedEmployeeEmail: 'praveen.enq@revivalinternational.com', priority: 'Normal', assignmentNotes: 'Conduct stream selection aptitude test.', completionNote: 'Aptitude assessment completed. Recommended PCM with Computer Science stream.', completedDate: '2026-11-05T16:30:00Z', createdAt: '2026-10-31T09:00:00Z' },
  { id: 'LEAD-ENQ-217', referenceNumber: 'REV-ACA-2026-017', name: 'Tarun Prasanna', email: 'tarun.p@gmail.com', phone: '+91 97899 44332', serviceId: 'school-academy', serviceTitle: 'School Student Academy', country: 'India', status: 'New', createdAt: '2026-10-30T11:00:00Z', notes: 'Robotics and STEM school club weekend batch.' }
];

export const CrmHrTaskAssignment = () => {
  const { currentRole, user } = useCrm();

  // Strict role differentiation: Task Assignment available to HR Lead, Super Admin, and Admin
  const isAuthorizedToAssign = ['HR Lead', 'Super Admin', 'Admin'].includes(currentRole);
  const isHrLead = isAuthorizedToAssign;
  const isHrOperations = currentRole === 'HR Operations';

  // Active employee identity
  const currentEmployeeName = user?.name || (isHrOperations ? 'Balavarshini S.' : 'HR Lead');
  const currentEmployeeId = user?.employeeId || user?.id || (isHrOperations ? 'REV-EMP-006' : 'REV-EMP-003');
  const currentEmployeeEmail = user?.email || (isHrOperations ? 'balavarshini2223@gmail.com' : 'priya.lead@revivalinternational.com');

  // Storage key for persisting assignment state across refresh
  const STORAGE_KEY = 'revival_hr_task_assignments_v1';

  // Load custom stored leads or initialize with baseline
  const [taskData, setTaskData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_BASELINE_ENQUIRIES;
  });

  // Sync to localStorage whenever taskData changes
  const saveTasks = (newTasks) => {
    setTaskData(newTasks);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    } catch (e) {}
  };

  // Sync from backend API on mount and role change
  useEffect(() => {
    const fetchLiveLeads = async () => {
      try {
        const url = isHrOperations 
          ? `/api/leads?assignedEmployee=${encodeURIComponent(currentEmployeeName)}&userRole=HR+Operations`
          : '/api/leads?limit=150';
        const res = await fetch(url, {
          headers: {
            'x-user-role': currentRole || 'HR Operations',
            'x-employee-name': currentEmployeeName,
            'x-employee-id': currentEmployeeId,
            'x-employee-email': currentEmployeeEmail
          }
        });
        const data = await res.json();
        const apiLeads = Array.isArray(data.leads) ? data.leads : (Array.isArray(data.data) ? data.data : []);
        if (apiLeads.length > 0) {
          setTaskData(prev => {
            const merged = [...prev];
            apiLeads.forEach(lead => {
              const idx = merged.findIndex(m => m.id === lead.id || (lead.referenceNumber && m.referenceNumber === lead.referenceNumber));
              if (idx >= 0) {
                merged[idx] = { ...merged[idx], ...lead };
              } else {
                merged.unshift(lead);
              }
            });
            return merged;
          });
        }
      } catch (e) {
        console.warn('API leads sync notice:', e.message);
      }
    };
    fetchLiveLeads();
  }, [currentRole, currentEmployeeName, currentEmployeeId, currentEmployeeEmail, isHrOperations]);

  // Current Operation Tab
  // 'intl-ops' = International HR Operations
  // 'enq-ops'  = Enquiry HR Operations
  // 'tracker'  = Live Task Progress & Completion Tracker
  const [operationTab, setOperationTab] = useState('intl-ops');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Multi-selection checkboxes (HR Lead only)
  const [selectedEnquiryIds, setSelectedEnquiryIds] = useState([]);

  // Assignment Modal / Panel State (Available to HR Lead, Super Admin, Admin)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('High');
  const [assignmentInstructions, setAssignmentInstructions] = useState('');
  const [assigningLoading, setAssigningLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  // Pagination: 15 records per page strictly
  const RECORDS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);

  // Modals for employee task management
  const [selectedCandidateModal, setSelectedCandidateModal] = useState(null);
  const [statusUpdateModalLead, setStatusUpdateModalLead] = useState(null);
  const [statusNewVal, setStatusNewVal] = useState('In Progress');
  const [statusNoteText, setStatusNoteText] = useState('');
  const [completingTask, setCompletingTask] = useState(null);
  const [completionNote, setCompletionNote] = useState('');
  const [trackerFilterStatus, setTrackerFilterStatus] = useState('all'); // 'all' | 'pending' | 'completed'
  const [trackerMemberFilter, setTrackerMemberFilter] = useState('all');

  // Branch A Sources: International Admissions & International Consulting
  const isIntlSource = (item) => {
    const sId = (item.serviceId || '').toLowerCase();
    const title = (item.serviceTitle || '').toLowerCase();
    const ref = (item.referenceNumber || '').toUpperCase();
    return (
      sId === 'intl-adm' || 
      sId === 'intl-consult' || 
      sId.includes('intl-adm') || 
      sId.includes('intl-consult') || 
      ref.startsWith('REV-INT') || 
      ref.startsWith('REV-ADM') ||
      title.includes('international')
    );
  };

  // Branch B Sources: Career Guidance, School Student Academy, College Admission
  const isEnquirySource = (item) => {
    const sId = (item.serviceId || '').toLowerCase();
    const title = (item.serviceTitle || '').toLowerCase();
    const ref = (item.referenceNumber || '').toUpperCase();
    return (
      sId === 'school-career' ||
      sId === 'career-guidance' ||
      sId === 'school-academy' ||
      sId === 'student-academy' ||
      sId === 'college-adm' ||
      ref.startsWith('REV-CAR') ||
      ref.startsWith('REV-ACA') ||
      ref.startsWith('REV-COL') ||
      title.includes('career') ||
      title.includes('academy') ||
      title.includes('college')
    );
  };

  // Check if an enquiry is assigned to the current employee
  const isAssignedToCurrentUser = (item) => {
    if (!item.assignedEmployee && !item.assignedEmployeeId && !item.assignedEmployeeEmail) return false;
    
    const assignedLower = String(item.assignedEmployee || '').toLowerCase().trim();
    const currentLower = String(currentEmployeeName || user?.name || '').toLowerCase().trim();
    const assignedClean = assignedLower.replace(/[^a-z]/g, '');
    const currentClean = currentLower.replace(/[^a-z]/g, '');

    // Canonical specialist checks for Fatima, Balavarshini S., Divya R., Praveen Kumar
    const isCurrentBala = currentClean.includes('bala') || (user?.email && user.email.toLowerCase().includes('bala')) || currentEmployeeId === 'REV-EMP-006' || currentEmployeeId === 'INTL-HR-102';
    const isCurrentFatima = currentClean.includes('fatima') || (user?.email && user.email.toLowerCase().includes('fatima')) || currentEmployeeId === 'REV-EMP-107' || currentEmployeeId === 'INTL-HR-101';
    const isCurrentDivya = currentClean.includes('divya') || currentClean.includes('diviya') || (user?.email && (user.email.toLowerCase().includes('divya') || user.email.toLowerCase().includes('diviya'))) || currentEmployeeId === 'REV-EMP-102' || currentEmployeeId === 'ENQ-HR-201';
    const isCurrentPraveen = currentClean.includes('praveen') || (user?.email && user.email.toLowerCase().includes('praveen')) || currentEmployeeId === 'REV-EMP-108' || currentEmployeeId === 'ENQ-HR-202';

    if (isCurrentBala) {
      if (assignedClean.includes('bala')) return true;
      if (['REV-EMP-006', 'INTL-HR-102', 'emp-6', 'emp-bala'].includes(item.assignedEmployeeId)) return true;
      if (item.assignedEmployeeEmail && item.assignedEmployeeEmail.toLowerCase().includes('bala')) return true;
      return false;
    }

    if (isCurrentFatima) {
      if (assignedClean.includes('fatima')) return true;
      if (['REV-EMP-107', 'INTL-HR-101', 'emp-fatima'].includes(item.assignedEmployeeId)) return true;
      if (item.assignedEmployeeEmail && item.assignedEmployeeEmail.toLowerCase().includes('fatima')) return true;
      return false;
    }

    if (isCurrentDivya) {
      if (assignedClean.includes('divya') || assignedClean.includes('diviya')) return true;
      if (['REV-EMP-102', 'ENQ-HR-201', 'emp-divya', 'emp-diviya'].includes(item.assignedEmployeeId)) return true;
      if (item.assignedEmployeeEmail && (item.assignedEmployeeEmail.toLowerCase().includes('divya') || item.assignedEmployeeEmail.toLowerCase().includes('diviya'))) return true;
      return false;
    }

    if (isCurrentPraveen) {
      if (assignedClean.includes('praveen')) return true;
      if (['REV-EMP-108', 'ENQ-HR-202', 'emp-praveen'].includes(item.assignedEmployeeId)) return true;
      if (item.assignedEmployeeEmail && item.assignedEmployeeEmail.toLowerCase().includes('praveen')) return true;
      return false;
    }

    // Generic direct/clean matching for other roles / specialists
    if (assignedLower === currentLower) return true;
    if (assignedClean && currentClean && (assignedClean.includes(currentClean) || currentClean.includes(assignedClean))) return true;
    if (item.assignedEmployeeId && currentEmployeeId && item.assignedEmployeeId === currentEmployeeId) return true;
    if (item.assignedEmployeeEmail && user?.email && item.assignedEmployeeEmail.toLowerCase() === user.email.toLowerCase()) return true;

    return false;
  };

  // Filter enquiries for the active operation branch
  const branchEnquiries = useMemo(() => {
    let list = taskData;
    // CRITICAL: HR Operations employees see ONLY candidates assigned to them by HR Lead
    if (isHrOperations) {
      list = list.filter(isAssignedToCurrentUser);
    }
    if (operationTab === 'intl-ops') {
      return list.filter(isIntlSource);
    } else if (operationTab === 'enq-ops') {
      return list.filter(isEnquirySource);
    }
    return list;
  }, [taskData, operationTab, isHrOperations, currentEmployeeName]);

  // Apply search & dropdown filters
  const filteredEnquiries = useMemo(() => {
    return branchEnquiries.filter(item => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (item.name || '').toLowerCase().includes(q);
        const matchesRef = (item.referenceNumber || '').toLowerCase().includes(q);
        const matchesEmail = (item.email || '').toLowerCase().includes(q);
        const matchesPhone = (item.phone || '').toLowerCase().includes(q);
        const matchesCountry = (item.country || '').toLowerCase().includes(q);
        if (!matchesName && !matchesRef && !matchesEmail && !matchesPhone && !matchesCountry) return false;
      }
      // Service filter
      if (selectedService !== 'all') {
        const sId = (item.serviceId || '').toLowerCase();
        if (!sId.includes(selectedService.toLowerCase())) return false;
      }
      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'New' && item.status !== 'New' && item.status !== 'New Enquiry') return false;
        if (selectedStatus === 'Assigned' && item.status !== 'Assigned') return false;
        if (selectedStatus === 'In Progress' && item.status !== 'In Progress') return false;
        if (selectedStatus === 'Completed' && item.status !== 'Completed') return false;
      }
      return true;
    });
  }, [branchEnquiries, searchQuery, selectedService, selectedStatus]);

  // Paginated records: 15 records per page
  const totalPages = Math.max(1, Math.ceil(filteredEnquiries.length / RECORDS_PER_PAGE));
  const paginatedEnquiries = useMemo(() => {
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
    return filteredEnquiries.slice(startIndex, startIndex + RECORDS_PER_PAGE);
  }, [filteredEnquiries, currentPage]);

  // Handle single enquiry selection (HR Lead only)
  const handleToggleSelectOne = (id) => {
    if (!isHrLead) return;
    setSelectedEnquiryIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Handle Select All on current page (HR Lead only)
  const handleSelectAllCurrentPage = () => {
    if (!isHrLead) return;
    const pageIds = paginatedEnquiries.map(e => e.id);
    const allSelected = pageIds.every(id => selectedEnquiryIds.includes(id));
    if (allSelected) {
      setSelectedEnquiryIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedEnquiryIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  // Team list for active branch
  const activeTeamList = operationTab === 'intl-ops' ? INTL_HR_OPERATIONS_TEAM : ENQUIRY_HR_OPERATIONS_TEAM;

  // Execute assignment to selected team member (HR Lead only)
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!isHrLead) return;
    if (selectedEnquiryIds.length === 0) {
      alert('Please select at least one enquiry using the checkboxes to assign.');
      return;
    }
    if (!selectedMemberId) {
      alert('Please select an HR Team Member from the dropdown to assign.');
      return;
    }

    const assignedMember = activeTeamList.find(m => m.id === selectedMemberId);
    if (!assignedMember) return;

    setAssigningLoading(true);

    try {
      // Backend persistence call
      await fetch('/api/hr-operations/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentRole || 'HR Lead'
        },
        body: JSON.stringify({
          enquiryIds: selectedEnquiryIds,
          employeeId: assignedMember.id,
          canonicalEmployeeId: assignedMember.employeeId || 'REV-EMP-006',
          employeeName: assignedMember.name,
          employeeEmail: assignedMember.email,
          operationTeam: operationTab === 'intl-ops' ? 'International HR Operations' : 'Enquiry HR Operations',
          priority: selectedPriority,
          instructions: assignmentInstructions || 'Follow up immediately with candidate regarding application status.',
          assignedBy: user?.name || 'HR Lead',
          assignedById: user?.employeeId || user?.id || 'emp-3'
        })
      });
    } catch (err) {
      console.warn('Backend assign notice:', err);
    }

    const nowIso = new Date().toISOString();
    const updated = taskData.map(item => {
      if (selectedEnquiryIds.includes(item.id)) {
        return {
          ...item,
          status: 'Assigned',
          assignedEmployee: assignedMember.name,
          assignedEmployeeId: assignedMember.id,
          assignedEmployeeRole: assignedMember.role,
          assignedEmployeeAvatar: assignedMember.avatar,
          priority: selectedPriority,
          assignmentNotes: assignmentInstructions || 'Follow up immediately with candidate regarding application status.',
          assignedDate: nowIso,
          assignedBy: user?.name || 'HR Lead'
        };
      }
      return item;
    });

    saveTasks(updated);
    setAssigningLoading(false);
    setIsAssignModalOpen(false);
    setSuccessBanner(`✓ Successfully assigned ${selectedEnquiryIds.length} enquiries to ${assignedMember.name} (${assignedMember.role}) with specific instructions!`);
    setSelectedEnquiryIds([]);
    setAssignmentInstructions('');
    setSelectedMemberId('');

    setTimeout(() => setSuccessBanner(''), 7000);
  };

  // Quick preset instruction pills (HR Lead only)
  const setPresetInstruction = (text) => {
    setAssignmentInstructions(text);
  };

  // Status update handler (HR Operations Employee or HR Lead)
  const handleSaveStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusUpdateModalLead) return;

    const leadId = statusUpdateModalLead.id;
    const nowIso = new Date().toISOString();
    const formattedNote = statusNoteText.trim()
      ? `[${new Date().toLocaleDateString()}] ${currentEmployeeName}: ${statusNoteText.trim()}`
      : null;

    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentRole || 'HR Operations'
        },
        body: JSON.stringify({
          status: statusNewVal,
          internalNotes: formattedNote
            ? `${statusUpdateModalLead.internalNotes || ''}\n${formattedNote}`.trim()
            : statusUpdateModalLead.internalNotes,
          lastContactedDate: nowIso,
          updatedBy: currentEmployeeName,
          userRole: currentRole
        })
      });
    } catch (err) {
      console.warn('Backend status update notice:', err);
    }

    const updated = taskData.map(item => {
      if (item.id === leadId) {
        return {
          ...item,
          status: statusNewVal,
          internalNotes: formattedNote
            ? `${item.internalNotes || ''}\n${formattedNote}`.trim()
            : item.internalNotes,
          lastContactedDate: nowIso
        };
      }
      return item;
    });

    saveTasks(updated);
    setStatusUpdateModalLead(null);
    setStatusNoteText('');
    setSuccessBanner(`✓ Successfully updated status to "${statusNewVal}" for ${statusUpdateModalLead.name}!`);
    setTimeout(() => setSuccessBanner(''), 5000);
  };

  // Mark task completed handler
  const handleCompleteTask = async (taskId) => {
    const task = taskData.find(t => t.id === taskId);
    const nowIso = new Date().toISOString();
    const resNote = completionNote || 'Task successfully resolved and verified by HR operations specialist.';

    try {
      await fetch(`/api/leads/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentRole || 'HR Operations'
        },
        body: JSON.stringify({
          status: 'Completed',
          internalNotes: task
            ? `${task.internalNotes || ''}\n[${new Date().toLocaleDateString()}] Resolved by ${currentEmployeeName}: ${resNote}`.trim()
            : resNote,
          userRole: currentRole
        })
      });
    } catch (err) {
      console.warn('Backend complete task notice:', err);
    }

    const updated = taskData.map(item => {
      if (item.id === taskId) {
        return {
          ...item,
          status: 'Completed',
          completedDate: nowIso,
          completionNote: resNote
        };
      }
      return item;
    });

    saveTasks(updated);
    setCompletingTask(null);
    setCompletionNote('');
    setSuccessBanner('✓ Task marked as Completed successfully! Updated in CRM database.');
    setTimeout(() => setSuccessBanner(''), 5000);
  };

  // Reopen completed task handler
  const handleReopenTask = (taskId) => {
    const updated = taskData.map(item => {
      if (item.id === taskId) {
        return {
          ...item,
          status: 'Assigned',
          completedDate: null,
          completionNote: null
        };
      }
      return item;
    });
    saveTasks(updated);
    setSuccessBanner('Task reopened and returned to In Progress queue.');
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  // Tracker tasks (Scoped strictly to current employee if HR Operations)
  const allAssignedTasks = useMemo(() => {
    let list = taskData.filter(item => item.status === 'Assigned' || item.status === 'Completed');
    if (isHrOperations) {
      list = list.filter(isAssignedToCurrentUser);
    }
    return list;
  }, [taskData, isHrOperations, currentEmployeeName]);

  const filteredTrackerTasks = useMemo(() => {
    return allAssignedTasks.filter(item => {
      if (trackerFilterStatus === 'pending' && item.status !== 'Assigned') return false;
      if (trackerFilterStatus === 'completed' && item.status !== 'Completed') return false;
      if (isHrLead && trackerMemberFilter !== 'all' && item.assignedEmployee !== trackerMemberFilter) return false;
      return true;
    });
  }, [allAssignedTasks, trackerFilterStatus, trackerMemberFilter, isHrLead]);

  // Flowchart Metric Counts (Dynamically scoped by role)
  const intlTotalCount = taskData.filter(isIntlSource).length;
  const intlUnassignedCount = taskData.filter(e => isIntlSource(e) && e.status === 'New').length;
  const enqTotalCount = taskData.filter(isEnquirySource).length;
  const enqUnassignedCount = taskData.filter(e => isEnquirySource(e) && e.status === 'New').length;
  const totalCompletedTasks = taskData.filter(e => e.status === 'Completed').length;
  const totalPendingTasks = taskData.filter(e => e.status === 'Assigned').length;

  // Employee-specific metric counts
  const myAssignedTotal = taskData.filter(isAssignedToCurrentUser).length;
  const myIntlCount = taskData.filter(e => isIntlSource(e) && isAssignedToCurrentUser(e)).length;
  const myEnqCount = taskData.filter(e => isEnquirySource(e) && isAssignedToCurrentUser(e)).length;
  const myCompletedCount = taskData.filter(e => isAssignedToCurrentUser(e) && e.status === 'Completed').length;
  const myPendingCount = taskData.filter(e => isAssignedToCurrentUser(e) && e.status !== 'Completed').length;

  // Unauthorized access guard for roles other than HR Lead and HR Operations
  const isAuthorized = isHrLead || isHrOperations;
  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-navy-900 rounded-3xl border border-red-500/30 text-center shadow-xl space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Task Management — Access Denied</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This operational module is strictly reserved for authorized Human Resources personnel.
        </p>
        <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 text-xs text-slate-500 text-left font-mono space-y-1">
          <div>• Required Role: HR Lead / HR Operations</div>
          <div>• Current Active Role: <span className="text-red-500 font-bold">{currentRole || 'Restricted'}</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-300">
      
      {/* HEADER TITLE & SUMMARY */}
      <div className="glass-card bg-white dark:bg-navy-900/90 rounded-2xl p-6 border border-slate-200 dark:border-gold-500/30 shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-500 text-navy-950 shadow-xs">
              {isHrLead ? 'HR Lead Assignment Hub' : 'HR Operations Work Queue'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Revival International CRM • {isHrLead ? 'Central Task Engine' : 'Assigned Enquiries Desk'}
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isHrLead ? 'HR Operations Task Assignment' : 'My Assigned Enquiries & Tasks'}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
            {isHrLead ? (
              <>Choose operation branch (<strong>International HR Operations</strong> or <strong>Enquiry HR Operations</strong>), select candidates, point out specific instructions, and assign to specialists.</>
            ) : (
              <>Logged in as <strong className="text-slate-900 dark:text-white">{currentEmployeeName}</strong> • Showing only enquiries assigned to you by the HR Lead. Review candidate details, manage follow-ups, and update task statuses.</>
            )}
          </p>
        </div>

        {/* Live Status Counters */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          {isHrLead ? (
            <>
              <div className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-center">
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wide">Intl Pending</div>
                <div className="text-base font-extrabold text-blue-700 dark:text-blue-300 font-mono">{intlUnassignedCount}</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center">
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide">Enquiry Pending</div>
                <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">{enqUnassignedCount}</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center">
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wide">Completed</div>
                <div className="text-base font-extrabold text-amber-700 dark:text-amber-300 font-mono">{totalCompletedTasks}</div>
              </div>
            </>
          ) : (
            <>
              <div className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-center">
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wide">My Intl Enquiries</div>
                <div className="text-base font-extrabold text-blue-700 dark:text-blue-300 font-mono">{myIntlCount}</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center">
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide">My Education Enquiries</div>
                <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">{myEnqCount}</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center">
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wide">My Completed</div>
                <div className="text-base font-extrabold text-amber-700 dark:text-amber-300 font-mono">{myCompletedCount}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SUCCESS NOTIFICATION TOAST BANNER */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-500 text-navy-950 font-bold text-xs flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner('')} className="hover:opacity-75 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BRANCH TABS: Choose Operation */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 dark:border-navy-800 pb-3">
        {/* Branch A: International HR Operations */}
        <button
          type="button"
          onClick={() => {
            setOperationTab('intl-ops');
            setCurrentPage(1);
            setSelectedEnquiryIds([]);
            setSelectedService('all');
            setSelectedStatus('all');
          }}
          className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition duration-200 cursor-pointer shadow-sm ${
            operationTab === 'intl-ops'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ring-2 ring-blue-500/40 shadow-blue-500/20'
              : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-800'
          }`}
        >
          <Globe className="w-4 h-4 shrink-0" />
          <span>{isHrLead ? 'Branch A: International HR Operations' : 'International HR Operations'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            operationTab === 'intl-ops' ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
          }`}>
            {isHrLead ? `${intlTotalCount} Enquiries` : `${myIntlCount} Assigned to Me`}
          </span>
        </button>

        {/* Branch B: Enquiry HR Operations */}
        <button
          type="button"
          onClick={() => {
            setOperationTab('enq-ops');
            setCurrentPage(1);
            setSelectedEnquiryIds([]);
            setSelectedService('all');
            setSelectedStatus('all');
          }}
          className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition duration-200 cursor-pointer shadow-sm ${
            operationTab === 'enq-ops'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white ring-2 ring-emerald-500/40 shadow-emerald-500/20'
              : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-800'
          }`}
        >
          <GraduationCap className="w-4 h-4 shrink-0" />
          <span>{isHrLead ? 'Branch B: Enquiry HR Operations' : 'Enquiry HR Operations'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            operationTab === 'enq-ops' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
          }`}>
            {isHrLead ? `${enqTotalCount} Enquiries` : `${myEnqCount} Assigned to Me`}
          </span>
        </button>

        {/* 1. NEW: Task Assign button for authorized roles (HR Lead, Super Admin, Admin) */}
        {isAuthorizedToAssign && operationTab !== 'tracker' && (
          <button
            type="button"
            onClick={() => setIsAssignModalOpen(true)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer shadow-md ${
              selectedEnquiryIds.length > 0
                ? 'bg-gradient-to-r from-gold-500 via-amber-500 to-yellow-500 hover:from-gold-600 hover:to-amber-600 text-navy-950 ring-2 ring-gold-400/60 shadow-gold-500/30 scale-[1.02]'
                : 'bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-600 hover:to-gold-600 text-navy-950 shadow-sm border border-gold-400/40'
            }`}
            title="Open Task Assignment Dialog"
          >
            <UserCheck className="w-4 h-4 shrink-0 text-navy-950" />
            <span className="tracking-wide">Task Assign</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-navy-950 text-gold-400 font-extrabold shadow-xs">
              {selectedEnquiryIds.length}
            </span>
          </button>
        )}

        {/* Branch C: Live Task Completion Tracker */}
        <button
          type="button"
          onClick={() => setOperationTab('tracker')}
          className={`ml-auto flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition duration-200 cursor-pointer shadow-sm ${
            operationTab === 'tracker'
              ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-navy-950 ring-2 ring-gold-500/40'
              : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 hover:bg-gold-500/10 border border-slate-200 dark:border-navy-800'
          }`}
        >
          <CheckSquare className="w-4 h-4 shrink-0 text-gold-600 dark:text-gold-400" />
          <span>{isHrLead ? 'Task Completion Tracker' : 'My Task Completion Tracker'}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-navy-950 text-gold-400">
            {isHrLead ? `${allAssignedTasks.length} Active` : `${myPendingCount} Pending`}
          </span>
        </button>
      </div>

      {/* VIEW FOR BRANCH A & B: ENQUIRIES LIST (15 records per page, Full Width) */}
      {operationTab !== 'tracker' && (
        <div className="w-full space-y-4">
          
          {/* ENQUIRIES LIST TABLE (Full width for all roles) */}
          <div className="w-full space-y-4">
            
            {/* Branch Summary & Filter Toolbar */}
            <div className="bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {operationTab === 'intl-ops' ? (
                      <>
                        <Globe className="w-4 h-4 text-blue-500" />
                        <span>{isHrLead ? 'View Enquiries List — International HR Operations' : 'My International HR Operations Enquiries'}</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-4 h-4 text-emerald-500" />
                        <span>{isHrLead ? 'View Enquiries List — Enquiry HR Operations' : 'My Enquiry HR Operations Enquiries'}</span>
                      </>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Enquiry Sources:{' '}
                    {operationTab === 'intl-ops' ? (
                      <span className="font-semibold text-blue-600 dark:text-blue-400">International Admissions, International Consulting</span>
                    ) : (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Career Guidance, School Student Academy, College Admission</span>
                    )}
                    {isHrOperations && (
                      <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400">
                        • Scoped strictly to {currentEmployeeName}
                      </span>
                    )}
                  </p>
                </div>

                {/* Filter Pill Badges */}
                <div className="flex items-center gap-2">
                  {isHrLead ? (
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-bold">
                      {filteredEnquiries.length} Enquiries Available
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                      ✓ {filteredEnquiries.length} Assigned Candidates
                    </span>
                  )}
                </div>
              </div>

              {/* Search & Service Filter Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-navy-800">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search candidate, email, phone, ref..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <select
                    value={selectedService}
                    onChange={(e) => { setSelectedService(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-gold-500 font-semibold cursor-pointer"
                  >
                    <option value="all">All Services in Branch</option>
                    {operationTab === 'intl-ops' ? (
                      <>
                        <option value="intl-consult">International Consulting</option>
                        <option value="intl-adm">International Admissions</option>
                      </>
                    ) : (
                      <>
                        <option value="career">Career Guidance</option>
                        <option value="academy">School Student Academy</option>
                        <option value="college">College Admission Assistance</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-gold-500 font-semibold cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    {isHrLead && <option value="New">New / Unassigned</option>}
                    <option value="Assigned">Assigned (Active)</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* HR Lead Selection Controls ONLY */}
              {isHrLead && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-navy-800 text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleSelectAllCurrentPage}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800 font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer text-[11px]"
                    >
                      Select Page ({paginatedEnquiries.length})
                    </button>
                    {selectedEnquiryIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedEnquiryIds([])}
                        className="px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold transition cursor-pointer text-[11px]"
                      >
                        Clear Selection ({selectedEnquiryIds.length})
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Selected: <strong className="text-gold-500 font-mono">{selectedEnquiryIds.length}</strong> enquiries
                  </div>
                </div>
              )}
            </div>

            {/* ENQUIRIES TABLE */}
            <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-navy-950 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-navy-800">
                    <tr>
                      {/* Checkbox column ONLY rendered for HR Lead */}
                      {isHrLead && (
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={paginatedEnquiries.length > 0 && paginatedEnquiries.every(e => selectedEnquiryIds.includes(e.id))}
                            onChange={handleSelectAllCurrentPage}
                            className="rounded border-slate-300 text-gold-500 focus:ring-gold-500 cursor-pointer"
                          />
                        </th>
                      )}
                      <th className="p-3 whitespace-nowrap">Reference ID</th>
                      <th className="p-3 whitespace-nowrap">Candidate Name</th>
                      <th className="p-3 whitespace-nowrap">Phone Number</th>
                      <th className="p-3 whitespace-nowrap">Email Address</th>
                      <th className="p-3 whitespace-nowrap">Enquiry Service</th>
                      <th className="p-3 whitespace-nowrap">Priority & Assigned Date</th>
                      <th className="p-3 whitespace-nowrap">Status</th>
                      <th className="p-3 min-w-[200px]">HR Lead Instructions</th>
                      {isHrLead && (
                        <th className="p-3 whitespace-nowrap">Assigned To</th>
                      )}
                      <th className="p-3 text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    {paginatedEnquiries.length === 0 ? (
                      <tr>
                        <td colSpan={isHrLead ? 11 : 9} className="p-10 text-center text-slate-400 space-y-2">
                          <AlertCircle className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                          <div className="font-bold text-sm text-slate-700 dark:text-slate-300">
                            {isHrOperations 
                              ? `No enquiries assigned to you in ${operationTab === 'intl-ops' ? 'International HR Operations' : 'Enquiry HR Operations'}.`
                              : 'No enquiries found matching your search or filters.'}
                          </div>
                          {isHrOperations && (
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                              When the HR Lead assigns enquiries to you, they will appear in this work queue with pointed instructions and due dates.
                            </p>
                          )}
                        </td>
                      </tr>
                    ) : (
                      paginatedEnquiries.map((enq) => {
                        const isSelected = selectedEnquiryIds.includes(enq.id);
                        return (
                          <tr 
                            key={enq.id}
                            className={`transition duration-150 ${
                              isSelected 
                                ? 'bg-gold-500/10 dark:bg-gold-500/15' 
                                : 'hover:bg-slate-50/80 dark:hover:bg-navy-800/40'
                            }`}
                          >
                            {/* Checkbox cell ONLY for HR Lead */}
                            {isHrLead && (
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectOne(enq.id)}
                                  className="rounded border-slate-300 text-gold-500 focus:ring-gold-500 cursor-pointer"
                                />
                              </td>
                            )}

                            {/* 1. Reference ID */}
                            <td className="p-3 whitespace-nowrap">
                              <span className="font-mono text-xs font-bold text-gold-600 dark:text-gold-400">
                                {enq.referenceNumber || (enq.id ? (enq.id.startsWith('#') ? enq.id : `#${enq.id}`) : '—')}
                              </span>
                            </td>

                            {/* 2. Candidate Name */}
                            <td className="p-3 whitespace-nowrap">
                              <div className="font-bold text-slate-900 dark:text-white text-xs">
                                {enq.name || 'Candidate'}
                              </div>
                              {enq.country && (
                                <div className="text-[10px] text-slate-400 font-medium">
                                  {enq.country}
                                </div>
                              )}
                            </td>

                            {/* 3. Phone Number */}
                            <td className="p-3 whitespace-nowrap font-mono text-xs">
                              {enq.phone ? (
                                <a href={`tel:${enq.phone}`} className="hover:text-gold-500 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 group">
                                  <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0 group-hover:scale-110 transition" />
                                  <span>{enq.phone}</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">—</span>
                              )}
                            </td>

                            {/* 4. Email Address */}
                            <td className="p-3 font-mono text-xs">
                              {enq.email ? (
                                <a href={`mailto:${enq.email}`} className="hover:text-gold-500 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 truncate max-w-[210px] group" title={enq.email}>
                                  <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0 group-hover:scale-110 transition" />
                                  <span className="truncate">{enq.email}</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">—</span>
                              )}
                            </td>

                            {/* Service / Source */}
                            <td className="p-3">
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                {enq.serviceTitle || enq.serviceName || 'Academic Enquiry'}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                                {enq.courseName || enq.streamName || enq.country || enq.countryInterest || 'General'}
                              </div>
                            </td>

                            {/* Priority & Assigned Date */}
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                                  enq.priority === 'Urgent'
                                    ? 'bg-red-500 text-white'
                                    : enq.priority === 'High'
                                    ? 'bg-amber-500 text-navy-950 font-bold'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                }`}>
                                  {enq.priority || 'Normal'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-1">
                                {enq.assignedDate ? new Date(enq.assignedDate).toLocaleDateString() : (enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : 'Recent')}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="p-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                enq.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300'
                                  : enq.status === 'Assigned'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-300'
                                  : enq.status === 'In Progress'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300'
                              }`}>
                                {enq.status}
                              </span>
                            </td>

                            {/* 8. HR Lead Instructions */}
                            <td className="p-3 max-w-[240px]">
                              <div className="p-2 rounded-lg bg-amber-50 dark:bg-navy-950/80 border border-amber-200/80 dark:border-navy-700 text-[11px] text-slate-700 dark:text-slate-300 leading-tight">
                                <span className="font-bold text-amber-700 dark:text-gold-400">📌 </span>
                                <span className="line-clamp-2">{enq.assignmentNotes || enq.notes || 'Follow up with candidate regarding enquiry details.'}</span>
                              </div>
                            </td>

                            {/* 9. Assigned To (Rendered for HR Lead) */}
                            {isHrLead && (
                              <td className="p-3 whitespace-nowrap">
                                {enq.assignedEmployee ? (
                                  <div className="flex items-center space-x-1.5">
                                    <div className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold text-[10px]">
                                      {enq.assignedEmployee.charAt(0)}
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white text-[11px] truncate max-w-[130px]">
                                      {enq.assignedEmployee}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                                )}
                              </td>
                            )}

                            {/* Actions Column */}
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedCandidateModal(enq)}
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition cursor-pointer"
                                  title="View Full Enquiry Dossier"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStatusUpdateModalLead(enq);
                                    setStatusNewVal(enq.status || 'In Progress');
                                    setStatusNoteText('');
                                  }}
                                  className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition cursor-pointer flex items-center gap-1 shadow-xs"
                                  title="Update Status / Log Notes"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Status</span>
                                </button>

                                {enq.status !== 'Completed' && (
                                  <button
                                    type="button"
                                    onClick={() => setCompletingTask(enq)}
                                    className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition cursor-pointer flex items-center gap-1 shadow-xs"
                                    title="Mark as Completed"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Done</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION BAR: 15 RECORDS PER PAGE */}
              <div className="p-3.5 bg-slate-50 dark:bg-navy-950 border-t border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-500 dark:text-slate-400 font-medium">
                  Showing <strong className="text-slate-900 dark:text-white">{filteredEnquiries.length === 0 ? 0 : (currentPage - 1) * RECORDS_PER_PAGE + 1}</strong> to <strong className="text-slate-900 dark:text-white">{Math.min(currentPage * RECORDS_PER_PAGE, filteredEnquiries.length)}</strong> of <strong className="text-slate-900 dark:text-white">{filteredEnquiries.length}</strong> enquiries (15 / page)
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-navy-800 transition cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setCurrentPage(pg)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                        currentPage === pg
                          ? 'bg-gold-500 text-navy-950 shadow-xs'
                          : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-800'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-navy-800 transition cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TASK ASSIGNMENT MODAL / POP-UP PANEL (Available to HR Lead, Super Admin, Admin) */}
      {isAssignModalOpen && isAuthorizedToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`bg-white dark:bg-navy-900 border rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto relative ${
            operationTab === 'intl-ops'
              ? 'border-blue-500/40 ring-1 ring-blue-500/20'
              : 'border-emerald-500/40 ring-1 ring-emerald-500/20'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide text-white ${
                    operationTab === 'intl-ops' ? 'bg-blue-600' : 'bg-emerald-600'
                  }`}>
                    Flowchart Action
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {operationTab === 'intl-ops' ? 'Branch A' : 'Branch B'}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                  Assign to {operationTab === 'intl-ops' ? 'International HR Operations' : 'Enquiry HR Operations'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {operationTab === 'intl-ops'
                    ? 'Show only International HR Operations team members, select an HR member, point out instructions, and click Send / Assign.'
                    : 'Show only Enquiry HR Operations team members, select an HR member, point out instructions, and click Send / Assign.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Enquiry Counter Alert */}
            {selectedEnquiryIds.length === 0 ? (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="font-bold">No enquiries currently selected</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Select enquiries using table checkboxes, or click below to select all on this page.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSelectAllCurrentPage}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs shrink-0 cursor-pointer shadow-xs transition"
                >
                  Select Page ({paginatedEnquiries.length})
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-gold-500/15 text-gold-700 dark:text-gold-300 border border-gold-500/30 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0" />
                  <span>Selected for Assignment:</span>
                  <span className="font-mono text-sm px-2.5 py-0.5 rounded-lg bg-navy-950 text-gold-400 font-extrabold">
                    {selectedEnquiryIds.length} {selectedEnquiryIds.length === 1 ? 'enquiry' : 'enquiries'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEnquiryIds([])}
                  className="text-red-500 hover:text-red-600 text-xs font-semibold cursor-pointer underline"
                >
                  Clear Selection
                </button>
              </div>
            )}

            {/* Assignment Form */}
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              {/* 1. Team Member Dropdown (Only Team for this Branch) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Select HR Specialist:</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({activeTeamList.length} members in branch)
                  </span>
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  <option value="">-- Choose Branch Specialist --</option>
                  {activeTeamList.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} — {member.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Priority Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900 dark:text-white">
                  Task Priority Level:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Normal', 'High', 'Urgent'].map((pri) => (
                    <button
                      key={pri}
                      type="button"
                      onClick={() => setSelectedPriority(pri)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        selectedPriority === pri
                          ? pri === 'Urgent'
                            ? 'bg-red-600 text-white border-red-500 shadow-xs'
                            : pri === 'High'
                            ? 'bg-amber-500 text-navy-950 border-amber-400 shadow-xs'
                            : 'bg-blue-600 text-white border-blue-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-navy-800'
                      }`}
                    >
                      {pri}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Pointed-out Specific Instructions */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <span>📌 Point-out Instructions to HR Specialist:</span>
                  </label>
                  <span className="text-[10px] text-gold-600 dark:text-gold-400 font-bold">Point out notes</span>
                </div>
                <textarea
                  rows={4}
                  value={assignmentInstructions}
                  onChange={(e) => setAssignmentInstructions(e.target.value)}
                  placeholder="Point out specific instructions for this specialist (e.g. Call candidate today by 3 PM, verify IELTS score, prepare document checklist...)"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-gold-500 resize-none"
                />

                {/* Quick presets (Only for Branch A: International HR Operations) */}
                {operationTab === 'intl-ops' && (
                  <div className="space-y-1 pt-1">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Quick Presets:</div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPresetInstruction('Call on IELTS deadline and prepare university application dossier.')}
                        className="px-2 py-1 rounded text-[10px] bg-slate-100 dark:bg-navy-950 hover:bg-gold-500 hover:text-navy-950 text-slate-700 dark:text-slate-300 transition cursor-pointer border border-slate-200 dark:border-navy-800"
                      >
                        📞 Call on IELTS Deadline
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetInstruction('Verify attested degree certificates and police clearance certificate.')}
                        className="px-2 py-1 rounded text-[10px] bg-slate-100 dark:bg-navy-950 hover:bg-gold-500 hover:text-navy-950 text-slate-700 dark:text-slate-300 transition cursor-pointer border border-slate-200 dark:border-navy-800"
                      >
                        📝 Degree &amp; Police Clearance
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetInstruction('Coordinate 1-on-1 Zoom counseling session with senior admissions counselor.')}
                        className="px-2 py-1 rounded text-[10px] bg-slate-100 dark:bg-navy-950 hover:bg-gold-500 hover:text-navy-950 text-slate-700 dark:text-slate-300 transition cursor-pointer border border-slate-200 dark:border-navy-800"
                      >
                        💻 Zoom Counseling
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Click Send / Assign */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="w-1/3 py-3 px-4 rounded-xl font-bold text-xs border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigningLoading || selectedEnquiryIds.length === 0 || !selectedMemberId}
                  className={`w-2/3 py-3 px-4 rounded-xl font-bold text-xs tracking-wide text-white transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg cursor-pointer ${
                    selectedEnquiryIds.length === 0 || !selectedMemberId
                      ? 'opacity-50 cursor-not-allowed bg-slate-400 dark:bg-navy-700 text-slate-200'
                      : operationTab === 'intl-ops'
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20'
                      : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {assigningLoading
                      ? 'Assigning...'
                      : selectedEnquiryIds.length === 0
                      ? 'Select Enquiries First'
                      : !selectedMemberId
                      ? 'Choose Specialist'
                      : `Click Send / Assign (${selectedEnquiryIds.length})`}
                  </span>
                </button>
              </div>
            </form>

            {/* Flowchart step indicator (Only for International HR Operations) */}
            {operationTab === 'intl-ops' && (
              <div className="pt-2 border-t border-slate-100 dark:border-navy-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Enquiries assigned &amp; updated in CRM</span>
                </div>
                <div>Enquiries are linked to the selected HR specialist with your custom pointed instructions.</div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* VIEW FOR TRACKER TAB */}
      {operationTab === 'tracker' && (
        <div className="space-y-6">
          
          {/* Tracker Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
                <span>{isHrLead ? 'Total Assigned Tasks' : 'My Assigned Work'}</span>
                <Layers className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {allAssignedTasks.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{isHrLead ? 'Across all branches' : 'Assigned by HR Lead'}</div>
            </div>

            <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
                <span>In Progress / Action Needed</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                {isHrLead ? totalPendingTasks : myPendingCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Awaiting completion</div>
            </div>

            <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
                <span>Completed Tasks</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {isHrLead ? totalCompletedTasks : myCompletedCount}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Finished &amp; verified</div>
            </div>

            <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
                <span>Completion Rate</span>
                <CheckSquare className="w-4 h-4 text-gold-500" />
              </div>
              <div className="text-2xl font-bold text-gold-600 dark:text-gold-400 font-mono">
                {allAssignedTasks.length > 0 ? Math.round(((isHrLead ? totalCompletedTasks : myCompletedCount) / allAssignedTasks.length) * 100) : 0}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Operational SLA</div>
            </div>
          </div>

          {/* Filter Sub-Tabs & Specialist Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800">
            {/* Status Pills */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTrackerFilterStatus('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  trackerFilterStatus === 'all'
                    ? 'bg-gold-500 text-navy-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                All Tasks ({allAssignedTasks.length})
              </button>
              <button
                onClick={() => setTrackerFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  trackerFilterStatus === 'pending'
                    ? 'bg-amber-500 text-navy-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                In Progress ({isHrLead ? totalPendingTasks : myPendingCount})
              </button>
              <button
                onClick={() => setTrackerFilterStatus('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  trackerFilterStatus === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                Completed Tasks ({isHrLead ? totalCompletedTasks : myCompletedCount})
              </button>
            </div>

            {/* Specialist Dropdown (HR Lead only) */}
            {isHrLead && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Assigned To:</span>
                <select
                  value={trackerMemberFilter}
                  onChange={(e) => setTrackerMemberFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-gold-500 font-semibold cursor-pointer"
                >
                  <option value="all">All Specialists</option>
                  {[...INTL_HR_OPERATIONS_TEAM, ...ENQUIRY_HR_OPERATIONS_TEAM].map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* TASK CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTrackerTasks.length === 0 ? (
              <div className="col-span-2 p-12 text-center bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 text-slate-400 space-y-2">
                <CheckSquare className="w-8 h-8 mx-auto opacity-50" />
                <div className="font-bold text-sm">No tasks in this category</div>
                <div className="text-xs">
                  {isHrOperations 
                    ? 'Tasks assigned to you by the HR Lead will appear here with instructions and action buttons.'
                    : 'Tasks assigned via Branch A or Branch B will appear here with pointed-out instructions.'}
                </div>
              </div>
            ) : (
              filteredTrackerTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`glass-card p-5 rounded-2xl border transition duration-200 space-y-3.5 shadow-sm ${
                    task.status === 'Completed'
                      ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 hover:border-gold-500/40'
                  }`}
                >
                  {/* Top Row: Candidate + Reference + Priority */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {task.name}
                        </h4>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-black uppercase font-mono ${
                          task.priority === 'Urgent'
                            ? 'bg-red-500 text-white'
                            : task.priority === 'High'
                            ? 'bg-amber-500 text-navy-950'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {task.priority || 'Normal'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {task.referenceNumber} • {task.country}
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      task.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-300'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  {/* Service Badge & Assignment Info */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-navy-800/80">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      {isIntlSource(task) ? <Globe className="w-3.5 h-3.5 text-blue-500" /> : <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />}
                      <span>{task.serviceTitle}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Assigned: {task.assignedDate ? new Date(task.assignedDate).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  {/* POINTED-OUT INSTRUCTIONS HIGHLIGHT BOX */}
                  <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-gold-500/10 border border-amber-500/30 dark:border-gold-500/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-gold-400">
                      <span>📌 Lead's Pointed Instructions:</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      "{task.assignmentNotes || 'Contact student and follow up on documentation readiness.'}"
                    </p>
                  </div>

                  {/* Assigned Specialist & Completion Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-navy-800/80">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold text-xs">
                        {(task.assignedEmployee || 'S').charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {task.assignedEmployee || 'Assigned Specialist'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isIntlSource(task) ? 'International HR Ops' : 'Enquiry HR Ops'}
                        </div>
                      </div>
                    </div>

                    {/* Completion Action */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCandidateModal(task)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 font-semibold text-xs transition cursor-pointer"
                      >
                        Details
                      </button>

                      {task.status === 'Completed' ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>Finished</span>
                          </span>
                          <button
                            onClick={() => handleReopenTask(task.id)}
                            className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-white underline cursor-pointer"
                          >
                            Reopen
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCompletingTask(task)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-sm hover:scale-[1.02]"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Completed</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Completion Note if Completed */}
                  {task.status === 'Completed' && task.completionNote && (
                    <div className="text-[11px] p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                      ✓ Resolution: {task.completionNote}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* MODAL 1: VIEW CANDIDATE PROFILE & DETAILS (Employee & Lead) */}
      {selectedCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-luxury space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-navy-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500 to-amber-600 text-navy-950 flex items-center justify-center font-bold text-lg shadow-gold-glow">
                  {selectedCandidateModal.name ? selectedCandidateModal.name.charAt(0) : 'C'}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                    {selectedCandidateModal.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                    <span>{selectedCandidateModal.referenceNumber || `#${selectedCandidateModal.id}`}</span>
                    <span>•</span>
                    <span className="font-sans font-semibold text-emerald-600 dark:text-emerald-400">
                      {selectedCandidateModal.status}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCandidateModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Contact & Profile Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</div>
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`mailto:${selectedCandidateModal.email}`} className="hover:text-gold-500">
                    {selectedCandidateModal.email || '—'}
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone / WhatsApp</div>
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`tel:${selectedCandidateModal.phone}`} className="hover:text-gold-500">
                    {selectedCandidateModal.phone || '—'}
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Service Source</div>
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {isIntlSource(selectedCandidateModal) ? <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" /> : <GraduationCap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  <span>{selectedCandidateModal.serviceTitle || selectedCandidateModal.serviceName || 'Academic Consultation'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Country / Location</div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {selectedCandidateModal.country || selectedCandidateModal.countryInterest || 'Global / Open'}
                </div>
              </div>
            </div>

            {/* Academic & Target Course Details */}
            {(selectedCandidateModal.courseName || selectedCandidateModal.streamName || selectedCandidateModal.programLevel) && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs space-y-2">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Academic Target</div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCandidateModal.courseName && (
                    <div>
                      <span className="text-slate-400">Selected Course: </span>
                      <strong className="text-gold-500">{selectedCandidateModal.courseName}</strong>
                    </div>
                  )}
                  {selectedCandidateModal.streamName && (
                    <div>
                      <span className="text-slate-400">Department / Stream: </span>
                      <strong className="text-slate-900 dark:text-white">{selectedCandidateModal.streamName}</strong>
                    </div>
                  )}
                  {selectedCandidateModal.programLevel && (
                    <div>
                      <span className="text-slate-400">Academic Level: </span>
                      <strong className="text-slate-900 dark:text-white">{selectedCandidateModal.programLevel}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* HR Lead Instructions & Notes */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-gold-500/10 border border-amber-200 dark:border-gold-500/30 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-amber-800 dark:text-gold-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <span>📌 HR Lead Pointed Instructions</span>
                </span>
                <span className="text-[10px] font-mono uppercase bg-amber-200 dark:bg-gold-500/20 px-2 py-0.5 rounded text-amber-900 dark:text-gold-300">
                  Priority: {selectedCandidateModal.priority || 'Normal'}
                </span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                "{selectedCandidateModal.assignmentNotes || selectedCandidateModal.notes || 'Contact candidate and follow up on inquiry specifications.'}"
              </p>
              <div className="text-[10px] text-slate-400 pt-1">
                Assigned by: <strong>{selectedCandidateModal.assignedBy || 'HR Lead'}</strong> • {selectedCandidateModal.assignedDate ? new Date(selectedCandidateModal.assignedDate).toLocaleString() : 'Recent'}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-navy-800">
              <button
                type="button"
                onClick={() => setSelectedCandidateModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const candidate = selectedCandidateModal;
                    setSelectedCandidateModal(null);
                    setStatusUpdateModalLead(candidate);
                    setStatusNewVal(candidate.status || 'In Progress');
                    setStatusNoteText('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Status &amp; Notes</span>
                </button>

                {selectedCandidateModal.status !== 'Completed' && (
                  <button
                    type="button"
                    onClick={() => {
                      const candidate = selectedCandidateModal;
                      setSelectedCandidateModal(null);
                      setCompletingTask(candidate);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE STATUS & LOG FOLLOW-UP NOTES (Employee & Lead) */}
      {statusUpdateModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-blue-500/40 rounded-2xl max-w-lg w-full p-6 shadow-luxury space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-blue-500" />
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  Update Enquiry Status &amp; Log Follow-up
                </h3>
              </div>
              <button 
                onClick={() => setStatusUpdateModalLead(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">
                Candidate: {statusUpdateModalLead.name} ({statusUpdateModalLead.referenceNumber || `#${statusUpdateModalLead.id}`})
              </div>
              <div className="text-slate-500">
                Service: {statusUpdateModalLead.serviceTitle} • Assigned to: {statusUpdateModalLead.assignedEmployee}
              </div>
            </div>

            <form onSubmit={handleSaveStatusUpdate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900 dark:text-white">
                  Update Permitted Status:
                </label>
                <select
                  value={statusNewVal}
                  onChange={(e) => setStatusNewVal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Assigned">Assigned (In Queue)</option>
                  <option value="In Progress">In Progress (Under Review)</option>
                  <option value="Contacted">Contacted / Call Completed</option>
                  <option value="Follow-up Required">Follow-up Required</option>
                  <option value="Consultation Scheduled">Consultation Scheduled</option>
                  <option value="Qualified">Qualified / Proposal Pending</option>
                  <option value="Completed">Completed &amp; Closed</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900 dark:text-white">
                  Add Interaction / Follow-up Notes:
                </label>
                <textarea
                  rows={4}
                  value={statusNoteText}
                  onChange={(e) => setStatusNoteText(e.target.value)}
                  placeholder="Record discussion summary, candidate feedback, verified documents, or next action steps..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setStatusUpdateModalLead(null)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Status &amp; Notes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MARK TASK COMPLETED */}
      {completingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 shadow-luxury space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  Mark Task as Completed
                </h3>
              </div>
              <button 
                onClick={() => setCompletingTask(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">
                Candidate: {completingTask.name} ({completingTask.referenceNumber || `#${completingTask.id}`})
              </div>
              <div className="text-slate-500">
                Service: {completingTask.serviceTitle} • Assigned to: {completingTask.assignedEmployee}
              </div>
              <div className="text-amber-700 dark:text-gold-400 font-medium pt-1">
                📌 Lead's Instruction: "{completingTask.assignmentNotes || completingTask.notes || 'Follow up with candidate.'}"
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Resolution / Completion Notes:
              </label>
              <textarea
                rows={3}
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                placeholder="Enter completion details (e.g. Called candidate, verified attested certificates, scheduled Zoom counseling session...)"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none font-medium"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCompletingTask(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCompleteTask(completingTask.id)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirm &amp; Mark Completed</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CrmHrTaskAssignment;
