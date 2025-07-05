export const getPrompt = (msgEl: HTMLElement): string | null => {
  return (
    msgEl
      .closest("div[data-message-author-role='assistant']")
      ?.previousElementSibling?.querySelector<HTMLElement>(
        "div[data-message-author-role='user']"
      )?.textContent ?? null
  )
}
