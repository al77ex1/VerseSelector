import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../components.css';

/**
 * VerseList component displays verses for a selected chapter
 */
const VerseList = ({ verses, onSelectVerse, selectedVerse: externalSelectedVerse }) => {
  const [selectedVerse, setSelectedVerse] = useState(null);

  // Sync with external selected verse when it changes
  useEffect(() => {
    if (externalSelectedVerse !== null) {
      setSelectedVerse(externalSelectedVerse);
    }
  }, [externalSelectedVerse]);

  const handleVerseClick = (verse) => {
    setSelectedVerse(verse);
    onSelectVerse(verse);
  };

  return (
    <div className="verse-list">
      <h3>Стихи</h3>
      {verses && verses.length > 0 ? (
        <ul>
          {verses.map((verse) => (
            <li key={verse}>
              <button
                className={selectedVerse === verse ? 'selected' : ''}
                onClick={() => handleVerseClick(verse)}
                aria-pressed={selectedVerse === verse}
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

// Prop types validation
VerseList.propTypes = {
  verses: PropTypes.arrayOf(PropTypes.number),
  onSelectVerse: PropTypes.func.isRequired,
  selectedVerse: PropTypes.number
};

// Default props
VerseList.defaultProps = {
  verses: [],
  selectedVerse: null
};

export default VerseList;
