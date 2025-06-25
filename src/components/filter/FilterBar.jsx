import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getChapters } from '../../utils/bibleDataLoader';
import BookAutocomplete from './BookAutocomplete';
import NumericInput from './NumericInput';
import ClearButton from './ClearButton';

/**
 * FilterBar component for Bible verse selection
 */
const FilterBar = ({ onFilterChange, filters: externalFilters }) => {
  const [filters, setFilters] = useState({
    book: '',
    chapter: '',
    verseStart: '',
    verseEnd: ''
  });
  const [isChapterValid, setIsChapterValid] = useState(true);
  const [availableChapters, setAvailableChapters] = useState([]);
  
  // Update available chapters when book changes
  useEffect(() => {
    if (filters.book) {
      const chaptersData = getChapters(filters.book);
      if (chaptersData) {
        const chapterNumbers = chaptersData.map(c => c.chapter.number);
        setAvailableChapters(chapterNumbers);
        
        // Validate current chapter input if it exists
        if (filters.chapter) {
          const chapterNum = parseInt(filters.chapter, 10);
          setIsChapterValid(!isNaN(chapterNum) && chapterNumbers.includes(chapterNum));
        } else {
          setIsChapterValid(true);
        }
      } else {
        setAvailableChapters([]);
      }
    } else {
      setAvailableChapters([]);
      setIsChapterValid(true);
    }
  }, [filters.book]);

  // Sync with external filters when they change
  useEffect(() => {
    if (externalFilters) {
      setFilters(externalFilters);
      
      // Validate chapter when external filters change
      if (externalFilters.book && externalFilters.chapter) {
        const chaptersData = getChapters(externalFilters.book);
        if (chaptersData) {
          const chapterNumbers = chaptersData.map(c => c.chapter.number);
          const chapterNum = parseInt(externalFilters.chapter, 10);
          setIsChapterValid(!isNaN(chapterNum) && chapterNumbers.includes(chapterNum));
        }
      }
    }
  }, [externalFilters]);

  const handleInputChange = (name, value) => {
    const updatedFilters = { ...filters, [name]: value };
    
    // Validate chapter input
    if (name === 'chapter') {
      if (value === '') {
        setIsChapterValid(true);
      } else {
        const chapterNum = parseInt(value, 10);
        setIsChapterValid(!isNaN(chapterNum) && availableChapters.includes(chapterNum));
      }
    }
    
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };
  
  const handleBookSelect = (book) => {
    const updatedFilters = { ...filters, book, chapter: '' };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };
  
  const handleClearFilters = () => {
    const clearedFilters = {
      book: '',
      chapter: '',
      verseStart: '',
      verseEnd: ''
    };
    setFilters(clearedFilters);
    setIsChapterValid(true);
    onFilterChange?.(clearedFilters);
  };

  return (
    <div className="filter-bar">
      <span>Фильтр:</span>
      <BookAutocomplete 
        value={filters.book} 
        onChange={handleBookSelect} 
      />
      <NumericInput
        className="filter-chapter"
        name="chapter"
        value={filters.chapter}
        onChange={handleInputChange}
        placeholder="Глава"
        isInvalid={!isChapterValid}
      />
      <NumericInput
        className="filter-verse-from"
        name="verseStart"
        value={filters.verseStart}
        onChange={handleInputChange}
        placeholder="От стиха"
      />
      <NumericInput
        className="filter-verse-to"
        name="verseEnd"
        value={filters.verseEnd}
        onChange={handleInputChange}
        placeholder="До стиха"
      />
      <ClearButton onClick={handleClearFilters} />
    </div>
  );
};

// Prop types validation
FilterBar.propTypes = {
  onFilterChange: PropTypes.func,
  filters: PropTypes.shape({
    book: PropTypes.string,
    chapter: PropTypes.string,
    verseStart: PropTypes.string,
    verseEnd: PropTypes.string
  })
};

// Default props
FilterBar.defaultProps = {
  onFilterChange: null,
  filters: {
    book: '',
    chapter: '',
    verseStart: '',
    verseEnd: ''
  }
};

export default FilterBar;
