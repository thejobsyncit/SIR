// test-hr-lead-assigned-tasks.cjs
// Automated Verification Suite for HR Lead Task Assignment, Unassigned Queue Removal,
// Dedicated Assigned Tasks Registry, Employee Isolation, and Database Persistence.

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING HR LEAD ASSIGNED TASKS & MANAGEMENT VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1: Category Enquiries and Unassigned Queue
    // -------------------------------------------------------------
    console.log('[Test 1] Inspect Unassigned Queue Across All Categories');
    const leadsRes = await fetch(`${BASE_URL}/api/leads?limit=250`, {
      headers: { 'x-user-role': 'HR Lead' }
    });
    const leadsData = await leadsRes.json();
    const leadsList = Array.isArray(leadsData.leads) ? leadsData.leads : (Array.isArray(leadsData.data) ? leadsData.data : []);
    assert(leadsData.success && Array.isArray(leadsList), 'HR Lead can fetch all CRM leads');

    const intlLeads = leadsList.filter(l =>
      (l.serviceId || '').includes('intl') || (l.referenceNumber || '').startsWith('REV-INT') || (l.referenceNumber || '').startsWith('REV-ADM')
    );
    const domesticLeads = leadsList.filter(l =>
      (l.serviceId || '').includes('school') || (l.serviceId || '').includes('college') || (l.serviceId || '').includes('career') ||
      (l.referenceNumber || '').startsWith('REV-CAR') || (l.referenceNumber || '').startsWith('REV-ACA') || (l.referenceNumber || '').startsWith('REV-COL')
    );

    console.log(`  ℹ Found ${intlLeads.length} International leads, ${domesticLeads.length} Domestic leads in leads registry.`);

    const appsRes = await fetch(`${BASE_URL}/api/candidate/applications`, {
      headers: { 'x-user-role': 'HR Lead' }
    });
    const appsData = await appsRes.json();
    assert(appsData.success && Array.isArray(appsData.data), 'HR Lead can fetch candidate job applications');
    console.log(`  ℹ Found ${appsData.data.length} candidate job applications.\n`);

    // Pick an unassigned enquiry or create one for deterministic testing
    const testEnquiryId = 'TEST-ENQ-' + Date.now();
    const testRefNo = 'REV-INT-TEST-' + Math.floor(Math.random() * 10000);

    // Seed test enquiry into leads table
    const { getDb } = require('./server/database.js');
    const db = await getDb();
    await db.run(
      `INSERT INTO leads (
        id, referenceNumber, name, email, phone, serviceId, serviceTitle,
        status, assignmentStatus, countryInterest, createdAt, updatedAt
      ) VALUES (?, ?, 'Amina Al-Mansoor', 'amina.test@example.com', '+971 50 999 8888', 'intl-consult',
        'International Consulting', 'New', 'New', 'United Arab Emirates', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [testEnquiryId, testRefNo]
    );

    // -------------------------------------------------------------
    // Test 2: HR Lead assigns enquiry to Fatima (REV-EMP-107)
    // -------------------------------------------------------------
    console.log('[Test 2] HR Lead Assigns Enquiry to Fatima (REV-EMP-107)');
    const targetDueDate = '2026-12-15';
    const targetInstructions = 'Verify UAE attestation dossier and schedule phone debrief.';

    const assignRes = await fetch(`${BASE_URL}/api/hr-operations/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'HR Lead',
        'x-employee-id': 'REV-EMP-003',
        'x-employee-name': 'Priya Sharma (HR Lead)'
      },
      body: JSON.stringify({
        enquiryIds: [testEnquiryId],
        employeeId: 'REV-EMP-107',
        employeeName: 'Fatima',
        employeeEmail: 'fatima.intl@revivalinternational.com',
        operationTeam: 'International HR Operations',
        priority: 'Urgent',
        instructions: targetInstructions,
        dueDate: targetDueDate,
        assignedBy: 'Priya Sharma (HR Lead)',
        assignedById: 'REV-EMP-003'
      })
    });
    const assignData = await assignRes.json();
    assert(assignRes.ok && assignData.success, 'Assignment API returns success');

    // -------------------------------------------------------------
    // Test 3: Verify Persistence in SQLite Database
    // -------------------------------------------------------------
    console.log('[Test 3] Verify Persistence in hr_task_assignments & leads Tables');
    const savedTask = await db.get(
      'SELECT * FROM hr_task_assignments WHERE enquiryId = ? OR id = ?',
      [testEnquiryId, `TASK-${testEnquiryId}`]
    );
    assert(savedTask !== undefined, 'Task assignment persisted in SQLite hr_task_assignments table');
    assert(savedTask.assignedEmployeeId === 'REV-EMP-107', 'Task has correct assignedEmployeeId: REV-EMP-107');
    assert(savedTask.assignedEmployeeName === 'Fatima', 'Task has correct assignedEmployeeName: Fatima');
    assert(savedTask.priority === 'Urgent', 'Task has correct priority: Urgent');
    assert(savedTask.dueDate === targetDueDate, `Task has correct dueDate: ${targetDueDate}`);
    assert(savedTask.notes === targetInstructions, 'Task has correct instructions');
    assert(savedTask.taskStatus === 'To Do', 'Task default status is "To Do"');

    const updatedLead = await db.get('SELECT * FROM leads WHERE id = ?', [testEnquiryId]);
    assert(updatedLead.status === 'Assigned', 'Lead status updated to "Assigned" in database');
    assert(updatedLead.assignedEmployeeId === 'REV-EMP-107', 'Lead assignedEmployeeId updated');

    // -------------------------------------------------------------
    // Test 4: Removal from Unassigned Queue
    // -------------------------------------------------------------
    console.log('[Test 4] Verify Enquiry is Removed from Unassigned Queue');
    assert(updatedLead.status !== 'New', 'Enquiry status is no longer "New"');
    assert(!!updatedLead.assignedEmployee, 'Enquiry has assigned employee, removing it from unassigned filter');

    // -------------------------------------------------------------
    // Test 5: Dedicated Assigned Tasks View Retrieval (HR Lead View)
    // -------------------------------------------------------------
    console.log('[Test 5] Dedicated Assigned Tasks View Retrieval (HR Lead View)');
    const allAssignedRes = await fetch(`${BASE_URL}/api/hr-operations/tasks`, {
      headers: { 'x-user-role': 'HR Lead' }
    });
    const allAssignedData = await allAssignedRes.json();
    assert(allAssignedData.success && Array.isArray(allAssignedData.tasks), 'HR Lead can fetch all assigned tasks');

    const foundInAll = allAssignedData.tasks.find(t => t.enquiryId === testEnquiryId || t.id === `TASK-${testEnquiryId}`);
    assert(foundInAll !== undefined, 'Assigned task appears in HR Lead Assigned Tasks registry');
    assert(foundInAll?.customerName === 'Amina Al-Mansoor', 'Task displays candidate name correctly');

    // Filter by category: intl
    const intlTasksRes = await fetch(`${BASE_URL}/api/hr-operations/tasks?category=intl`, {
      headers: { 'x-user-role': 'HR Lead' }
    });
    const intlTasksData = await intlTasksRes.json();
    const foundInIntl = intlTasksData.tasks.find(t => t.enquiryId === testEnquiryId);
    assert(foundInIntl !== undefined, 'Task correctly appears under category="intl" filter');

    // -------------------------------------------------------------
    // Test 6: Strict HR Operations Employee Isolation
    // -------------------------------------------------------------
    console.log('[Test 6] Strict HR Operations Employee Isolation');
    // Fatima logs in: must see the task
    const fatimaTasksRes = await fetch(`${BASE_URL}/api/hr-operations/tasks`, {
      headers: {
        'x-user-role': 'HR Operations',
        'x-employee-id': 'REV-EMP-107',
        'x-employee-name': 'Fatima',
        'x-employee-email': 'fatima.intl@revivalinternational.com'
      }
    });
    const fatimaTasksData = await fatimaTasksRes.json();
    const foundInFatima = fatimaTasksData.tasks.find(t => t.enquiryId === testEnquiryId);
    assert(foundInFatima !== undefined, 'Fatima (REV-EMP-107) SEES the task assigned to her');

    // Balavarshini logs in: MUST NOT see Fatima's task
    const balaTasksRes = await fetch(`${BASE_URL}/api/hr-operations/tasks`, {
      headers: {
        'x-user-role': 'HR Operations',
        'x-employee-id': 'REV-EMP-006',
        'x-employee-name': 'Balavarshini S.',
        'x-employee-email': 'balavarshini.s@revivalinternational.com'
      }
    });
    const balaTasksData = await balaTasksRes.json();
    const foundInBala = balaTasksData.tasks.find(t => t.enquiryId === testEnquiryId);
    assert(foundInBala === undefined, 'Balavarshini (REV-EMP-006) DOES NOT see Fatima\'s private task (Strict Isolation PASS)');

    // -------------------------------------------------------------
    // Test 7: Bi-directional Status Synchronization
    // -------------------------------------------------------------
    console.log('[Test 7] Bi-directional Status Synchronization');
    // Fatima updates task to 'In Progress'
    const patchRes = await fetch(`${BASE_URL}/api/hr-operations/tasks/${encodeURIComponent(savedTask.id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'HR Operations',
        'x-employee-id': 'REV-EMP-107',
        'x-employee-name': 'Fatima'
      },
      body: JSON.stringify({
        taskStatus: 'In Progress',
        notes: 'Contacted candidate; reviewed IELTS and diploma copies.'
      })
    });
    const patchData = await patchRes.json();
    assert(patchRes.ok && patchData.success, 'Task status PATCH returns success');

    const taskAfterProgress = await db.get('SELECT * FROM hr_task_assignments WHERE id = ?', [savedTask.id]);
    assert(taskAfterProgress.taskStatus === 'In Progress', 'Task status is now "In Progress" in hr_task_assignments');

    const leadAfterProgress = await db.get('SELECT * FROM leads WHERE id = ?', [testEnquiryId]);
    assert(leadAfterProgress.status === 'In Progress' || leadAfterProgress.taskStatus === 'In Progress', 'Lead table synchronized to "In Progress"');

    // Complete the task
    const completeRes = await fetch(`${BASE_URL}/api/hr-operations/tasks/${encodeURIComponent(savedTask.id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'HR Operations',
        'x-employee-id': 'REV-EMP-107',
        'x-employee-name': 'Fatima'
      },
      body: JSON.stringify({
        taskStatus: 'Completed',
        completionNotes: 'Dossier successfully processed and approved.'
      })
    });
    const completeData = await completeRes.json();
    assert(completeRes.ok && completeData.success, 'Task completion returns success');

    const taskAfterComplete = await db.get('SELECT * FROM hr_task_assignments WHERE id = ?', [savedTask.id]);
    assert(taskAfterComplete.taskStatus === 'Completed' && taskAfterComplete.isCompleted === 1, 'Task marked Completed with isCompleted=1');

    // -------------------------------------------------------------
    // Test 8: Reassignment to Praveen Kumar (REV-EMP-108)
    // -------------------------------------------------------------
    console.log('[Test 8] HR Lead Reassignment to Praveen Kumar (REV-EMP-108)');
    const reassignRes = await fetch(`${BASE_URL}/api/hr-operations/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'HR Lead',
        'x-employee-id': 'REV-EMP-003',
        'x-employee-name': 'Priya Sharma (HR Lead)'
      },
      body: JSON.stringify({
        enquiryIds: [testEnquiryId],
        employeeId: 'REV-EMP-108',
        employeeName: 'Praveen Kumar',
        employeeEmail: 'praveen.enq@revivalinternational.com',
        operationTeam: 'Enquiry HR Operations',
        priority: 'Normal',
        instructions: 'Reassigned to Praveen for follow-up.',
        dueDate: '2026-12-20',
        assignedBy: 'Priya Sharma (HR Lead)',
        assignedById: 'REV-EMP-003'
      })
    });
    const reassignData = await reassignRes.json();
    assert(reassignRes.ok && reassignData.success, 'Reassignment API returns success');

    const reassignedTask = await db.get('SELECT * FROM hr_task_assignments WHERE enquiryId = ?', [testEnquiryId]);
    assert(reassignedTask.assignedEmployeeId === 'REV-EMP-108', 'Reassigned task employeeId updated to REV-EMP-108');
    assert(reassignedTask.assignedEmployeeName === 'Praveen Kumar', 'Reassigned task employeeName updated to Praveen Kumar');

    // -------------------------------------------------------------
    // Test 9: Negative Security & Validation Tests
    // -------------------------------------------------------------
    console.log('[Test 9] Negative Security & Validation Tests');
    // Empty enquiryIds
    const emptyRes = await fetch(`${BASE_URL}/api/hr-operations/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'HR Lead' },
      body: JSON.stringify({ enquiryIds: [], employeeId: 'REV-EMP-107' })
    });
    assert(emptyRes.status === 400, 'Assignment with empty enquiryIds returns 400 Bad Request');

    // Invalid employee
    const invalidEmpRes = await fetch(`${BASE_URL}/api/hr-operations/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'HR Lead' },
      body: JSON.stringify({ enquiryIds: [testEnquiryId], employeeId: 'NON-EXISTENT-999' })
    });
    assert(invalidEmpRes.status === 404, 'Assignment with non-existent employee returns 404 Not Found');

    // Unauthorized role
    const unauthRes = await fetch(`${BASE_URL}/api/hr-operations/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'Candidate' },
      body: JSON.stringify({ enquiryIds: [testEnquiryId], employeeId: 'REV-EMP-107' })
    });
    assert(unauthRes.status === 403, 'Unauthorized role assignment returns 403 Forbidden');

    // Clean up test enquiry
    await db.run('DELETE FROM hr_task_assignments WHERE enquiryId = ? OR id = ?', [testEnquiryId, `TASK-${testEnquiryId}`]);
    await db.run('DELETE FROM leads WHERE id = ?', [testEnquiryId]);
    console.log('  ℹ Cleaned up ephemeral test data from SQLite.');

  } catch (err) {
    console.error('Fatal error in test suite:', err);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
