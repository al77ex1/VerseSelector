/**
 * SQLite service for backend API operations
 * Sends requests to backend API instead of loading SQLite in browser
 */

const API_BASE_URL = 'http://localhost:3000/api';

export const getVerses = async (book, chapter, verseTo, verseFrom = 1) => {
  try {
    const requestBody = {
      book,
      chapter,
      verseFrom,
      verseTo: verseTo || verseFrom
    };
    
    console.log(`Fetching verses: ${book} ${chapter}:${verseFrom}-${verseTo || verseFrom}`);
    
    const response = await fetch(`${API_BASE_URL}/selectVerses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching verses:', error);
    return [];
  }
};
