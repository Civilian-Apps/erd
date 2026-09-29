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
export const resultLogSchema = z
  .strictObject({
    id: idSchema,
    result_id: idSchema,
    value: z.number().nullable(),
    comment: z.string().nullable(),
    session_id: idSchema.nullable(),
    recorded_at: timestampSchema,
  })
  .describe(
    'Result log stored in result_logs. The UI shows value entries under Updates and their non-empty comments under Comments. Value may be null for a comment-only habit entry; evidence and timestamps are immutable.',
  )
export const habitLogSchema = z
  .strictObject({
    id: idSchema,
    result_id: idSchema,
    day: dateSchema,
    session_id: idSchema.nullable(),
    created_at: timestampSchema,
  })
  .describe(
    'Habit log stored in habit_logs. The UI marks calendar days and lists them under Updates with the Marked column. One row per result/day; unmarking deletes the row. This is not append-only history.',
  )
export const resultSchema = z.strictObject({
  id: idSchema,
  objective_id: idSchema,
  title: z.string(),
  description: z.string().nullable(),
  metric_type: metricTypeSchema,
  start_value: z
    .number()
    .nullable()
    .describe('UI label: Start. Metric baseline; habit baselines are derived rather than stored.'),
  target_value: z
    .number()
    .nullable()
    .describe(
      'UI label: Target; shown as Goal on the trend chart. Habit target is derived rather than stored.',
    ),
  unit: z.string().nullable().describe('UI label: Unit. Used by Number and Performance results.'),
  cadence: cadenceSchema.nullable(),
  per: z
    .number()
    .int()
    .positive()
    .nullable()
    .describe('UI label: Times. Habit frequency within the selected Cadence.'),
  since: dateSchema
    .nullable()
    .describe(
      'Measurement start date for Habit and Performance; distinct from the last-session movement boundary.',
    ),
  status: resultStatusSchema,
  created_at: timestampSchema,
  short_code: z.string().min(1),
  url: z.url(),
  current_value: z
    .number()
    .describe(
      'Current value displayed in the result headline; derived according to metric type from its baseline and retained evidence.',
    ),
  boundary_value: z.number(),
  progress_pct: z.number().nullable(),
  boundary_progress_pct: z.number().nullable(),
  movement: z.number().nullable(),
  movement_pp: z.number().nullable(),
  // Null movement means no evidence/no movement; actual zero evidence remains a number.
  evidence_count: z.number().int().nonnegative(),
  last_recorded_at: timestampSchema.nullable(),
  habit_expected_since_boundary: z.number().int().nonnegative().nullable(),
  habit_logs_since_boundary: z.number().int().nonnegative().nullable(),
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
  result_logs: pageSchema(resultLogSchema, 50),
  habit_logs: pageSchema(habitLogSchema, 50),
})
