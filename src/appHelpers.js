// Format the current selection for display
export const formatSelection = (selection) => {
  if (!selection?.book || !selection?.chapter || !selection?.verse) {
    return '';
  }
  
  if (selection.verseEnd && selection.verse !== selection.verseEnd) {
    return `${selection.book} ${selection.chapter}:${selection.verse}-${selection.verseEnd}`;
  } else {
    return `${selection.book} ${selection.chapter}:${selection.verse}`;
  }
};

// Check if a chapter number is valid
export const isValidChapter = (chapterNum, chaptersData) => {
  return !isNaN(chapterNum) && chaptersData?.some(c => c.chapter.number === chapterNum);
};

// Check if verse selection is valid
export const isValidVerseSelection = (verseStart, verseEnd, verses) => {
  const isValidStart = verseStart !== null && !isNaN(verseStart) && verses.includes(verseStart);
  const isValidEnd = verseEnd === null || (verseEnd !== null && !isNaN(verseEnd) && verses.includes(verseEnd));
  return isValidStart && isValidEnd;
};

// Select verses based on input
export const selectVerses = (verseStart, verseEnd, handleSelectVerse) => {
  if (verseEnd !== null) {
    handleSelectVerse(verseStart, verseEnd);
  } else {
    handleSelectVerse(verseStart, null);
  }
};

// Load verse text when selection changes
export const loadVerseText = async (currentSelection, setCurrentVerseText, getVerseText) => {
  if (currentSelection?.book && currentSelection?.chapter && currentSelection?.verse) {
    try {
      const { book, chapter, verse, verseEnd } = currentSelection;
      const verseTo = verseEnd || verse;
      
      // Загружаем текст стиха из локальных данных
      const versesData = getVerseText(book, chapter, verse, verseTo);
      
      if (versesData && versesData.length > 0) {
        // Объединяем тексты стихов, если выбран диапазон
        const text = versesData.map(v => `${v.verse} ${v.text}`).join('\n\n');
        setCurrentVerseText(text);
      } else {
        setCurrentVerseText('');
      }
    } catch (error) {
      console.error('Ошибка при загрузке текста стиха:', error);
      setCurrentVerseText('Ошибка при загрузке текста стиха');
    }
  } else {
    setCurrentVerseText('');
  }
};
