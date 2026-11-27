-- ==============================================================================
-- Full Supabase Cloud Schema Sync Migration (Idempotent)
-- Creates all missing operational/workflow tables & adds any missing columns
-- to existing tables so 100% of backend writes persist cleanly to PostgreSQL.
-- ==============================================================================

-- 1. Daily Work Reports
CREATE TABLE IF NOT EXISTS public.daily_work_reports (
  id TEXT PRIMARY KEY,
  employeeid TEXT NOT NULL,
  employeename TEXT NOT NULL,
  department TEXT,
  role TEXT,
  attendanceid TEXT,
  reportdate TEXT NOT NULL,
  shiftid TEXT,
  shiftname TEXT,
  shiftstart TEXT,
  shiftend TEXT,
  checkinat TEXT,
  checkoutat TEXT,
  workingminutesatreport INTEGER DEFAULT 0,
  workcompleted TEXT NOT NULL,
  taskscompleted TEXT NOT NULL,
  workinprogress TEXT NOT NULL,
  issuesblockers TEXT DEFAULT '',
  plannednextsteps TEXT NOT NULL,
  additionalremarks TEXT DEFAULT '',
  submissionstatus TEXT NOT NULL DEFAULT 'SUBMITTED',
  submittedat TIMESTAMPTZ DEFAULT NOW(),
  createdat TIMESTAMPTZ DEFAULT NOW(),
  updatedat TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_daily_work_reports_emp_date UNIQUE (employeeid, reportdate)
);

