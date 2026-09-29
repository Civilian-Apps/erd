// Client-safe wire contract. Source: docs/ONTOLOGY.md entity and derived-value tables.
// Persistence mapping belongs to record-fragment.ts; no database runtime enters this file.
import { z } from 'zod'
import {
  idSchema,
  dateSchema,
  timestampSchema,
  objectiveStatusSchema,
  resultStatusSchema,
  actionStatusSchema,
  sessionTypeSchema,
  metricTypeSchema,
  cadenceSchema,
} from '../../contracts/input.js'
import { pageSchema } from '../../contracts/paging.js'
export const actionSchema = z.strictObject({
  id: idSchema,
  cycle_id: idSchema,
  objective_id: idSchema.nullable(),
  title: z.string(),
  description: z.string().nullable(),
  due_at: dateSchema
    .nullable()
    .describe('UI label: Due. May be unset on a web draft; a set date cannot be cleared.'),
  status: actionStatusSchema,
  sort_order: z
    .number()
    .nullable()
    .describe('Drag order within an action group; not a progress status.'),
  session_id: idSchema.nullable(),
  created_at: timestampSchema,
  url: z.url(),
  overdue: z.boolean(),
  done_since_boundary: z.boolean(),
})
export const actionLogSchema = z
  .strictObject({
    id: idSchema,
    action_id: idSchema,
    status: actionStatusSchema,
    comment: z.string().nullable(),
    session_id: idSchema.nullable(),
    recorded_at: timestampSchema,
  })
  .describe(
    'Action log stored in action_logs. Records a status observation and optional comment. Action detail shows Comments, a filtered view rather than the complete status history; status and timestamps are immutable, and only the comment may be cleared.',
  )
export const actionsFragmentSchema = z.strictObject({
  actions: pageSchema(actionSchema, 50),
  action_logs: pageSchema(actionLogSchema, 50),
})
