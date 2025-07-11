import { qa } from "~lib/dom"
import { MessageRoleSchema, SCHEMA_VERSION, type Message } from "~lib/schemas"

export const scrapeChatgptMessages = (
  conversationId: string,
  doc: ParentNode = document,
  now: () => number = Date.now
): Message[] => {
  const turns = qa(doc, "[data-testid^='conversation-turn-']")
  if (!turns?.length) {
    return scrapeNodeMessages(conversationId, doc, now)
  }
  const messages: Message[] = []
  for (const turnEl of turns) {
    messages.push(...scrapeNodeMessages(conversationId, turnEl, now))
  }
  return messages
}

const scrapeNodeMessages = (
  conversationId: string,
  parentNode: ParentNode,
  now: () => number
): Message[] => {
  const msgEls = qa(parentNode, "[data-message-id]")
  const messages: Message[] = []
  if (!msgEls) return messages
  for (const msgEl of msgEls) {
    const id = msgEl.getAttribute("data-message-id")
    if (!id) continue
    const roleString = msgEl.getAttribute("data-message-author-role")
    const role = MessageRoleSchema.safeParse(roleString).data
    if (!role) continue
    const createdAt = now()
    messages.push({
      schemaVersion: SCHEMA_VERSION,
      id,
      conversationId,
      role,
      model: msgEl.getAttribute("data-message-model-slug") ?? undefined,
      content: (role === "user" ? msgEl.textContent : msgEl.innerHTML) ?? "",
      source: role === "user" ? "innerText" : "innerHTML",
      element: msgEl instanceof HTMLElement ? new WeakRef(msgEl) : undefined,
      createdAt,
      updatedAt: createdAt
    })
  }
  return messages
}
