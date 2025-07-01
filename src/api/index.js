/**
 * API Services index file
 * Exports all API methods for easy importing
 */

// Import from OpenLP API
import { sendVerseToLive } from './openLPService';

// Import from Elasticsearch service
import { searchVerses, checkElasticsearchStatus } from './elasticsearchService';

// Import from SQLite service
import { executeQuery } from './sqliteService';

// Export all API methods
export {
  // OpenLP API
  sendVerseToLive,
  
  // Elasticsearch API
  searchVerses,
  checkElasticsearchStatus,
  
  // SQLite API
  executeQuery
};
