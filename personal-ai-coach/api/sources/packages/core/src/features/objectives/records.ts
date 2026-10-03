// Client-safe wire contract. Source: docs/ONTOLOGY.md entity and derived-value tables.
// Persistence mapping belongs to record-fragment.ts; no database runtime enters this file.
import { z } from 'zod'
import { idSchema, dateSchema, timestampSchema, pageSchema } from '../../shared/schemas.js'

export const objectiveStatusSchema = z
  .enum(['on_track', 'off_track', 'completed'])
  .describe(
    'Objective status: On track, Off track or Completed. Coaching judgment, independent of the derived Progress percentage.',
  )

export const objectiveSchema = z.strictObject({
  id: idSchema,
  cycle_id: idSchema,
  title: z.string(),
  description: z.string(),
  deadline_at: dateSchema
    .nullable()
    .describe('UI label: Deadline; null when no deadline has been set.'),
  status: objectiveStatusSchema,
  created_at: timestampSchema,
  short_code: z.string().min(1),
  url: z.url(),
  progress_pct: z
    .number()
    .nullable()
    .describe('UI label: Progress. Derived from measurable results, independently of Status.'),
  boundary_progress_pct: z
    .number()
    .nullable()
    .describe('Historical progress at the resolved last-session boundary; not current Progress.'),
  movement_pp: z.number().nullable(),
})

export const objectivesFragmentSchema = pageSchema(objectiveSchema, 50)
