import type { PlasmoCSConfig } from "plasmo"

export type CaptureDetail = {
  vendor: "openai"
  model?: string
  url: string
  chatId?: string | undefined
  prompt?: string
  response?: string
  ts: number
}

export const config: PlasmoCSConfig = {
  matches: ["https://chatgpt.com/*", "https://chat.openai.com/*"]
}

const chatPattern = /^\/c\/([^\/?#]+)(?=\/|$)/

export const getChatId = (
  loc: Location = window.location
): string | undefined => {
  const m = chatPattern.exec(loc.pathname)
  return m ? decodeURIComponent(m[1]) : undefined
}

/**
 * Emit a capture event once the assistant’s response has fully streamed.
 * We debounce DOM mutations inside the assistant message: if no changes
 * occur for 800 ms, we assume the stream is complete.
 */
const emitCapture = (msgEl: HTMLElement) => {
  const detail: CaptureDetail = {
    vendor: "openai",
    model: document.querySelector("span[data-testid='model-selection']")
      ?.textContent,
    url: window.location.href,
    chatId: getChatId(),
    prompt: msgEl.previousElementSibling?.textContent,
    response: msgEl.textContent,
    ts: Date.now()
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
          }, 800) // 0.8 s of inactivity = finished
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
