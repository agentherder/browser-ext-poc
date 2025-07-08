import { openDB, type DBSchema } from "idb"
import { v4 as uuid } from "uuid"

import type { Conversation, Message } from "./types"

interface AHSchema extends DBSchema {
  conversations: {
    key: string
    value: Conversation
    indexes: { byUrl: string }
  }
  messages: {
    key: string
    value: Message
    indexes: { byConv: string; byContent: string }
  }
}

export const dbPromise = openDB<AHSchema>("ag-herder", 1, {
  upgrade(db) {
    const conv = db.createObjectStore("conversations", { keyPath: "id" })
    conv.createIndex("byUrl", "url", { unique: false })

    const msg = db.createObjectStore("messages", { keyPath: "id" })
    msg.createIndex("byConv", "conversationId")
    msg.createIndex("byContent", "content", { unique: false })
  }
})

export async function addMessage(
  role: "user" | "assistant",
  content: string,
  conversationUrl: string
) {
  const db = await dbPromise

  let convo = await db.getFromIndex("conversations", "byUrl", conversationUrl)
  if (!convo) {
    convo = {
      id: uuid(),
      url: conversationUrl,
      createdAt: Date.now()
    }
    await db.add("conversations", convo)
  }

  const msg: Message = {
    id: uuid(),
    conversationId: convo.id,
    role,
    content,
    createdAt: Date.now()
  }
  await db.add("messages", msg)
}

export async function searchMessages(query: string): Promise<Message[]> {
  const db = await dbPromise
  const all = await db.getAll("messages")
  return all.filter((m) =>
    m.content.toLowerCase().includes(query.toLowerCase())
  )
}
