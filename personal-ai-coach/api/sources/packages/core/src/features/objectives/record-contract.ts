// Client-safe wire contract. Source: docs/ONTOLOGY.md entity and derived-value tables.
// Persistence mapping belongs to record-fragment.ts; no database runtime enters this file.
import { z } from 'zod'
import { idSchema, dateSchema, timestampSchema, objectiveStatusSchema, resultStatusSchema,
  actionStatusSchema, sessionTypeSchema, metricTypeSchema, cadenceSchema } from '../../contracts/input.js'
import { pageSchema } from '../../contracts/paging.js'
export const objectiveSchema = z.strictObject({
 id: idSchema, cycle_id: idSchema, title: z.string(), description: z.string(), deadline_at: dateSchema.nullable(),
 status: objectiveStatusSchema, created_at: timestampSchema, short_code: z.string().min(1), url: z.url(),
 progress_pct: z.number().nullable(), boundary_progress_pct: z.number().nullable(), movement_pp: z.number().nullable(),
})
export const objectivesFragmentSchema = pageSchema(objectiveSchema,50)
