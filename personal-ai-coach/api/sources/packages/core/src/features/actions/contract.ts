/** Normative inputs: docs/ONTOLOGY.md and this feature's spec Interfaces. Client-safe. */
import { z } from 'zod'
import {
  dateSchema,
  idInputSchema,
  idSchema,
  idempotencyKeySchema,
  pageInputSchema,
  actionStatusSchema,
} from '../../contracts/input.js'
export const createActionInput = z
  .object({
    title: z.string(),
    due_at: dateSchema.nullable(),
    objective_id: idSchema.nullable().optional(),
    description: z.string().nullable().optional(),
  })
  .strict()
export const orpcCreateActionInput = createActionInput.extend({
  idempotency_key: idempotencyKeySchema,
})
export const updateActionInput = idInputSchema.extend({
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  due_at: dateSchema
    .optional()
    .describe(
      'New due date. Omit to preserve; a previously set date cannot be cleared. Web creation may initially have no date.',
    ),
  objective_id: idSchema.nullable().optional(),
  session_id: idSchema.nullable().optional(),
})
export const reorderActionInput = idInputSchema.extend({ sort_order: z.number().finite() })
export const deleteActionInput = idInputSchema
export const getActionInput = idInputSchema
export const listActionsInput = pageInputSchema.extend({
  cycle_id: idSchema.optional(),
  objective_id: idSchema.nullable().optional(),
  status: actionStatusSchema.optional(),
  due_before: dateSchema.optional(),
})
export const createActionLogInput = z
  .object({
    action_id: idSchema,
    status: actionStatusSchema,
    comment: z.string().trim().min(1).optional(),
  })
  .strict()
export const orpcCreateActionLogInput = createActionLogInput.extend({
  idempotency_key: idempotencyKeySchema,
})
export const listActionLogsInput = pageInputSchema.extend({ action_id: idSchema })
export const clearActionLogCommentInput = idInputSchema
export const actionWriteInput = z.discriminatedUnion('operation', [
  createActionInput.extend({
    operation: z.literal('create'),
    title: z.string().trim().min(1),
    due_at: dateSchema,
  }),
  updateActionInput.extend({
    operation: z.literal('update'),
    title: z.string().trim().min(1).optional(),
    due_at: dateSchema
      .optional()
      .describe('New due date. Omit to preserve; a previously set date cannot be cleared.'),
  }),
])
export const recordActionProgressInput = createActionLogInput.extend({
  target: z.literal('action'),
})

// MCP transport contracts: reuse domain fields; keep handlers outside declarations.
import {
  readerPageSchema,
  continuationPageFields,
  readWindowSchema,
  resolvedReadWindowSchema,
  deletionInputSchema,
  deletionOutputSchema,
} from '../../contracts/mcp.js'
import { actionSchema, actionLogSchema, changedSchema } from '../../contracts/projections.js'
export const actionListToolInput = listActionsInput
  .extend({
    operation: z.literal('list'),
    outstanding: z
      .literal(true)
      .optional()
      .describe('Only open or in_progress actions; exclude done across every page.'),
    session_id: idSchema
      .optional()
      .describe(
        'Filter actions created in this owned session; combine with cycle_id to select its cycle explicitly.',
      ),
    overdue: z
      .literal(true)
      .optional()
      .describe(
        'Only non-done actions before due_before; requires an explicit local cutoff date for stable briefing pagination.',
      ),
  })
  .refine(
    (value) => !value.overdue || Boolean(value.due_before),
    'Overdue selection requires due_before.',
  )
  .refine(
    (value) => !(value.outstanding || value.overdue) || value.status !== 'done',
    'Outstanding and overdue filters exclude done actions.',
  )
export const actionGetToolInput = getActionInput.extend({ operation: z.literal('get') })
export const actionHistoryToolInput = listActionLogsInput.extend({
  operation: z.literal('history'),
  window: readWindowSchema.optional(),
})
export const actionReadInput = z.discriminatedUnion('operation', [
  actionListToolInput,
  actionGetToolInput,
  actionHistoryToolInput,
])
const actionListToolOutput = readerPageSchema(
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
export const actionDeleteToolInput = deletionInputSchema
export const actionDeleteToolOutput = deletionOutputSchema(
  actionSchema.pick({ id: true, title: true }),
  { actions: z.literal(1), action_logs: z.number().int().nonnegative() },
)
