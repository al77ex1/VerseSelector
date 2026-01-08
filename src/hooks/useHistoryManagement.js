import { useState, useCallback } from 'react';

export function useHistoryManagement() {
  const [history, setHistory] = useState([]);

  const addToHistory = useCallback((selection) => {
    const { verse, verseEnd } = selection;
    
    if (verse === null || (verseEnd !== null && verseEnd === undefined)) {
      return;
    }

    const existsInHistory = history.some(item => {
      const isRangeSelection = verseEnd !== null && verseEnd !== undefined;
      if (isRangeSelection) {
        return item.book === selection.book 
          && item.chapter === selection.chapter 
          && item.verse === selection.verse 
          && item.verseEnd === selection.verseEnd;
      }
      return item.book === selection.book 
        && item.chapter === selection.chapter 
        && item.verse === selection.verse 
        && (item.verseEnd === null || item.verseEnd === undefined);
    });

    if (!existsInHistory) {
      setHistory(prev => [...prev, selection]);
    }
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addToHistory, clearHistory };
}

