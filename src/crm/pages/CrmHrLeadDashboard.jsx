import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  LayoutDashboard, Users, UserCheck, Clock, CheckCircle2, AlertCircle, ArrowUpRight, 
  Calendar, BarChart3, RefreshCw, Search, Filter, Phone, Mail, MessageSquare, 
  CheckSquare, ChevronRight, UserPlus, FileText, TrendingUp, CalendarCheck,
  CreditCard, DollarSign, Award, Bell, ShieldCheck, Download, Plus, X,
  Briefcase, Gift, Cake, ShieldAlert, HeartHandshake, Eye, EyeOff, FileSpreadsheet,
  Check, XCircle, Send, Sparkles, Building2, MapPin, Layers, Printer, CheckCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import ScrollReveal from '../../components/ScrollReveal';
import CrmHrTaskAssignment from '../components/CrmHrTaskAssignment';

export const CrmHrLeadDashboard = ({ initialSection }) => {
  const { candidates = [], setActiveModule, currentRole, crmToken } = useCrm();

  // Role check: Hide top HR module horizontal navigation bar for HR Lead, Admin, and Super Admin
  const hideTopHrNavBar = ['HR Lead', 'Admin', 'Super Admin'].includes(currentRole);

  // Helper to map route ID (e.g. 'hr-attendance') to internal tab id
  const getTabFromSection = (sec) => {
    switch (sec) {
      case 'tasks':
      case 'hr-tasks': return 'tasks';
      case 'hr-attendance': return 'attendance';
      case 'hr-leave': return 'leave';
      case 'hr-employees': return 'employees';
      case 'hr-performance': return 'performance';
      case 'hr-recruitment': return 'recruitment';
      case 'hr-payroll': return 'payroll';
      case 'hr-announcements': return 'announcements';
      case 'hr-shifts': return 'shifts';
      case 'hr-documents': return 'documents';
      case 'hr-grievances': return 'grievances';
      case 'hr-approvals': return 'approvals';
      case 'hr-reports': return 'reports';
      case 'hr-overview':
      default:
        return 'overview';
    }
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromSection(initialSection));
  const [toastMsg, setToastMsg] = useState('');
  const [maskSalary, setMaskSalary] = useState(true);
  const [searchEmployee, setSearchEmployee] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  // Sync tab when initialSection changes
  useEffect(() => {
    if (initialSection) {
      setActiveTab(getTabFromSection(initialSection));
    }
  }, [initialSection]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

<<<<<<< HEAD
  // Real SQLite Attendance Regularizations & HR Operations Team Attendance
  const [hrRegularizations, setHrRegularizations] = useState([]);
  const [hrTeamAttendance, setHrTeamAttendance] = useState([]);
  const [regCommentMap, setRegCommentMap] = useState({});
  const [reviewingRegId, setReviewingRegId] = useState('');

  const loadHrAttendanceData = async () => {
    if (!crmToken || !['HR Lead', 'Admin', 'Super Admin'].includes(currentRole)) return;
    try {
      const [regRes, teamRes] = await Promise.all([
        fetch('/api/hr/attendance/regularizations', {
          headers: { Authorization: `Bearer ${crmToken}` }
        }),
        fetch('/api/hr/attendance/team', {
          headers: { Authorization: `Bearer ${crmToken}` }
        })
      ]);
      const regJson = await regRes.json();
      const teamJson = await teamRes.json();
      if (regJson?.success && Array.isArray(regJson.data)) {
        setHrRegularizations(regJson.data);
      }
      if (teamJson?.success && Array.isArray(teamJson.data?.team)) {
        setHrTeamAttendance(teamJson.data.team);
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadHrAttendanceData();
  }, [crmToken, currentRole, activeTab]);

  const handleReviewRegularization = async (regId, decision) => {
    if (!crmToken) return;
    setReviewingRegId(regId);
    try {
      const comments = regCommentMap[regId] || '';
      const res = await fetch(`/api/hr/attendance/regularizations/${regId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${crmToken}`
        },
        body: JSON.stringify({ decision, comments })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.message || 'Review failed.');
      } else {
        showToast(json.message || `Regularization ${decision}.`);
        await loadHrAttendanceData();
      }
    } catch (err) {
      showToast(err.message || 'Unable to process regularization review.');
    } finally {
      setReviewingRegId('');
=======
  // Payroll Management States & Helpers
  const [generatingPdfId, setGeneratingPdfId] = useState(null);
  const [previewEmployee, setPreviewEmployee] = useState(null);
  const [payrollSearch, setPayrollSearch] = useState('');
  const [payrollDeptFilter, setPayrollDeptFilter] = useState('All');
  const [disbursementStatuses, setDisbursementStatuses] = useState({
    'REV-EMP-101': 'Ready',
    'REV-EMP-102': 'Ready',
    'REV-EMP-103': 'Ready',
    'REV-EMP-104': 'Ready',
    'REV-EMP-105': 'Ready',
    'REV-EMP-106': 'Ready',
    'REV-EMP-107': 'Ready',
    'REV-EMP-108': 'Ready'
  });

  const calculateSalaryBreakdown = (employee) => {
    const grossMonthly = parseInt(String(employee?.salary || '').replace(/[^\d]/g, ''), 10) || 55000;
    const basic = Math.round(grossMonthly * 0.50);
    const hra = Math.round(grossMonthly * 0.25);
    const conveyance = 2500;
    const medical = 1500;
    const specialAllowance = Math.max(0, grossMonthly - (basic + hra + conveyance + medical));
    
    const pf = Math.min(Math.round(basic * 0.12), 1800);
    const profTax = 200;
    const esi = grossMonthly <= 21000 ? Math.round(grossMonthly * 0.0075) : 0;
    const mediclaim = 500;
    const tds = grossMonthly > 60000 ? Math.round(grossMonthly * 0.05) : 0;
    
    const totalEarnings = grossMonthly;
    const totalDeductions = pf + profTax + esi + mediclaim + tds;
    const netPay = totalEarnings - totalDeductions;
    
    return {
      grossMonthly,
      basic,
      hra,
      conveyance,
      medical,
      specialAllowance,
      totalEarnings,
      pf,
      profTax,
      esi,
      mediclaim,
      tds,
      totalDeductions,
      netPay,
      payPeriod: 'November 1, 2026 – November 30, 2026',
      payDate: 'November 28, 2026',
      bankName: 'HDFC Bank Ltd',
      accountMasked: '•••• ' + (employee?.id ? String(employee.id).replace(/[^\d]/g, '').slice(-4) || '4892' : '4892'),
      uan: '101928374' + (employee?.id ? String(employee.id).replace(/[^\d]/g, '').slice(-3) || '650' : '650'),
      pan: 'ABCDE' + (employee?.id ? String(employee.id).replace(/[^\d]/g, '').padStart(4, '0') : '1010') + 'K',
      paidDays: 30,
      lossOfPay: 0
    };
  };

  const numberToWords = (num) => {
    if (!num || isNaN(num)) return 'Zero Rupees Only';
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
    };

    const words = inWords(Math.floor(num));
    return (words ? words.trim() : 'Zero') + ' Rupees Only';
  };

  const toggleEmployeeDisbursement = (empId) => {
    setDisbursementStatuses(prev => {
      const current = prev[empId] || 'Ready';
      const updated = current === 'Credited' ? 'Ready' : 'Credited';
      showToast(updated === 'Credited' ? `✓ Direct deposit marked as Credited for ${empId}` : `Direct deposit status reset to Ready for ${empId}`);
      return { ...prev, [empId]: updated };
    });
  };

  const handleRunAllPayroll = () => {
    const updated = {};
    employees.forEach(e => {
      updated[e.id] = 'Credited';
    });
    setDisbursementStatuses(updated);
    showToast('✓ November 2026 Payroll executed successfully! All salaries processed and credited via Direct Deposit.');
  };

  const handleDownloadPayslipPDF = (employee) => {
    if (!employee) return;
    setGeneratingPdfId(employee.id);
    try {
      const b = calculateSalaryBreakdown(employee);
      const doc = new jsPDF('portrait', 'mm', 'a4');
      const margin = 12;
      const pageWidth = 210;
      const contentWidth = pageWidth - (margin * 2);
      let y = 12;

      // Outer Card Border
      doc.setDrawColor(200, 205, 215);
      doc.setLineWidth(0.4);
      doc.rect(margin - 2, margin - 2, contentWidth + 4, 275);

      // 1. Company Header Banner
      doc.setFillColor(11, 27, 51); // Navy #0B1B33
      doc.rect(margin, y, contentWidth, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('THE REVIVAL INTERNATIONAL', margin + 6, y + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(198, 164, 92); // Gold #C6A45C
      doc.text('Global Executive Search, Manpower Recruitment & Enterprise HR Operations', margin + 6, y + 14);

      doc.setFontSize(7.5);
      doc.setTextColor(200, 210, 225);
      doc.text('India HQ: Chennai, Tamil Nadu • GCC HQ: Dubai, UAE • ISO 9001:2025 Certified', margin + 6, y + 19);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('ENTERPRISE PAYROLL', pageWidth - margin - 6, y + 10, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(198, 164, 92);
      doc.text('CONFIDENTIAL & PRIVATE', pageWidth - margin - 6, y + 16, { align: 'right' });

      y += 28;

      // 2. Payslip Title Bar
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 10, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('SALARY STATEMENT / PAYSLIP — NOVEMBER 2026', margin + 4, y + 6.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Ref: REV-PAY-2026-NOV-${employee.id}`, pageWidth - margin - 4, y + 6.5, { align: 'right' });

      y += 14;

      // 3. Employee & Bank Meta Grid
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, contentWidth, 34, 'FD');
      doc.line(margin + (contentWidth / 2), y, margin + (contentWidth / 2), y + 34);

      const leftX = margin + 4;
      const metaY = y + 6;
      doc.setFontSize(7.5);

      const renderMetaRow = (label, val, xPos, currentY) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(label, xPos, currentY);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`:  ${val}`, xPos + 28, currentY);
      };

      renderMetaRow('Employee Name', employee.name, leftX, metaY);
      renderMetaRow('Employee ID', employee.id, leftX, metaY + 6);
      renderMetaRow('Designation', employee.role, leftX, metaY + 12);
      renderMetaRow('Department', employee.department || 'HR Operations', leftX, metaY + 18);
      renderMetaRow('Location', employee.location || 'Chennai HQ', leftX, metaY + 24);

      const rightX = margin + (contentWidth / 2) + 4;
      renderMetaRow('Pay Period', b.payPeriod, rightX, metaY);
      renderMetaRow('Disbursement Date', b.payDate, rightX, metaY + 6);
      renderMetaRow('Bank & Account', `${b.bankName} (${b.accountMasked})`, rightX, metaY + 12);
      renderMetaRow('PAN / UAN', `${b.pan} / ${b.uan}`, rightX, metaY + 18);
      renderMetaRow('Paid / LOP Days', `${b.paidDays} Days / ${b.lossOfPay} Days`, rightX, metaY + 24);

      y += 38;

      // 4. Earnings & Deductions Table
      const halfWidth = contentWidth / 2;
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, halfWidth, 7, 'F');
      doc.rect(margin + halfWidth, y, halfWidth, 7, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('EARNINGS', margin + 4, y + 5);
      doc.text('AMOUNT (₹)', margin + halfWidth - 4, y + 5, { align: 'right' });
      doc.text('DEDUCTIONS', margin + halfWidth + 4, y + 5);
      doc.text('AMOUNT (₹)', margin + contentWidth - 4, y + 5, { align: 'right' });

      y += 7;

      const earningsItems = [
        ['Basic Salary', `₹${b.basic.toLocaleString('en-IN')}`],
        ['House Rent Allowance (HRA)', `₹${b.hra.toLocaleString('en-IN')}`],
        ['Special Executive Allowance', `₹${b.specialAllowance.toLocaleString('en-IN')}`],
        ['Conveyance & Transport', `₹${b.conveyance.toLocaleString('en-IN')}`],
        ['Medical Allowance', `₹${b.medical.toLocaleString('en-IN')}`]
      ];

      const deductionsItems = [
        ['Provident Fund (PF - 12%)', `₹${b.pf.toLocaleString('en-IN')}`],
        ['Professional Tax (PT)', `₹${b.profTax.toLocaleString('en-IN')}`],
        ['Group Health Mediclaim', `₹${b.mediclaim.toLocaleString('en-IN')}`],
        ['Tax Deducted at Source (TDS)', `₹${b.tds.toLocaleString('en-IN')}`],
        ['Statutory ESI / Other', `₹${b.esi.toLocaleString('en-IN')}`]
      ];

      const maxRows = Math.max(earningsItems.length, deductionsItems.length);
      doc.setFontSize(8);

      for (let i = 0; i < maxRows; i++) {
        const rowY = y + (i * 6.5);
        if (i % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, rowY, halfWidth, 6.5, 'F');
          doc.rect(margin + halfWidth, rowY, halfWidth, 6.5, 'F');
        }

        doc.setDrawColor(226, 232, 240);
        doc.line(margin + halfWidth, rowY, margin + halfWidth, rowY + 6.5);

        if (earningsItems[i]) {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          doc.text(earningsItems[i][0], margin + 4, rowY + 4.5);
          doc.setFont('helvetica', 'bold');
          doc.text(earningsItems[i][1], margin + halfWidth - 4, rowY + 4.5, { align: 'right' });
        }

        if (deductionsItems[i]) {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          doc.text(deductionsItems[i][0], margin + halfWidth + 4, rowY + 4.5);
          doc.setFont('helvetica', 'bold');
          doc.text(deductionsItems[i][1], margin + contentWidth - 4, rowY + 4.5, { align: 'right' });
        }
      }

      y += maxRows * 6.5;

      // Subtotals
      doc.setFillColor(238, 242, 246);
      doc.rect(margin, y, halfWidth, 8, 'F');
      doc.rect(margin + halfWidth, y, halfWidth, 8, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.line(margin, y, margin + contentWidth, y);
      doc.line(margin, y + 8, margin + contentWidth, y + 8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('TOTAL GROSS EARNINGS', margin + 4, y + 5.5);
      doc.text(`₹${b.totalEarnings.toLocaleString('en-IN')}`, margin + halfWidth - 4, y + 5.5, { align: 'right' });

      doc.text('TOTAL DEDUCTIONS', margin + halfWidth + 4, y + 5.5);
      doc.setTextColor(190, 18, 60);
      doc.text(`₹${b.totalDeductions.toLocaleString('en-IN')}`, margin + contentWidth - 4, y + 5.5, { align: 'right' });

      y += 13;

      // 5. Net Salary Callout Box
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.6);
      doc.rect(margin, y, contentWidth, 22, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(6, 95, 70);
      doc.text('NET SALARY PAYABLE (TAKE-HOME SALARY)', margin + 6, y + 6.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(4, 120, 87);
      doc.text(`₹ ${b.netPay.toLocaleString('en-IN')}`, pageWidth - margin - 6, y + 8, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 118, 110);
      doc.text(`In Words: ${numberToWords(b.netPay)}`, margin + 6, y + 13);

      doc.setFontSize(7.5);
      doc.setTextColor(5, 150, 105);
      doc.text(`Status: ✓ Direct Deposit Credited to Bank Account on Nov 28, 2026 (Ref: REV-DISB-${employee.id})`, margin + 6, y + 18.5);

      y += 28;

      // 6. Signatures and Declarations
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 38, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('EMPLOYER DECLARATION & NOTES:', margin + 4, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('1. All statutory taxes & employee contributions have been remitted to EPFO & State Authorities.', margin + 4, y + 12);
      doc.text('2. This salary statement is generated under Revival International HR & WPS automated payroll ledger.', margin + 4, y + 17);
      doc.text('3. For tax exemptions or investment declaration queries, submit a ticket under HR Grievances.', margin + 4, y + 22);
      doc.text('4. This document is authenticated electronically; no manual signature is required.', margin + 4, y + 27);

      const stampX = pageWidth - margin - 55;
      doc.setDrawColor(198, 164, 92);
      doc.setFillColor(254, 252, 248);
      doc.rect(stampX, y + 4, 50, 30, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(11, 27, 51);
      doc.text('THE REVIVAL INTERNATIONAL', stampX + 25, y + 9, { align: 'center' });

      doc.setFontSize(6.5);
      doc.setTextColor(198, 164, 92);
      doc.text('★ HR & FINANCE DIRECTORATE ★', stampX + 25, y + 14, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(16, 185, 129);
      doc.text('✓ DIGITALLY VERIFIED', stampX + 25, y + 22, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Authorized Signatory', stampX + 25, y + 30, { align: 'center' });

      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')} via Revival CRM Enterprise Edition • Confidential`, pageWidth / 2, 282, { align: 'center' });

      const filename = `Payslip_${employee.name.replace(/[^a-zA-Z0-9]/g, '_')}_Nov2026.pdf`;
      doc.save(filename);
      showToast(`✓ Official Payslip PDF downloaded for ${employee.name}`);
    } catch (err) {
      console.error('Payslip PDF error:', err);
      showToast(`⚠️ Could not generate PDF: ${err.message}`);
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const handleDownloadPayrollRegisterPDF = () => {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const margin = 10;
      const pageWidth = 297;
      let y = 14;

      doc.setFillColor(11, 27, 51);
      doc.rect(margin, y, pageWidth - (margin * 2), 18, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('THE REVIVAL INTERNATIONAL — MONTHLY PAYROLL REGISTER (NOVEMBER 2026)', margin + 6, y + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(198, 164, 92);
      doc.text('Official Disbursement Ledger Across All On-Roll Workforce • Certified WPS Compliant', margin + 6, y + 13.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin - 6, y + 11, { align: 'right' });

      y += 24;

      const cols = [
        { header: 'Emp ID', width: 25 },
        { header: 'Employee Name', width: 45 },
        { header: 'Department', width: 38 },
        { header: 'Designation', width: 55 },
        { header: 'Gross Pay', width: 28, align: 'right' },
        { header: 'Deductions', width: 28, align: 'right' },
        { header: 'Net Salary', width: 30, align: 'right' },
        { header: 'Status', width: 28 }
      ];

      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(margin, y + 8, pageWidth - margin, y + 8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);

      let currentX = margin + 3;
      cols.forEach(col => {
        const x = col.align === 'right' ? currentX + col.width - 6 : currentX;
        doc.text(col.header, x, y + 5.5, { align: col.align || 'left' });
        currentX += col.width;
      });

      y += 8;

      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;

      employees.forEach((emp, idx) => {
        const b = calculateSalaryBreakdown(emp);
        totalGross += b.totalEarnings;
        totalDeductions += b.totalDeductions;
        totalNet += b.netPay;

        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
        }

        doc.setDrawColor(241, 245, 249);
        doc.line(margin, y + 7, pageWidth - margin, y + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(51, 65, 85);

        const status = disbursementStatuses[emp.id] === 'Credited' ? 'Credited' : 'Direct Deposit Ready';

        currentX = margin + 3;
        doc.setFont('helvetica', 'bold');
        doc.text(emp.id, currentX, y + 4.8);
        currentX += cols[0].width;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(emp.name, currentX, y + 4.8);
        currentX += cols[1].width;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(emp.department || 'HR Operations', currentX, y + 4.8);
        currentX += cols[2].width;

        doc.text(emp.role.length > 28 ? emp.role.slice(0, 26) + '...' : emp.role, currentX, y + 4.8);
        currentX += cols[3].width;

        doc.text(`₹${b.totalEarnings.toLocaleString('en-IN')}`, currentX + cols[4].width - 6, y + 4.8, { align: 'right' });
        currentX += cols[4].width;

        doc.setTextColor(190, 18, 60);
        doc.text(`₹${b.totalDeductions.toLocaleString('en-IN')}`, currentX + cols[5].width - 6, y + 4.8, { align: 'right' });
        currentX += cols[5].width;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105);
        doc.text(`₹${b.netPay.toLocaleString('en-IN')}`, currentX + cols[6].width - 6, y + 4.8, { align: 'right' });
        currentX += cols[6].width;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(status === 'Credited' ? 5 : 180, status === 'Credited' ? 150 : 100, status === 'Credited' ? 105 : 20);
        doc.text(status, currentX, y + 4.8);

        y += 7;
      });

      doc.setFillColor(238, 242, 246);
      doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.line(margin, y, pageWidth - margin, y);
      doc.line(margin, y + 8, pageWidth - margin, y + 8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`TOTALS (${employees.length} EMPLOYEES)`, margin + 6, y + 5.5);

      const grossX = margin + 3 + cols[0].width + cols[1].width + cols[2].width + cols[3].width;
      doc.text(`₹${totalGross.toLocaleString('en-IN')}`, grossX + cols[4].width - 6, y + 5.5, { align: 'right' });

      const dedX = grossX + cols[4].width;
      doc.setTextColor(190, 18, 60);
      doc.text(`₹${totalDeductions.toLocaleString('en-IN')}`, dedX + cols[5].width - 6, y + 5.5, { align: 'right' });

      const netX = dedX + cols[5].width;
      doc.setTextColor(5, 150, 105);
      doc.text(`₹${totalNet.toLocaleString('en-IN')}`, netX + cols[6].width - 6, y + 5.5, { align: 'right' });

      doc.save('Revival_Payroll_Register_Nov2026.pdf');
      showToast(`✓ Monthly Payroll Register PDF downloaded for all ${employees.length} employees`);
    } catch (err) {
      showToast(`⚠️ Error: ${err.message}`);
>>>>>>> 4f03f08938b75da91e0e03dc4c53b73a44ab9d34
    }
  };

  // 1. EMPLOYEES DATA (Feature 1, 4)
  const [employees, setEmployees] = useState([
    {
      id: 'REV-EMP-101',
      name: 'Balavarshini S.',
      role: 'Lead HR Operations Specialist',
      department: 'HR Operations',
      email: 'balavarshini.s@revivalcrm.com',
      phone: '+91 98401 11201',
      joiningDate: '2023-04-15',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      location: 'Chennai HQ',
      avatarLetter: 'B',
      salary: '₹68,000 / mo',
      ctc: '₹8.16 LPA',
      leaveBalance: { casual: 6, sick: 7, paid: 12 },
      attendanceToday: { status: 'Present', checkIn: '08:52 AM', checkOut: '06:05 PM', late: false, hours: '9.2 hrs' }
    },
    {
      id: 'REV-EMP-102',
      name: 'Diviya R.',
      role: 'Senior Talent Acquisition Specialist',
      department: 'Talent Acquisition',
      email: 'diviya.r@revivalcrm.com',
      phone: '+91 98401 11202',
      joiningDate: '2023-08-01',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      location: 'Chennai HQ',
      avatarLetter: 'D',
      salary: '₹62,000 / mo',
      ctc: '₹7.44 LPA',
      leaveBalance: { casual: 5, sick: 8, paid: 14 },
      attendanceToday: { status: 'Present', checkIn: '09:08 AM', checkOut: '06:15 PM', late: true, hours: '9.1 hrs' }
    },
    {
      id: 'REV-EMP-103',
      name: 'Chentamilselvi M.',
      role: 'HR Compliance & Verification Officer',
      department: 'HR Operations',
      email: 'chentamil.m@revivalcrm.com',
      phone: '+91 98401 11203',
      joiningDate: '2024-01-10',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      location: 'Chennai HQ',
      avatarLetter: 'C',
      salary: '₹55,000 / mo',
      ctc: '₹6.60 LPA',
      leaveBalance: { casual: 7, sick: 6, paid: 10 },
      attendanceToday: { status: 'Present', checkIn: '08:58 AM', checkOut: '06:00 PM', late: false, hours: '9.0 hrs' }
    },
    {
      id: 'REV-EMP-104',
      name: 'Kishore Kumar',
      role: 'Senior Recruitment Partner (GCC & Tech)',
      department: 'Talent Acquisition',
      email: 'kishore.k@revivalcrm.com',
      phone: '+91 98401 11204',
      joiningDate: '2022-11-15',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      location: 'Bangalore Office',
      avatarLetter: 'K',
      salary: '₹85,000 / mo',
      ctc: '₹10.20 LPA',
      leaveBalance: { casual: 8, sick: 9, paid: 15 },
      attendanceToday: { status: 'Present', checkIn: '08:45 AM', checkOut: '06:20 PM', late: false, hours: '9.5 hrs' }
    },
    {
      id: 'REV-EMP-105',
      name: 'Sreeja Nair',
      role: 'Campus Placement & University Relations Head',
      department: 'Placement Cell',
      email: 'sreeja.n@revivalcrm.com',
      phone: '+91 98401 11205',
      joiningDate: '2023-02-01',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      location: 'Chennai HQ',
      avatarLetter: 'S',
      salary: '₹75,000 / mo',
      ctc: '₹9.00 LPA',
      leaveBalance: { casual: 4, sick: 5, paid: 11 },
      attendanceToday: { status: 'Present', checkIn: '09:14 AM', checkOut: '06:10 PM', late: true, hours: '8.9 hrs' }
    },
    {
      id: 'REV-EMP-106',
      name: 'Arjun Venkatesh',
      role: 'Full Stack Cloud Engineer',
      department: 'Engineering',
      email: 'arjun.v@revivalcrm.com',
      phone: '+91 98401 11206',
      joiningDate: '2024-03-01',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      location: 'Chennai HQ',
      avatarLetter: 'A',
      salary: '₹95,000 / mo',
      ctc: '₹11.40 LPA',
      leaveBalance: { casual: 6, sick: 6, paid: 9 },
      attendanceToday: { status: 'On Leave', checkIn: '-', checkOut: '-', late: false, hours: '0 hrs' }
    },
    {
      id: 'REV-EMP-107',
      name: 'Meenakshi Sundaram',
      role: 'Senior International Admissions Consultant',
      department: 'Client Advisory',
      email: 'meenakshi.s@revivalcrm.com',
      phone: '+91 98401 11207',
      joiningDate: '2024-06-15',
      status: 'Probation',
      employmentType: 'Probationary (6 Mos)',
      location: 'Chennai HQ',
      avatarLetter: 'M',
      salary: '₹58,000 / mo',
      ctc: '₹6.96 LPA',
      leaveBalance: { casual: 4, sick: 4, paid: 6 },
      attendanceToday: { status: 'Present', checkIn: '08:50 AM', checkOut: '06:05 PM', late: false, hours: '9.2 hrs' }
    },
    {
      id: 'REV-EMP-108',
      name: 'Dr. Vigneshwaran K.',
      role: 'Executive Career Advisor & Principal Mentor',
      department: 'Client Advisory',
      email: 'vignesh.k@revivalcrm.com',
      phone: '+91 98401 11208',
      joiningDate: '2022-05-10',
      status: 'Active',
      employmentType: 'Full-Time Permanent',
      location: 'Chennai HQ',
      avatarLetter: 'V',
      salary: '₹1,10,000 / mo',
      ctc: '₹13.20 LPA',
      leaveBalance: { casual: 9, sick: 10, paid: 16 },
      attendanceToday: { status: 'Absent', checkIn: '-', checkOut: '-', late: false, hours: '0 hrs' }
    }
  ]);

  // Modal for New Employee
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({
    name: '',
    role: '',
    department: 'HR Operations',
    email: '',
    phone: '',
    salary: '₹55,000 / mo',
    ctc: '₹6.60 LPA',
    employmentType: 'Full-Time Permanent'
  });

  const handleAddEmployeeSubmit = (e) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.email) return;
    const item = {
      id: `REV-EMP-${Math.floor(109 + Math.random() * 900)}`,
      name: newEmp.name,
      role: newEmp.role || 'HR Associate',
      department: newEmp.department,
      email: newEmp.email,
      phone: newEmp.phone || '+91 98401 00000',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      employmentType: newEmp.employmentType,
      location: 'Chennai HQ',
      avatarLetter: newEmp.name.charAt(0).toUpperCase(),
      salary: newEmp.salary,
      ctc: newEmp.ctc,
      leaveBalance: { casual: 8, sick: 8, paid: 12 },
      attendanceToday: { status: 'Present', checkIn: '09:00 AM', checkOut: 'In Office', late: false, hours: 'Active' }
    };
    setEmployees([item, ...employees]);
    setIsAddEmployeeOpen(false);
    setNewEmp({ name: '', role: '', department: 'HR Operations', email: '', phone: '', salary: '₹55,000 / mo', ctc: '₹6.60 LPA', employmentType: 'Full-Time Permanent' });
    showToast(`✓ Employee ${item.name} (${item.id}) added to workforce directory.`);
  };

  // 2. LEAVE REQUESTS STATE (Feature 3)
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 'LEV-501',
      employeeId: 'REV-EMP-106',
      name: 'Arjun Venkatesh',
      role: 'Full Stack Cloud Engineer',
      department: 'Engineering',
      type: 'Sick Leave',
      startDate: '2026-11-07',
      endDate: '2026-11-08',
      days: 2,
      reason: 'Viral fever and prescribed medical rest by physician.',
      submittedAt: 'Today at 07:30 AM',
      status: 'Pending HR Sign-off'
    },
    {
      id: 'LEV-502',
      employeeId: 'REV-EMP-102',
      name: 'Diviya R.',
      role: 'Senior Talent Acquisition Specialist',
      department: 'Talent Acquisition',
      type: 'Casual Leave',
      startDate: '2026-11-12',
      endDate: '2026-11-13',
      days: 2,
      reason: 'Family wedding function in Coimbatore.',
      submittedAt: 'Yesterday at 04:15 PM',
      status: 'Pending HR Sign-off'
    },
    {
      id: 'LEV-503',
      employeeId: 'REV-EMP-105',
      name: 'Sreeja Nair',
      role: 'Campus Placement Head',
      department: 'Placement Cell',
      type: 'Paid / Earned Leave',
      startDate: '2026-11-20',
      endDate: '2026-11-24',
      days: 5,
      reason: 'Annual family vacation travel.',
      submittedAt: 'Nov 05, 2026',
      status: 'Approved'
    }
  ]);

  const handleLeaveDecision = (leaveId, decision) => {
    setLeaveRequests(prev => prev.map(l => l.id === leaveId ? { ...l, status: decision } : l));
    showToast(`✓ Leave request ${leaveId} has been marked as ${decision.toUpperCase()}.`);
  };

  // 3. ANNOUNCEMENTS STATE (Feature 8)
  const [announcements, setAnnouncements] = useState([
    {
      id: 'ANN-201',
      title: 'Revised Flexi-Hour & Remote Work Guidelines (Q4 2026)',
      category: 'Policy Update',
      postedDate: 'Today at 09:00 AM',
      author: 'Priya Lead (HR Director)',
      content: 'Core collaboration hours are 10:30 AM to 04:30 PM. Weekly hybrid allowance is 2 days/week with team lead approval.',
      pinned: true
    },
    {
      id: 'ANN-202',
      title: 'Annual Health Check-Up Camp & Ergonomic Screening',
      category: 'Employee Wellness',
      postedDate: 'Yesterday at 02:00 PM',
      author: 'HR Operations Desk',
      content: 'Apollo Hospitals diagnostic camp scheduled on Nov 18th in Floor 3 Boardroom for all employees.',
      pinned: false
    },
    {
      id: 'ANN-203',
      title: 'Official Holiday Notice: Karthigai Deepam (Dec 03, 2026)',
      category: 'Office Holiday',
      postedDate: 'Nov 04, 2026',
      author: 'HR Lead Operations',
      content: 'The company offices will remain closed on Dec 03 in observance of Karthigai Deepam festival.',
      pinned: false
    }
  ]);

  // 4. PERFORMANCE REVIEWS STATE (Feature 5)
  const [performanceReviews, setPerformanceReviews] = useState([
    { id: 'REV-P-1', employee: 'Balavarshini S.', rating: 4.8, targetScore: '114% Achieved', tasksDone: '38/40', feedback: 'Exceptional ownership of student counseling dossiers and verification compliance.', reviewer: 'Priya Lead' },
    { id: 'REV-P-2', employee: 'Diviya R.', rating: 4.7, targetScore: '108% Achieved', tasksDone: '34/35', feedback: 'High candidate submission velocity for GCC civil engineering mandates.', reviewer: 'Priya Lead' },
    { id: 'REV-P-3', employee: 'Kishore Kumar', rating: 4.9, targetScore: '122% Achieved', tasksDone: '46/48', feedback: 'Closed 6 high-value international cloud and healthcare requisitions ahead of SLA.', reviewer: 'Priya Lead' },
    { id: 'REV-P-4', employee: 'Chentamilselvi M.', rating: 4.5, targetScore: '100% Achieved', tasksDone: '28/30', feedback: 'Clean background check records with zero documentation audit defects.', reviewer: 'Priya Lead' }
  ]);

  // 5. EXPENSE CLAIMS STATE (Advanced Feature 5)
  const [expenseClaims, setExpenseClaims] = useState([
    { id: 'EXP-101', employee: 'Kishore Kumar', category: 'Client Advisory Travel', amount: '₹14,500', receiptsAttached: 3, date: 'Nov 05, 2026', status: 'Pending Approval', description: 'Bangalore client meetings travel tickets and hotel conveyance.' },
    { id: 'EXP-102', employee: 'Sreeja Nair', category: 'Campus Drive Hospitality', amount: '₹8,200', receiptsAttached: 2, date: 'Nov 04, 2026', status: 'Pending Approval', description: 'Dinner hospitality for TechVision International campus recruitment panel.' }
  ]);

  // 6. SHIFTS STATE (Advanced Feature 1)
  const [shifts] = useState([
    { shiftName: 'General Day Shift', timing: '09:00 AM - 06:00 PM', count: 34, description: 'Core operations, HR lead, client advisory and student academy.' },
    { shiftName: 'Early Morning Shift', timing: '08:00 AM - 04:30 PM', count: 8, description: 'Singapore & Far East candidate screening and hotline support.' },
    { shiftName: 'UK & Middle East Overlap', timing: '01:00 PM - 09:30 PM', count: 6, description: 'Dubai, Riyadh and European corporate hiring partner coordination.' }
  ]);

  // 7. GRIEVANCES STATE (Advanced Feature 4)
  const [grievances, setGrievances] = useState([
    { id: 'GRV-01', category: 'Facility & Ergonomics', priority: 'Medium', submittedDate: 'Nov 03, 2026', status: 'Under Investigation', details: 'Air conditioning temperature control and ergonomic chair replacement on Floor 2.' },
    { id: 'GRV-02', category: 'Payroll Deduction Query', priority: 'Standard', submittedDate: 'Nov 01, 2026', status: 'Resolved', details: 'Professional tax slab recalculation query resolved with finance team.' }
  ]);

  // COMPUTED TOP METRICS (from Image 1: Feature 1. Dashboard Overview)
  const totalEmployeesCount = 48; // Scaled total enterprise headcount
  const presentTodayCount = employees.filter(e => e.attendanceToday.status === 'Present').length + 35; // 42
  const absentCount = 2;
  const onLeaveCount = 4;
  const newJoinersCount = 3;
  const pendingApprovalsCount = leaveRequests.filter(l => l.status.includes('Pending')).length + expenseClaims.filter(e => e.status.includes('Pending')).length; // 6

  // Filtered Employees
  const filteredEmployees = employees.filter(e => {
    const matchQuery = e.name.toLowerCase().includes(searchEmployee.toLowerCase()) || 
                       e.role.toLowerCase().includes(searchEmployee.toLowerCase()) ||
                       e.id.toLowerCase().includes(searchEmployee.toLowerCase());
    const matchDept = filterDept === 'All' || e.department === filterDept;
    return matchQuery && matchDept;
  });

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans pb-10">
        
        {/* WORKFORCE HEADER, TOAST, 6 KPI CARDS & TABS: Rendered ONLY on Employee/Workforce dashboards, NOT on Task Assignment */}
        {activeTab !== 'tasks' && (
          <>
            {/* TOP COMMAND BANNER (SUPER ADMIN LUXURY GOLD PALETTE) */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    HR Lead Executive HQ • Central Console
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    WORKFORCE GOVERNANCE & OPERATIONS
                  </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  HR Lead Operations & Workforce Management Console
                </h1>
                <p className="text-slate-500 text-xs mt-1 max-w-2xl">
                  Centralized workspace to monitor employees, approve workforce requests, track real-time attendance, and manage end-to-end HR operations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setMaskSalary(!maskSalary)}
                  className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-navy-700 hover:bg-slate-200 transition flex items-center gap-1.5 cursor-pointer text-xs"
                  title="Toggle salary encryption view"
                >
                  {maskSalary ? <Eye className="w-4 h-4 text-amber-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                  <span>{maskSalary ? 'Unmask CTC' : 'Mask CTC'}</span>
                </button>

                <button
                  onClick={() => setIsAddEmployeeOpen(true)}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-2xl shadow-sm transition flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Employee</span>
                </button>

                <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300">
                  ● 42 Present Today
                </span>
              </div>
            </div>

            {toastMsg && (
              <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{toastMsg}</span>
              </div>
            )}

            {/* 6 TOP EXECUTIVE KPI CARDS (From Image 1: 1. Dashboard Overview) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-4 shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Total Employees</span>
                  <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-2.5">{totalEmployeesCount}</p>
                <span className="text-[10px] text-blue-600 font-semibold mt-1 block">↗ 100% On-roll Staff</span>
              </div>

              <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-4 shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Present Today</span>
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-3xl font-serif font-black text-emerald-600 mt-2.5">{presentTodayCount}</p>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↗ 87.5% Attendance</span>
              </div>

              <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-4 shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Absent Today</span>
                  <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                    <XCircle className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-3xl font-serif font-black text-rose-600 mt-2.5">{absentCount}</p>
                <span className="text-[10px] text-rose-600 font-semibold mt-1 block">↗ 1 Uninformed Absence</span>
              </div>

              <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-4 shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">On Leave</span>
                  <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-3xl font-serif font-black text-amber-600 dark:text-gold-400 mt-2.5">{onLeaveCount}</p>
                <span className="text-[10px] text-amber-600 font-semibold mt-1 block">↗ Approved Leaves</span>
              </div>

              <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-4 shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">New Joiners</span>
                  <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                    <UserPlus className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-3xl font-serif font-black text-purple-600 mt-2.5">{newJoinersCount}</p>
                <span className="text-[10px] text-purple-600 font-semibold mt-1 block">↗ This Month (Nov 2026)</span>
              </div>

              <div className="bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 rounded-3xl p-4 shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Pending Approvals</span>
                  <div className="w-7 h-7 rounded-xl bg-gold-500/20 text-gold-700 flex items-center justify-center border border-gold-500/30">
                    <CheckSquare className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-2.5">{pendingApprovalsCount}</p>
                <span className="text-[10px] text-gold-600 font-semibold mt-1 block">↗ Action Required</span>
              </div>
            </div>

            {/* MASTER FEATURE TABS BAR (Hidden for HR Lead, Admin, and Super Admin) */}
            {!hideTopHrNavBar && (
              <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl p-2 shadow-xs flex flex-wrap gap-1.5 overflow-x-auto">
                {[
                  { id: 'overview', label: '#1 Overview', icon: LayoutDashboard },
                  { id: 'tasks', label: 'HR Task Assignment', icon: CheckSquare },
                  { id: 'attendance', label: '#2 Attendance', icon: Clock },
                  { id: 'leave', label: '#3 Leave Management', icon: Calendar },
                  { id: 'employees', label: '#4 Employee Directory', icon: Users },
                  { id: 'performance', label: '#5 Performance', icon: TrendingUp },
                  { id: 'recruitment', label: '#6 Recruitment & Onboarding', icon: UserCheck },
                  { id: 'payroll', label: '#7 Payroll', icon: CreditCard },
                  { id: 'announcements', label: '#8 Notices & Life Events', icon: Bell },
                  { id: 'shifts', label: 'Shift Roster', icon: CalendarCheck },
                  { id: 'documents', label: 'Document Vault', icon: FileText },
                  { id: 'grievances', label: 'Grievances', icon: ShieldAlert },
                  { id: 'approvals', label: `Approvals (${pendingApprovalsCount})`, icon: CheckSquare },
                  { id: 'reports', label: 'Workforce Analytics', icon: BarChart3 }
                ].map(tab => {
                  const TabIcon = tab.icon;
                  const isTabActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer shrink-0 ${
                        isTabActive
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
            )}
          </>
        )}

        {/* ========================================================
            TAB 1: DASHBOARD OVERVIEW (Feature 1)
        ======================================================== */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <CrmHrTaskAssignment />
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Quick Action Reminders & Life Events Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-amber-50/60 dark:bg-navy-950 border border-amber-200/70 dark:border-navy-800 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 flex items-center justify-center font-bold">
                    <Cake className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-gold-400">Today's Birthday</span>
                    <p className="font-serif font-bold text-slate-900 dark:text-white text-xs">Balavarshini S. (HR Ops)</p>
                  </div>
                </div>
                <button 
                  onClick={() => showToast('🎉 Birthday greeting sent to Balavarshini!')}
                  className="px-2.5 py-1 rounded-xl bg-gold-500 text-navy-950 font-bold text-[10px] shadow-xs cursor-pointer hover:bg-gold-600"
                >
                  Send Wish
                </button>
              </div>

              <div className="p-4 bg-purple-50/60 dark:bg-navy-950 border border-purple-200/70 dark:border-navy-800 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 dark:text-purple-300">Work Anniversary</span>
                    <p className="font-serif font-bold text-slate-900 dark:text-white text-xs">Diviya R. (2 Years Milestone)</p>
                  </div>
                </div>
                <button 
                  onClick={() => showToast('🎖️ Work anniversary congratulations sent to Diviya!')}
                  className="px-2.5 py-1 rounded-xl bg-purple-600 text-white font-bold text-[10px] shadow-xs cursor-pointer hover:bg-purple-700"
                >
                  Celebrate
                </button>
              </div>

              <div className="p-4 bg-emerald-50/60 dark:bg-navy-950 border border-emerald-200/70 dark:border-navy-800 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Approvals In Queue</span>
                    <p className="font-serif font-bold text-slate-900 dark:text-white text-xs">{pendingApprovalsCount} Actionable Requests</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('approvals')}
                  className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[10px] shadow-xs cursor-pointer hover:bg-emerald-700"
                >
                  Review
                </button>
              </div>
            </div>

            {/* Department Headcount Breakdown & Live Activity Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Department Distribution (7 cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                      Workforce Distribution by Department
                    </h3>
                    <p className="text-[11px] text-slate-500">48 Active employees allocated across 5 specialized business units</p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    ● 100% Staffed
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  {[
                    { dept: 'Engineering & Cloud Practice', count: 18, pct: 37.5, color: 'from-blue-600 to-indigo-500' },
                    { dept: 'Talent Acquisition & Sourcing', count: 12, pct: 25.0, color: 'from-amber-500 to-gold-400' },
                    { dept: 'HR Operations & Compliance', count: 8, pct: 16.7, color: 'from-emerald-600 to-teal-500' },
                    { dept: 'Placement & Campus Relations', count: 6, pct: 12.5, color: 'from-purple-600 to-violet-500' },
                    { dept: 'International Client Advisory', count: 4, pct: 8.3, color: 'from-rose-500 to-pink-500' }
                  ].map((d, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/60 dark:border-navy-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{d.dept}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{d.count} Members ({d.pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                        <div className={`bg-gradient-to-r ${d.color} h-full rounded-full transition-all duration-500`} style={{ width: `${d.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Attendance Punch Feed (5 cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    Today's Attendance Feed
                  </h3>
                  <button 
                    onClick={() => setActiveTab('attendance')} 
                    className="text-xs text-gold-600 dark:text-gold-400 font-bold hover:underline cursor-pointer"
                  >
                    Full Register →
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-navy-800 space-y-2">
                  {employees.slice(0, 5).map(e => (
                    <div key={e.id} className="pt-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gold-500 text-navy-950 flex items-center justify-center font-bold text-[11px]">
                          {e.avatarLetter}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">{e.name}</p>
                          <span className="text-[10px] text-slate-400">{e.department}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          e.attendanceToday.status === 'Present' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {e.attendanceToday.checkIn}
                        </span>
                        {e.attendanceToday.late && (
                          <span className="text-[9px] text-rose-500 font-bold block mt-0.5">⚠️ Late Check-in</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: ATTENDANCE MANAGEMENT (Feature 2)
        ======================================================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Live Database HR Operations Team Attendance */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    Live HR Operations Attendance (SQLite Database)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time check-ins, breaks, missing checkouts, and monthly summaries synced from My Attendance.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadHrAttendanceData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync Live Data
                </button>
              </div>
              {hrTeamAttendance.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">
                  No live SQLite attendance feed loaded yet. Sign in with HR Lead / Admin password to sync live records.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-navy-800 text-slate-400 uppercase text-[11px]">
                        <th className="py-2 pr-3">Employee</th>
                        <th className="py-2 px-3">Team</th>
                        <th className="py-2 px-3">Today Status</th>
                        <th className="py-2 px-3">Check-In</th>
                        <th className="py-2 px-3">Check-Out</th>
                        <th className="py-2 px-3">Month Hours</th>
                        <th className="py-2 pl-3">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                      {hrTeamAttendance.map((item) => (
                        <tr key={item.employee.employeeId}>
                          <td className="py-2.5 pr-3 font-semibold text-slate-900 dark:text-white">
                            {item.employee.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                            {item.employee.operationTeam || item.employee.department}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200">
                              {item.today?.status || 'Not Checked In'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                            {item.today?.checkInFormatted || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                            {item.today?.checkOutFormatted || '—'}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {item.workingHours?.monthlyTotalFormatted || '0h 00m'}
                          </td>
                          <td className="py-2.5 pl-3 font-bold text-emerald-600 dark:text-emerald-400">
                            {item.summary?.attendancePercentage ?? 100}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Top Toolbar */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                  Daily Attendance Register & Biometric Logs
                </h3>
                <p className="text-[11px] text-slate-500">Live check-in timestamps, late arrival alerts, and working hour summaries</p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => showToast('✓ Monthly attendance CSV report exported successfully.')}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  Export Monthly Attendance CSV
                </button>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                      <th className="p-4 font-bold">Employee Name & ID</th>
                      <th className="p-4 font-bold">Department</th>
                      <th className="p-4 font-bold text-center">Status</th>
                      <th className="p-4 font-bold text-center">Check-In</th>
                      <th className="p-4 font-bold text-center">Check-Out</th>
                      <th className="p-4 font-bold text-center">Logged Hours</th>
                      <th className="p-4 font-bold text-right">Punctuality Alert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                    {employees.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                        <td className="p-4">
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{e.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{e.id}</span>
                        </td>
                        <td className="p-4 font-medium text-slate-600 dark:text-slate-300">
                          {e.department}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            e.attendanceToday.status === 'Present'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                              : e.attendanceToday.status === 'On Leave'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200'
                          }`}>
                            {e.attendanceToday.status}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                          {e.attendanceToday.checkIn}
                        </td>
                        <td className="p-4 text-center font-mono text-slate-600 dark:text-slate-300">
                          {e.attendanceToday.checkOut}
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-emerald-600">
                          {e.attendanceToday.hours}
                        </td>
                        <td className="p-4 text-right">
                          {e.attendanceToday.late ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              ⚠️ Late Arrival (+14m)
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-bold">✓ On Time</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: LEAVE MANAGEMENT (Feature 3)
        ======================================================== */}
        {activeTab === 'leave' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Pending Requests Box */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-800 pb-3">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    Pending Leave Applications Awaiting HR Lead Decision
                  </h3>
                  <p className="text-[11px] text-slate-500">Approve or reject requests with automatic balance deduction</p>
                </div>
                <span className="text-[10px] font-mono text-amber-700 dark:text-gold-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200">
                  {leaveRequests.filter(l => l.status.includes('Pending')).length} Actionable
                </span>
              </div>

              <div className="space-y-3">
                {leaveRequests.map(l => (
                  <div key={l.id} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/70 dark:border-navy-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{l.name}</span>
                        <span className="text-[10px] text-slate-400">({l.department})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {l.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">"{l.reason}"</p>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                        <span>📅 Duration: {l.startDate} to {l.endDate} ({l.days} Day{l.days > 1 ? 's' : ''})</span>
                        <span>• Submitted: {l.submittedAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {l.status.includes('Pending') ? (
                        <>
                          <button
                            onClick={() => handleLeaveDecision(l.id, 'Rejected')}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 text-rose-600 hover:bg-rose-50 font-bold text-xs transition cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleLeaveDecision(l.id, 'Approved')}
                            className="px-4 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs shadow-xs transition cursor-pointer"
                          >
                            Authorize Leave
                          </button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          l.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          ✓ {l.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Balance Matrix */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200/80 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50">
                <span className="font-serif font-bold text-sm text-slate-900 dark:text-white">Annual Leave Balance Ledger by Employee</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                      <th className="p-4 font-bold">Employee</th>
                      <th className="p-4 font-bold">Department</th>
                      <th className="p-4 font-bold text-center">Casual Leave (12)</th>
                      <th className="p-4 font-bold text-center">Sick Leave (12)</th>
                      <th className="p-4 font-bold text-center">Paid / Earned Leave (18)</th>
                      <th className="p-4 font-bold text-right">Total Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                    {employees.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                        <td className="p-4 font-bold text-slate-900 dark:text-white">{e.name}</td>
                        <td className="p-4 text-slate-500">{e.department}</td>
                        <td className="p-4 text-center font-mono font-bold text-blue-600">{e.leaveBalance.casual} Days</td>
                        <td className="p-4 text-center font-mono font-bold text-amber-600">{e.leaveBalance.sick} Days</td>
                        <td className="p-4 text-center font-mono font-bold text-emerald-600">{e.leaveBalance.paid} Days</td>
                        <td className="p-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {e.leaveBalance.casual + e.leaveBalance.sick + e.leaveBalance.paid} Days
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: EMPLOYEE DIRECTORY & MANAGEMENT (Feature 4)
        ======================================================== */}
        {activeTab === 'employees' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, role, employee ID..."
                  value={searchEmployee}
                  onChange={e => setSearchEmployee(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-[10px] font-bold uppercase text-slate-400">Department:</span>
                <select
                  value={filterDept}
                  onChange={e => setFilterDept(e.target.value)}
                  className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="All">All Departments</option>
                  <option value="HR Operations">HR Operations</option>
                  <option value="Talent Acquisition">Talent Acquisition</option>
                  <option value="Placement Cell">Placement Cell</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Client Advisory">Client Advisory</option>
                </select>

                <button
                  onClick={() => setIsAddEmployeeOpen(true)}
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer text-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Employee
                </button>
              </div>
            </div>

            {/* Employee Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map(e => (
                <div key={e.id} className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-5 shadow-xs space-y-4 hover:border-amber-300 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-navy-800 text-amber-900 dark:text-gold-400 font-serif font-black text-xl flex items-center justify-center border border-amber-300/60 dark:border-navy-700 shadow-xs">
                        {e.avatarLetter}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-slate-900 dark:text-white text-sm">{e.name}</h4>
                        <p className="text-[11px] text-amber-700 dark:text-gold-400 font-semibold">{e.role}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{e.id} • {e.location}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      e.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {e.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-navy-800 text-[11px]">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Department:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{e.department}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Employment:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{e.employmentType}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Joining Date:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{e.joiningDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Annual CTC:</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {maskSalary ? '₹ •••••••• (Encrypted)' : e.ctc}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">{e.email}</span>
                    <button
                      onClick={() => showToast(`✓ Full personnel file opened for ${e.name}`)}
                      className="text-xs text-amber-700 dark:text-gold-400 font-bold hover:underline cursor-pointer"
                    >
                      View Profile →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: PERFORMANCE REVIEWS (Feature 5)
        ======================================================== */}
        {activeTab === 'performance' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    Quarterly Workforce Performance Review & KPI Scorecards
                  </h3>
                  <p className="text-[11px] text-slate-500">Objective task completion tracking, manager observations, and rating calibrations</p>
                </div>
                <button
                  onClick={() => showToast('✓ Performance review calibration form opened.')}
                  className="px-4 py-2 bg-gold-500 text-navy-950 font-bold rounded-2xl shadow-xs transition cursor-pointer text-xs"
                >
                  + Add Review
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {performanceReviews.map(p => (
                  <div key={p.id} className="p-5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/70 dark:border-navy-800 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">{p.employee}</h4>
                        <p className="text-[11px] text-slate-400">Evaluated by: {p.reviewer} • Review ID: {p.id}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                          🎯 {p.targetScore}
                        </span>
                        <div className="flex items-center gap-1 bg-gold-500/15 text-gold-700 dark:text-gold-300 px-3 py-1 rounded-xl font-bold font-mono">
                          <Award className="w-3.5 h-3.5" />
                          <span>{p.rating} / 5.0</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-navy-900 rounded-xl border border-slate-200/50 dark:border-navy-800 text-slate-700 dark:text-slate-300 italic text-xs leading-relaxed">
                      "{p.feedback}"
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>Task Completion Rate: <strong className="text-emerald-600 font-mono">{p.tasksDone}</strong> Tasks Finished</span>
                      <span className="text-emerald-600 font-bold">✓ Exceeds Quarterly Expectations</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: RECRUITMENT & ONBOARDING (Feature 6)
        ======================================================== */}
        {activeTab === 'recruitment' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Onboarding Checklist Card */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    New Employee Onboarding Milestones Checklist
                  </h3>
                  <p className="text-[11px] text-slate-500">Mandatory verification and provisioning track for this month's 3 new joiners</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  80% Completed
                </span>
              </div>

              <div className="space-y-2.5 pt-2">
                {[
                  { title: 'Identity & Address Proof Verification (Aadhaar / Passport / MOFA)', done: true },
                  { title: 'Signed Offer Letter, Employment Contract & NDA Executed', done: true },
                  { title: 'Enterprise Laptop, Email Credentials & Slack Provisioning', done: true },
                  { title: 'HR Handbook Orientation, POSH Policy Briefing & Code of Conduct', done: true },
                  { title: 'Department Lead Introduction & 30-Day Mentorship Assignment', done: false }
                ].map((chk, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-navy-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${chk.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-navy-800 text-slate-400'}`}>
                        {chk.done ? <Check className="w-3.5 h-3.5" /> : null}
                      </div>
                      <span className={`text-xs ${chk.done ? 'font-bold text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}>{chk.title}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${chk.done ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {chk.done ? '✓ Verified' : 'Pending Induction'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Hiring Requisitions */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Active Hiring Requisitions & Pipeline Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { role: 'Senior Civil Project Manager', openings: 4, company: 'Al Habtoor Contracting LLC', applicants: 38, interviewed: 12, offered: 3 },
                  { role: 'Lead DevOps Cloud Architect', openings: 3, company: 'TechVision International', applicants: 45, interviewed: 18, offered: 2 },
                  { role: 'Consultant Cardiologist', openings: 2, company: 'Saudi German Hospital', applicants: 14, interviewed: 6, offered: 1 },
                  { role: 'Full Stack React / Node Lead', openings: 2, company: 'Revival Digital Labs', applicants: 62, interviewed: 14, offered: 2 }
                ].map((job, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/60 dark:border-navy-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif font-bold text-slate-900 dark:text-white text-xs">{job.role}</h4>
                        <span className="text-[10px] text-slate-400">{job.company}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {job.openings} Openings
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                      <span>Applicants: {job.applicants}</span>
                      <span>Interviewed: {job.interviewed}</span>
                      <span className="font-bold text-emerald-600">Offered: {job.offered}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: PAYROLL MANAGEMENT (Feature 7)
        ======================================================== */}
        {activeTab === 'payroll' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Payroll Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Gross Monthly Payroll</span>
                <p className="text-2xl font-serif font-black text-slate-900 dark:text-white mt-1">
                  {maskSalary ? '₹ ••••••••' : '₹28,45,000'}
                </p>
                <span className="text-[10px] text-slate-400">48 On-roll Employees</span>
              </div>

              <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Statutory Deductions (PF/ESI)</span>
                <p className="text-2xl font-serif font-black text-rose-600 mt-1">
                  {maskSalary ? '₹ ••••••••' : '₹3,24,000'}
                </p>
                <span className="text-[10px] text-rose-600 font-semibold">100% Tax Compliant</span>
              </div>

              <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Net Disbursement</span>
                <p className="text-2xl font-serif font-black text-emerald-600 mt-1">
                  {maskSalary ? '₹ ••••••••' : '₹25,21,000'}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">Processed for Nov 2026</span>
              </div>

              <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Disbursement Cycle</span>
                <p className="text-2xl font-serif font-black text-amber-600 mt-1">28th of Month</p>
                <span className="text-[10px] text-amber-600 font-semibold">Next on Nov 28, 2026</span>
              </div>
            </div>

            {/* Payslip & Salary Table Card */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl overflow-hidden shadow-xs">
              {/* Header Bar */}
              <div className="p-4 border-b border-slate-200/80 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-serif font-bold text-sm text-slate-900 dark:text-white">Monthly Employee Salary & Payslip Registry</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-100 dark:bg-navy-800 text-amber-800 dark:text-gold-400 border border-amber-200/60 dark:border-navy-700">
                    {employees.length} Records
                  </span>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  <button
                    onClick={() => setMaskSalary(!maskSalary)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-navy-700 text-xs text-amber-700 dark:text-gold-400 font-bold hover:bg-slate-100 dark:hover:bg-navy-800 transition cursor-pointer flex items-center gap-1.5"
                  >
                    {maskSalary ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{maskSalary ? 'Show Actual Figures' : 'Hide / Mask Figures'}</span>
                  </button>

                  <button
                    onClick={handleDownloadPayrollRegisterPDF}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-navy-700"
                    title="Export full payroll ledger PDF"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Export Register PDF</span>
                  </button>

                  <button
                    onClick={handleRunAllPayroll}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title="Disburse direct deposits for all on-roll employees"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Run Nov 2026 Payroll</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="p-3 bg-slate-50/70 dark:bg-navy-950/70 border-b border-slate-200/70 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={payrollSearch}
                    onChange={(e) => setPayrollSearch(e.target.value)}
                    placeholder="Search employee by name, ID or role..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-gold-500"
                  />
                  {payrollSearch && (
                    <button onClick={() => setPayrollSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-[11px] text-slate-500 font-medium">Department:</span>
                  <select
                    value={payrollDeptFilter}
                    onChange={(e) => setPayrollDeptFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-hidden"
                  >
                    <option value="All">All Departments</option>
                    <option value="HR Operations">HR Operations</option>
                    <option value="Talent Acquisition">Talent Acquisition</option>
                    <option value="Placement & Relations">Placement & Relations</option>
                    <option value="Technology & Engineering">Technology & Engineering</option>
                    <option value="International Admissions">International Admissions</option>
                    <option value="Career Advisory">Career Advisory</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-navy-800 font-serif">
                      <th className="p-4 font-bold">Employee Name</th>
                      <th className="p-4 font-bold">Designation</th>
                      <th className="p-4 font-bold text-center">Monthly Gross</th>
                      <th className="p-4 font-bold text-center">Annual CTC</th>
                      <th className="p-4 font-bold text-center">Disbursement Status</th>
                      <th className="p-4 font-bold text-right">Payslip Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                    {employees
                      .filter(e => {
                        const q = payrollSearch.toLowerCase().trim();
                        const matchesSearch = !q ||
                          e.name.toLowerCase().includes(q) ||
                          e.role.toLowerCase().includes(q) ||
                          (e.id && e.id.toLowerCase().includes(q));
                        const matchesDept = payrollDeptFilter === 'All' || e.department === payrollDeptFilter;
                        return matchesSearch && matchesDept;
                      })
                      .map(e => {
                        const status = disbursementStatuses[e.id] || 'Ready';
                        const isCredited = status === 'Credited';
                        const isGenerating = generatingPdfId === e.id;

                        return (
                          <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-navy-950/60 transition">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                                  {e.avatarLetter || e.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white leading-tight">{e.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{e.id} • Joined {e.joiningDate}</div>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="font-medium text-slate-700 dark:text-slate-300">{e.role}</div>
                              <div className="text-[10px] text-amber-700 dark:text-gold-400 font-semibold">{e.department || 'HR Operations'}</div>
                            </td>

                            <td className="p-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                              {maskSalary ? '₹ ••••••' : e.salary}
                            </td>

                            <td className="p-4 text-center font-mono font-bold text-emerald-600">
                              {maskSalary ? '₹ ••••••••' : e.ctc}
                            </td>

                            <td className="p-4 text-center">
                              <button
                                type="button"
                                onClick={() => toggleEmployeeDisbursement(e.id)}
                                title="Click to toggle disbursement status"
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition inline-flex items-center gap-1 cursor-pointer border ${
                                  isCredited
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                                    : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                                }`}
                              >
                                {isCredited ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>✓ Direct Deposit Credited</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>✓ Direct Deposit Ready</span>
                                  </>
                                )}
                              </button>
                            </td>

                            <td className="p-4 text-right">
                              <div className="inline-flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setPreviewEmployee(e)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-bold transition inline-flex items-center gap-1 cursor-pointer text-xs border border-slate-200/80 dark:border-navy-700"
                                  title={`Preview detailed salary statement for ${e.name}`}
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Preview</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDownloadPayslipPDF(e)}
                                  disabled={isGenerating}
                                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-700 font-bold transition inline-flex items-center gap-1 cursor-pointer text-xs border border-slate-200/80 dark:border-navy-700"
                                  title={`Download official PDF payslip for ${e.name}`}
                                >
                                  {isGenerating ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                                  ) : (
                                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                                  )}
                                  <span>{isGenerating ? 'Generating...' : 'Payslip PDF'}</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive Payslip Preview Modal */}
            {previewEmployee && (
              <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6">
                  {/* Modal Header */}
                  <div className="p-4 bg-navy-950 text-white flex justify-between items-center border-b border-navy-800">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gold-400" />
                      <h3 className="font-serif font-bold text-sm text-white">Employee Payslip Statement — {previewEmployee.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewEmployee(null)}
                      className="p-1.5 rounded-xl hover:bg-navy-800 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  {(() => {
                    const b = calculateSalaryBreakdown(previewEmployee);
                    const status = disbursementStatuses[previewEmployee.id] || 'Ready';
                    const isCredited = status === 'Credited';

                    return (
                      <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
                        {/* Company Branding */}
                        <div className="border-b border-slate-200 dark:border-navy-800 pb-4 flex justify-between items-start">
                          <div>
                            <h2 className="font-serif font-black text-lg text-slate-900 dark:text-white">THE REVIVAL INTERNATIONAL</h2>
                            <p className="text-[11px] text-amber-700 dark:text-gold-400 font-semibold">Corporate HR & International Recruitment Operations</p>
                            <p className="text-[10px] text-slate-500">Chennai HQ, Tamil Nadu • Dubai, UAE • ISO 9001:2025 Certified</p>
                          </div>
                          <div className="text-right">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-navy-100 dark:bg-navy-800 text-navy-900 dark:text-gold-400 border border-navy-300 dark:border-navy-700">
                              Nov 2026 Pay Slip
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1 font-mono">REF: REV-PAY-{previewEmployee.id}</p>
                          </div>
                        </div>

                        {/* Meta Grid */}
                        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 text-[11px]">
                          <div className="space-y-1">
                            <p><strong className="text-slate-500">Employee Name:</strong> <span className="font-bold text-slate-900 dark:text-white">{previewEmployee.name}</span></p>
                            <p><strong className="text-slate-500">Employee ID:</strong> <span className="font-mono font-bold text-amber-600">{previewEmployee.id}</span></p>
                            <p><strong className="text-slate-500">Designation:</strong> {previewEmployee.role}</p>
                            <p><strong className="text-slate-500">Department:</strong> {previewEmployee.department || 'HR Operations'}</p>
                            <p><strong className="text-slate-500">Location:</strong> {previewEmployee.location || 'Chennai HQ'}</p>
                          </div>
                          <div className="space-y-1">
                            <p><strong className="text-slate-500">Pay Period:</strong> {b.payPeriod}</p>
                            <p><strong className="text-slate-500">Disbursement Date:</strong> {b.payDate}</p>
                            <p><strong className="text-slate-500">Bank Account:</strong> {b.bankName} ({b.accountMasked})</p>
                            <p><strong className="text-slate-500">PAN / UAN:</strong> {b.pan} / {b.uan}</p>
                            <p><strong className="text-slate-500">Paid Days:</strong> {b.paidDays} Days (LOP: {b.lossOfPay} Days)</p>
                          </div>
                        </div>

                        {/* Earnings & Deductions Breakdown */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border border-slate-200 dark:border-navy-800 rounded-2xl overflow-hidden">
                            <div className="p-2 bg-slate-100 dark:bg-navy-800 font-bold text-slate-900 dark:text-white text-center text-[11px]">
                              EARNINGS
                            </div>
                            <div className="p-3 space-y-1.5">
                              <div className="flex justify-between"><span>Basic Salary</span><strong className="font-mono">₹{b.basic.toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>House Rent (HRA)</span><strong className="font-mono">₹{b.hra.toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>Special Allowance</span><strong className="font-mono">₹{b.specialAllowance.toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>Conveyance</span><strong className="font-mono">₹{b.conveyance.toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>Medical Allowance</span><strong className="font-mono">₹{b.medical.toLocaleString('en-IN')}</strong></div>
                              <div className="pt-2 border-t border-slate-200 dark:border-navy-700 flex justify-between font-bold text-slate-900 dark:text-white">
                                <span>Total Gross</span>
                                <span className="font-mono text-slate-900 dark:text-white">₹{b.totalEarnings.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="border border-slate-200 dark:border-navy-800 rounded-2xl overflow-hidden">
                            <div className="p-2 bg-slate-100 dark:bg-navy-800 font-bold text-rose-600 text-center text-[11px]">
                              DEDUCTIONS
                            </div>
                            <div className="p-3 space-y-1.5">
                              <div className="flex justify-between"><span>Provident Fund (PF)</span><strong className="font-mono">₹{b.pf.toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>Professional Tax (PT)</span><strong className="font-mono">₹{b.profTax.toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>Health Mediclaim</span><strong className="font-mono">₹{b.mediclaim.toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>TDS / Income Tax</span><strong className="font-mono">₹{b.tds.toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>Other Statutory</span><strong className="font-mono">₹{b.esi.toLocaleString('en-IN')}</strong></div>
                              <div className="pt-2 border-t border-slate-200 dark:border-navy-700 flex justify-between font-bold text-rose-600">
                                <span>Total Deductions</span>
                                <span className="font-mono">₹{b.totalDeductions.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Net Salary Highlight */}
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-800 dark:text-emerald-400">Net Take-Home Salary</span>
                            <p className="font-serif font-black text-xl text-emerald-700 dark:text-emerald-300">₹{b.netPay.toLocaleString('en-IN')}</p>
                            <p className="text-[10px] text-emerald-600 italic mt-0.5">{numberToWords(b.netPay)}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${isCredited ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                              {isCredited ? '✓ Direct Deposit Credited' : '✓ Direct Deposit Ready'}
                            </span>
                            <p className="text-[10px] text-slate-500 mt-1">Disbursed on Nov 28, 2026</p>
                          </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex justify-between items-center">
                          <span className="text-[10px] text-slate-400">Digitally Verified via Revival CRM Enterprise Edition</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => window.print()}
                              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadPayslipPDF(previewEmployee)}
                              disabled={generatingPdfId === previewEmployee.id}
                              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              {generatingPdfId === previewEmployee.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                              <span>Download Official PDF</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 8: ANNOUNCEMENTS & LIFE EVENTS (Feature 8)
        ======================================================== */}
        {activeTab === 'announcements' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    Company Circulars & HR Policy Broadcasts
                  </h3>
                  <p className="text-[11px] text-slate-500">Official circulars, holiday schedules, and employee handbook notifications</p>
                </div>
                <button
                  onClick={() => showToast('✓ Broadcast compose dialog opened.')}
                  className="px-4 py-2 bg-gold-500 text-navy-950 font-bold rounded-2xl shadow-xs transition cursor-pointer text-xs"
                >
                  + Broadcast Notice
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {announcements.map(ann => (
                  <div key={ann.id} className="p-5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/70 dark:border-navy-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            {ann.category}
                          </span>
                          {ann.pinned && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800">
                              📌 Pinned Circular
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white mt-1.5">{ann.title}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{ann.postedDate}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{ann.content}</p>
                    <p className="text-[10px] text-slate-400">Issued by: <strong>{ann.author}</strong></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 9: SHIFTS & ROSTERS (Advanced Feature 1)
        ======================================================== */}
        {activeTab === 'shifts' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Working Hour Shifts & Schedule Roster
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {shifts.map((s, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/70 dark:border-navy-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-serif font-bold text-slate-900 dark:text-white text-sm">{s.shiftName}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-500/20 text-gold-700 font-mono">
                        {s.count} Staff
                      </span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200/60 dark:border-navy-800 font-mono font-bold text-xs text-emerald-600">
                      🕒 {s.timing}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 10: DOCUMENT REPOSITORY (Advanced Feature 2)
        ======================================================== */}
        {activeTab === 'documents' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                Employee Confidential Document Repository & Verification Vault
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-navy-800">
                {[
                  { title: 'Identity & Address Proof (Aadhaar / Passport / MOFA Certificate)', verifiedCount: 48, total: 48, status: '100% Verified' },
                  { title: 'Educational Degree Certificates & University Mark Sheets', verifiedCount: 48, total: 48, status: '100% Verified' },
                  { title: 'Signed Employment Agreements & Confidential Non-Disclosure Agreements', verifiedCount: 48, total: 48, status: '100% Signed' },
                  { title: 'Previous Employer Relieving Letters & Experience Certificates', verifiedCount: 45, total: 48, status: '3 Under Verification' },
                  { title: 'Comprehensive Background Verification (BGV) & Criminal Check Report', verifiedCount: 48, total: 48, status: 'Clean Audit' }
                ].map((doc, idx) => (
                  <div key={idx} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{doc.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{doc.verifiedCount} of {doc.total} dossiers on secure cloud vault</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 11: GRIEVANCE MANAGEMENT (Advanced Feature 4)
        ======================================================== */}
        {activeTab === 'grievances' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    Confidential Workplace Grievance & Resolution Log
                  </h3>
                  <p className="text-[11px] text-slate-500">Secure ticketing for employee concerns, peer disputes, and workplace facilities</p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  🔒 Encrypted & Confidential
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {grievances.map(g => (
                  <div key={g.id} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/70 dark:border-navy-800 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">{g.id}</span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{g.category}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {g.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{g.details}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      g.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {g.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 12: CENTRAL APPROVAL CENTER (Advanced Feature 6)
        ======================================================== */}
        {activeTab === 'approvals' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Live Database Attendance Regularization Approvals */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-navy-800 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    Attendance Regularization Requests (Live Database)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review and approve/reject HR Operations employee check-in, check-out, and status corrections.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                  {hrRegularizations.filter((r) => r.status === 'Pending').length} Pending
                </span>
              </div>

              {hrRegularizations.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">
                  No attendance regularization requests found in database.
                </p>
              ) : (
                <div className="space-y-3">
                  {hrRegularizations.map((reg) => (
                    <div
                      key={reg.id}
                      className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950 p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {reg.employeeName} ({reg.employeeId}) • {reg.attendanceDate}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {reg.correctionType} • Current: {reg.existingCheckIn || '—'} / {reg.existingCheckOut || '—'} ({reg.existingStatus}) → Requested: {reg.requestedCheckIn || '—'} / {reg.requestedCheckOut || '—'}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            reg.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                              : reg.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">Reason:</span> {reg.reason}
                      </p>

                      {reg.status === 'Pending' ? (
                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Reviewer comment (optional)..."
                            value={regCommentMap[reg.id] || ''}
                            onChange={(e) =>
                              setRegCommentMap((prev) => ({ ...prev, [reg.id]: e.target.value }))
                            }
                            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs text-slate-900 dark:text-white"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={reviewingRegId === reg.id}
                              onClick={() => handleReviewRegularization(reg.id, 'Approved')}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={reviewingRegId === reg.id}
                              onClick={() => handleReviewRegularization(reg.id, 'Rejected')}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Reviewed by {reg.reviewerName || 'HR Lead'}: {reg.reviewerComments || 'No comment'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-navy-800 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    Central Unified HR Approval Center
                  </h3>
                  <p className="text-[11px] text-slate-500">Consolidated inbox for leave approvals, expense claims, and onboarding clearance</p>
                </div>

                <button
                  onClick={() => {
                    setLeaveRequests(prev => prev.map(l => ({ ...l, status: 'Approved' })));
                    setExpenseClaims(prev => prev.map(e => ({ ...e, status: 'Approved' })));
                    showToast('✓ All 6 pending workforce requests have been approved!');
                  }}
                  className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-2xl shadow-sm transition cursor-pointer text-xs"
                >
                  ✓ Bulk Authorize All ({pendingApprovalsCount})
                </button>
              </div>

              {/* Expense Claims Awaiting Approval */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">Pending Expense Reimbursement Claims</h4>
                {expenseClaims.map(exp => (
                  <div key={exp.id} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/70 dark:border-navy-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{exp.employee}</span>
                        <span className="text-[10px] font-mono text-slate-400">({exp.id})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {exp.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{exp.description}</p>
                      <span className="text-[10px] font-mono text-slate-400">Submitted: {exp.date} • {exp.receiptsAttached} Receipts Attached</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-serif font-black text-emerald-600 text-sm">{exp.amount}</span>
                      {exp.status.includes('Pending') ? (
                        <button
                          onClick={() => {
                            setExpenseClaims(prev => prev.map(e => e.id === exp.id ? { ...e, status: 'Approved' } : e));
                            showToast(`✓ Expense claim ${exp.id} approved for reimbursement.`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold text-xs">✓ Approved</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            TAB 13: WORKFORCE REPORTS & ANALYTICS (Advanced Feature 7)
        ======================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Annual Attrition Rate</span>
                <p className="text-3xl font-serif font-black text-emerald-600 mt-2">3.8%</p>
                <span className="text-[10px] text-emerald-600 font-semibold">↗ Industry Leading Retention</span>
              </div>

              <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Workforce Gender Diversity</span>
                <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-2">54% F / 46% M</p>
                <span className="text-[10px] text-purple-600 font-semibold">↗ Balanced Leadership Ratio</span>
              </div>

              <div className="p-5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Average Tenure</span>
                <p className="text-3xl font-serif font-black text-blue-600 mt-2">2.4 Years</p>
                <span className="text-[10px] text-blue-600 font-semibold">↗ Steadily Growing Team</span>
              </div>
            </div>

            {/* Audit & Compliance Security Box (Access & Data Security from Document) */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gold-500" />
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                    HR Data Governance, Role Permissions & Access Log
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ● 256-bit Audit Trail Active
                </span>
              </div>
              <p className="text-slate-500 text-xs">
                Role-based access permissions protect employee salary details, medical certificates, and confidential HR review records. All sign-offs and status alterations are permanently logged with audit timestamps.
              </p>
            </div>
          </div>
        )}

        {/* MODAL: ADD NEW EMPLOYEE */}
        {isAddEmployeeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200 dark:border-navy-800 shadow-2xl max-w-lg w-full space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Add Employee Profile</h3>
                <button 
                  onClick={() => setIsAddEmployeeOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddEmployeeSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newEmp.name}
                    onChange={e => setNewEmp({ ...newEmp, name: e.target.value })}
                    placeholder="e.g. Radhika Ramanathan"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Department</label>
                    <select
                      value={newEmp.department}
                      onChange={e => setNewEmp({ ...newEmp, department: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs"
                    >
                      <option>HR Operations</option>
                      <option>Talent Acquisition</option>
                      <option>Placement Cell</option>
                      <option>Engineering</option>
                      <option>Client Advisory</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Designation</label>
                    <input
                      type="text"
                      required
                      value={newEmp.role}
                      onChange={e => setNewEmp({ ...newEmp, role: e.target.value })}
                      placeholder="e.g. HR Operations Associate"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={newEmp.email}
                      onChange={e => setNewEmp({ ...newEmp, email: e.target.value })}
                      placeholder="radhika.r@revivalcrm.com"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={newEmp.phone}
                      onChange={e => setNewEmp({ ...newEmp, phone: e.target.value })}
                      placeholder="+91 98401 22334"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Monthly Salary</label>
                    <input
                      type="text"
                      value={newEmp.salary}
                      onChange={e => setNewEmp({ ...newEmp, salary: e.target.value })}
                      placeholder="₹55,000 / mo"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Employment Type</label>
                    <select
                      value={newEmp.employmentType}
                      onChange={e => setNewEmp({ ...newEmp, employmentType: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs"
                    >
                      <option>Full-Time Permanent</option>
                      <option>Probationary (6 Mos)</option>
                      <option>Contractual</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-navy-800">
                  <button
                    type="button"
                    onClick={() => setIsAddEmployeeOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Save & Create Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </ScrollReveal>
  );
};

export default CrmHrLeadDashboard;
