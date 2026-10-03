import { idSchema } from '../../contracts/input.js'
import { resolvedReadWindowSchema } from '../../contracts/mcp.js'
import { pageSchema } from '../../contracts/paging.js'
/** Feature-owned response schemas; no execution imports. */
import { z } from 'zod'
import {
  continuationPageFields,
  deletionOutputSchema,
  readerPageSchema,
} from '../../contracts/mcp.js'
import { changedSchema } from '../../contracts/outputs.js'
import { actionHistoryToolInput, actionListToolInput } from './inputs.js'
import { actionLogSchema, actionSchema } from './record-contract.js'
export const actionListToolOutput = readerPageSchema(
  actionSchema,
  'action_read',
  actionListToolInput.safeExtend({ ...continuationPageFields, cycle_id: idSchema }),
).safeExtend({ operation: z.literal('list') })
export const actionReadOutput = z.union([
  actionListToolOutput,
  z.strictObject({ operation: z.literal('get'), action: actionSchema }),
  readerPageSchema(
    actionLogSchema,
    'action_read',
    actionHistoryToolInput.extend({ ...continuationPageFields, window: resolvedReadWindowSchema }),
  ).safeExtend({
    operation: z.literal('history'),
    action_id: idSchema,
    window: resolvedReadWindowSchema,
  }),
])
export const actionMutationOutput = z.strictObject({ action: actionSchema, changed: changedSchema })
export const actionDeleteToolOutput = deletionOutputSchema(
  actionSchema.pick({ id: true, title: true }),
  { actions: z.literal(1), action_logs: z.number().int().nonnegative() },
)

export const actionDeletionPreviewSchema = actionDeleteToolOutput.options[0]

export const actionHistorySchema = pageSchema(actionLogSchema).extend({
  action_id: idSchema,
  window: resolvedReadWindowSchema,
})

export const actionListServiceSchema = pageSchema(actionSchema).extend({
  cycle_id: idSchema.nullable(),
})
