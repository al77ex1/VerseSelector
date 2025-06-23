import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../components.css';

/**
 * BookList component displays a list of Bible books
 */
const BookList = ({ books, onSelectBook, selectedBook: externalSelectedBook }) => {
  const [selectedBook, setSelectedBook] = useState(null);

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
        {books.map((book) => (
          <li key={book}>
            <button 
              className={selectedBook === book ? 'selected' : ''}
              onClick={() => handleBookClick(book)}
              aria-pressed={selectedBook === book}
            >
              {book}
            </button>
          </li>
        ))}
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
