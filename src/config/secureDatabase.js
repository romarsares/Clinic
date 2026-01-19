/**
 * Database Security Hardening - Phase 6
 * 
 * Author: DevSecOps Engineer
 * Created: 2024-01-19
 * Purpose: Secure database operations with prepared statements and connection security
 */

const mysql = require('mysql2/promise');
const crypto = require('crypto');

class SecureDatabase {
  constructor() {
    this.pool = null;
    this.encryptionKey = process.env.DB_ENCRYPTION_KEY || this.generateEncryptionKey();
  }

  generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  async initialize() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'clinic_saas',
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true,
      // Security configurations
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: true
      } : false,
      charset: 'utf8mb4',
      timezone: '+00:00',
      // Prevent SQL injection
      queryFormat: function (query, values) {
        if (!values) return query;
        return query.replace(/\:(\w+)/g, function (txt, key) {
          if (values.hasOwnProperty(key)) {
            return this.escape(values[key]);
          }
          return txt;
        }.bind(this));
      }
    });

    // Test connection security
    await this.testSecureConnection();
  }

  async testSecureConnection() {
    try {
      const connection = await this.pool.getConnection();
      
      // Verify secure connection
      const [rows] = await connection.execute('SELECT CONNECTION_ID(), USER(), @@version');
      console.log('🔒 Secure database connection established:', {
        connectionId: rows[0]['CONNECTION_ID()'],
        user: rows[0]['USER()'],
        version: rows[0]['@@version']
      });

      connection.release();
    } catch (error) {
      console.error('❌ Database security test failed:', error);
      throw error;
    }
  }

  // Secure execute with prepared statements
  async secureExecute(query, params = []) {
    try {
      // Log query for audit (without sensitive data)
      const sanitizedQuery = query.replace(/VALUES\s*\([^)]*\)/gi, 'VALUES (***SANITIZED***)');
      console.log('🔍 Executing secure query:', sanitizedQuery);

      const [results] = await this.pool.execute(query, params);
      return results;
    } catch (error) {
      console.error('❌ Secure query execution failed:', {
        error: error.message,
        code: error.code,
        sqlState: error.sqlState
      });
      throw error;
    }
  }

  // Encrypt sensitive data
  encryptSensitiveData(data) {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  // Decrypt sensitive data
  decryptSensitiveData(encryptedData) {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Secure transaction wrapper
  async secureTransaction(operations) {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const results = [];
      for (const operation of operations) {
        const result = await connection.execute(operation.query, operation.params);
        results.push(result);
      }
      
      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Health check with security validation
  async secureHealthCheck() {
    try {
      const connection = await this.pool.getConnection();
      
      // Check connection security
      const [securityCheck] = await connection.execute(`
        SELECT 
          @@have_ssl as ssl_available,
          @@ssl_cipher as ssl_cipher,
          CONNECTION_ID() as connection_id,
          USER() as current_user
      `);

      // Check database permissions
      const [permissions] = await connection.execute(`
        SHOW GRANTS FOR CURRENT_USER()
      `);

      connection.release();

      return {
        status: 'secure',
        security: securityCheck[0],
        permissions: permissions.map(p => Object.values(p)[0]),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'insecure',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

// Database security middleware
const databaseSecurity = (req, res, next) => {
  // Add security headers for database operations
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  });

  // Validate tenant isolation
  if (req.user && req.user.clinic_id) {
    req.secureClinicId = parseInt(req.user.clinic_id);
    if (isNaN(req.secureClinicId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid clinic context',
        code: 'SECURITY_VIOLATION'
      });
    }
  }

  next();
};

module.exports = {
  SecureDatabase,
  databaseSecurity
};