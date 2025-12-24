const express = require("express")
const cors = require("cors")
const multer = require("multer")
const path = require("path")
const crypto = require("crypto")

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"))

// Хранилище сессий (в продакшене использовать Redis/PostgreSQL)
const sessions = new Map()
const operatorQueues = new Map()

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  },
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }) // 10MB лимит

// RAG функция (простая реализация без векторов)
function ragSearch(query) {
  // База знаний для RAG
  const knowledgeBase = [
    {
      title: "Ошибка 404",
      content:
        "Ошибка 404 означает, что страница не найдена. Проверьте правильность URL адреса. Если проблема сохраняется, обратитесь к администратору.",
      keywords: ["404", "страница не найдена", "not found"],
    },
    {
      title: "Проблемы с авторизацией",
      content:
        "Если вы не можете войти в систему: 1) Проверьте правильность логина и пароля. 2) Очистите кэш браузера. 3) Попробуйте восстановить пароль.",
      keywords: ["авторизация", "логин", "пароль", "вход", "войти"],
    },
    {
      title: "Медленная загрузка",
      content:
        "Для ускорения загрузки сайта: 1) Очистите кэш браузера. 2) Проверьте скорость интернета. 3) Отключите ненужные расширения браузера.",
      keywords: ["медленно", "тормозит", "долго загружается", "скорость"],
    },
    {
      title: "Ошибка 500",
      content:
        "Ошибка 500 - внутренняя ошибка сервера. Попробуйте обновить страницу через несколько минут. Если проблема не решается, обратитесь в поддержку.",
      keywords: ["500", "internal server error", "ошибка сервера"],
    },
  ]

  const lowerQuery = query.toLowerCase()

  // Поиск по ключевым словам
  const results = knowledgeBase
    .filter(
      (doc) =>
        doc.keywords.some((keyword) => lowerQuery.includes(keyword)) || doc.content.toLowerCase().includes(lowerQuery),
    )
    .slice(0, 3) // Топ 3 результата

  return results
}

// Функция вызова GigaChat API
async function callGigaChat(systemPrompt, userMessage, attachments = []) {
  const apiKey = process.env.GIGACHAT_API_KEY
  const clientId = process.env.GIGACHAT_CLIENT_ID
  const clientSecret = process.env.GIGACHAT_CLIENT_SECRET

  if (!apiKey || !clientId || !clientSecret) {
    return `Я готов помочь вам! Однако для полноценной работы требуется настроить подключение к GigaChat API.
    
Пожалуйста, добавьте следующие переменные окружения:
- GIGACHAT_API_KEY
- GIGACHAT_CLIENT_ID
- GIGACHAT_CLIENT_SECRET

А пока я могу предложить вам подключить оператора для решения вашего вопроса: "${userMessage}"`
  }

  try {
    // Получение токена доступа
    const tokenResponse = await fetch("https://ngw.devices.sberbank.ru:9443/api/v2/oauth", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        RqUID: crypto.randomUUID(),
      },
      body: "scope=GIGACHAT_API_PERS",
    })

    if (!tokenResponse.ok) {
      throw new Error("Ошибка получения токена GigaChat")
    }

    const { access_token } = await tokenResponse.json()

    // Формирование сообщений
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ]

    if (attachments.length > 0) {
      messages.push({
        role: "system",
        content: `Пользователь прикрепил скриншоты: ${attachments.join(", ")}`,
      })
    }

    // Запрос к GigaChat
    const chatResponse = await fetch("https://gigachat.devices.sberbank.ru/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        model: "GigaChat",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!chatResponse.ok) {
      throw new Error("Ошибка запроса к GigaChat")
    }

    const chatData = await chatResponse.json()
    return chatData.choices[0].message.content
  } catch (error) {
    console.error("Ошибка GigaChat API:", error)
    return "Извините, временные проблемы с подключением к AI. Рекомендую подключить оператора для быстрой помощи."
  }
}

// API Routes

// Создание новой сессии
app.post("/api/chat/session", (req, res) => {
  const sessionId = crypto.randomUUID()
  sessions.set(sessionId, {
    messages: [],
    createdAt: new Date(),
    operatorConnected: false,
  })
  res.json({ sessionId })
})

// Отправка сообщения в чат
app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId, attachments = [] } = req.body

    if (!message || !sessionId) {
      return res.status(400).json({ error: "Требуется сообщение и ID сессии" })
    }

    // RAG поиск
    const relevantDocs = ragSearch(message)
    const context = relevantDocs.map((doc) => doc.content).join("\n\n")

    // Подготовка промпта
    const systemPrompt = `Ты - профессиональный помощник технической поддержки. 
Используй следующую информацию из базы знаний для ответа:

${context}

Если информации недостаточно, предложи пользователю подключить оператора.
Отвечай на русском языке, будь вежливым и конкретным.`

    // Вызов GigaChat
    const gigachatResponse = await callGigaChat(systemPrompt, message, attachments)

    // Сохранение в историю
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, { messages: [], operatorConnected: false })
    }

    const session = sessions.get(sessionId)
    session.messages.push(
      { role: "user", content: message, timestamp: new Date(), attachments },
      { role: "assistant", content: gigachatResponse, timestamp: new Date() },
    )

    res.json({
      message: gigachatResponse,
      context: relevantDocs.map((d) => d.title),
    })
  } catch (error) {
    console.error("Ошибка в chat API:", error)
    res.status(500).json({
      message: "Извините, произошла ошибка. Пожалуйста, попробуйте позже или подключите оператора.",
    })
  }
})

// Получение новых сообщений (для polling)
app.get("/api/chat/messages", (req, res) => {
  const { sessionId } = req.query

  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(404).json({ error: "Сессия не найдена" })
  }

  const session = sessions.get(sessionId)

  // В реальном приложении здесь была бы логика получения только новых сообщений
  res.json({
    newMessages: [],
    allMessages: session.messages,
  })
})

// Подключение оператора
app.post("/api/operator/connect", (req, res) => {
  const { sessionId } = req.body

  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(404).json({ error: "Сессия не найдена" })
  }

  const session = sessions.get(sessionId)
  session.operatorConnected = true

  // Добавление в очередь операторов
  if (!operatorQueues.has("main")) {
    operatorQueues.set("main", [])
  }
  operatorQueues.get("main").push(sessionId)

  session.messages.push({
    role: "system",
    content: "Запрос на подключение оператора отправлен. Ожидайте...",
    timestamp: new Date(),
  })

  res.json({ success: true, queuePosition: operatorQueues.get("main").length })
})

// Загрузка файлов
app.post("/api/upload", upload.array("files", 5), (req, res) => {
  try {
    const urls = req.files.map((file) => `/uploads/${file.filename}`)
    res.json({ urls })
  } catch (error) {
    console.error("Ошибка загрузки файлов:", error)
    res.status(500).json({ error: "Ошибка загрузки файлов" })
  }
})

// Статический контент для React приложения
app.use(express.static(path.join(__dirname, "../dist")))

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"))
})

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Express сервер запущен на порту ${PORT}`)
  console.log(`📡 API доступен на http://localhost:${PORT}/api`)
})
