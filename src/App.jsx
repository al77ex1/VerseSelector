import { useState, useEffect, useRef } from 'react'
import './App.css'
import BookList from './components/book/BookList'
import ChapterList from './components/chapter/ChapterList'
import VerseList from './components/verse/VerseList'
import Accordion from './components/accordion/Accordion'
import Preview from './components/preview/Preview'
import History from './components/history/History'
import Search from './components/search/Search'
import LiveButton from './components/live/LiveButton'
import FilterBar from './components/filter/FilterBar'
import { getBookNames, getChapters, getVerses, getVerseText } from './utils/bibleDataLoader'

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
  const filterBarRef = useRef(null)
  const liveButtonRef = useRef(null)

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
    const loadVerseText = async () => {
      if (currentSelection?.book && currentSelection?.chapter && currentSelection?.verse) {
        try {
          const { book, chapter, verse, verseEnd } = currentSelection;
          const verseTo = verseEnd || verse;
          
          // Загружаем текст стиха из локальных данных
          const versesData = getVerseText(book, chapter, verse, verseTo);
          
          if (versesData && versesData.length > 0) {
            // Объединяем тексты стихов, если выбран диапазон
            const text = versesData.map(v => `${v.verse} ${v.text}`).join('\n\n');
            setCurrentVerseText(text);
          } else {
            setCurrentVerseText('');
          }
        } catch (error) {
          console.error('Ошибка при загрузке текста стиха:', error);
          setCurrentVerseText('Ошибка при загрузке текста стиха');
        }
      } else {
        setCurrentVerseText('');
      }
    };
    
    loadVerseText();
  }, [currentSelection]);

  // Function to focus the Live button
  const focusLiveButton = () => {
    if (liveButtonRef.current) {
      setTimeout(() => {
        liveButtonRef.current.focus();
      }, 50);
    }
  };

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
    
    // Focus on Live button after verse selection is complete
    if (verse !== null && (verseEnd === null || verseEnd !== undefined)) {
      focusLiveButton();
    }
    
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
    
    // Focus on Live button after selecting from history
    focusLiveButton();
  };

  // Handle search result selection
  const handleSearchResult = (result) => {
    // Parse the reference to extract book, chapter, and verse
    try {
      const parts = result.reference.split(' ');
      const book = parts[0];
      const chapterVerse = parts[1].split(':');
      const chapter = parseInt(chapterVerse[0], 10);
      const verse = parseInt(chapterVerse[1], 10);
      
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
      
      // Focus on Live button
      focusLiveButton();
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

  // Handle book filter changes
  const handleBookFilterChange = (newBook, oldBook) => {
    if (newBook !== oldBook && newBook) {
      handleSelectBook(newBook);
    }
  };

  // Handle chapter filter changes
  const handleChapterFilterChange = (newChapter, oldChapter, book) => {
    if (newChapter !== oldChapter && newChapter && book) {
      const chapterNum = parseInt(newChapter, 10);
      if (isValidChapter(chapterNum, chapters)) {
        handleSelectChapter(chapterNum);
      }
    }
  };

  // Check if a chapter number is valid
  const isValidChapter = (chapterNum, chaptersData) => {
    return !isNaN(chapterNum) && chaptersData?.some(c => c.chapter.number === chapterNum);
  };

  // Handle verse filter changes
  const handleVerseFilterChange = (verseStart, verseEnd) => {
    // Only proceed if we have all required fields filled
    if (!selectedBook || !selectedChapter || verses.length === 0 || 
        !verseStart) {
      return;
    }

    const parsedVerseStart = verseStart ? parseInt(verseStart, 10) : null;
    const parsedVerseEnd = verseEnd ? parseInt(verseEnd, 10) : null;
    
    // Only update selection if all required fields are filled and valid
    if (isValidVerseSelection(parsedVerseStart, parsedVerseEnd)) {
      selectVerses(parsedVerseStart, parsedVerseEnd);
    }
  };

  // Check if verse selection is valid
  const isValidVerseSelection = (verseStart, verseEnd) => {
    const isValidStart = verseStart !== null && !isNaN(verseStart) && verses.includes(verseStart);
    const isValidEnd = verseEnd === null || (verseEnd !== null && !isNaN(verseEnd) && verses.includes(verseEnd));
    return isValidStart && isValidEnd;
  };

  // Select verses based on input
  const selectVerses = (verseStart, verseEnd) => {
    if (verseEnd !== null && verseStart !== verseEnd) {
      handleSelectVerse(verseStart, verseEnd);
    } else {
      handleSelectVerse(verseStart, null);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    // Process book, chapter and verse changes
    handleBookFilterChange(newFilters.book, filters.book);
    handleChapterFilterChange(newFilters.chapter, filters.chapter, selectedBook);
    handleVerseFilterChange(newFilters.verseStart, newFilters.verseEnd);
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
          <div id="accordion" className='wrapper no-outline'>
            <Accordion 
              previewPanel={
                <Preview 
                  currentSelection={currentSelection}
                  verseText={currentVerseText}
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
        </div>
      </div>
      <div id="row-info">
        <div id="info">
          <FilterBar 
            ref={filterBarRef}
            onFilterChange={handleFilterChange} 
            filters={filters} 
          />
          <div className="selection-info">
            {getInfoText()}
          </div>
        </div>
        <LiveButton 
          ref={liveButtonRef}
          verseReference={formatSelection(currentSelection)}
          disabled={!hasValidSelection()}
          onStatusChange={handleApiStatusChange}
        />
      </div>
    </>
  )
}

export default App
