# Помощник - Виджет технической поддержки

Полнофункциональный проект виджета помощника с AI и подключением операторов.

## Архитектура

Проект разделен на два независимых приложения:

- **Frontend**: React 18 + Webpack 5 + Module Federation (порт 3000)
- **Backend**: Express.js + Node.js (порт 3001)

## Технологии

### Frontend
- React 18
- Webpack 5 (сборщик)
- Module Federation (микрофронтенды)
- Babel (транспиляция)
- Lucide React (иконки)
- Tailwind CSS (стилизация)

### Backend
- Express.js
- Multer (загрузка файлов)
- CORS
- Node.js Fetch API

### AI & RAG
- GigaChat API интеграция
- Простая RAG система (поиск по ключевым словам)
- Polling для real-time обновлений (каждые 3 секунды)

## Установка и запуск

### 1. Установка зависимостей

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
npm install
```

### 2. Настройка переменных окружения

#### Backend (`server/.env`)
```env
GIGACHAT_API_KEY=your_api_key_here
GIGACHAT_CLIENT_ID=your_client_id_here
GIGACHAT_CLIENT_SECRET=your_client_secret_here
PORT=3001
```

### 3. Запуск приложений

#### Вариант 1: Webpack Dev Server (рекомендуется для разработки)

**Терминал 1 - Backend:**
```bash
cd server
npm run dev
```

**Терминал 2 - Frontend:**
```bash
npm run dev
```

**Терминал 3 - Host приложение (опционально для тестирования Module Federation):**
```bash
npm run dev:host
```

#### Вариант 2: Все вместе
```bash
npm run start:all
# или для запуска с host приложением:
npm run start:all-with-host
```

### 4. Открытие приложения

После запуска откройте браузер:
- Frontend (Remote): http://localhost:3000
- Backend API: http://localhost:3001/api
- Host приложение: http://localhost:3002

## Структура проекта

```
pomoshchnik/
├── server/                      # Express.js Backend
│   ├── index.js                # Главный файл сервера
│   ├── package.json            # Зависимости backend
│   ├── .env                    # Переменные окружения (создать)
│   └── uploads/                # Папка для загруженных файлов
│
├── src/                        # React Frontend
│   ├── components/       
│   │   ├── HelpWidget.jsx      # Кнопка виджета
│   │   ├── ChatDialog.jsx      # Диалог чата
│   │   ├── HelpWidget.css
│   │   └── ChatDialog.css
│   ├── App.jsx                 # Главный компонент
│   ├── App.css
│   ├── index.js                # Точка входа
│   ├── bootstrap.js            # Bootstrap для Module Federation
│   └── index.css
│
├── host-example/               # Пример host приложения
│   ├── index.js                # Host приложение
│   ├── index.html              # HTML для host
│   └── index.css               # Стили для host
│
├── docs/                       # Документация
│   ├── MODULE_FEDERATION.md    # Гайд по Module Federation
│   └── DEPLOYMENT.md           # Гайд по развертыванию
│
├── public/                     # Статические файлы
├── index.html                  # HTML шаблон
├── webpack.config.js           # Конфигурация Webpack (Remote)
├── webpack.host.config.js      # Конфигурация Webpack (Host)
├── .babelrc                    # Конфигурация Babel
├── postcss.config.js           # Конфигурация PostCSS
├── package.json                # Зависимости frontend
└── README.md                   # Эта документация
```

## API Endpoints

### POST `/api/chat/session`
Создание новой сессии чата
- **Response**: `{ sessionId: string }`

### POST `/api/chat`
Отправка сообщения в чат
- **Body**: 
  ```json
  {
    "message": "текст сообщения",
    "sessionId": "uuid",
    "attachments": ["url1", "url2"]
  }
  ```
- **Response**: 
  ```json
  {
    "message": "ответ AI",
    "context": ["заголовки найденных документов"]
  }
  ```

### GET `/api/chat/messages?sessionId=uuid`
Получение сообщений (polling)
- **Response**: 
  ```json
  {
    "newMessages": [],
    "allMessages": []
  }
  ```

### POST `/api/operator/connect`
Подключение оператора
- **Body**: `{ sessionId: "uuid" }`
- **Response**: `{ success: true, queuePosition: number }`

### POST `/api/upload`
Загрузка файлов (до 5 файлов, макс 10MB каждый)
- **Body**: FormData с файлами
- **Response**: `{ urls: ["url1", "url2"] }`

## Функционал

### Реализовано
- ✅ Виджет-кнопка помощника
- ✅ Диалоговое окно чата
- ✅ Интеграция с GigaChat AI
- ✅ RAG система (простой поиск по базе знаний)
- ✅ Загрузка скриншотов (до 5 файлов)
- ✅ Подключение оператора
- ✅ Polling для обновлений (каждые 3 секунды)
- ✅ История сессий
- ✅ Webpack Module Federation
- ✅ Микрофронтенд архитектура

### База знаний (RAG)

Система содержит базовые решения для:
- Ошибка 404
- Проблемы с авторизацией
- Медленная загрузка
- Ошибка 500

Для расширения базы знаний отредактируйте массив `knowledgeBase` в `server/index.js`.

## Настройка GigaChat

### Получение API ключей

1. Зарегистрируйтесь на https://developers.sber.ru/
2. Создайте проект
3. Получите:
   - Client ID
   - Client Secret
   - API Key

4. Добавьте их в `server/.env`:
```env
GIGACHAT_API_KEY=your_key
GIGACHAT_CLIENT_ID=your_client_id
GIGACHAT_CLIENT_SECRET=your_secret
```

## Module Federation

Проект настроен с Webpack Module Federation для использования виджета как микрофронтенда.

### Быстрый старт

1. Запустите remote приложение (виджет):
```bash
npm run dev
```

2. Запустите host приложение (пример):
```bash
npm run dev:host
```

3. Откройте http://localhost:3002 для просмотра интеграции

### Экспортируемые компоненты

- `pomoshchnik/HelpWidget` - Виджет помощника
- `pomoshchnik/ChatDialog` - Диалог чата
- `pomoshchnik/App` - Полное приложение

Подробная документация в `docs/MODULE_FEDERATION.md`.

## Production Deploy

### Backend (Express)

```bash
cd server
npm install
npm start
```

### Frontend (React + Webpack)

```bash
npm install
npm run build
```

Файлы сборки будут в папке `dist/`. Для Module Federation убедитесь, что `remoteEntry.js` доступен по публичному URL.

## Команды NPM

### Frontend
- `npm run dev` - Запуск dev сервера (порт 3000)
- `npm run build` - Production сборка
- `npm run dev:host` - Запуск host приложения (порт 3002)
- `npm run build:host` - Сборка host приложения

### Backend
- `npm run server` - Запуск backend dev сервера
- `npm run server:prod` - Запуск backend production

### Все вместе
- `npm run start:all` - Backend + Frontend
- `npm run start:all-with-host` - Backend + Frontend + Host

## Troubleshooting

### Backend не запускается
- Проверьте, что порт 3001 свободен
- Убедитесь, что все зависимости установлены: `cd server && npm install`
- Проверьте файл `.env` в папке `server/`

### Frontend не подключается к Backend
- Проверьте, что backend запущен на порту 3001
- Проверьте прокси настройки в `webpack.config.js`
- Откройте консоль браузера для просмотра ошибок

### GigaChat не работает
- Проверьте правильность API ключей
- Убедитесь, что у вас есть доступ к GigaChat API
- Проверьте логи сервера: backend выводит ошибки в консоль

### Файлы не загружаются
- Создайте папку `server/uploads/` если её нет
- Проверьте права доступа к папке
- Убедитесь, что размер файла не превышает 10MB

### Module Federation не работает
- Убедитесь, что remote приложение запущено на порту 3000
- Проверьте доступность http://localhost:3000/remoteEntry.js
- Проверьте CORS настройки в webpack.config.js
- Убедитесь, что версии React совпадают в remote и host

## Лицензия

MIT

## Автор

Создано с помощью v0.dev
