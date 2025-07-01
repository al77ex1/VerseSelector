/**
 * SQLite service for browser-based database operations
 * Uses sql.js to provide SQLite functionality in the browser
 */

import initSqlJs from 'sql.js';

// SQLite database instance
let db = null;
let dbInitPromise = null;

// Path to SQLite database file from environment variables
const DB_PATH = import.meta.env.VITE_DB_PATH || '/api/bible.sqlite';

/**
 * Initialize the SQLite database
 * @returns {Promise<Object>} - Database instance
 * @private
 */
const initDatabase = async () => {
  if (db) {
    return db;
  }
  
  if (dbInitPromise) {
    return dbInitPromise;
  }

  dbInitPromise = (async () => {
    try {
      // Initialize SQL.js
      const SQL = await initSqlJs({
        // Specify the path to the wasm file
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
      });
      
      // Try to fetch database file from server
      try {
        console.log(`Fetching SQLite database from: ${DB_PATH}`);
        const response = await fetch(DB_PATH);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch database file: ${response.status} ${response.statusText}`);
        }
        
        const dbData = await response.arrayBuffer();
        db = new SQL.Database(new Uint8Array(dbData));
        console.log('SQLite database loaded from file successfully');
      } catch (fetchError) {
        console.warn('Could not fetch database file, creating empty database:', fetchError);
        db = new SQL.Database();
        console.log('Empty SQLite database created');
      }
      
      return db;
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      dbInitPromise = null; // Reset promise on error
      throw error;
    }
  })();
  
  return dbInitPromise;
};

/**
 * Close the database connection and free resources
 * @private
 */
const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
    dbInitPromise = null;
    console.log('SQLite database connection closed');
  }
};

/**
 * Execute a SQL query
 * @param {string} query - SQL query to execute
 * @param {Array} [params] - Query parameters
 * @returns {Promise<Array>} - Query results
 */
export const executeQuery = async (query, params = []) => {
  try {
    // Make sure database is initialized
    if (!db) {
      await initDatabase();
    }
    
    // Execute the query
    const stmt = db.prepare(query);
    
    // Bind parameters if provided
    if (params.length > 0) {
      stmt.bind(params);
    }
    
    // Get results
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    
    // Clean up
    stmt.free();
    
    return results;
  } catch (error) {
    console.error('Error executing SQLite query:', error);
    throw new Error(`Failed to execute SQLite query: ${error.message}`);
  }
};
