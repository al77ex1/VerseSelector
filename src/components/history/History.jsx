import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../components.css';

/**
 * History component displays the history of selected verses
 */
const History = ({ history, onSelectHistoryItem, currentSelection }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  // Find the index of the current selection in history
  useEffect(() => {
    if (currentSelection) {
      const index = history.findIndex(item => {
        if (currentSelection.verseEnd) {
          return item.book === currentSelection.book && 
                 item.chapter === currentSelection.chapter && 
                 item.verse === currentSelection.verse &&
                 item.verseEnd === currentSelection.verseEnd;
        } else {
          return item.book === currentSelection.book && 
                 item.chapter === currentSelection.chapter && 
                 item.verse === currentSelection.verse &&
                 !item.verseEnd;
        }
      });
      
      if (index !== -1) {
        setSelectedItem(index);
      }
    }
  }, [currentSelection, history]);

  const handleItemClick = (index) => {
    setSelectedItem(index);
    onSelectHistoryItem(history[index]);
  };

  // Format the verse reference
  const formatVerseReference = (item) => {
    if (item.verseEnd) {
      return `${item.book} ${item.chapter}:${item.verse}-${item.verseEnd}`;
    } else {
      return `${item.book} ${item.chapter}:${item.verse}`;
    }
  };

  // Generate a unique key for each history item
  const generateHistoryItemKey = (item) => {
    const baseKey = `${item.book}-${item.chapter}-${item.verse}`;
    return item.verseEnd ? baseKey + `-${item.verseEnd}` : baseKey;
  };

  return (
    <div className="history-container">
      {history && history.length > 0 ? (
        <div className="history-list">
          {history.map((item, index) => (
            <div 
              key={generateHistoryItemKey(item)}
              className={`history-item ${selectedItem === index ? 'active' : ''}`}
              onClick={() => handleItemClick(index)}
            >
              {formatVerseReference(item)}
            </div>
          ))}
        </div>
      ) : (
        <div className="history-empty">История пуста</div>
      )}
    </div>
  );
};

// Prop types validation
History.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      book: PropTypes.string.isRequired,
      chapter: PropTypes.number.isRequired,
      verse: PropTypes.number.isRequired,
      verseEnd: PropTypes.number
    })
  ),
  onSelectHistoryItem: PropTypes.func.isRequired,
  currentSelection: PropTypes.shape({
    book: PropTypes.string,
    chapter: PropTypes.number,
    verse: PropTypes.number,
    verseEnd: PropTypes.number
  })
};

export default History;
