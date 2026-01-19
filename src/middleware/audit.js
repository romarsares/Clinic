/**
 * Audit Logging Middleware
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Provides comprehensive audit logging for clinical data access and modifications
 * 
 * This middleware logs:
 * - All clinical data access (view, create, update, delete)
 * - User actions with timestamps
 * - IP addresses and user agents
 * - Data changes (before/after values)
 * - Compliance-required audit trails
 */

const db = require('../config/database');

/**
 * Enhanced audit logging for clinical actions
 */
const auditLog = (entity, action) => {
  return async (req, res, next) => {
    // Store original res.json to capture response data
    const originalJson = res.json;
    let responseData = null;

    res.json = function(data) {
      responseData = data;
      return originalJson.call(this, data);
    };

    // Continue with the request
    next();

    // Log after response is sent
    res.on('finish', async () => {
      try {
        if (!req.user) return;

        const auditData = {
          clinic_id: req.user.clinic_id,
          user_id: req.user.id,
          action: action,
          entity: entity,
          entity_id: req.params.id || null,
          old_value: null,
          new_value: null,
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.get('User-Agent'),
          method: req.method,
          url: req.originalUrl,
          status_code: res.statusCode,
          request_body: sanitizeRequestBody(req.body),
          response_data: sanitizeResponseData(responseData)
        };

        // Capture old values for update operations
        if (action === 'update' && req.params.id) {
          auditData.old_value = await getEntityCurrentValue(entity, req.params.id, req.user.clinic_id);
        }

        // Capture new values for create/update operations
        if (['create', 'update'].includes(action)) {
          auditData.new_value = JSON.stringify(auditData.request_body);
        }

        await logAuditEntry(auditData);

      } catch (error) {
        console.error('Audit logging error:', error);
        // Don't fail the request if audit logging fails
      }
    });
  };
};

/**
 * Log audit entry to database
 */
const logAuditEntry = async (auditData) => {
  const query = `
    INSERT INTO audit_logs (
      clinic_id, user_id, action, entity, entity_id, old_value, new_value,
      ip_address, user_agent, method, url, status_code, request_body, response_data, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  await db.execute(query, [
    auditData.clinic_id,
    auditData.user_id,
    auditData.action,
    auditData.entity,
    auditData.entity_id,
    auditData.old_value,
    auditData.new_value,
    auditData.ip_address,
    auditData.user_agent,
    auditData.method,
    auditData.url,
    auditData.status_code,
    JSON.stringify(auditData.request_body),
    JSON.stringify(auditData.response_data)
  ]);
};

/**
 * Get current entity value for update operations
 */
const getEntityCurrentValue = async (entity, entityId, clinicId) => {
  try {
    let query = '';
    let params = [entityId, clinicId];

    switch (entity) {
      case 'visit':
        query = 'SELECT * FROM visits WHERE id = ? AND clinic_id = ?';
        break;
      case 'diagnosis':
        query = 'SELECT * FROM visit_diagnoses WHERE id = ? AND clinic_id = ?';
        break;
      case 'vital_signs':
        query = 'SELECT * FROM visit_vital_signs WHERE visit_id = ? AND clinic_id = ?';
        break;
      case 'chief_complaint':
      case 'clinical_assessment':
      case 'treatment_plan':
      case 'follow_up_instructions':
        query = `SELECT * FROM visit_notes WHERE visit_id = ? AND clinic_id = ? AND note_type = ?`;
        params = [entityId, clinicId, entity];
        break;
      default:
        return null;
    }

    const [rows] = await db.execute(query, params);
    return rows.length > 0 ? JSON.stringify(rows[0]) : null;

  } catch (error) {
    console.error('Error getting entity current value:', error);
    return null;
  }
};

/**
 * Sanitize request body to remove sensitive data
 */
const sanitizeRequestBody = (body) => {
  if (!body || typeof body !== 'object') return body;

  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'password_hash', 'token', 'secret'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
};

/**
 * Sanitize response data to remove sensitive information
 */
const sanitizeResponseData = (data) => {
  if (!data || typeof data !== 'object') return data;

  const sanitized = { ...data };
  
  // Remove sensitive fields from response
  const sensitiveFields = ['password', 'password_hash', 'token'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  // Limit response data size for audit logs
  const responseString = JSON.stringify(sanitized);
  if (responseString.length > 5000) {
    return { message: 'Response data truncated for audit log', size: responseString.length };
  }

  return sanitized;
};

/**
 * Log clinical data access for compliance
 */
const logClinicalAccess = (dataType) => {
  return async (req, res, next) => {
    next();

    // Log after response
    res.on('finish', async () => {
      try {
        if (!req.user || res.statusCode !== 200) return;

        const accessLog = {
          clinic_id: req.user.clinic_id,
          user_id: req.user.id,
          data_type: dataType,
          patient_id: req.params.patientId || req.body.patient_id || null,
          visit_id: req.params.id || req.body.visit_id || null,
          access_type: req.method === 'GET' ? 'view' : 'modify',
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.get('User-Agent'),
          accessed_at: new Date()
        };

        const query = `
          INSERT INTO clinical_access_logs (
            clinic_id, user_id, data_type, patient_id, visit_id, access_type,
            ip_address, user_agent, accessed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.execute(query, [
          accessLog.clinic_id,
          accessLog.user_id,
          accessLog.data_type,
          accessLog.patient_id,
          accessLog.visit_id,
          accessLog.access_type,
          accessLog.ip_address,
          accessLog.user_agent,
          accessLog.accessed_at
        ]);

      } catch (error) {
        console.error('Clinical access logging error:', error);
      }
    });
  };
};

/**
 * Log failed access attempts
 */
const logFailedAccess = (req, res, next) => {
  const originalStatus = res.status;
  
  res.status = function(code) {
    if (code === 401 || code === 403) {
      // Log failed access attempt
      logFailedAccessAttempt(req, code);
    }
    return originalStatus.call(this, code);
  };

  next();
};

/**
 * Log failed access attempt to database
 */
const logFailedAccessAttempt = async (req, statusCode) => {
  try {
    const query = `
      INSERT INTO failed_access_logs (
        ip_address, user_agent, url, method, status_code, attempted_at
      ) VALUES (?, ?, ?, ?, ?, NOW())
    `;

    await db.execute(query, [
      req.ip || req.connection.remoteAddress || null,
      req.get('User-Agent') || null,
      req.originalUrl || null,
      req.method || null,
      statusCode
    ]);

  } catch (error) {
    console.error('Failed access logging error:', error);
  }
};

module.exports = {
  auditLog,
  logClinicalAccess,
  logFailedAccess
};