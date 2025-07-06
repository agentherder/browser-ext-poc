import { qa } from "~utils/dom"

export type MessageInfo = {
  turnId: string | null
  messageId: string | null
  role: string | null
  model: string | null
  element: HTMLElement | null
}

export const getChatgptDocumentMessages = (
  doc: ParentNode = document
): MessageInfo[] => {
  const turns = qa(doc, "[data-testid^='conversation-turn-']")
  if (!turns.length) return getNodeMessages(doc)
  const msgInfos: MessageInfo[] = []
  for (const turnEl of turns) {
    msgInfos.push(...getNodeMessages(turnEl))
  }
  return msgInfos
}

const getNodeMessages = (parentNode: ParentNode): MessageInfo[] => {
  const testId = (parentNode as HTMLElement).getAttribute("data-testid")
  const turnId = testId?.includes("turn") ? testId : null
  const msgEls = qa(
    parentNode,
    "[data-message-id]",
    "[data-message-author-role]"
  )
  const msgInfos: MessageInfo[] = []
  for (const msgEl of msgEls) {
    msgInfos.push({
      turnId,
      messageId: msgEl.getAttribute("data-message-id"),
      role: msgEl.getAttribute("data-message-author-role"),
      model: msgEl.getAttribute("data-message-model-slug"),
      element: msgEl instanceof HTMLElement ? msgEl : null
    })
  }
  return msgInfos
}
