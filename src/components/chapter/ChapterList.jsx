import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../components.css';

/**
 * ChapterList component displays chapters for a selected book
 */
const ChapterList = ({ chapters, onSelectChapter, selectedChapter: externalSelectedChapter }) => {
  const [selectedChapter, setSelectedChapter] = useState(null);

  // Sync with external selected chapter when it changes
  useEffect(() => {
    // Update internal state to match external state, including when it's null
    setSelectedChapter(externalSelectedChapter);
  }, [externalSelectedChapter]);

  const handleChapterClick = (chapter) => {
    setSelectedChapter(chapter);
    onSelectChapter(chapter);
  };

  return (
    <div className="chapter-list">
      <h3>Главы</h3>
      {chapters ? (
        <ul>
          {chapters.map((chapterObj) => (
            <li key={chapterObj.chapter.number}>
              <button
                className={selectedChapter === chapterObj.chapter.number ? 'selected' : ''}
                onClick={() => handleChapterClick(chapterObj.chapter.number)}
                aria-pressed={selectedChapter === chapterObj.chapter.number}
              >
                {chapterObj.chapter.number}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Выберите главу</p>
      )}
    </div>
  );
};

// Prop types validation
ChapterList.propTypes = {
  chapters: PropTypes.arrayOf(
    PropTypes.shape({
      chapter: PropTypes.shape({
        number: PropTypes.number.isRequired
      }).isRequired
    })
  ),
  onSelectChapter: PropTypes.func.isRequired,
  selectedChapter: PropTypes.number
};

// Default props
ChapterList.defaultProps = {
  chapters: null,
  selectedChapter: null
};

export default ChapterList;
