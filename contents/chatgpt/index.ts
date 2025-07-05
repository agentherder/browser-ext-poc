import type { PlasmoCSConfig } from "plasmo"

import { getConversationId } from "./id"
import { getModel } from "./model"
import { getPrompt } from "./prompt"

const STREAM_DEBOUNCE_MS = 800

export type CaptureDetail = {
  vendor: "openai"
  url: string
  ts: number
  model: string | null
  conversationId: string | null
  prompt: string | null
  response: string | null
}

export const config: PlasmoCSConfig = {
  matches: ["https://chatgpt.com/*", "https://chat.openai.com/*"]
}

/**
 * Emit a capture event once the assistant’s response has fully streamed.
 * We debounce DOM mutations inside the assistant message: if no changes
 * occur for 800 ms, we assume the stream is complete.
 */
const emitCapture = (msgEl: HTMLElement) => {
  const detail: CaptureDetail = {
    vendor: "openai",
    url: window.location.href,
    ts: Date.now(),
    model: getModel(msgEl),
    conversationId: getConversationId(),
    prompt: getPrompt(msgEl),
    response: msgEl.textContent
  }
  console.log("Captured", detail)
  window.dispatchEvent(new CustomEvent("AgentHerderCapture", { detail }))
}

const bodyObserver = new MutationObserver((muts) => {
  for (const m of muts) {
    for (const node of m.addedNodes) {
      const msgEl = node as HTMLElement | undefined

      // Only track new assistant messages
      if (msgEl?.matches?.("div[data-message-author-role='assistant']")) {
        let debounceTimer: ReturnType<typeof setTimeout> | undefined

        const msgObserver = new MutationObserver(() => {
          if (debounceTimer) clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => {
            emitCapture(msgEl)
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
