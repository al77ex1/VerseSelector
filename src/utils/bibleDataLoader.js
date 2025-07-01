/**
 * Bible data loader utility
 * Loads and processes the Bible summary data from the JSON file
 */

import bibleData from '../data/bible_summary.json';

/**
 * Get the complete Bible data
 * @returns {Array} The complete Bible data array
 */
export const getBibleData = () => {
  return bibleData;
};

/**
 * Get all book names
 * @returns {Array} Array of book names
 */
export const getBookNames = () => {
  return bibleData.map(book => book.book);
};

/**
 * Get chapters for a specific book
 * @param {string} bookName - The name of the book
 * @returns {Array|null} Array of chapter objects or null if book not found
 */
export const getChapters = (bookName) => {
  const book = bibleData.find(b => b.book === bookName);
  return book ? book.chapters : null;
};

/**
 * Get total verses for a specific chapter in a book
 * @param {string} bookName - The name of the book
 * @param {number} chapterNumber - The chapter number
 * @returns {number|null} Total number of verses or null if not found
 */
export const getVerseCount = (bookName, chapterNumber) => {
  const book = bibleData.find(b => b.book === bookName);
  if (!book) return null;
  
  const chapter = book.chapters.find(c => c.chapter.number === chapterNumber);
  return chapter ? chapter.chapter['total verses'] : null;
};

/**
 * Get all verses for a specific chapter
 * @param {string} bookName - The name of the book
 * @param {number} chapterNumber - The chapter number
 * @returns {Array} Array of verse numbers from 1 to total verses
 */
export const getVerses = (bookName, chapterNumber) => {
  const totalVerses = getVerseCount(bookName, chapterNumber);
  if (!totalVerses) return [];
  
  return Array.from({ length: totalVerses }, (_, i) => i + 1);
};

/**
 * Get verse text for a specific verse or range of verses
 * @param {string} bookName - The name of the book
 * @param {number} chapterNumber - The chapter number
 * @param {number} verseStart - The starting verse number
 * @param {number} verseEnd - The ending verse number (optional)
 * @returns {Array} Array of verse objects with number and text
 */
export const getVerseText = (bookName, chapterNumber, verseStart, verseEnd = null) => {
  const book = bibleData.find(b => b.book === bookName);
  if (!book) return [];
  
  const chapter = book.chapters.find(c => c.chapter.number === chapterNumber);
  if (!chapter) return [];
  
  const verses = chapter.chapter.verses;
  const result = [];
  
  const start = verseStart;
  const end = verseEnd || verseStart;
  
  for (let i = start - 1; i < end; i++) {
    if (verses[i]) {
      result.push({
        verse: verses[i].verse.number,
        text: verses[i].verse.text
      });
    }
  }
  
  return result;
};

export default {
  getBibleData,
  getBookNames,
  getChapters,
  getVerseCount,
  getVerses,
  getVerseText
};
