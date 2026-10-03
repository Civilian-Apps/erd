/** Feature-owned input schemas shared by permitted transports. */
import { z } from 'zod'
import {
  cadenceSchema,
  dateSchema,
  idInputSchema,
  idSchema,
  idempotencyKeySchema,
  metricTypeSchema,
  pageInputSchema,
  resultStatusSchema,
} from '../../contracts/input.js'
import {
  deletionInputSchema,
  readWindowSchema,
  resolvedReadWindowSchema,
} from '../../contracts/mcp.js'
const base = {
  objective_id: idSchema,
  title: z.string(),
  description: z.string().nullable().optional(),
}
const numeric = {
  start_value: z.number().finite().optional(),
  target_value: z.number().finite(),
  unit: z.string().nullable().optional(),
}
export const createResultArms = [
  z.object({ ...base, metric_type: z.literal('number'), ...numeric }).strict(),
  z
    .object({
      ...base,
      metric_type: z.literal('percentage'),
      start_value: z.number().min(0).max(100).optional(),
      target_value: z.number().min(0).max(100),
    })
    .strict(),
  z.object({ ...base, metric_type: z.literal('milestone') }).strict(),
  z
    .object({
      ...base,
      metric_type: z.literal('habit'),
      cadence: cadenceSchema,
      per: z.number().int().min(1).describe('UI label: Times per selected Cadence.'),
      since: dateSchema.optional(),
    })
    .strict(),
  z
    .object({
      ...base,
      metric_type: z.literal('performance'),
      ...numeric,
      since: dateSchema.optional(),
    })
    .strict(),
] as const
export const createResultInput = z.discriminatedUnion('metric_type', createResultArms)
export const orpcCreateResultInput = z.discriminatedUnion('metric_type', [
  createResultArms[0].extend({ idempotency_key: idempotencyKeySchema }),
  createResultArms[1].extend({ idempotency_key: idempotencyKeySchema }),
  createResultArms[2].extend({ idempotency_key: idempotencyKeySchema }),
  createResultArms[3].extend({ idempotency_key: idempotencyKeySchema }),
  createResultArms[4].extend({ idempotency_key: idempotencyKeySchema }),
])
export const updateResultInput = idInputSchema.extend({
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  objective_id: idSchema.optional(),
  metric_type: metricTypeSchema.optional(),
  target_value: z.number().finite().optional(),
  start_value: z.number().finite().nullable().optional(),
  unit: z.string().nullable().optional(),
  cadence: cadenceSchema.optional(),
  per: z.number().int().min(1).describe('UI label: Times per selected Cadence.').optional(),
  since: dateSchema.optional(),
  status: resultStatusSchema.optional(),
})
export const getResultInput = idInputSchema
export const previewResultDeletionInput = idInputSchema
export const deleteResultInput = idInputSchema.extend({
  preview_id: idSchema.describe(
    'Server impact preview ID; trusted application approval must already exist.',
  ),
})
export const createResultLogInput = z
  .object({
    result_id: idSchema,
    value: z.number().finite().optional(),
    comment: z.string().trim().min(1).optional(),
  })
  .strict()
  .refine((value) => value.value !== undefined || value.comment !== undefined, {
    message: 'A value or comment is required.',
  })
export const orpcCreateResultLogInput = createResultLogInput.safeExtend({
  idempotency_key: idempotencyKeySchema,
})
export const listResultLogsInput = pageInputSchema.extend({ result_id: idSchema })
export const clearResultLogCommentInput = idInputSchema
export const deleteResultLogInput = idInputSchema
export const setHabitLogInput = z
  .object({
    comment: z
      .string()
      .trim()
      .min(1)
      .optional()
      .describe('Optional evidence comment saved atomically with the requested habit day state.'),
    result_id: idSchema,
    day: dateSchema,
    marked: z
      .boolean()
      .describe(
        'Desired calendar state: true marks the day; false unmarks it. Not an append-only history event.',
      ),
  })
  .strict()
export const listHabitLogsInput = z
  .object({
    ...pageInputSchema.shape,
    result_id: idSchema,
    from: dateSchema.optional(),
    to: dateSchema.optional(),
  })
  .strict()
  .refine((value) => !value.from || !value.to || value.from <= value.to, {
    message: 'To must not precede from.',
    path: ['to'],
  })
export const resultWriteInput = z.discriminatedUnion('operation', [
  z.discriminatedUnion('metric_type', [
    createResultArms[0].extend({ operation: z.literal('create'), title: z.string().trim().min(1) }),
    createResultArms[1].extend({ operation: z.literal('create'), title: z.string().trim().min(1) }),
    createResultArms[2].extend({ operation: z.literal('create'), title: z.string().trim().min(1) }),
    createResultArms[3].extend({ operation: z.literal('create'), title: z.string().trim().min(1) }),
    createResultArms[4].extend({ operation: z.literal('create'), title: z.string().trim().min(1) }),
  ]),
  updateResultInput.extend({
    operation: z.literal('update'),
    title: z.string().trim().min(1).optional(),
  }),
])
export const recordResultProgressInput = z.union([
  createResultLogInput.safeExtend({ target: z.literal('result') }),
  setHabitLogInput.extend({
    target: z.literal('result'),
    comment: z.string().trim().min(1).optional(),
  }),
])
export const listResultsInput = pageInputSchema
  .extend({ objective_id: idSchema.optional() })
  .extend({
    cycle_id: idSchema
      .optional()
      .describe(
        'List results across one cycle instead of a single objective. Supply exactly one parent selector.',
      ),
    attention: z
      .enum(['never_updated', 'silent', 'unmarked'])
      .optional()
      .describe(
        'Optional briefing subset: no evidence ever, no update in the window, or habit with no mark in the window.',
      ),
    window: resolvedReadWindowSchema
      .optional()
      .describe(
        'Required for silent/unmarked attention. Use exact server-resolved briefing bounds; current result figures remain current.',
      ),
  })
  .refine(
    (value) => Boolean(value.objective_id) !== Boolean(value.cycle_id),
    'Supply exactly one of objective_id or cycle_id.',
  )
  .refine(
    (value) =>
      value.attention === 'silent' || value.attention === 'unmarked'
        ? Boolean(value.window)
        : value.window === undefined,
    'Only silent/unmarked attention requires a resolved window.',
  )
export const resultListToolInput = listResultsInput.safeExtend({ operation: z.literal('list') })
export const resultGetToolInput = getResultInput.extend({ operation: z.literal('get') })
export const resultHistoryToolInput = listResultLogsInput.extend({
  operation: z.literal('history'),
  kind: z
    .enum(['result_logs', 'habit_logs', 'trend'])
    .describe('Evidence stream to page; get returns current figures regardless of this window.'),
  window: readWindowSchema.optional(),
})
export const resultReadInput = z.discriminatedUnion('operation', [
  resultListToolInput,
  resultGetToolInput,
  resultHistoryToolInput,
])
export const resultDeleteToolInput = deletionInputSchema

export const resultHistoryInput = resultHistoryToolInput.omit({ operation: true })
