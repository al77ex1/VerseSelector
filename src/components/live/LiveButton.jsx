import { useState } from 'react';
import PropTypes from 'prop-types';
import { sendVerseToLive } from '../../services/api';
import '../../App.css';

/**
 * LiveButton component for sending verse selections to the Live API
 */
const LiveButton = ({ verseReference, disabled, onStatusChange }) => {
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
    >
      Live
    </button>
  );
};

// Prop types validation
LiveButton.propTypes = {
  verseReference: PropTypes.string,
  disabled: PropTypes.bool,
  onStatusChange: PropTypes.func
};

// Default props
LiveButton.defaultProps = {
  verseReference: '',
  disabled: true,
  onStatusChange: null
};

export default LiveButton;
