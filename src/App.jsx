import { useState, useEffect, useRef } from 'react'
import './App.scss'
import BookList from './components/book/BookList'
import ChapterList from './components/chapter/ChapterList'
import VerseList from './components/verse/VerseList'
import Accordion from './components/accordion/Accordion'
import Preview from './components/preview/Preview'
import History from './components/history/History'
import Search from './components/search/Search'
import LiveButton from './components/live/LiveButton'
import TVScreen from './components/live/TVScreen'
import TVScreenButtons from './components/live/TVScreenButtons'
import FilterBar from './components/filter/FilterBar'
import { getBookNames, getChapters, getVerses, getVerseText } from './utils/bibleDataLoader'
import { formatSelection, isValidChapter, isValidVerseSelection, selectVerses, loadVerseText, getInfoText, hasValidSelection } from './appHelpers'

function App() {
  const [books, setBooks] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [chapters, setChapters] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [verses, setVerses] = useState([])
  const [history, setHistory] = useState([])
  const [currentSelection, setCurrentSelection] = useState(null)
  const [currentVerseText, setCurrentVerseText] = useState('')
  const [apiStatus, setApiStatus] = useState(null) // null, 'sending', 'success', 'error'
  const [filters, setFilters] = useState({ book: '', chapter: '', verseStart: '', verseEnd: '' })
  const [isTVScreenVisible, setIsTVScreenVisible] = useState(true)
  const filterBarRef = useRef(null)

  // Load Bible data on component mount
  useEffect(() => {
    setBooks(getBookNames())
  }, [])

  // Add document click listener to clear filters when clicking outside filter-bar
  useEffect(() => {
    const handleDocumentClick = (e) => {
      const filterBar = document.querySelector('.filter-bar');
      
      const isComboboxElement = e.target.closest('.autocomplete-container') ||
                               e.target.closest('[role="listbox"]') ||
                               e.target.closest('[role="option"]');
      
      if (filterBar && !filterBar.contains(e.target) && !isComboboxElement && 
          (filters.book || filters.chapter || filters.verseStart || filters.verseEnd)) {
        const clearedFilters = { book: '', chapter: '', verseStart: '', verseEnd: '' };
        setFilters(clearedFilters);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  // Load verse text when selection changes
  useEffect(() => {
    loadVerseText(currentSelection, setCurrentVerseText, getVerseText);
  }, [currentSelection]);

  const handleSelectBook = (book) => {
    setSelectedBook(book)
    setChapters(getChapters(book))
    setSelectedChapter(null)
    setVerses([])
    setCurrentSelection({ book })
    setApiStatus(null)
    
    // Update filters to match the selected book
    // This will trigger the useEffect in FilterBar that focuses the chapter input
    const updatedFilters = { ...filters, book, chapter: '', verseStart: '', verseEnd: '' }
    setFilters(updatedFilters)
  }

  const handleSelectChapter = (chapter) => {
    setSelectedChapter(chapter)
    setVerses(getVerses(selectedBook, chapter))
    setCurrentSelection({ book: selectedBook, chapter })
    setApiStatus(null)
    
    // Update filters to match the selected chapter
    const updatedFilters = { ...filters, book: selectedBook, chapter: String(chapter), verseStart: '', verseEnd: '' }
    setFilters(updatedFilters)
  }

  const handleSelectVerse = (verse, verseEnd) => {
    // Validate verse range - ensure verseEnd is greater than or equal to verse
    if (verseEnd !== null && verseEnd !== undefined && verse > verseEnd) {
      // Invalid range - don't update selection or history
      return;
    }
    
    const newSelection = {
      book: selectedBook,
      chapter: selectedChapter,
      verse: verse,
      verseEnd: verseEnd
    }
    setCurrentSelection(newSelection)
    setApiStatus(null)
    
    // Update filters to match the selected verse
    const updatedFilters = { 
      book: selectedBook, 
      chapter: String(selectedChapter), 
      verseStart: String(verse), 
      verseEnd: verseEnd !== null && verseEnd !== undefined ? String(verseEnd) : '' 
    }
    setFilters(updatedFilters)
    
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
    
    // Update filters to match the history item
    const updatedFilters = { 
      book: item.book, 
      chapter: String(item.chapter), 
      verseStart: String(item.verse), 
      verseEnd: item.verseEnd !== null && item.verseEnd !== undefined ? String(item.verseEnd) : '' 
    }
    setFilters(updatedFilters)
    
  };

  // Handle search result selection
  const handleSearchResult = (result) => {
    // Parse the reference to extract book, chapter, and verse
    try {
      // Используем свойства из результата поиска напрямую, вместо парсинга строки
      const { book, chapter, verse } = result;
      
      // Set the selection
      setSelectedBook(book);
      setChapters(getChapters(book));
      setSelectedChapter(chapter);
      setVerses(getVerses(book, chapter));
      
      const newSelection = {
        book,
        chapter,
        verse,
        verseEnd: null
      };
      
      setCurrentSelection(newSelection);
      
      // Update filters
      const updatedFilters = {
        book,
        chapter: String(chapter),
        verseStart: String(verse),
        verseEnd: ''
      };
      setFilters(updatedFilters);
    } catch (error) {
      console.error('Ошибка при обработке результата поиска:', error);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    setCurrentSelection(null);
  };

  // Handle API status change from LiveButton
  const handleApiStatusChange = (status) => {
    setApiStatus(status);
  };

  // Handle filter changes for book, chapter and verse
  const handleFilterChange = (newFilters) => {
    // Handle book filter change
    if (newFilters.book !== filters.book && newFilters.book) {
      handleSelectBook(newFilters.book);
    }
    // Always focus chapter input when a book is selected
    if (newFilters.book && filterBarRef.current) {
      setTimeout(() => {
        filterBarRef.current.focusChapterInput();
      }, 50);
    }

    // Handle chapter filter change
    if (newFilters.chapter !== filters.chapter && newFilters.chapter && newFilters.book) {
      const chapterNum = parseInt(newFilters.chapter, 10);
      if (isValidChapter(chapterNum, chapters)) {
        handleSelectChapter(chapterNum);
      }
    }

    // Handle verse filter change
    if (newFilters.verseStart && selectedBook && selectedChapter && verses.length > 0) {
      const parsedVerseStart = newFilters.verseStart ? parseInt(newFilters.verseStart, 10) : null;
      const parsedVerseEnd = newFilters.verseEnd ? parseInt(newFilters.verseEnd, 10) : null;
      
      if (isValidVerseSelection(parsedVerseStart, parsedVerseEnd, verses)) {
        selectVerses(parsedVerseStart, parsedVerseEnd, handleSelectVerse);
      }
    }
  };

  // Handle filter changes
  const handleFilterChangeInternal = (newFilters) => {
    setFilters(newFilters);
    
    // Process book, chapter and verse changes
    handleFilterChange(newFilters);
  };

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
          <div id="two-columns">
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
        </div>
        <div id="column-right">
          <div id="accordion" className='wrapper no-outline'>
            <Accordion 
              previewPanel={
                <Preview 
                  currentSelection={currentSelection}
                  verseText={currentVerseText}
                  onSelectVerse={selectVerses}
                />
              }
              searchPanel={
                <Search 
                  onSearchResult={handleSearchResult}
                />
              }
              historyPanel={
                <History 
                  history={history} 
                  onSelectHistoryItem={handleSelectHistoryItem} 
                  currentSelection={currentSelection}
                />
              }
              onClearHistory={handleClearHistory}
            />
          </div>
          <div className="wrapper" style={{ flex: '0.35', display: isTVScreenVisible ? 'none' : 'block' }}>
            <TVScreen />
          </div>
        </div>
      </div>
      <div id="row-info">
        <div id="info">
          <FilterBar 
            ref={filterBarRef}
            onFilterChange={handleFilterChangeInternal} 
            filters={filters} 
          />
          <div className="selection-info">
            {getInfoText(currentSelection, apiStatus)}
          </div>
        </div>
        <TVScreenButtons onScreenToggle={setIsTVScreenVisible} />
        <LiveButton 
          verseReference={formatSelection(currentSelection)}
          disabled={!hasValidSelection(currentSelection)}
          onStatusChange={handleApiStatusChange}
        />
      </div>
    </>
  )
}

export default App
