import { useState, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { allowOnlyNumbers, formatNumberInput } from '../../utils/inputValidation';
import './filter.scss';

const NumericInput = forwardRef(({ 
  name, 
  value, 
  onChange, 
  placeholder, 
  className,
  isInvalid
}, ref) => {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  const handleChange = (e) => {
    const formattedValue = formatNumberInput(e.target.value);
    setLocalValue(formattedValue);
    
    onChange(name, formattedValue);
  };
  
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
      autoComplete="off"
    />
  );
});

NumericInput.displayName = 'NumericInput';

NumericInput.propTypes = { //NOSONAR
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
