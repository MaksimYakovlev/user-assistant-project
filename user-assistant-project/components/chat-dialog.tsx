"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Send, Paperclip, UserIcon, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "@/types/chat"

interface ChatDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatDialog({ isOpen, onClose }: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Здравствуйте! Я ваш виртуальный помощник. Опишите вашу проблему, и я помогу найти решение.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>()
  const [operatorConnected, setOperatorConnected] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Создание новой сессии при открытии
  useEffect(() => {
    if (isOpen && !sessionId) {
      createSession()
    }
  }, [isOpen])

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Polling для обновлений от оператора (каждые 3 секунды)
  useEffect(() => {
    if (!sessionId || !operatorConnected) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.newMessages && data.newMessages.length > 0) {
            setMessages((prev) => [...prev, ...data.newMessages])
          }
        }
      } catch (error) {
        console.error("[v0] Ошибка при получении сообщений:", error)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [sessionId, operatorConnected])

  const createSession = async () => {
    try {
      const response = await fetch("/api/chat/session", {
        method: "POST",
      })
      const data = await response.json()
      setSessionId(data.sessionId)
    } catch (error) {
      console.error("[v0] Ошибка создания сессии:", error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() && selectedFiles.length === 0) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      attachments: selectedFiles.map((f) => f.name),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Загрузка файлов если есть
      let uploadedUrls: string[] = []
      if (selectedFiles.length > 0) {
        const formData = new FormData()
        selectedFiles.forEach((file) => formData.append("files", file))

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        const uploadData = await uploadResponse.json()
        uploadedUrls = uploadData.urls || []
      }

      // Отправка сообщения в AI
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          sessionId,
          attachments: uploadedUrls,
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setSelectedFiles([])
    } catch (error) {
      console.error("[v0] Ошибка отправки сообщения:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Извините, произошла ошибка. Попробуйте позже или подключите оператора.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectOperator = async () => {
    try {
      const response = await fetch("/api/operator/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })

      if (response.ok) {
        setOperatorConnected(true)
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "system",
            content: "Оператор подключен к чату. Ожидайте ответа...",
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error("[v0] Ошибка подключения оператора:", error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <Card className="relative w-full max-w-md h-[600px] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Заголовок */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Помощник</h3>
              <p className="text-xs text-muted-foreground">{operatorConnected ? "Оператор онлайн" : "AI помощник"}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Сообщения */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
            >
              {message.role !== "user" && (
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <MessageCircle className="h-4 w-4 text-secondary-foreground" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[80%]",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : message.role === "system"
                      ? "bg-accent text-accent-foreground text-center w-full max-w-full"
                      : "bg-secondary text-secondary-foreground",
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 text-xs opacity-75">
                    {message.attachments.map((att, i) => (
                      <div key={i}>📎 {att}</div>
                    ))}
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <UserIcon className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <MessageCircle className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="bg-secondary rounded-lg px-4 py-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-secondary-foreground/50 animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 rounded-full bg-secondary-foreground/50 animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 rounded-full bg-secondary-foreground/50 animate-bounce" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Выбранные файлы */}
        {selectedFiles.length > 0 && (
          <div className="px-4 py-2 border-t border-border">
            <div className="flex gap-2 flex-wrap">
              {selectedFiles.map((file, i) => (
                <div key={i} className="text-xs bg-secondary px-2 py-1 rounded flex items-center gap-1">
                  📎 {file.name}
                  <button
                    onClick={() => setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ввод */}
        <div className="border-t border-border p-4 bg-card">
          {!operatorConnected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnectOperator}
              className="w-full mb-3 text-xs bg-transparent"
            >
              <UserIcon className="h-3 w-3 mr-2" />
              Подключить оператора
            </Button>
          )}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} className="shrink-0">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Опишите вашу проблему..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && selectedFiles.length === 0)}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
