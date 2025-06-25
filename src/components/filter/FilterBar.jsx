import { useState } from 'react';
import PropTypes from 'prop-types';
import clearIcon from '../../assets/clear.svg';

const FilterBar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    book: '',
    chapter: '',
    verseStart: '',
    verseEnd: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
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
    onFilterChange?.(clearedFilters);
  };

  return (
    <div className="filter-bar">
      <span>Фильтр:</span>
      <input
        className="filter-book"
        type="text"
        name="book"
        value={filters.book}
        onChange={handleInputChange}
        placeholder="Книга"
      />
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
