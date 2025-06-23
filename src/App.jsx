import { useState, useEffect } from 'react'
import './App.css'
import BookList from './components/book/BookList'
import ChapterList from './components/chapter/ChapterList'
import VerseList from './components/verse/VerseList'
import History from './components/history/History'
import { getBookNames, getChapters, getVerses } from './utils/bibleDataLoader'

function App() {
  const [isActive, setIsActive] = useState(false)
  const [books, setBooks] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [chapters, setChapters] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [verses, setVerses] = useState([])
  const [history, setHistory] = useState([])
  const [currentSelection, setCurrentSelection] = useState(null)

  // Load Bible data on component mount
  useEffect(() => {
    setBooks(getBookNames())
  }, [])

  const toggleActive = () => {
    setIsActive(!isActive)
    // Live button now does nothing with history
  }

  const handleSelectBook = (book) => {
    setSelectedBook(book)
    setChapters(getChapters(book))
    setSelectedChapter(null)
    setVerses([])
    setCurrentSelection(prev => prev ? { ...prev, book, verseEnd: null } : { book })
  }

  const handleSelectChapter = (chapter) => {
    setSelectedChapter(chapter)
    setVerses(getVerses(selectedBook, chapter))
    setCurrentSelection(prev => prev ? { ...prev, chapter, verse: null, verseEnd: null } : { chapter })
  }

  const handleSelectVerse = (verse, verseEnd) => {
    const newSelection = {
      book: selectedBook,
      chapter: selectedChapter,
      verse: verse,
      verseEnd: verseEnd
    }
    setCurrentSelection(newSelection)
    
    // Only add to history if this is a complete selection (single verse or valid range)
    if (verse !== null && (verseEnd === null || verseEnd !== undefined)) {
      const existsInHistory = history.some(item => {
        const isRangeSelection = verseEnd !== null && verseEnd !== undefined;
        
        if (isRangeSelection) {
          return item.book === newSelection.book && 
                 item.chapter === newSelection.chapter && 
                 item.verse === newSelection.verse &&
                 item.verseEnd === newSelection.verseEnd;
        } else {
          return item.book === newSelection.book && 
                 item.chapter === newSelection.chapter && 
                 item.verse === newSelection.verse &&
                 (item.verseEnd === null || item.verseEnd === undefined);
        }
      });
      
      if (!existsInHistory) {
        setHistory(prev => [...prev, newSelection]);
      }
    }
  }

  const handleSelectHistoryItem = (item) => {
    setSelectedBook(item.book)
    setChapters(getChapters(item.book))
    setSelectedChapter(item.chapter)
    setVerses(getVerses(item.book, item.chapter))
    setCurrentSelection(item)
  }

  // Format the current selection for display
  const formatSelection = (selection) => {
    if (!selection?.book || !selection?.chapter || !selection?.verse) {
      return '';
    }
    
    if (selection.verseEnd) {
      return `${selection.book} ${selection.chapter}:${selection.verse}-${selection.verseEnd}`;
    } else {
      return `${selection.book} ${selection.chapter}:${selection.verse}`;
    }
  }

  // Check if there is a valid verse selection
  const hasValidSelection = () => {
    return !!(currentSelection?.book && currentSelection?.chapter && currentSelection?.verse);
  }

  return (
    <>
      <div id="row-columns">
        <div id="column-left">
          <div id="books" className='wrapper'>
            <BookList 
              books={books} 
              onSelectBook={handleSelectBook} 
              selectedBook={selectedBook} 
            />
          </div>
          <div id="chapters" className='wrapper'>
            <ChapterList 
              chapters={chapters} 
              onSelectChapter={handleSelectChapter} 
              selectedChapter={selectedChapter} 
            />
          </div>
          <div id="verses" className='wrapper'>
            <VerseList 
              verses={verses} 
              onSelectVerse={handleSelectVerse}
              selectedVerse={currentSelection?.verse} 
              selectedVerseEnd={currentSelection?.verseEnd}
            />
          </div>
        </div>
        <div id="column-right">
          <div id="history" className='wrapper'>
            <History 
              history={history} 
              onSelectHistoryItem={handleSelectHistoryItem} 
              currentSelection={currentSelection} 
            />
          </div>
        </div>
      </div>
      <div id="row-info">
        <div id="info">
          {formatSelection(currentSelection)}
        </div>
        <button 
          id="btn-select" 
          className={hasValidSelection() ? 'active' : 'inactive'}
          onClick={toggleActive}
          disabled={!hasValidSelection()}
          style={{ 
            opacity: hasValidSelection() ? 1 : 0.5,
            cursor: hasValidSelection() ? 'pointer' : 'not-allowed'
          }}
        >
          Live
        </button>
      </div>
    </>
  )
}

export default App
