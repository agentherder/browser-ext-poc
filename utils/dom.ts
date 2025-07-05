/**
 * Lightweight DOM helpers shared across the extension.
 *
 * These stay dependency‑free so we don’t have to ship jQuery/Zepto.
 */

/**
 * q()
 * ---
 * Returns the **first** element that matches the first selector that
 * yields a non‑null result.  Walks the selectors in order so you can
 * express fallbacks in one call.
 *
 * Example:
 *   const modelEl = q(
 *     msgEl,
 *     "[data-message-model-slug]",
 *     "span[data-testid='model-selection']"
 *   )
 */
export const q = <T extends Element = HTMLElement>(
  root: ParentNode,
  ...selectors: string[]
): T | null => {
  for (const sel of selectors) {
    const found = root.querySelector<T>(sel)
    if (found) return found
  }
  return null
}

/**
 * qs()
 * ---
 * Like q() but returns *all* matches from the first selector that delivers
 * anything.  Handy when you need a NodeList but still want ordered fallbacks.
 */
export const qs = <T extends Element = HTMLElement>(
  root: ParentNode,
  ...selectors: string[]
): NodeListOf<T> | [] => {
  for (const sel of selectors) {
    const list = root.querySelectorAll<T>(sel)
    if (list.length) return list
  }
  return [] as unknown as NodeListOf<T>
}
