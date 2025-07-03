# Bible Verse Selector for OpenLP | Библейский Селектор Стихов для OpenLP

[![English](https://img.shields.io/badge/Language-English-blue)](#english) 
[![Russian](https://img.shields.io/badge/Язык-Русский-red)](#russian)

![Bible Verse Selector](./public/verseSelector.png)

[Demo Video | Демонстрационное видео](https://youtu.be/N11VnjwREaI)

---

<a id="english"></a>
# English Documentation

[Switch to Russian | Переключиться на русский](#russian)

## Overview

Bible Verse Selector is a React application designed for convenient selection and sending of Bible verses to the OpenLP display service. The application allows users to select Bible books, chapters, and individual verses or verse ranges, and then send the selected verses to an external API for display.

[Demo Video](https://youtu.be/N11VnjwREaI)

### Key Features

- Selection of Bible books, chapters, and verses in Russian and other languages
- Selection of both individual verses and verse ranges
- History of selected verses for quick access
- Sending selected verses to an external API via the "Live" button
- Display of sending status in the information panel
- Full-text search through Bible verses using Elasticsearch

## Technologies

- React 18
- Vite
- SCSS for component styling
- Fetch API for interaction with external APIs
- Elasticsearch for full-text search

## Project Structure

The project has a modular structure with components separated by functionality:

- `components/book` - components for Bible book selection
- `components/chapter` - components for chapter selection
- `components/verse` - components for verse selection
- `components/history` - components for working with selection history
- `components/live` - components for sending verses to an external API
- `components/search` - components for searching Bible verses
- `api` - services for working with APIs
- `utils` - helper functions and utilities

## Data Preparation

Before using the application, you need to prepare data about the Bible structure:

1. Set the path to the SQLite Bible database in the .env file
2. Use the `src/scripts/ScanSqLiteBible.js` script to scan the SQLite Bible database from OpenLP
3. The script generates a `bible_summary.json` file that contains the structure of books, chapters, and the number of verses
4. The JSON file will be updated at `src/data/bible_summary.json`

Example of running the script:
```bash
node ScanSqLiteBible.js
```

## Installation and Launch

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Preview the built application
npm run preview
```

The finished build can be placed in a custom stage in OpenLP itself (~/.local/share/openlp/stages/VerseSelector).
Then it should be opened at http://localhost:4316/stage/VerseSelector/

## API Integration

### Elasticsearch for Bible Search

To use the Bible text search function, you need to set up Elasticsearch:

1. **Launch Elasticsearch via Docker**

   There is a `docker-compose.yml` file in the project root with Elasticsearch settings:

   ```bash
   # Start the Elasticsearch container
   docker-compose up -d elasticsearch
   ```

   This will start Elasticsearch on port 9200 with configured CORS headers for browser access.

2. **Indexing Biblical Texts**

   After starting Elasticsearch, you need to fill it with data from the SQLite database:

   ```bash
   # Run the indexing script
   npm run index-bible
   ```

   The `src/scripts/IndexBibleToElasticsearch.js` script will perform the following actions:
   - Create a `bible_verses` index with optimized settings for the Russian language
   - Read all verses from the SQLite database
   - Load them into Elasticsearch with full-text search support
   - Configure highlighting of found text fragments

3. **Checking Elasticsearch Operation**

   After indexing, you can check Elasticsearch availability:
   - Open http://localhost:9200/_cat/indices in your browser
   - You should see the `bible_verses` index with the number of documents

### OpenLP API

The application interacts with the local API at `http://localhost:4316/api/v2/plugins/bibles/live`. Selected verses are sent in JSON format with an `id` field containing a reference to the verse in the format "Book Chapter:Verse" or "Book Chapter:Verse-VerseEnd" for ranges.

## Usage

1. Select a Bible book from the left panel
2. Select a chapter from the chapter list
3. Select a verse or verse range (to select a range, click on the starting verse, then on the ending verse)
4. Click the "Live" button to send the selected verse to the external API
5. The sending status will be displayed in the information panel

## License

MIT

---

<a id="russian"></a>
# Русская документация

[Switch to English | Переключиться на английский](#english)

## Обзор

Библейский Селектор Стихов - это React-приложение, разработанное для удобного выбора и отправки библейских стихов на сервис отображения OpenLP. Приложение позволяет пользователям выбирать книги Библии, главы и отдельные стихи или диапазоны стихов, а затем отправлять выбранные стихи на внешний API для отображения.

[Демонстрационное видео](https://youtu.be/N11VnjwREaI)

### Основные возможности

- Выбор книг, глав и стихов Библии на русском и других языках
- Выбор как отдельных стихов, так и диапазонов стихов
- История выбранных стихов для быстрого доступа
- Отправка выбранных стихов на внешний API по кнопке "Live"
- Отображение статуса отправки в информационной панели
- Полнотекстовый поиск по стихам Библии с использованием Elasticsearch

## Технологии

- React 18
- Vite
- SCSS для стилизации компонентов
- Fetch API для взаимодействия с внешними API
- Elasticsearch для полнотекстового поиска

## Структура проекта

Проект имеет модульную структуру с разделением компонентов по функциональности:

- `components/book` - компоненты для выбора книг Библии
- `components/chapter` - компоненты для выбора глав
- `components/verse` - компоненты для выбора стихов
- `components/history` - компоненты для работы с историей выбора
- `components/live` - компоненты для отправки стихов на внешний API
- `components/search` - компоненты для поиска библейских стихов
- `api` - сервисы для работы с API
- `utils` - вспомогательные функции и утилиты

## Подготовка данных

Перед использованием приложения необходимо подготовить данные о структуре Библии:

1. Задайте в скрипте путь к SQLite базе данных Библии в .env файле
2. Используйте скрипт `src/scripts/ScanSqLiteBible.js` для сканирования SQLite базы данных Библии из OpenLP
3. Скрипт генерирует файл `bible_summary.json`, который содержит структуру книг, глав и количество стихов
4. По пути `src/data/bible_summary.json` обновится JSON-файл 

Пример запуска скрипта:
```bash
node ScanSqLiteBible.js
```

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр собранного приложения
npm run preview
```

Готовый билд можно разместить в кастомном стейже в самом OpenLP (~/.local/share/openlp/stages/VerseSelector).
Потом открывать его следует по адресу http://localhost:4316/stage/VerseSelector/

## API интеграция

### Elasticsearch для поиска по Библии

Для работы функции поиска по тексту Библии необходимо настроить Elasticsearch:

1. **Запуск Elasticsearch через Docker**

   В корне проекта есть файл `docker-compose.yml` с настройками для Elasticsearch:

   ```bash
   # Запуск Elasticsearch контейнера
   docker-compose up -d elasticsearch
   ```

   Это запустит Elasticsearch на порту 9200 с настроенными CORS-заголовками для доступа из браузера.

2. **Индексация библейских текстов**

   После запуска Elasticsearch необходимо заполнить его данными из SQLite базы:

   ```bash
   # Запуск скрипта индексации
   npm run index-bible
   ```

   Скрипт `src/scripts/IndexBibleToElasticsearch.js` выполнит следующие действия:
   - Создаст индекс `bible_verses` с оптимизированными настройками для русского языка
   - Прочитает все стихи из SQLite базы данных
   - Загрузит их в Elasticsearch с поддержкой полнотекстового поиска
   - Настроит подсветку найденных фрагментов текста

3. **Проверка работы Elasticsearch**

   После индексации можно проверить доступность Elasticsearch:
   - Откройте http://localhost:9200/_cat/indices в браузере
   - Вы должны увидеть индекс `bible_verses` с количеством документов

### OpenLP API

Приложение взаимодействует с локальным API по адресу `http://localhost:4316/api/v2/plugins/bibles/live`. Выбранные стихи отправляются в формате JSON с полем `id`, содержащим ссылку на стих в формате "Книга Глава:Стих" или "Книга Глава:Стих-СтихКонец" для диапазонов.

## Использование

1. Выберите книгу Библии из левой панели
2. Выберите главу из списка глав
3. Выберите стих или диапазон стихов (для выбора диапазона кликните на начальный стих, затем на конечный)
4. Нажмите кнопку "Live" для отправки выбранного стиха на внешний API
5. Статус отправки будет отображаться в информационной панели

## Лицензия

MIT
