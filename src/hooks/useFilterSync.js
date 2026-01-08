import { useState, useEffect } from 'react';
import { updateFiltersFromSelection } from '../appHelpers';

export function useFilterSync(currentSelection) {
  const [filters, setFilters] = useState({
    book: '',
    chapter: '',
    verseStart: '',
    verseEnd: ''
  });

  const syncFilters = (selection) => {
    setFilters(updateFiltersFromSelection(selection));
  };

  useEffect(() => {
    if (currentSelection) {
      syncFilters(currentSelection);
    }
  }, [currentSelection]);

  return { filters, setFilters, syncFilters };
}

