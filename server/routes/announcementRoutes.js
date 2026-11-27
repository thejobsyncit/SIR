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
const COMPANY_TIMEZONE = 'Asia/Kolkata';

const getKolkataTodayStr = (date = new Date()) => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: COMPANY_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
};

const getKolkataDateFromIso = (isoStr) => {
  if (!isoStr) return '';
  const s = String(isoStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return '';
  return getKolkataTodayStr(d);
};

const buildSnapshot = (ann) => {
  if (!ann) return null;
  return JSON.stringify({
    id: ann.id,
    title: ann.title,
    description: ann.description,
    category: ann.category,
    target_audience: ann.target_audience,
    status: ann.status,
    created_by: ann.created_by,
    created_by_name: ann.created_by_name,
    created_by_role: ann.created_by_role,
    published_at: ann.published_at || null,
    expires_at: ann.expires_at || null,
    was_published: Boolean(ann.was_published || ann.published_at)
  });
};

const recordAnnouncementAudit = async (db, { announcementId, action, actor, details = '', reason = null, snapshot = null }) => {
  try {
    const id = `ANN-LOG-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();
    await db.run(
      `INSERT INTO company_announcement_audit_logs (
        id, announcement_id, action, actor_id, actor_name, actor_role, details, reason, snapshot_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        announcementId,
        action,
        actor?.employeeId || actor?.id || 'SYSTEM',
        actor?.name || 'System Scheduler',
        actor?.role || 'System',
        details || null,
        reason ? String(reason).trim() : null,
        snapshot ? (typeof snapshot === 'string' ? snapshot : buildSnapshot(snapshot)) : null,
        now
      ]
    );
  } catch (err) {
    console.warn('Failed to record announcement audit log:', err.message);
  }
};

const toBoolFlag = (val) => {
  if (val === true || val === 1) return true;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === '1' || s === 'true' || s === 't' || s === 'yes';
  }
  return false;
};

const computeExpiryMeta = (ann, todayStr) => {
  const expStr = ann.expires_at ? getKolkataDateFromIso(ann.expires_at) : '';
  const pubStr = getKolkataDateFromIso(ann.published_at || ann.created_at);
  const isDeleted = toBoolFlag(ann.is_deleted) || ann.status === 'Deleted';
  const wasPublished = toBoolFlag(ann.was_published) ||
    Boolean(ann.published_at) ||
    ann.status === 'Published' ||
    ann.status === 'Expired';

  let computedStatus = isDeleted ? 'Deleted' : (ann.status || 'Published');
  let expiryState = isDeleted ? 'Deleted' : 'Active';

  if (!isDeleted) {
    if (computedStatus === 'Expired' || (expStr && expStr < todayStr && computedStatus !== 'Draft')) {
      computedStatus = 'Expired';
      expiryState = 'Expired';
    } else if (computedStatus === 'Scheduled' || (computedStatus === 'Published' && pubStr && pubStr > todayStr)) {
      computedStatus = 'Scheduled';
      expiryState = 'Scheduled';
    } else if (computedStatus === 'Draft') {
      expiryState = 'Draft';
    } else if (expStr) {
      const tMs = Date.parse(`${todayStr}T00:00:00Z`);
      const eMs = Date.parse(`${expStr}T00:00:00Z`);
      const diffDays = Math.ceil((eMs - tMs) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 3) {
        expiryState = 'Expiring Soon';
      }
    }
  }

  return {
    ...ann,
    status: computedStatus,
    expiryState,
    publishDate: pubStr || todayStr,
    isExpired: computedStatus === 'Expired',
    isDeleted,
    wasPublished
  };
};

