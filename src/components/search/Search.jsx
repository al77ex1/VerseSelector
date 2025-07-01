import { useState } from 'react';
import PropTypes from 'prop-types';
import '../components.css';

/**
 * Search component for searching Bible verses
 */
const Search = ({ onSearchResult }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Здесь будет реализован поиск через Elasticsearch API
      // Пока просто заглушка для демонстрации интерфейса
      setTimeout(() => {
        const mockResults = [
          { reference: 'Бытие 1:1', text: 'В начале сотворил Бог небо и землю.' },
          { reference: 'Бытие 1:2', text: 'Земля же была безвидна и пуста, и тьма над бездною, и Дух Божий носился над водою.' }
        ];
        
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 500);
    } catch (error) {
      console.error('Ошибка при поиске:', error);
      setIsSearching(false);
    }
  };

  const handleResultClick = (result) => {
    if (onSearchResult) {
      onSearchResult(result);
    }
  };

  return (
    <div className="search-container">
      <div className="search-input-container">
        <input
          type="text"
          className="search-input"
          placeholder="Введите текст для поиска..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          type="button"
          className="search-button"
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
        >
          {isSearching ? 'Поиск...' : 'Найти'}
        </button>
      </div>
      
      <div className="search-results">
        {searchResults.length > 0 ? (
          <ul className="search-results-list">
            {searchResults.map((result) => (
              <li 
                key={result.reference}
                className="search-result-item"
              >
                <button 
                  type="button"
                  className="search-result-button"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="search-result-reference">{result.reference}</div>
                  <div className="search-result-text">{result.text}</div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          searchQuery.trim() && !isSearching && (
            <div className="search-no-results">Нет результатов</div>
          )
        )}
      </div>
    </div>
  );
};

Search.propTypes = {
  onSearchResult: PropTypes.func
};

export default Search;
