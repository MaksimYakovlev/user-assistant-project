// Простая реализация RAG без векторной базы данных
// В продакшене рекомендуется использовать векторную БД (Supabase с pgvector)

import type { KnowledgeBase } from "@/types/chat"

// База знаний для демонстрации
const knowledgeBase: KnowledgeBase[] = [
  {
    id: "1",
    title: "Ошибка 404 - Страница не найдена",
    content:
      "Если вы видите ошибку 404, это означает, что запрашиваемая страница не существует. Решение: 1) Проверьте правильность URL адреса. 2) Вернитесь на главную страницу через меню. 3) Воспользуйтесь поиском по сайту.",
    category: "Навигация",
    tags: ["404", "ошибка", "страница", "не найдена"],
  },
  {
    id: "2",
    title: "Проблемы со входом в аккаунт",
    content:
      'Если не получается войти: 1) Проверьте правильность email и пароля. 2) Используйте функцию "Забыли пароль?" для восстановления. 3) Очистите кэш браузера и cookies. 4) Попробуйте другой браузер.',
    category: "Аутентификация",
    tags: ["вход", "логин", "пароль", "аккаунт", "авторизация"],
  },
  {
    id: "3",
    title: "Медленная загрузка сайта",
    content:
      "Для ускорения загрузки: 1) Проверьте скорость интернет-соединения. 2) Очистите кэш браузера. 3) Отключите расширения браузера. 4) Обновите браузер до последней версии. 5) Попробуйте открыть сайт в режиме инкогнито.",
    category: "Производительность",
    tags: ["медленно", "загрузка", "скорость", "производительность"],
  },
  {
    id: "4",
    title: "Ошибка при загрузке файлов",
    content:
      "Если файлы не загружаются: 1) Проверьте размер файла (макс. 10 МБ). 2) Убедитесь в поддерживаемом формате (JPG, PNG, PDF). 3) Проверьте стабильность интернета. 4) Попробуйте сжать файл перед загрузкой.",
    category: "Загрузка файлов",
    tags: ["загрузка", "файл", "ошибка", "формат"],
  },
  {
    id: "5",
    title: "Не приходит email подтверждения",
    content:
      'Если письмо не пришло: 1) Проверьте папку "Спам" или "Промоакции". 2) Убедитесь в правильности указанного email. 3) Добавьте наш адрес в белый список. 4) Запросите повторную отправку через 5 минут.',
    category: "Email",
    tags: ["email", "письмо", "подтверждение", "не приходит"],
  },
]

// Простой поиск по ключевым словам
export async function ragSearch(query: string): Promise<KnowledgeBase[]> {
  const normalizedQuery = query.toLowerCase()
  const words = normalizedQuery.split(/\s+/).filter((w) => w.length > 3)

  // Подсчет релевантности для каждого документа
  const scored = knowledgeBase.map((doc) => {
    let score = 0
    const searchText = `${doc.title} ${doc.content} ${doc.tags.join(" ")}`.toLowerCase()

    words.forEach((word) => {
      if (searchText.includes(word)) {
        score += 1
      }
      // Дополнительные баллы за совпадение в заголовке
      if (doc.title.toLowerCase().includes(word)) {
        score += 2
      }
      // Дополнительные баллы за совпадение в тегах
      if (doc.tags.some((tag) => tag.includes(word))) {
        score += 1.5
      }
    })

    return { doc, score }
  })

  // Возврат топ-3 наиболее релевантных документов
  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.doc)
}

// Добавление нового документа в базу знаний
export function addKnowledge(doc: Omit<KnowledgeBase, "id">): KnowledgeBase {
  const newDoc: KnowledgeBase = {
    ...doc,
    id: Date.now().toString(),
  }
  knowledgeBase.push(newDoc)
  return newDoc
}

// Получение всех документов
export function getAllKnowledge(): KnowledgeBase[] {
  return knowledgeBase
}
