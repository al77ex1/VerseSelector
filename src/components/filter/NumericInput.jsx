import PropTypes from 'prop-types';
import { allowOnlyNumbers, formatNumberInput } from '../../utils/inputValidation';

/**
 * Numeric input component that only allows number input
 */
const NumericInput = ({ 
  name, 
  value, 
  onChange, 
  placeholder, 
  className,
  isInvalid
}) => {
  const handleChange = (e) => {
    const formattedValue = formatNumberInput(e.target.value);
    onChange(name, formattedValue);
  };
  
  const handleKeyDown = (e) => {
    allowOnlyNumbers(e);
  };

  const inputClassName = `${className || ''} ${isInvalid ? 'invalid' : ''}`.trim();
  
  return (
    <input
      className={inputClassName}
      type="text"
      name={name}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
    />
  );
};

NumericInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  isInvalid: PropTypes.bool
};

NumericInput.defaultProps = {
  placeholder: '',
  className: '',
  isInvalid: false
};

export default NumericInput;
