export interface Conversation {
  id: string
  url: string
  title?: string
  createdAt: number
}

export interface Message {
  id: string
  conversationId: string
  role: "user" | "assistant"
  content: string
  createdAt: number
}
