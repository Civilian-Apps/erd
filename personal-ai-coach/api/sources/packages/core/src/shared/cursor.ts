// Keyset cursor (AD-05) — the ONE mechanism behind every `list*` page and every
// `continuations` entry on a write-result or detail record (AD-14). Client-safe
// (no I/O): the web reads `next_cursor` opaquely and hands it back; only the
// server decodes.
//
// Shape: an opaque base64url of `{ sortKey, id }`, where `sortKey` is the
// ORDER BY column serialised as a string (ISO timestamp or numeric string) and
// `id` is the uuid tiebreaker. Never an offset: these are append-heavy
// timelines where an insert between two fetches would make an offset window
// duplicate or skip a row (proof #25).
//
// Usage in a fragment / list procedure:
//   const page = parsePageInput(input)                    // limit 20, cap 100
//   ... WHERE (recorded_at, id) < ($after.sortKey, $after.id)
//       ORDER BY recorded_at DESC, id DESC LIMIT page.limit + 1
//   return toPage(rows, page.limit, (r) => ({ sortKey: r.recordedAt.toISOString(), id: r.id }))

import { z } from 'zod'

export const cursorTuple = z.object({
  sortKey: z.string().min(1),
  id: z.string().uuid(),
})
export type CursorTuple = z.infer<typeof cursorTuple>

export const PAGE_LIMIT_DEFAULT = 20
export const PAGE_LIMIT_MAX = 100

/** The shared list input every `list*` procedure accepts. */
export const pageInput = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.number().int().min(1).max(PAGE_LIMIT_MAX).default(PAGE_LIMIT_DEFAULT),
})
export type PageInput = z.input<typeof pageInput>

/** The shared page shape every `list*` procedure returns. */
export type Page<T> = { items: T[]; next_cursor: string | null }

export function encodeCursor(tuple: CursorTuple): string {
  return Buffer.from(JSON.stringify(cursorTuple.parse(tuple)), 'utf8').toString('base64url')
}

export class InvalidCursorError extends Error {
  readonly error_code = 'INVALID_CURSOR' as const
  constructor() {
    super('cursor is not a valid page cursor')
    this.name = 'InvalidCursorError'
  }
}

/** Decode a cursor; a malformed or tampered cursor is a typed client error. */
export function decodeCursor(cursor: string): CursorTuple {
  let parsed: unknown
  try {
    parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'))
  } catch {
    throw new InvalidCursorError()
  }
  const result = cursorTuple.safeParse(parsed)
  if (!result.success) throw new InvalidCursorError()
  return result.data
}

/** Parse `{ cursor?, limit? }` into `{ after, limit }` for the query. */
export function parsePageInput(input: PageInput = {}): {
  after: CursorTuple | null
  limit: number
} {
  const { cursor, limit } = pageInput.parse(input)
  return { after: cursor ? decodeCursor(cursor) : null, limit }
}

/**
 * Turn `limit + 1` fetched rows into a page: the extra row (if present) proves
 * there is more, and the LAST RETURNED row becomes the cursor.
 */
export function toPage<T>(rows: T[], limit: number, keyOf: (row: T) => CursorTuple): Page<T> {
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const last = items[items.length - 1]
  return { items, next_cursor: hasMore && last ? encodeCursor(keyOf(last)) : null }
}
