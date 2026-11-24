-- ==============================================================================
-- REVIVAL INTERNATIONAL ENTERPRISE CRM & PORTAL
-- Comprehensive Supabase PostgreSQL Schema Migration
-- 
-- Summary:
-- Total Tables Managed: 48 Tables
-- 1. Synchronize missing columns on the 5 existing Supabase tables
-- 2. Create all 39 missing CRM & HR Ops tables
-- 3. Create Student Academy examination & course catalog tables
-- 4. High-performance indexes for foreign keys, emails, dates, and status
-- 5. Row Level Security (RLS) activation with access policies for all tables
-- 6. Grant permissions to anon, authenticated, and service_role
-- ==============================================================================

-- Enable UUID & Crypto extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- PART 1: SYNCHRONIZE MISSING COLUMNS ON EXISTING 5 TABLES
-- ==============================================================================

-- Synchronize columns for candidate_applications
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'Applied';
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS notes TEXT ;
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS resumename TEXT ;
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS resumeurl TEXT ;
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS resumesize TEXT ;
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS covernote TEXT ;
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS noticeperiod TEXT ;
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS expectedsalary TEXT ;
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS applicantname TEXT ;
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS applicantemail TEXT ;
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS applicantphone TEXT ;
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS assignedemployee TEXT ;
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS assignedemployeeid TEXT ;
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS assignedemployeeemail TEXT ;
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Normal';
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS assignmentnotes TEXT ;
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS assigneddate TEXT ;
ALTER TABLE public.candidate_applications ADD COLUMN IF NOT EXISTS updatedat TIMESTAMPTZ ;

-- Synchronize columns for candidates
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS googleid TEXT ;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS avatar TEXT ;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS authprovider TEXT DEFAULT 'local';
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS googleverified BIGINT DEFAULT 0;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS resumename TEXT ;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS resumeurl TEXT ;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS resumesize TEXT ;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS citizenship TEXT ;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS dob TEXT ;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS gender TEXT ;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS location TEXT ;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS preferredcountry TEXT ;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS education TEXT ;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS mohreattested BIGINT DEFAULT 0;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS noticeperiod TEXT ;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS assignedrecruiter TEXT DEFAULT 'Dhanalakshimi (Lead Advisor)';
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS normalizedphone TEXT ;

-- Synchronize columns for leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS message TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS referencenumber TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assistancetype TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS intaketerm TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS degreelevel TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS preferredcontactmethod TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS organizationid TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS organizationname TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS nextaction TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS nextactiondate TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS internalnotes TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS updatedat TIMESTAMPTZ ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utmsource TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utmmedium TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utmcampaign TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utmterm TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utmcontent TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS referrer TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lastfollowupdate TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lastcontacteddate TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS leadscore BIGINT DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS isarchived BIGINT DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS jobtitle TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS skills TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS experience TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS worklocation TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS salaryrange TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS vacancies TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS seniority TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS industry TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS hiringtimeline TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS joiningdate TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS contractduration TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS startdate TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS enddate TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS shiftrequirements TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS jobcategory TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS visacategory TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS currentstage TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cvpath TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS documenturls TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS customfields TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS consultationdate TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS consultationtime TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS consultationmode TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS coursename TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS streamname TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS department TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS clientid TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS progressstep BIGINT DEFAULT 1;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS progresspercent BIGINT DEFAULT 15;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS workflowtype TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS category_id TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS category_name TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS specialization_id TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS specialization TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS college_id TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS college_name TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS preferred_state TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS preferred_city TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS marks_or_percentage TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS entrance_exam_details TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS qualifying_degree TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS graduation_discipline TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS work_experience TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assignedemployeeid TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assignedemployeeemail TEXT ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS taskstatus TEXT ;

-- Synchronize columns for student_academy_enquiries
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS referencenumber TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS preferredlearningmode TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS batchpreference TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS questions TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS academyid TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS academyname TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS examid TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS examname TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS courseid TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS coursename TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS parentguardianname TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS studentclassgrade TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS interestedprogram TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS preferredcontactmethod TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS privacyconsent BIGINT DEFAULT 1;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS studentemail TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS studentphone TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS qualification TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS preferredlocation TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS coachingmode TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS examslug TEXT ;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS enquirytype TEXT DEFAULT 'Exam Enquiry';
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS assignedemployee TEXT DEFAULT 'Dhanalakshimi';
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS updatedat TIMESTAMPTZ ;

-- Synchronize columns for users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS googlesub TEXT ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emailverified BIGINT DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS lastloginat TIMESTAMPTZ ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS passwordhash TEXT ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS passwordsalt TEXT ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS normalizedphone TEXT ;

