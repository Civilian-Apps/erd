// Client-safe wire contract. Source: docs/ONTOLOGY.md entity and derived-value tables.
// Persistence mapping belongs to record-fragment.ts; no database runtime enters this file.
import { z } from 'zod'
import { idSchema, timestampSchema, pageSchema } from '../../shared/schemas.js'

export const noteSchema = z.strictObject({
  id: idSchema,
  text: z.string().min(1),
  recorded_at: timestampSchema,
  url: z.url(),
  since_boundary: z.boolean(),
})

export const notesFragmentSchema = z.strictObject({
  notes: pageSchema(noteSchema, 50),
  selection: z.enum(['since_boundary', 'recent_fallback', 'selected', 'history']),
  total: z.number().int().nonnegative(),
})
