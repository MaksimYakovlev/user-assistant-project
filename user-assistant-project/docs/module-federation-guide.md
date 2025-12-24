# Module Federation - Руководство

## Что такое Module Federation?

Module Federation - это функция Webpack 5, которая позволяет:
- Разделить приложение на микрофронтенды
- Динамически загружать модули из других приложений
- Делиться кодом между приложениями

## Конфигурация проекта

### Экспортируемые модули

Наше приложение экспортирует следующие компоненты:

```
'./HelpWidget' -> components/help-widget.tsx
'./ChatDialog' -> components/chat-dialog.tsx
'./ChatTypes' -> types/chat.ts
```

### Использование в другом приложении

Чтобы использовать виджет помощника в другом Next.js приложении:

#### 1. Настройте удаленный модуль в next.config.mjs:

```javascript
webpack: (config) => {
  config.plugins.push(
    new config.webpack.container.ModuleFederationPlugin({
      name: 'hostApp',
      remotes: {
        pomoschnik: 'pomoschnik@http://localhost:3000/static/chunks/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    })
  )
  return config
}
```

#### 2. Используйте компонент:

```tsx
import { RemoteComponentLoader } from '@/components/remote-component-loader'

export default function Page() {
  return (
    <RemoteComponentLoader
      remoteUrl="http://localhost:3000/static/chunks/remoteEntry.js"
      scope="pomoschnik"
      module="./HelpWidget"
    />
  )
}
```

#### 3. Или напрямую через динамический импорт:

```tsx
'use client'

import { loadRemoteModule } from '@/lib/load-remote-module'
import { useEffect, useState } from 'react'

export default function Page() {
  const [HelpWidget, setHelpWidget] = useState(null)

  useEffect(() => {
    loadRemoteModule({
      remoteUrl: 'http://localhost:3000/static/chunks/remoteEntry.js',
      scope: 'pomoschnik',
      module: './HelpWidget',
    }).then((mod) => setHelpWidget(() => mod.default))
  }, [])

  if (!HelpWidget) return <div>Загрузка...</div>

  return <HelpWidget />
}
```

## Добавление внешних модулей

Чтобы использовать модули из других приложений, обновите `remotes` в конфигурации:

```typescript
// module-federation.config.ts
remotes: {
  analytics: 'analytics@http://localhost:3002/remoteEntry.js',
  dashboard: 'dashboard@http://localhost:3003/remoteEntry.js',
}
```

## Production

В production используйте полные URL:

```typescript
remotes: {
  pomoschnik: 'pomoschnik@https://pomoschnik.example.com/_next/static/chunks/remoteEntry.js',
}
```

## Troubleshooting

### Ошибка "Shared module is not available"
- Убедитесь, что версии React совпадают
- Проверьте настройку `singleton: true` для shared модулей

### Модуль не загружается
- Проверьте доступность remoteEntry.js
- Убедитесь, что CORS настроен правильно
- Проверьте console для ошибок загрузки

### TypeScript ошибки
- Добавьте `// @ts-ignore` для __webpack_share_scopes__
- Создайте типы для удаленных модулей
