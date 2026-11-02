const assert = require('assert');
const fs = require('fs');
const path = require('path');

async function testSchoolAcademyRelatedServices() {
  console.log('================================================================');
  console.log('  TESTING RELATED ACADEMIC ADVISORY SERVICES IN SCHOOL ACADEMY');
  console.log('================================================================\n');

  const pagePath = path.join(__dirname, 'src', 'pages', 'StudentAcademyPage.jsx');
  const pageContent = fs.readFileSync(pagePath, 'utf8');

  // 1. Heading and View All Services Link
  console.log('--- 1. Testing Section Header & Navigation Link ---');
  assert(pageContent.includes('Related Academic Advisory Services'), 'Must contain "Related Academic Advisory Services" heading');
  assert(pageContent.includes('View All Services'), 'Must contain "View All Services" link');
  assert(pageContent.includes("navigateTo('education')"), 'Must wire "View All Services" to navigateTo("education")');
  console.log('✅ PASS: Heading and View All Services navigation verified');

  // 2. Card 1: Career Guidance
  console.log('\n--- 2. Testing Card 1: Career Guidance ---');
  assert(pageContent.includes('CAREER GUIDANCE'), 'Card 1 must have badge "CAREER GUIDANCE"');
  assert(pageContent.includes('Career Guidance'), 'Card 1 must have title "Career Guidance"');
  assert(
    pageContent.includes('Explore undergraduate and postgraduate courses, compare degrees, and discover academic pathways aligned with your interests and career goals.'),
    'Card 1 must contain the exact description specified'
  );
  assert(pageContent.includes("navigateTo('education-school-career')"), 'Card 1 View Details must navigate to "education-school-career"');
  assert(pageContent.includes("handleInquireService('school-career')"), 'Card 1 Inquire must trigger handleInquireService("school-career")');
  console.log('✅ PASS: Card 1 (Career Guidance) badge, title, description, routes & enquiry action verified');

  // 3. Card 2: College Admission Assistance
  console.log('\n--- 3. Testing Card 2: College Admission Assistance ---');
  assert(pageContent.includes('ADMISSIONS'), 'Card 2 must have badge "ADMISSIONS"');
  assert(pageContent.includes('College Admission Assistance'), 'Card 2 must have title "College Admission Assistance"');
  assert(
    pageContent.includes('Get guidance on college selection, course eligibility, admission requirements, and application pathways for undergraduate and postgraduate programmes.'),
    'Card 2 must contain the exact description specified'
  );
  assert(pageContent.includes("navigateTo('education-college-adm')"), 'Card 2 View Details must navigate to "education-college-adm"');
  assert(pageContent.includes("handleInquireService('college-adm')"), 'Card 2 Inquire must trigger handleInquireService("college-adm")');
  console.log('✅ PASS: Card 2 (College Admission Assistance) badge, title, description, routes & enquiry action verified');

  // 4. Modal Integration & Layout
  console.log('\n--- 4. Testing Modal Integration & Responsive Grid ---');
  assert(pageContent.includes('<EducationEnquiryModal'), 'Must embed EducationEnquiryModal');
  assert(pageContent.includes('grid grid-cols-1 sm:grid-cols-2 gap-6'), 'Must use 2-column responsive grid on desktop and 1-column on mobile');
  assert(pageContent.includes('glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800'), 'Must use verified theme card styling');
  console.log('✅ PASS: Consultation modal integration & responsive theme grid verified');

  // 5. Existing Views Preservation
  console.log('\n--- 5. Testing Existing Views Preservation ---');
  assert(pageContent.includes('<ExamDirectoryView'), 'Must preserve ExamDirectoryView');
  assert(pageContent.includes('<ExamEnquiryView'), 'Must preserve ExamEnquiryView');
  assert(pageContent.includes('<AcademyDetailView'), 'Must preserve AcademyDetailView');
  assert(pageContent.includes('<CourseEnquiryView'), 'Must preserve CourseEnquiryView');
  console.log('✅ PASS: All 4 core academy navigation views preserved intact');

  console.log('\n================================================================');
  console.log('  ALL RELATED ADVISORY SERVICES CHECKS PASSED (100%)');
  console.log('================================================================\n');
}

testSchoolAcademyRelatedServices().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});

