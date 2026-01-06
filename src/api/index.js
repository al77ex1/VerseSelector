/**
 * API Services index file
 * Exports all API methods for easy importing
 */

// Import from OpenLP API
import { 
  sendVerseToLive, 
  sendNextSlide,  
  sendPreviousSlide, 
  sendShowPresentation,
  sendShowTheme,
  sendShowBlank,
  sendShowDesktop
} from './openLPService';

// Import from Elasticsearch service
import { searchVerses, checkElasticsearchStatus } from './elasticsearchService';

// Export all API methods
export {
  // OpenLP API
  sendVerseToLive,
  sendNextSlide,
  sendPreviousSlide,
  sendShowPresentation,
  sendShowTheme,
  sendShowBlank,
  sendShowDesktop,

  // Elasticsearch API
  searchVerses,
  checkElasticsearchStatus,
  
};
