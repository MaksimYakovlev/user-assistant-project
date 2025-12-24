export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Проект "Помощник"
          </h1>
          <p className="text-xl text-gray-300">Виджет технической поддержки с AI</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-3xl">🚀</span> Быстрый старт
          </h2>
          <div className="space-y-4 text-gray-200">
            <p className="text-lg">
              Проект переписан на <strong>Express.js + React</strong>. Для запуска выполните:
            </p>

            <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
              <p className="text-green-400 mb-2"># Терминал 1 - Backend (Express.js)</p>
              <p className="text-white">cd server</p>
              <p className="text-white">npm install</p>
              <p className="text-white mb-4">npm run dev</p>

              <p className="text-green-400 mb-2"># Терминал 2 - Frontend (React + Vite)</p>
              <p className="text-white">npm install</p>
              <p className="text-white">npm run dev</p>
            </div>

            <p className="mt-4">
              После запуска откройте: <strong className="text-purple-400">http://localhost:3000</strong>
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="text-2xl">⚙️</span> Backend
            </h3>
            <ul className="space-y-2 text-gray-200">
              <li>✓ Express.js API</li>
              <li>✓ GigaChat интеграция</li>
              <li>✓ RAG система</li>
              <li>✓ Загрузка файлов</li>
              <li>✓ Порт: 3001</li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <span className="text-2xl">⚛️</span> Frontend
            </h3>
            <ul className="space-y-2 text-gray-200">
              <li>✓ React 18 + Vite</li>
              <li>✓ Виджет помощника</li>
              <li>✓ Чат интерфейс</li>
              <li>✓ Загрузка скриншотов</li>
              <li>✓ Порт: 3000</li>
            </ul>
          </div>
        </div>

        <div className="bg-amber-500/20 backdrop-blur-lg rounded-xl p-6 border border-amber-500/30 mb-8">
          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <span className="text-2xl">🔑</span> Настройка API ключей
          </h3>
          <p className="text-gray-200 mb-3">
            Создайте файл <code className="bg-black/30 px-2 py-1 rounded">server/.env</code> с ключами GigaChat:
          </p>
          <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
            <p className="text-white">GIGACHAT_API_KEY=your_api_key</p>
            <p className="text-white">GIGACHAT_CLIENT_ID=your_client_id</p>
            <p className="text-white">GIGACHAT_CLIENT_SECRET=your_secret</p>
            <p className="text-white">PORT=3001</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <span className="text-2xl">📚</span> Документация
          </h3>
          <ul className="space-y-2 text-gray-200">
            <li>
              📖 <strong>README.md</strong> - Полная документация
            </li>
            <li>
              🚀 <strong>docs/DEPLOYMENT.md</strong> - Инструкции по развертыванию
            </li>
            <li>
              🔧 <strong>server/index.js</strong> - Backend код
            </li>
            <li>
              ⚛️ <strong>src/App.jsx</strong> - Frontend код
            </li>
          </ul>
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Создано с помощью v0.dev</p>
        </div>
      </div>
    </div>
  )
}
