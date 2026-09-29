/** Normative inputs: docs/ONTOLOGY.md and this feature's spec Interfaces. Client-safe. */
import { z } from 'zod'
import {
  idSchema,
  idInputSchema,
  pageInputSchema,
  sessionTypeSchema,
} from '../../contracts/input.js'
export const loadBriefingInput = z.object({ force_new: z.boolean().optional() }).strict()
export const closeSessionInput = z
  .object({
    session_id: idSchema,
    type: sessionTypeSchema,
    headline: z.string().trim().min(1).max(200),
    summary_notes: z
      .string()
      .trim()
      .min(1)
      .describe('UI document: Summary. Saved when closing the coaching session.'),
  })
  .strict()
export const listSessionsInput = pageInputSchema
export const getSessionInput = idInputSchema

// MCP transport contracts: reuse domain fields; keep handlers outside declarations.
import {
  readerPageSchema,
  continuationPageFields,
  readWindowSchema,
  resolvedReadWindowSchema,
  deletionInputSchema,
  deletionOutputSchema,
} from '../../contracts/mcp.js'
import { sessionSchema, boundarySchema } from '../../contracts/projections.js'
export const sessionListToolInput = listSessionsInput.extend({
  operation: z.literal('list'),
  window: readWindowSchema.optional(),
})
export const sessionGetToolInput = z.strictObject({
  operation: z.literal('get'),
  id: z
    .union([idSchema, z.literal('last_completed')])
    .describe(
      'Exact session UUID, or last_completed for the most recently ended session; returns null when none exists.',
    ),
})
export const sessionReadInput = z.discriminatedUnion('operation', [
  sessionListToolInput,
  sessionGetToolInput,
])
export const sessionSummarySchema = sessionSchema.omit({
  briefing_notes: true,
  summary_notes: true,
})
const sessionListToolOutput = readerPageSchema(
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
