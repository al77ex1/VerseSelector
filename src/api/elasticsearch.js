/**
 * Elasticsearch service for searching Bible verses using browser-compatible fetch API
 */

// Base URL for Elasticsearch
const ES_BASE_URL = import.meta.env.VITE_ELASTICSEARCH_URL || 'http://localhost:9200';

// Index name for Bible verses
const INDEX_NAME = 'bible_verses';

/**
 * Search for Bible verses using fuzzy matching
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @param {number} options.size - Maximum number of results to return (default: 10)
 * @returns {Promise<Array>} - Array of matching verses
 */
export const searchVerses = async (query, options = {}) => {
  const { size = 10 } = options;
  
  try {
    const response = await fetch(`${ES_BASE_URL}/${INDEX_NAME}/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        size,
        query: {
          bool: {
            should: [
              {
                match: {
                  text: {
                    query,
                    fuzziness: "AUTO",
                    prefix_length: 1,
                    fuzzy_transpositions: true,
                    boost: 2
                  }
                }
              },
              {
                match_phrase: {
                  text: {
                    query,
                    slop: 1,
                    boost: 3
                  }
                }
              }
            ],
            minimum_should_match: 1
          }
        },
        highlight: {
          fields: {
            text: {}
          },
          pre_tags: ['<strong>'],
          post_tags: ['</strong>']
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Elasticsearch request failed with status ${response.status}`);
    }
    
    const result = await response.json();
    
    // Возвращаем результаты напрямую
    return result.hits.hits;
  } catch (error) {
    console.error('Error searching Elasticsearch:', error);
    throw new Error('Failed to search Bible verses');
  }
};

/**
 * Check if Elasticsearch is available
 * @returns {Promise<boolean>} - True if Elasticsearch is available
 */
export const checkElasticsearchStatus = async () => {
  try {
    const response = await fetch(`${ES_BASE_URL}/_ping`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Elasticsearch is not available:', error);
    return false;
  }
};