-- 2. Employee Shift Assignments
CREATE TABLE IF NOT EXISTS public.employee_shift_assignments (
  id TEXT PRIMARY KEY,
  employeeid TEXT NOT NULL,
  employeename TEXT NOT NULL,
  shiftid TEXT NOT NULL,
  shiftname TEXT NOT NULL,
  scheduledstarttime TEXT NOT NULL,
  scheduledendtime TEXT NOT NULL,
  scheduledlogintime TEXT NOT NULL,
  scheduledlogouttime TEXT NOT NULL,
  frequency TEXT DEFAULT 'one_day',
  startdate TEXT NOT NULL,
  enddate TEXT,
  applicabledays TEXT DEFAULT '[1,2,3,4,5,6]',
  assignedby TEXT,
  assignedbyname TEXT,
  assignedbyrole TEXT,
  assignedat TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'Active',
  notes TEXT,
  createdat TIMESTAMPTZ DEFAULT NOW(),
  updatedat TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Late Login Approval Requests
CREATE TABLE IF NOT EXISTS public.late_login_approval_requests (
  id TEXT PRIMARY KEY,
  attendanceid TEXT,
  employeeid TEXT NOT NULL,
  employeename TEXT NOT NULL,
  department TEXT,
  role TEXT,
  shiftid TEXT NOT NULL,
  shiftname TEXT NOT NULL,
  scheduledlogintime TEXT NOT NULL,
  scheduledlogouttime TEXT NOT NULL,
  actualclockintime TEXT NOT NULL,
  attendancedate TEXT NOT NULL,
  delayminutes INTEGER DEFAULT 0,
  explanation TEXT,
  status TEXT DEFAULT 'Pending Approval',
  approverid TEXT,
  approvername TEXT,
  approverrole TEXT,
  decisiontimestamp TIMESTAMPTZ,
  rejectionreason TEXT,
  createdat TIMESTAMPTZ DEFAULT NOW(),
  updatedat TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Visa & BGV Case Management Tables
CREATE TABLE IF NOT EXISTS public.visa_verification_cases (
  id TEXT PRIMARY KEY,
  candidatekey TEXT NOT NULL,
  candidateid TEXT,
  candidatename TEXT NOT NULL,
  candidateemail TEXT,
  candidatephone TEXT,
  enquiryid TEXT NOT NULL,
  applicationid TEXT DEFAULT '',
  serviceid TEXT,
  servicetype TEXT,
  destinationcountry TEXT DEFAULT 'To Be Confirmed',
  visacategory TEXT DEFAULT 'Needs Assessment',
  purpose TEXT,
  assignedemployeeid TEXT,
  assignedemployeename TEXT,
  visarequired INTEGER DEFAULT 1,
  requirementstatus TEXT DEFAULT 'Needs Assessment',
  documentstatus TEXT DEFAULT 'Pending Documents',
  eligibilitystatus TEXT DEFAULT 'Eligibility Assessment Pending',
  casestatus TEXT DEFAULT 'Needs Assessment',
  assessmentnotes TEXT,
  assignedreviewerid TEXT,
  assignedreviewername TEXT,
  submissiondate TEXT,
  applicationrefnumber TEXT,
  officialdecision TEXT DEFAULT 'Pending',
  officialdecisiondate TEXT,
  officialdecisionnotes TEXT,
  requireddocsjson TEXT,
  createdat TIMESTAMPTZ DEFAULT NOW(),
  updatedat TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (enquiryid, applicationid)
);

CREATE TABLE IF NOT EXISTS public.visa_case_documents (
  id TEXT PRIMARY KEY,
  caseid TEXT,
  candidatekey TEXT NOT NULL,
  enquiryid TEXT,
  docname TEXT NOT NULL,
  doctype TEXT NOT NULL,
  fileurl TEXT,
  filedata TEXT,
  mimetype TEXT,
  filesize TEXT,
  submittedat TIMESTAMPTZ DEFAULT NOW(),
  verificationstatus TEXT DEFAULT 'Pending',
  reviewerid TEXT,
  reviewername TEXT,
  remarks TEXT,
  missingorcorrectionnote TEXT,
  reviewedat TIMESTAMPTZ,
  updatedat TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.visa_case_bgv_records (
  id TEXT PRIMARY KEY,
  candidatekey TEXT NOT NULL,
  enquiryid TEXT,
  checktype TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  progress TEXT DEFAULT '0%',
  reviewerid TEXT,
  reviewername TEXT,
  notes TEXT,
  createdat TIMESTAMPTZ DEFAULT NOW(),
  updatedat TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.visa_case_activities (
  id TEXT PRIMARY KEY,
  caseid TEXT,
  candidatekey TEXT NOT NULL,
  enquiryid TEXT,
  action TEXT NOT NULL,
  details TEXT,
  actorid TEXT,
  actorname TEXT,
  actorrole TEXT,
  createdat TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Auxiliary Portal & Compliance Tables
CREATE TABLE IF NOT EXISTS public.consulting_bookings (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  serviceid TEXT,
  servicetitle TEXT,
  appointmentdate TEXT,
  appointmenttime TEXT,
  consultantname TEXT,
  notes TEXT,
  status TEXT DEFAULT 'Scheduled',
  createdat TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_tasks (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  assignedto TEXT,
  assignedby TEXT,
  priority TEXT DEFAULT 'Normal',
  duedate TEXT,
  status TEXT DEFAULT 'To Do',
  createdat TIMESTAMPTZ DEFAULT NOW(),
  updatedat TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.candidate_visa_assessments (
  id TEXT PRIMARY KEY,
  candidateid TEXT,
  candidateemail TEXT,
  candidatename TEXT,
  targetcountry TEXT NOT NULL,
  qualification TEXT,
  experience TEXT,
  dob TEXT,
  language TEXT,
  score INTEGER DEFAULT 0,
  status TEXT,
  readiness TEXT,
  reasons TEXT,
  checklist TEXT,
  createdat TIMESTAMPTZ DEFAULT NOW(),
  updatedat TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.candidate_verifications (
  id TEXT PRIMARY KEY,
  caseid TEXT UNIQUE NOT NULL,
  candidateid TEXT,
  candidatename TEXT NOT NULL,
  candidateemail TEXT,
  passportnumber TEXT,
  verificationpackage TEXT NOT NULL,
  packageitems TEXT,
  overallstatus TEXT NOT NULL DEFAULT 'Submitted',
  attestationpipeline TEXT,
  employmentmilestones TEXT,
  documentsattached TEXT,
  consentaccepted INTEGER DEFAULT 1,
  remarks TEXT,
  createdat TIMESTAMPTZ DEFAULT NOW(),
  updatedat TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Add missing columns to existing tables so zero PGRST204 errors occur
ALTER TABLE IF EXISTS public.attendance_records
  ADD COLUMN IF NOT EXISTS sessionid TEXT,
  ADD COLUMN IF NOT EXISTS sessionstatus TEXT DEFAULT 'ACTIVE';

ALTER TABLE IF EXISTS public.role_login_logs
  ADD COLUMN IF NOT EXISTS logouttime TEXT,
  ADD COLUMN IF NOT EXISTS totalduration TEXT,
  ADD COLUMN IF NOT EXISTS sessionid TEXT;

ALTER TABLE IF EXISTS public.hr_task_assignments
  ADD COLUMN IF NOT EXISTS assignmentstatus TEXT,
  ADD COLUMN IF NOT EXISTS completionnotes TEXT,
  ADD COLUMN IF NOT EXISTS iscompleted INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS serviceid TEXT;

ALTER TABLE IF EXISTS public.leads
  ADD COLUMN IF NOT EXISTS assignedat TEXT,
  ADD COLUMN IF NOT EXISTS assignedby TEXT,
  ADD COLUMN IF NOT EXISTS assignmentnotes TEXT,
  ADD COLUMN IF NOT EXISTS assignmentstatus TEXT,
  ADD COLUMN IF NOT EXISTS operationteam TEXT;

ALTER TABLE IF EXISTS public.candidates
  ADD COLUMN IF NOT EXISTS offerdetails TEXT,
  ADD COLUMN IF NOT EXISTS placementstatus TEXT;

ALTER TABLE IF EXISTS public.candidate_applications
  ADD COLUMN IF NOT EXISTS offerdetails TEXT;

ALTER TABLE IF EXISTS public.candidate_profiles
  ADD COLUMN IF NOT EXISTS offerdetails TEXT;

ALTER TABLE IF EXISTS public.interviews
  ADD COLUMN IF NOT EXISTS feedback TEXT,
  ADD COLUMN IF NOT EXISTS meetinglink TEXT,
  ADD COLUMN IF NOT EXISTS panelists TEXT,
  ADD COLUMN IF NOT EXISTS rating INTEGER,
  ADD COLUMN IF NOT EXISTS result TEXT,
  ADD COLUMN IF NOT EXISTS roundtype TEXT;

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS password TEXT;

-- 7. Permissive RLS policies for server API access on all newly created tables
DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY[
    'daily_work_reports',
    'employee_shift_assignments',
    'late_login_approval_requests',
    'visa_verification_cases',
    'visa_case_documents',
    'visa_case_bgv_records',
    'visa_case_activities',
    'consulting_bookings',
    'hr_tasks',
    'candidate_visa_assessments',
    'candidate_verifications'
  ];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_all_policy" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "%s_all_policy" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;
