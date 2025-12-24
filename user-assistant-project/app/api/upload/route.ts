import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Нет файлов для загрузки" }, { status: 400 })
    }

    const uploadedUrls: string[] = []

    // Создание директории для загрузок
    const uploadDir = join(process.cwd(), "public", "uploads")
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Директория уже существует
    }

    // Сохранение каждого файла
    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Генерация уникального имени файла
      const timestamp = Date.now()
      const filename = `${timestamp}_${file.name}`
      const filepath = join(uploadDir, filename)

      await writeFile(filepath, buffer)
      uploadedUrls.push(`/uploads/${filename}`)
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
    })
  } catch (error) {
    console.error("[v0] Ошибка загрузки файлов:", error)
    return NextResponse.json({ error: "Ошибка загрузки файлов" }, { status: 500 })
  }
}
