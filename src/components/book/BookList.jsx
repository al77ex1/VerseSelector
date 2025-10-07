import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getBibleData } from '../../utils/bibleDataLoader';
import './book.scss';

/**
 * BookList component displays a list of Bible books
 */
const BookList = ({ books, onSelectBook, selectedBook: externalSelectedBook }) => {
  const [selectedBook, setSelectedBook] = useState(null);

  // Create a Map for quick testament lookup
  const testamentMap = useMemo(() => {
    const map = new Map();
    const bibleData = getBibleData();
    bibleData.forEach(book => {
      map.set(book.book, book.testament_reference_id);
    });
    return map;
  }, []);

  // Sync with external selected book when it changes
  useEffect(() => {
    if (externalSelectedBook !== null) {
      setSelectedBook(externalSelectedBook);
    }
  }, [externalSelectedBook]);

  const handleBookClick = (book) => {
    setSelectedBook(book);
    onSelectBook(book);
  };

  return (
    <div className="book-list">
      <h3>Книги</h3>
      <ul>
        {books.map((book) => {
          const testamentId = testamentMap.get(book);
          const testamentClass = testamentId === 1 ? 'old-testament' : 'new-testament';
          const selectedClass = selectedBook === book ? 'selected' : '';
          const className = `${selectedClass} ${testamentClass}`.trim();
          
          return (
            <li key={book}>
              <button 
                className={className}
                onClick={() => handleBookClick(book)}
                aria-pressed={selectedBook === book}
              >
                {book}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// Prop types validation
BookList.propTypes = {
  books: PropTypes.arrayOf(PropTypes.string), 
  onSelectBook: PropTypes.func.isRequired,
  selectedBook: PropTypes.string 
};

// Default props
BookList.defaultProps = {
  books: [],
  selectedBook: null
};

export default BookList;
