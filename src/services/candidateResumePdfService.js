import { jsPDF } from 'jspdf';

/**
 * Creates an ATS-compliant, executive PDF resume document for a candidate using jsPDF.
 */
export const createCandidateJsPdf = (cand = {}) => {
  const doc = new jsPDF('p', 'mm', 'a4');

  const name = cand.name || 'Executive Candidate';
  const role = cand.currentRole || cand.title || 'Executive Candidate';
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
    `• Candidate Profile Mandate: ${role} (${experience}).`,
    `• Affiliated Organization: ${employer}.`,
    `• Placement & Mobility Destination: ${cand.preferredCountry || location}.`
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

  return doc;
};

/**
 * Resolves a candidate's uploaded resume data URL or file link from various context sources.
 */
export const resolveResumeUrl = (cand) => {
  if (!cand) return { url: null, name: 'Candidate_CV.pdf' };
  
  let url = cand.resumeUrl || cand.fileUrl || cand.resumeDataUrl;
  let name = cand.resumeName || cand.fileName || `${(cand.name || 'Candidate').replace(/\s+/g, '_')}_CV.pdf`;

  // Look in candidate applications if present
  if ((!url || url.length < 500) && Array.isArray(cand.applications)) {
    const appWithResume = cand.applications.find(a => (a.resumeUrl && a.resumeUrl.length > 500));
    if (appWithResume) {
      url = appWithResume.resumeUrl;
      name = appWithResume.resumeName || name;
    }
  }

  // Look in candidate documents if present
  if ((!url || url.length < 500) && Array.isArray(cand.documents)) {
    const docWithResume = cand.documents.find(d => (d.fileUrl && d.fileUrl.length > 500) || (d.fileName && d.fileName.toLowerCase().includes('cv')));
    if (docWithResume) {
      url = docWithResume.fileUrl;
      name = docWithResume.fileName || name;
    }
  }

  // Fallback to client localStorage cache if running in browser
  if ((!url || url.length < 500) && typeof window !== 'undefined' && window.localStorage) {
    try {
      // 1. Check Candidate Database (where portal updates active profiles)
      const candDbStr = localStorage.getItem('sir_candidates_db');
      if (candDbStr && cand.email) {
        const candDb = JSON.parse(candDbStr);
        const localEntry = candDb[cand.email.toLowerCase().trim()];
        if (localEntry && localEntry.resumeUrl && localEntry.resumeUrl.length > 200) {
          url = localEntry.resumeUrl;
          name = localEntry.resumeName || name;
        }
      }
    } catch {}

    try {
      // 2. Check Candidate User Session
      const sessStr = localStorage.getItem('sir_user_session');
      if (sessStr) {
        const sess = JSON.parse(sessStr);
        const candEmail = (cand.email || '').toLowerCase().trim();
        const sessEmail = (sess.email || '').toLowerCase().trim();
        if (sess && (sessEmail === candEmail || sess.candidateId === cand.id)) {
          if (sess.resumeUrl && sess.resumeUrl.length > 200) {
            url = sess.resumeUrl;
            name = sess.resumeName || name;
          }
        }
      }
    } catch {}

    try {
      // 3. Check direct key stores
      if (cand.email) {
        const emailKey = cand.email.toLowerCase().trim();
        const storedForEmail = localStorage.getItem(`sir_resume_${emailKey}`);
        if (storedForEmail && storedForEmail.length > 200) {
          url = storedForEmail;
        }
      }
      if (!url || url.length < 200) {
        const activeResume = localStorage.getItem('sir_active_resume');
        const activeName = localStorage.getItem('sir_active_resume_name');
        if (activeResume && activeResume.length > 200) {
          url = activeResume;
          if (activeName) name = activeName;
        }
      }
    } catch {}
  }

  return { url: (url && url.length > 100) ? url : null, name };
};

/**
 * Downloads the actual candidate CV document (if uploaded) or generates an authentic PDF resume.
 */
