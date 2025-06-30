// Import required modules
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { Client } from '@elastic/elasticsearch';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configuration
const dbPath = process.env.DB_PATH;
const elasticsearchUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
const indexName = 'bible_verses';
const BATCH_SIZE = 50; // Размер пакета для индексации

if (!dbPath) {
  console.error('Error: DB_PATH not found in .env file');
  process.exit(1);
}

// Create Elasticsearch client
const esClient = new Client({ 
  node: elasticsearchUrl,
  // Добавляем таймаут для подключения
  requestTimeout: 10000
});

// Open SQLite database connection
async function openDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

// Create Elasticsearch index with appropriate mappings for Russian text
async function createIndex() {
  try {
    const indexExists = await esClient.indices.exists({ index: indexName });
    
    if (indexExists) {
      console.log(`Index ${indexName} already exists, deleting...`);
      try {
        await esClient.indices.delete({ index: indexName });
        console.log(`Index ${indexName} successfully deleted`);
      } catch (deleteError) {
        console.error(`Error deleting index ${indexName}:`, deleteError.message);
        throw deleteError; // Пробрасываем ошибку дальше
      }
    } else {
      console.log(`Index ${indexName} does not exist yet, creating new one...`);
    }
    
    console.log(`Creating index ${indexName}...`);
    await esClient.indices.create({
      index: indexName,
      body: {
        settings: {
          analysis: {
            analyzer: {
              russian_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'russian_stemmer', 'russian_stop']
              }
            },
            filter: {
              russian_stop: {
                type: 'stop',
                stopwords: '_russian_'
              },
              russian_stemmer: {
                type: 'stemmer',
                language: 'russian'
              }
            }
          }
        },
        mappings: {
          properties: {
            verse_id: { type: 'integer' },
            book_id: { type: 'integer' },
            book_name: { type: 'keyword' },
            chapter: { type: 'integer' },
            verse: { type: 'integer' },
            text: { 
              type: 'text',
              analyzer: 'russian_analyzer',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            reference: { type: 'keyword' }
          }
        }
      }
    });
    
    console.log(`Index ${indexName} created successfully`);
  } catch (error) {
    // Обрабатываем ошибку, но не игнорируем её
    console.error(`Error creating index ${indexName}:`, error.message);
    
    // Проверяем, является ли ошибка ошибкой "index_not_found_exception"
    if (error.meta?.body?.error?.type === 'index_not_found_exception') {
      console.log(`This is a known error when index doesn't exist. Continuing with index creation...`);
      
      // Пытаемся создать индекс
      try {
        console.log(`Creating index ${indexName} after handling not found error...`);
        await esClient.indices.create({
          index: indexName,
          body: {
            settings: {
              analysis: {
                analyzer: {
                  russian_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'russian_stemmer', 'russian_stop']
                  }
                },
                filter: {
                  russian_stop: {
                    type: 'stop',
                    stopwords: '_russian_'
                  },
                  russian_stemmer: {
                    type: 'stemmer',
                    language: 'russian'
                  }
                }
              }
            },
            mappings: {
              properties: {
                verse_id: { type: 'integer' },
                book_id: { type: 'integer' },
                book_name: { type: 'keyword' },
                chapter: { type: 'integer' },
                verse: { type: 'integer' },
                text: { 
                  type: 'text',
                  analyzer: 'russian_analyzer',
                  fields: {
                    keyword: { type: 'keyword' }
                  }
                },
                reference: { type: 'keyword' }
              }
            }
          }
        });
        console.log(`Index ${indexName} created successfully after error handling`);
      } catch (createError) {
        console.error(`Failed to create index after handling not found error:`, createError);
        throw createError; // Пробрасываем ошибку дальше
      }
    } else {
      // Если это другая ошибка, пробрасываем её дальше
      throw error;
    }
  }
}

// Get all verses from SQLite database
async function getAllVerses(db) {
  return db.all(`
    SELECT 
      v.id as verse_id,
      v.book_id,
      b.name as book_name, 
      v.chapter, 
      v.verse, 
      v.text
    FROM verse v
    JOIN book b ON v.book_id = b.id
    ORDER BY b.id, v.chapter, v.verse
  `);
}

// Index verses to Elasticsearch in batches
async function indexVerses(verses) {
  console.log(`Indexing ${verses.length} verses to Elasticsearch in batches of ${BATCH_SIZE}...`);
  
  // Разделение на пакеты по BATCH_SIZE записей
  const batches = [];
  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    batches.push(verses.slice(i, i + BATCH_SIZE));
  }
  
  console.log(`Created ${batches.length} batches`);
  
  let successCount = 0;
  let errorCount = 0;
  
  // Обработка каждого пакета
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Processing batch ${i + 1}/${batches.length} (${batch.length} verses)...`);
    
    const operations = batch.flatMap(verse => [
      { index: { _index: indexName } },
      { 
        verse_id: verse.verse_id,
        book_id: verse.book_id,
        book_name: verse.book_name,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text,
        reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`
      }
    ]);
    
    try {
      // В версии 7.x используется параметр body вместо operations
      const bulkResponse = await esClient.bulk({ refresh: true, body: operations });
      
      if (bulkResponse.errors) {
        const erroredDocuments = [];
        bulkResponse.items.forEach((action, j) => {
          const operation = Object.keys(action)[0];
          if (action[operation].error) {
            errorCount++;
            erroredDocuments.push({
              status: action[operation].status,
              error: action[operation].error,
              document: batch[j]
            });
          } else {
            successCount++;
          }
        });
        
        if (erroredDocuments.length > 0) {
          console.log(`${erroredDocuments.length} errors in batch ${i + 1}`);
          // Выводим первые 3 ошибки для диагностики
          console.log(erroredDocuments.slice(0, 3));
        }
      } else {
        successCount += batch.length;
      }
    } catch (error) {
      console.error(`Error processing batch ${i + 1}:`, error);
      errorCount += batch.length;
    }
    
    // Небольшая пауза между пакетами, чтобы не перегружать Elasticsearch
    if (i < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`Indexing completed: ${successCount} verses indexed successfully, ${errorCount} errors`);
}

// Main function
async function main() {
  try {
    // Check Elasticsearch connection
    try {
      const info = await esClient.info();
      console.log(`Connected to Elasticsearch ${info.version?.number || 'unknown version'}`);
    } catch (error) {
      console.error('Error connecting to Elasticsearch:', error.message);
      console.error('Please make sure Elasticsearch is running at', elasticsearchUrl);
      console.error('You can start it with: docker compose up -d');
      process.exit(1);
    }
    
    // Create index
    await createIndex();
    
    // Open database connection
    const db = await openDb();
    console.log('Connected to SQLite database');
    
    // Get all verses
    const verses = await getAllVerses(db);
    console.log(`Retrieved ${verses.length} verses from database`);
    
    // Index verses to Elasticsearch
    await indexVerses(verses);
    
    // Close database connection
    await db.close();
    
    console.log('Indexing completed successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the main function
main();
