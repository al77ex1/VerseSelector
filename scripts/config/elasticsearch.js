/**
 * Конфигурация Elasticsearch
 */

// Имя индекса для стихов Библии
export const INDEX_NAME = 'bible_verses';

// Размер пакета для индексации
export const BATCH_SIZE = 50;

// Таймаут запросов к Elasticsearch (в миллисекундах)
export const REQUEST_TIMEOUT = 10000;

// Конфигурация анализатора для русского текста
export const RUSSIAN_ANALYZER_CONFIG = {
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
  }
};

// Схема маппинга для индекса стихов Библии
export const BIBLE_VERSES_MAPPING = {
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
};

// Полная конфигурация индекса
export const getIndexConfig = () => ({
  settings: RUSSIAN_ANALYZER_CONFIG.settings,
  mappings: {
    properties: BIBLE_VERSES_MAPPING.properties
  }
});

export default {
  INDEX_NAME,
  BATCH_SIZE,
  REQUEST_TIMEOUT,
  RUSSIAN_ANALYZER_CONFIG,
  BIBLE_VERSES_MAPPING,
  getIndexConfig
};
