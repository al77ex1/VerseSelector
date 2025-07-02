import PropTypes from 'prop-types';
import './preview.scss';

/**
 * Preview component displays the currently selected verse text
 */
const Preview = ({ currentSelection, verseText }) => {
  // Format the verse reference
  const formatVerseReference = (item) => {
    if (!item) return '';
    
    if (item.verseEnd) {
      return `${item.book} ${item.chapter}:${item.verse}-${item.verseEnd}`;
    } else {
      return `${item.book} ${item.chapter}:${item.verse}`;
    }
  };

  return (
    <div className="preview-container">
      {currentSelection && verseText ? (
        <>
          <div className="preview-reference">
            {formatVerseReference(currentSelection)}
          </div>
          <div className="preview-text">
            {verseText}
          </div>
        </>
      ) : (
        <div className="preview-empty">
          Выберите стих для предпросмотра
        </div>
      )}
    </div>
  );
};

// Prop types validation
Preview.propTypes = {
  currentSelection: PropTypes.shape({
    book: PropTypes.string,
    chapter: PropTypes.number,
    verse: PropTypes.number,
    verseEnd: PropTypes.number
  }),
  verseText: PropTypes.string
};

export default Preview;
