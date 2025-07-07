import * as z from "zod"

// Models for AI agent messages and conversations.
// Based on the `ai` SDK v5 `UIMessage` and `UIMessagePart` schemas.
// Some extensions added relevant to scraping web UIs.
// @see https://github.com/vercel/ai/blob/main/packages/ai/src/ui/ui-messages.ts

export const SCHEMA_VERSION = 1

export const MessageRoleSchema = z.enum(["user", "assistant", "system"])
/**
 * Based on `ai` SDK `UIMessage["role"]`
 *
 * Note the v4 "tool" role was folded into message parts for v5.
 */
export type MessageRole = z.infer<typeof MessageRoleSchema>

export const TextPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  source: z.enum(["innerText"]).optional()
})
/** Based on `ai` SDK `TextUIPart` */
export type TextPart = z.infer<typeof TextPartSchema>

export const HtmlPartSchema = z.object({
  type: z.literal("html"),
  html: z.string(),
  source: z.enum(["innerHTML"]).optional()
})
/** Custom part for scraping web chat UIs */
export type HtmlPart = z.infer<typeof HtmlPartSchema>

export const MessagePartSchema = z.discriminatedUnion("type", [
  TextPartSchema,
  HtmlPartSchema
])
/**
 * Based on `ai` SDK `UIMessagePart`
 * with some extensions for scraping web chat UIs
 */
export type MessagePart = z.infer<typeof MessagePartSchema>

export const MessageSnapshotSchema = z.object({
  id: z.string(),
  role: MessageRoleSchema,
  parts: z.array(MessagePartSchema),
  metadata: z.record(z.unknown()).optional(),
  // Extension of AI SDK
  turnId: z.string().nullable(),
  model: z.string().nullable(),
  schemaVersion: z.literal(SCHEMA_VERSION)
})
/** Based on AI SDK v5 `UIMessage` */
export type MessageSnapshot = z.infer<typeof MessageSnapshotSchema>

/**
 * In-memory reference to a message.
 *
 * Use `messageToSnapshot()` to serialize.
 */
export type MessageRef = Omit<MessageSnapshot, "parts" | "schemaVersion"> & {
  element: HTMLElement | null
}

export const ConversationSnapshotSchema = z.object({
  id: z.string(),
  vendor: z.string(),
  ui: z.string(),
  url: z.string(),
  ts: z.number(),
  messages: z.array(MessageSnapshotSchema),
  schemaVersion: z.literal(SCHEMA_VERSION)
})
/**
 * Wraps an AI agent chat
 *
 * `messages` are an extension of the AI SDK `UIMessage` schema.
 */
export type ConversationSnapshot = z.infer<typeof ConversationSnapshotSchema>

/**
 * In-memory reference to a conversation.
 *
 * Use `conversationToSnapshot()` to serialize.
 */
export type ConversationRef = Omit<
  ConversationSnapshot,
  "messages" | "schemaVersion"
> & {
  messages: MessageRef[]
}

export const messageToSnapshot = (message: MessageRef): MessageSnapshot => {
  const { element, ...rest } = message
  const parts: MessagePart[] = []
  if (message.role === "user") {
    parts.push({
      type: "text",
      text: element?.innerText ?? "",
      source: "innerText"
    })
  } else {
    parts.push({
      type: "html",
      html: element?.innerHTML ?? "",
      source: "innerHTML"
    })
  }
  return {
    ...rest,
    parts,
    schemaVersion: SCHEMA_VERSION
  }
}

export const conversationToSnapshot = (
  conversation: ConversationRef
): ConversationSnapshot => {
  const { messages, ...rest } = conversation
  return {
    ...rest,
    messages: messages.map(messageToSnapshot),
    schemaVersion: SCHEMA_VERSION
  }
}
