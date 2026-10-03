import { z } from 'zod'
import { timestampSchema } from '../../contracts/input.js'
import { resolvedReadWindowSchema } from '../../contracts/mcp.js'
import { boundarySchema } from '../../contracts/outputs.js'
import { pageSchema } from '../../contracts/paging.js'
import { sessionSchema } from './record-contract.js'
/** Feature-owned response schemas; no execution imports. */
import { continuationPageFields, readerPageSchema } from '../../contracts/mcp.js'
import { sessionListToolInput } from './inputs.js'
export const sessionSummarySchema = sessionSchema.omit({
  briefing_notes: true,
  summary_notes: true,
})
export const sessionListToolOutput = readerPageSchema(
  sessionSummarySchema,
  'session_read',
  sessionListToolInput.extend({
    ...continuationPageFields,
    window: resolvedReadWindowSchema.optional(),
  }),
).safeExtend({
  operation: z.literal('list'),
  window: resolvedReadWindowSchema.nullable(),
  boundary: boundarySchema,
})
export const sessionReadOutput = z.union([
  sessionListToolOutput,
  z.strictObject({
    operation: z.literal('get'),
    session: sessionSchema.nullable(),
    boundary: boundarySchema,
  }),
])

export const sessionDocumentSchema = z.strictObject({
  session: sessionSchema,
  document: z.enum(['briefing', 'summary']),
  text: z.string().nullable(),
})

export const closeSessionResultSchema = z.strictObject({
  session: sessionSchema,
  boundary_moved_to: timestampSchema,
})

export const storedSessionSchema = z.strictObject({
  session: sessionSchema.nullable(),
  boundary: boundarySchema,
})

export const sessionListServiceSchema = pageSchema(sessionSchema).extend({
  window: resolvedReadWindowSchema.nullable(),
  boundary: boundarySchema,
})
