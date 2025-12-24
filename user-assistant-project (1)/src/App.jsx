import { HelpWidget } from "./components/HelpWidget"
import "./App.css"

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>Демо сайт с виджетом помощника</h1>
        <p>Нажмите на кнопку помощника в правом нижнем углу</p>
      </header>

      <main className="app-main">
        <section className="demo-section">
          <h2>О проекте "Помощник"</h2>
          <p>Это демонстрация работы виджета технической поддержки с интеграцией:</p>
          <ul>
            <li>✅ GigaChat AI для ответов на вопросы</li>
            <li>✅ RAG система для поиска по базе знаний</li>
            <li>✅ Загрузка скриншотов</li>
            <li>✅ Подключение живого оператора</li>
            <li>✅ Polling для real-time обновлений</li>
          </ul>
        </section>

        <section className="demo-section">
          <h2>Примеры проблем для тестирования</h2>
          <div className="problem-cards">
            <div className="problem-card">
              <h3>Ошибка 404</h3>
              <p>Спросите: "Что делать если страница не найдена?"</p>
            </div>
            <div className="problem-card">
              <h3>Проблема входа</h3>
              <p>Спросите: "Не могу войти в аккаунт"</p>
            </div>
            <div className="problem-card">
              <h3>Медленная работа</h3>
              <p>Спросите: "Сайт медленно загружается"</p>
            </div>
          </div>
        </section>
      </main>

      {/* Виджет помощника */}
      <HelpWidget />
    </div>
  )
}

export default App
