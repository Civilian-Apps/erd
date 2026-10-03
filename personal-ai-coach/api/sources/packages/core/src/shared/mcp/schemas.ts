/** Client-safe MCP wire schemas. Keep feature and tool-definition dependencies out of this module. */
import { z, type ZodType } from 'zod'
import { dateSchema, timestampSchema, idSchema, pageInputSchema, pageSchema } from '../schemas.js'

/** Dates resolve in the profile timezone; timestamps identify instants. Mixed bounds resolve server-side. */
const windowBound = z.union([dateSchema, timestampSchema])

export const readWindowSchema = z
  .strictObject({
    since: z
      .union([windowBound, z.enum(['last_session', 'cycle_start'])])
      .optional()
      .describe(
        'Inclusive lower bound. Default: last completed session, falling back to active-cycle start. Date-only values use the profile timezone.',
      ),
    until: windowBound
      .optional()
      .describe('Exclusive upper bound; default is the server time captured on the first page.'),
  })
  .refine(
    ({ since, until }) => {
      if (!since || !until || since === 'last_session' || since === 'cycle_start') return true
      if (since.length === 10 && until.length === 10) return since < until
      if (since.length > 10 && until.length > 10) return Date.parse(since) < Date.parse(until)
      return true // Resolve unlike bound types with the owned profile's timezone in the service.
    },
    { path: ['until'], message: 'until must be after since.' },
  )

export const resolvedReadWindowSchema = z
  .strictObject({
    since: timestampSchema,
    until: timestampSchema,
  })
  .refine(
    (value) => Date.parse(value.since) < Date.parse(value.until),
    'Read window must be increasing.',
  )

/** A cursor does not change filters/ordering/window. The continuation supplies the complete next call. */
export function readerPageSchema<T extends z.ZodType, A extends z.ZodType>(
  item: T,
  tool: string,
  args: A,
  max = 100,
) {
  return pageSchema(item, max)
    .extend({
      continuation: z.strictObject({ tool: z.literal(tool), arguments: args }).nullable(),
    })
    .refine(
      (value) => (value.next_cursor === null) === (value.continuation === null),
      'A next cursor and executable continuation must be present together.',
    )
    .refine((value) => {
      if (!value.continuation) return true
      const continuation: unknown = value.continuation
      if (
        typeof continuation !== 'object' ||
        continuation === null ||
        !('arguments' in continuation)
      )
        return false
      const args: unknown = continuation.arguments
      return (
        typeof args === 'object' &&
        args !== null &&
        'cursor' in args &&
        args.cursor === value.next_cursor
      )
    }, 'Continuation arguments must carry the returned next cursor.')
}

export const continuationPageFields = {
  cursor: z.string().min(1),
  limit: pageInputSchema.shape.limit.removeDefault(),
}

export const deletionInputSchema = z.discriminatedUnion('operation', [
  z.strictObject({
    operation: z.literal('preview'),
    id: idSchema.describe(
      'Exact owned record UUID. Resolve ambiguous targets before requesting impact.',
    ),
  }),
  z.strictObject({
    operation: z.literal('commit'),
    id: idSchema,
    preview_id: idSchema.describe(
      'Server preview ID for this target. Not consent: genuine approval must already be recorded by the trusted application.',
    ),
  }),
])

/** Impact must be complete, actor-bound and revalidated at commit; no unknown/missing count is allowed. */
export function deletionOutputSchema<T extends z.ZodType, C extends z.ZodRawShape>(
  target: T,
  counts: C,
) {
  return z.discriminatedUnion('operation', [
    z.strictObject({
      operation: z.literal('preview'),
      preview_id: idSchema,
      expires_at: timestampSchema,
      target,
      deleted: z.strictObject(counts),
      approval: z.strictObject({ status: z.literal('required'), url: z.url() }),
    }),
    z.strictObject({ operation: z.literal('commit'), id: idSchema }),
  ])
}
