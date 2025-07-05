import { q } from "~/utils/dom"

/**
 * Best-effort grab of the model slug for an assistant message.
 * Pass the `msgEl` we already have so we can look locally first.
 */
export const getModel = (
  msgEl?: HTMLElement,
  doc: Document = document
): string | null => {
  // Attribute on the assistant wrapper (the element itself or an ancestor)
  const fromAttr = msgEl
    ?.closest<HTMLElement>("[data-message-model-slug]")
    ?.getAttribute("data-message-model-slug")
  if (fromAttr) return fromAttr

  // "Model picker" chip up in the header
  const fromHeader = q(
    doc,
    "span[data-testid='model-selection']"
  )?.textContent?.trim()
  if (fromHeader) return fromHeader

  // Future fallback(s): meta tags, embedded JSON, etc.
  const fromMeta = q(doc, "meta[name='openai-chat-model']")?.getAttribute(
    "content"
  )
  if (fromMeta) return fromMeta

  return null
}
