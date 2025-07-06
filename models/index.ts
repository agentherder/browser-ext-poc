export interface ConversationRef {
  id: string
  vendor: string
  ui: string
  url: string
  ts: number
  messages: MessageRef[]
}

export interface ConversationSnapshot {
  id: string
  vendor: string
  ui: string
  url: string
  ts: number
  messages: MessageSnapshot[]
}

export interface MessageRef {
  id: string
  turnId: string | null
  role: string | null
  model: string | null
  element: HTMLElement | null
}

export interface MessageSnapshot {
  id: string
  turnId: string | null
  role: string | null
  model: string | null
  innerText: string
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

export const messageToSnapshot = (message: MessageRef): MessageSnapshot => {
  const { element, ...rest } = message
  return {
    ...rest,
    innerText: element?.innerText ?? ""
  }
}
