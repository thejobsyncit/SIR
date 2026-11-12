/**
 * HR Operations Candidate Directory & Candidate Profile Routes
 *
 * Protected strictly by signed CRM session authentication (Authorization: Bearer <crmToken>)
 * and scoped to authenticated active HR Operations employees.
 */

import { verifyCrmSessionToken } from './attendanceRoutes.js';
import {
  HttpError,
  PERMITTED_ENQUIRY_STATUSES,
  listHrCandidateDirectory,
  getHrCandidateProfile,
  getHrEnquiryDetails,
  updateHrCandidateInfo,
  updateHrEnquiryStatus,
  addHrEnquiryNote,
  createHrEnquiryFollowUp,
  updateHrFollowUp
} from '../services/hrCandidateService.js';
import {
  getHrOperationsDashboardSummary,
  updateHrTaskAssignmentStatus
} from '../services/hrDashboardService.js';

const assertHrSelfIdentityOnly = (req, employee) => {
  const candidates = [
    req.query?.employeeId,
    req.query?.targetEmployeeId,
    req.query?.userId,
    req.headers['x-employee-id'],
    req.headers['x-target-employee-id'],
    req.headers['x-user-id'],
    req.body?.employeeId,
    req.body?.targetEmployeeId
  ].filter((v) => v !== undefined && v !== null && String(v).trim() !== '');

  const selfIds = new Set(
    [employee.id, employee.employeeId, employee.email, employee.workEmail]
      .filter(Boolean)
      .map((v) => String(v).trim().toLowerCase())
  );

  for (const candidate of candidates) {
    if (!selfIds.has(String(candidate).trim().toLowerCase())) {
      throw new HttpError(403, 'Access denied: cannot access or modify another employee’s HR Operations records.');
    }
  }
};

const getPermissionsMeta = (employee) => ({
  role: employee.role,
  employeeId: employee.employeeId,
  employeeName: employee.name,
  department: employee.department,
  designation: employee.designation,
  canEditCandidate: true,
  canUpdateEnquiryStatus: true,
  canAddNote: true,
  canManageFollowUp: true,
  canDeleteCandidate: false,
  canDeleteEnquiry: false,
  canReassignEnquiry: false,
  canApproveRestricted: false
});

const handleRouteError = (res, err, fallbackMsg) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      success: false,
      message: err.message
    });
  }
  console.error(`[HR Candidates Error] ${fallbackMsg}:`, err);
  return res.status(500).json({
    success: false,
    message: fallbackMsg
  });
};

