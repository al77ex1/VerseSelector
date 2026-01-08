import PropTypes from 'prop-types';
import { useEffect, useState, useRef, useCallback } from 'react';
import { getVerseText } from '../../utils/bibleDataLoader';
import { useAccordionItemEffect } from '@szhsin/react-accordion';
import { sendPreviousSlide, sendNextSlide } from '../../api/openLPService';
import './preview.scss';

const Preview = ({ currentSelection, verseText, onSelectVerse }) => {
  const [chapterVerses, setChapterVerses] = useState([]);
  const [selectedVerses, setSelectedVerses] = useState(new Set());
  const [internalSelectedVerse, setInternalSelectedVerse] = useState(null);
  const previewChapterRef = useRef(null);
  const firstSelectedVerseRef = useRef(null);
  const previewContainerRef = useRef(null);
  
  // Получаем состояние аккордеона для отслеживания открытия панели
  const { state } = useAccordionItemEffect({ itemKey: 'preview' });
  
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
      
      setInternalSelectedVerse(startVerse);
      
      for (let i = startVerse; i <= endVerse; i++) {
        newSelectedVerses.add(i);
      }
    } else {
      setInternalSelectedVerse(null);
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

  // Новый эффект для скролла при активации секции, срабатывающий только когда панель открыта
  useEffect(() => {
    if (state.isEnter && currentSelection?.verse && firstSelectedVerseRef.current) {
      setTimeout(() => {
        firstSelectedVerseRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [state.isEnter, currentSelection?.verse]);

  const handleVerseClick = (verseNum, event = null) => {
    if (event && event.shiftKey && internalSelectedVerse !== null) {
      const start = Math.min(internalSelectedVerse, verseNum);
      const end = Math.max(internalSelectedVerse, verseNum);
      
      if (onSelectVerse) {
        const selection = onSelectVerse(start, end);
        if (selection && typeof selection === 'object') {
          // Ничего не делать здесь, так как onSelectVerse теперь возвращает данные
        }
      }
    } else {
      setInternalSelectedVerse(verseNum);
      if (onSelectVerse) {
        const selection = onSelectVerse(verseNum, null);
        if (selection && typeof selection === 'object') {
          // Ничего не делать здесь
        }
      }
    }
  };

const handleKeyDown = useCallback((event) => {  
    if (!currentSelection?.book || !currentSelection?.chapter) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      sendPreviousSlide();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      sendNextSlide();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const currentVerse = parseInt(currentSelection.verse, 10) || 0;
      const maxVerse = chapterVerses.length;                         
                                                                   
    if (currentVerse < maxVerse) {                                 
      const nextVerse = currentVerse + 1;                          
      handleVerseClick(nextVerse);                                 
    }                                                              
  } else if (event.key === 'ArrowUp') {                            
    event.preventDefault();                                        
    const currentVerse = parseInt(currentSelection.verse, 10) || 0;
    if (currentVerse > 1) {                                        
      const prevVerse = currentVerse - 1;                          
      handleVerseClick(prevVerse);                                 
    }                                                              
  }                                                                
 }, [currentSelection, chapterVerses.length, handleVerseClick]);

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

  return (
    <div                                                             
      className="preview-container"                                  
      ref={previewContainerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >  
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
                    onClick={(event) => handleVerseClick(verseNum, event)}
                    style={{ 
                      cursor: 'pointer',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
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
  verseText: PropTypes.string,
  onSelectVerse: PropTypes.func
};

export default Preview;
