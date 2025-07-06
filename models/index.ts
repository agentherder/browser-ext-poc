import * as z from "zod"

/** Based on AI SDK v5 `TextUIPart` */
export const TextPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  // Extension of AI SDK
  source: z.enum(["innerHTML", "innerText", "copyButton"]).optional()
})

/** Based on AI SDK v5 `UIMessagePart` */
export const MessagePartSchema = z.discriminatedUnion("type", [TextPartSchema])

export type MessagePart = z.infer<typeof MessagePartSchema>

/** Based on AI SDK v5 `UIMessage` */
export const MessageSnapshotSchema = z.object({
  id: z.string(),
  role: z.string().optional(),
  parts: z.array(MessagePartSchema),
  // Extension of AI SDK
  turnId: z.string().optional(),
  model: z.string().optional()
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
      type: "text",
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
