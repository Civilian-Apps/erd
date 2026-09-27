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
export const resultUpdateSchema = z
  .strictObject({
    id: idSchema,
    result_id: idSchema,
    value: z.number().nullable(),
    comment: z.string().nullable(),
    session_id: idSchema.nullable(),
    recorded_at: timestampSchema,
  })
  .describe(
    'ResultUpdate is the domain/API name for evidence stored in result_logs. Value may be null for a comment-only habit entry; evidence and timestamps are immutable.',
  )
export const habitMarkSchema = z
  .strictObject({
    id: idSchema,
    result_id: idSchema,
    day: dateSchema,
    session_id: idSchema.nullable(),
    created_at: timestampSchema,
  })
  .describe(
    'HabitMark is the domain/API name for checked-day state stored in habit_logs. One row per result/day; unmarking deletes the row. This is not append-only history.',
  )
export const resultSchema = z.strictObject({
  id: idSchema,
  objective_id: idSchema,
  title: z.string(),
  description: z.string().nullable(),
  metric_type: metricTypeSchema,
  start_value: z.number().nullable(),
  target_value: z.number().nullable(),
  unit: z.string().nullable(),
  cadence: cadenceSchema.nullable(),
  per: z.number().int().positive().nullable(),
  since: dateSchema.nullable(),
  status: resultStatusSchema,
  created_at: timestampSchema,
  short_code: z.string().min(1),
  url: z.url(),
  current_value: z.number(),
  boundary_value: z.number(),
  progress_pct: z.number().nullable(),
  boundary_progress_pct: z.number().nullable(),
  movement: z.number().nullable(),
  movement_pp: z.number().nullable(),
  // Null movement means no evidence/no movement; actual zero evidence remains a number.
  evidence_count: z.number().int().nonnegative(),
  last_recorded_at: timestampSchema.nullable(),
  habit_expected_since_boundary: z.number().int().nonnegative().nullable(),
  habit_marks_since_boundary: z.number().int().nonnegative().nullable(),
  performance_share: z.number().nullable(),
})
export const trendPointSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('value'),
    at: timestampSchema,
    value: z.number(),
    pace: z.number(),
  }),
  z.strictObject({
    kind: z.literal('habit'),
    from: dateSchema,
    to: dateSchema,
    actual: z.number().int(),
    expected: z.number(),
    expected_full: z.number(),
  }),
  z.strictObject({
    kind: z.literal('performance'),
    id: idSchema,
    at: timestampSchema,
    value: z.number(),
    target: z.number(),
    gap: z.number(),
    share: z.number().nullable(),
  }),
])
export const resultsFragmentSchema = z.strictObject({
  results: pageSchema(resultSchema, 50),
  updates: pageSchema(resultUpdateSchema, 50),
  marks: pageSchema(habitMarkSchema, 50),
})
