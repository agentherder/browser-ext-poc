import type { MessageRef } from "~models"
import { qa } from "~utils/dom"

export const getChatgptDocumentMessages = (
  doc: ParentNode = document
): MessageRef[] => {
  const turns = qa(doc, "[data-testid^='conversation-turn-']")
  if (!turns.length) return getNodeMessages(doc)
  const msgInfos: MessageRef[] = []
  for (const turnEl of turns) {
    msgInfos.push(...getNodeMessages(turnEl))
  }
  return msgInfos
}

const getNodeMessages = (parentNode: ParentNode): MessageRef[] => {
  const testId = (parentNode as HTMLElement).getAttribute("data-testid")
  const turnId = testId?.includes("turn") ? testId : undefined
  const msgEls = qa(parentNode, "[data-message-id]")
  const msgInfos: MessageRef[] = []
  for (const msgEl of msgEls) {
    msgInfos.push({
      id: msgEl.getAttribute("data-message-id"),
      turnId,
      role: msgEl.getAttribute("data-message-author-role") ?? undefined,
      model: msgEl.getAttribute("data-message-model-slug") ?? undefined,
      element: msgEl instanceof HTMLElement ? msgEl : undefined
    })
  }
  return msgInfos
}
