import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://chatgpt.com/*"]
}

/**
 * Emit a capture event once the assistant’s response has fully streamed.
 * We debounce DOM mutations inside the assistant message: if no changes
 * occur for 800 ms, we assume the stream is complete.
 */
const emitCapture = (msgEl: HTMLElement) => {
  const model = document.querySelector(
    "span[data-testid='model-selection']"
  )?.textContent
  const prompt = msgEl.previousElementSibling?.textContent
  const response = msgEl.textContent
  const detail = {
    vendor: "openai",
    model,
    prompt,
    response,
    ts: Date.now()
  }
  console.log("Captured", detail)
  window.dispatchEvent(new CustomEvent("AgentHerderCapture", { detail }))
}

const bodyObserver = new MutationObserver((muts) => {
  for (const m of muts) {
    const msgEl = m.addedNodes[0] as HTMLElement | undefined

    // Only track new assistant messages
    if (msgEl?.matches?.("div[data-message-author-role='assistant']")) {
      let debounceTimer: ReturnType<typeof setTimeout>

      const msgObserver = new MutationObserver(() => {
        // Reset the timer on every DOM mutation inside the message
        clearTimeout(debounceTimer)
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
})

bodyObserver.observe(document.body, { subtree: true, childList: true })
