import React, { useState } from 'react';
import ScrollReveal from '../../components/ScrollReveal';
import { useCrm } from '../context/CrmContext';
import { 
  BarChart3, Download, FileSpreadsheet, FileText, Filter, Calendar, 
  CheckCircle2, X, Printer, Check, Users, Building2, CalendarCheck, 
  Inbox, Award, Sparkles, TrendingUp
} from 'lucide-react';

export const CrmReports = () => {
  const { 
    leads = [], 
    candidates = [], 
    clients = [], 
    invoices = [] 
  } = useCrm();

  const [period, setPeriod] = useState('Monthly');
  const [activePdfModal, setActivePdfModal] = useState(null);
  const [exportSuccessMsg, setExportSuccessMsg] = useState('');

  // Date filter helper
  const isWithinPeriod = (dateStr, p) => {
    if (!dateStr || p === 'Yearly' || p === 'All') return true;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;
    const now = new Date();
    const diffDays = (now - d) / (1000 * 60 * 60 * 24);
    if (p === 'Daily') return diffDays <= 1;
    if (p === 'Weekly') return diffDays <= 7;
    if (p === 'Monthly') return diffDays <= 30;
    if (p === 'Quarterly') return diffDays <= 90;
    return true;
  };

  const reportsList = [
    { 
      id: 'consultations',
      title: 'Live Consultation & Client Bookings Report', 
      timeframe: period, 
      format: 'PDF, Excel & CSV', 
      desc: 'Real-time synchronized audit log of client appointments, advisory roadmaps, and consultation submissions from website forms & CRM.' 
    },
    { 
      id: 'service-breakdown',
      title: 'Service Inquiries & Lead Conversion Audit', 
      timeframe: period, 
      format: 'PDF, Excel & CSV', 
      desc: 'Breakdown of inquiries across International Consulting, College Admissions, Career Guidance, and Enterprise Recruitment services.' 
    },
    { 
      id: 'advisor-caseload',
      title: 'Counselor & Advisor Caseload Allocation Report', 
      timeframe: period, 
      format: 'PDF, Excel & CSV', 
      desc: 'Workload distribution, scheduled consultation appointments, and completed cases across India HQ advisory counselors.' 
    },
    { 
      id: 'client-accounts',
      title: 'Corporate Client Accounts & Partner Portfolio Report', 
      timeframe: period, 
      format: 'PDF, Excel & CSV', 
      desc: 'Active institutional partners, universities, schools, and corporate recruitment client mandates.' 
    },
    { 
      id: 'candidate-pipeline',
      title: 'Human Capital & Candidate Pipeline Report', 
      timeframe: period, 
      format: 'PDF, Excel & CSV', 
      desc: 'Verified candidate registrations, pipeline stage distribution, and screening progression.' 
    }
  ];

  const generateReportData = (title, timeframe) => {
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toLocaleString();

    if (title.includes('Consultation') || title.includes('Bookings')) {
      const filteredLeads = leads.filter(l => isWithinPeriod(l.createdAt, timeframe));
      const scheduledCount = filteredLeads.filter(l => (l.status || '').toLowerCase().includes('sched') || l.consultationDate).length;
      const convertedCount = filteredLeads.filter(l => (l.status || '').toLowerCase().includes('convert') || (l.status || '').toLowerCase().includes('complet')).length;
      const newCount = filteredLeads.filter(l => (l.status || '').toLowerCase().includes('new')).length;

      const rows = filteredLeads.length === 0
        ? [['No Bookings Yet', '0 consultation records for this period', '-', '-', '-', '-', '-', '-', '-', 'Awaiting Submissions']]
        : filteredLeads.map(l => [
            l.referenceNumber || l.id || '-',
            l.name || 'Anonymous',
            l.email || '-',
            l.phone || '-',
            l.serviceTitle || l.serviceId || 'General Advisory',
            l.countryInterest || 'All Destinations',
            `${l.consultationDate || 'Pending'} ${l.consultationTime || ''}`.trim(),
            l.consultationMode || 'Virtual (Google Meet / Zoom)',
            l.assignedEmployee || 'Dhanalakshimi',
            l.status || 'New Enquiry'
          ]);

      return {
        title,
        timeframe,
        timestamp,
        filename: `Consultation_Bookings_Report_${timeframe}_${today}`,
        headers: ['Ref Code', 'Client / Candidate Name', 'Email', 'Phone', 'Service Track', 'Country Interest', 'Appointment Date / Time', 'Consultation Mode', 'Assigned Advisor', 'Status'],
        rows,
        summary: `Total Bookings: ${filteredLeads.length} | Scheduled: ${scheduledCount} | Converted: ${convertedCount} | New Inquiries: ${newCount}`
      };
    } else if (title.includes('Service Inquiries') || title.includes('Conversion')) {
      const filteredLeads = leads.filter(l => isWithinPeriod(l.createdAt, timeframe));
      
      // Group by service
      const serviceGroups = {};
      filteredLeads.forEach(l => {
        const sName = l.serviceTitle || l.serviceId || 'General Inquiry';
        if (!serviceGroups[sName]) {
          serviceGroups[sName] = { total: 0, newCount: 0, scheduled: 0, inProgress: 0, converted: 0 };
        }
        serviceGroups[sName].total += 1;
        const status = (l.status || '').toLowerCase();
        if (status.includes('new')) serviceGroups[sName].newCount += 1;
        else if (status.includes('sched')) serviceGroups[sName].scheduled += 1;
        else if (status.includes('progress')) serviceGroups[sName].inProgress += 1;
        else if (status.includes('convert') || status.includes('complet')) serviceGroups[sName].converted += 1;
      });

      const serviceKeys = Object.keys(serviceGroups);
      const rows = serviceKeys.length === 0
        ? [['All Consultation & Recruitment Tracks', '0', '0', '0', '0', '0', '0.0%']]
        : serviceKeys.map(k => {
            const g = serviceGroups[k];
            const convRate = g.total > 0 ? ((g.converted / g.total) * 100).toFixed(1) + '%' : '0.0%';
            return [k, String(g.total), String(g.newCount), String(g.scheduled), String(g.inProgress), String(g.converted), convRate];
          });

      return {
        title,
        timeframe,
        timestamp,
        filename: `Service_Inquiries_Conversion_${timeframe}_${today}`,
        headers: ['Service Track', 'Total Inquiries', 'New Enquiries', 'Scheduled Consultations', 'In Progress', 'Converted', 'Conversion Rate'],
        rows,
        summary: `Total Service Categories Tracked: ${serviceKeys.length} | Total Inquiries: ${filteredLeads.length}`
      };
    } else if (title.includes('Counselor') || title.includes('Advisor')) {
      const advisors = ['Dhanalakshimi', 'Sreeja', 'chentamilselvi', 'Diviya', 'balavarshini'];
      const filteredLeads = leads.filter(l => isWithinPeriod(l.createdAt, timeframe));

      const rows = advisors.map(adv => {
        const advLeads = filteredLeads.filter(l => (l.assignedEmployee || '').toLowerCase() === adv.toLowerCase());
        const scheduled = advLeads.filter(l => (l.status || '').toLowerCase().includes('sched') || l.consultationDate).length;
        const pending = advLeads.filter(l => (l.status || '').toLowerCase().includes('new') || (l.status || '').toLowerCase().includes('contact')).length;
        const completed = advLeads.filter(l => (l.status || '').toLowerCase().includes('convert') || (l.status || '').toLowerCase().includes('complet')).length;
        return [adv, `${advLeads.length} Bookings`, `${scheduled} Scheduled`, `${pending} Pending`, `${completed} Converted`];
      });

      return {
        title,
        timeframe,
        timestamp,
        filename: `Advisor_Caseload_Allocation_${timeframe}_${today}`,
        headers: ['Advisor / Counselor Name', 'Total Assigned Bookings', 'Scheduled Appointments', 'Pending Initial Contact', 'Completed / Converted'],
        rows,
        summary: `Active India Advisory Team: ${advisors.length} Counselors | Total Assigned Bookings: ${filteredLeads.length}`
      };
    } else if (title.includes('Client Accounts') || title.includes('Partner')) {
      const rows = clients.length === 0
        ? [['No Registered Clients', '-', '-', '-', '-', '-', 'Pending Client Addition']]
        : clients.map(c => [
            c.company || c.name || 'Unnamed Organization',
            c.organizationType || 'Company',
            c.industry || 'Higher Education & Advisory',
            c.country || 'India / UAE',
            c.contactPerson || '-',
            c.designation || '-',
            c.status || 'Active'
          ]);

      return {
        title,
        timeframe,
        timestamp,
        filename: `Client_Accounts_Portfolio_${timeframe}_${today}`,
        headers: ['Organization Name', 'Type', 'Industry', 'Country / Region', 'Contact Person', 'Designation', 'Status'],
        rows,
        summary: `Total Registered Corporate & Educational Partners: ${clients.length}`
      };
    } else {
      const rows = candidates.length === 0
        ? [['No Candidates Registered', '-', '-', '-', '-', 'Clean Pipeline', '-']]
        : candidates.map(c => [
            c.id || '-',
            c.name || 'Candidate',
            c.nationality || '-',
            c.currentRole || '-',
            c.currentEmployer || '-',
            c.stage || 'New',
            c.expectedSalary || '-'
          ]);

      return {
        title,
        timeframe,
        timestamp,
        filename: `Candidate_Pipeline_Audit_${timeframe}_${today}`,
        headers: ['Candidate ID', 'Candidate Name', 'Nationality', 'Target Role', 'Current Employer', 'Pipeline Stage', 'Expected Salary'],
        rows,
        summary: `Total Candidate Talent Pool: ${candidates.length} Profiles`
      };
    }
  };

  const handleExportCsv = (title) => {
    const data = generateReportData(title, period);
    const csvLines = [
      `"The Revival International - Live Enterprise Intelligence Report"`,
      `"Report Title: ${data.title}"`,
      `"Timeframe: ${data.timeframe}"`,
      `"Generated Timestamp: ${data.timestamp}"`,
      `"Summary: ${data.summary}"`,
      '',
      data.headers.map(h => `"${h}"`).join(','),
      ...data.rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvLines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportSuccessMsg(`Successfully generated & downloaded '${data.filename}.csv'!`);
    setTimeout(() => setExportSuccessMsg(''), 4000);
  };

  const handleExportExcel = (title) => {
    const data = generateReportData(title, period);
    const excelXml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Live Report">
  <Table>
   <Row><Cell><Data ss:Type="String">The Revival International ENTERPRISE REPORT</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Report: ${data.title}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Timeframe: ${data.timeframe} | Generated: ${data.timestamp}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">${data.summary}</Data></Cell></Row>
   <Row></Row>
   <Row>
    ${data.headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}
   </Row>
   ${data.rows.map(r => `
   <Row>
    ${r.map(c => `<Cell><Data ss:Type="String">${c}</Data></Cell>`).join('')}
   </Row>`).join('')}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([excelXml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.filename}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportSuccessMsg(`Successfully generated & downloaded '${data.filename}.xls' (Excel)!`);
    setTimeout(() => setExportSuccessMsg(''), 4000);
  };

  const handleExportPdf = (title) => {
    const data = generateReportData(title, period);
    setActivePdfModal(data);
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
          <div>
            <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
              Live Executive Intelligence
            </span>
            <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Reports & Export Center
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Generate executive PDF, Excel, and CSV audit reports populated dynamically from live consultation bookings and inquiries.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-gold-500/20 text-amber-800 dark:text-gold-400 font-bold border border-amber-300 dark:border-gold-500/40">
              {leads.length} Live Bookings
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-500/40">
              {clients.length} Client Accounts
            </span>
          </div>
        </div>

        {/* Success Download Notification Alert */}
        {exportSuccessMsg && (
          <div className="p-4 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300 font-bold rounded-2xl flex items-center space-x-2 animate-in fade-in shadow-sm">
            <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{exportSuccessMsg}</span>
          </div>
        )}

        {/* Filter Options */}
        <div className="glass-card bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 flex flex-wrap gap-4 items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gold-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Filter Timeframe:</span>
            {['Daily', 'Weekly', 'Monthly', 'Quarterly', 'All'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition ${
                  period === p 
                    ? 'bg-gold-500 text-navy-950 shadow-gold-glow border border-gold-400' 
                    : 'bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-navy-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-navy-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Synchronized directly with database & forms
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reportsList.map((item, idx) => (
            <div key={idx} className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gold-500/50 transition shadow-sm">
              <div className="space-y-1 max-w-xl">
                <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 font-bold px-2 py-0.5 rounded text-[9px] uppercase border border-amber-300 dark:border-gold-500/30">
                  {item.timeframe} Report
                </span>
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mt-1">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => handleExportExcel(item.title)}
                  title="Download Excel Spreadsheet (.XLS)"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export Excel</span>
                </button>

                <button 
                  onClick={() => handleExportPdf(item.title)}
                  title="View & Print Executive PDF Report"
                  className="px-3.5 py-2 bg-gold-500 hover:opacity-95 text-navy-950 font-bold rounded-xl flex items-center gap-1.5 shadow-gold-glow transition active:scale-95 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export PDF</span>
                </button>

                <button 
                  onClick={() => handleExportCsv(item.title)}
                  title="Download Data CSV (.CSV)"
                  className="px-3.5 py-2 bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-800 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-navy-800 transition active:scale-95 cursor-pointer"
                >
                  CSV
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Executive Printable PDF Report Preview Modal */}
        {activePdfModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-4xl w-full p-6 shadow-luxury space-y-6 max-h-[90vh] overflow-y-auto">
              
              {/* Modal Action Header */}
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
                <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 font-bold px-2.5 py-1 rounded text-[10px] uppercase border border-amber-300 dark:border-gold-500/40">
                  Official Report Document Preview
                </span>

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow flex items-center gap-1.5 text-xs cursor-pointer hover:opacity-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / Save as PDF</span>
                  </button>
                  <button onClick={() => setActivePdfModal(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold p-1 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Document Area */}
              <div className="p-8 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-inner font-sans">
                
                {/* Document Header & Logo */}
                <div className="flex justify-between items-start border-b border-slate-300 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="font-serif text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">
                      The Revival International
                    </h2>
                    <p className="text-[10px] text-amber-700 dark:text-gold-400 font-bold uppercase tracking-widest">
                      Enterprise CRM • Dynamic Intelligence Audit
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-slate-600 dark:text-slate-400">
                    <p className="font-bold text-slate-900 dark:text-white">Confidential Report</p>
                    <p>Period: <strong className="text-amber-700 dark:text-gold-400">{activePdfModal.timeframe}</strong></p>
                    <p>Timestamp: {activePdfModal.timestamp}</p>
                  </div>
                </div>

                {/* Title & Summary */}
                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                    {activePdfModal.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {activePdfModal.summary}
                  </p>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-gold-400 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        {activePdfModal.headers.map((h, i) => (
                          <th key={i} className="p-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {activePdfModal.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-navy-900/50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className={`p-3 ${cIdx === 0 ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Stamps */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end text-[10px] text-slate-500 dark:text-slate-400">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">The Revival International Advisory Directorate</p>
                    <p className="font-mono">Reference: #REV-RPT-{Date.now().toString().slice(-6)}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 px-3 py-1 rounded font-bold">
                      ✓ Synchronized Live Data
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </ScrollReveal>
  );
};
