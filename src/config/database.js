/**
 * Database Configuration
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles MySQL database connections with connection pooling and error handling
 * 
 * This configuration provides:
 * - MySQL connection pool management
 * - Multi-tenant database support
 * - Connection error handling
 * - Query logging for development
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'N1mbu$12354',
  database: process.env.DB_NAME || 'clinic_saas',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  acquireTimeout: 5000,
  timeout: 5000,
  reconnect: true,
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    console.log(`📊 Database: ${dbConfig.database}`);
    console.log(`🏠 Host: ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Execute query with error handling
const executeQuery = async (query, params = []) => {
  try {
    const [rows, fields] = await pool.execute(query, params);

    // Log queries in development
    if (process.env.NODE_ENV === 'development' && process.env.LOG_QUERIES === 'true') {
      console.log('🔍 Query:', query);
      console.log('📝 Params:', params);
      console.log('📊 Rows affected:', Array.isArray(rows) ? rows.length : rows.affectedRows);
    }

    return [rows, fields];
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    console.error('🔍 Query:', query);
    console.error('📝 Params:', params);
    throw error;
  }
};

// Get connection from pool
const getConnection = async () => {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('❌ Failed to get database connection:', error.message);
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Health check query
const healthCheck = async () => {
  try {
    const [rows] = await pool.execute('SELECT 1 as health_check');
    return rows[0].health_check === 1;
  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    return false;
  }
};

// Get database statistics
const getStats = async () => {
  try {
    const [connections] = await pool.execute('SHOW STATUS LIKE "Threads_connected"');
    const [maxConnections] = await pool.execute('SHOW VARIABLES LIKE "max_connections"');

    return {
      activeConnections: parseInt(connections[0].Value),
      maxConnections: parseInt(maxConnections[0].Value),
      poolConfig: {
        connectionLimit: dbConfig.connectionLimit,
        queueLimit: dbConfig.queueLimit
      }
    };
  } catch (error) {
    console.error('❌ Failed to get database stats:', error.message);
    return null;
  }
};

// Graceful shutdown
const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ Database pool closed gracefully');
  } catch (error) {
    console.error('❌ Error closing database pool:', error.message);
  }
};

// Handle process termination
process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);

// Export pool and helper functions
module.exports = {
  // Main pool for direct use
  pool,
  execute: (query, params) => pool.execute(query, params),
  query: (query, params) => pool.query(query, params),

  // Helper functions
  testConnection,
  executeQuery,
  getConnection,
  transaction,
  healthCheck,
  getStats,
  closePool,

  // Configuration
  config: dbConfig
};