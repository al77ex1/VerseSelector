/**
 * Утилиты для работы с базой данных SQLite
 */
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

/**
 * Открывает соединение с базой данных SQLite
 * @param {string} dbPath - Путь к файлу базы данных
 * @returns {Promise<sqlite.Database>} - Объект соединения с базой данных
 */
export const openDatabase = async (dbPath) => {
  try {
    console.log(`Opening database at ${dbPath}...`);
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    console.log('Database connection established');
    return db;
  } catch (error) {
    console.error('Error opening database:', error.message);
    throw new Error(`Failed to open database: ${error.message}`);
  }
};

/**
 * Получает все стихи из базы данных
 * @param {sqlite.Database} db - Объект соединения с базой данных
 * @returns {Promise<Array>} - Массив стихов
 */
export const getAllVerses = async (db) => {
  try {
    console.log('Fetching all verses from database...');
    const verses = await db.all(`
      SELECT 
        v.id as verse_id,
        b.id as book_id,
        b.name as book_name,
        v.chapter,
        v.verse,
        v.text
      FROM verse v
      JOIN book b ON v.book_id = b.id
      ORDER BY v.id
    `);
    console.log(`Fetched ${verses.length} verses from database`);
    return verses;
  } catch (error) {
    console.error('Error fetching verses from database:', error.message);
    throw new Error(`Failed to fetch verses: ${error.message}`);
  }
};

/**
 * Закрывает соединение с базой данных
 * @param {sqlite.Database} db - Объект соединения с базой данных
 * @returns {Promise<void>}
 */
export const closeDatabase = async (db) => {
  try {
    if (db) {
      await db.close();
      console.log('Database connection closed');
    }
  } catch (error) {
    console.error('Error closing database:', error.message);
  }
};

export default {
  openDatabase,
  getAllVerses,
  closeDatabase
};
