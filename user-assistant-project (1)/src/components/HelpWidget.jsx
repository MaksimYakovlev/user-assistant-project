"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { ChatDialog } from "./ChatDialog"
import "./HelpWidget.css"

export function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="help-widget-button" aria-label="Открыть помощника">
        <MessageCircle size={24} />
      </button>

      <ChatDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
