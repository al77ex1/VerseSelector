/**
 * API Services index file
 * Exports all API methods for easy importing
 */

// Import from OpenLP API
import { sendVerseToLive } from './openLP';

// Import from Elasticsearch service
import { searchVerses, checkElasticsearchStatus } from './elasticsearch';

// Export all API methods
export {
  // OpenLP API
  sendVerseToLive,
  
  // Elasticsearch API
  searchVerses,
  checkElasticsearchStatus
};
