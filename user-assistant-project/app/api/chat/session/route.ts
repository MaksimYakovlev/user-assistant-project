import { NextResponse } from "next/server"

export async function POST() {
  // Генерация уникального ID сессии
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return NextResponse.json({
    sessionId,
    createdAt: new Date().toISOString(),
  })
}
