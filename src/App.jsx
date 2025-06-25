import { useState, useEffect } from 'react'
import './App.css'
import BookList from './components/book/BookList'
import ChapterList from './components/chapter/ChapterList'
import VerseList from './components/verse/VerseList'
import History from './components/history/History'
import LiveButton from './components/live/LiveButton'
import FilterBar from './components/filter/FilterBar'
import { getBookNames, getChapters, getVerses } from './utils/bibleDataLoader'

function App() {
  const [books, setBooks] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [chapters, setChapters] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [verses, setVerses] = useState([])
  const [history, setHistory] = useState([])
  const [currentSelection, setCurrentSelection] = useState(null)
  const [apiStatus, setApiStatus] = useState(null) // null, 'sending', 'success', 'error'
  const [filters, setFilters] = useState({ book: '', chapter: '', verseStart: '', verseEnd: '' })

  // Load Bible data on component mount
  useEffect(() => {
    setBooks(getBookNames())
  }, [])

  const handleSelectBook = (book) => {
    setSelectedBook(book)
    setChapters(getChapters(book))
    setSelectedChapter(null)
    setVerses([])
    setCurrentSelection({ book })
    setApiStatus(null)
    setFilters(prev => ({ ...prev, book }))
  }

  const handleSelectChapter = (chapter) => {
    setSelectedChapter(chapter)
    setVerses(getVerses(selectedBook, chapter))
    setCurrentSelection({ book: selectedBook, chapter })
    setApiStatus(null)
  }

  const handleSelectVerse = (verse, verseEnd) => {
    const newSelection = {
      book: selectedBook,
      chapter: selectedChapter,
      verse: verse,
      verseEnd: verseEnd
    }
    setCurrentSelection(newSelection)
    setApiStatus(null)
    
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
    setApiStatus(null)
  }

  // Handle API status change from LiveButton
  const handleApiStatusChange = (status) => {
    setApiStatus(status);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    // If book filter changed, update the selected book
    if (newFilters.book !== filters.book && newFilters.book) {
      handleSelectBook(newFilters.book);
    }
    
    // If chapter filter changed, update the selected chapter
    if (newFilters.chapter !== filters.chapter && newFilters.chapter && selectedBook) {
      const chapterNum = parseInt(newFilters.chapter, 10);
      if (!isNaN(chapterNum) && chapters) {
        // Check if the chapter exists in the chapters array
        const chapterExists = chapters.some(c => c.chapter.number === chapterNum);
        if (chapterExists) {
          handleSelectChapter(chapterNum);
        }
      }
    }
  };

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

  // Get formatted info text with selection and status
  const getInfoText = () => {
    const selectionText = formatSelection(currentSelection);
    if (!selectionText) return '';
    
    // Always prefix with "Выбрано: "
    const baseText = `Выбрано: ${selectionText}`;
    
    if (apiStatus === 'sending') {
      return `${baseText} | Статус: Отправка...`;
    } else if (apiStatus === 'success') {
      return `${baseText} | Статус: Отправлено`;
    } else if (apiStatus === 'error') {
      return `${baseText} | Статус: Ошибка`;
    }
    
    return baseText;
  };

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
          <FilterBar onFilterChange={handleFilterChange} filters={filters} />
          <div className="selection-info">
            {getInfoText()}
          </div>
        </div>
        <LiveButton 
          verseReference={formatSelection(currentSelection)}
          disabled={!hasValidSelection()}
          onStatusChange={handleApiStatusChange}
        />
      </div>
    </>
  )
}

export default App
