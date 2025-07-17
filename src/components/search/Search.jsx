import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { searchVerses } from '../../api';
import './search.scss';

/**
 * Search component for searching Bible verses
 */
const Search = ({ onSearchResult }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setError(null);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set a new timeout for debounced search
    if (value.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(value);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearch = async (query) => {
    const searchText = query || searchQuery;
    if (!searchText.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      // Используем API Elasticsearch для поиска стихов
      const results = await searchVerses(searchText, { size: 20 });
      
      if (results && results.length > 0) {
        // Преобразуем результаты в нужный формат
        const formattedResults = results.map(hit => {
          const source = hit._source;
          return {
            id: hit._id,
            reference: source.reference,
            text: hit.highlight?.text?.[0] || source.text,
            book: source.book_name,
            chapter: source.chapter,
            verse: source.verse
          };
        });
        
        setSearchResults(formattedResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Ошибка при поиске:', error);
      setError('Произошла ошибка при поиске. Пожалуйста, попробуйте позже.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result) => {
    if (onSearchResult) {
      onSearchResult(result);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="search-container">
      <div className="search-input-container">
        <input
          type="text"
          className="search-input"
          placeholder="Введите текст для поиска..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="search-results">
        {error && <div className="search-error">{error}</div>}
        
        {searchResults.length > 0 ? (
          <ul className="search-results-list">
            {searchResults.map((result) => (
              <li 
                key={result.id || result.reference}
                className="search-result-item"
              >
                <button 
                  type="button"
                  className="search-result-button"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="search-result-reference">{result.reference}</div>
                  <div 
                    className="search-result-text"
                    dangerouslySetInnerHTML={{ __html: result.text }}
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          searchQuery.trim() && !isSearching && !error && (
            <div className="search-no-results">Нет результатов</div>
          )
        )}
        
        {isSearching && (
          <div className="search-loading">Поиск...</div>
        )}
      </div>
    </div>
  );
};

Search.propTypes = {
  onSearchResult: PropTypes.func
};

export default Search;
