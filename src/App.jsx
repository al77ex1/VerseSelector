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
import { getBookNames, getVerseText } from './utils/bibleDataLoader'
import { formatSelection, isValidChapter, isValidVerseSelection, selectVerses, loadVerseText, getInfoText, hasValidSelection } from './appHelpers'
import { useBibleSelection } from './hooks/useBibleSelection'
import { useHistoryManagement } from './hooks/useHistoryManagement'
import { useFilterSync } from './hooks/useFilterSync'

function App() {
  const [books, setBooks] = useState([])
  const [currentVerseText, setCurrentVerseText] = useState('')
  const [apiStatus, setApiStatus] = useState(null) // null, 'sending', 'success', 'error'
  const [isTVScreenVisible, setIsTVScreenVisible] = useState(true)
  const filterBarRef = useRef(null)
  
  // Используем кастомные хуки
  const {
    selectedBook,
    chapters,
    selectedChapter,
    verses,
    currentSelection,
    selectBook,
    selectChapter,
    selectVerse,
    selectFromHistory,
  } = useBibleSelection()
  
  const { history, addToHistory, clearHistory } = useHistoryManagement()
  const { filters, setFilters, syncFilters } = useFilterSync(currentSelection)

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
  }, [filters, setFilters]);

  // Load verse text when selection changes
  useEffect(() => {
    loadVerseText(currentSelection, setCurrentVerseText, getVerseText);
  }, [currentSelection]);

  const handleSelectBook = (book) => {
    selectBook(book)
    setApiStatus(null)
  }

  const handleSelectChapter = (chapter) => {
    selectChapter(chapter, selectedBook)
    setApiStatus(null)
  }

  const handleSelectVerse = (verse, verseEnd) => {
    // Validate verse range - ensure verseEnd is greater than or equal to verse
    if (verseEnd !== null && verseEnd !== undefined && verse > verseEnd) {
      // Invalid range - don't update selection or history
      return;
    }
    
    const newSelection = selectVerse(verse, verseEnd, selectedBook, selectedChapter)
    if (!newSelection) return;
    
    setApiStatus(null)
    
    // Only add to history if this is a complete selection (single verse or valid range)
    addToHistory(newSelection)
  }

  const handleSelectHistoryItem = (item) => {
    selectFromHistory(item)
    setApiStatus(null)
  };

  // Handle search result selection
  const handleSearchResult = (result) => {
    // Parse the reference to extract book, chapter, and verse
    try {
      // Используем свойства из результата поиска напрямую, вместо парсинга строки
      const { book, chapter, verse } = result;
      
      // Set the selection
      selectBook(book)
      selectChapter(chapter, book)
      
      const newSelection = selectVerse(verse, null, book, chapter)
      if (!newSelection) return;
    } catch (error) {
      console.error('Ошибка при обработке результата поиска:', error);
    }
  };

  const handleClearHistory = () => {
    clearHistory();
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
        const selection = selectVerses(parsedVerseStart, parsedVerseEnd);
        if (selection) {
          handleSelectVerse(selection.verseStart, selection.verseEnd);
        }
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
                  onSelectVerse={(start, end) => {
                    const selection = selectVerses(start, end);
                    if (selection) {
                      handleSelectVerse(selection.verseStart, selection.verseEnd);
                    }
                    return selection;
                  }}
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
