import React, { useState, useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import {
  Globe, GraduationCap, Compass, Plane, CheckSquare, Search, Filter, 
  Send, UserCheck, CheckCircle2, Clock, AlertCircle, ArrowRight, 
  ChevronLeft, ChevronRight, Sparkles, ShieldCheck, ShieldAlert,
  Calendar, Phone, Mail, MessageSquare, Tag, Eye, RefreshCw,
  FileText, Check, AlertTriangle, Layers, BookOpen, School, X
} from 'lucide-react';

// Team members strictly classified by operation as defined in the flowchart
export const INTL_HR_OPERATIONS_TEAM = [
  { id: 'INTL-HR-101', name: 'Kavitha Sundaram', role: 'International HR Operations Specialist', email: 'kavitha.s@revivalcrm.com', activeTasks: 3, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  { id: 'INTL-HR-102', name: 'Arjun Venkatesh', role: 'Senior International Consultant', email: 'arjun.v@revivalcrm.com', activeTasks: 2, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'INTL-HR-103', name: 'Meenakshi Sundaram', role: 'GCC Admissions Coordinator', email: 'meenakshi.s@revivalcrm.com', activeTasks: 4, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
  { id: 'INTL-HR-104', name: 'Dr. Vigneshwaran K.', role: 'Middle East Operations Executive', email: 'vigneshwaran.k@revivalcrm.com', activeTasks: 1, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' }
];

export const ENQUIRY_HR_OPERATIONS_TEAM = [
  { id: 'ENQ-HR-201', name: 'Balavarshini S.', role: 'Lead HR Operations Specialist', email: 'balavarshini.s@revivalcrm.com', activeTasks: 4, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'ENQ-HR-202', name: 'Chentamilselvi M.', role: 'HR Compliance & Verification Officer', email: 'chentamil.m@revivalcrm.com', activeTasks: 2, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { id: 'ENQ-HR-203', name: 'Sreeja K.', role: 'Academic Guidance Counselor', email: 'sreeja.k@revivalcrm.com', activeTasks: 3, avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80' },
  { id: 'ENQ-HR-204', name: 'Diviya R.', role: 'Senior Talent Acquisition Specialist', email: 'diviya.r@revivalcrm.com', activeTasks: 1, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' }
];

// Default baseline enquiries to ensure 15 records per page pagination works immediately
const INITIAL_BASELINE_ENQUIRIES = [
  // Branch A: International HR Operations (intl-adm, intl-consult)
  { id: 'LEAD-INT-101', referenceNumber: 'REV-INT-2026-001', name: 'Dr. Saranya Alagappan', email: 'saranya.a@gmail.com', phone: '+91 98401 12345', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'United Arab Emirates', status: 'New', createdAt: '2026-11-08T10:30:00Z', notes: 'Consultation for Dubai Golden Visa executive portfolio.' },
  { id: 'LEAD-INT-102', referenceNumber: 'REV-INT-2026-002', name: 'Arunachalam V.', email: 'arunachalam.v@gmail.com', phone: '+91 98402 23456', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'United Kingdom', status: 'New', createdAt: '2026-11-08T11:15:00Z', notes: 'Senior civil project manager exploring GCC corporate mandates.' },
  { id: 'LEAD-INT-103', referenceNumber: 'REV-ADM-2026-003', name: 'Elavarasi R.', email: 'elavarasi.r@cloudtech.in', phone: '+91 98403 34567', serviceId: 'intl-adm', serviceTitle: 'International Admissions', country: 'Germany', status: 'New', createdAt: '2026-11-08T14:20:00Z', notes: 'MSc Computer Science application for University of Birmingham Dubai campus.' },
  { id: 'LEAD-INT-104', referenceNumber: 'REV-INT-2026-004', name: 'Zubair Ahmed Khan', email: 'zubair.ahmed@gmail.com', phone: '+91 98404 45678', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'Qatar', status: 'Assigned', assignedEmployee: 'Kavitha Sundaram', priority: 'High', assignmentNotes: '📌 Urgent: Verify attested degree copies & police clearance for GCC residency.', assignedDate: '2026-11-07T09:00:00Z', createdAt: '2026-11-07T08:00:00Z' },
  { id: 'LEAD-INT-105', referenceNumber: 'REV-ADM-2026-005', name: 'Karthik Subburaj', email: 'karthik.subburaj@gmail.com', phone: '+91 97890 87654', serviceId: 'intl-adm', serviceTitle: 'International Admissions', country: 'India', status: 'Assigned', assignedEmployee: 'Arjun Venkatesh', priority: 'Normal', assignmentNotes: '📌 Call candidate to review IELTS scorecard and Spring 2027 university intake deadlines.', assignedDate: '2026-11-07T11:30:00Z', createdAt: '2026-11-07T10:00:00Z' },
  { id: 'LEAD-INT-106', referenceNumber: 'REV-INT-2026-006', name: 'Nandhini Soundararajan', email: 'nandhini.s@gmail.com', phone: '+91 98405 56789', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'Saudi Arabia', status: 'New', createdAt: '2026-11-06T15:45:00Z', notes: 'Medical consultancy licensing in Abu Dhabi Department of Health.' },
  { id: 'LEAD-INT-107', referenceNumber: 'REV-ADM-2026-007', name: 'Ahmed Farooq M.', email: 'ahmed.farooq@gmail.com', phone: '+91 98406 67890', serviceId: 'intl-adm', serviceTitle: 'International Admissions', country: 'United Arab Emirates', status: 'New', createdAt: '2026-11-06T16:10:00Z', notes: 'Undergraduate business analytics admissions guidance.' },
  { id: 'LEAD-INT-108', referenceNumber: 'REV-INT-2026-008', name: 'Chandrasekar M.', email: 'chandru.m@gmail.com', phone: '+91 98407 78901', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'Oman', status: 'New', createdAt: '2026-11-05T09:15:00Z', notes: 'Renewable energy engineering consultancy in Saudi NEOM sector.' },
  { id: 'LEAD-INT-109', referenceNumber: 'REV-ADM-2026-009', name: 'Priya Sundaram', email: 'priya.sundaram@gmail.com', phone: '+91 98401 55667', serviceId: 'intl-adm', serviceTitle: 'International Admissions', country: 'India', status: 'New', createdAt: '2026-11-05T11:40:00Z', notes: 'MBBS international pathway counseling for European medical universities.' },
  { id: 'LEAD-INT-110', referenceNumber: 'REV-INT-2026-010', name: 'Harish Narayanan', email: 'harish.narayan@gmail.com', phone: '+91 98408 89012', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'Kuwait', status: 'New', createdAt: '2026-11-05T13:00:00Z', notes: 'Petrochemical plant senior project director executive relocation.' },
  { id: 'LEAD-INT-111', referenceNumber: 'REV-ADM-2026-011', name: 'Meenakshi Sridharan', email: 'meenakshi.sri@gmail.com', phone: '+91 98409 90123', serviceId: 'intl-adm', serviceTitle: 'International Admissions', country: 'Singapore', status: 'New', createdAt: '2026-11-04T10:20:00Z', notes: 'Artificial Intelligence postgraduate research program admission.' },
  { id: 'LEAD-INT-112', referenceNumber: 'REV-INT-2026-012', name: 'Mukundhan S.', email: 'mukundhan.s@gmail.com', phone: '+91 98410 01234', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'United Kingdom', status: 'New', createdAt: '2026-11-04T12:30:00Z', notes: 'DIFC financial regulatory advisory and dual residency consultation.' },
  { id: 'LEAD-INT-113', referenceNumber: 'REV-ADM-2026-013', name: 'Rohan Deshmukh', email: 'rohan.deshmukh@gmail.com', phone: '+91 99201 33445', serviceId: 'intl-adm', serviceTitle: 'International Admissions', country: 'India', status: 'New', createdAt: '2026-11-03T16:00:00Z', notes: 'Aerospace engineering bachelor admissions in Canada & Australia.' },
  { id: 'LEAD-INT-114', referenceNumber: 'REV-INT-2026-014', name: 'Fathima Banu', email: 'fathima.banu@gmail.com', phone: '+91 98411 12345', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'Qatar', status: 'New', createdAt: '2026-11-03T17:15:00Z', notes: 'Family office wealth governance and European golden visa.' },
  { id: 'LEAD-INT-115', referenceNumber: 'REV-ADM-2026-015', name: 'Ananya Roy', email: 'ananya.roy@calcuttauniv.in', phone: '+91 98310 99887', serviceId: 'intl-adm', serviceTitle: 'International Admissions', country: 'India', status: 'New', createdAt: '2026-11-02T11:00:00Z', notes: 'Public Health policy masters program in London School of Hygiene.' },
  { id: 'LEAD-INT-116', referenceNumber: 'REV-INT-2026-016', name: 'Sai Prashanth K.', email: 'sai.prashanth@gmail.com', phone: '+91 98412 23456', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'United Arab Emirates', status: 'Completed', assignedEmployee: 'Kavitha Sundaram', priority: 'High', assignmentNotes: 'Verify port logistics consultancy credentials.', completionNote: 'Consultancy dossier verified and signed off with MOHRE compliance.', completedDate: '2026-11-06T14:00:00Z', createdAt: '2026-11-01T09:00:00Z' },
  { id: 'LEAD-INT-117', referenceNumber: 'REV-ADM-2026-017', name: 'Farhan Siddiqui', email: 'farhan.s@gmail.com', phone: '+91 98413 34567', serviceId: 'intl-adm', serviceTitle: 'International Admissions', country: 'Ireland', status: 'New', createdAt: '2026-11-01T12:00:00Z', notes: 'Biomedical engineering masters application in Ireland.' },
  { id: 'LEAD-INT-118', referenceNumber: 'REV-INT-2026-018', name: 'Charulatha D.', email: 'charulatha.d@gmail.com', phone: '+33 6 12 34 56 78', serviceId: 'intl-consult', serviceTitle: 'International Consulting', country: 'France', status: 'New', createdAt: '2026-10-31T14:30:00Z', notes: 'Luxury retail architecture consultancy licensing in Riyadh.' },

  // Branch B: Enquiry HR Operations (school-career, school-academy, college-adm)
  { id: 'LEAD-ENQ-201', referenceNumber: 'REV-CAR-2026-001', name: 'Arunmozhi Varman', email: 'arunmozhi.v@gmail.com', phone: '+91 98401 22334', serviceId: 'school-career', serviceTitle: 'Career Guidance', country: 'India', status: 'New', createdAt: '2026-11-08T09:30:00Z', notes: 'Grade 10 stream selection counseling (Bio-Math vs Computer Science).' },
  { id: 'LEAD-ENQ-202', referenceNumber: 'REV-ACA-2026-002', name: 'Kavitha Ramachandran', email: 'kavitha.ram@yahoo.com', phone: '+91 94441 55667', serviceId: 'school-academy', serviceTitle: 'School Student Academy', country: 'India', status: 'New', createdAt: '2026-11-08T10:45:00Z', notes: 'NEET 2027 integrated coaching cohort enrollment enquiry.' },
  { id: 'LEAD-ENQ-203', referenceNumber: 'REV-COL-2026-003', name: 'Pooja Ramakrishnan', email: 'pooja.ram@yahoo.com', phone: '+91 98401 23456', serviceId: 'college-adm', serviceTitle: 'College Admission Assistance', country: 'India', status: 'Assigned', assignedEmployee: 'Balavarshini S.', priority: 'High', assignmentNotes: '📌 Review board exam cut-off and coordinate university quota counseling with parents.', assignedDate: '2026-11-07T10:00:00Z', createdAt: '2026-11-07T08:30:00Z' },
  { id: 'LEAD-ENQ-204', referenceNumber: 'REV-CAR-2026-004', name: 'Siddharth Iyer', email: 'siddharth.iyer@gmail.com', phone: '+91 98840 99881', serviceId: 'school-career', serviceTitle: 'Career Guidance', country: 'India', status: 'New', createdAt: '2026-11-07T14:00:00Z', notes: 'Comprehensive psychometric aptitude assessment and engineering roadmap.' },
  { id: 'LEAD-ENQ-205', referenceNumber: 'REV-ACA-2026-005', name: 'Naveen Kumar M.', email: 'naveen.m@rediffmail.com', phone: '+91 97909 11223', serviceId: 'school-academy', serviceTitle: 'School Student Academy', country: 'India', status: 'New', createdAt: '2026-11-06T11:20:00Z', notes: 'JEE Mains & Advanced foundation weekend academy for 11th standard.' },
  { id: 'LEAD-ENQ-206', referenceNumber: 'REV-COL-2026-006', name: 'Deepa Narayanan', email: 'deepa.narayanan@gmail.com', phone: '+91 98410 44556', serviceId: 'college-adm', serviceTitle: 'College Admission Assistance', country: 'India', status: 'New', createdAt: '2026-11-06T13:40:00Z', notes: 'B.Tech Artificial Intelligence & Data Science admission in Anna University affiliated colleges.' },
  { id: 'LEAD-ENQ-207', referenceNumber: 'REV-CAR-2026-007', name: 'Gautam Raghavan', email: 'gautam.r@outlook.com', phone: '+91 98402 77889', serviceId: 'school-career', serviceTitle: 'Career Guidance', country: 'India', status: 'New', createdAt: '2026-11-05T10:15:00Z', notes: 'Law entrance CLAT coaching and humanities stream planning.' },
  { id: 'LEAD-ENQ-208', referenceNumber: 'REV-ACA-2026-008', name: 'Shreya Venkatesh', email: 'shreya.v@gmail.com', phone: '+91 94450 33445', serviceId: 'school-academy', serviceTitle: 'School Student Academy', country: 'India', status: 'New', createdAt: '2026-11-05T15:00:00Z', notes: 'Olympiad mathematics & science training for 8th standard student.' },
  { id: 'LEAD-ENQ-209', referenceNumber: 'REV-COL-2026-009', name: 'Manish Tiwari', email: 'manish.tiwari@gmail.com', phone: '+91 97110 55667', serviceId: 'college-adm', serviceTitle: 'College Admission Assistance', country: 'India', status: 'New', createdAt: '2026-11-04T09:45:00Z', notes: 'B.Com / BBA Honours in top tier private management institutes.' },
  { id: 'LEAD-ENQ-210', referenceNumber: 'REV-CAR-2026-010', name: 'Harini Sundar', email: 'harini.sundar@yahoo.co.in', phone: '+91 98841 22339', serviceId: 'school-career', serviceTitle: 'Career Guidance', country: 'India', status: 'Assigned', assignedEmployee: 'Chentamilselvi M.', priority: 'Normal', assignmentNotes: '📌 Administer career assessment test & draft recommendation dossier.', assignedDate: '2026-11-04T11:00:00Z', createdAt: '2026-11-04T10:00:00Z' },
  { id: 'LEAD-ENQ-211', referenceNumber: 'REV-ACA-2026-011', name: 'Vigneshwaran P.', email: 'vignesh.p@gmail.com', phone: '+91 99400 88776', serviceId: 'school-academy', serviceTitle: 'School Student Academy', country: 'India', status: 'New', createdAt: '2026-11-03T14:15:00Z', notes: 'CUET preparation batch for Central University entrance.' },
  { id: 'LEAD-ENQ-212', referenceNumber: 'REV-COL-2026-012', name: 'Aakash Bhattacharya', email: 'aakash.b@gmail.com', phone: '+91 98301 44556', serviceId: 'college-adm', serviceTitle: 'College Admission Assistance', country: 'India', status: 'New', createdAt: '2026-11-03T16:30:00Z', notes: 'Direct lateral entry B.E. Mechanical Engineering admission assistance.' },
  { id: 'LEAD-ENQ-213', referenceNumber: 'REV-CAR-2026-013', name: 'Lavanya Chandran', email: 'lavanya.c@gmail.com', phone: '+91 98403 66778', serviceId: 'school-career', serviceTitle: 'Career Guidance', country: 'India', status: 'New', createdAt: '2026-11-02T10:30:00Z', notes: 'Design careers counseling (NID, NIFT, UCEED entrance guidance).' },
  { id: 'LEAD-ENQ-214', referenceNumber: 'REV-ACA-2026-014', name: 'Rithvik Sriram', email: 'rithvik.s@gmail.com', phone: '+91 94444 11223', serviceId: 'school-academy', serviceTitle: 'School Student Academy', country: 'India', status: 'New', createdAt: '2026-11-02T13:00:00Z', notes: 'CBSE 10th board crash course and science doubt clearance.' },
  { id: 'LEAD-ENQ-215', referenceNumber: 'REV-COL-2026-015', name: 'Sneha Patel', email: 'sneha.patel@gujarattech.in', phone: '+91 98250 99881', serviceId: 'college-adm', serviceTitle: 'College Admission Assistance', country: 'India', status: 'New', createdAt: '2026-11-01T15:20:00Z', notes: 'B.Pharm and allied healthcare courses admission counseling.' },
  { id: 'LEAD-ENQ-216', referenceNumber: 'REV-CAR-2026-016', name: 'Rahul Varma', email: 'rahul.varma@gmail.com', phone: '+91 98400 77112', serviceId: 'school-career', serviceTitle: 'Career Guidance', country: 'India', status: 'Completed', assignedEmployee: 'Balavarshini S.', priority: 'Normal', assignmentNotes: 'Conduct stream selection aptitude test.', completionNote: 'Aptitude assessment completed. Recommended PCM with Computer Science stream.', completedDate: '2026-11-05T16:30:00Z', createdAt: '2026-10-31T09:00:00Z' },
  { id: 'LEAD-ENQ-217', referenceNumber: 'REV-ACA-2026-017', name: 'Tarun Prasanna', email: 'tarun.p@gmail.com', phone: '+91 97899 44332', serviceId: 'school-academy', serviceTitle: 'School Student Academy', country: 'India', status: 'New', createdAt: '2026-10-30T11:00:00Z', notes: 'Robotics and STEM school club weekend batch.' }
];

export const CrmHrTaskAssignment = () => {
  const { currentRole, user, leads = [], updateLead } = useCrm();

  // Role verification (Flowchart: Is user HR Lead? No -> Access Denied)
  const isHrLead = currentRole === 'HR Lead' || currentRole === 'Super Admin' || currentRole === 'Admin' || currentRole === 'HR Operations';
  
  // Storage key for persisting assignment state across refresh
  const STORAGE_KEY = 'revival_hr_task_assignments_v2';

  // Indian names sanitizer to dynamically clean any cached / legacy local data
  const sanitizeIndianNames = (items) => {
    const NAME_MAP = {
      'Fatima Al Zahra': 'Kavitha Sundaram',
      'John Reynolds': 'Arjun Venkatesh',
      'Ayesha Siddiqua': 'Meenakshi Sundaram',
      'Tariq Mansoor': 'Dr. Vigneshwaran K.',
      'Dr. Sarah Al-Mansoori': 'Dr. Saranya Alagappan',
      'Alexander Wright': 'Arunachalam V.',
      'Elena Rostova': 'Elavarasi R.',
      'Zubair Al Mansoor': 'Zubair Ahmed Khan',
      'Nadia El-Sayed': 'Nandhini Soundararajan',
      'Ahmed Bin Rashid': 'Ahmed Farooq M.',
      'Carlos Mendez': 'Chandrasekar M.',
      'Hassan Al-Nuaimi': 'Harish Narayanan',
      'Mei-Ling Chen': 'Meenakshi Sridharan',
      'Marcus Sterling': 'Mukundhan S.',
      'Fatima Al-Kuwari': 'Fathima Banu',
      'Saeed Al-Mutawa': 'Sai Prashanth K.',
      'Farhan Zaidi': 'Farhan Siddiqui',
      'Chloe Dubois': 'Charulatha D.'
    };

    return items.map(item => {
      let updated = { ...item };
      if (NAME_MAP[updated.assignedEmployee]) {
        updated.assignedEmployee = NAME_MAP[updated.assignedEmployee];
      }
      if (NAME_MAP[updated.name]) {
        updated.name = NAME_MAP[updated.name];
      }
      return updated;
    });
  };

  // Load custom stored leads or initialize with baseline
  const [taskData, setTaskData] = useState(() => {
    try {
      const savedV2 = localStorage.getItem('revival_hr_task_assignments_v2');
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) return sanitizeIndianNames(parsed);
      }
      const savedV1 = localStorage.getItem('revival_hr_task_assignments_v1');
      if (savedV1) {
        const parsed = JSON.parse(savedV1);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = sanitizeIndianNames(parsed);
          localStorage.setItem('revival_hr_task_assignments_v2', JSON.stringify(sanitized));
          return sanitized;
        }
      }
    } catch (e) {}
    return INITIAL_BASELINE_ENQUIRIES;
  });

  // Current Operation Tab matching Flowchart Branches
  // 'intl-ops' = International HR Operations (Branch A)
  // 'enq-ops'  = Enquiry HR Operations (Branch B)
  // 'tracker'  = Live Task Progress & Completion Tracker ("point out panni annupura mari ... completed nu podra mari")
  const [operationTab, setOperationTab] = useState('intl-ops');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');

  // Multi-selection checkboxes
  const [selectedEnquiryIds, setSelectedEnquiryIds] = useState([]);

  // Assignment Modal / Panel State
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('High');
  const [assignmentInstructions, setAssignmentInstructions] = useState('');
  const [assigningLoading, setAssigningLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  // Pagination: 15 records per page strictly as stated in flowchart
  const RECORDS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);

  // Completion modal state
  const [completingTask, setCompletingTask] = useState(null);
  const [completionNote, setCompletionNote] = useState('');
  const [trackerFilterStatus, setTrackerFilterStatus] = useState('all'); // 'all' | 'pending' | 'completed'
  const [trackerMemberFilter, setTrackerMemberFilter] = useState('all');

  // Sync to localStorage whenever taskData changes
  const saveTasks = (newTasks) => {
    setTaskData(newTasks);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    } catch (e) {}
  };

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

  // Filter enquiries for the active operation branch
  const branchEnquiries = useMemo(() => {
    if (operationTab === 'intl-ops') {
      return taskData.filter(isIntlSource);
    } else if (operationTab === 'enq-ops') {
      return taskData.filter(isEnquirySource);
    }
    return taskData;
  }, [taskData, operationTab]);

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
        if (selectedStatus === 'New' && item.status !== 'New') return false;
        if (selectedStatus === 'Assigned' && item.status !== 'Assigned') return false;
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

  // Handle single enquiry selection
  const handleToggleSelectOne = (id) => {
    setSelectedEnquiryIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Handle Select All on current page
  const handleSelectAllCurrentPage = () => {
    const pageIds = paginatedEnquiries.map(e => e.id);
    const allSelected = pageIds.every(id => selectedEnquiryIds.includes(id));
    if (allSelected) {
      setSelectedEnquiryIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedEnquiryIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  // Handle Select All across all pages of current branch
  const handleSelectAllBranch = () => {
    setSelectedEnquiryIds(filteredEnquiries.map(e => e.id));
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedEnquiryIds([]);
  };

  // Team list for active branch
  const activeTeamList = operationTab === 'intl-ops' ? INTL_HR_OPERATIONS_TEAM : ENQUIRY_HR_OPERATIONS_TEAM;

  // Execute assignment to selected team member
  const handleAssignSubmit = (e) => {
    e.preventDefault();
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

    setTimeout(() => {
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
      setSuccessBanner(`✓ Successfully assigned ${selectedEnquiryIds.length} enquiries to ${assignedMember.name} (${assignedMember.role}) with specific instructions!`);
      setSelectedEnquiryIds([]);
      setAssignmentInstructions('');
      setSelectedMemberId('');

      setTimeout(() => setSuccessBanner(''), 7000);
    }, 600);
  };

  // Quick preset instruction pills
  const setPresetInstruction = (text) => {
    setAssignmentInstructions(text);
  };

  // Mark task completed handler ("complete naa completed nu podra mari")
  const handleCompleteTask = (taskId) => {
    const updated = taskData.map(item => {
      if (item.id === taskId) {
        return {
          ...item,
          status: 'Completed',
          completedDate: new Date().toISOString(),
          completionNote: completionNote || 'Task successfully resolved and verified by HR operations.'
        };
      }
      return item;
    });

    saveTasks(updated);
    setCompletingTask(null);
    setCompletionNote('');
    setSuccessBanner('✓ Task marked as Completed successfully! Updated in CRM records.');
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

  // Tracker tasks (All assigned and completed tasks)
  const allAssignedTasks = useMemo(() => {
    return taskData.filter(item => item.status === 'Assigned' || item.status === 'Completed');
  }, [taskData]);

  const filteredTrackerTasks = useMemo(() => {
    return allAssignedTasks.filter(item => {
      if (trackerFilterStatus === 'pending' && item.status !== 'Assigned') return false;
      if (trackerFilterStatus === 'completed' && item.status !== 'Completed') return false;
      if (trackerMemberFilter !== 'all' && item.assignedEmployee !== trackerMemberFilter) return false;
      return true;
    });
  }, [allAssignedTasks, trackerFilterStatus, trackerMemberFilter]);

  // Flowchart Metric Counts
  const intlTotalCount = taskData.filter(isIntlSource).length;
  const intlUnassignedCount = taskData.filter(e => isIntlSource(e) && e.status === 'New').length;
  const enqTotalCount = taskData.filter(isEnquirySource).length;
  const enqUnassignedCount = taskData.filter(e => isEnquirySource(e) && e.status === 'New').length;
  const totalCompletedTasks = taskData.filter(e => e.status === 'Completed').length;
  const totalPendingTasks = taskData.filter(e => e.status === 'Assigned').length;

  // Access Denied Screen (as per flowchart)
  if (!isHrLead) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-navy-900 rounded-3xl border border-red-500/30 text-center shadow-xl space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Task Assignment — Access Denied</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          As specified in the HR Operations Flowchart, the <strong>Task Assignment Module</strong> is strictly reserved for <strong>HR Lead</strong> and Administrative personnel.
        </p>
        <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-200 dark:border-navy-800 text-xs text-slate-500 text-left font-mono space-y-1">
          <div>• Required Role: HR Lead / Super Admin / Admin</div>
          <div>• Current Active Role: <span className="text-red-500 font-bold">{currentRole || 'Restricted'}</span></div>
          <div>• Flowchart Rule: If Not HR Lead ➔ Task Assignment Not Visible (Access Denied)</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-300">
      
      {/* FLOWCHART HEADER TITLE & EXECUTIVE SUMMARY */}
      <div className="glass-card bg-white dark:bg-navy-900/90 rounded-2xl p-6 border border-slate-200 dark:border-gold-500/30 shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-500 text-navy-950 shadow-xs">
              Flowchart Implementation
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Revival International CRM • Task Assignment Engine
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            HR Operations Task Assignment
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
            Choose operation branch (<strong>International HR Operations</strong> or <strong>Enquiry HR Operations</strong>), filter enquiries (15 per page), select candidates, point out specific instructions, and track live task completion.
          </p>
        </div>

        {/* Live Flowchart Status Counters */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
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

      {/* FLOWCHART BRANCH TABS: Choose Operation */}
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
          <span>Branch A: International HR Operations</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            operationTab === 'intl-ops' ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
          }`}>
            {intlTotalCount} Enquiries
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
          <span>Branch B: Enquiry HR Operations</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            operationTab === 'enq-ops' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
          }`}>
            {enqTotalCount} Enquiries
          </span>
        </button>

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
          <span>My Assigned Tasks & Completion Tracker</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-navy-950 text-gold-400">
            {allAssignedTasks.length} Active
          </span>
        </button>
      </div>

      {/* VIEW FOR BRANCH A & B: ENQUIRIES LIST (15 records per page) & ASSIGNMENT PANEL */}
      {operationTab !== 'tracker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 8 COLS: ENQUIRIES LIST TABLE */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Branch Summary & Filter Toolbar */}
            <div className="bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {operationTab === 'intl-ops' ? (
                      <>
                        <Globe className="w-4 h-4 text-blue-500" />
                        <span>View Enquiries List — International HR Operations</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-4 h-4 text-emerald-500" />
                        <span>View Enquiries List — Enquiry HR Operations</span>
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
                  </p>
                </div>

                {/* Selection status */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800 font-mono">
                    {selectedEnquiryIds.length} of {filteredEnquiries.length} selected
                  </span>
                  {selectedEnquiryIds.length > 0 && (
                    <button 
                      onClick={handleClearSelection}
                      className="text-[11px] text-red-600 dark:text-red-400 hover:underline font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-navy-800/80">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search candidate, phone, ref..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-gold-500"
                  />
                </div>

                {/* Service Filter */}
                <select
                  value={selectedService}
                  onChange={(e) => { setSelectedService(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-gold-500 font-semibold cursor-pointer"
                >
                  <option value="all">All Services</option>
                  {operationTab === 'intl-ops' ? (
                    <>
                      <option value="intl-adm">International Admissions</option>
                      <option value="intl-consult">International Consulting</option>
                    </>
                  ) : (
                    <>
                      <option value="career">Career Guidance</option>
                      <option value="academy">School Student Academy</option>
                      <option value="college">College Admission Assistance</option>
                    </>
                  )}
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-gold-500 font-semibold cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="New">New / Unassigned</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Quick Select Actions */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleSelectAllCurrentPage}
                    className="text-[11px] font-bold text-gold-600 dark:text-gold-400 hover:underline cursor-pointer"
                  >
                    Select All on Page ({paginatedEnquiries.length})
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={handleSelectAllBranch}
                    className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:underline cursor-pointer"
                  >
                    Select All Filtered ({filteredEnquiries.length})
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  15 records / page
                </span>
              </div>
            </div>

            {/* ENQUIRIES TABLE */}
            <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-navy-950 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-navy-800">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={paginatedEnquiries.length > 0 && paginatedEnquiries.every(e => selectedEnquiryIds.includes(e.id))}
                          onChange={handleSelectAllCurrentPage}
                          className="rounded border-slate-300 text-gold-500 focus:ring-gold-500 cursor-pointer"
                        />
                      </th>
                      <th className="p-3">Reference & Candidate</th>
                      <th className="p-3">Enquiry Service</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Assigned To</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    {paginatedEnquiries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                          No enquiries found matching your search or filters.
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
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectOne(enq.id)}
                                className="rounded border-slate-300 text-gold-500 focus:ring-gold-500 cursor-pointer"
                              />
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{enq.name}</span>
                                {enq.priority === 'High' && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-100 dark:bg-red-950/60 text-red-600 font-bold border border-red-300 dark:border-red-800">
                                    High
                                  </span>
                                )}
                              </div>
                              <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                                {enq.referenceNumber} • {enq.phone}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {enq.serviceTitle}
                              </span>
                              <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                                {enq.country}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                enq.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300'
                                  : enq.status === 'Assigned'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300'
                              }`}>
                                {enq.status}
                              </span>
                            </td>
                            <td className="p-3">
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
                            <td className="p-3 text-[11px] text-slate-400 font-mono">
                              {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : 'Recent'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION BAR: 15 RECORDS PER PAGE (Flowchart mandate) */}
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

          {/* RIGHT 4 COLS: ASSIGN TO OPERATION TEAM PANEL (Matching Flowchart) */}
          <div className="lg:col-span-4 space-y-4">
            <div className={`rounded-2xl p-5 border shadow-luxury space-y-4 ${
              operationTab === 'intl-ops'
                ? 'bg-white dark:bg-navy-900 border-blue-500/40 ring-1 ring-blue-500/20'
                : 'bg-white dark:bg-navy-900 border-emerald-500/40 ring-1 ring-emerald-500/20'
            }`}>
              
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
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                  Assign to {operationTab === 'intl-ops' ? 'International HR Operations' : 'Enquiry HR Operations'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {operationTab === 'intl-ops'
                    ? 'Show only International HR Operations team members, select an HR member, point out instructions, and click Send / Assign.'
                    : 'Show only Enquiry HR Operations team members, select an HR member, point out instructions, and click Send / Assign.'}
                </p>
              </div>

              {/* Selected Enquiry Counter Alert */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                selectedEnquiryIds.length > 0 
                  ? 'bg-gold-500/15 text-gold-700 dark:text-gold-300 border-gold-500/30' 
                  : 'bg-slate-50 dark:bg-navy-950 text-slate-500 border-slate-200 dark:border-navy-800'
              }`}>
                <span>Selected for Assignment:</span>
                <span className="font-mono text-sm px-2 py-0.5 rounded-lg bg-navy-950 text-gold-400">
                  {selectedEnquiryIds.length} enquiries
                </span>
              </div>

              <form onSubmit={handleAssignSubmit} className="space-y-3.5">
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
                        {member.name} — {member.role} ({member.activeTasks} active)
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

                {/* 3. Pointed-out Specific Instructions (User prompt: "point out panni annupura mari") */}
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

                  {/* Clickable Preset Instructions for Quick Assignment */}
                  <div className="space-y-1 pt-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quick Presets:</div>
                    <div className="flex flex-wrap gap-1">
                      {operationTab === 'intl-ops' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setPresetInstruction('Urgent: Call candidate immediately to review IELTS score and Spring 2027 university intake deadlines.')}
                            className="px-2 py-1 rounded text-[10px] bg-slate-100 dark:bg-navy-950 hover:bg-gold-500 hover:text-navy-950 text-slate-700 dark:text-slate-300 transition cursor-pointer border border-slate-200 dark:border-navy-800"
                          >
                            📞 Call on IELTS Deadline
                          </button>
                          <button
                            type="button"
                            onClick={() => setPresetInstruction('Verify attested degree certificates & police clearance for GCC residency licensing dossier.')}
                            className="px-2 py-1 rounded text-[10px] bg-slate-100 dark:bg-navy-950 hover:bg-gold-500 hover:text-navy-950 text-slate-700 dark:text-slate-300 transition cursor-pointer border border-slate-200 dark:border-navy-800"
                          >
                            📑 Degree & Police Clearance
                          </button>
                          <button
                            type="button"
                            onClick={() => setPresetInstruction('Schedule Zoom counseling session with parents and send course fee structure.')}
                            className="px-2 py-1 rounded text-[10px] bg-slate-100 dark:bg-navy-950 hover:bg-gold-500 hover:text-navy-950 text-slate-700 dark:text-slate-300 transition cursor-pointer border border-slate-200 dark:border-navy-800"
                          >
                            💻 Zoom Counseling
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setPresetInstruction('Conduct psychometric stream selection aptitude test and review with parents.')}
                            className="px-2 py-1 rounded text-[10px] bg-slate-100 dark:bg-navy-950 hover:bg-emerald-500 hover:text-navy-950 text-slate-700 dark:text-slate-300 transition cursor-pointer border border-slate-200 dark:border-navy-800"
                          >
                            🧭 Aptitude Assessment
                          </button>
                          <button
                            type="button"
                            onClick={() => setPresetInstruction('Confirm 12th board cut-off marks and verify engineering college seat quota.')}
                            className="px-2 py-1 rounded text-[10px] bg-slate-100 dark:bg-navy-950 hover:bg-emerald-500 hover:text-navy-950 text-slate-700 dark:text-slate-300 transition cursor-pointer border border-slate-200 dark:border-navy-800"
                          >
                            🎓 College Quota Check
                          </button>
                          <button
                            type="button"
                            onClick={() => setPresetInstruction('Enroll candidate in NEET/JEE weekend academy foundation batch.')}
                            className="px-2 py-1 rounded text-[10px] bg-slate-100 dark:bg-navy-950 hover:bg-emerald-500 hover:text-navy-950 text-slate-700 dark:text-slate-300 transition cursor-pointer border border-slate-200 dark:border-navy-800"
                          >
                            🏫 Academy Enrollment
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Click Send / Assign (Matching Flowchart) */}
                <button
                  type="submit"
                  disabled={assigningLoading || selectedEnquiryIds.length === 0}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wide text-white transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg cursor-pointer ${
                    operationTab === 'intl-ops'
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50'
                      : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {assigningLoading ? 'Assigning...' : `Click Send / Assign (${selectedEnquiryIds.length})`}
                  </span>
                </button>
              </form>

              {/* Flowchart step indicator */}
              <div className="pt-2 border-t border-slate-100 dark:border-navy-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Enquiries assigned & updated in CRM</span>
                </div>
                <div>Enquiries are linked to the selected HR specialist with your custom pointed instructions.</div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* VIEW FOR TRACKER TAB: "asign panrangalo avangalukku task show aaganum point out panni annupura mari apram enna enna mudichirukanga complete naa completed nu podra mari" */}
      {operationTab === 'tracker' && (
        <div className="space-y-6">
          
          {/* Tracker Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
                <span>Total Assigned Tasks</span>
                <Layers className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {allAssignedTasks.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Across all branches</div>
            </div>

            <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
                <span>In Progress / Action Needed</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                {totalPendingTasks}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Awaiting completion</div>
            </div>

            <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
                <span>Completed Tasks</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {totalCompletedTasks}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Finished & verified</div>
            </div>

            <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
                <span>Completion Rate</span>
                <CheckSquare className="w-4 h-4 text-gold-500" />
              </div>
              <div className="text-2xl font-bold text-gold-600 dark:text-gold-400 font-mono">
                {allAssignedTasks.length > 0 ? Math.round((totalCompletedTasks / allAssignedTasks.length) * 100) : 0}%
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
                In Progress ({totalPendingTasks})
              </button>
              <button
                onClick={() => setTrackerFilterStatus('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  trackerFilterStatus === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                Completed Tasks ({totalCompletedTasks})
              </button>
            </div>

            {/* Specialist Dropdown */}
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
          </div>

          {/* TASK CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTrackerTasks.length === 0 ? (
              <div className="col-span-2 p-12 text-center bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 text-slate-400 space-y-2">
                <CheckSquare className="w-8 h-8 mx-auto opacity-50" />
                <div className="font-bold text-sm">No tasks in this category</div>
                <div className="text-xs">Tasks assigned via Branch A or Branch B will appear here with pointed-out instructions.</div>
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

                  {/* POINTED-OUT INSTRUCTIONS HIGHLIGHT BOX ("point out panni annupura mari") */}
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

                    {/* Completion Action ("complete naa completed nu podra mari") */}
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

      {/* MARK TASK COMPLETED MODAL ("complete naa completed nu podra mari") */}
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
                Candidate: {completingTask.name} ({completingTask.referenceNumber})
              </div>
              <div className="text-slate-500">
                Service: {completingTask.serviceTitle} • Assigned to: {completingTask.assignedEmployee}
              </div>
              <div className="text-amber-700 dark:text-gold-400 font-medium pt-1">
                📌 Lead's Instruction: "{completingTask.assignmentNotes}"
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
                <span>Confirm & Mark Completed</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CrmHrTaskAssignment;

