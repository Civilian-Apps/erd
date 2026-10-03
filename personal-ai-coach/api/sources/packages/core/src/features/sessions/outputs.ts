import { widgetSnapshotSchema } from '../../shared/schemas.js'
import { z } from 'zod'
import { sessionSchema } from './records.js'
import { idSchema, timestampSchema, boundarySchema, pageSchema } from '../../shared/schemas.js'
import { briefingSchema } from '../../shared/projections.js'
import {
  resolvedReadWindowSchema,
  continuationPageFields,
  readerPageSchema,
} from '../../shared/mcp/schemas.js'
import { sessionListToolInput } from './inputs.js'

export const loadBriefingResultSchema = z.discriminatedUnion('access_state', [
  z.strictObject({
    access_state: z.literal('active'),
    session: z.strictObject({
      id: idSchema,
      started_at: timestampSchema,
      stale: z.boolean().optional(),
    }),
    briefing_notes: z.string(),
    briefing: briefingSchema,
  }),
  z.strictObject({
    access_state: z.literal('unpaid'),
    enablement: z.strictObject({ instruction: z.string(), signup_url: z.url() }),
  }),
])

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

export const sessionDocumentWidgetPayloadSchema = widgetSnapshotSchema(sessionDocumentSchema, {})
