import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { getVerseText } from '../../utils/bibleDataLoader';
import './preview.scss';

/**
 * Preview component displays the currently selected verse text
 * with the entire chapter and highlighted selected verses
 */
const Preview = ({ currentSelection, verseText }) => {
  const [chapterVerses, setChapterVerses] = useState([]);
  const [selectedVerses, setSelectedVerses] = useState(new Set());
  
  // Format the verse reference
  const formatVerseReference = (item) => {
    if (!item) return '';
    
    if (item.verseEnd) {
      return `${item.book} ${item.chapter}:${item.verse}-${item.verseEnd}`;
    } else if (item.verse) {
      return `${item.book} ${item.chapter}:${item.verse}`;
    } else {
      return `${item.book} ${item.chapter}`;
    }
  };
  
  // Load all verses from the chapter when the selection changes
  useEffect(() => {
    if (currentSelection?.book && currentSelection?.chapter) {
      // Get all verses in the chapter
      const { book, chapter } = currentSelection;
      const chapterNum = typeof chapter === 'string' ? parseInt(chapter, 10) : chapter;
      
      // Get all verses in the chapter
      const allVerses = getVerseText(book, chapterNum, 1, 200);
      setChapterVerses(allVerses);
    } else {
      setChapterVerses([]);
    }
  }, [currentSelection?.book, currentSelection?.chapter]);
  
  // Update selected verses when verse selection changes
  useEffect(() => {
    const newSelectedVerses = new Set();
    
    if (currentSelection?.verse) {
      const startVerse = parseInt(currentSelection.verse, 10);
      const endVerse = currentSelection.verseEnd ? 
        parseInt(currentSelection.verseEnd, 10) : startVerse;
      
      // Add all verses in the range to the set
      for (let i = startVerse; i <= endVerse; i++) {
        newSelectedVerses.add(i);
      }
    }
    
    setSelectedVerses(newSelectedVerses);
  }, [currentSelection?.verse, currentSelection?.verseEnd]);

  return (
    <div className="preview-container">
      {currentSelection?.book && currentSelection?.chapter ? (
        <>
          <div className="preview-reference">
            {formatVerseReference(currentSelection)}
          </div>
          <div className="preview-chapter">
            {chapterVerses.length > 0 ? (
              chapterVerses.map(verse => {
                const verseNum = parseInt(verse.verse, 10);
                const isSelected = selectedVerses.has(verseNum);
                
                return (
                  <div 
                    key={verse.verse} 
                    className={isSelected ? "preview-verse highlight" : "preview-verse"}
                  >
                    <span className="verse-number">{verse.verse}</span>
                    <span className="verse-text">{verse.text}</span>
                  </div>
                );
              })
            ) : (
              <div className="preview-loading">Загрузка стихов...</div>
            )}
          </div>
        </>
      ) : (
        <div className="preview-empty">
          Выберите главу для предпросмотра
        </div>
      )}
    </div>
  );
};

// Prop types validation
Preview.propTypes = {
  currentSelection: PropTypes.shape({
    book: PropTypes.string,
    chapter: PropTypes.number,
    verse: PropTypes.number,
    verseEnd: PropTypes.number
  }),
  verseText: PropTypes.string // Still accepting verseText for backward compatibility
};

export default Preview;
