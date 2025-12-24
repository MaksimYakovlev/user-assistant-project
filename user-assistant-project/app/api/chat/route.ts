import { type NextRequest, NextResponse } from "next/server"
import { ragSearch } from "@/lib/rag"

// Хранилище сессий (в продакшене использовать базу данных)
const sessions = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, attachments } = await request.json()

    if (!message || !sessionId) {
      return NextResponse.json({ error: "Требуется сообщение и ID сессии" }, { status: 400 })
    }

    // 1. RAG - поиск релевантной информации в базе знаний
    const relevantDocs = await ragSearch(message)
    const context = relevantDocs.map((doc) => doc.content).join("\n\n")

    // 2. Подготовка промпта для GigaChat
    const systemPrompt = `Ты - профессиональный помощник технической поддержки. 
Используй следующую информацию из базы знаний для ответа:

${context}

Если информации недостаточно, предложи пользователю подключить оператора.
Отвечай на русском языке, будь вежливым и конкретным.`

    // 3. Вызов GigaChat API
    const gigachatResponse = await callGigaChat(systemPrompt, message, attachments)

    // 4. Сохранение в историю сессии
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, { messages: [] })
    }
    sessions
      .get(sessionId)
      .messages.push(
        { role: "user", content: message, timestamp: new Date() },
        { role: "assistant", content: gigachatResponse, timestamp: new Date() },
      )

    return NextResponse.json({
      message: gigachatResponse,
      context: relevantDocs.map((d) => d.title),
    })
  } catch (error) {
    console.error("[v0] Ошибка в chat API:", error)
    return NextResponse.json(
      {
        message: "Извините, произошла ошибка. Пожалуйста, попробуйте позже или подключите оператора.",
      },
      { status: 500 },
    )
  }
}

// Функция для вызова GigaChat API
async function callGigaChat(systemPrompt: string, userMessage: string, attachments?: string[]): Promise<string> {
  // Проверка наличия API ключей
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

    // Формирование сообщений для GigaChat
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ]

    // Если есть вложения, добавляем информацию о них
    if (attachments && attachments.length > 0) {
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
    console.error("[v0] Ошибка GigaChat API:", error)
    return "Извините, временные проблемы с подключением к AI. Рекомендую подключить оператора для быстрой помощи."
  }
}
