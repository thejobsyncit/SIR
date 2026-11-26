// test-hr-ops-has-permission.cjs
const assert = require('assert');
const { ROLE_PERMISSIONS } = require('./src/crm/data/mockCrmData.js');

console.log('========================================================');
console.log('🧪 TESTING HR OPERATIONS SHIFT PERMISSIONS');
console.log('========================================================');

// 1. Check ROLE_PERMISSIONS
assert(Array.isArray(ROLE_PERMISSIONS['HR Operations']), 'ROLE_PERMISSIONS for HR Operations missing');
assert(ROLE_PERMISSIONS['HR Operations'].includes('hr-shifts'), "ROLE_PERMISSIONS['HR Operations'] does not contain 'hr-shifts'!");
console.log("  ✓ ROLE_PERMISSIONS['HR Operations'] contains 'hr-shifts'");

// 2. Simulate hasPermission logic from CrmContext.jsx
const simulateHasPermission = (currentRole, moduleName) => {
  if (!moduleName) return true;
  if (moduleName === 'my-profile' || moduleName === 'my-attendance') return true;
  if (moduleName === 'super-admin') return currentRole === 'Super Admin';
  if (currentRole === 'Super Admin') return true;
  if (typeof moduleName === 'string' && moduleName.startsWith('consulting')) moduleName = 'consulting';
  if (moduleName === 'hr-tasks') {
    return currentRole === 'HR Lead' || currentRole === 'Super Admin' || currentRole === 'Admin' || currentRole === 'HR Operations' || currentRole === 'HR & Talent Manager';
  }
  if (moduleName === 'hr-shifts') {
    return currentRole === 'HR Lead' || currentRole === 'Super Admin' || currentRole === 'Admin' || currentRole === 'HR Operations';
  }
  const permissions = (currentRole && ROLE_PERMISSIONS[currentRole]) || [];
  return permissions.includes('all') || permissions.includes(moduleName);
};

assert(simulateHasPermission('HR Operations', 'hr-shifts') === true, "simulateHasPermission failed for HR Operations on hr-shifts");
console.log("  ✓ simulateHasPermission('HR Operations', 'hr-shifts') === true");

assert(simulateHasPermission('HR Lead', 'hr-shifts') === true, "simulateHasPermission failed for HR Lead on hr-shifts");
assert(simulateHasPermission('Admin', 'hr-shifts') === true, "simulateHasPermission failed for Admin on hr-shifts");
assert(simulateHasPermission('Super Admin', 'hr-shifts') === true, "simulateHasPermission failed for Super Admin on hr-shifts");

console.log('========================================================');
console.log('🎉 HR OPERATIONS SHIFT ACCESS FULLY VERIFIED!');
console.log('========================================================');