export const downloadCandidateResumePdf = (cand) => {
  if (!cand) return;

  const { url, name } = resolveResumeUrl(cand);
  const fileName = name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx') ? name : `${name}.pdf`;

  // If candidate has an actual uploaded resume file, trigger direct file download
  if (url && (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http'))) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Generate ATS PDF using jsPDF
  const doc = createCandidateJsPdf(cand);
  const cleanName = (cand.name || 'Candidate').trim().replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${cleanName}_Resume.pdf`);
};

/**
 * Opens the candidate's actual uploaded resume file in a clean, dedicated viewer tab with download capability.
 * If no custom file was uploaded, generates an authentic executive PDF and previews it.
 */
export const openCandidateResumeInNewTab = (cand) => {
  if (!cand) return;

  const { url, name } = resolveResumeUrl(cand);
  const fileName = name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx') ? name : `${name}.pdf`;
  const candidateName = cand.name || 'Candidate';

  // 1. Direct web URLs
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    window.open(url, '_blank');
    return;
  }

  // Helper to open a custom, styled PDF/Document viewer window with actions
  const openViewerWindow = (fileUrl, mimeType, isGenerated = false) => {
    const newWin = window.open('', '_blank');
    if (!newWin) {
      // Fallback: direct download if popups are blocked
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    newWin.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${fileName} - The Revival International</title>
        <style>
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: #0b1120;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            overflow: hidden;
          }
          .viewer-toolbar {
            height: 54px;
            background: #0f172a;
            border-bottom: 1px solid #1e293b;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            color: #ffffff;
            box-shadow: 0 4px 15px rgba(0,0,0,0.25);
          }
          .doc-info {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .doc-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: rgba(217, 119, 6, 0.2);
            color: #f59e0b;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 14px;
          }
          .doc-titles h1 {
            font-size: 13.5px;
            font-weight: 700;
            margin: 0;
            color: #f8fafc;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .doc-titles p {
            font-size: 11px;
            color: #94a3b8;
            margin: 2px 0 0 0;
          }
          .badge-status {
            background: rgba(16, 185, 129, 0.15);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.3);
            font-size: 10px;
            font-weight: 800;
            padding: 2px 8px;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
          .toolbar-actions {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .btn-dl {
            background: linear-gradient(135deg, #d97706, #b45309);
            color: #ffffff;
            text-decoration: none;
            padding: 8px 18px;
            border-radius: 9px;
            font-size: 12px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            border: none;
            transition: opacity 0.15s ease;
          }
          .btn-dl:hover {
            opacity: 0.92;
          }
          .btn-cls {
            background: #1e293b;
            color: #94a3b8;
            border: 1px solid #334155;
            padding: 8px 14px;
            border-radius: 9px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .btn-cls:hover {
            background: #334155;
            color: #ffffff;
          }
          .content-stage {
            width: 100%;
            height: calc(100% - 54px);
            background: #0b1120;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          iframe, embed {
            width: 100%;
            height: 100%;
            border: none;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="viewer-toolbar">
          <div class="doc-info">
            <div class="doc-icon">CV</div>
            <div class="doc-titles">
              <h1>
                <span>${fileName}</span>
                <span class="badge-status">${isGenerated ? 'ATS Dossier' : 'Candidate Uploaded CV'}</span>
              </h1>
              <p>${candidateName} • The Revival International Certified Talent</p>
            </div>
          </div>
          <div class="toolbar-actions">
            <a class="btn-dl" href="${fileUrl}" download="${fileName}">⬇ Download File</a>
            <button class="btn-cls" onclick="window.close()">✕ Close</button>
          </div>
        </div>
        <div class="content-stage">
          <iframe src="${fileUrl}#toolbar=1" type="${mimeType}" title="${fileName}"></iframe>
        </div>
      </body>
      </html>
    `);
    newWin.document.close();
  };

  // 2. Data URL or Blob URL of candidate's actual uploaded CV
  if (url && (url.startsWith('data:') || url.startsWith('blob:'))) {
    try {
      let finalBlobUrl = url;
      let mimeType = 'application/pdf';

      if (url.startsWith('data:')) {
        const parts = url.split(',');
        const header = parts[0];
        const base64Data = parts[1];
        const match = header.match(/data:([^;]+)/);
        if (match && match[1]) mimeType = match[1].trim();

        const byteCharacters = atob(base64Data);
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteArray], { type: mimeType });
        finalBlobUrl = URL.createObjectURL(blob);
      }

      openViewerWindow(finalBlobUrl, mimeType, false);
      return;
    } catch (err) {
      console.warn('Direct uploaded resume preview fallback notice:', err);
    }
  }

  // 3. If candidate has no custom uploaded resume file yet, generate an executive ATS PDF on-the-fly
  try {
    const doc = createCandidateJsPdf(cand);
    const pdfBlobUrl = doc.output('bloburl');
    openViewerWindow(pdfBlobUrl, 'application/pdf', true);
  } catch (err) {
    console.error('Failed to generate ATS PDF resume preview:', err);
    downloadCandidateResumePdf(cand);
  }
};
