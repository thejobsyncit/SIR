import React, { useState } from 'react';
import { Download, Search, Globe, CheckCircle2, ShieldAlert, FileSpreadsheet, FileText, RefreshCw } from 'lucide-react';
import { VISA_MATRIX_FULL } from '../data/mockData';
import jsPDF from 'jspdf';

export const VisaMatrixTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');

  const filtered = VISA_MATRIX_FULL.filter(item => {
    const matchesSearch = item.country.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.visaType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.requirements.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'All' || item.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleDownloadPDF = () => {
    setGeneratingPdf(true);
    try {
      // Landscape A4 (297mm width x 210mm height)
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 10;
      let startY = 14;

      // Header Banner
      doc.setFillColor(11, 27, 51); // Navy #0B1B33
      doc.rect(margin, startY, pageWidth - (margin * 2), 16, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('THE REVIVAL INTERNATIONAL — COUNTRY-WISE VISA ELIGIBILITY MATRIX 2026', margin + 6, startY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(198, 164, 92); // Gold #C6A45C
      doc.text('Official Work Permit, Embassy Attestation & Points Compliance Matrix Across 18 Global Jurisdictions', margin + 6, startY + 12);

      startY += 21;

      // Table Column Specifications (Total Width = 277mm)
      const cols = [
        { header: 'Country', width: 24 },
        { header: 'Common Work Visa', width: 40 },
        { header: 'Key Requirements', width: 66 },
        { header: 'Age', width: 18 },
        { header: 'Min Qualification', width: 38 },
        { header: 'Exp.', width: 20 },
        { header: 'Language', width: 25 },
        { header: 'Processing', width: 24 },
        { header: 'Avg Cost', width: 22 }
      ];

      // Draw Header Row
      doc.setFillColor(241, 245, 249); // Slate-100
      doc.rect(margin, startY, pageWidth - (margin * 2), 7, 'F');
      doc.setDrawColor(203, 213, 225); // Slate-300
      doc.line(margin, startY + 7, pageWidth - margin, startY + 7);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42); // Slate-900

      let currentX = margin;
      cols.forEach(col => {
        doc.text(col.header, currentX + 2, startY + 5);
        currentX += col.width;
      });

      startY += 7;

      // Render Rows
      const dataToRender = filtered.length > 0 ? filtered : VISA_MATRIX_FULL;

      dataToRender.forEach((item, rIdx) => {
        const rowHeight = 9.5;
        // Check for page break
        if (startY + rowHeight > pageHeight - 12) {
          doc.addPage('a4', 'landscape');
          startY = 14;

          // Repeat header row on new page
          doc.setFillColor(241, 245, 249);
          doc.rect(margin, startY, pageWidth - (margin * 2), 7, 'F');
          doc.setDrawColor(203, 213, 225);
          doc.line(margin, startY + 7, pageWidth - margin, startY + 7);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(15, 23, 42);

          let curX = margin;
          cols.forEach(c => {
            doc.text(c.header, curX + 2, startY + 5);
            curX += c.width;
          });
          startY += 7;
        }

        // Alternating row background
        if (rIdx % 2 === 1) {
          doc.setFillColor(248, 250, 252); // Slate-50
          doc.rect(margin, startY, pageWidth - (margin * 2), rowHeight, 'F');
        }

        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.line(margin, startY + rowHeight, pageWidth - margin, startY + rowHeight);

        // Cell Data
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(30, 41, 59);

        let cellX = margin;

        // 1. Country (Bold)
        doc.setFont('helvetica', 'bold');
        doc.text(item.country, cellX + 2, startY + 6);
        cellX += cols[0].width;

        // 2. Visa Type
        doc.setFont('helvetica', 'normal');
        const visaLines = doc.splitTextToSize(item.visaType, cols[1].width - 4);
        doc.text(visaLines[0] || '', cellX + 2, startY + 4.5);
        if (visaLines[1]) doc.text(visaLines[1], cellX + 2, startY + 8);
        cellX += cols[1].width;

        // 3. Requirements
        const reqLines = doc.splitTextToSize(item.requirements, cols[2].width - 4);
        doc.text(reqLines[0] || '', cellX + 2, startY + 4.5);
        if (reqLines[1]) doc.text(reqLines[1], cellX + 2, startY + 8);
        cellX += cols[2].width;

        // 4. Age
        doc.text(item.age, cellX + 2, startY + 6);
        cellX += cols[3].width;

        // 5. Min Qualification
        const qualLines = doc.splitTextToSize(item.minQualification, cols[4].width - 4);
        doc.text(qualLines[0] || '', cellX + 2, startY + 4.5);
        if (qualLines[1]) doc.text(qualLines[1], cellX + 2, startY + 8);
        cellX += cols[4].width;

        // 6. Experience
        doc.text(item.experience, cellX + 2, startY + 6);
        cellX += cols[5].width;

        // 7. Language
        doc.text(item.language, cellX + 2, startY + 6);
        cellX += cols[6].width;

        // 8. Processing
        doc.text(item.processingTime, cellX + 2, startY + 6);
        cellX += cols[7].width;

        // 9. Cost
        doc.text(item.avgCost, cellX + 2, startY + 6);

        startY += rowHeight;
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Revival International Executive Recruitment & Advisory • ISO 9001:2025 Certified • Generated on ${new Date().toLocaleDateString('en-GB')} • Page ${p} of ${pageCount}`,
          margin + 2,
          pageHeight - 6
        );
      }

      doc.save('Revival_Country_Wise_Visa_Eligibility_Matrix_2026.pdf');
    } catch (err) {
      console.error('PDF Matrix Generation Error:', err);
      window.print();
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Country', 'Visa Type', 'Key Requirements', 'Age', 'Min Qualification', 'Experience', 'Language', 'Processing Time', 'Avg Cost'];
    const rows = VISA_MATRIX_FULL.map(i => [
      `"${i.country}"`,
      `"${i.visaType}"`,
      `"${i.requirements}"`,
      `"${i.age}"`,
      `"${i.minQualification}"`,
      `"${i.experience}"`,
      `"${i.language}"`,
      `"${i.processingTime}"`,
      `"${i.avgCost}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Revival_International_Country_Visa_Matrix_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Matrix Controls & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-navy-950 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 text-xs">
        <div className="flex flex-1 items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Search visa rules by country, requirement, or qualification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-gold-500"
            />
          </div>

          <select 
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-gold-500"
          >
            <option value="All">All 18 Countries</option>
            {VISA_MATRIX_FULL.map(c => (
              <option key={c.country} value={c.country}>{c.country}</option>
            ))}
          </select>
        </div>

        {/* Download Matrix Buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel / CSV</span>
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={generatingPdf}
            className="px-4 py-2.5 bg-gold-shimmer text-navy-950 font-bold rounded-xl flex items-center space-x-1.5 shadow-gold-glow hover:opacity-95 transition cursor-pointer disabled:opacity-60"
          >
            {generatingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            <span>{generatingPdf ? 'Formatting Landscape PDF...' : 'Download PDF Matrix'}</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-navy-800 shadow-luxury">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-navy-900 text-gold-400 font-serif border-b border-slate-200 dark:border-navy-800 uppercase tracking-wider text-[11px]">
              <th className="p-4 font-bold">Country</th>
              <th className="p-4 font-bold min-w-[160px]">Common Work Visa</th>
              <th className="p-4 font-bold min-w-[220px]">Key Requirements</th>
              <th className="p-4 font-bold">Eligible Age</th>
              <th className="p-4 font-bold">Min Qualification</th>
              <th className="p-4 font-bold">Experience</th>
              <th className="p-4 font-bold">Language</th>
              <th className="p-4 font-bold">Processing Time</th>
              <th className="p-4 font-bold">Average Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-navy-800 bg-white dark:bg-navy-950 text-slate-700 dark:text-slate-300">
            {filtered.map((item, idx) => (
              <tr key={idx} className="hover:bg-liteblue-50/50 dark:hover:bg-slate-800/60 dark:bg-navy-900/60 transition">
                <td className="p-4 font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-gold-500" />
                  <span>{item.country}</span>
                </td>
                <td className="p-4 font-semibold text-navy-800 dark:text-slate-200">
                  {item.visaType}
                </td>
                <td className="p-4 text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
                  {item.requirements}
                </td>
                <td className="p-4 font-mono font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                  {item.age}
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className="bg-slate-100 dark:bg-navy-800 px-2 py-1 rounded text-navy-900 dark:text-gold-400 font-semibold border border-slate-200 dark:border-navy-700">
                    {item.minQualification}
                  </span>
                </td>
                <td className="p-4 font-mono whitespace-nowrap">
                  {item.experience}
                </td>
                <td className="p-4 whitespace-nowrap">
                  {item.language}
                </td>
                <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  ⚡ {item.processingTime}
                </td>
                <td className="p-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {item.avgCost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-100 dark:bg-navy-900 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-medium flex items-center justify-between">
        <p className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Updated as of August 2026. Includes UAE MOHRE, Saudi Iqama, Qatar Work Visa & EU Blue Card frameworks.</span>
        </p>
        <span className="font-bold text-gold-500">Showing {filtered.length} of {VISA_MATRIX_FULL.length} Countries</span>
      </div>

    </div>
  );
};
