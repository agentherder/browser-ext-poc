/**
 * Lightweight DOM helpers shared across the extension.
 *
 * Dependency free.
 */

/**
 * Fallback query selector
 *
 * Applies `parent.querySelector` for each selector,
 * returning the first match.
 */
export const q = <T extends Element = Element>(
  parent: ParentNode | null,
  ...selectors: string[]
): T | null => {
  for (const sel of selectors) {
    const found = parent?.querySelector<T>(sel)
    if (found) return found
  }
  return null
}

/**
 * Fallback query all selector
 *
 * Applies `parent.querySelectorAll` for each selector,
 * returning the first match that is not empty.
 */
export const qa = <T extends Element = Element>(
  parent: ParentNode | null,
  ...selectors: string[]
): NodeListOf<T> | null => {
  for (const sel of selectors) {
    const found = parent?.querySelectorAll<T>(sel)
    if (found?.length) return found
  }
  return null
}

/**
 * Fallback closest selector
 *
 * Applies `el.closest` for each selector,
 * returning the first match.
 */
export const qc = <T extends Element = Element>(
  el: Element | null,
  ...selectors: string[]
): T | null => {
  for (const sel of selectors) {
    const found = el?.closest<T>(sel)
    if (found) return found
  }
  return null
}
