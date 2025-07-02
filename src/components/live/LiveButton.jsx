import { useState, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { sendVerseToLive } from '../../api';
import './live.scss';

/**
 * LiveButton component for sending verse selections to the Live API
 */
const LiveButton = forwardRef(({ verseReference, disabled, onStatusChange }, ref) => {
  const [isSending, setIsSending] = useState(false);

  const handleClick = async () => {
    if (disabled || !verseReference || isSending) {
      return;
    }

    try {
      // Update local state and notify parent
      setIsSending(true);
      onStatusChange?.('sending');
      
      // The API call will return true for success even with empty responses
      await sendVerseToLive(verseReference);
      
      // If we get here, the request was successful
      setIsSending(false);
      onStatusChange?.('success');
    } catch (error) {
      setIsSending(false);
      onStatusChange?.('error');
      console.error('Error in LiveButton:', error);
    }
  };

  // Add event listener for Enter key to trigger the Live button
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && !disabled && !isSending && verseReference) {
        handleClick();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [disabled, isSending, verseReference]); // Dependencies to re-add listener when these change

  return (
    <button 
      id="btn-select" 
      className={disabled || isSending ? 'inactive' : 'active'}
      onClick={handleClick}
      disabled={disabled || isSending}
      style={{ 
        opacity: disabled || isSending ? 0.5 : 1,
        cursor: !disabled && !isSending ? 'pointer' : 'not-allowed'
      }}
      ref={ref}
    >
      Live
    </button>
  );
});

// Add display name for better debugging
LiveButton.displayName = 'LiveButton';

LiveButton.propTypes = { //NOSONAR
  verseReference: PropTypes.string,
  disabled: PropTypes.bool,
  onStatusChange: PropTypes.func
};

LiveButton.defaultProps = {
  verseReference: '',
  disabled: true,
  onStatusChange: null
};

export default LiveButton;
