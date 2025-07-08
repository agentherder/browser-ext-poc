import type { PlasmoCSConfig } from "plasmo"

import { messageToSnapshot, type ConversationSnapshot } from "~models"

import { getChatgptConversationId } from "./id"
import { getChatgptDocumentMessages } from "./messages"

const STREAM_DEBOUNCE_MS = 800

export const config: PlasmoCSConfig = {
  matches: ["https://chatgpt.com/*", "https://chat.openai.com/*"]
}

const emitCapture = () => {
  const messages = getChatgptDocumentMessages()
  const detail: ConversationSnapshot = {
    id: getChatgptConversationId(),
    vendor: "openai",
    ui: "chatgpt",
    url: window.location.href,
    ts: Date.now(),
    messages: messages.map(messageToSnapshot)
  }
  console.log("Captured", detail)
  window.dispatchEvent(new CustomEvent("AgentHerderCapture", { detail }))
}

const bodyObserver = new MutationObserver((muts) => {
  for (const m of muts) {
    for (const node of m.addedNodes) {
      const msgEl = node as HTMLElement | undefined

      // Only track new assistant messages
      if (msgEl?.matches?.("[data-message-author-role='assistant']")) {
        // Estimate stream completion by debouncing DOM mutations
        let debounceTimer: ReturnType<typeof setTimeout> | undefined

        const msgObserver = new MutationObserver(() => {
          if (debounceTimer) clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => {
            emitCapture()
            msgObserver.disconnect()
          }, STREAM_DEBOUNCE_MS)
        })

        msgObserver.observe(msgEl, {
          subtree: true,
          childList: true,
          characterData: true
        })
      }
    }
  }
})

bodyObserver.observe(document.body, { subtree: true, childList: true })
addEventListener("beforeunload", () => bodyObserver.disconnect())
