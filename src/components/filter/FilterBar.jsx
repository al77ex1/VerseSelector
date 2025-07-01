import { useState, useEffect, useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { getChapters, getVerses } from '../../utils/bibleDataLoader';
import BookAutocomplete from './BookAutocomplete';
import NumericInput from './NumericInput';
import ClearButton from '../common/ClearButton';

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

  // Function to focus the chapter input
  const focusChapterInput = () => {
    if (chapterInputRef.current) {
      chapterInputRef.current.focus();
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
});

// Add display name for better debugging
FilterBar.displayName = 'FilterBar';

FilterBar.propTypes = {
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
