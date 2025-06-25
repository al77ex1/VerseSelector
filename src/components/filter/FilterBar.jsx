import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import clearIcon from '../../assets/clear.svg';
import { getBookNames, getChapters } from '../../utils/bibleDataLoader';

const FilterBar = ({ onFilterChange, filters: externalFilters }) => {
  const [filters, setFilters] = useState({
    book: '',
    chapter: '',
    verseStart: '',
    verseEnd: ''
  });
  const [bookQuery, setBookQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [isChapterValid, setIsChapterValid] = useState(true);
  const [availableChapters, setAvailableChapters] = useState([]);
  
  // Load book names on component mount
  useEffect(() => {
    setBooks(getBookNames());
  }, []);

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
      if (externalFilters.book) {
        setBookQuery(externalFilters.book);
        
        // Validate chapter when external filters change
        if (externalFilters.chapter) {
          const chaptersData = getChapters(externalFilters.book);
          if (chaptersData) {
            const chapterNumbers = chaptersData.map(c => c.chapter.number);
            const chapterNum = parseInt(externalFilters.chapter, 10);
            setIsChapterValid(!isNaN(chapterNum) && chapterNumbers.includes(chapterNum));
          }
        }
      }
    }
  }, [externalFilters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
    setBookQuery('');
    setIsChapterValid(true);
    onFilterChange?.(clearedFilters);
  };

  const filteredBooks = 
    bookQuery === ''
      ? books
      : books.filter((book) =>
          book.toLowerCase().includes(bookQuery.toLowerCase())
        );

  return (
    <div className="filter-bar">
      <span>Фильтр:</span>
      <div className="autocomplete-container">
        <Combobox value={filters.book} onChange={handleBookSelect} onClose={() => setBookQuery(filters.book || '')}>
          <div className="combobox-wrapper">
            <ComboboxInput
              className="filter-book"
              placeholder="Книга"
              displayValue={() => filters.book}
              onChange={(event) => setBookQuery(event.target.value)}
            />
            <ComboboxOptions 
              className="book-suggestions"
              style={{ backgroundColor: '#1B1E20' }}
            >
              {filteredBooks.slice(0, 15).map((book) => (
                <ComboboxOption
                  key={book}
                  value={book}
                  className={({ focus, selected }) =>
                    `${focus ? 'active' : ''} ${selected ? 'selected' : ''}`
                  }
                >
                  {book}
                </ComboboxOption>
              ))}
              {filteredBooks.length === 0 && bookQuery !== '' && (
                <div className="no-results">Книга не найдена</div>
              )}
            </ComboboxOptions>
          </div>
        </Combobox>
      </div>
      <input
        className={`filter-chapter ${!isChapterValid ? 'invalid' : ''}`}
        type="text"
        name="chapter"
        value={filters.chapter}
        onChange={handleInputChange}
        placeholder="Глава"
      />
      <input
        className="filter-verse-from"
        type="text"
        name="verseStart"
        value={filters.verseStart}
        onChange={handleInputChange}
        placeholder="От стиха"
      />
      <input
        className="filter-verse-to"
        type="text"
        name="verseEnd"
        value={filters.verseEnd}
        onChange={handleInputChange}
        placeholder="До стиха"
      />
      <button 
        type="button"
        className="filter-clear-button" 
        onClick={handleClearFilters}
        title="Очистить фильтры"
        aria-label="Очистить фильтры"
      >
        <img 
          src={clearIcon} 
          alt="" 
          className="filter-clear-icon" 
        />
      </button>
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
