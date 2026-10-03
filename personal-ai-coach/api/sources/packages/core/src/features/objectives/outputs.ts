import { z } from 'zod'
import { objectiveSchema } from './records.js'
import { idSchema, changedSchema, pageSchema } from '../../shared/schemas.js'
import {
  continuationPageFields,
  deletionOutputSchema,
  readerPageSchema,
} from '../../shared/mcp/schemas.js'
import { objectiveListToolInput } from './inputs.js'

export const objectiveListToolOutput = readerPageSchema(
  objectiveSchema,
  'objective_read',
  objectiveListToolInput.extend({ ...continuationPageFields, cycle_id: idSchema }),
).safeExtend({ operation: z.literal('list') })

export const objectiveReadOutput = z.union([
  objectiveListToolOutput,
  z.strictObject({ operation: z.literal('get'), objective: objectiveSchema }),
])

export const objectiveMutationOutput = z.strictObject({
  objective: objectiveSchema,
  changed: changedSchema,
})

export const objectiveDeleteToolOutput = deletionOutputSchema(
  objectiveSchema.pick({ id: true, title: true }),
  {
    objectives: z.literal(1),
    results: z.number().int().nonnegative(),
    result_logs: z.number().int().nonnegative(),
    habit_logs: z.number().int().nonnegative(),
    actions: z.number().int().nonnegative(),
    action_logs: z.number().int().nonnegative(),
  },
)

export const objectiveDeletionPreviewSchema = objectiveDeleteToolOutput.options[0]

export const objectiveListServiceSchema = pageSchema(objectiveSchema).extend({
  cycle_id: idSchema.nullable(),
})
