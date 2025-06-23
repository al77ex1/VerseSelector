import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../components.css';

/**
 * VerseList component displays verses for a selected chapter
 */
const VerseList = ({ verses, onSelectVerse, selectedVerse: externalSelectedVerse, selectedVerseEnd: externalSelectedVerseEnd }) => {
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [selectedVerseEnd, setSelectedVerseEnd] = useState(null);
  const [selectionMode, setSelectionMode] = useState('single'); // 'single' or 'range'

  // Sync with external selected verses when they change
  useEffect(() => {
    if (externalSelectedVerse !== null && externalSelectedVerse !== undefined) {
      setSelectedVerse(externalSelectedVerse);
    }
    if (externalSelectedVerseEnd !== null && externalSelectedVerseEnd !== undefined) {
      setSelectedVerseEnd(externalSelectedVerseEnd);
      setSelectionMode('range');
    } else {
      setSelectedVerseEnd(null);
      if (externalSelectedVerse !== null && externalSelectedVerse !== undefined) {
        setSelectionMode('single');
      }
    }
  }, [externalSelectedVerse, externalSelectedVerseEnd]);

  const handleVerseClick = (verse) => {
    // If no verse is selected yet, select it as the start verse
    if (selectedVerse === null) {
      setSelectedVerse(verse);
      setSelectedVerseEnd(null);
      setSelectionMode('single');
      onSelectVerse(verse, null);
      return;
    }

    // If we're in single selection mode and clicking a different verse
    if (selectionMode === 'single' && verse !== selectedVerse) {
      // Start range selection
      setSelectionMode('range');
      setSelectedVerseEnd(verse);
      
      // Ensure start verse is always lower than end verse for proper display
      if (verse < selectedVerse) {
        onSelectVerse(verse, selectedVerse);
      } else {
        onSelectVerse(selectedVerse, verse);
      }
    } 
    // If clicking the same verse again or we're already in range mode
    else {
      // Reset to single selection mode with the new verse
      setSelectionMode('single');
      setSelectedVerse(verse);
      setSelectedVerseEnd(null);
      onSelectVerse(verse, null);
    }
  };

  const isVerseInRange = (verse) => {
    if (selectedVerse === null) return false;
    if (selectedVerseEnd === null) return verse === selectedVerse;
    
    // Check if verse is within the selected range
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
                onClick={() => handleVerseClick(verse)}
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

// Prop types validation
VerseList.propTypes = {
  verses: PropTypes.arrayOf(PropTypes.number),
  onSelectVerse: PropTypes.func.isRequired,
  selectedVerse: PropTypes.number,
  selectedVerseEnd: PropTypes.number
};

// Default props
VerseList.defaultProps = {
  verses: [],
  selectedVerse: null,
  selectedVerseEnd: null
};

export default VerseList;
