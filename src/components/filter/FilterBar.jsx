import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { getChapters, getVerses } from '../../utils/bibleDataLoader';
import BookAutocomplete from './BookAutocomplete';
import NumericInput from './NumericInput';
import ClearButton from '../common/ClearButton';
import './filter.scss';

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

  const resetChaptersAndVerses = () => {
    setAvailableChapters([]);
    setAvailableVerses([]);
    setIsChapterValid(true);
  };

  const focusChapterInput = () => {
    if (chapterInputRef.current) {
      chapterInputRef.current.focus();
    }
  };

  useImperativeHandle(ref, () => {
    if (!filters.book) {
    focusChapterInput();
    }
  });

  useEffect(() => {
    if (!filters.book) {
      resetChaptersAndVerses();
      return;
    }

    const chapterNumbers = updateChaptersForBook(filters.book);
    if (chapterNumbers) {
      validateChapterAndUpdateVerses(filters.chapter, filters.book, chapterNumbers);

      if (filters.chapter === '') {
        focusChapterInput();
      }
    }
  }, [filters.book]);

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

  useEffect(() => {
    validateVerseInputs();
  }, [availableVerses, filters.verseStart, filters.verseEnd]);

  useEffect(() => {
    if (externalFilters) {
      setFilters(externalFilters);

      if (externalFilters.book && externalFilters.chapter) {
        const chaptersData = getChapters(externalFilters.book);
        if (chaptersData) {
          const chapterNumbers = chaptersData.map(c => c.chapter.number);
          const chapterNum = parseInt(externalFilters.chapter, 10);
          const isChapterValid = !isNaN(chapterNum) && chapterNumbers.includes(chapterNum);
          setIsChapterValid(isChapterValid);

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

    if (filters.verseStart) {
      const verseNum = parseInt(filters.verseStart, 10);
      setIsVerseStartValid(!isNaN(verseNum) && availableVerses.includes(verseNum));
    } else {
      setIsVerseStartValid(true);
    }


    if (filters.verseEnd) {
      const verseEndNum = parseInt(filters.verseEnd, 10);
      const verseStartNum = parseInt(filters.verseStart, 10);

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

    if (name === 'chapter') {
      if (value === '') {
        setIsChapterValid(true);
        updatedFilters.verseStart = '';
        updatedFilters.verseEnd = '';
      } else {
        const chapterNum = parseInt(value, 10);
        const isValid = !isNaN(chapterNum) && availableChapters.includes(chapterNum);
        setIsChapterValid(isValid);
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
        }}
        placeholder="Глава"
        isInvalid={!isChapterValid}
      />
      <NumericInput
        ref={verseStartInputRef}
        className="filter-verse-from"
        name="verseStart"
        value={filters.verseStart}
        onChange={(name, value) => {
          handleInputChange(name, value);
        }}
        placeholder="От стиха"
        isInvalid={!isVerseStartValid}
      />
      <NumericInput
        ref={verseEndInputRef}
        className="filter-verse-to"
        name="verseEnd"
        value={filters.verseEnd}
        onChange={(name, value) => {
          handleInputChange(name, value);
        }}
        placeholder="До стиха"
        isInvalid={!isVerseEndValid}
      />
      <ClearButton onClick={handleClearFilters} />
    </div>
  );
});

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
