/**
 * API service for interacting with the Bible API
 */

// Base URL for the API
const API_BASE_URL = (() => {
  const hostname = window.location.hostname;
  return `http://${hostname}:4316/api/v2`;
})();

// Вспомогательная функция для отправки команд
const _sendCommand = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json') && response.status !== 204) {
      return await response.json();
    }

    return true;
  } catch (error) {
    console.error(`Error sending command to API:`, error);
    throw error;
  }
};

export const sendVerseToLive = async (verseReference) => {
  return _sendCommand('/plugins/bibles/live', { id: verseReference });
};

export const sendNextSlide = async () => {
  return _sendCommand('/controller/progress', { action: 'next' });
};

export const sendPreviousSlide = async () => {
  return _sendCommand('/controller/progress', { action: 'previous' });
};

export const sendShowPresentation = async () => {
  return _sendCommand('/core/display', { display: 'show' });
};

export const sendShowTheme = async () => {
  return _sendCommand('/core/display', { display: 'theme' });
};

export const sendShowBlank = async () => {
  return _sendCommand('/core/display', { display: 'blank' });
};

export const sendShowDesktop = async () => {
  return _sendCommand('/core/display', { display: 'desktop' });
};
