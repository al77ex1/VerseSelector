/**
 * Утилиты для работы с Elasticsearch
 */
import { Client } from '@elastic/elasticsearch';
import { INDEX_NAME, REQUEST_TIMEOUT, getIndexConfig } from '../config/elasticsearch.js';

/**
 * Создает клиент Elasticsearch с настройками
 * @param {string} url - URL Elasticsearch сервера
 * @returns {Client} - Клиент Elasticsearch
 */
export const createElasticsearchClient = (url) => {
  return new Client({ 
    node: url,
    requestTimeout: REQUEST_TIMEOUT
  });
};

/**
 * Проверяет подключение к Elasticsearch
 * @param {Client} client - Клиент Elasticsearch
 * @returns {Promise<Object>} - Информация о сервере
 * @throws {Error} - Если не удалось подключиться
 */
export const checkElasticsearchConnection = async (client) => {
  try {
    const info = await client.info();
    console.log(`Connected to Elasticsearch ${info.version?.number || 'unknown version'}`);
    return info;
  } catch (error) {
    console.error('Error connecting to Elasticsearch:', error.message);
    throw new Error(`Failed to connect to Elasticsearch: ${error.message}`);
  }
};

/**
 * Удаляет индекс, если он существует
 * @param {Client} client - Клиент Elasticsearch
 * @param {string} indexName - Имя индекса
 * @returns {Promise<boolean>} - true, если индекс был удален, false если индекс не существовал
 */
export const deleteIndexIfExists = async (client, indexName = INDEX_NAME) => {
  try {
    const indexExists = await client.indices.exists({ index: indexName });
    
    if (indexExists) {
      console.log(`Index ${indexName} already exists, deleting...`);
      await client.indices.delete({ index: indexName });
      console.log(`Index ${indexName} successfully deleted`);
      return true;
    }
    
    console.log(`Index ${indexName} does not exist yet`);
    return false;
  } catch (error) {
    // Проверяем, является ли ошибка ошибкой "index_not_found_exception"
    if (error.meta?.body?.error?.type === 'index_not_found_exception') {
      console.log(`Index ${indexName} does not exist yet (confirmed by error)`);
      return false;
    }
    
    // Если это другая ошибка, пробрасываем её дальше
    console.error(`Error checking/deleting index ${indexName}:`, error.message);
    throw error;
  }
};

/**
 * Создает индекс с настройками
 * @param {Client} client - Клиент Elasticsearch
 * @param {string} indexName - Имя индекса
 * @returns {Promise<void>}
 */
export const createIndex = async (client, indexName = INDEX_NAME) => {
  try {
    console.log(`Creating index ${indexName}...`);
    await client.indices.create({
      index: indexName,
      body: getIndexConfig()
    });
    console.log(`Index ${indexName} created successfully`);
  } catch (error) {
    console.error(`Error creating index ${indexName}:`, error.message);
    throw error;
  }
};

/**
 * Создает или пересоздает индекс
 * @param {Client} client - Клиент Elasticsearch
 * @param {string} indexName - Имя индекса
 * @returns {Promise<void>}
 */
export const ensureIndexExists = async (client, indexName = INDEX_NAME) => {
  try {
    // Удаляем индекс, если он существует
    await deleteIndexIfExists(client, indexName);
    
    // Создаем индекс с настройками
    await createIndex(client, indexName);
  } catch (error) {
    console.error(`Failed to ensure index ${indexName} exists:`, error.message);
    throw error;
  }
};

/**
 * Индексирует пакет документов
 * @param {Client} client - Клиент Elasticsearch
 * @param {Array} batch - Массив документов для индексации
 * @param {string} indexName - Имя индекса
 * @returns {Promise<Object>} - Результат индексации {success, errors}
 */
export const indexBatch = async (client, batch, indexName = INDEX_NAME) => {
  try {
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
    
    const bulkResponse = await client.bulk({ refresh: true, body: operations });
    
    let successCount = 0;
    let errorCount = 0;
    const erroredDocuments = [];
    
    if (bulkResponse.errors) {
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
    } else {
      successCount = batch.length;
    }
    
    return {
      success: successCount,
      errors: errorCount,
      erroredDocuments: erroredDocuments.slice(0, 3) // Первые 3 ошибки для диагностики
    };
  } catch (error) {
    console.error(`Error indexing batch:`, error.message);
    throw error;
  }
};

export default {
  createElasticsearchClient,
  checkElasticsearchConnection,
  deleteIndexIfExists,
  createIndex,
  ensureIndexExists,
  indexBatch
};
