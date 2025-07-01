// Import required modules
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const dbPath = process.env.DB_PATH;

if (!dbPath) {
  console.error('Error: DB_PATH not found in .env file');
  process.exit(1);
}

console.log('Using database path:', dbPath);

// Открытие соединения с БД
async function openDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

// Получение списка книг
async function getBooks(db) {
  return db.all('SELECT id, name FROM book ORDER BY id');
}

// Получение информации о главах и количестве стихов для одной книги
async function getChaptersInfo(db, bookId) {
  return db.all(`
    SELECT chapter AS number, COUNT(*) AS total_verses
    FROM verse
    WHERE book_id = ?
    GROUP BY chapter
    ORDER BY chapter
  `, [bookId]);
}

// Получение текстов стихов для конкретной книги и главы
async function getVerseTexts(db, bookId, chapter) {
  return db.all(`
    SELECT verse AS number, text
    FROM verse
    WHERE book_id = ? AND chapter = ?
    ORDER BY verse
  `, [bookId, chapter]);
}

// Формирование структуры по всем книгам
async function buildBibleSummary(db) {
  const books = await getBooks(db);
  const summary = [];

  for (const book of books) {
    console.log(`Обрабатываем книгу: ${book.name}`);
    const chapters = await getChaptersInfo(db, book.id);
    const bookData = {
      book: book.name,
      "total chapters": chapters.length,
      chapters: []
    };

    for (const ch of chapters) {
      console.log(`  Глава ${ch.number}: получение ${ch.total_verses} стихов...`);
      const verses = await getVerseTexts(db, book.id, ch.number);
      
      bookData.chapters.push({
        chapter: {
          number: ch.number,
          "total verses": ch.total_verses,
          verses: verses.map(v => ({
            verse: {
              number: v.number,
              text: v.text
            }
          }))
        }
      });
    }
    
    summary.push(bookData);
  }
  return summary;
}

// Основная функция
async function main() {
  // Создаем директорию для данных, если она не существует
  const dataDir = path.join(__dirname, '../src/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const outputPath = path.join(dataDir, 'bible_summary.json');

  const db = await openDb();
  try {
    console.log('Начинаем формирование JSON-файла с текстами стихов...');
    const summary = await buildBibleSummary(db);
    fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf8');
    console.log('Файл успешно создан:', outputPath);
    
    // Выводим статистику
    const totalBooks = summary.length;
    const totalChapters = summary.reduce((sum, book) => sum + book.chapters.length, 0);
    const totalVerses = summary.reduce((sum, book) => 
      sum + book.chapters.reduce((chSum, ch) => chSum + ch.chapter.verses.length, 0), 0);
    
    console.log(`Статистика:`);
    console.log(`- Книг: ${totalBooks}`);
    console.log(`- Глав: ${totalChapters}`);
    console.log(`- Стихов: ${totalVerses}`);
    console.log(`- Размер файла: ${(fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2)} МБ`);
  } catch (err) {
    console.error('Ошибка:', err);
  } finally {
    await db.close();
  }
}

main();
