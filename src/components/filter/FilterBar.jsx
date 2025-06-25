import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getChapters, getVerses } from '../../utils/bibleDataLoader';
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
  const [isVerseStartValid, setIsVerseStartValid] = useState(true);
  const [isVerseEndValid, setIsVerseEndValid] = useState(true);
  const [availableChapters, setAvailableChapters] = useState([]);
  const [availableVerses, setAvailableVerses] = useState([]);
  
  // Helper function to update chapters data when book changes
  const updateChaptersForBook = (book) => {
    const chaptersData = getChapters(book);
    if (!chaptersData) {
      resetChaptersAndVerses();
      return;
    }
    
    const chapterNumbers = chaptersData.map(c => c.chapter.number);
    setAvailableChapters(chapterNumbers);
    return chapterNumbers;
  };
  
  // Helper function to validate chapter and update verses
  const validateChapterAndUpdateVerses = (chapter, book, chapterNumbers) => {
    if (!chapter) {
      setIsChapterValid(true);
      setAvailableVerses([]);
      return;
    }
    
    const chapterNum = parseInt(chapter, 10);
    const isValid = !isNaN(chapterNum) && chapterNumbers.includes(chapterNum);
    setIsChapterValid(isValid);
    
    if (isValid) {
      updateAvailableVerses(book, chapterNum);
    } else {
      setAvailableVerses([]);
    }
  };
  
  // Helper function to reset chapters and verses
  const resetChaptersAndVerses = () => {
    setAvailableChapters([]);
    setAvailableVerses([]);
    setIsChapterValid(true);
  };
  
  // Update available chapters when book changes
  useEffect(() => {
    if (!filters.book) {
      resetChaptersAndVerses();
      return;
    }
    
    const chapterNumbers = updateChaptersForBook(filters.book);
    if (chapterNumbers) {
      validateChapterAndUpdateVerses(filters.chapter, filters.book, chapterNumbers);
    }
  }, [filters.book]);

  // Update available verses when chapter changes
  useEffect(() => {
    if (filters.book && filters.chapter) {
      const chapterNum = parseInt(filters.chapter, 10);
      if (!isNaN(chapterNum) && availableChapters.includes(chapterNum)) {
        updateAvailableVerses(filters.book, chapterNum);
      } else {
        setAvailableVerses([]);
      }
    } else {
      setAvailableVerses([]);
    }
  }, [filters.chapter, availableChapters]);

  // Validate verse inputs when available verses change
  useEffect(() => {
    validateVerseInputs();
  }, [availableVerses, filters.verseStart, filters.verseEnd]);

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
          const isChapterValid = !isNaN(chapterNum) && chapterNumbers.includes(chapterNum);
          setIsChapterValid(isChapterValid);
          
          // Update available verses if chapter is valid
          if (isChapterValid) {
            updateAvailableVerses(externalFilters.book, chapterNum);
          }
        }
      }
    }
  }, [externalFilters]);

  const updateAvailableVerses = (book, chapter) => {
    const verses = getVerses(book, chapter);
    setAvailableVerses(verses);
  };

  const validateVerseInputs = () => {
    // Validate verseStart
    if (filters.verseStart) {
      const verseNum = parseInt(filters.verseStart, 10);
      setIsVerseStartValid(!isNaN(verseNum) && availableVerses.includes(verseNum));
    } else {
      setIsVerseStartValid(true);
    }
    
    // Validate verseEnd
    if (filters.verseEnd) {
      const verseNum = parseInt(filters.verseEnd, 10);
      setIsVerseEndValid(!isNaN(verseNum) && availableVerses.includes(verseNum));
    } else {
      setIsVerseEndValid(true);
    }
  };

  const handleInputChange = (name, value) => {
    const updatedFilters = { ...filters, [name]: value };
    
    // Validate chapter input
    if (name === 'chapter') {
      if (value === '') {
        setIsChapterValid(true);
        // Clear verse inputs when chapter is cleared
        updatedFilters.verseStart = '';
        updatedFilters.verseEnd = '';
      } else {
        const chapterNum = parseInt(value, 10);
        setIsChapterValid(!isNaN(chapterNum) && availableChapters.includes(chapterNum));
      }
    }
    
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };
  
  const handleBookSelect = (book) => {
    const updatedFilters = { ...filters, book, chapter: '', verseStart: '', verseEnd: '' };
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
    setIsVerseStartValid(true);
    setIsVerseEndValid(true);
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
        isInvalid={!isVerseStartValid}
      />
      <NumericInput
        className="filter-verse-to"
        name="verseEnd"
        value={filters.verseEnd}
        onChange={handleInputChange}
        placeholder="До стиха"
        isInvalid={!isVerseEndValid}
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