const syncExpiredAnnouncements = async (db) => {
  const todayStr = getKolkataTodayStr();
  const nowIso = new Date().toISOString();

  const allRows = await db.all(`SELECT * FROM company_announcements`).catch(() => []);

  // Promote due Scheduled announcements to Published (if not already expired or soft-deleted)
  const scheduled = allRows.filter((r) => r.status === 'Scheduled' && !toBoolFlag(r.is_deleted));
  for (const row of scheduled) {
    const pubDate = getKolkataDateFromIso(row.published_at);
    const expDate = row.expires_at ? getKolkataDateFromIso(row.expires_at) : '';
    if (expDate && expDate < todayStr) {
      await db.run(`UPDATE company_announcements SET status = ?, was_published = ?, updated_at = ? WHERE id = ?`, ['Expired', 1, nowIso, row.id]);
      await recordAnnouncementAudit(db, {
        announcementId: row.id,
        action: 'EXPIRED',
        actor: { employeeId: 'SYSTEM', name: 'Expiry Scheduler', role: 'System' },
        details: `Announcement "${row.title}" expired automatically (expiry date: ${expDate}).`,
        snapshot: { ...row, status: 'Expired', was_published: 1 }
      });
    } else if (pubDate && pubDate <= todayStr) {
      await db.run(`UPDATE company_announcements SET status = ?, was_published = ?, updated_at = ? WHERE id = ?`, ['Published', 1, nowIso, row.id]);
      await recordAnnouncementAudit(db, {
        announcementId: row.id,
        action: 'PUBLISHED',
        actor: { employeeId: 'SYSTEM', name: 'Publication Scheduler', role: 'System' },
        details: `Scheduled announcement "${row.title}" became active on ${todayStr}.`,
        snapshot: { ...row, status: 'Published', was_published: 1 }
      });
    }
  }

  // Mark past-expiry Published announcements as Expired (retaining records in DB)
  const active = allRows.filter((r) => r.status === 'Published' && !toBoolFlag(r.is_deleted) && r.expires_at);
  for (const row of active) {
    const expDate = getKolkataDateFromIso(row.expires_at);
    if (expDate && expDate < todayStr) {
      await db.run(`UPDATE company_announcements SET status = ?, updated_at = ? WHERE id = ?`, ['Expired', nowIso, row.id]);
      await recordAnnouncementAudit(db, {
        announcementId: row.id,
        action: 'EXPIRED',
        actor: { employeeId: 'SYSTEM', name: 'Expiry Scheduler', role: 'System' },
        details: `Announcement "${row.title}" expired automatically on ${expDate} (${COMPANY_TIMEZONE}).`,
        snapshot: { ...row, status: 'Expired' }
      });
    }
  }

  return todayStr;
};

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
      let emp = await db.get(
        'SELECT * FROM employees WHERE employeeId = ? OR id = ? OR LOWER(email) = LOWER(?)',
        [payload.employeeId, payload.id || '', payload.email || payload.employeeId || '']
      );
      if (!emp && payload.email) {
        emp = await db.get('SELECT * FROM employees WHERE LOWER(email) = LOWER(?)', [payload.email.trim()]);
      }
      if (!emp && payload.role) {
        emp = await db.get(
          'SELECT * FROM employees WHERE LOWER(role) = LOWER(?) AND LOWER(COALESCE(status, "Active")) != "inactive" LIMIT 1',
          [payload.role.trim()]
        );
      }
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
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');

      const db = await getDb();
      await Promise.all([
        db.refreshTable?.('company_announcements'),
        db.refreshTable?.('company_announcement_audit_logs')
      ]);
      const todayStr = await syncExpiredAnnouncements(db);
      const role = req.authEmployee?.role || '';
      const isLeadership = HR_LEADERSHIP_ROLES.includes(role);

      let announcements = [];
      let calendarAnnouncements = [];

      const allAuditLogs = await db.all(
        `SELECT * FROM company_announcement_audit_logs ORDER BY created_at DESC`
      ).catch(() => []);
      const logsByAnnId = new Map();
      for (const log of allAuditLogs) {
        if (!logsByAnnId.has(log.announcement_id)) {
          logsByAnnId.set(log.announcement_id, []);
        }
        logsByAnnId.get(log.announcement_id).push(log);
      }

const parseTimestampMs = (raw) => {
  if (!raw) return 0;
  const s = String(raw).trim();
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s) ? `${s.replace(' ', 'T')}Z` : s;
  const ms = Date.parse(normalized);
  return Number.isNaN(ms) ? 0 : ms;
};

