import { HelpWidget } from "@/components/help-widget"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Демо-страница для тестирования виджета */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold text-foreground">Демо-сайт</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl space-y-8">
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">
              Добро пожаловать в систему Помощник
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Это демонстрационная страница для тестирования виджета технической поддержки. Нажмите на кнопку в правом
              нижнем углу, чтобы открыть помощника.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Возможности помощника:</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span>Интеллектуальные ответы с использованием GigaChat AI</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span>Загрузка скриншотов для визуальной диагностики проблем</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span>Подключение живого оператора при необходимости</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span>RAG система для точных рекомендаций из базы знаний</span>
              </li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">Настройка GigaChat API</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Для работы помощника необходимо добавить переменную окружения{" "}
              <code className="bg-muted px-2 py-1 rounded">GIGACHAT_API_KEY</code> с вашим API ключом от GigaChat. Также
              нужны <code className="bg-muted px-2 py-1 rounded">GIGACHAT_CLIENT_ID</code> и{" "}
              <code className="bg-muted px-2 py-1 rounded">GIGACHAT_CLIENT_SECRET</code>.
            </p>
          </section>
        </div>
      </main>

      {/* Виджет помощника */}
      <HelpWidget />
    </div>
  )
}
