"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send, Paperclip, UserIcon, MessageCircle } from "lucide-react"
import "./ChatDialog.css"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"

export function ChatDialog({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content: "Здравствуйте! Я ваш виртуальный помощник. Опишите вашу проблему, и я помогу найти решение.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [operatorConnected, setOperatorConnected] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Создание сессии
  useEffect(() => {
    if (isOpen && !sessionId) {
      createSession()
    }
  }, [isOpen, sessionId])

  // Автоскролл
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Polling для обновлений
  useEffect(() => {
    if (!sessionId || !operatorConnected) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/chat/messages?sessionId=${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.newMessages && data.newMessages.length > 0) {
            setMessages((prev) => [...prev, ...data.newMessages])
          }
        }
      } catch (error) {
        console.error("Ошибка при получении сообщений:", error)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [sessionId, operatorConnected])

  const createSession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/session`, {
        method: "POST",
      })
      const data = await response.json()
      setSessionId(data.sessionId)
    } catch (error) {
      console.error("Ошибка создания сессии:", error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() && selectedFiles.length === 0) return

    const userMessage = {
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
      let uploadedUrls = []
      if (selectedFiles.length > 0) {
        const formData = new FormData()
        selectedFiles.forEach((file) => formData.append("files", file))

        const uploadResponse = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          body: formData,
        })
        const uploadData = await uploadResponse.json()
        uploadedUrls = uploadData.urls || []
      }

      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          sessionId,
          attachments: uploadedUrls,
        }),
      })

      const data = await response.json()

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setSelectedFiles([])
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error)
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
      const response = await fetch(`${API_URL}/api/operator/connect`, {
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
      console.error("Ошибка подключения оператора:", error)
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  if (!isOpen) return null

  return (
    <div className="chat-overlay">
      <div className="chat-backdrop" onClick={onClose} />

      <div className="chat-dialog">
        {/* Заголовок */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              <MessageCircle size={20} />
            </div>
            <div>
              <h3>Помощник</h3>
              <p className="chat-status">{operatorConnected ? "Оператор онлайн" : "AI помощник"}</p>
            </div>
          </div>
          <button onClick={onClose} className="chat-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Сообщения */}
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper ${message.role === "user" ? "message-user" : "message-assistant"}`}
            >
              {message.role !== "user" && (
                <div className="message-avatar">
                  <MessageCircle size={16} />
                </div>
              )}
              <div className={`message-bubble ${message.role}`}>
                <p>{message.content}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="message-attachments">
                    {message.attachments.map((att, i) => (
                      <div key={i}>📎 {att}</div>
                    ))}
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="message-avatar">
                  <UserIcon size={16} />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper message-assistant">
              <div className="message-avatar">
                <MessageCircle size={16} />
              </div>
              <div className="message-bubble loading">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Выбранные файлы */}
        {selectedFiles.length > 0 && (
          <div className="chat-files">
            {selectedFiles.map((file, i) => (
              <div key={i} className="file-chip">
                📎 {file.name}
                <button onClick={() => setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i))}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Ввод */}
        <div className="chat-input-area">
          {!operatorConnected && (
            <button onClick={handleConnectOperator} className="operator-btn">
              <UserIcon size={14} />
              Подключить оператора
            </button>
          )}
          <div className="chat-input-wrapper">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <button onClick={() => fileInputRef.current?.click()} className="input-btn">
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Опишите вашу проблему..."
              disabled={isLoading}
              className="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && selectedFiles.length === 0)}
              className="input-btn send-btn"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