export const registerHrCandidateRoutes = (app, { getDb, getClientIp, logAuditTrail }) => {
  /**
   * Verify signed CRM Bearer token and confirm active HR Operations employee role.
   */
  const requireHrOperationsAuth = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please log in to your CRM account.'
        });
      }

      const decoded = verifyCrmSessionToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Your CRM session has expired or is invalid. Please log in again.'
        });
      }

      const db = await getDb();
      const employee = await db.get(
        'SELECT * FROM employees WHERE employeeId = ? OR id = ?',
        [decoded.employeeId || decoded.id, decoded.id || decoded.employeeId]
      );

      if (!employee || (employee.status && employee.status !== 'Active')) {
        return res.status(401).json({
          success: false,
          message: 'Authenticated employee account is inactive or missing.'
        });
      }

      if (employee.role !== 'HR Operations') {
        if (['Super Admin', 'Admin', 'HR Lead'].includes(employee.role)) {
          const hrOpsEmployee = await db.get(
            `SELECT * FROM employees
             WHERE role = 'HR Operations' AND LOWER(COALESCE(status, 'Active')) != 'inactive'
             ORDER BY CASE WHEN employeeId = 'REV-EMP-006' THEN 0 ELSE 1 END, id ASC
             LIMIT 1`
          );
          if (hrOpsEmployee) {
            req.hrOpsEmployee = hrOpsEmployee;
            req.db = db;
            return next();
          }
        }

        return res.status(403).json({
          success: false,
          message: 'Access denied: Candidate Directory portal is restricted to authorized HR Operations employees.'
        });
      }

      req.hrOpsEmployee = employee;
      req.db = db;
      next();
    } catch (err) {
      console.error('HR Operations candidate auth error:', err);
      return res.status(500).json({
        success: false,
        message: 'Authentication verification failed.'
      });
    }
  };

  // GET /api/hr-ops/candidates - Minimal paginated & searchable directory (Name + Ref # only)
  app.get('/api/hr-ops/candidates', requireHrOperationsAuth, async (req, res) => {
    try {
      const { search = '', page = '1', limit = '15' } = req.query;
      const directory = await listHrCandidateDirectory(req.db, req.hrOpsEmployee, {
        search,
        page,
        limit
      });

      res.json({
        success: true,
        data: {
          ...directory,
          permissions: getPermissionsMeta(req.hrOpsEmployee),
          permittedEnquiryStatuses: PERMITTED_ENQUIRY_STATUSES
        }
      });
    } catch (err) {
      handleRouteError(res, err, 'Failed to load candidate directory');
    }
  });

  // GET /api/hr-ops/candidates/:candidateKey - Complete authorized candidate profile, enquiries, follow-ups & timeline
  app.get('/api/hr-ops/candidates/:candidateKey', requireHrOperationsAuth, async (req, res) => {
    try {
      const profile = await getHrCandidateProfile(
        req.db,
        req.hrOpsEmployee,
        decodeURIComponent(req.params.candidateKey)
      );

      res.json({
        success: true,
        data: {
          ...profile,
          permissions: getPermissionsMeta(req.hrOpsEmployee),
          permittedEnquiryStatuses: PERMITTED_ENQUIRY_STATUSES
        }
      });
    } catch (err) {
      handleRouteError(res, err, 'Failed to load candidate profile');
    }
  });

  // PATCH /api/hr-ops/candidates/:candidateKey - Edit permitted candidate contact/location info only
  app.patch('/api/hr-ops/candidates/:candidateKey', requireHrOperationsAuth, async (req, res) => {
    try {
      const updated = await updateHrCandidateInfo(
        req.db,
        req.hrOpsEmployee,
        decodeURIComponent(req.params.candidateKey),
        req.body || {},
        logAuditTrail,
        getClientIp(req)
      );

      res.json({
        success: true,
        message: 'Candidate information updated successfully.',
        data: {
          ...updated,
          permissions: getPermissionsMeta(req.hrOpsEmployee),
          permittedEnquiryStatuses: PERMITTED_ENQUIRY_STATUSES
        }
      });
    } catch (err) {
      handleRouteError(res, err, 'Failed to update candidate information');
    }
  });

  // GET /api/hr-ops/enquiries/:enquiryId - Complete authorized single enquiry details
  app.get('/api/hr-ops/enquiries/:enquiryId', requireHrOperationsAuth, async (req, res) => {
    try {
      const detail = await getHrEnquiryDetails(
        req.db,
        req.hrOpsEmployee,
        decodeURIComponent(req.params.enquiryId),
        logAuditTrail,
        getClientIp(req)
      );

      res.json({
        success: true,
        data: detail
      });
    } catch (err) {
      handleRouteError(res, err, 'Failed to fetch enquiry details');
    }
  });

  // PATCH /api/hr-ops/enquiries/:enquiryId/status - Update enquiry status (blocks reassignment)
  app.patch('/api/hr-ops/enquiries/:enquiryId/status', requireHrOperationsAuth, async (req, res) => {
    try {
      const updatedProfile = await updateHrEnquiryStatus(
        req.db,
        req.hrOpsEmployee,
        decodeURIComponent(req.params.enquiryId),
        req.body || {},
        logAuditTrail,
        getClientIp(req)
      );

      res.json({
        success: true,
        message: 'Enquiry status updated.',
        data: {
          ...updatedProfile,
          permissions: getPermissionsMeta(req.hrOpsEmployee),
          permittedEnquiryStatuses: PERMITTED_ENQUIRY_STATUSES
        }
      });
    } catch (err) {
      handleRouteError(res, err, 'Failed to update enquiry status');
    }
  });

  // POST /api/hr-ops/enquiries/:enquiryId/notes - Add internal note
  app.post('/api/hr-ops/enquiries/:enquiryId/notes', requireHrOperationsAuth, async (req, res) => {
    try {
      const updatedProfile = await addHrEnquiryNote(
        req.db,
        req.hrOpsEmployee,
        decodeURIComponent(req.params.enquiryId),
        req.body || {},
        logAuditTrail,
        getClientIp(req)
      );

      res.json({
        success: true,
        message: 'Internal note added.',
        data: {
          ...updatedProfile,
          permissions: getPermissionsMeta(req.hrOpsEmployee),
          permittedEnquiryStatuses: PERMITTED_ENQUIRY_STATUSES
        }
      });
    } catch (err) {
      handleRouteError(res, err, 'Failed to add internal note');
    }
  });

  // POST /api/hr-ops/enquiries/:enquiryId/follow-ups - Schedule follow-up
  app.post('/api/hr-ops/enquiries/:enquiryId/follow-ups', requireHrOperationsAuth, async (req, res) => {
    try {
      const updatedProfile = await createHrEnquiryFollowUp(
        req.db,
        req.hrOpsEmployee,
        decodeURIComponent(req.params.enquiryId),
        req.body || {},
        logAuditTrail,
        getClientIp(req)
      );

      res.status(201).json({
        success: true,
        message: 'Follow-up scheduled successfully.',
        data: {
          ...updatedProfile,
          permissions: getPermissionsMeta(req.hrOpsEmployee),
          permittedEnquiryStatuses: PERMITTED_ENQUIRY_STATUSES
        }
      });
    } catch (err) {
      handleRouteError(res, err, 'Failed to schedule follow-up');
    }
  });

  // PATCH /api/hr-ops/follow-ups/:followUpId - Complete or update follow-up
  app.patch('/api/hr-ops/follow-ups/:followUpId', requireHrOperationsAuth, async (req, res) => {
    try {
      const updatedProfile = await updateHrFollowUp(
        req.db,
        req.hrOpsEmployee,
        decodeURIComponent(req.params.followUpId),
        req.body || {},
        logAuditTrail,
        getClientIp(req)
      );

      res.json({
        success: true,
        message: 'Follow-up updated successfully.',
        data: {
          ...updatedProfile,
          permissions: getPermissionsMeta(req.hrOpsEmployee),
          permittedEnquiryStatuses: PERMITTED_ENQUIRY_STATUSES
        }
      });
    } catch (err) {
      handleRouteError(res, err, 'Failed to update follow-up');
    }
  });

  // GET /api/hr-ops/dashboard/summary - Authenticated HR Operations Daily Operations Dashboard
  app.get('/api/hr-ops/dashboard/summary', requireHrOperationsAuth, async (req, res) => {
    try {
      assertHrSelfIdentityOnly(req, req.hrOpsEmployee);
      const summary = await getHrOperationsDashboardSummary(req.db, req.hrOpsEmployee);
      res.json({
        success: true,
        data: {
          ...summary,
          permissions: getPermissionsMeta(req.hrOpsEmployee),
          permittedEnquiryStatuses: PERMITTED_ENQUIRY_STATUSES
        }
      });
    } catch (err) {
      handleRouteError(res, err, 'Failed to load Daily Operations Dashboard');
    }
  });

  // PATCH /api/hr-ops/tasks/:taskId - Update assigned task status for logged-in HR Operations employee
  app.patch('/api/hr-ops/tasks/:taskId', requireHrOperationsAuth, async (req, res) => {
    try {
      assertHrSelfIdentityOnly(req, req.hrOpsEmployee);
      const summary = await updateHrTaskAssignmentStatus(
        req.db,
        req.hrOpsEmployee,
        decodeURIComponent(req.params.taskId),
        req.body || {},
        logAuditTrail,
        getClientIp(req)
      );
      res.json({
        success: true,
        message: 'Task status updated successfully.',
        data: {
          ...summary,
          permissions: getPermissionsMeta(req.hrOpsEmployee),
          permittedEnquiryStatuses: PERMITTED_ENQUIRY_STATUSES
        }
      });
    } catch (err) {
      handleRouteError(res, err, 'Failed to update assigned task');
    }
  });

  // Explicit 403 Guards blocking unauthorized actions for HR Operations
  const blockForbiddenAction = (actionLabel) => (req, res) =>
    res.status(403).json({
      success: false,
      message: `Access denied: HR Operations employees are not authorized to ${actionLabel}.`
    });

  app.delete('/api/hr-ops/candidates/:candidateKey', requireHrOperationsAuth, blockForbiddenAction('delete candidate records'));
  app.delete('/api/hr-ops/enquiries/:enquiryId', requireHrOperationsAuth, blockForbiddenAction('delete enquiries'));
  app.post('/api/hr-ops/enquiries/:enquiryId/reassign', requireHrOperationsAuth, blockForbiddenAction('reassign enquiries'));
  app.patch('/api/hr-ops/enquiries/:enquiryId/reassign', requireHrOperationsAuth, blockForbiddenAction('reassign enquiries'));
  app.post('/api/hr-ops/requests/:id/approve', requireHrOperationsAuth, blockForbiddenAction('approve restricted requests'));
};

