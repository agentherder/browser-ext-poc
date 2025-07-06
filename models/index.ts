import * as z from "zod"

/** Based on AI SDK v5 `TextUIPart` */
export const TextPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  source: z.enum(["innerText"]).optional()
})

export const HtmlPartSchema = z.object({
  type: z.literal("html"),
  text: z.string(),
  source: z.enum(["innerHTML"]).optional()
})

/** Based on AI SDK v5 `UIMessagePart` */
export const MessagePartSchema = z.discriminatedUnion("type", [
  TextPartSchema,
  HtmlPartSchema
])
export type MessagePart = z.infer<typeof MessagePartSchema>

export const MessageRoleSchema = z.enum(["user", "assistant", "system", "tool"])
export type MessageRole = z.infer<typeof MessageRoleSchema>

/** Based on AI SDK v5 `UIMessage` */
export const MessageSnapshotSchema = z.object({
  id: z.string(),
  role: MessageRoleSchema,
  parts: z.array(MessagePartSchema),
  metadata: z.record(z.unknown()).optional(),
  // Extension of AI SDK
  schemaVersion: z.literal(1),
  turnId: z.string().nullable(),
  model: z.string().nullable()
})

export type MessageSnapshot = z.infer<typeof MessageSnapshotSchema>

export type MessageRef = Omit<MessageSnapshot, "parts"> & {
  element: HTMLElement | undefined
}

export const ConversationSnapshotSchema = z.object({
  id: z.string(),
  vendor: z.string(),
  ui: z.string(),
  url: z.string(),
  ts: z.number(),
  messages: z.array(MessageSnapshotSchema)
})

export type ConversationSnapshot = z.infer<typeof ConversationSnapshotSchema>

export type ConversationRef = Omit<ConversationSnapshot, "messages"> & {
  messages: MessageRef[]
}

export const messageToSnapshot = (message: MessageRef): MessageSnapshot => {
  const { element, ...rest } = message
  const parts: MessagePart[] = []
  if (message.role === "user") {
    parts.push({
      type: "text",
      text: element.innerText,
      source: "innerText"
    })
  } else {
    parts.push({
      type: "html",
      text: element.innerHTML,
      source: "innerHTML"
    })
  }
  return { ...rest, parts }
}

export const conversationToSnapshot = (
  conversation: ConversationRef
): ConversationSnapshot => {
  const { messages, ...rest } = conversation
  return {
    ...rest,
    messages: messages.map(messageToSnapshot)
  }
}