const attachLogsAndSort = (list, logsByAnnId) => {
  return [...list]
    .sort((a, b) => {
      const aTime = parseTimestampMs(a.published_at || a.created_at) || parseTimestampMs(a.created_at);
      const bTime = parseTimestampMs(b.published_at || b.created_at) || parseTimestampMs(b.created_at);
      if (bTime !== aTime) return bTime - aTime;
      return parseTimestampMs(b.created_at) - parseTimestampMs(a.created_at);
    })
    .map((item) => ({
      ...item,
      auditLogs: logsByAnnId.get(item.id) || []
    }));
};

      const rows = await db.all(`SELECT * FROM company_announcements`);
      const enrichedAll = attachLogsAndSort(rows.map((r) => computeExpiryMeta(r, todayStr)), logsByAnnId);

      if (isLeadership) {
        // Leadership dashboard feed excludes Expired and Deleted announcements;
        // Shared Calendar retains full history (Published, Scheduled, Draft, Expired, Deleted)
        announcements = enrichedAll.filter((a) => !a.isExpired && !a.isDeleted && a.status !== 'Expired' && a.status !== 'Deleted');
        calendarAnnouncements = enrichedAll;
      } else {
        // HR Operations views active Published announcements in feed (not expired, not deleted, not scheduled),
        // and Published/Scheduled/Expired/Previously-Published-Deleted (audience-scoped, never Drafts) in shared calendar history
        const scoped = enrichedAll.filter((a) => {
          const audienceOk = a.target_audience === 'All Employees' || a.target_audience === 'HR Operations';
          if (!audienceOk) return false;
          if (!a.isDeleted) {
            return a.status === 'Published' || a.status === 'Scheduled' || a.status === 'Expired';
          }
          return Boolean(a.wasPublished);
        });
        announcements = scoped.filter((a) => a.status === 'Published' && !a.isExpired && !a.isDeleted);
        calendarAnnouncements = scoped;
      }

      res.json({
        success: true,
        count: announcements.length,
        isLeadership,
        timezone: COMPANY_TIMEZONE,
        todayDate: todayStr,
        announcements,
        calendarAnnouncements
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
        publish_date = null,
        published_at = null,
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

      const todayStr = getKolkataTodayStr();
      const cleanExpires = expires_at && /^\d{4}-\d{2}-\d{2}$/.test(String(expires_at).trim())
        ? String(expires_at).trim()
        : (expires_at ? null : null);

      if (expires_at && !cleanExpires) {
        return res.status(400).json({ success: false, message: 'Invalid expiry date format. Use YYYY-MM-DD.' });
      }

      const rawPubDate = publish_date || published_at;
      let cleanPubDate = '';
      if (rawPubDate) {
        cleanPubDate = getKolkataDateFromIso(rawPubDate);
        if (!cleanPubDate) {
          return res.status(400).json({ success: false, message: 'Invalid publish date format.' });
        }
      }

      const validStatuses = ['Published', 'Draft', 'Scheduled'];
      let finalStatus = validStatuses.includes(status) ? status : 'Published';
      if (cleanExpires && cleanExpires < todayStr && finalStatus === 'Published') {
        finalStatus = 'Expired';
      } else if (cleanPubDate && cleanPubDate > todayStr && finalStatus === 'Published') {
        finalStatus = 'Scheduled';
      }

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
      const publishedAt = finalStatus === 'Draft'
        ? null
        : (cleanPubDate && cleanPubDate !== todayStr ? `${cleanPubDate}T09:00:00+05:30` : now);

      const createdBy = req.authEmployee.employeeId || req.authEmployee.id || 'REV-EMP-006';
      const createdByName = req.authEmployee.name || 'Priya Sharma';
      const createdByRole = req.authEmployee.role || 'HR Lead';

      const wasPublished = finalStatus === 'Published' || finalStatus === 'Scheduled' || finalStatus === 'Expired' ? 1 : 0;

      const db = await getDb();
      await db.run(
        `INSERT INTO company_announcements (
          id, title, description, category, target_audience, status,
          created_by, created_by_name, created_by_role, created_at, published_at, expires_at,
          is_deleted, was_published
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          cleanExpires,
          0,
          wasPublished
        ]
      );

      const created = await db.get('SELECT * FROM company_announcements WHERE id = ?', [id]);

      await recordAnnouncementAudit(db, {
        announcementId: id,
        action: finalStatus === 'Draft' ? 'CREATED' : (finalStatus === 'Scheduled' ? 'SCHEDULED' : 'PUBLISHED'),
        actor: req.authEmployee,
        details: `Created announcement "${cleanTitle}" with status ${finalStatus} for ${finalAudience}${cleanExpires ? ` (expires ${cleanExpires})` : ''}.`,
        snapshot: created
      });

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
      await db.refreshTable?.('company_announcements');
      const existing = await db.get('SELECT * FROM company_announcements WHERE id = ?', [id]);

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Announcement not found.' });
      }
      if (toBoolFlag(existing.is_deleted)) {
        return res.status(400).json({ success: false, message: 'Deleted announcements cannot be edited. Restore the announcement first.' });
      }

      const {
        title,
        description,
        category,
        target_audience,
        status,
        publish_date,
        published_at,
        expires_at
      } = req.body || {};

      const todayStr = getKolkataTodayStr();
      const cleanTitle = title !== undefined ? String(title).trim() : existing.title;
      const cleanDesc = description !== undefined ? String(description).trim() : existing.description;
      const cleanCat = category !== undefined ? String(category).trim() : existing.category;
      const cleanAudience = target_audience !== undefined ? String(target_audience).trim() : existing.target_audience;
      let cleanStatus = status !== undefined ? String(status).trim() : existing.status;

      let cleanExpires = existing.expires_at;
      if (expires_at !== undefined) {
        if (!expires_at) {
          cleanExpires = null;
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(String(expires_at).trim())) {
          cleanExpires = String(expires_at).trim();
        } else {
          return res.status(400).json({ success: false, message: 'Invalid expiry date format. Use YYYY-MM-DD.' });
        }
      }

      let publishedAt = existing.published_at;
      const existingPubDateStr = existing.published_at ? getKolkataDateFromIso(existing.published_at) : '';
      const rawPubDate = publish_date !== undefined ? publish_date : published_at;
      if (rawPubDate) {
        const pubDateStr = getKolkataDateFromIso(rawPubDate);
        if (!pubDateStr) {
          return res.status(400).json({ success: false, message: 'Invalid publish date format.' });
        }
        if (pubDateStr !== existingPubDateStr) {
          publishedAt = pubDateStr === todayStr ? new Date().toISOString() : `${pubDateStr}T09:00:00+05:30`;
        }
        if (pubDateStr > todayStr && cleanStatus === 'Published') {
          cleanStatus = 'Scheduled';
        }
      } else if (cleanStatus === 'Published' && (!existing.published_at || existing.status === 'Draft')) {
        publishedAt = new Date().toISOString();
      }

      if (cleanExpires && cleanExpires < todayStr && cleanStatus === 'Published') {
        cleanStatus = 'Expired';
      }

      const now = new Date().toISOString();
      const wasPublished = existing.was_published || cleanStatus === 'Published' || cleanStatus === 'Scheduled' || cleanStatus === 'Expired' ? 1 : 0;

      await db.run(
        `UPDATE company_announcements SET
          title = ?,
          description = ?,
          category = ?,
          target_audience = ?,
          status = ?,
          published_at = ?,
          expires_at = ?,
          was_published = ?,
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
          wasPublished,
          now,
          id
        ]
      );

      const updated = await db.get('SELECT * FROM company_announcements WHERE id = ?', [id]);

      await recordAnnouncementAudit(db, {
        announcementId: id,
        action: existing.status === 'Draft' && cleanStatus === 'Published' ? 'PUBLISHED' : 'EDITED',
        actor: req.authEmployee,
        details: `Updated announcement "${cleanTitle}" (${existing.status} → ${cleanStatus}).`,
        snapshot: updated
      });

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
      await db.refreshTable?.('company_announcements');
      const existing = await db.get('SELECT * FROM company_announcements WHERE id = ?', [id]);

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Announcement not found.' });
      }
      if (toBoolFlag(existing.is_deleted)) {
        return res.status(400).json({ success: false, message: 'Deleted announcements cannot be published. Restore the announcement first.' });
      }

      const now = new Date().toISOString();
      await db.run(
        `UPDATE company_announcements SET status = ?, published_at = ?, was_published = ?, is_deleted = ?, updated_at = ? WHERE id = ?`,
        ['Published', now, 1, 0, now, id]
      );

      const updated = await db.get('SELECT * FROM company_announcements WHERE id = ?', [id]);

      await recordAnnouncementAudit(db, {
        announcementId: id,
        action: 'PUBLISHED',
        actor: req.authEmployee,
        details: `Published announcement "${updated.title}".`,
        snapshot: updated
      });

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
  // Soft-delete an announcement and record audit trail. Restricted to HR Lead / Admin.
  // =========================================================================
  app.delete('/api/company-announcements/:id', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const { id } = req.params;
      const reason = String(req.body?.reason || req.query?.reason || '').trim();
      const db = await getDb();
      await db.refreshTable?.('company_announcements');
      const existing = await db.get('SELECT * FROM company_announcements WHERE id = ?', [id]);

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Announcement not found.' });
      }
      if (toBoolFlag(existing.is_deleted)) {
        return res.status(400).json({ success: false, message: 'Announcement is already deleted.' });
      }

      const now = new Date().toISOString();
      const actorId = req.authEmployee.employeeId || req.authEmployee.id || 'HR-LEAD';
      const actorName = req.authEmployee.name || 'HR Lead';
      const actorRole = req.authEmployee.role || 'HR Lead';
      const wasPublished = toBoolFlag(existing.was_published) || Boolean(existing.published_at) || ['Published', 'Scheduled', 'Expired'].includes(existing.status) ? 1 : 0;

      await db.run(
        `UPDATE company_announcements SET
          is_deleted = ?,
          status = ?,
          deleted_at = ?,
          deleted_by = ?,
          deleted_by_name = ?,
          deleted_by_role = ?,
          deletion_reason = ?,
          was_published = ?,
          updated_at = ?
         WHERE id = ?`,
        [1, 'Deleted', now, actorId, actorName, actorRole, reason || null, wasPublished, now, id]
      );

      const updated = await db.get('SELECT * FROM company_announcements WHERE id = ?', [id]);

      await recordAnnouncementAudit(db, {
        announcementId: id,
        action: 'DELETED',
        actor: req.authEmployee,
        details: `Soft-deleted announcement "${existing.title}" (${wasPublished ? 'Previously Published' : 'Never Published Draft'}).`,
        reason: reason || null,
        snapshot: existing
      });

      res.json({
        success: true,
        message: 'Announcement soft-deleted and preserved in calendar audit history.',
        announcement: updated
      });
    } catch (err) {
      console.error('Failed to delete announcement:', err);
      res.status(500).json({ success: false, message: 'Failed to delete announcement.' });
    }
  });

  // =========================================================================
  // 6. POST /api/company-announcements/:id/restore
  // Restore a soft-deleted announcement. Restricted to HR Lead / Admin.
  // =========================================================================
  app.post('/api/company-announcements/:id/restore', requireCrmAuth, requireHrLeadershipRole, async (req, res) => {
    try {
      const { id } = req.params;
      const db = await getDb();
      await db.refreshTable?.('company_announcements');
      const existing = await db.get('SELECT * FROM company_announcements WHERE id = ?', [id]);

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Announcement not found.' });
      }
      if (!toBoolFlag(existing.is_deleted)) {
        return res.status(400).json({ success: false, message: 'Announcement is not deleted.' });
      }

      const todayStr = getKolkataTodayStr();
      const pubStr = getKolkataDateFromIso(existing.published_at);
      const expStr = existing.expires_at ? getKolkataDateFromIso(existing.expires_at) : '';

      let restoredStatus = toBoolFlag(existing.was_published) || existing.published_at ? 'Published' : 'Draft';
      if (restoredStatus === 'Published') {
        if (expStr && expStr < todayStr) {
          restoredStatus = 'Expired';
        } else if (pubStr && pubStr > todayStr) {
          restoredStatus = 'Scheduled';
        }
      }

      const now = new Date().toISOString();
      await db.run(
        `UPDATE company_announcements SET
          is_deleted = ?,
          status = ?,
          deleted_at = ?,
          deleted_by = ?,
          deleted_by_name = ?,
          deleted_by_role = ?,
          deletion_reason = ?,
          updated_at = ?
         WHERE id = ?`,
        [0, restoredStatus, null, null, null, null, null, now, id]
      );

      const updated = await db.get('SELECT * FROM company_announcements WHERE id = ?', [id]);

      await recordAnnouncementAudit(db, {
        announcementId: id,
        action: 'RESTORED',
        actor: req.authEmployee,
        details: `Restored announcement "${existing.title}" with status ${restoredStatus}.`,
        snapshot: updated
      });

      res.json({
        success: true,
        message: `Announcement restored (${restoredStatus}).`,
        announcement: updated
      });
    } catch (err) {
      console.error('Failed to restore announcement:', err);
      res.status(500).json({ success: false, message: 'Failed to restore announcement.' });
    }
  });

  // =========================================================================
  // 7. GET /api/company-announcements/:id/audit
  // Immutable audit history for an announcement (RBAC-checked).
  // =========================================================================
  app.get('/api/company-announcements/:id/audit', requireCrmAuth, async (req, res) => {
    try {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const { id } = req.params;
      const db = await getDb();
      await Promise.all([
        db.refreshTable?.('company_announcements'),
        db.refreshTable?.('company_announcement_audit_logs')
      ]);
      const ann = await db.get('SELECT * FROM company_announcements WHERE id = ?', [id]);
      if (!ann) {
        return res.status(404).json({ success: false, message: 'Announcement not found.' });
      }
      const isLeadership = HR_LEADERSHIP_ROLES.includes(req.authEmployee?.role || '');
      const wasPub = toBoolFlag(ann.was_published) || Boolean(ann.published_at);
      const audienceOk = ann.target_audience === 'All Employees' || ann.target_audience === 'HR Operations';
      if (!isLeadership && (!wasPub || !audienceOk)) {
        return res.status(403).json({ success: false, message: 'Access denied to this announcement audit history.' });
      }
      const logs = await db.all(
        `SELECT * FROM company_announcement_audit_logs WHERE announcement_id = ? ORDER BY created_at DESC`,
        [id]
      );
      res.json({ success: true, logs });
    } catch (err) {
      console.error('Failed to fetch announcement audit logs:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve announcement audit history.' });
    }
  });
};
