import { q } from "~/utils/dom"

export const getPrompt = (msgEl: HTMLElement): string | null => {
  return q(msgEl, "div[data-message-author-role='user']")?.textContent ?? null
}
