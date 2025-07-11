import * as z from "zod"

import { WeakRefHTMLElementSchema } from "./ref"

export const SCHEMA_VERSION = 1

export const MessageRoleSchema = z.enum(["user", "assistant", "system"])

export type MessageRole = z.infer<typeof MessageRoleSchema>

export const MessageSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: z.string(),
  conversationId: z.string(),
  role: MessageRoleSchema,
  model: z.string().optional(),
  content: z.string(),
  source: z.enum(["innerText", "innerHTML"]).optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  element: WeakRefHTMLElementSchema.optional()
})

export type Message = z.infer<typeof MessageSchema>

export const ConversationSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: z.string(),
  platform: z.string().optional(),
  service: z.string().optional(),
  url: z.string().optional(),
  title: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number()
})

export type Conversation = z.infer<typeof ConversationSchema>
