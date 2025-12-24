// Bootstrap файл для Module Federation
// Импорты должны быть асинхронными для правильной работы Module Federation
import("./index.js")
  .then(() => {
    console.log("[v0] Application loaded successfully via Module Federation")
  })
  .catch((err) => {
    console.error("[v0] Failed to load application:", err)
  })
