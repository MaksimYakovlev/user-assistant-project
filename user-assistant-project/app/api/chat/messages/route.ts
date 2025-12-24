import { type NextRequest, NextResponse } from "next/server"

// Хранилище новых сообщений от операторов (в продакшене использовать базу данных)
const operatorMessages = new Map<string, any[]>()

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sessionId = searchParams.get("sessionId")

  if (!sessionId) {
    return NextResponse.json({ error: "Требуется sessionId" }, { status: 400 })
  }

  // Получение новых сообщений от оператора
  const newMessages = operatorMessages.get(sessionId) || []

  // Очистка после получения
  operatorMessages.set(sessionId, [])

  return NextResponse.json({ newMessages })
}
