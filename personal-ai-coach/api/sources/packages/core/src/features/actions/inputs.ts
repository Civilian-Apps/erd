/** Feature-owned input schemas shared by permitted transports. */
import { z } from 'zod'
import { actionStatusSchema } from './records.js'
import {
  dateSchema,
  idInputSchema,
  idSchema,
  idempotencyKeySchema,
  pageInputSchema,
} from '../../shared/schemas.js'
import { deletionInputSchema, readWindowSchema } from '../../shared/mcp/schemas.js'

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

export const previewActionDeletionInput = idInputSchema

export const deleteActionInput = idInputSchema.extend({
  preview_id: idSchema.describe(
    'Server impact preview ID; trusted application approval must already exist.',
  ),
})

export const getActionInput = idInputSchema

const actionListFields = pageInputSchema.extend({
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

export const listActionsInput = actionListFields
  .extend({
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

export const actionListToolInput = listActionsInput.safeExtend({ operation: z.literal('list') })

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

export const actionDeleteToolInput = deletionInputSchema

export const actionHistoryInput = actionHistoryToolInput.omit({ operation: true })
