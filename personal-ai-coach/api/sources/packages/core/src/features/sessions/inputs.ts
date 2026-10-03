/** Feature-owned input schemas shared by permitted transports. */
import { z } from 'zod'
import { idInputSchema, idSchema, pageInputSchema } from '../../shared/schemas.js'
import { sessionTypeSchema } from './records.js'
import { readWindowSchema } from '../../shared/mcp/schemas.js'

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

export const listSessionsInput = pageInputSchema.extend({ window: readWindowSchema.optional() })

export const getSessionInput = idInputSchema

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

export const readStoredSessionInput = sessionGetToolInput.omit({ operation: true })
