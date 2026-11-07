# Recruitment Dashboard – Feature Requirements

Feature overview for **Recruiter**, **Placement Coordinator**, **Interviewer**, **HR Operations**, **HR Lead**, and **Super Admin** dashboards across The Revival International platform.

---

## 1. Recruiter Dashboard

| Feature | Description |
| :--- | :--- |
| **Dashboard overview** | Display open jobs, applicants, shortlisted candidates, interviews and hires. |
| **Job / vacancy management** | Create, edit, publish, pause and close vacancies; define role, skills, experience, location and closing date. |
| **Candidate management** | View candidate profiles, resumes, skills, education, experience and contact details. |
| **Search and filters** | Find candidates by job, skill, experience, location, qualification and application status. |
| **Application pipeline** | Track candidates through Applied, Screening, Shortlisted, Interview, Selected, Offered, Hired or Rejected stages. |
| **Resume upload and storage** | Upload, preview and securely download CVs and supporting documents. |
| **Candidate notes and tags** | Add internal notes, labels, ratings and follow-up actions. |
| **Interview scheduling** | Schedule interviews, assign interviewers, add meeting details and reschedule or cancel. |
| **Candidate communication** | Send email or message templates and maintain communication history. |
| **Offers and joining** | Track offer status, acceptance, joining date and joining confirmation. |
| **Reports and analytics** | View job-wise applications, stage conversion, time-to-hire and recruiter activity. |
| **Team collaboration** | Assign vacancies and candidates to recruiters; share notes and hiring decisions. |

---

## 2. Placement Coordinator Dashboard

| Feature | Description |
| :--- | :--- |
| **Dashboard overview** | Display registered students, eligible students, active drives, applications, offers and placed students. |
| **Student profile management** | Maintain student details, course, department, batch, marks, skills, resume and contact information. |
| **Eligibility management** | Set company-specific criteria such as degree, branch, CGPA, backlogs and graduation year. |
| **Company management** | Maintain employer profiles, contact persons, job details and hiring history. |
| **Placement drive management** | Create drives with dates, venue or link, job roles, eligibility and registration deadline. |
| **Student registration** | Allow eligible students to register or apply for a drive and track registration status. |
| **Application tracking** | Track applications through applied, shortlisted, interview, selected and rejected stages. |
| **Interview and event coordination** | Manage schedules, venues, interview panels, attendance and student notifications. |
| **Offer and placement records** | Record offers, salary package, role, company, offer acceptance and joining status. |
| **Announcements and notifications** | Share placement notices, deadlines, instructions and reminders with selected student groups. |
| **Reports and exports** | Generate department-wise, batch-wise, company-wise and placement statistics; export reports. |
| **Access and approvals** | Define who can edit student records, approve drives and view confidential information. |

---

## 3. Interviewer Dashboard

| Feature | Description |
| :--- | :--- |
| **Dashboard overview** | Display assigned interviews, today's schedule, pending feedback and completed interviews. |
| **Assigned candidate list** | View candidates and interview rounds assigned to the interviewer. |
| **Candidate interview profile** | View relevant resume, skills, experience, job description and previous-round feedback as permitted. |
| **Interview schedule and details** | View date, time, duration, round, interview mode, meeting link and coordinator contact. |
| **Interview evaluation form** | Rate technical skills, communication, problem-solving, role fit and other agreed criteria. |
| **Structured feedback** | Record strengths, concerns, evidence, comments and an overall recommendation. |
| **Decision submission** | Submit recommendations such as Strong Hire, Hire, Hold or No Hire. |
| **Interview status** | Mark interviews as scheduled, completed, absent, rescheduled or cancelled. |
| **Feedback reminders** | Receive reminders for interviews and feedback that has not yet been submitted. |
| **Previous-round context** | View permitted notes and round history to avoid repeating questions. |
| **Availability / calendar** | Share available interview slots or sync interview appointments with a calendar. |
| **Confidentiality and permissions** | Restrict access to assigned candidates and protect interview feedback from unauthorized users. |

---

## 4. HR Operations & HR Lead Dashboards

| Feature | Description |
| :--- | :--- |
| **HR Operations Hub** | Centralized console to oversee candidate document compliance, international visa verifications, and onboarding workflows. |
| **Lead & workload distribution** | HR Leads allocate incoming client mandates and candidate leads dynamically across Recruiters and HR Operations staff. |
| **Verification & compliance** | Conduct background screening, credential validation, visa documentation check, and embassy attestation verification. |
| **Attendance & shift logs** | Monitor operational staff biometric logins, working hours, shift timings, and departmental leave balances. |
| **Onboarding management** | Coordinate international flight bookings, client relocation packages, joining logistics, and formal HR dossier creation. |
| **SLA & performance tracking** | Measure turnaround time (TAT) on candidate documentation, visa issuance timelines, and operational milestone closures. |

---

## 5. Super Admin / Admin Dashboard

| Feature | Description |
| :--- | :--- |
| **System governance & settings** | Global configuration of system parameters, notification templates, security policies, and third-party API credentials. |
| **Employee directory & RBAC** | Add, edit, deactivate internal staff members, assign security roles (Super Admin, Admin, HR Lead, Recruiter, Placement Coordinator, HR Operations, Interviewer). |
| **Global audit trails** | Detailed logging of every critical record modification, login attempt, role switch, and candidate data export. |
| **Database & backup control** | Monitor live SQLite/Cloud database health, backup snapshots, storage utilization, and automated synchronization. |
| **Revenue & mandate metrics** | High-level executive KPI overview covering client billings, placement revenue, regional hiring performance, and active international accounts. |

---

## 6. Shared Features Across All Dashboards

| Feature | Description |
| :--- | :--- |
| **Role-based login and permissions** | Each role sees only the pages, records and actions they are authorized to access. |
| **Notifications** | In-app and email alerts for assignments, status changes, schedules and deadlines. |
| **Search and filtering** | Search only within records permitted for the signed-in user. |
| **Audit history** | Keep a record of important changes, decisions and who made them. |
| **Responsive design** | Support desktop, tablet and mobile screens. |
| **Accessibility and usability** | Provide clear labels, readable contrast, keyboard support and helpful validation messages. |
| **Security and privacy** | Use secure authentication, access controls, protected documents and appropriate data retention. |

---

## Implementation Note
Confirm user roles, approval rules, data access and integrations before development. AI screening, automated messaging, calendar integrations and WhatsApp messaging may require additional services, permissions or configuration.

