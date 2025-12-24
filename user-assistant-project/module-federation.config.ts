// Module Federation Configuration
// Этот файл содержит типизированную конфигурацию для Module Federation

export interface ModuleFederationConfig {
  name: string
  remotes?: Record<string, string>
  exposes?: Record<string, string>
  shared?: Record<string, any>
}

export const moduleFederationConfig: ModuleFederationConfig = {
  name: "pomoschnik",

  // Экспортируемые модули (доступные другим приложениям)
  exposes: {
    "./HelpWidget": "./components/help-widget.tsx",
    "./ChatDialog": "./components/chat-dialog.tsx",
    "./ChatTypes": "./types/chat.ts",
  },

  // Удаленные модули (импортируемые из других приложений)
  remotes: {
    // Пример: 'remoteApp': 'remoteApp@http://localhost:3001/remoteEntry.js'
  },

  // Общие зависимости
  shared: {
    react: {
      singleton: true,
      requiredVersion: false,
    },
    "react-dom": {
      singleton: true,
      requiredVersion: false,
    },
    "lucide-react": {
      singleton: true,
      requiredVersion: false,
    },
  },
}

export default moduleFederationConfig
