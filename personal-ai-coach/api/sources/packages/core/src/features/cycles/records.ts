// Client-safe wire contract. Source: docs/ONTOLOGY.md entity and derived-value tables.
// Persistence mapping belongs to record-fragment.ts; no database runtime enters this file.
import { z } from 'zod'
import { idSchema, dateSchema, timestampSchema, pageSchema } from '../../shared/schemas.js'

export const cycleSchema = z.strictObject({
  id: idSchema,
  intention: z
    .string()
    .nullable()
    .describe(
      'UI label: Intention. Optional guiding focus; the cycle is identified by its date range, not a name.',
    ),
  start_at: dateSchema.describe('UI label: Starts.'),
  end_at: dateSchema.describe('UI label: Ends.'),
  status: z.enum(['active', 'archived']),
  created_at: timestampSchema,
  url: z.url(),
  achievement_pct: z
    .number()
    .nullable()
    .describe(
      'UI label: Achievement. Derived from objective progress; unavailable when nothing is measurable.',
    ),
  time_gone_pct: z
    .number()
    .min(0)
    .max(100)
    .describe('UI label: Time gone. Derived percentage of the cycle elapsed.'),
  length_weeks: z
    .number()
    .int()
    .describe('UI label: Length, in weeks; derived from Starts and Ends.'),
})

export const cyclesFragmentSchema = z.strictObject({
  cycle: cycleSchema.nullable(),
  cycles: pageSchema(cycleSchema, 50),
})
