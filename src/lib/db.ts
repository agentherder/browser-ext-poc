import { openDB, type DBSchema } from "idb"

import { shallowPatchDBRecord } from "./patch"
import {
  ConversationSchema,
  MessageSchema,
  SCHEMA_VERSION,
  type Conversation,
  type Message
} from "./schemas"

interface AppDBSchema extends DBSchema {
  conversations: {
    key: string
    value: Conversation
    indexes: { byUrl: string; byPlatform: string; byService: string }
  }
  messages: {
    key: string
    value: Omit<Message, "element">
    indexes: { byConversation: string; byContent: string }
  }
}

const db = await openDB<AppDBSchema>("agentherder", SCHEMA_VERSION, {
  upgrade(db) {
    const cStore = db.createObjectStore("conversations", { keyPath: "id" })
    cStore.createIndex("byUrl", "url", { unique: false })
    cStore.createIndex("byPlatform", "platform", { unique: false })
    cStore.createIndex("byService", "service", { unique: false })
    const mStore = db.createObjectStore("messages", { keyPath: "id" })
    mStore.createIndex("byConversation", "conversationId")
    mStore.createIndex("byContent", "content", { unique: false })
  }
})

export async function dbSync(data: {
  conversation: Conversation
  messages: Message[]
}) {
  const { conversation, messages } = data
  const tx = db.transaction(["conversations", "messages"], "readwrite")
  const cStore = tx.objectStore("conversations")
  const mStore = tx.objectStore("messages")

  const dbConversation = await cStore.get(conversation.id)
  if (dbConversation) {
    const patched = shallowPatchDBRecord(dbConversation, conversation)
    const validated = ConversationSchema.parse(patched)
    cStore.put(validated)
  } else {
    const validated = ConversationSchema.parse(conversation)
    cStore.put(validated)
  }

  for (const messageWithElement of messages) {
    const { element, ...message } = messageWithElement
    const dbMessage = await mStore.get(message.id)
    if (dbMessage) {
      const patched = shallowPatchDBRecord(dbMessage, message)
      const validated = MessageSchema.parse(patched)
      mStore.put(validated)
    } else {
      const validated = MessageSchema.parse(message)
      mStore.put(validated)
    }
  }

  await tx.done
}

export async function searchMessages(query: string): Promise<Message[]> {
  const all = await db.getAll("messages")
  const lcQuery = query.toLowerCase()
  return all.filter((m) => m.content.toLowerCase().includes(lcQuery))
}
