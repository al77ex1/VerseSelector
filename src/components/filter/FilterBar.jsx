import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Combobox } from '@headlessui/react';
import clearIcon from '../../assets/clear.svg';
import { getBookNames } from '../../utils/bibleDataLoader';

const FilterBar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    book: '',
    chapter: '',
    verseStart: '',
    verseEnd: ''
  });
  const [bookQuery, setBookQuery] = useState('');
  const [books, setBooks] = useState([]);
  
  // Load book names on component mount
  useEffect(() => {
    setBooks(getBookNames());
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };
  
  const handleBookSelect = (book) => {
    const updatedFilters = { ...filters, book };
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
        <Combobox value={filters.book} onChange={handleBookSelect}>
          <div className="combobox-wrapper">
            {/* @ts-ignore - Ignore the deprecation warning */}
            <Combobox.Input
              className="filter-book"
              placeholder="Книга"
              displayValue={() => filters.book}
              onChange={(event) => setBookQuery(event.target.value)}
            />
            <Combobox.Options 
              className="book-suggestions"
              style={{ backgroundColor: '#1B1E20' }}
            >
              {filteredBooks.slice(0, 15).map((book) => (
                <Combobox.Option
                  key={book}
                  value={book}
                  className={({ focus, selected }) =>
                    `${focus ? 'active' : ''} ${selected ? 'selected' : ''}`
                  }
                >
                  {book}
                </Combobox.Option>
              ))}
              {filteredBooks.length === 0 && bookQuery !== '' && (
                <div className="no-results">Книга не найдена</div>
              )}
            </Combobox.Options>
          </div>
        </Combobox>
      </div>
      <input
        className="filter-chapter"
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
  onFilterChange: PropTypes.func
};

// Default props
FilterBar.defaultProps = {
  onFilterChange: null
};

export default FilterBar;
