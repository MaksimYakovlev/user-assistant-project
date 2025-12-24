# Module Federation - Руководство

## Обзор

Проект настроен с Webpack Module Federation для поддержки микрофронтенд архитектуры. Виджет помощника может быть экспортирован и использован в других приложениях.

## Архитектура

### Remote Application (Помощник)
- **Порт**: 3000
- **Название**: `pomoshchnik`
- **Entry Point**: `remoteEntry.js`

### Host Application (Пример)
- **Порт**: 3002
- **Название**: `hostApp`
- **Загружает**: виджет из `pomoshchnik`

## Экспортируемые модули

Основное приложение экспортирует следующие компоненты:

```javascript
exposes: {
  './HelpWidget': './src/components/HelpWidget.jsx',
  './ChatDialog': './src/components/ChatDialog.jsx',
  './App': './src/App.jsx',
}
```

## Запуск проектов

### Основное приложение (Remote)
```bash
npm run dev
# Доступно на http://localhost:3000
```

### Host приложение (пример)
```bash
npm run dev:host
# Доступно на http://localhost:3002
```

### Все вместе
```bash
npm run start:all-with-host
# Запускает сервер (3001), remote (3000) и host (3002)
```

## Использование в вашем приложении

### 1. Настройте Module Federation в вашем webpack.config.js

```javascript
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  // ... остальная конфигурация
  
  plugins: [
    new ModuleFederationPlugin({
      name: 'yourApp',
      remotes: {
        pomoshchnik: 'pomoshchnik@http://localhost:3000/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
};
```

### 2. Импортируйте компоненты

```javascript
import React, { lazy, Suspense } from 'react';

// Ленивая загрузка удаленного компонента
const HelpWidget = lazy(() => import('pomoshchnik/HelpWidget'));

function App() {
  return (
    <div>
      <h1>Ваше приложение</h1>
      
      <Suspense fallback={<div>Загрузка...</div>}>
        <HelpWidget />
      </Suspense>
    </div>
  );
}
```

### 3. Production deployment

В production окружении измените URL в remotes:

```javascript
remotes: {
  pomoshchnik: 'pomoshchnik@https://your-domain.com/remoteEntry.js',
}
```

## Общие зависимости (Shared Dependencies)

Следующие пакеты настроены как shared для избежания дублирования:

- `react` (singleton: true)
- `react-dom` (singleton: true)
- `lucide-react`

## Преимущества

1. **Независимое развертывание** - виджет можно обновлять отдельно от основного приложения
2. **Переиспользование кода** - один виджет для множества приложений
3. **Оптимизация загрузки** - общие библиотеки загружаются один раз
4. **Изоляция команд** - разные команды могут работать над разными частями

## Отладка

Если компонент не загружается:

1. Убедитесь, что remote приложение запущено
2. Проверьте доступность `http://localhost:3000/remoteEntry.js`
3. Откройте консоль браузера для просмотра ошибок
4. Проверьте CORS настройки

## API Backend

Backend Express сервер должен быть запущен на порту 3001:

```bash
cd server
npm install
npm run dev
```

Виджет автоматически подключается к API через прокси настройки webpack.
