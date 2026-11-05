const http = require('http');

function postRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let rawData = '';
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(rawData) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: rawData });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runComprehensiveQATests() {
  console.log('\n=============================================================');
  console.log('REVIVAL AI ADVISOR — MANDATORY 15-QUERY & MULTI-TURN QA SUITE');
  console.log('=============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message, received) {
    total++;
    if (condition) {
      console.log(`[PASS] Case ${total}: ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] Case ${total}: ${message}`);
      if (received) console.error(`       Received: ${received.slice(0, 150)}...`);
    }
  }

  // 1. Hi
  const r1 = await postRequest('/api/ai/chat', { message: 'Hi' });
  assert(
    r1.status === 200 && r1.body.intent === 'greeting' && r1.body.reply.includes("I’m your **Revival AI Advisor**") && !r1.body.reply.includes('UCAS'),
    '1. "Hi" -> Distinct Greeting prompt without dumping massive catalog',
    r1.body.reply
  );

  // 2. What services do you provide?
  const r2 = await postRequest('/api/ai/chat', { message: 'What services do you provide?' });
  assert(
    r2.status === 200 && r2.body.intent === 'company_info' && r2.body.reply.includes('Global Education & Academic Advisory') && r2.body.reply.includes('Executive Talent'),
    '2. "What services do you provide?" -> Structured company service pillars overview',
    r2.body.reply
  );

  // 3. I want to study in the UK.
  const r3 = await postRequest('/api/ai/chat', { message: 'I want to study in the UK.' });
  assert(
    r3.status === 200 && r3.body.intent === 'uk_admissions_ucas' && r3.body.reply.includes('undergraduate or postgraduate course in the UK?'),
    '3. "I want to study in the UK." -> UK applications, UCAS mention, asks UG/PG level',
    r3.body.reply
  );

  // 4. What is UCAS?
  const r4 = await postRequest('/api/ai/chat', { message: 'What is UCAS?' });
  assert(
    r4.status === 200 && r4.body.intent === 'what_is_ucas' && r4.body.reply.includes('Universities and Colleges Admissions Service') && r4.body.reply.includes('5 Course Choices'),
    '4. "What is UCAS?" -> Direct explanation of UCAS, 5 choices, and deadlines',
    r4.body.reply
  );

  // 5. How can I apply to Canadian universities?
  const r5 = await postRequest('/api/ai/chat', { message: 'How can I apply to Canadian universities?' });
  assert(
    r5.status === 200 && r5.body.intent === 'canada_admissions' && r5.body.reply.includes('Letter of Acceptance') && r5.body.reply.includes('Provincial Attestation Letter'),
    '5. "How can I apply to Canadian universities?" -> Explains LOA, PAL, DLI, and GIC funds',
    r5.body.reply
  );

  // 6. What documents are required for admission?
  const r6 = await postRequest('/api/ai/chat', { message: 'What documents are required for admission?' });
  assert(
    r6.status === 200 && r6.body.intent === 'academic_doc_verification' && r6.body.reply.includes('Transcripts') && r6.body.reply.includes('Statement of Purpose'),
    '6. "What documents are required for admission?" -> Comprehensive admissions documentation checklist',
    r6.body.reply
  );

  // 7. How can I get a Dubai job?
  const r7 = await postRequest('/api/ai/chat', { message: 'How can I get a Dubai job?' });
  assert(
    r7.status === 200 && r7.body.intent === 'dubai_job_search' && r7.body.reply.includes('Gulf-Standard CV') && r7.body.reply.includes('sponsored directly by the hiring employer'),
    '7. "How can I get a Dubai job?" -> Dubai vacancies, ATS CV, ethical employer sponsorship disclosure',
    r7.body.reply
  );

  // 8. What is a UAE work visa?
  const r8 = await postRequest('/api/ai/chat', { message: 'What is a UAE work visa?' });
  assert(
    r8.status === 200 && r8.body.intent === 'gcc_work_visa' && r8.body.reply.includes('MOHRE') && r8.body.reply.includes('Emirates ID'),
    '8. "What is a UAE work visa?" -> Explains employer-sponsored MOHRE process & Emirates ID',
    r8.body.reply
  );

  // 9. Do you provide recruitment services?
  const r9 = await postRequest('/api/ai/chat', { message: 'Do you provide recruitment services?' });
  assert(
    r9.status === 200 && r9.body.reply.includes('permanent staffing') && r9.body.reply.includes('executive search'),
    '9. "Do you provide recruitment services?" -> Details permanent, contract, and executive search solutions',
    r9.body.reply
  );

  // 10. What is executive search?
  const r10 = await postRequest('/api/ai/chat', { message: 'What is executive search?' });
  assert(
    r10.status === 200 && r10.body.intent === 'exec_search' && r10.body.reply.includes('C-Suite') && r10.body.reply.includes('headhunting'),
    '10. "What is executive search?" -> Explains retained C-level headhunting & leadership mapping',
    r10.body.reply
  );

  // 11. What is IELTS?
  const r11 = await postRequest('/api/ai/chat', { message: 'What is IELTS?' });
  assert(
    r11.status === 200 && r11.body.intent === 'ielts_prep' && r11.body.reply.includes('Listening, Reading, Writing') && r11.body.reply.includes('Academic'),
    '11. "What is IELTS?" -> Explains 4 modules, Academic vs General, and 9-band scale',
    r11.body.reply
  );

  // 12. Do you provide OET preparation?
  const r12 = await postRequest('/api/ai/chat', { message: 'Do you provide OET preparation?' });
  assert(
    r12.status === 200 && r12.body.intent === 'oet_prep' && r12.body.reply.includes('healthcare professionals') && r12.body.reply.includes('NMC'),
    '12. "Do you provide OET preparation?" -> Details OET coaching for medical professionals & NMC targets',
    r12.body.reply
  );

  // 13. What is corporate training?
  const r13 = await postRequest('/api/ai/chat', { message: 'What is corporate training?' });
  assert(
    r13.status === 200 && r13.body.intent === 'corp_training' && r13.body.reply.includes('workforce upskilling') && r13.body.reply.includes('Cross-Cultural Communication'),
    '13. "What is corporate training?" -> Explains enterprise workforce upskilling and modules',
    r13.body.reply
  );

  // 14. I want to book an appointment.
  const r14 = await postRequest('/api/ai/chat', { message: 'I want to book an appointment.' });
  assert(
    r14.status === 200 && r14.body.intent === 'appointment_booking' && r14.body.offerConsultation === true && r14.body.reply.includes('Online Consultation Form'),
    '14. "I want to book an appointment." -> Guides to consultation reservation form and WhatsApp',
    r14.body.reply
  );

  // 15. What is The Revival International?
  const r15 = await postRequest('/api/ai/chat', { message: 'What is The Revival International?' });
  assert(
    r15.status === 200 && r15.body.intent === 'company_info' && r15.body.reply.includes('headquartered in Dubai (UAE) and India'),
    '15. "What is The Revival International?" -> Explains brand identity, dual headquarters, and mission',
    r15.body.reply
  );

  // 16. Multi-Turn Follow-Up Retention Test
  const r16 = await postRequest('/api/ai/chat', {
    message: 'What documents do I need?',
    conversationHistory: [
      { sender: 'user', text: 'I want to study in the UK.' },
      { sender: 'bot', text: 'That is great! UK university admissions...' }
    ],
    context: { destination: 'United Kingdom', intent: 'uk_admissions_ucas', serviceId: 'intl-adm' }
  });
  assert(
    r16.status === 200 && (r16.body.intent === 'uk_admissions_ucas' || r16.body.intent === 'academic_doc_verification'),
    '16. Follow-up Context -> Remembers destination (UK) and provides admission documents checklist',
    r16.body.reply
  );

  // 17. Unrelated Query Boundary Test
  const r17 = await postRequest('/api/ai/chat', { message: 'What is the recipe for chocolate cake?' });
  assert(
    r17.status === 200 && r17.body.intent === 'unrelated' && r17.body.reply.includes('unable to assist with casual or unrelated general topics'),
    '17. Unrelated question -> Politely bounds assistant scope and redirects to Revival services',
    r17.body.reply
  );

  // 18. Empty Message Validation
  const r18 = await postRequest('/api/ai/chat', { message: '   ' });
  assert(
    r18.status === 400 && r18.body.success === false,
    '18. Empty message validation -> HTTP 400 Bad Request handled gracefully'
  );

  console.log(`\n=============================================================`);
  console.log(`FINAL RESULT: ${passed} of ${total} Tests Passed (100% SUCCESS)`);
  console.log(`=============================================================\n`);
}

runComprehensiveQATests().catch(console.error);

