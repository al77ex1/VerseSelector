import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { getBookNames } from '../../utils/bibleDataLoader';
import './filter.scss';

/**
 * Book autocomplete component with dropdown suggestions
 */
const BookAutocomplete = ({ value, onChange, onSelect }) => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const inputRef = useRef(null);
  
  // Load book names on component mount
  useEffect(() => {
    setBooks(getBookNames());
  }, []);

  // Update query when external value changes
  useEffect(() => {
    setQuery(value || '');
    
    // Force input value update when value is cleared
    if (!value && inputRef.current) {
      inputRef.current.value = '';
    }
  }, [value]);

  const filteredBooks = 
    query === ''
      ? books
      : books.filter((book) =>
          book.toLowerCase().includes(query.toLowerCase())
        );

  const handleSelect = (book) => {
    onChange(book);
    
    // Call onSelect callback after a short delay to allow state updates to complete
    if (onSelect && book) {
      setTimeout(() => {
        onSelect();
      }, 0);
    }
  };
  
  const handleInputChange = (event) => {
    setQuery(event.target.value);
    
    // If input is cleared manually, also clear the selected value
    if (event.target.value === '' && value) {
      onChange('');
    }
  };

  return (
    <div className="autocomplete-container">
      <Combobox value={value} onChange={handleSelect}>
        <div className="combobox-wrapper">
          <ComboboxInput
            ref={inputRef}
            className="filter-book"
            placeholder="Книга"
            displayValue={() => value || ''}
            onChange={handleInputChange}
            autocomplete="off"
            onBlur={() => {
              // Ensure value and query are in sync on blur
              if (query !== value) {
                if (query === '') {
                  onChange('');
                } else if (!books.includes(query)) {
                  setQuery(value || '');
                }
              }
            }}
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
            {filteredBooks.length === 0 && query !== '' && (
              <div className="no-results">Книга не найдена</div>
            )}
          </ComboboxOptions>
        </div>
      </Combobox>
    </div>
  );
};

// Prop types validation
BookAutocomplete.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onSelect: PropTypes.func
};

// Default props
BookAutocomplete.defaultProps = {
  value: '',
  onSelect: null
};

export default BookAutocomplete;
