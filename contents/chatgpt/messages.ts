import { MessageRoleSchema, type MessageRef } from "~models"
import { qa } from "~utils/dom"

export const getChatgptDocumentMessages = (
  doc: ParentNode = document
): MessageRef[] => {
  const turns = qa(doc, "[data-testid^='conversation-turn-']")
  if (!turns?.length) return getNodeMessages(doc)
  const msgInfos: MessageRef[] = []
  for (const turnEl of turns) {
    msgInfos.push(...getNodeMessages(turnEl))
  }
  return msgInfos
}

const getNodeMessages = (parentNode: ParentNode): MessageRef[] => {
  const testId = (parentNode as HTMLElement).getAttribute("data-testid")
  const turnId = testId?.includes("turn") ? testId : null
  const msgEls = qa(parentNode, "[data-message-id]")
  const msgInfos: MessageRef[] = []
  if (!msgEls) return msgInfos
  for (const msgEl of msgEls) {
    const id = msgEl.getAttribute("data-message-id")
    if (!id) continue
    const roleString = msgEl.getAttribute("data-message-author-role")
    const role = MessageRoleSchema.safeParse(roleString).data
    if (!role) continue
    msgInfos.push({
      id,
      turnId,
      role,
      model: msgEl.getAttribute("data-message-model-slug"),
      element: msgEl instanceof HTMLElement ? msgEl : null
    })
  }
  return msgInfos
}
