import { SCHEMA_VERSION, type Conversation, type Message } from "~lib/schemas"

import { scrapeChatgptMessages } from "./messages"

const conversationIdPattern = /^\/c\/([^\/?#]+)(?=\/|$)/

export const scrapeChatgptConversation = (
  doc: ParentNode = document,
  loc: Location = window.location,
  now: () => number = Date.now
): {
  conversation: Conversation
  messages: Message[]
} => {
  const idMatches = conversationIdPattern.exec(loc.pathname)
  if (!idMatches) throw Error("No conversation ID found")
  const id = decodeURIComponent(idMatches[1])
  if (!id) throw Error("No conversation ID found")
  const timestamp = now()
  const messages = scrapeChatgptMessages(id, doc, () => timestamp)
  const title = (window.document.title || messages[0]?.content || "")
    .trim()
    .slice(0, 255)
  const conversation: Conversation = {
    schemaVersion: SCHEMA_VERSION,
    id,
    platform: "openai",
    service: "chatgpt",
    url: loc.href,
    title,
    createdAt: timestamp,
    updatedAt: timestamp
  }
  return { conversation, messages }
}
