import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText, Filter, Calendar, CheckCircle2, X, Printer, Check } from 'lucide-react';

export const CrmReports = () => {
  const [period, setPeriod] = useState('Monthly');
  const [activePdfModal, setActivePdfModal] = useState(null);
  const [exportSuccessMsg, setExportSuccessMsg] = useState('');

  const reportsList = [
    { title: 'Executive Recruiter Placement & Revenue Performance', timeframe: period, format: 'PDF & Excel', desc: 'Breakdown of candidate placements, candidate sources, target commissions, and revenue per recruiter.' },
    { title: 'Country-Wise Overseas Visa Processing & SLA Audit', timeframe: period, format: 'CSV & Excel', desc: 'Average days from interview pass to entry permit issuance across UAE, KSA, Qatar, & Singapore.' },
    { title: 'Corporate Client Accounts SLA & Pending Invoice Aging', timeframe: period, format: 'PDF & Excel', desc: 'Corporate accounts aging summary, pending mandate fulfillments, and 90-day guarantee replacements.' },
    { title: 'Background Verification & Credential Audit Log Summary', timeframe: period, format: 'PDF & CSV', desc: '6-point verification pass rates, degree attestation status, and university clearance logs.' }
  ];

  const generateReportData = (title, timeframe) => {
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toLocaleString();

    if (title.includes('Recruiter Placement')) {
      return {
        title,
        timeframe,
        timestamp,
        filename: `Executive_Recruiter_Placement_${timeframe}_${today}`,
        headers: ['Recruiter Name', 'Designation', 'Target Placements', 'Actual Placements', 'Billed Revenue (USD)', 'Commission (USD)', 'SLA Rating'],
        rows: [
          ['Fatima Al-Zahra', 'Senior Headhunter', '15', '19', '$184,000', '$18,400', '98.5% (Excellent)'],
          ['Tariq Al-Hashemi', 'VP Global Talent', '12', '14', '$142,000', '$14,200', '96.2% (Passed)'],
          ['David Sterling', 'Director International', '10', '11', '$115,000', '$11,500', '94.8% (Passed)'],
          ['Rajesh Kumar', 'Senior Recruiter', '10', '8', '$78,000', '$7,800', '91.0% (Passed)']
        ],
        summary: 'Total Placements: 52 Candidates | Total Billed: $519,000 USD | Average SLA Score: 95.1%'
      };
    } else if (title.includes('Visa Processing')) {
      return {
        title,
        timeframe,
        timestamp,
        filename: `Overseas_Visa_SLA_Audit_${timeframe}_${today}`,
        headers: ['Target GCC Country', 'Active Visas in Process', 'Avg Entry Permit Speed', 'MOHRE Clearance Rate', 'Overdue Audits', 'Compliance Status'],
        rows: [
          ['UAE (Dubai & Abu Dhabi)', '34 Visas', '14 Business Days', '99.2%', '0 Overdue', 'Passed (Grade A)'],
          ['Saudi Arabia (Riyadh & KSA)', '28 Visas', '18 Business Days', '97.8%', '1 Overdue', 'Passed (Grade A)'],
          ['Qatar (Doha)', '22 Visas', '16 Business Days', '98.5%', '0 Overdue', 'Passed (Grade A)'],
          ['Singapore', '8 Visas', '11 Business Days', '100.0%', '0 Overdue', 'Passed (Grade A)']
        ],
        summary: 'Total Visas Monitored: 92 Applications | Average SLA Speed: 14.7 Days | Overall Compliance: Grade A'
      };
    } else if (title.includes('Corporate Client Accounts')) {
      return {
        title,
        timeframe,
        timestamp,
        filename: `Client_Accounts_Invoice_Aging_${timeframe}_${today}`,
        headers: ['Client Company Name', 'GCC Region', 'Active Mandates', 'Pending Invoice (USD)', 'Aging Tier', '90-Day Guarantee'],
        rows: [
          ['Al Habtoor Contracting LLC', 'UAE', '5 Mandates', '$45,000 USD', 'Current (0-30 Days)', 'Active Compliant'],
          ['Saudi German Hospital Group', 'KSA', '8 Mandates', '$62,000 USD', 'Current (0-30 Days)', 'Active Compliant'],
          ['TechVision International', 'Singapore', '3 Mandates', '$28,000 USD', 'Pending (31-60 Days)', 'Active Compliant'],
          ['Emaar Properties PJSC', 'UAE', '4 Mandates', '$39,000 USD', 'Current (0-30 Days)', 'Active Compliant']
        ],
        summary: 'Total Billed Portfolio: $174,000 USD | Total Active Mandates: 20 Positions'
      };
    } else {
      return {
        title,
        timeframe,
        timestamp,
        filename: `BGV_Credential_Audit_Log_${timeframe}_${today}`,
        headers: ['Candidate ID', 'Candidate Name', 'Target Mandate', 'Degree Attestation', 'Police Clearance', 'Ref Check', 'BGV Case Status'],
        rows: [
          ['SIR-CAN-1001', 'Alexander Wright', 'Civil Project Manager', 'Verified (Manchester)', 'Clear (ACRO UK)', 'Pass (2 VPs)', 'Approved (Pass)'],
          ['SIR-CAN-1002', 'Dr. Sarah Al-Mansoori', 'ICU Consultant', 'Verified (King Saud)', 'Clear (KSA Police)', 'Pass (CMO)', 'Approved (Pass)'],
          ['SIR-CAN-1003', 'Elena Rostova', 'DevOps Architect', 'Verified (Warsaw)', 'In Progress', 'Pass (CTO)', 'In Audit Stage'],
          ['SIR-CAN-1004', 'Rahul Sharma', 'MEP Site Engineer', 'Verified (IIT Delhi)', 'Clear (Indian PCC)', 'Pass (2 Mgrs)', 'Approved (Pass)']
        ],
        summary: 'Total Credential Cases Audited: 4 Candidates | Pass Rate: 92.5% | Security Clearance: Verified'
      };
    }
  };

  const handleExportCsv = (title) => {
    const data = generateReportData(title, period);
    const csvLines = [
      `"SIR RECRUITMENT ENTERPRISE REPORT - ${data.title}"`,
      `"Timeframe Period: ${data.timeframe}"`,
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
 <Worksheet ss:Name="Executive Report">
  <Table>
   <Row><Cell><Data ss:Type="String">SIR RECRUITMENT ENTERPRISE EDITION</Data></Cell></Row>
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
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Executive Intelligence & Compliance</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Reports & Export Center</h1>
          <p className="text-slate-600 dark:text-slate-400">Generate executive PDF, Excel, and CSV analytics reports for board meetings & audit reviews.</p>
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
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Timeframe Period:</span>
          {['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'].map(p => (
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
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reportsList.map((item, idx) => (
          <div key={idx} className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gold-500/50 transition shadow-sm">
            <div className="space-y-1 max-w-xl">
              <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 font-bold px-2 py-0.5 rounded text-[9px] uppercase border border-amber-300 dark:border-gold-500/30">{item.timeframe} Report</span>
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white mt-1">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium">{item.desc}</p>
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
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-3xl w-full p-6 shadow-luxury space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Action Header */}
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-3">
              <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 font-bold px-2.5 py-1 rounded text-[10px] uppercase border border-amber-300 dark:border-gold-500/40">
                Official Board Document Preview
              </span>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow flex items-center gap-1.5 text-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
                <button onClick={() => setActivePdfModal(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Area */}
            <div className="p-8 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-inner font-sans">
              
              {/* Document Header & Logo */}
              <div className="flex justify-between items-start border-b border-slate-300 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-extrabold text-slate-900 dark:text-white tracking-wide">SIR RECRUITMENT</h2>
                  <p className="text-[10px] text-amber-700 dark:text-gold-400 font-bold uppercase tracking-widest">Enterprise Edition • Executive Intelligence</p>
                </div>
                <div className="text-right text-[10px] text-slate-600 dark:text-slate-400">
                  <p className="font-bold text-slate-900 dark:text-white">Confidential Audit Report</p>
                  <p>Period: <strong className="text-amber-700 dark:text-gold-400">{activePdfModal.timeframe}</strong></p>
                  <p>Timestamp: {activePdfModal.timestamp}</p>
                </div>
              </div>

              {/* Title & Summary */}
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">{activePdfModal.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{activePdfModal.summary}</p>
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
                  <p className="font-bold text-slate-800 dark:text-slate-200">Authorized Executive Signoff</p>
                  <p className="font-mono">Verification Code: #SIR-AUD-{Date.now().toString().slice(-6)}</p>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 px-3 py-1 rounded font-bold">
                    ✓ Board Audit Passed
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
