export function shallowPatchDBRecord<
  T extends { id: string; createdAt?: number; updatedAt?: number },
  P extends Partial<T>
>(
  db: T,
  patch: P,
  now: () => number = Date.now
): T & { createdAt: number; updatedAt: number } {
  if (db.id !== patch.id && patch.id !== undefined) {
    throw new Error("ID mismatch")
  }

  const filtered = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined)
  ) as P

  const updatedAt = filtered.updatedAt ?? now()
  const createdAt = db.createdAt ?? filtered.createdAt ?? updatedAt

  return { ...db, ...filtered, createdAt, updatedAt }
}
