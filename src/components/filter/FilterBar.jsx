import { useState, useEffect, useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { getChapters, getVerses } from '../../utils/bibleDataLoader';
import BookAutocomplete from './BookAutocomplete';
import NumericInput from './NumericInput';
import ClearButton from '../common/ClearButton';
import './filter.scss';

/**
 * FilterBar component for Bible verse selection
 */
const FilterBar = forwardRef(({ onFilterChange, filters: externalFilters }, ref) => {
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
  const chapterInputRef = useRef(null);
  const verseStartInputRef = useRef(null);
  const verseEndInputRef = useRef(null);

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
      // Focus verse input when a valid chapter is entered
      focusVerseInput();
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

  // Function to focus the chapter input
  const focusChapterInput = () => {
    if (chapterInputRef.current) {
      chapterInputRef.current.focus();
    }
  };

  // Function to focus the verse input
  const focusVerseInput = () => {
    if (verseStartInputRef.current) {
      verseStartInputRef.current.focus();
    }
  };

  // Function to focus the verse end input
  const focusVerseEndInput = () => {
    if (verseEndInputRef.current) {
      verseEndInputRef.current.focus();
    }
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

      // Focus on chapter input when a book is selected and chapter is empty
      if (filters.chapter === '') {
        focusChapterInput();
      }
    }
  }, [filters.book]);

  // Update available verses when chapter changes
  useEffect(() => {
    if (filters.book && filters.chapter) {
      const chapterNum = parseInt(filters.chapter, 10);
      if (!isNaN(chapterNum) && availableChapters.includes(chapterNum)) {
        updateAvailableVerses(filters.book, chapterNum);
        // We'll handle focus in the NumericInput's onAfterChange
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

  // Focus is now handled directly in the NumericInput components

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
      const verseEndNum = parseInt(filters.verseEnd, 10);
      const verseStartNum = parseInt(filters.verseStart, 10);

      // Check if verse end is valid and greater than or equal to verse start
      const isValidVerseEnd = !isNaN(verseEndNum) &&
                             availableVerses.includes(verseEndNum) &&
                             (!filters.verseStart || isNaN(verseStartNum) || verseEndNum >= verseStartNum);

      setIsVerseEndValid(isValidVerseEnd);
    } else {
      setIsVerseEndValid(true);
    }
  };

  // Focus is now handled directly in the NumericInput components

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
        const isValid = !isNaN(chapterNum) && availableChapters.includes(chapterNum);
        setIsChapterValid(isValid);
        // Focus is now handled by onAfterChange in NumericInput
      }
    }
    
    // Focus transitions are now handled by onAfterChange in NumericInput

    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const handleBookSelect = (book) => {
    const updatedFilters = { ...filters, book, chapter: '', verseStart: '', verseEnd: '' };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);

    // Focus will be handled in the useEffect that watches filters.book
    // and by the onSelect callback for mouse clicks
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
    <div className="filter-bar" ref={ref}>
      <span>Фильтр:</span>
      <BookAutocomplete
        value={filters.book}
        onChange={handleBookSelect}
        onSelect={focusChapterInput}
      />
      <NumericInput
        ref={chapterInputRef}
        className="filter-chapter"
        name="chapter"
        value={filters.chapter}
        onChange={(name, value) => {
          handleInputChange(name, value);
          
          // Schedule focus transition after debounce time
          const chapterNum = parseInt(value, 10);
          if (!isNaN(chapterNum) && availableChapters.includes(chapterNum)) {
            setTimeout(() => {
              if (verseStartInputRef.current) {
                verseStartInputRef.current.focus();
              }
            }, 1000);
          }
        }}
        placeholder="Глава"
        isInvalid={!isChapterValid}
        debounceTime={700}
      />
      <NumericInput
        ref={verseStartInputRef}
        className="filter-verse-from"
        name="verseStart"
        value={filters.verseStart}
        onChange={(name, value) => {
          handleInputChange(name, value);
          
          // Schedule focus transition after debounce time
          const verseNum = parseInt(value, 10);
          if (!isNaN(verseNum) && availableVerses.includes(verseNum) && !filters.verseEnd) {
            setTimeout(() => {
              if (verseEndInputRef.current) {
                verseEndInputRef.current.focus();
              }
            }, 1000);
          }
        }}
        placeholder="От стиха"
        isInvalid={!isVerseStartValid}
        debounceTime={700}
      />
      <NumericInput
        ref={verseEndInputRef}
        className="filter-verse-to"
        name="verseEnd"
        value={filters.verseEnd}
        onChange={(name, value) => {
          // Process the input change
          handleInputChange(name, value);
          
          // Keep focus on this input after processing
          // Using a longer timeout to ensure it happens after all state updates
          setTimeout(() => {
            if (verseEndInputRef.current) {
              verseEndInputRef.current.focus();
            }
          }, 50);
        }}
        placeholder="До стиха"
        isInvalid={!isVerseEndValid}
        debounceTime={700}
      />
      <ClearButton onClick={handleClearFilters} />
    </div>
  );
});

// Add display name for better debugging
FilterBar.displayName = 'FilterBar';

FilterBar.propTypes = { //NOSONAR
  onFilterChange: PropTypes.func,
  filters: PropTypes.shape({
    book: PropTypes.string,
    chapter: PropTypes.string,
    verseStart: PropTypes.string,
    verseEnd: PropTypes.string
  })
};

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
