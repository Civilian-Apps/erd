import { z } from 'zod'
import {
  habitLogSchema,
  resultLogSchema,
  resultSchema,
  trendPointSchema,
  resultIdentitySchema,
} from './records.js'
import { idSchema, changedSchema, pageSchema } from '../../shared/schemas.js'
import {
  continuationPageFields,
  deletionOutputSchema,
  readerPageSchema,
  resolvedReadWindowSchema,
} from '../../shared/mcp/schemas.js'
import { resultHistoryToolInput, resultListToolInput } from './inputs.js'

export const resultListToolOutput = readerPageSchema(
  resultSchema,
  'result_read',
  resultListToolInput.safeExtend(continuationPageFields),
).safeExtend({ operation: z.literal('list') })

export const resultReadOutput = z.union([
  resultListToolOutput,
  z.strictObject({ operation: z.literal('get'), result: resultSchema }),
  readerPageSchema(
    resultLogSchema,
    'result_read',
    resultHistoryToolInput.extend({
      ...continuationPageFields,
      kind: z.literal('result_logs'),
      window: resolvedReadWindowSchema,
    }),
  ).safeExtend({
    operation: z.literal('history'),
    kind: z.literal('result_logs'),
    result_id: idSchema,
    window: resolvedReadWindowSchema,
  }),
  readerPageSchema(
    habitLogSchema,
    'result_read',
    resultHistoryToolInput.extend({
      ...continuationPageFields,
      kind: z.literal('habit_logs'),
      window: resolvedReadWindowSchema,
    }),
  ).safeExtend({
    operation: z.literal('history'),
    kind: z.literal('habit_logs'),
    result_id: idSchema,
    window: resolvedReadWindowSchema,
  }),
  readerPageSchema(
    trendPointSchema,
    'result_read',
    resultHistoryToolInput.extend({
      ...continuationPageFields,
      kind: z.literal('trend'),
      window: resolvedReadWindowSchema,
    }),
  ).safeExtend({
    operation: z.literal('history'),
    kind: z.literal('trend'),
    result_id: idSchema,
    window: resolvedReadWindowSchema,
  }),
])

export const resultMutationOutput = z.strictObject({ result: resultSchema, changed: changedSchema })

export const resultDeleteToolOutput = deletionOutputSchema(resultIdentitySchema, {
  results: z.literal(1),
  result_logs: z.number().int().nonnegative(),
  habit_logs: z.number().int().nonnegative(),
})

export const resultDeletionPreviewSchema = resultDeleteToolOutput.options[0]

export const resultHistorySchema = z.discriminatedUnion('kind', [
  pageSchema(resultLogSchema).extend({
    kind: z.literal('result_logs'),
    result_id: idSchema,
    window: resolvedReadWindowSchema,
  }),
  pageSchema(habitLogSchema).extend({
    kind: z.literal('habit_logs'),
    result_id: idSchema,
    window: resolvedReadWindowSchema,
  }),
  pageSchema(trendPointSchema).extend({
    kind: z.literal('trend'),
    result_id: idSchema,
    window: resolvedReadWindowSchema,
  }),
])
