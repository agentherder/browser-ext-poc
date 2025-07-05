import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://chatgpt.com/*"]
}

const observer = new MutationObserver((muts) => {
  for (const m of muts) {
    const done = m.addedNodes[0] as HTMLElement | undefined
    if (done?.matches?.("div[data-message-author-role='assistant']")) {
      const model = document.querySelector(
        "span[data-testid='model-selection']"
      )?.textContent
      const prompt = done.previousElementSibling?.textContent
      const response = done.textContent
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
  }
})
observer.observe(document.body, { subtree: true, childList: true })
