// Client-safe wire contract. Source: docs/ONTOLOGY.md entity and derived-value tables.
// Persistence mapping belongs to record-fragment.ts; no database runtime enters this file.
import { z } from 'zod'
import { idSchema, dateSchema, timestampSchema, objectiveStatusSchema, resultStatusSchema,
  actionStatusSchema, sessionTypeSchema, metricTypeSchema, cadenceSchema } from '../../contracts/input.js'
import { pageSchema } from '../../contracts/paging.js'
export const cycleSchema = z.strictObject({
 id: idSchema, intention: z.string().nullable(), start_at: dateSchema, end_at: dateSchema,
 status: z.enum(['active','archived']), created_at: timestampSchema, url: z.url(),
 achievement_pct: z.number().nullable(), time_gone_pct: z.number().min(0).max(100), length_weeks: z.number().int(),
})
export const cyclesFragmentSchema = z.strictObject({ cycle: cycleSchema.nullable(), cycles: pageSchema(cycleSchema,50) })
