const dbPath = '/home/alex/.local/share/openlp/bibles/RST.sqlite'; // Замените на путь к БД

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');

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

// Формирование структуры по всем книгам
async function buildBibleSummary(db) {
  const books = await getBooks(db);
  const summary = [];

  for (const book of books) {
    const chapters = await getChaptersInfo(db, book.id);
    summary.push({
      book: book.name,
      "total chapters": chapters.length,
      chapters: chapters.map(ch => ({
        chapter: {
          number: ch.number,
          "total verses": ch.total_verses
        }
      }))
    });
  }
  return summary;
}

// Основная функция
async function main() {
  const outputPath = 'bible_summary.json';

  const db = await openDb();
  try {
    const summary = await buildBibleSummary(db);
    fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf8');
    console.log('Файл успешно создан:', outputPath);
  } catch (err) {
    console.error('Ошибка:', err);
  } finally {
    await db.close();
  }
}

main();
