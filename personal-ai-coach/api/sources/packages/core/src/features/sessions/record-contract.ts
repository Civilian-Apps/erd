// Client-safe wire contract. Source: docs/ONTOLOGY.md entity and derived-value tables.
// Persistence mapping belongs to record-fragment.ts; no database runtime enters this file.
import { z } from 'zod'
import { idSchema, dateSchema, timestampSchema, objectiveStatusSchema, resultStatusSchema,
  actionStatusSchema, sessionTypeSchema, metricTypeSchema, cadenceSchema } from '../../contracts/input.js'
import { pageSchema } from '../../contracts/paging.js'
export const sessionSchema = z.strictObject({
 id:idSchema, vendor:z.enum(['claude','openai']), source_url:z.url().nullable(), type:sessionTypeSchema.nullable(),
 briefing_notes:z.string(), headline:z.string().nullable(), summary_notes:z.string().nullable(),
 started_at:timestampSchema, ended_at:timestampSchema.nullable(), url:z.url(),
 duration_minutes:z.number().int().nonnegative().nullable(), actions_created:z.number().int().nonnegative(), actions_reviewed:z.number().int().nonnegative(),
})
export const sessionsFragmentSchema = z.strictObject({
 sessions:pageSchema(sessionSchema,50), last_completed:sessionSchema.nullable(), open:sessionSchema.nullable(),
})
