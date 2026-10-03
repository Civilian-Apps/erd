/** Client-safe shared input primitives, pagination and result envelopes. Feature schemas stay with their owners. */
import { z } from 'zod'
export const PAGE_LIMIT_DEFAULT = 20
export const PAGE_LIMIT_MAX = 100

/** The shared list input every `list*` procedure accepts. */
export const pageInput = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.number().int().min(1).max(PAGE_LIMIT_MAX).default(PAGE_LIMIT_DEFAULT),
})
export type PageInput = z.input<typeof pageInput>



export const idSchema = z
  .string()
  .uuid()
  .describe(
    'Owned record UUID from fresh tool results or user-selected context. Never invent an ID; clarify ambiguous targets.',
  )

/** One IANA time-zone rule for every surface: sign-up, Settings and the chat profile tool. */
export const ianaTimezoneSchema = z.string().refine((value) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: value })
    return true
  } catch {
    return false
  }
}, 'Unknown IANA timezone')

export const dateSchema = z
  .string()
  .date()
  .describe('Calendar date as YYYY-MM-DD in the profile timezone.')

export const timestampSchema = z.string().datetime({ offset: true })

export const cursorSchema = z.string().min(1)

export const pageInputSchema = pageInput.strict()

export const emptyInputSchema = z.object({}).strict()

export const idInputSchema = z.object({ id: idSchema }).strict()

export const idempotencyKeySchema = z.string().min(1).max(255)

export const surfaceSchema = z.enum(['web', 'chat'])

export function pageSchema<T extends z.ZodType>(item: T, max = 100) {
  return z.strictObject({
    items: z.array(item).max(max),
    next_cursor: z.string().min(1).nullable(),
  })
}

export const collectionNameSchema = z.enum([
  'cycles',
  'objectives',
  'results',
  'actions',
  'notes',
  'sessions',
  'result_logs',
  'habit_logs',
  'action_logs',
  'trend',
])

export const continuationsSchema = z.partialRecord(collectionNameSchema, z.string().min(1))

export type CollectionName = z.infer<typeof collectionNameSchema>

export const boundarySchema = z.strictObject({
  at: timestampSchema.nullable(),
  session_id: idSchema.nullable(),
  source: z.enum(['session', 'cycle_start', 'none']),
})

export const changedSchema = z
  .array(
    z.strictObject({
      entity: z.enum([
        'user',
        'cycle',
        'objective',
        'result',
        'result_log',
        'action',
        'action_log',
        'session',
        'note',
        'habit_log',
      ]),
      id: idSchema,
    }),
  )
  .max(100)

export function writeResultSchema<T extends z.ZodType>(record: T) {
  return z.strictObject({ record, changed: changedSchema, continuations: continuationsSchema })
}

export const deleteResultSchema = z.strictObject({ id: idSchema })

/** Server-produced widget snapshot. Null data means the root is unavailable (not an invented record).
 * Totals count matching records before truncation, in the same snapshot as data; widgets never fetch them.
 */
export const widgetTotalSchema = z.number().int().nonnegative()
export function widgetSnapshotSchema<D extends z.ZodType, T extends z.ZodRawShape>(
  data: D,
  totals: T,
) {
  return z.strictObject({
    as_of: timestampSchema.describe('Server snapshot time for the stale-snapshot footer.'),
    data: data.nullable(),
    totals: z.strictObject(totals),
  })
}
