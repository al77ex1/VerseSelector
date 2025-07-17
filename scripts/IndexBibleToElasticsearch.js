/**
 * Скрипт для индексации стихов Библии из SQLite в Elasticsearch
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { INDEX_NAME, BATCH_SIZE } from './config/elasticsearch.js';
import { 
  createElasticsearchClient, 
  checkElasticsearchConnection,
  ensureIndexExists,
  indexBatch 
} from './utils/elasticsearchUtils.js';
import { 
  openDatabase, 
  getAllVerses, 
  closeDatabase 
} from './utils/dbUtils.js';

// Загружаем переменные окружения из .env файла
dotenv.config();

// Получаем путь к текущему файлу и директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Получаем URL Elasticsearch из переменных окружения
const elasticsearchUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

// Получаем путь к базе данных из переменных окружения и расширяем символ ~ до домашней директории
const dbPathFromEnv = process.env.DB_PATH || '~/.local/share/openlp/bibles/RST.sqlite';
const dbPath = dbPathFromEnv.startsWith('~') 
  ? path.join(os.homedir(), dbPathFromEnv.substring(1)) 
  : dbPathFromEnv;

console.log(`Using database path: ${dbPath}`);

/**
 * Индексирует все стихи из базы данных в Elasticsearch
 */
async function indexAllVerses() {
  let db = null;
  const esClient = createElasticsearchClient(elasticsearchUrl);
  
  try {
    // Проверяем подключение к Elasticsearch
    await checkElasticsearchConnection(esClient);
    
    // Открываем соединение с базой данных
    db = await openDatabase(dbPath);
    
    // Создаем или пересоздаем индекс
    await ensureIndexExists(esClient, INDEX_NAME);
    
    // Получаем все стихи из базы данных
    const verses = await getAllVerses(db);
    console.log(`Total verses to index: ${verses.length}`);
    
    // Индексируем стихи пакетами
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    
    // Разбиваем стихи на пакеты
    for (let i = 0; i < verses.length; i += BATCH_SIZE) {
      const batch = verses.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i / BATCH_SIZE + 1}/${Math.ceil(verses.length / BATCH_SIZE)} (${batch.length} verses)...`);
      
      try {
        const result = await indexBatch(esClient, batch, INDEX_NAME);
        successCount += result.success;
        errorCount += result.errors;
        
        if (result.errors > 0) {
          console.warn(`Batch had ${result.errors} errors. First few errors:`, 
            JSON.stringify(result.erroredDocuments, null, 2));
        }
      } catch (error) {
        console.error(`Failed to index batch starting at index ${i}:`, error.message);
        errorCount += batch.length;
      }
      
      processedCount += batch.length;
      console.log(`Progress: ${processedCount}/${verses.length} verses processed (${successCount} success, ${errorCount} errors)`);
      
      // Небольшая пауза между пакетами, чтобы не перегружать Elasticsearch
      if (i + BATCH_SIZE < verses.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`Indexing completed: ${successCount} verses indexed successfully, ${errorCount} errors`);
    
  } catch (error) {
    console.error('Error during indexing process:', error.message);
    process.exit(1);
  } finally {
    // Закрываем соединение с базой данных
    await closeDatabase(db);
  }
}

// Запускаем индексацию
indexAllVerses().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
