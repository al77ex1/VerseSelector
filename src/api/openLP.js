/**
 * API service for interacting with the Bible API
 */

// Base URL for the API
const API_BASE_URL = (() => {
  const hostname = window.location.hostname;
  return `http://${hostname}:4316/api/v2/plugins/bibles`;
})();

export const sendVerseToLive = async (verseReference) => {
  try {
    const response = await fetch(`${API_BASE_URL}/live`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: verseReference }),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // API may not return any content, so we just return true for success
    // Only try to parse JSON if there's content to parse
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json') && response.status !== 204) {
      return await response.json();
    }
    
    // Return true to indicate success for empty responses
    return true;
  } catch (error) {
    console.error('Error sending verse to API:', error);
    throw error;
  }
};