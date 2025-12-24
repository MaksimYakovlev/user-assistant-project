"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { ChatDialog } from "./chat-dialog"

export function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Кнопка вызова помощника */}
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
        aria-label="Открыть помощника"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Диалоговое окно чата */}
      <ChatDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
