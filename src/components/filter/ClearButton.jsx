import PropTypes from 'prop-types';
import clearIcon from '../../assets/clear.svg';

/**
 * Clear button component for filters
 */
const ClearButton = ({ onClick }) => {
  return (
    <button 
      type="button"
      className="filter-clear-button" 
      onClick={onClick}
      title="Очистить фильтры"
      aria-label="Очистить фильтры"
    >
      <img 
        src={clearIcon} 
        alt="" 
        className="filter-clear-icon" 
      />
    </button>
  );
};

ClearButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default ClearButton;
