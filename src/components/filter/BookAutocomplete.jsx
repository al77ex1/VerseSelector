import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { getBookNames } from '../../utils/bibleDataLoader';

/**
 * Book autocomplete component with dropdown suggestions
 */
const BookAutocomplete = ({ value, onChange }) => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  
  // Load book names on component mount
  useEffect(() => {
    setBooks(getBookNames());
  }, []);

  // Update query when external value changes
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const filteredBooks = 
    query === ''
      ? books
      : books.filter((book) =>
          book.toLowerCase().includes(query.toLowerCase())
        );

  const handleSelect = (book) => {
    onChange(book);
  };

  return (
    <div className="autocomplete-container">
      <Combobox value={value} onChange={handleSelect} onClose={() => setQuery(value || '')}>
        <div className="combobox-wrapper">
          <ComboboxInput
            className="filter-book"
            placeholder="Книга"
            displayValue={() => value || ''}
            onChange={(event) => setQuery(event.target.value)}
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

BookAutocomplete.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

BookAutocomplete.defaultProps = {
  value: ''
};

export default BookAutocomplete;
