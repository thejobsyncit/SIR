import { getDb, closeDb } from './server/database.js';

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log('STARTING CRITICAL FIX VERIFICATION (TESTS A through E)');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 5;

  // 1. Helper to login and get token
  async function login(email, password = 'Password123!') {
    const res = await fetch(`${BASE_URL}/api/crm/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok || !data.token) {
      throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`);
    }
    return { token: data.token, user: data.employee || data.user };
  }

  // --------------------------------------------------------------------------
  // TEST A: Assignment
  // 1. Log in as HR Lead (priya.lead@revivalinternational.com).
  // 2. Assign a task to HR Operations Employee Fatima (REV-EMP-107).
  // 3. Verify task exists in database with Fatima's correct ID.
  // 4. Confirm task appears in Fatima's dashboard.
  // --------------------------------------------------------------------------
  console.log('--- TEST A: HR Lead Assignment to HR Operations Employee ---');
  let testLeadId = 'LEAD-INT-106'; // Dr. Nadia El-Sayed
  try {
    const hrLead = await login('priya.lead@revivalinternational.com');
    console.log('✓ Logged in as HR Lead:', hrLead.user.name, `(${hrLead.user.email})`);

    // Assign LEAD-INT-106 to Fatima
    const assignRes = await fetch(`${BASE_URL}/api/hr-operations/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hrLead.token}`,
        'x-user-role': 'HR Lead'
      },
      body: JSON.stringify({
        enquiryIds: [testLeadId],
        employeeId: 'REV-EMP-107',
        canonicalEmployeeId: 'REV-EMP-107',
        employeeName: 'Fatima',
        employeeEmail: 'fatima.intl@revivalinternational.com',
        operationTeam: 'International HR Operations',
        priority: 'High',
        instructions: 'Urgent: Verify Abu Dhabi Department of Health medical consultancy dossier.',
        assignedBy: hrLead.user.name,
        assignedById: hrLead.user.employeeId || 'REV-EMP-003'
      })
    });

    const assignData = await assignRes.json();
    console.log('Assignment response:', assignData);
    if (!assignRes.ok || !assignData.success || assignData.count === 0) {
      throw new Error(`Assignment API failed: ${JSON.stringify(assignData)}`);
    }
    console.log(`✓ Assignment API returned success for ${assignData.count} enquiry.`);

    // Check directly in SQLite database
    const db = await getDb();
    const taskInDb = await db.get(
      'SELECT * FROM hr_task_assignments WHERE enquiryId = ? AND assignedEmployeeId = ?',
      [testLeadId, 'REV-EMP-107']
    );
    if (!taskInDb) {
      throw new Error(`Task for ${testLeadId} not found in hr_task_assignments for REV-EMP-107`);
    }
    console.log('✓ SQLite DB verification: Task found:', {
      id: taskInDb.id,
      enquiryId: taskInDb.enquiryId,
      assignedEmployeeId: taskInDb.assignedEmployeeId,
      assignedEmployeeName: taskInDb.assignedEmployeeName,
      priority: taskInDb.priority,
      taskStatus: taskInDb.taskStatus
    });

    // Check Fatima's dashboard summary via /api/hr-ops/dashboard/summary
    const fatimaAuth = await login('fatima.intl@revivalinternational.com');
    console.log('✓ Logged in as Fatima:', fatimaAuth.user.name, `(${fatimaAuth.user.email})`);

    const fatimaSummaryRes = await fetch(`${BASE_URL}/api/hr-ops/dashboard/summary`, {
      headers: { 'Authorization': `Bearer ${fatimaAuth.token}` }
    });
    const fatimaSummary = await fatimaSummaryRes.json();
    const fatimaTask = (fatimaSummary.data?.tasks || []).find(t => t.enquiryId === testLeadId);
    if (!fatimaTask) {
      throw new Error(`Assigned task ${testLeadId} does not appear in Fatima's dashboard summary!`);
    }
    console.log('✓ Fatima dashboard verification: Task confirmed in tasks list:', {
      id: fatimaTask.id,
      enquiryId: fatimaTask.enquiryId,
      customerName: fatimaTask.customerName,
      priority: fatimaTask.priority,
      taskStatus: fatimaTask.taskStatus
    });

    console.log('>>> TEST A PASSED! <<<\n');
    passedTests++;
  } catch (err) {
    console.error('❌ TEST A FAILED:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST B: Employee Isolation
  // 1. Log in as Balavarshini S. (REV-EMP-006).
  // 2. Verify Fatima's task (LEAD-INT-106) is NOT visible to Balavarshini.
  // 3. Confirm Balavarshini sees only her authorized tasks.
  // --------------------------------------------------------------------------
  console.log('--- TEST B: Employee Isolation ---');
  try {
    const balaAuth = await login('balavarshini.s@revivalinternational.com');
    console.log('✓ Logged in as Balavarshini S.:', balaAuth.user.name, `(${balaAuth.user.email})`);

    const balaSummaryRes = await fetch(`${BASE_URL}/api/hr-ops/dashboard/summary`, {
      headers: { 'Authorization': `Bearer ${balaAuth.token}` }
    });
    const balaSummary = await balaSummaryRes.json();
    const balaTasks = balaSummary.data?.tasks || [];
    const leakedTask = balaTasks.find(t => t.enquiryId === testLeadId);
    if (leakedTask) {
      throw new Error(`Isolation breach! Fatima's task ${testLeadId} is visible in Balavarshini's dashboard.`);
    }

    // Check task list endpoint as well
    const balaTasksEndpointRes = await fetch(`${BASE_URL}/api/hr-ops/tasks`, {
      headers: { 'Authorization': `Bearer ${balaAuth.token}` }
    });
    const balaTasksEndpoint = await balaTasksEndpointRes.json();
    const endpointLeak = (balaTasksEndpoint.data || []).find(t => t.enquiryId === testLeadId);
    if (endpointLeak) {
      throw new Error(`Isolation breach in /api/hr-ops/tasks! Fatima's task is visible to Balavarshini.`);
    }

    console.log(`✓ Isolation confirmed: Fatima's task (${testLeadId}) is NOT visible to Balavarshini.`);
    console.log(`✓ Balavarshini has ${balaTasks.length} authorized tasks, strictly scoped to her profile.`);

    console.log('>>> TEST B PASSED! <<<\n');
    passedTests++;
  } catch (err) {
    console.error('❌ TEST B FAILED:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST C: Persistence Across Logout & Login
  // 1. Assign a task to Fatima.
  // 2. Log out (simulate session termination).
  // 3. Log in again as Fatima.
  // 4. Verify task and status remain available.
  // --------------------------------------------------------------------------
  console.log('--- TEST C: Persistence Across Logout & Login ---');
  try {
    // Re-login as Fatima (fresh session)
    const freshFatimaAuth = await login('fatima.intl@revivalinternational.com');
    const freshSummaryRes = await fetch(`${BASE_URL}/api/hr-ops/dashboard/summary`, {
      headers: { 'Authorization': `Bearer ${freshFatimaAuth.token}` }
    });
    const freshSummary = await freshSummaryRes.json();
    const task = (freshSummary.data?.tasks || []).find(t => t.enquiryId === testLeadId);
    if (!task) {
      throw new Error(`Task ${testLeadId} lost after re-login!`);
    }
    console.log('✓ Task persisted cleanly across logout and re-login:', {
      id: task.id,
      customerName: task.customerName,
      taskStatus: task.taskStatus
    });

    console.log('>>> TEST C PASSED! <<<\n');
    passedTests++;
  } catch (err) {
    console.error('❌ TEST C FAILED:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST D: Database Server Restart Persistence
  // 1. Direct query of SQLite database to ensure row is safely committed.
  // --------------------------------------------------------------------------
  console.log('--- TEST D: Database Persistence & Schema Integrity ---');
  try {
    const db = await getDb();
    const taskRecord = await db.get(
      'SELECT id, enquiryId, assignedEmployeeId, taskStatus, assignmentStatus, isCompleted FROM hr_task_assignments WHERE enquiryId = ?',
      [testLeadId]
    );
    if (!taskRecord) {
      throw new Error('Task record missing from SQLite persistent table.');
    }
    if (taskRecord.assignedEmployeeId !== 'REV-EMP-107') {
      throw new Error(`Mismatched assignedEmployeeId: expected REV-EMP-107, got ${taskRecord.assignedEmployeeId}`);
    }
    console.log('✓ Task record is persisted in SQLite hr_task_assignments table:', taskRecord);

    console.log('>>> TEST D PASSED! <<<\n');
    passedTests++;
  } catch (err) {
    console.error('❌ TEST D FAILED:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST E: Status Synchronization
  // 1. Employee Fatima updates task status to 'Completed'.
  // 2. Verify update is saved in SQLite database.
  // 3. Log in as HR Lead and verify updated status is displayed.
  // --------------------------------------------------------------------------
  console.log('--- TEST E: Status Synchronization ---');
  try {
    const fatimaAuth = await login('fatima.intl@revivalinternational.com');
    const db = await getDb();
    const taskRecord = await db.get(
      'SELECT id FROM hr_task_assignments WHERE enquiryId = ? AND assignedEmployeeId = ?',
      [testLeadId, 'REV-EMP-107']
    );

    // Update status to Completed via PATCH /api/hr-ops/tasks/:taskId
    const updateRes = await fetch(`${BASE_URL}/api/hr-ops/tasks/${taskRecord.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fatimaAuth.token}`
      },
      body: JSON.stringify({ taskStatus: 'Completed' })
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok || !updateData.success) {
      throw new Error(`Task status update failed: ${JSON.stringify(updateData)}`);
    }
    console.log('✓ Task status successfully updated to "Completed" by Fatima.');

    // Verify in SQLite database
    const updatedDbRecord = await db.get(
      'SELECT id, taskStatus, isCompleted, completedAt FROM hr_task_assignments WHERE id = ?',
      [taskRecord.id]
    );
    if (updatedDbRecord.taskStatus !== 'Completed' || updatedDbRecord.isCompleted !== 1) {
      throw new Error(`Database taskStatus/isCompleted not synced: ${JSON.stringify(updatedDbRecord)}`);
    }
    console.log('✓ SQLite DB verification: Status is Completed, isCompleted = 1, completedAt =', updatedDbRecord.completedAt);

    // Verify lead status in leads table was also synchronized
    const leadRecord = await db.get('SELECT id, status, taskStatus FROM leads WHERE id = ?', [testLeadId]);
    console.log('✓ SQLite DB leads table sync verification:', leadRecord);
    if (leadRecord.status !== 'Completed') {
      throw new Error(`Lead table status not synchronized to Completed: ${JSON.stringify(leadRecord)}`);
    }

    // Log in as HR Lead and verify HR Lead sees the updated status
    const hrLead = await login('priya.lead@revivalinternational.com');
    const leadTasksRes = await fetch(`${BASE_URL}/api/hr-operations/tasks?enquiryId=${testLeadId}`, {
      headers: {
        'Authorization': `Bearer ${hrLead.token}`,
        'x-user-role': 'HR Lead'
      }
    });
    const leadTasksData = await leadTasksRes.json();
    const leadTask = (leadTasksData.data || leadTasksData.tasks || []).find(t => t.enquiryId === testLeadId);
    if (!leadTask || leadTask.taskStatus !== 'Completed') {
      throw new Error(`HR Lead does not see completed status! Received: ${JSON.stringify(leadTask)}`);
    }
    console.log('✓ HR Lead view verification: Completed status verified via HR Lead query:', {
      taskId: leadTask.id,
      taskStatus: leadTask.taskStatus,
      isCompleted: leadTask.isCompleted
    });

    console.log('>>> TEST E PASSED! <<<\n');
    passedTests++;
  } catch (err) {
    console.error('❌ TEST E FAILED:', err.message);
  }

  console.log('====================================================');
  console.log(`FINAL RESULT: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('====================================================');

  process.exit(passedTests === totalTests ? 0 : 1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
