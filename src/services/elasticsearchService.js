/**
 * Elasticsearch service for searching Bible verses
 */

import { Client } from '@elastic/elasticsearch';

// Create Elasticsearch client
const esClient = new Client({ 
  node: import.meta.env.VITE_ELASTICSEARCH_URL || 'http://localhost:9200'
});

// Index name for Bible verses
const INDEX_NAME = 'bible_verses';

/**
 * Search for Bible verses using fuzzy matching
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @param {number} options.size - Maximum number of results to return (default: 10)
 * @param {number} options.fuzziness - Fuzziness level (default: 'AUTO')
 * @returns {Promise<Array>} - Array of matching verses
 */
const searchVerses = async (query, options = {}) => {
  const { size = 10, fuzziness = 'AUTO' } = options;
  
  try {
    const response = await esClient.search({
      index: INDEX_NAME,
      body: {
        size,
        query: {
          multi_match: {
            query,
            fields: ['text', 'book_name^2', 'reference^3'],
            fuzziness,
            operator: 'and'
          }
        },
        highlight: {
          fields: {
            text: {}
          },
          pre_tags: ['<strong>'],
          post_tags: ['</strong>']
        }
      }
    });
    
    return response.hits.hits.map(hit => ({
      id: hit._source.verse_id,
      book_id: hit._source.book_id,
      book_name: hit._source.book_name,
      chapter: hit._source.chapter,
      verse: hit._source.verse,
      text: hit._source.text,
      reference: hit._source.reference,
      highlight: hit.highlight?.text?.[0] || hit._source.text
    }));
  } catch (error) {
    console.error('Error searching Elasticsearch:', error);
    throw new Error('Failed to search Bible verses');
  }
};

/**
 * Check if Elasticsearch is available
 * @returns {Promise<boolean>} - True if Elasticsearch is available
 */
const checkElasticsearchStatus = async () => {
  try {
    const response = await esClient.ping();
    return response;
  } catch (error) {
    console.error('Elasticsearch is not available:', error);
    return false;
  }
};

export default {
  searchVerses,
  checkElasticsearchStatus
};
