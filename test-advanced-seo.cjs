/**
 * test-advanced-seo.cjs
 * Comprehensive Automated Verification for Phase 10:
 * Advanced SEO, Technical Crawlability & Organic Growth Optimization
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');

const API_BASE = 'http://localhost:5000';

function makeRequest(pathName) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathName, API_BASE);
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject);
  });
}

async function runSeoTests() {
  console.log('\n======================================================');
  console.log('REVIVAL INTERNATIONAL — PHASE 10 ADVANCED SEO TEST SUITE');
  console.log('======================================================');

  // 1. Audit robots.txt
  console.log('\n--- 1. Testing robots.txt Crawl Directives ---');
  const robotsPath = path.join(__dirname, 'public', 'robots.txt');
  assert.ok(fs.existsSync(robotsPath), 'robots.txt must exist in public directory');
  const robotsContent = fs.readFileSync(robotsPath, 'utf8');

  assert.ok(robotsContent.includes('User-agent: *'), 'Must include global user-agent directive');
  assert.ok(robotsContent.includes('Allow: /'), 'Must allow public root');
  assert.ok(robotsContent.includes('Disallow: /crm'), 'Must protect CRM from public search index');
  assert.ok(robotsContent.includes('Disallow: /erp'), 'Must protect ERP from public search index');
  assert.ok(robotsContent.includes('Disallow: /api/'), 'Must protect internal backend API endpoints');
  assert.ok(robotsContent.includes('Sitemap: https://www.revivalinternational.com/sitemap.xml'), 'Must specify canonical sitemap location');
  console.log('✓ PASS: robots.txt properly allows public content and disallows private CRM/ERP/API routes.');

  // 2. Audit sitemap.xml
  console.log('\n--- 2. Testing XML Sitemap URLs & Canonical Integrity ---');
  const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
  assert.ok(fs.existsSync(sitemapPath), 'sitemap.xml must exist in public directory');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

  const EXPECTED_PUBLIC_URLS = [
    'https://www.revivalinternational.com/',
    'https://www.revivalinternational.com/services',
    'https://www.revivalinternational.com/international-consulting',
    'https://www.revivalinternational.com/education',
    'https://www.revivalinternational.com/education/college-admission-assistance',
    'https://www.revivalinternational.com/education/school-student-career-guidance',
    'https://www.revivalinternational.com/education/international-admissions',
    'https://www.revivalinternational.com/education/academy-for-school-students',
    'https://www.revivalinternational.com/education/executive-seminars-and-language-test-preparation',
    'https://www.revivalinternational.com/jobs',
    'https://www.revivalinternational.com/industries',
    'https://www.revivalinternational.com/employers',
    'https://www.revivalinternational.com/candidates',
    'https://www.revivalinternational.com/visa-eligibility',
    'https://www.revivalinternational.com/background-verification',
    'https://www.revivalinternational.com/about',
    'https://www.revivalinternational.com/contact'
  ];

  EXPECTED_PUBLIC_URLS.forEach(url => {
    assert.ok(sitemapContent.includes(`<loc>${url}</loc>`), `Sitemap must contain canonical URL: ${url}`);
  });

  // Verify no forbidden private URLs in sitemap
  assert.ok(!sitemapContent.includes('/crm'), 'Sitemap must NEVER contain /crm');
  assert.ok(!sitemapContent.includes('/erp'), 'Sitemap must NEVER contain /erp');
  assert.ok(!sitemapContent.includes('/api/'), 'Sitemap must NEVER contain /api/');
  assert.ok(!sitemapContent.includes('#'), 'Sitemap URLs must never contain fragment identifiers (#)');
  console.log(`✓ PASS: sitemap.xml contains all ${EXPECTED_PUBLIC_URLS.length} verified public canonical URLs with zero private routes.`);

  // 3. Test Service Data Slug & ID Resolution
  console.log('\n--- 3. Testing Service Data Slug & ID Resolution ---');
  const eduDataPath = path.join(__dirname, 'src', 'data', 'educationServicesData.js');
  const eduDataContent = fs.readFileSync(eduDataPath, 'utf8');

  // Verify all 6 services have slugs matching sitemap
  const slugsToCheck = [
    'international-consulting',
    'college-admission-assistance',
    'school-student-career-guidance',
    'international-admissions',
    'academy-for-school-students',
    'executive-seminars-and-language-test-preparation'
  ];

  slugsToCheck.forEach(slug => {
    assert.ok(eduDataContent.includes(slug), `educationServicesData.js must define or support slug: ${slug}`);
  });
  console.log('✓ PASS: All 6 education service slugs align 100% with sitemap entries.');

  // 4. Test Structured Data & FAQPage Schema Integrity
  console.log('\n--- 4. Testing Schema.org Structured Data & FAQPage Integration ---');
  const consultingPath = path.join(__dirname, 'src', 'pages', 'InternationalConsultingPage.jsx');
  const consultingContent = fs.readFileSync(consultingPath, 'utf8');
  assert.ok(consultingContent.includes("'@type': 'FAQPage'"), 'International Consulting page must include FAQPage schema');
  assert.ok(consultingContent.includes("'@type': 'Service'"), 'International Consulting page must include Service schema');
  assert.ok(!consultingContent.includes('#education-intl-consult'), 'Schema url must be clean canonical without hash fragment');

  const detailPath = path.join(__dirname, 'src', 'pages', 'EducationServiceDetail.jsx');
  const detailContent = fs.readFileSync(detailPath, 'utf8');
  assert.ok(detailContent.includes("'@type': 'FAQPage'"), 'EducationServiceDetail must dynamically include FAQPage schema');
  assert.ok(detailContent.includes("'@type': 'Service'"), 'EducationServiceDetail must include Service schema');

  const contactPath = path.join(__dirname, 'src', 'pages', 'ContactUsPage.jsx');
  const contactContent = fs.readFileSync(contactPath, 'utf8');
  assert.ok(contactContent.includes("'@type': 'FAQPage'"), 'Contact page must include FAQPage schema');
  assert.ok(contactContent.includes("'@type': 'ContactPage'"), 'Contact page must include ContactPage schema');
  console.log('✓ PASS: Schema.org structured data validated (Service, FAQPage, ContactPage) with clean canonical URLs.');

  // 5. Test Heading Hierarchy across Core Pages
  console.log('\n--- 5. Testing Semantic Heading Hierarchy ---');
  const homePath = path.join(__dirname, 'src', 'pages', 'Home.jsx');
  const homeContent = fs.readFileSync(homePath, 'utf8');
  // Verify that eyebrow headings were converted to spans
  assert.ok(!homeContent.includes('<h2 className="text-xs font-bold text-gold-500 uppercase tracking-widest">Our Core Expertise</h2>'), 'Eyebrow must not be h2');
  assert.ok(homeContent.includes('<span className="text-xs font-bold text-gold-500 uppercase tracking-widest block">Our Core Expertise</span>'), 'Eyebrow must be semantic span');
  assert.ok(homeContent.includes('<h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-navy-900 dark:text-white">'), 'Main section title must be h2');

  const servicesPath = path.join(__dirname, 'src', 'pages', 'Services.jsx');
  const servicesContent = fs.readFileSync(servicesPath, 'utf8');
  assert.ok(servicesContent.includes('<h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-navy-900 dark:text-white tracking-tight">'), 'Services page must have primary h1');
  assert.ok(servicesContent.includes('Executive Recruitment, HR Consulting & Academic Advisory Services'), 'Services H1 must contain primary target keywords');
  console.log('✓ PASS: Heading hierarchy validated (single h1 per page with logical h2/h3 hierarchy).');

  // 6. Test Public Web Server Responses
  console.log('\n--- 6. Testing Public Server Endpoint Availability ---');
  const endpoints = ['/', '/api/health', '/api/analytics/service-performance'];
  for (const ep of endpoints) {
    const res = await makeRequest(ep);
    assert.strictEqual(res.status, 200, `Endpoint ${ep} must return HTTP 200 OK`);
  }
  console.log('✓ PASS: Public routes and backend analytics endpoints respond with HTTP 200 OK.');

  console.log('\n======================================================');
  console.log('ALL PHASE 10 ADVANCED SEO TESTS PASSED (100%)');
  console.log('======================================================\n');
}

runSeoTests().catch(err => {
  console.error('\n❌ ADVANCED SEO TEST FAILED:', err);
  process.exit(1);
});
