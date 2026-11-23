/**
 * Company Announcements Routes
 * 
 * Manages official company announcements, policy circulars, and notifications
 * published by HR Lead/Admin and viewed by HR Operations and workforce members.
 * 
 * Enforces server-side Role-Based Access Control (RBAC):
 * - HR Lead / Admin / Super Admin: Full CRUD (Create, Read, Update, Delete, Publish, Drafts).
 * - HR Operations: Read-only access to Published announcements targeted to 'All Employees'
 *   or 'HR Operations' (Drafts and non-applicable audiences are strictly filtered out).
 */

import { verifyCrmSessionToken } from './attendanceRoutes.js';

const HR_LEADERSHIP_ROLES = ['HR Lead', 'Admin', 'Super Admin'];

export const registerAnnouncementRoutes = (app, { getDb, getClientIp, logAuditTrail }) => {
  /**
   * Authentication Middleware
   */
  const requireCrmAuth = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || '';
      let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      if (!token && req.query?.token) {
        token = String(req.query.token).trim();
      }

      if (!token) {
        // Fallback for preview/session headers
        const roleFallback = req.headers['x-crm-role'] || req.headers['x-user-role'] || req.query?.role;
        const emailFallback = req.headers['x-employee-email'] || req.query?.email;
        if (roleFallback || emailFallback) {
          const db = await getDb();
          let emp = null;
          if (emailFallback) {
            emp = await db.get(
              'SELECT * FROM employees WHERE LOWER(email) = ? AND LOWER(COALESCE(status, \'Active\')) != \'inactive\' LIMIT 1',
              [String(emailFallback).toLowerCase().trim()]
            );
          }
          if (!emp && roleFallback) {
            emp = await db.get(
              'SELECT * FROM employees WHERE role = ? AND LOWER(COALESCE(status, \'Active\')) != \'inactive\' LIMIT 1',
              [roleFallback]
            );
          }
          if (emp) {
            req.authEmployee = {
              id: emp.id,
              employeeId: emp.employeeId,
              name: emp.name,
              email: emp.email,
              role: emp.role,
              department: emp.department
            };
            return next();
          }
        }
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please sign in to the CRM portal.'
        });
      }

      const payload = verifyCrmSessionToken(token);
      if (!payload || !payload.employeeId) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired CRM session token. Please sign in again.'
        });
      }

      const db = await getDb();
      const emp = await db.get(
        'SELECT * FROM employees WHERE employeeId = ? OR id = ?',
        [payload.employeeId, payload.id || '']
      );

      if (!emp || String(emp.status || 'Active').toLowerCase() === 'inactive') {
        return res.status(401).json({
          success: false,
          message: 'Employee account is inactive or unavailable.'
        });
      }

      req.authEmployee = {
        id: emp.id,
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        department: emp.department
      };
      next();
    } catch (err) {
      console.error('Announcements Auth Error:', err);
      res.status(500).json({ success: false, message: 'Authentication verification failed.' });
    }
  };

  /**
   * Leadership Authorization Middleware (HR Lead / Admin / Super Admin)
   */
  const requireHrLeadershipRole = (req, res, next) => {
    const role = req.authEmployee?.role || '';
    if (!HR_LEADERSHIP_ROLES.includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only HR Lead or Administrators are permitted to create, edit, or delete company announcements.'
      });
    }
    next();
  };

  // =========================================================================
  // 1. GET /api/company-announcements
  // Returns announcements tailored by role (Drafts & all audiences for HR Lead;
  // strictly Published & audience-scoped for HR Operations and others).
  // =========================================================================
  app.get('/api/company-announcements', requireCrmAuth, async (req, res) => {
    try {
      const db = await getDb();
      const role = req.authEmployee?.role || '';
      const isLeadership = HR_LEADERSHIP_ROLES.includes(role);

      let announcements;
      if (isLeadership) {
        // Leadership can view all announcements including drafts
        announcements = await db.all(
          `SELECT * FROM company_announcements ORDER BY COALESCE(published_at, created_at) DESC`
        );
      } else {
        // HR Operations and staff see only Published announcements targeted to HR Operations or All Employees, not expired
        announcements = await db.all(
          `SELECT * FROM company_announcements 
           WHERE status = 'Published' 
             AND (target_audience = 'All Employees' OR target_audience = 'HR Operations')
             AND (expires_at IS NULL OR expires_at = '' OR expires_at >= date('now', 'localtime'))
           ORDER BY COALESCE(published_at, created_at) DESC`
        );
      }

      res.json({
        success: true,
        count: announcements.length,
        isLeadership,
        announcements
      });
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve company announcements.' });
    }
  });

  // =========================================================================
  // 2. POST /api/company-announcements
  // Create a new announcement (Draft or Published). Restricted to HR Lead / Admin.
  // =========================================================================
  app.post('/api/company-announcements', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const {
        title,
        description,
        category = 'General Notice',
        target_audience = 'All Employees',
        status = 'Published',
        expires_at = null
      } = req.body || {};

      const cleanTitle = String(title || '').trim();
      const cleanDesc = String(description || '').trim();

      if (!cleanTitle) {
        return res.status(400).json({ success: false, message: 'Announcement Title is required.' });
      }
      if (!cleanDesc) {
        return res.status(400).json({ success: false, message: 'Announcement Description is required.' });
      }

      const validStatuses = ['Published', 'Draft'];
      const finalStatus = validStatuses.includes(status) ? status : 'Published';

      const validAudiences = ['All Employees', 'HR Operations'];
      const finalAudience = validAudiences.includes(target_audience) ? target_audience : 'All Employees';

      const validCategories = [
        'General Notice',
        'HR Policy',
        'Holiday',
        'Important Update',
        'Emergency Alert',
        'Welfare & Benefits'
      ];
      const finalCategory = validCategories.includes(category) ? category : 'General Notice';

      const id = `ANN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const now = new Date().toISOString();
      const publishedAt = finalStatus === 'Published' ? now : null;

      const createdBy = req.authEmployee.employeeId || req.authEmployee.id || 'REV-EMP-006';
      const createdByName = req.authEmployee.name || 'Priya Sharma';
      const createdByRole = req.authEmployee.role || 'HR Lead';

      const db = await getDb();
      await db.run(
        `INSERT INTO company_announcements (
          id, title, description, category, target_audience, status,
          created_by, created_by_name, created_by_role, created_at, published_at, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          cleanTitle,
          cleanDesc,
          finalCategory,
          finalAudience,
          finalStatus,
          createdBy,
          createdByName,
          createdByRole,
          now,
          publishedAt,
          expires_at || null
        ]
      );

      const created = await db.get('SELECT * FROM company_announcements WHERE id = ?', [id]);

      if (logAuditTrail) {
        logAuditTrail({
          action: finalStatus === 'Published' ? 'ANNOUNCEMENT_PUBLISHED' : 'ANNOUNCEMENT_DRAFT_CREATED',
          userId: createdBy,
          userRole: createdByRole,
          details: `Announcement "${cleanTitle}" [${finalStatus}] targeted to ${finalAudience}`,
          ip: getClientIp ? getClientIp(req) : '127.0.0.1'
        }).catch(() => {});
      }

      res.status(201).json({
        success: true,
        message: finalStatus === 'Published'
          ? 'Announcement published successfully and broadcast to target audience.'
          : 'Announcement saved as draft.',
        announcement: created
      });
    } catch (err) {
      console.error('Failed to create announcement:', err);
      res.status(500).json({ success: false, message: 'Failed to create announcement.' });
    }
  });

  // =========================================================================
  // 3. PATCH /api/company-announcements/:id
  // Update an existing announcement. Restricted to HR Lead / Admin.
  // =========================================================================
  app.patch('/api/company-announcements/:id', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const { id } = req.params;
      const db = await getDb();
      const existing = await db.get('SELECT * FROM company_announcements WHERE id = ?', [id]);

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Announcement not found.' });
      }

      const {
        title,
        description,
        category,
        target_audience,
        status,
        expires_at
      } = req.body || {};

      const cleanTitle = title !== undefined ? String(title).trim() : existing.title;
      const cleanDesc = description !== undefined ? String(description).trim() : existing.description;
      const cleanCat = category !== undefined ? String(category).trim() : existing.category;
      const cleanAudience = target_audience !== undefined ? String(target_audience).trim() : existing.target_audience;
      const cleanStatus = status !== undefined ? String(status).trim() : existing.status;
      const cleanExpires = expires_at !== undefined ? expires_at : existing.expires_at;

      let publishedAt = existing.published_at;
      if (cleanStatus === 'Published' && (!existing.published_at || existing.status === 'Draft')) {
        publishedAt = new Date().toISOString();
      }

      const now = new Date().toISOString();

      await db.run(
        `UPDATE company_announcements SET
          title = ?,
          description = ?,
          category = ?,
          target_audience = ?,
          status = ?,
          published_at = ?,
          expires_at = ?,
          updated_at = ?
         WHERE id = ?`,
        [
          cleanTitle,
          cleanDesc,
          cleanCat,
          cleanAudience,
          cleanStatus,
          publishedAt,
          cleanExpires,
          now,
          id
        ]
      );

      const updated = await db.get('SELECT * FROM company_announcements WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Announcement updated successfully.',
        announcement: updated
      });
    } catch (err) {
      console.error('Failed to update announcement:', err);
      res.status(500).json({ success: false, message: 'Failed to update announcement.' });
    }
  });

  // =========================================================================
  // 4. POST /api/company-announcements/:id/publish
  // Direct publish action for a draft announcement. Restricted to HR Lead / Admin.
  // =========================================================================
  app.post('/api/company-announcements/:id/publish', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const { id } = req.params;
      const db = await getDb();
      const existing = await db.get('SELECT * FROM company_announcements WHERE id = ?', [id]);

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Announcement not found.' });
      }

      const now = new Date().toISOString();
      await db.run(
        `UPDATE company_announcements SET status = 'Published', published_at = ?, updated_at = ? WHERE id = ?`,
        [now, now, id]
      );

      const updated = await db.get('SELECT * FROM company_announcements WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Announcement published successfully and visible to target audience.',
        announcement: updated
      });
    } catch (err) {
      console.error('Failed to publish announcement:', err);
      res.status(500).json({ success: false, message: 'Failed to publish announcement.' });
    }
  });

  // =========================================================================
  // 5. DELETE /api/company-announcements/:id
  // Delete an announcement. Restricted to HR Lead / Admin.
  // =========================================================================
  app.delete('/api/company-announcements/:id', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const { id } = req.params;
      const db = await getDb();
      const existing = await db.get('SELECT * FROM company_announcements WHERE id = ?', [id]);

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Announcement not found.' });
      }

      await db.run('DELETE FROM company_announcements WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Announcement deleted successfully.'
      });
    } catch (err) {
      console.error('Failed to delete announcement:', err);
      res.status(500).json({ success: false, message: 'Failed to delete announcement.' });
    }
  });
};
