import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'node:path';

async function runPart3QA() {
  console.log('====================================================');
  console.log('   REVIVAL INTERNATIONAL — PART 3 QA TEST SUITE');
  console.log('   INTERNATIONAL CONSULTING & CRM INTEGRATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Database Schema Verification
  console.log('--- TEST GROUP 1: Database Schema & Entity Verification ---');
  const db = await open({
    filename: path.resolve('server/sir_recruitment.db'),
    driver: sqlite3.Database
  });

  // Check leads table
  const leadCols = (await db.all("PRAGMA table_info(leads)")).map(c => c.name);
  assert(leadCols.includes('referenceNumber'), 'leads table has referenceNumber column');
  assert(leadCols.includes('countryInterest'), 'leads table has countryInterest column');
  assert(leadCols.includes('assistanceType'), 'leads table has assistanceType column');
  assert(leadCols.includes('intakeTerm'), 'leads table has intakeTerm column');
  assert(leadCols.includes('degreeLevel'), 'leads table has degreeLevel column');
  assert(leadCols.includes('organizationId'), 'leads table has organizationId column');
  assert(leadCols.includes('organizationName'), 'leads table has organizationName column');
  assert(leadCols.includes('assignedEmployee'), 'leads table has assignedEmployee column');
  assert(leadCols.includes('priority'), 'leads table has priority column');
  assert(leadCols.includes('nextAction'), 'leads table has nextAction column');

  // Check clients table
  const clientCols = (await db.all("PRAGMA table_info(clients)")).map(c => c.name);
  assert(clientCols.includes('organizationType'), 'clients table has organizationType column');
  assert(clientCols.includes('website'), 'clients table has website column');
  assert(clientCols.includes('country'), 'clients table has country column');
  assert(clientCols.includes('assignedEmployee'), 'clients table has assignedEmployee column');
  assert(clientCols.includes('associatedServices'), 'clients table has associatedServices column');

  // Check organization_contacts table
  const contactCols = (await db.all("PRAGMA table_info(organization_contacts)")).map(c => c.name);
  assert(contactCols.includes('organizationId'), 'organization_contacts table has organizationId');
  assert(contactCols.includes('name'), 'organization_contacts table has name');
  assert(contactCols.includes('email'), 'organization_contacts table has email');
  assert(contactCols.includes('designation'), 'organization_contacts table has designation');

  // Check enquiry_activities table
  const activityCols = (await db.all("PRAGMA table_info(enquiry_activities)")).map(c => c.name);
  assert(activityCols.includes('enquiryId'), 'enquiry_activities table has enquiryId');
  assert(activityCols.includes('type'), 'enquiry_activities table has type');
  assert(activityCols.includes('title'), 'enquiry_activities table has title');
  assert(activityCols.includes('notes'), 'enquiry_activities table has notes');

  // Check follow_ups table
  const followUpCols = (await db.all("PRAGMA table_info(follow_ups)")).map(c => c.name);
  assert(followUpCols.includes('enquiryId'), 'follow_ups table has enquiryId');
  assert(followUpCols.includes('dueDateTime'), 'follow_ups table has dueDateTime');
  assert(followUpCols.includes('purpose'), 'follow_ups table has purpose');
  assert(followUpCols.includes('status'), 'follow_ups table has status');

  console.log('\n--- TEST GROUP 2: Express Server API Health & Verification ---');
  const BASE_URL = 'http://127.0.0.1:5000';

  const healthRes = await fetch(`${BASE_URL}/api/leads`);
  assert(healthRes.status === 200, 'Express server is live on port 5000 and responded to /api/leads');

  // 3. Validation Tests on /api/consulting/enquiries
  console.log('\n--- TEST GROUP 3: Server-Side Validation & Duplicate Prevention ---');
  
  // Test invalid input: Empty Name
  let res = await fetch(`${BASE_URL}/api/consulting/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: '',
      email: 'student@example.com',
      phone: '+971 50 123 4567',
      message: 'Looking for advice on UK graduate schools and scholarships.'
    })
  });
  let json = await res.json();
  assert(res.status === 400 && json.success === false, 'Validation rejects empty applicant name');

  // Test invalid input: Invalid Email
  res = await fetch(`${BASE_URL}/api/consulting/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Kavitha Raman',
      email: 'not-an-email',
      phone: '+971 50 123 4567',
      message: 'Looking for advice on UK graduate schools and scholarships.'
    })
  });
  json = await res.json();
  assert(res.status === 400 && json.success === false, 'Validation rejects invalid email format');

  // Test invalid input: Short message
  res = await fetch(`${BASE_URL}/api/consulting/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Kavitha Raman',
      email: 'kavitha@example.com',
      phone: '+971 50 123 4567',
      message: 'Help me'
    })
  });
  json = await res.json();
  assert(res.status === 400 && json.success === false, 'Validation rejects inquiry message < 10 characters');

  // 4. Submit Valid Consulting Enquiry
  console.log('\n--- TEST GROUP 4: Valid Consulting Enquiry Submission & Persistence ---');
  const uniqueTimestamp = Date.now();
  const testEmail = `kavitha.consulting.${uniqueTimestamp}@revivaledu.test`;
  
  res = await fetch(`${BASE_URL}/api/consulting/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Kavitha Raman',
      email: testEmail,
      countryCode: '+971',
      phone: '50 987 6543',
      organizationName: 'Dubai International Academy',
      organizationType: 'School',
      countryInterest: 'United Kingdom',
      assistanceType: 'Academic Profile Assessment & Program Shortlisting',
      intakeTerm: 'Fall 2026',
      degreeLevel: 'Postgraduate / Master’s',
      preferredContactMethod: 'WhatsApp',
      message: 'Requesting strategic advisory for MSc Artificial Intelligence programs at Russell Group universities with merit scholarship guidance.',
      consent: true
    })
  });
  json = await res.json();
  const leadObj = json.lead || json.data;

  assert(res.status === 201 && json.success === true, 'Successfully created valid consulting enquiry (HTTP 201)');
  assert(leadObj && leadObj.id, 'Response contains valid lead record with ID');
  assert(leadObj && leadObj.referenceNumber && leadObj.referenceNumber.startsWith('REV-IC-2026-'), `Generated compliant reference number: ${leadObj?.referenceNumber}`);
  assert(leadObj && leadObj.serviceId === 'intl-consult', 'Enquiry associated with intl-consult serviceId');

  const createdLeadId = leadObj.id;
  const createdRefNumber = leadObj.referenceNumber;

  // Duplicate Prevention: Re-submit within 30s
  res = await fetch(`${BASE_URL}/api/consulting/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Kavitha Raman',
      email: testEmail,
      phone: '50 987 6543',
      message: 'Requesting strategic advisory for MSc Artificial Intelligence programs at Russell Group universities.'
    })
  });
  json = await res.json();
  assert(res.status === 409 && json.success === false, 'Duplicate prevention triggered for rapid resubmission (HTTP 409)');

  // 5. CRM Retrieval & Lead Details
  console.log('\n--- TEST GROUP 5: CRM Lead Retrieval & Dossier ---');
  res = await fetch(`${BASE_URL}/api/leads/${createdLeadId}`);
  json = await res.json();
  const retrievedLead = json.lead || json.data;
  assert(res.status === 200 && json.success === true, 'Retrieved lead dossier from CRM API');
  assert(retrievedLead.name === 'Kavitha Raman', 'Lead name matches submission');
  assert(retrievedLead.countryInterest === 'United Kingdom', 'Target destination stored correctly');
  assert(retrievedLead.assistanceType === 'Academic Profile Assessment & Program Shortlisting', 'Assistance track stored correctly');
  assert(Array.isArray(retrievedLead.activities) && retrievedLead.activities.length > 0, 'Inbound submission auto-logged initial activity');

  // 6. Workflow Pipeline: Assignment, Status & Organization Linking
  console.log('\n--- TEST GROUP 6: CRM Workflow Actions (Assignment, Status, Org Link) ---');
  // Reassign to consultant
  res = await fetch(`${BASE_URL}/api/leads/${createdLeadId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assignedEmployee: 'Dhanalakshimi',
      priority: 'High',
      organizationId: 'ORG-EDU-102',
      organizationName: 'Dubai International Academy',
      nextAction: 'Conduct preliminary academic profile review and calculate GPA equivalency',
      nextActionDate: '2026-10-20'
    })
  });
  json = await res.json();
  const patchedLead = json.lead || json.data;
  assert(res.status === 200 && json.success === true, 'Successfully updated assignment, priority, and organization link');
  assert(patchedLead.assignedEmployee === 'Dhanalakshimi', 'Assigned employee persisted as Dhanalakshimi');
  assert(patchedLead.priority === 'High', 'Priority updated to High');
  assert(patchedLead.organizationId === 'ORG-EDU-102', 'Linked to Dubai International Academy');

  // Update Status through stages
  const statusPipeline = [
    'Contact Attempted',
    'Consultation Scheduled',
    'Consultation Completed',
    'In Progress'
  ];

  for (const st of statusPipeline) {
    res = await fetch(`${BASE_URL}/api/leads/${createdLeadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: st })
    });
    json = await res.json();
    const stLead = json.lead || json.data;
    assert(stLead.status === st, `Advanced enquiry status to "${st}"`);
  }

  // 7. Activity Logging
  console.log('\n--- TEST GROUP 7: Discussion Notes & Interaction Tracking ---');
  res = await fetch(`${BASE_URL}/api/leads/${createdLeadId}/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'Call',
      title: 'Initial 30-Minute Discovery Consultation with Candidate',
      notes: 'Reviewed undergraduate transcripts (3.8 CGPA). Client prioritized Imperial College London and University of Edinburgh.',
      performedBy: 'Dhanalakshimi'
    })
  });
  json = await res.json();
  const actObj = json.activity || json.data;
  assert(res.status === 201 && json.success === true, 'Recorded discussion note / phone consultation');
  assert(actObj && actObj.enquiryId === createdLeadId, 'Activity linked to enquiry');

  // 8. Follow-Up Scheduling & Completion
  console.log('\n--- TEST GROUP 8: Follow-up Scheduling & Completion ---');
  res = await fetch(`${BASE_URL}/api/leads/${createdLeadId}/follow-ups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dueDateTime: '2026-10-22T14:00',
      purpose: 'Deliver comprehensive Russell Group curriculum comparison and scholarship deadlines matrix',
      assignedTo: 'Dhanalakshimi'
    })
  });
  json = await res.json();
  const followUpObj = json.followUp || json.data;
  assert(res.status === 201 && json.success === true, 'Scheduled follow-up successfully');
  const followUpId = followUpObj.id;

  // Complete Follow-up
  res = await fetch(`${BASE_URL}/api/follow-ups/${followUpId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'Completed',
      completionNotes: 'Matrix delivered. Candidate accepted proposed timeline for Fall 2026 intake.'
    })
  });
  json = await res.json();
  const completedFollowUp = json.followUp || json.data;
  assert(res.status === 200 && json.success === true, 'Marked follow-up as Completed with outcome notes');
  assert(completedFollowUp.status === 'Completed', 'Follow-up status persisted as Completed');

  // 9. Centralized Organization Directory & Constraints
  console.log('\n--- TEST GROUP 9: Organization Management & Duplicate Prevention ---');
  // List organizations
  res = await fetch(`${BASE_URL}/api/organizations`);
  json = await res.json();
  const orgList = json.clients || json.data;
  assert(res.status === 200 && Array.isArray(orgList), 'Retrieved centralized organization directory');
  assert(orgList.length > 0, `Organization directory contains ${orgList.length} verified entities`);

  // Try creating duplicate organization name
  res = await fetch(`${BASE_URL}/api/organizations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dubai International Academy',
      organizationType: 'School',
      country: 'UAE'
    })
  });
  json = await res.json();
  assert(res.status === 409 && json.success === false, 'Prevented duplicate organization creation (HTTP 409 Conflict)');

  // Create new university organization
  const newUnivName = `Cambridge Assessment Partner ${uniqueTimestamp}`;
  res = await fetch(`${BASE_URL}/api/organizations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: newUnivName,
      organizationType: 'University',
      industry: 'Education',
      country: 'United Kingdom',
      city: 'Cambridge',
      website: 'https://cambridge-partner.test',
      assignedEmployee: 'Sreeja'
    })
  });
  json = await res.json();
  const newOrgObj = json.client || json.data;
  assert(res.status === 201 && json.success === true, 'Created new verified university organization');
  const newOrgId = newOrgObj.id;
  assert(newOrgId.startsWith('UNI-') || newOrgId.startsWith('ORG-'), `Generated proper organization ID prefix: ${newOrgId}`);

  // Add contact to organization
  res = await fetch(`${BASE_URL}/api/organizations/${newOrgId}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Alistair Finch',
      email: `afinch.${uniqueTimestamp}@cambridge-partner.test`,
      phone: '+44 1223 760000',
      designation: 'Dean of International Admissions',
      isPrimary: 1
    })
  });
  json = await res.json();
  assert(res.status === 201 && json.success === true, 'Added authorized contact person to organization');

  // 10. Live Database-Derived Metrics Check
  console.log('\n--- TEST GROUP 10: Live Database-Derived KPI Metrics ---');
  res = await fetch(`${BASE_URL}/api/crm/consulting/metrics`);
  json = await res.json();
  const metrics = json.metrics || json.data;
  assert(res.status === 200 && json.success === true, 'Retrieved live consulting metrics from SQLite');
  assert(metrics && metrics.totalEnquiries >= 1, `Total consulting enquiries verified in DB (${metrics?.totalEnquiries})`);
  assert(typeof metrics.newEnquiries === 'number', 'newEnquiries count is numeric');
  assert(typeof metrics.consultationsScheduled === 'number', 'consultationsScheduled count is numeric');
  assert(typeof metrics.activeEngagements === 'number', 'activeEngagements count is numeric');
  assert(typeof metrics.followUpsDue === 'number', 'followUpsDue count is numeric');
  assert(typeof metrics.educationalOrganizations === 'number', 'educationalOrganizations count is numeric');

  // 11. Direct SQLite Persistence Check
  console.log('\n--- TEST GROUP 11: Direct Disk SQLite Persistence Verification ---');
  const leadRow = await db.get("SELECT * FROM leads WHERE id = ?", [createdLeadId]);
  assert(leadRow !== null && leadRow !== undefined, 'Lead verified in SQLite database disk table');
  assert(leadRow.referenceNumber === createdRefNumber, 'Reference number matches database row');
  assert(leadRow.status === 'In Progress', 'Status "In Progress" verified in database row');
  assert(leadRow.assignedEmployee === 'Dhanalakshimi', 'Assigned employee verified in database row');

  const activityRows = await db.all("SELECT * FROM enquiry_activities WHERE enquiryId = ?", [createdLeadId]);
  assert(activityRows.length >= 2, `Multiple activity rows persisted to database table (${activityRows.length} found)`);

  const followUpRows = await db.all("SELECT * FROM follow_ups WHERE enquiryId = ?", [createdLeadId]);
  assert(followUpRows.length >= 1, 'Follow-up row persisted to database table');
  assert(followUpRows[0].status === 'Completed', 'Follow-up status "Completed" persisted in SQLite');

  await db.close();

  console.log('\n====================================================');
  console.log(`   QA SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPart3QA().catch(err => {
  console.error('Unhandled QA test error:', err);
  process.exit(1);
});
