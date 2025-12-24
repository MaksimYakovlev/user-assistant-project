// Утилита для динамической загрузки удаленных модулей
// Используется для подключения внешних микрофронтендов

interface LoadRemoteModuleOptions {
  remoteUrl: string
  scope: string
  module: string
}

export async function loadRemoteModule<T = any>({ remoteUrl, scope, module }: LoadRemoteModuleOptions): Promise<T> {
  // Загружаем удаленный скрипт
  await loadScript(remoteUrl)

  // @ts-ignore
  const container = window[scope]

  if (!container) {
    throw new Error(`Remote container "${scope}" not found`)
  }

  // Инициализируем контейнер
  // @ts-ignore
  const __webpack_share_scopes__ = window["__webpack_share_scopes__"]
  await container.init(__webpack_share_scopes__.default)

  // Получаем фабрику модуля
  // @ts-ignore
  const factory = await container.get(module)
  const Module = factory()

  return Module
}

function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const element = document.createElement("script")

    element.src = url
    element.type = "text/javascript"
    element.async = true

    element.onload = () => {
      resolve()
    }

    element.onerror = () => {
      reject(new Error(`Failed to load script: ${url}`))
    }

    document.head.appendChild(element)
  })
}

// Пример использования:
// const RemoteComponent = await loadRemoteModule({
//   remoteUrl: 'http://localhost:3001/remoteEntry.js',
//   scope: 'remoteApp',
//   module: './Component'
// })
