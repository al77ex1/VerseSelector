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
  }

  const handleSelectBook = (book) => {
    setSelectedBook(book)
    setChapters(getChapters(book))
    setSelectedChapter(null)
    setVerses([])
    setCurrentSelection(prev => ({ ...prev, book }))
  }

  const handleSelectChapter = (chapter) => {
    setSelectedChapter(chapter)
    setVerses(getVerses(selectedBook, chapter))
    setCurrentSelection(prev => ({ ...prev, chapter }))
  }

  const handleSelectVerse = (verse) => {
    const newSelection = {
      book: selectedBook,
      chapter: selectedChapter,
      verse: verse
    }
    setCurrentSelection(newSelection)
    
    // Add to history if not already there
    if (!history.some(item => 
      item.book === newSelection.book && 
      item.chapter === newSelection.chapter && 
      item.verse === newSelection.verse
    )) {
      setHistory(prev => [...prev, newSelection])
    }
  }

  const handleSelectHistoryItem = (item) => {
    setSelectedBook(item.book)
    setChapters(getChapters(item.book))
    setSelectedChapter(item.chapter)
    setVerses(getVerses(item.book, item.chapter))
    setCurrentSelection(item)
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
          {currentSelection && (
            <span>
              {currentSelection.book} {currentSelection.chapter}:{currentSelection.verse}
            </span>
          )}
        </div>
        <button 
          id="btn-select" 
          className={isActive ? 'active' : 'inactive'}
          onClick={toggleActive}
        >
          Live
        </button>
      </div>
    </>
  )
}

export default App
