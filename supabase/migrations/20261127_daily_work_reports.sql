-- Daily Work Reports table for Revival International CRM
-- Enforces one daily report per employee per workday and coordinates with attendance checkout.

CREATE TABLE IF NOT EXISTS daily_work_reports (
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

CREATE INDEX IF NOT EXISTS idx_daily_work_reports_emp ON daily_work_reports(employeeid);
CREATE INDEX IF NOT EXISTS idx_daily_work_reports_date ON daily_work_reports(reportdate);
CREATE INDEX IF NOT EXISTS idx_daily_work_reports_att ON daily_work_reports(attendanceid);

ALTER TABLE daily_work_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_work_reports_select_policy" ON daily_work_reports;
CREATE POLICY "daily_work_reports_select_policy"
  ON daily_work_reports
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "daily_work_reports_insert_policy" ON daily_work_reports;
CREATE POLICY "daily_work_reports_insert_policy"
  ON daily_work_reports
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "daily_work_reports_update_policy" ON daily_work_reports;
CREATE POLICY "daily_work_reports_update_policy"
  ON daily_work_reports
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
