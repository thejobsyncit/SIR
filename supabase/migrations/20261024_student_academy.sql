-- ========================================================
-- Revival International: Student Academy Module Migration
-- Tables, Constraints, and Row Level Security (RLS)
-- ========================================================

-- 1. Competitive Examinations
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

-- 2. Verified Partner Academies
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

-- 3. Academy - Examination Mapping
CREATE TABLE IF NOT EXISTS public.student_academy_exam_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id TEXT NOT NULL REFERENCES public.student_academy_academies(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL REFERENCES public.student_academy_examinations(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(academy_id, exam_id)
);

-- 4. Academy Courses
CREATE TABLE IF NOT EXISTS public.student_academy_courses (
  id TEXT PRIMARY KEY,
  academy_id TEXT NOT NULL REFERENCES public.student_academy_academies(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL REFERENCES public.student_academy_examinations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration TEXT NOT NULL,
  learning_mode TEXT NOT NULL,
  fee TEXT,
  verified_fee BOOLEAN DEFAULT true,
  syllabus TEXT[],
  batches JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Student Course Enquiries
CREATE TABLE IF NOT EXISTS public.student_academy_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_learning_mode TEXT,
  batch_preference TEXT,
  questions TEXT,
  academy_id TEXT NOT NULL REFERENCES public.student_academy_academies(id),
  academy_name TEXT NOT NULL,
  exam_id TEXT NOT NULL REFERENCES public.student_academy_examinations(id),
  exam_name TEXT NOT NULL,
  course_id TEXT NOT NULL REFERENCES public.student_academy_courses(id),
  course_name TEXT NOT NULL,
  status TEXT DEFAULT 'New Enquiry',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_sa_exam_department ON public.student_academy_examinations(department_id);
CREATE INDEX IF NOT EXISTS idx_sa_mapping_exam ON public.student_academy_exam_mappings(exam_id);
CREATE INDEX IF NOT EXISTS idx_sa_courses_academy_exam ON public.student_academy_courses(academy_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_sa_enquiries_created ON public.student_academy_enquiries(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.student_academy_examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academy_academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academy_exam_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academy_enquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public read access for directory data
CREATE POLICY "Allow public read access to examinations"
  ON public.student_academy_examinations FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to verified academies"
  ON public.student_academy_academies FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to academy exam mappings"
  ON public.student_academy_exam_mappings FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to academy courses"
  ON public.student_academy_courses FOR SELECT
  USING (true);

-- Student Enquiries: Public insert allowed (prospective students submitting inquiries)
CREATE POLICY "Allow prospective students to insert course enquiries"
  ON public.student_academy_enquiries FOR INSERT
  WITH CHECK (true);

-- Student Enquiries: Only authenticated advisors / staff can view all enquiries
CREATE POLICY "Allow authenticated staff to view course enquiries"
  ON public.student_academy_enquiries FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated staff to update course enquiry status"
  ON public.student_academy_enquiries FOR UPDATE
  USING (auth.role() = 'authenticated');
