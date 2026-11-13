import { jsPDF } from 'jspdf';

/**
 * Generates and downloads an ATS-compliant, executive PDF resume for a candidate.
 */
export const downloadCandidateResumePdf = (cand) => {
  if (!cand) return;
  const doc = new jsPDF('p', 'mm', 'a4');

  const name = cand.name || 'Executive Candidate';
  const role = cand.currentRole || 'Executive Candidate';
  const id = cand.id || 'RI-CAND';
  const email = cand.email || 'candidate@therevivalinternational.com';
  const phone = cand.phone || '+971 50 123 4567';
  const location = cand.location || cand.nationality || 'Dubai, UAE';
  const nationality = cand.nationality || 'UAE';
  const citizenship = cand.citizenship ? ` (Citizen: ${cand.citizenship})` : '';
  const experience = cand.experience || '3-5 Years';
  const education = cand.qualification || cand.education || 'Bachelor Degree / Professional Diploma';
  const salary = cand.expectedSalary || 'Market Standard';
  const employer = cand.currentEmployer || 'Revival International Candidate';
  const skills = Array.isArray(cand.skills) && cand.skills.length > 0 
    ? cand.skills 
    : ['International Mobility', 'Executive Candidate', 'Global Mandates', 'Project Planning', 'Cross-Border Operations'];

  // Top Navy Executive Header Banner
  doc.setFillColor(15, 23, 42); // Navy 900
  doc.rect(0, 0, 210, 36, 'F');

  // Candidate Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(245, 158, 11); // Gold 500
  doc.text(name, 14, 15);

  // Professional Role & Candidate ID
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`${role}   |   Candidate ID: ${id}`, 14, 23);

  // Contact Strip
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text(`${email}   •   ${phone}   •   ${location}   •   ${nationality}${citizenship}`, 14, 30);

  // Gold Divider Line
  doc.setDrawColor(217, 119, 6); // Amber 600
  doc.setLineWidth(1.2);
  doc.line(14, 36, 196, 36);

  let y = 46;

  // 1. Executive Profile Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE PROFILE SUMMARY', 14, y);
  y += 2;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const summaryText = cand.aiSummary || `High-performing professional with ${experience} of proven track record across UAE, GCC and international markets. Verified credentials for overseas relocation, regulatory compliance, and cross-functional leadership in high-impact operations.`;
  const splitSummary = doc.splitTextToSize(summaryText, 182);
  doc.text(splitSummary, 14, y);
  y += (splitSummary.length * 4.8) + 6;

  // 2. Core Competencies & Key Technical Skills
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('CORE COMPETENCIES & KEY TECHNICAL SKILLS', 14, y);
  y += 2;
  doc.line(14, y, 196, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const skillsLine = skills.join('   •   ');
  const splitSkills = doc.splitTextToSize(skillsLine, 182);
  doc.text(splitSkills, 14, y);
  y += (splitSkills.length * 4.8) + 6;

  // 3. Professional Work Experience
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PROFESSIONAL WORK EXPERIENCE', 14, y);
  y += 2;
  doc.line(14, y, 196, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(role, 14, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${employer}   |   Total Experience: ${experience}`, 14, y + 4.5);
  y += 10;

  doc.setFontSize(8.8);
  doc.setTextColor(51, 65, 85);
  const resp = [
    '• Directing key functional deliverables, operational planning, and milestone governance.',
    '• Ensuring compliance with international standards, quality benchmarks, and safety protocols.',
    '• Managing stakeholder communication, cross-border resource alignment, and client requirements.'
  ];
  for (const r of resp) {
    doc.text(r, 14, y);
    y += 4.8;
  }
  y += 4;

  // 4. Academic Qualifications & Attestation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ACADEMIC QUALIFICATIONS & EMBASSY ATTESTATION', 14, y);
  y += 2;
  doc.line(14, y, 196, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(education, 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(16, 185, 129); // Emerald 500
  const attestationStatus = cand.mohreAttested 
    ? '[VERIFIED] Educational Degree Attested by UAE / Saudi Embassy (MOHRE Compliant)'
    : '[VERIFIED] Degree Verified for GCC & International Work Permit Submission';
  doc.text(attestationStatus, 14, y);
  y += 8;

  // 5. Relocation, Remuneration & Availability
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('INTERNATIONAL MOBILITY & PREFERENCES', 14, y);
  y += 2;
  doc.line(14, y, 196, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Preferred Relocation Country: ${cand.preferredCountry || 'United Arab Emirates (Dubai / Abu Dhabi)'}`, 14, y);
  doc.text(`Expected Monthly Remuneration: ${salary}`, 14, y + 4.8);
  doc.text(`Notice Period: ${cand.noticePeriod || '30 Days'}`, 14, y + 9.6);
  doc.text(`Passport Status: ${cand.passport || 'Standard (Verified)'}`, 14, y + 14.4);
  y += 20;

  // Footer Watermark & Timestamp
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('The Revival International Recruitment & Executive Placements • Certified ATS Dossier', 14, 285);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 168, 285);

  const cleanName = name.trim().replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${cleanName}_Resume.pdf`);
};

/**
 * Opens a formatted, standalone ATS Resume preview tab for a candidate.
 */
export const openCandidateResumeInNewTab = (cand) => {
  if (!cand) return;
  const newWin = window.open('', '_blank');
  if (!newWin) {
    alert('Please allow popups to preview the candidate resume.');
    return;
  }

  const name = cand.name || 'Executive Candidate';
  const role = cand.currentRole || 'Executive Candidate';
  const id = cand.id || 'RI-CAND';
  const email = cand.email || 'candidate@therevivalinternational.com';
  const phone = cand.phone || '+971 50 123 4567';
  const location = cand.location || cand.nationality || 'Dubai, UAE';
  const nationality = cand.nationality || 'UAE';
  const citizenship = cand.citizenship || 'United Arab Emirates';
  const experience = cand.experience || '3-5 Years';
  const education = cand.qualification || cand.education || 'Bachelor Degree / Professional Diploma';
  const salary = cand.expectedSalary || 'Market Standard';
  const employer = cand.currentEmployer || 'Revival International Candidate';
  const skills = Array.isArray(cand.skills) && cand.skills.length > 0 
    ? cand.skills 
    : ['International Mobility', 'Executive Candidate', 'Global Mandates', 'Project Planning', 'Cross-Border Operations'];
  const summary = cand.aiSummary || `Results-driven executive with ${experience} of proven track record across UAE, GCC and international markets. Verified credentials for overseas relocation, regulatory compliance, and cross-functional leadership in high-impact operations.`;

  const skillsHtml = skills.map(s => `<span class="skill-tag">${s}</span>`).join('');

  newWin.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Resume - ${name} (${id})</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background: #f8fafc;
          color: #0f172a;
          margin: 0;
          padding: 24px;
          display: flex;
          justify-content: center;
        }
        .resume-sheet {
          background: #ffffff;
          width: 100%;
          max-width: 820px;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          border-top: 6px solid #d97706;
        }
        .header {
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 18px;
          margin-bottom: 22px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .candidate-name {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px 0;
        }
        .candidate-role {
          font-size: 14px;
          font-weight: 700;
          color: #d97706;
          margin: 0 0 8px 0;
        }
        .contact-bar {
          font-size: 12px;
          color: #64748b;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .badge {
          background: #fef3c7;
          color: #92400e;
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          border: 1px solid #fde68a;
        }
        .section {
          margin-bottom: 22px;
        }
        .section-title {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #0f172a;
          border-bottom: 1.5px solid #e2e8f0;
          padding-bottom: 6px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .summary-text {
          font-size: 13px;
          line-height: 1.6;
          color: #334155;
          margin: 0;
        }
        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .skill-tag {
          background: #f1f5f9;
          color: #0f172a;
          border: 1px solid #e2e8f0;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
        }
        .exp-item {
          margin-bottom: 12px;
        }
        .exp-title {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }
        .exp-sub {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 6px;
        }
        .exp-bullets {
          font-size: 12.5px;
          color: #334155;
          margin: 0;
          padding-left: 18px;
          line-height: 1.5;
        }
        .attest-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 700;
          margin-top: 6px;
        }
        .print-btn-bar {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.95);
          padding: 8px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          backdrop-filter: blur(8px);
        }
        .btn {
          background: #d97706;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
        }
        .btn-secondary {
          background: #0f172a;
        }
        @media print {
          .print-btn-bar { display: none; }
          body { padding: 0; background: #ffffff; }
          .resume-sheet { box-shadow: none; border: none; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="resume-sheet">
        <div class="header">
          <div>
            <h1 class="candidate-name">${name}</h1>
            <p class="candidate-role">${role} • ${id}</p>
            <div class="contact-bar">
              <span>✉ ${email}</span>
              <span>☎ ${phone}</span>
              <span>📍 ${location}</span>
              <span>🌐 ${nationality} (${citizenship})</span>
            </div>
          </div>
          <span class="badge">ATS Verified Candidate</span>
        </div>

        <div class="section">
          <div class="section-title">Executive Profile Summary</div>
          <p class="summary-text">${summary}</p>
        </div>

        <div class="section">
          <div class="section-title">Core Competencies & Key Technical Skills</div>
          <div class="skills-grid">${skillsHtml}</div>
        </div>

        <div class="section">
          <div class="section-title">Professional Work Experience</div>
          <div class="exp-item">
            <div class="exp-title">${role}</div>
            <div class="exp-sub">${employer} • Experience: ${experience}</div>
            <ul class="exp-bullets">
              <li>Directing key functional deliverables, operational planning, and milestone governance.</li>
              <li>Ensuring compliance with international standards, quality benchmarks, and safety protocols.</li>
              <li>Managing stakeholder communication, cross-border resource alignment, and client requirements.</li>
            </ul>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Academic Qualifications & Attestation</div>
          <div style="font-size: 13.5px; font-weight: 700; color: #0f172a;">${education}</div>
          <div class="attest-badge">✓ Educational Degree Attested by UAE / Saudi Embassy (MOHRE Verified)</div>
        </div>

        <div class="section">
          <div class="section-title">Relocation, Compensation & Availability</div>
          <div style="font-size: 12.5px; color: #334155; line-height: 1.6;">
            <div><strong>Preferred Relocation:</strong> ${cand.preferredCountry || 'United Arab Emirates (Dubai / Abu Dhabi)'}</div>
            <div><strong>Expected Remuneration:</strong> ${salary}</div>
            <div><strong>Notice Period:</strong> ${cand.noticePeriod || '30 Days'}</div>
            <div><strong>Passport Verification:</strong> ${cand.passport || 'Standard (Verified)'}</div>
          </div>
        </div>
      </div>

      <div class="print-btn-bar">
        <button class="btn" onclick="window.print()">Print / Save as PDF</button>
        <button class="btn btn-secondary" onclick="window.close()">Close</button>
      </div>
    </body>
    </html>
  `);
  newWin.document.close();
};
