export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  attachments?: string[]
}

export interface ChatSession {
  id: string
  userId?: string
  operatorId?: string
  messages: Message[]
  createdAt: Date
  status: "active" | "waiting" | "closed"
}

export interface KnowledgeBase {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
}
