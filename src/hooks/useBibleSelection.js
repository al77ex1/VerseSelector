import { useState, useCallback } from 'react';
import { getChapters, getVerses } from '../utils/bibleDataLoader';

export function useBibleSelection() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [chapters, setChapters] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [verses, setVerses] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(null);

  const selectBook = useCallback((book) => {
    setSelectedBook(book);
    setChapters(getChapters(book));
    setSelectedChapter(null);
    setVerses([]);
    setCurrentSelection({ book });
  }, []);

  const selectChapter = useCallback((chapter, book) => {
    setSelectedChapter(chapter);
    setVerses(getVerses(book, chapter));
    setCurrentSelection({ book, chapter });
  }, []);

  const selectVerse = useCallback((verse, verseEnd, book, chapter) => {
    if (verseEnd !== null && verseEnd !== undefined && verse > verseEnd) {
      return false;
    }
    
    const newSelection = { book, chapter, verse, verseEnd };
    setCurrentSelection(newSelection);
    return newSelection;
  }, []);

  const selectFromHistory = useCallback((item) => {
    setSelectedBook(item.book);
    setChapters(getChapters(item.book));
    setSelectedChapter(item.chapter);
    setVerses(getVerses(item.book, item.chapter));
    setCurrentSelection(item);
  }, []);

  return {
    selectedBook,
    chapters,
    selectedChapter,
    verses,
    currentSelection,
    selectBook,
    selectChapter,
    selectVerse,
    selectFromHistory,
  };
}
