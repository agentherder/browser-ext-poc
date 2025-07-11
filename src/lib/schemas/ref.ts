import * as z from "zod"

function isWeakRefHTMLElement(val: unknown): val is WeakRef<HTMLElement> {
  return (
    typeof WeakRef !== "undefined" &&
    val instanceof WeakRef &&
    val.deref() instanceof HTMLElement
  )
}

export const WeakRefHTMLElementSchema = z.custom<WeakRef<HTMLElement>>(
  isWeakRefHTMLElement,
  { message: "Must be WeakRef<HTMLElement>" }
)
