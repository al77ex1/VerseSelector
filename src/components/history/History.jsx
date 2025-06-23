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
      const index = history.findIndex(
        item => 
          item.book === currentSelection.book && 
          item.chapter === currentSelection.chapter && 
          item.verse === currentSelection.verse
      );
      
      if (index !== -1) {
        setSelectedItem(index);
      }
    }
  }, [currentSelection, history]);

  const handleItemClick = (index) => {
    setSelectedItem(index);
    onSelectHistoryItem(history[index]);
  };

  return (
    <div className="history-list">
      <h3>История</h3>
      {history && history.length > 0 ? (
        <ul>
          {history.map((item, index) => (
            <li key={`${item.book}-${item.chapter}-${item.verse}`}>
              <button
                className={selectedItem === index ? 'selected' : ''}
                onClick={() => handleItemClick(index)}
                aria-pressed={selectedItem === index}
              >
                {item.book} {item.chapter}:{item.verse}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>История пуста</p>
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
      verse: PropTypes.number.isRequired
    })
  ),
  onSelectHistoryItem: PropTypes.func.isRequired,
  currentSelection: PropTypes.shape({
    book: PropTypes.string,
    chapter: PropTypes.number,
    verse: PropTypes.number
  })
};

// Default props
History.defaultProps = {
  history: [],
  currentSelection: null
};

export default History;