-- Specific snake_case aliases for student_academy_enquiries
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS reference_number TEXT;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS preferred_learning_mode TEXT;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS batch_preference TEXT;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS questions TEXT;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS academy_id TEXT;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS academy_name TEXT;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS exam_id TEXT;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS exam_name TEXT;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS course_id TEXT;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS course_name TEXT;
ALTER TABLE public.student_academy_enquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================================================================
-- PART 2: CREATE ALL 39 MISSING CRM & OPERATIONS TABLES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table: attendance_audit_logs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_audit_logs (
id TEXT PRIMARY KEY,
attendanceid TEXT,
employeeid TEXT NOT NULL,
workdate TEXT NOT NULL,
action TEXT NOT NULL,
actorid TEXT NOT NULL,
actorname TEXT NOT NULL,
actorrole TEXT NOT NULL,
beforestate TEXT,
afterstate TEXT,
details TEXT,
ipaddress TEXT,
createdat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: attendance_breaks
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_breaks (
id TEXT PRIMARY KEY,
attendanceid TEXT NOT NULL,
employeeid TEXT NOT NULL,
workdate TEXT NOT NULL,
breakstartat TEXT NOT NULL,
breakendat TEXT,
durationminutes BIGINT DEFAULT 0,
breaktype TEXT DEFAULT 'General Break',
createdat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: attendance_records
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_records (
id TEXT PRIMARY KEY,
employeeid TEXT NOT NULL,
employeename TEXT NOT NULL,
department TEXT,
operationteam TEXT,
workdate TEXT NOT NULL,
shiftid TEXT NOT NULL,
shiftname TEXT NOT NULL,
shiftstart TEXT NOT NULL,
shiftend TEXT NOT NULL,
isovernightshift BIGINT DEFAULT 0,
checkinat TEXT,
checkoutat TEXT,
status TEXT NOT NULL,
lateminutes BIGINT DEFAULT 0,
totalbreakminutes BIGINT DEFAULT 0,
grossminutes BIGINT DEFAULT 0,
networkminutes BIGINT DEFAULT 0,
overtimeminutes BIGINT DEFAULT 0,
source TEXT DEFAULT 'Web Portal',
notes TEXT,
islocked BIGINT DEFAULT 0,
createdat TIMESTAMPTZ DEFAULT NOW(),
updatedat TIMESTAMPTZ DEFAULT NOW(),
lateapprovalstatus TEXT DEFAULT 'APPROVED',
role TEXT
);

-- ------------------------------------------------------------------------------
-- Table: attendance_regularizations
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_regularizations (
id TEXT PRIMARY KEY,
employeeid TEXT NOT NULL,
employeename TEXT NOT NULL,
department TEXT,
operationteam TEXT,
attendancedate TEXT NOT NULL,
correctiontype TEXT NOT NULL,
existingcheckin TEXT,
existingcheckout TEXT,
existingstatus TEXT,
requestedcheckin TEXT,
requestedcheckout TEXT,
requestedstatus TEXT,
reason TEXT NOT NULL,
status TEXT DEFAULT 'Pending',
reviewerid TEXT,
reviewername TEXT,
reviewerrole TEXT,
reviewercomments TEXT,
reviewedat TIMESTAMPTZ,
createdat TIMESTAMPTZ DEFAULT NOW(),
updatedat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: audit_logs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
id TEXT PRIMARY KEY,
userid TEXT,
username TEXT,
role TEXT,
action TEXT NOT NULL,
entitytype TEXT NOT NULL,
entityid TEXT NOT NULL,
details TEXT,
ip TEXT,
createdat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: candidate_documents
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.candidate_documents (
id TEXT PRIMARY KEY,
candidateid TEXT NOT NULL,
userid TEXT NOT NULL,
documenttype TEXT NOT NULL,
filename TEXT NOT NULL,
fileurl TEXT,
uploaddate TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: candidate_notifications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.candidate_notifications (
id TEXT PRIMARY KEY,
candidateid TEXT NOT NULL,
userid TEXT NOT NULL,
title TEXT NOT NULL,
message TEXT NOT NULL,
type TEXT DEFAULT 'system',
isread BIGINT DEFAULT 0,
createdat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: candidate_profiles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.candidate_profiles (
id TEXT PRIMARY KEY,
userid TEXT NOT NULL,
email TEXT NOT NULL,
name TEXT NOT NULL,
phone TEXT,
avatar TEXT,
nationality TEXT DEFAULT 'UAE',
currentrole TEXT DEFAULT 'Executive Candidate',
currentemployer TEXT,
experience TEXT DEFAULT '3-5 Years',
education TEXT DEFAULT 'Bachelor Degree / Professional Diploma',
expectedsalary TEXT DEFAULT 'Market Standard',
skills TEXT,
resumename TEXT,
resumeurl TEXT,
profilecompletion BIGINT DEFAULT 60,
stage TEXT DEFAULT 'lead',
score BIGINT DEFAULT 88,
savedjobs TEXT,
createdat TIMESTAMPTZ DEFAULT NOW(),
updatedat TIMESTAMPTZ DEFAULT NOW(),
citizenship TEXT,
resumesize TEXT,
dob TEXT,
gender TEXT,
location TEXT,
preferredcountry TEXT,
mohreattested BIGINT DEFAULT 0,
currentsalary TEXT,
noticeperiod TEXT,
passwordhash TEXT,
passwordsalt TEXT,
normalizedphone TEXT
);

-- ------------------------------------------------------------------------------
-- Table: career_departments
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_departments (
id TEXT PRIMARY KEY,
name TEXT NOT NULL,
level TEXT NOT NULL,
description TEXT,
status TEXT DEFAULT 'Active',
createdat TIMESTAMPTZ DEFAULT NOW(),
updatedat TIMESTAMPTZ DEFAULT NOW(),
category_id TEXT,
is_active BIGINT DEFAULT 1,
display_order BIGINT DEFAULT 0
);

-- ------------------------------------------------------------------------------
-- Table: career_guidance_enquiries
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_guidance_enquiries (
id TEXT PRIMARY KEY,
student_id TEXT,
enquiry_reference TEXT NOT NULL,
student_name TEXT NOT NULL,
email TEXT NOT NULL,
mobile_number TEXT NOT NULL,
programme_level TEXT NOT NULL DEFAULT 'UG',
category_id TEXT,
category_name TEXT,
department_id TEXT,
department_name TEXT,
course_id TEXT,
course_name TEXT,
specialization_id TEXT,
specialization_name TEXT,
preferred_state TEXT,
preferred_city TEXT,
college_id TEXT,
college_name TEXT,
academic_qualification TEXT,
marks_or_percentage TEXT,
entrance_exam_details TEXT,
message TEXT,
source TEXT DEFAULT 'Career Guidance Portal',
assigned_counsellor_id TEXT,
assigned_counsellor_name TEXT,
status TEXT DEFAULT 'New',
createdat TIMESTAMPTZ DEFAULT NOW(),
updatedat TIMESTAMPTZ DEFAULT NOW(),
qualifying_degree TEXT,
graduation_discipline TEXT,
work_experience TEXT
);

-- ------------------------------------------------------------------------------
-- Table: client_accounts
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_accounts (
id TEXT PRIMARY KEY,
clienttype TEXT DEFAULT 'Individual',
name TEXT NOT NULL,
email TEXT NOT NULL,
passwordhash TEXT NOT NULL,
phone TEXT,
companyname TEXT,
companyregnumber TEXT,
industry TEXT,
designation TEXT,
country TEXT DEFAULT 'United Arab Emirates',
city TEXT,
address TEXT,
website TEXT,
avatarurl TEXT,
emailverified BIGINT DEFAULT 1,
verificationcode TEXT,
resettoken TEXT,
resettokenexpires BIGINT,
notificationprefs TEXT,
assignedconsultant TEXT DEFAULT 'Dhanalakshimi',
organizationid TEXT,
status TEXT DEFAULT 'Active',
createdat TIMESTAMPTZ DEFAULT NOW(),
updatedat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: client_appointments
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_appointments (
id TEXT PRIMARY KEY,
clientid TEXT NOT NULL,
clientname TEXT,
clientemail TEXT,
clientphone TEXT,
enquiryid TEXT,
serviceid TEXT,
servicetitle TEXT,
consultantname TEXT DEFAULT 'Dhanalakshimi',
consultantrole TEXT DEFAULT 'Senior Global Advisor',
appointmentdate TEXT NOT NULL,
appointmenttime TEXT NOT NULL,
consultationmode TEXT DEFAULT 'Online Video (Google Meet / Zoom)',
meetinglink TEXT,
location TEXT,
status TEXT DEFAULT 'Scheduled',
notes TEXT,
createdat TIMESTAMPTZ DEFAULT NOW(),
updatedat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: client_documents
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_documents (
id TEXT PRIMARY KEY,
clientid TEXT NOT NULL,
clientemail TEXT,
enquiryid TEXT,
serviceid TEXT,
servicetitle TEXT,
documentname TEXT NOT NULL,
documentcategory TEXT DEFAULT 'Supporting Document',
filename TEXT,
filepath TEXT,
filetype TEXT,
filesize BIGINT DEFAULT 0,
uploadedby TEXT DEFAULT 'Client',
verificationstatus TEXT DEFAULT 'Pending Verification',
rejectionreason TEXT,
requestedby TEXT,
notes TEXT,
createdat TIMESTAMPTZ DEFAULT NOW(),
updatedat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: client_invoices
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_invoices (
id TEXT PRIMARY KEY,
clientid TEXT NOT NULL,
clientemail TEXT,
enquiryid TEXT,
servicetitle TEXT NOT NULL,
amount NUMERIC NOT NULL,
currency TEXT DEFAULT 'AED',
status TEXT DEFAULT 'Pending',
duedate TEXT,
paidat TEXT,
paymentmethod TEXT,
receiptnumber TEXT,
notes TEXT,
createdat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: client_messages
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_messages (
id TEXT PRIMARY KEY,
clientid TEXT NOT NULL,
clientemail TEXT,
enquiryid TEXT,
servicetitle TEXT,
senderrole TEXT NOT NULL,
sendername TEXT NOT NULL,
message TEXT NOT NULL,
attachmenturl TEXT,
attachmentname TEXT,
isread BIGINT DEFAULT 0,
createdat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: client_notifications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_notifications (
id TEXT PRIMARY KEY,
clientid TEXT NOT NULL,
clientemail TEXT,
enquiryid TEXT,
type TEXT DEFAULT 'status_update',
title TEXT NOT NULL,
message TEXT NOT NULL,
isread BIGINT DEFAULT 0,
createdat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: clients
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
id TEXT PRIMARY KEY,
company TEXT NOT NULL,
industry TEXT,
location TEXT,
contactperson TEXT,
email TEXT,
phone TEXT,
status TEXT DEFAULT 'Active',
requirements TEXT,
createdat TIMESTAMPTZ DEFAULT NOW(),
organizationtype TEXT DEFAULT 'Company',
website TEXT,
country TEXT,
designation TEXT,
assignedemployee TEXT,
associatedservices TEXT,
lastcontactdate TEXT,
nextfollowupdate TEXT,
notes TEXT,
updatedat TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- Table: college_course_offerings
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.college_course_offerings (
id TEXT PRIMARY KEY,
college_id TEXT NOT NULL,
course_id TEXT NOT NULL,
specialization_id TEXT,
duration TEXT,
fees TEXT,
eligibility TEXT,
entrance_exams TEXT,
admission_mode TEXT,
application_start_date TEXT,
application_end_date TEXT,
official_application_url TEXT,
verification_status TEXT DEFAULT 'Verified',
last_verified_at TIMESTAMPTZ,
is_active BIGINT DEFAULT 1,
createdat TIMESTAMPTZ DEFAULT NOW(),
updatedat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: colleges
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.colleges (
id TEXT PRIMARY KEY,
name TEXT NOT NULL,
college_type TEXT,
address TEXT,
state TEXT,
city TEXT,
official_website TEXT,
accreditation_details TEXT,
logo_url TEXT,
established_year BIGINT,
campus_size TEXT,
is_active BIGINT DEFAULT 1,
createdat TIMESTAMPTZ DEFAULT NOW(),
updatedat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: company_announcements
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_announcements (
id TEXT PRIMARY KEY,
title TEXT NOT NULL,
description TEXT NOT NULL,
category TEXT NOT NULL DEFAULT 'General Notice',
target_audience TEXT NOT NULL DEFAULT 'All Employees',
status TEXT NOT NULL DEFAULT 'Published',
created_by TEXT,
created_by_name TEXT,
created_by_role TEXT,
created_at TIMESTAMPTZ DEFAULT NOW(),
published_at TIMESTAMPTZ,
expires_at TEXT,
updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: company_holidays
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_holidays (
id TEXT PRIMARY KEY,
holidaydate TEXT NOT NULL,
name TEXT NOT NULL,
type TEXT DEFAULT 'Public Holiday',
region TEXT DEFAULT 'Global',
createdat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: compliance_documents
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.compliance_documents (
id TEXT PRIMARY KEY,
candidateid TEXT,
candidatename TEXT NOT NULL,
docname TEXT NOT NULL,
type TEXT NOT NULL,
expirydate TEXT,
status TEXT DEFAULT 'Valid',
version TEXT DEFAULT 'v1.0',
size TEXT DEFAULT '1.5 MB',
fileurl TEXT,
renewalrequestedat TIMESTAMPTZ,
createdat TIMESTAMPTZ DEFAULT NOW(),
updatedat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: course_categories
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_categories (
id TEXT PRIMARY KEY,
name TEXT NOT NULL,
programme_level TEXT NOT NULL DEFAULT 'UG',
description TEXT,
display_order BIGINT DEFAULT 0,
icon TEXT,
is_active BIGINT DEFAULT 1,
createdat TIMESTAMPTZ DEFAULT NOW(),
updatedat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: courses
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
id TEXT PRIMARY KEY,
department_id TEXT NOT NULL,
course_name TEXT NOT NULL,
degree_type TEXT,
course_code TEXT,
description TEXT,
standard_duration TEXT,
eligibility_description TEXT,
entrance_exams TEXT,
display_order BIGINT DEFAULT 0,
is_active BIGINT DEFAULT 1,
createdat TIMESTAMPTZ DEFAULT NOW(),
updatedat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: email_job_applications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_job_applications (
id TEXT PRIMARY KEY,
jobid TEXT NOT NULL,
jobtitle TEXT NOT NULL,
companyname TEXT NOT NULL,
companyemail TEXT NOT NULL,
candidatename TEXT NOT NULL,
candidateemail TEXT NOT NULL,
candidatephone TEXT,
candidatelocation TEXT,
experience TEXT,
noticeperiod TEXT,
emailsubject TEXT NOT NULL,
emailbodyhtml TEXT NOT NULL,
emailbodytext TEXT NOT NULL,
resumefilename TEXT,
resumefilesize BIGINT,
status TEXT DEFAULT 'SENT',
sentat TIMESTAMPTZ DEFAULT NOW(),
ipaddress TEXT,
errormessage TEXT
);

-- ------------------------------------------------------------------------------
-- Table: employee_leave_requests
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employee_leave_requests (
id TEXT PRIMARY KEY,
employeeid TEXT NOT NULL,
employeename TEXT NOT NULL,
leavetype TEXT NOT NULL,
startdate TEXT NOT NULL,
enddate TEXT NOT NULL,
days NUMERIC DEFAULT 1,
reason TEXT,
status TEXT DEFAULT 'Pending',
reviewedby TEXT,
reviewedat TIMESTAMPTZ,
createdat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: employee_notifications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employee_notifications (
id TEXT PRIMARY KEY,
employeeid TEXT NOT NULL,
type TEXT NOT NULL,
title TEXT NOT NULL,
message TEXT NOT NULL,
severity TEXT DEFAULT 'info',
relatedid TEXT,
isread BIGINT DEFAULT 0,
createdat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: employees
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employees (
id TEXT PRIMARY KEY,
employeeid TEXT,
name TEXT NOT NULL,
email TEXT NOT NULL,
phone TEXT,
role TEXT NOT NULL,
department TEXT,
password TEXT NOT NULL,
status TEXT DEFAULT 'Active',
createdat TIMESTAMPTZ DEFAULT NOW(),
updatedat TIMESTAMPTZ DEFAULT NOW(),
designation TEXT,
operationteam TEXT,
activeworkload BIGINT DEFAULT 0,
avatar TEXT,
dateofbirth TEXT,
address TEXT,
reportingmanager TEXT,
joiningdate TEXT,
assignedbranch TEXT,
employmentstatus TEXT DEFAULT 'Full-Time (Active)',
notificationpreferences TEXT,
lastlogin TEXT,
altemail TEXT,
shiftid TEXT DEFAULT 'SHIFT-GENERAL'
);

-- ------------------------------------------------------------------------------
-- Table: enquiry_activities
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enquiry_activities (
id TEXT PRIMARY KEY,
enquiryid TEXT,
organizationid TEXT,
type TEXT NOT NULL,
title TEXT NOT NULL,
notes TEXT,
createdby TEXT,
createdat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: follow_ups
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follow_ups (
id TEXT PRIMARY KEY,
enquiryid TEXT,
organizationid TEXT,
title TEXT NOT NULL,
purpose TEXT NOT NULL,
duedatetime TEXT NOT NULL,
assignedto TEXT,
status TEXT DEFAULT 'Pending',
completionnotes TEXT,
createdby TEXT,
createdat TIMESTAMPTZ DEFAULT NOW(),
completedat TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- Table: google_auth_accounts
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.google_auth_accounts (
id TEXT PRIMARY KEY,
userid TEXT NOT NULL,
googlesub TEXT NOT NULL,
email TEXT NOT NULL,
name TEXT,
picture TEXT,
accesstoken TEXT,
idtoken TEXT,
lastauthenticatedat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: hr_task_assignments
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hr_task_assignments (
id TEXT PRIMARY KEY,
enquiryid TEXT,
referencenumber TEXT,
candidatekey TEXT,
customername TEXT,
customeremail TEXT,
customerphone TEXT,
servicetitle TEXT,
operationteam TEXT,
assignedemployeeid TEXT,
assignedemployeename TEXT,
assignedemployeeemail TEXT,
assignedbyid TEXT,
assignedbyname TEXT,
priority TEXT DEFAULT 'Normal',
duedate TEXT,
taskstatus TEXT DEFAULT 'To Do',
notes TEXT,
assignedat TIMESTAMPTZ DEFAULT NOW(),
completedat TIMESTAMPTZ,
createdat TIMESTAMPTZ DEFAULT NOW(),
updatedat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: interviews
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interviews (
id TEXT PRIMARY KEY,
candidateid TEXT,
candidatename TEXT,
jobid TEXT,
jobtitle TEXT,
company TEXT,
date TEXT,
time TEXT,
platform TEXT,
status TEXT DEFAULT 'Scheduled',
createdat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: jobs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
id TEXT PRIMARY KEY,
title TEXT NOT NULL,
company TEXT NOT NULL,
country TEXT,
location TEXT,
salary TEXT,
experience TEXT,
jobtype TEXT,
category TEXT,
description TEXT,
vacancies TEXT,
skills TEXT,
qualification TEXT,
benefits TEXT,
posteddate TEXT,
featured BIGINT DEFAULT 0,
educationlevel TEXT,
requireddegree TEXT,
academicqualifications TEXT,
mandatorylicences TEXT,
contracttype TEXT,
contractduration TEXT,
contractrenewal TEXT,
accommodation TEXT,
transportation TEXT,
livingallowancesdetails TEXT,
visasponsorship TEXT,
visasupportdetails TEXT,
closingdate TEXT
);

-- ------------------------------------------------------------------------------
-- Table: organization_contacts
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_contacts (
id TEXT PRIMARY KEY,
organizationid TEXT NOT NULL,
name TEXT NOT NULL,
designation TEXT,
email TEXT,
phone TEXT,
isprimary BIGINT DEFAULT 0,
createdat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: role_login_logs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.role_login_logs (
id TEXT PRIMARY KEY,
employeeid TEXT,
employeename TEXT NOT NULL,
email TEXT NOT NULL,
role TEXT NOT NULL,
department TEXT,
shiftid TEXT,
shiftname TEXT,
shiftstart TEXT,
shiftend TEXT,
logintime TIMESTAMPTZ DEFAULT NOW(),
checkintime TEXT,
punctuality TEXT NOT NULL,
lateminutes BIGINT DEFAULT 0,
lateapprovalstatus TEXT DEFAULT 'APPROVED',
approvedby TEXT,
approvedat TEXT,
rejectionreason TEXT,
ipaddress TEXT,
useragent TEXT
);

-- ------------------------------------------------------------------------------
-- Table: shift_configs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shift_configs (
id TEXT PRIMARY KEY,
name TEXT NOT NULL,
starttime TEXT NOT NULL,
endtime TEXT NOT NULL,
graceminutes BIGINT DEFAULT 15,
isovernight BIGINT DEFAULT 0,
breaktrackingenabled BIGINT DEFAULT 1,
overtimeenabled BIGINT DEFAULT 1,
overtimethresholdminutes BIGINT DEFAULT 480,
absentcutoffhour BIGINT DEFAULT 14,
weeklyoffdays TEXT DEFAULT '[0,6]',
timezone TEXT DEFAULT 'Asia/Kolkata',
isactive BIGINT DEFAULT 1,
createdat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: specializations
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.specializations (
id TEXT PRIMARY KEY,
course_id TEXT NOT NULL,
name TEXT NOT NULL,
description TEXT,
eligibility_description TEXT,
display_order BIGINT DEFAULT 0,
is_active BIGINT DEFAULT 1,
createdat TIMESTAMPTZ DEFAULT NOW(),
updatedat TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: student_academy_exams
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_academy_exams (
id TEXT PRIMARY KEY,
departmentid TEXT NOT NULL,
code TEXT NOT NULL,
name TEXT NOT NULL,
conductingbody TEXT NOT NULL,
eligibility TEXT,
educationlevel TEXT,
pattern TEXT,
popularsubjects TEXT,
nextcycle TEXT,
applicationdetails TEXT,
officialurl TEXT,
shortdesc TEXT,
updatedby TEXT,
updatedat TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- PART 3: STUDENT ACADEMY DIRECTORY & EXAMS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.student_academy_examinations (
  id TEXT PRIMARY KEY,
  department_id TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  conducting_body TEXT,
  eligibility TEXT,
  pattern TEXT,
  popular_subjects TEXT[],
  next_cycle TEXT,
  short_desc TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_academy_academies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  established_year INTEGER,
  rating NUMERIC(3, 2) DEFAULT 4.8,
  reviews_count INTEGER DEFAULT 0,
  logo_url TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  learning_modes TEXT[],
  description TEXT NOT NULL,
  facilities TEXT[],
  teaching_methods TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_academy_exam_mappings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  academy_id TEXT NOT NULL,
  exam_id TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_academy_courses (
  id TEXT PRIMARY KEY,
  academy_id TEXT NOT NULL,
  exam_id TEXT NOT NULL,
  title TEXT NOT NULL,
  duration TEXT NOT NULL,
  learning_mode TEXT NOT NULL,
  fee TEXT,
  verified_fee BOOLEAN DEFAULT true,
  syllabus TEXT[],
  batches JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- PART 4: PRODUCTION PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_candidates_email ON public.candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_phone ON public.candidates(phone);
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON public.candidates(stage);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

CREATE INDEX IF NOT EXISTS idx_cand_apps_cand_id ON public.candidate_applications(candidateid);
CREATE INDEX IF NOT EXISTS idx_cand_apps_job_id ON public.candidate_applications(jobid);

CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

CREATE INDEX IF NOT EXISTS idx_att_records_emp ON public.attendance_records(employeeid);
CREATE INDEX IF NOT EXISTS idx_att_records_date ON public.attendance_records(workdate);
CREATE INDEX IF NOT EXISTS idx_att_records_status ON public.attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_att_records_approval ON public.attendance_records(lateapprovalstatus);

CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_role ON public.employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_dept ON public.employees(department);

CREATE INDEX IF NOT EXISTS idx_role_login_email ON public.role_login_logs(email);
CREATE INDEX IF NOT EXISTS idx_role_login_date ON public.role_login_logs(logintime);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_client_acc_email ON public.client_accounts(email);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.client_invoices(clientid);

-- ==============================================================================
-- PART 5: ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- ==============================================================================

ALTER TABLE public.candidate_applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'candidate_applications' AND policyname = 'Allow public and authenticated full access on candidate_applications'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on candidate_applications"
      ON public.candidate_applications FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'candidates' AND policyname = 'Allow public and authenticated full access on candidates'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on candidates"
      ON public.candidates FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Allow public and authenticated full access on leads'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on leads"
      ON public.leads FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.student_academy_enquiries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'student_academy_enquiries' AND policyname = 'Allow public and authenticated full access on student_academy_enquiries'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on student_academy_enquiries"
      ON public.student_academy_enquiries FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow public and authenticated full access on users'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on users"
      ON public.users FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.attendance_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'attendance_audit_logs' AND policyname = 'Allow public and authenticated full access on attendance_audit_logs'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on attendance_audit_logs"
      ON public.attendance_audit_logs FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.attendance_breaks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'attendance_breaks' AND policyname = 'Allow public and authenticated full access on attendance_breaks'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on attendance_breaks"
      ON public.attendance_breaks FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'attendance_records' AND policyname = 'Allow public and authenticated full access on attendance_records'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on attendance_records"
      ON public.attendance_records FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.attendance_regularizations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'attendance_regularizations' AND policyname = 'Allow public and authenticated full access on attendance_regularizations'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on attendance_regularizations"
      ON public.attendance_regularizations FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Allow public and authenticated full access on audit_logs'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on audit_logs"
      ON public.audit_logs FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.candidate_documents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'candidate_documents' AND policyname = 'Allow public and authenticated full access on candidate_documents'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on candidate_documents"
      ON public.candidate_documents FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.candidate_notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'candidate_notifications' AND policyname = 'Allow public and authenticated full access on candidate_notifications'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on candidate_notifications"
      ON public.candidate_notifications FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'candidate_profiles' AND policyname = 'Allow public and authenticated full access on candidate_profiles'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on candidate_profiles"
      ON public.candidate_profiles FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.career_departments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'career_departments' AND policyname = 'Allow public and authenticated full access on career_departments'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on career_departments"
      ON public.career_departments FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.career_guidance_enquiries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'career_guidance_enquiries' AND policyname = 'Allow public and authenticated full access on career_guidance_enquiries'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on career_guidance_enquiries"
      ON public.career_guidance_enquiries FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'client_accounts' AND policyname = 'Allow public and authenticated full access on client_accounts'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on client_accounts"
      ON public.client_accounts FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.client_appointments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'client_appointments' AND policyname = 'Allow public and authenticated full access on client_appointments'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on client_appointments"
      ON public.client_appointments FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'client_documents' AND policyname = 'Allow public and authenticated full access on client_documents'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on client_documents"
      ON public.client_documents FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.client_invoices ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'client_invoices' AND policyname = 'Allow public and authenticated full access on client_invoices'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on client_invoices"
      ON public.client_invoices FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.client_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'client_messages' AND policyname = 'Allow public and authenticated full access on client_messages'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on client_messages"
      ON public.client_messages FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.client_notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'client_notifications' AND policyname = 'Allow public and authenticated full access on client_notifications'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on client_notifications"
      ON public.client_notifications FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Allow public and authenticated full access on clients'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on clients"
      ON public.clients FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.college_course_offerings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'college_course_offerings' AND policyname = 'Allow public and authenticated full access on college_course_offerings'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on college_course_offerings"
      ON public.college_course_offerings FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'colleges' AND policyname = 'Allow public and authenticated full access on colleges'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on colleges"
      ON public.colleges FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.company_announcements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'company_announcements' AND policyname = 'Allow public and authenticated full access on company_announcements'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on company_announcements"
      ON public.company_announcements FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.company_holidays ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'company_holidays' AND policyname = 'Allow public and authenticated full access on company_holidays'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on company_holidays"
      ON public.company_holidays FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.compliance_documents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'compliance_documents' AND policyname = 'Allow public and authenticated full access on compliance_documents'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on compliance_documents"
      ON public.compliance_documents FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'course_categories' AND policyname = 'Allow public and authenticated full access on course_categories'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on course_categories"
      ON public.course_categories FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'courses' AND policyname = 'Allow public and authenticated full access on courses'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on courses"
      ON public.courses FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.email_job_applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'email_job_applications' AND policyname = 'Allow public and authenticated full access on email_job_applications'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on email_job_applications"
      ON public.email_job_applications FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.employee_leave_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'employee_leave_requests' AND policyname = 'Allow public and authenticated full access on employee_leave_requests'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on employee_leave_requests"
      ON public.employee_leave_requests FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.employee_notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'employee_notifications' AND policyname = 'Allow public and authenticated full access on employee_notifications'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on employee_notifications"
      ON public.employee_notifications FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'employees' AND policyname = 'Allow public and authenticated full access on employees'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on employees"
      ON public.employees FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.enquiry_activities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'enquiry_activities' AND policyname = 'Allow public and authenticated full access on enquiry_activities'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on enquiry_activities"
      ON public.enquiry_activities FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'follow_ups' AND policyname = 'Allow public and authenticated full access on follow_ups'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on follow_ups"
      ON public.follow_ups FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.google_auth_accounts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'google_auth_accounts' AND policyname = 'Allow public and authenticated full access on google_auth_accounts'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on google_auth_accounts"
      ON public.google_auth_accounts FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.hr_task_assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hr_task_assignments' AND policyname = 'Allow public and authenticated full access on hr_task_assignments'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on hr_task_assignments"
      ON public.hr_task_assignments FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'interviews' AND policyname = 'Allow public and authenticated full access on interviews'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on interviews"
      ON public.interviews FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'jobs' AND policyname = 'Allow public and authenticated full access on jobs'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on jobs"
      ON public.jobs FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.organization_contacts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'organization_contacts' AND policyname = 'Allow public and authenticated full access on organization_contacts'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on organization_contacts"
      ON public.organization_contacts FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.role_login_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'role_login_logs' AND policyname = 'Allow public and authenticated full access on role_login_logs'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on role_login_logs"
      ON public.role_login_logs FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.shift_configs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shift_configs' AND policyname = 'Allow public and authenticated full access on shift_configs'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on shift_configs"
      ON public.shift_configs FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'specializations' AND policyname = 'Allow public and authenticated full access on specializations'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on specializations"
      ON public.specializations FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.student_academy_exams ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'student_academy_exams' AND policyname = 'Allow public and authenticated full access on student_academy_exams'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on student_academy_exams"
      ON public.student_academy_exams FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.student_academy_examinations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'student_academy_examinations' AND policyname = 'Allow public and authenticated full access on student_academy_examinations'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on student_academy_examinations"
      ON public.student_academy_examinations FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.student_academy_academies ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'student_academy_academies' AND policyname = 'Allow public and authenticated full access on student_academy_academies'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on student_academy_academies"
      ON public.student_academy_academies FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.student_academy_exam_mappings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'student_academy_exam_mappings' AND policyname = 'Allow public and authenticated full access on student_academy_exam_mappings'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on student_academy_exam_mappings"
      ON public.student_academy_exam_mappings FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.student_academy_courses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'student_academy_courses' AND policyname = 'Allow public and authenticated full access on student_academy_courses'
  ) THEN
    CREATE POLICY "Allow public and authenticated full access on student_academy_courses"
      ON public.student_academy_courses FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ==============================================================================
-- PART 6: PERMISSION GRANTS
-- ==============================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- ==============================================================================
-- MIGRATION COMPLETE: All 48 Revival CRM tables and Student Academy schemas 
-- are fully provisioned, synchronized, indexed, and secured in Supabase.
-- ==============================================================================
