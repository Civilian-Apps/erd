import { z } from 'zod'
import { idSchema, timestampSchema } from './input.js'
import { continuationsSchema } from './paging.js'

export const boundarySchema = z.strictObject({
  at: timestampSchema.nullable(),
  session_id: idSchema.nullable(),
  source: z.enum(['session', 'cycle_start', 'none']),
})

export const changedSchema = z
  .array(
    z.strictObject({
      entity: z.enum([
        'user',
        'cycle',
        'objective',
        'result',
        'result_log',
        'action',
        'action_log',
        'session',
        'note',
        'habit_log',
      ]),
      id: idSchema,
    }),
  )
  .max(100)

export function writeResultSchema<T extends z.ZodType>(record: T) {
  return z.strictObject({ record, changed: changedSchema, continuations: continuationsSchema })
}

export const deleteResultSchema = z.strictObject({ id: idSchema })
