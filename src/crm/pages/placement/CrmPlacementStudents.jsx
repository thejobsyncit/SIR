import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  GraduationCap, Search, Filter, Plus, FileText, Download, 
  CheckCircle2, Clock, Mail, Phone, ExternalLink, Star, Award, Building2 
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmPlacementStudents = () => {
  const [students, setStudents] = useState([
    {
      id: 'STU-101',
      name: 'Rohan Deshmukh',
      rollNo: '22CS104',
      course: 'B.Tech Computer Science',
      department: 'CSE',
      batch: '2022 - 2026',
      cgpa: 9.15,
      backlogs: 0,
      skills: ['React', 'Node.js', 'Python', 'AWS', 'DSA'],
      resumeUrl: '#',
      resumeVerified: true,
      email: 'rohan.deshmukh@velsuniv.ac.in',
      phone: '+91 98401 22334',
      status: 'Placed',
      placedCompany: 'TechVision International',
      ctc: '9,500 SGD / mo'
    },
    {
      id: 'STU-102',
      name: 'Ananya Sundaram',
      rollNo: '22CV045',
      course: 'B.E Civil Engineering',
      department: 'Civil',
      batch: '2022 - 2026',
      cgpa: 8.80,
      backlogs: 0,
      skills: ['AutoCAD', 'Primavera P6', 'Revit', 'Structural Analysis'],
      resumeUrl: '#',
      resumeVerified: true,
      email: 'ananya.sundaram@velsuniv.ac.in',
      phone: '+91 97890 44556',
      status: 'Placed',
      placedCompany: 'Al Habtoor Contracting',
      ctc: '18,000 AED / mo'
    },
    {
      id: 'STU-103',
      name: 'Mohammed Tariq',
      rollNo: '22ME089',
      course: 'B.E Mechanical Engineering',
      department: 'Mechanical',
      batch: '2022 - 2026',
      cgpa: 8.45,
      backlogs: 0,
      skills: ['SolidWorks', 'HVAC Design', 'Ansys', 'Thermodynamics'],
      resumeUrl: '#',
      resumeVerified: true,
      email: 'mohammed.tariq@velsuniv.ac.in',
      phone: '+91 94440 66778',
      status: 'Offered',
      placedCompany: 'L&T Construction',
      ctc: '11.5 LPA'
    },
    {
      id: 'STU-104',
      name: 'Divya Krishnan',
      rollNo: '22EC012',
      course: 'B.Tech Electronics & Comm',
      department: 'ECE',
      batch: '2022 - 2026',
      cgpa: 7.95,
      backlogs: 1,
      skills: ['Embedded C', 'IoT', 'VLSI', 'MATLAB'],
      resumeUrl: '#',
      resumeVerified: false,
      email: 'divya.krishnan@velsuniv.ac.in',
      phone: '+91 98840 88990',
      status: 'In Screening',
      placedCompany: '-',
      ctc: '-'
    },
    {
      id: 'STU-105',
      name: 'Karthik Subramanian',
      rollNo: '22IT078',
      course: 'B.Tech Information Technology',
      department: 'IT',
      batch: '2022 - 2026',
      cgpa: 8.65,
      backlogs: 0,
      skills: ['Java Spring Boot', 'Docker', 'Kubernetes', 'SQL'],
      resumeUrl: '#',
      resumeVerified: true,
      email: 'karthik.sub@velsuniv.ac.in',
      phone: '+91 98402 77889',
      status: 'Shortlisted',
      placedCompany: 'TechVision International',
      ctc: 'Interview Round 2'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = !searchQuery || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.skills.some(sk => sk.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = deptFilter === 'all' || s.department.toLowerCase() === deptFilter.toLowerCase();
    return matchesSearch && matchesDept;
  });

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Top Command Banner (Super Admin Style) */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Placement Suite • Feature #2
              </span>
              <span className="text-[10px] font-mono text-slate-400">BATCH 2022-2026</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Student Profile Management
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Maintain student details, course, department, batch, marks, skills, resume and contact information.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
              ● Real-Time Sync Active
            </span>
            <button
              onClick={() => showToast('Student registration form opened')}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {toastMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in">
            {toastMsg}
          </div>
        )}

        {/* 4 Super Admin Style KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Registered Students</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">284</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">↗ Active Graduating Batch</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Resume Verified</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">248</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↗ Certified Portfolios</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Placed Students</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center border border-purple-100 dark:border-purple-800">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">68</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-1 block">↗ Highest Package: 18k AED</span>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-5 shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Verification Pending</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center border border-amber-100 dark:border-amber-800">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-3">36</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ Action Required</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, roll number, or technical skill..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="CSE">Computer Science (CSE)</option>
              <option value="Civil">Civil Engineering</option>
              <option value="Mechanical">Mechanical</option>
              <option value="ECE">Electronics (ECE)</option>
              <option value="IT">Information Tech (IT)</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                  <th className="p-4 font-bold">Student Name & Roll No</th>
                  <th className="p-4 font-bold">Course & Dept</th>
                  <th className="p-4 font-bold text-center">Batch & CGPA</th>
                  <th className="p-4 font-bold">Technical Skills</th>
                  <th className="p-4 font-bold text-center">Resume</th>
                  <th className="p-4 font-bold text-center">Placement Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {filteredStudents.map(stu => (
                  <tr key={stu.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{stu.name}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{stu.rollNo} • {stu.phone}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{stu.course}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{stu.department}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-mono font-extrabold text-amber-700 dark:text-gold-400 text-xs block">{stu.cgpa} CGPA</span>
                      <span className="text-[10px] text-slate-400 font-mono">{stu.backlogs} Backlogs</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {stu.skills.map(sk => (
                          <span key={sk} className="px-2 py-0.5 bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 rounded text-[9px] font-semibold border border-slate-200 dark:border-navy-800">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        stu.resumeVerified 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200' 
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200'
                      }`}>
                        {stu.resumeVerified ? 'Verified ✓' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">{stu.status}</span>
                      {stu.placedCompany !== '-' && (
                        <span className="text-[10px] text-emerald-600 font-mono block">{stu.placedCompany}</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => showToast(`Resume downloaded for ${stu.name}`)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:text-gold-500 transition cursor-pointer"
                        title="Download CV"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
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

