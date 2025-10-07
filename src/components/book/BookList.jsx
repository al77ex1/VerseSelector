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

  // Separate books by testament
  const { oldTestamentBooks, newTestamentBooks } = useMemo(() => {
    const old = [];
    const newT = [];

    books.forEach(book => {
      const testamentId = testamentMap.get(book);
      if (testamentId === 1) {
        old.push(book);
      } else {
        newT.push(book);
      }
    });

    return { oldTestamentBooks: old, newTestamentBooks: newT };
  }, [books, testamentMap]);

  const renderBooks = (booksList, testamentClass) => {
    return booksList.map((book) => {
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
    });
  };

  return (
    <div className="book-list">
      <div className="testament-section">
        <h3>Ветхий Завет</h3>
        <ul>
          {renderBooks(oldTestamentBooks, 'old-testament')}
        </ul>
      </div>

      <div className="testament-section">
        <h3 className="internal-title">Новый Завет</h3>
        <ul>
          {renderBooks(newTestamentBooks, 'new-testament')}
        </ul>
      </div>
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
