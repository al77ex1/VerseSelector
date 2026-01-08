import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './verse.scss';

const VerseList = ({ verses, onSelectVerse, selectedVerse: externalSelectedVerse, selectedVerseEnd: externalSelectedVerseEnd, onVerseSelect }) => {
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [selectedVerseEnd, setSelectedVerseEnd] = useState(null);
  const [isSelectionInProgress, setIsSelectionInProgress] = useState(false);

  useEffect(() => {
    setSelectedVerse(externalSelectedVerse);
    setSelectedVerseEnd(externalSelectedVerseEnd);
    
    if (externalSelectedVerse === null) {
      setIsSelectionInProgress(false);
    }
  }, [externalSelectedVerse, externalSelectedVerseEnd]);

  const handleVerseClick = (verse, event) => {
    // Вызываем обработчик для открытия вкладки предпросмотра
    if (onVerseSelect) {
      onVerseSelect();
    }
    
    if (event && event.shiftKey && selectedVerse !== null) {
      setSelectedVerseEnd(verse);
      setIsSelectionInProgress(false);
      
      if (verse < selectedVerse) {
        onSelectVerse(verse, selectedVerse);
      } else {
        onSelectVerse(selectedVerse, verse);
      }
    } else {
      setSelectedVerse(verse);
      setSelectedVerseEnd(null);
      setIsSelectionInProgress(false);
      onSelectVerse(verse, null);
    }
  };

  const isVerseInRange = (verse) => {
    if (selectedVerse === null) return false;
    if (selectedVerseEnd === null) return verse === selectedVerse;
    
    const start = Math.min(selectedVerse, selectedVerseEnd);
    const end = Math.max(selectedVerse, selectedVerseEnd);
    return verse >= start && verse <= end;
  };

  return (
    <div className="verse-list">
      <h3>Стихи</h3>
      {verses && verses.length > 0 ? (
        <ul>
          {verses.map((verse) => (
            <li key={verse}>
              <button
                className={isVerseInRange(verse) ? 'selected' : ''}
                onClick={(event) => handleVerseClick(verse, event)}
                aria-pressed={isVerseInRange(verse)}
              >
                {verse}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Выберите стих</p>
      )}
    </div>
  );
};

VerseList.propTypes = {
  verses: PropTypes.arrayOf(PropTypes.number),
  onSelectVerse: PropTypes.func.isRequired,
  selectedVerse: PropTypes.number,
  selectedVerseEnd: PropTypes.number,
  onVerseSelect: PropTypes.func
};

VerseList.defaultProps = {
  verses: [],
  selectedVerse: null,
  selectedVerseEnd: null,
  onVerseSelect: null
};

export default VerseList;
