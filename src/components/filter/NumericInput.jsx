import { useState, useEffect, useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { allowOnlyNumbers, formatNumberInput } from '../../utils/inputValidation';
import './filter.scss';

/**
 * Numeric input component that only allows number input
 * with debounce functionality to delay onChange events
 */
const NumericInput = forwardRef(({ 
  name, 
  value, 
  onChange, 
  placeholder, 
  className,
  isInvalid,
  debounceTime = 300
}, ref) => {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef(null);
  
  // Sync local value with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  const handleChange = (e) => {
    const formattedValue = formatNumberInput(e.target.value);
    setLocalValue(formattedValue);
    
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // If debounce is enabled, delay the onChange call
    if (debounceTime > 0) {
      debounceTimerRef.current = setTimeout(() => {
        onChange(name, formattedValue);
      }, debounceTime);
    } else {
      // No debounce, call onChange immediately
      onChange(name, formattedValue);
    }
  };
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  const handleKeyDown = (e) => {
    allowOnlyNumbers(e);
  };

  const inputClassName = `${className || ''} ${isInvalid ? 'invalid' : ''}`.trim();
  
  return (
    <input
      ref={ref}
      className={inputClassName}
      type="text"
      name={name}
      value={localValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
    />
  );
});

// Add display name for better debugging
NumericInput.displayName = 'NumericInput';

NumericInput.propTypes = { //NOSONAR
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  isInvalid: PropTypes.bool,
  debounceTime: PropTypes.number
};

NumericInput.defaultProps = {
  placeholder: '',
  className: '',
  isInvalid: false,
  debounceTime: 300
};

export default NumericInput;
