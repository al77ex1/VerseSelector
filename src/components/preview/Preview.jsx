import PropTypes from 'prop-types';
import { useEffect, useState, useRef } from 'react';
import { getVerseText } from '../../utils/bibleDataLoader';
import './preview.scss';

const Preview = ({ currentSelection, verseText }) => {
  const [chapterVerses, setChapterVerses] = useState([]);
  const [selectedVerses, setSelectedVerses] = useState(new Set());
  const previewChapterRef = useRef(null);
  const firstSelectedVerseRef = useRef(null);
  
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
  
  useEffect(() => {
    if (currentSelection?.book && currentSelection?.chapter) {
      const { book, chapter } = currentSelection;
      const chapterNum = typeof chapter === 'string' ? parseInt(chapter, 10) : chapter;
      
      const allVerses = getVerseText(book, chapterNum, 1, 200);
      setChapterVerses(allVerses);
    } else {
      setChapterVerses([]);
    }
  }, [currentSelection?.book, currentSelection?.chapter]);
  
  useEffect(() => {
    const newSelectedVerses = new Set();
    
    if (currentSelection?.verse) {
      const startVerse = parseInt(currentSelection.verse, 10);
      const endVerse = currentSelection.verseEnd ? 
        parseInt(currentSelection.verseEnd, 10) : startVerse;
      
      for (let i = startVerse; i <= endVerse; i++) {
        newSelectedVerses.add(i);
      }
    }
    
    setSelectedVerses(newSelectedVerses);
  }, [currentSelection?.verse, currentSelection?.verseEnd]);
  
  useEffect(() => {
    setTimeout(() => {
      if (firstSelectedVerseRef.current) {
        firstSelectedVerseRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  }, [selectedVerses]);
  
  useEffect(() => {
    if (firstSelectedVerseRef.current) {
      firstSelectedVerseRef.current.style.scrollMarginTop = '60px';
    }
  }, [selectedVerses]);

  return (
    <div className="preview-container">
      {currentSelection?.book && currentSelection?.chapter ? (
        <>
          <div className="preview-reference">
            {formatVerseReference(currentSelection)}
          </div>
          <div className="preview-chapter" ref={previewChapterRef}>
            {chapterVerses.length > 0 ? (
              chapterVerses.map(verse => {
                const verseNum = parseInt(verse.verse, 10);
                const isSelected = selectedVerses.has(verseNum);
                const isFirstSelected = isSelected && verseNum === Math.min(...Array.from(selectedVerses));
                
                return (
                  <div 
                    key={verse.verse} 
                    className={isSelected ? "preview-verse highlight" : "preview-verse"}
                    ref={isFirstSelected ? firstSelectedVerseRef : null}
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

Preview.propTypes = {
  currentSelection: PropTypes.shape({
    book: PropTypes.string,
    chapter: PropTypes.number,
    verse: PropTypes.number,
    verseEnd: PropTypes.number
  }),
  verseText: PropTypes.string
};

export default Preview;
