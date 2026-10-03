/** Feature-owned input schemas shared by permitted transports. */
import { z } from 'zod'
import {
  dateSchema,
  emptyInputSchema,
  idInputSchema,
  idSchema,
  idempotencyKeySchema,
  pageInputSchema,
} from '../../shared/schemas.js'

const start = dateSchema.describe(
  'UI label: Starts. Calendar date, YYYY-MM-DD. Required on create; omit on update to preserve.',
)

const end = dateSchema.describe(
  'UI label: Ends. Calendar date, YYYY-MM-DD; must be after the resulting start date.',
)

const intention = z
  .string()
  .nullable()
  .optional()
  .describe('Personal focus. Omit to preserve on update; null clears it.')

export const cycleSelector = z
  .union([idSchema, z.literal('active')])
  .describe(
    'Owned cycle UUID from fresh context, or active for the stored active cycle at execution. No date-based expiry or fallback. Use the UUID for a specifically selected cycle.',
  )

const validDates = (value: { start_at?: string; end_at?: string }) =>
  !value.start_at || !value.end_at || value.end_at > value.start_at

const dateError = { message: 'end_at must be after start_at.', path: ['end_at'] }

export const createCycleInput = z
  .strictObject({
    start_at: start,
    end_at: end,
    intention,
    idempotency_key: idempotencyKeySchema.describe(
      'Unique key per logical create. Reuse the same key AND fields on every retry, including uncertain outcomes. A new create needs a new key.',
    ),
  })
  .refine(validDates, dateError)

export const orpcCreateCycleInput = createCycleInput

const updateCycleBase = z.strictObject({
  id: cycleSelector,
  start_at: start.optional(),
  end_at: end.optional(),
  intention,
  status: z.enum(['active', 'archived']).optional(),
})

export const updateCycleInput = updateCycleBase.refine(validDates, dateError)

export const getCycleInput = idInputSchema

export const getActiveCycleInput = emptyInputSchema

export const listCyclesInput = pageInputSchema

export const cycleReadInput = z.discriminatedUnion('operation', [
  listCyclesInput.extend({
    operation: z.literal('list').describe('Find cycles; reuse fresh results directly for updates.'),
  }),
  z.strictObject({ operation: z.literal('get'), id: cycleSelector }),
])

export const cycleUpdateInput = updateCycleBase.omit({ status: true }).refine(validDates, dateError)

export const cycleLifecycleInput = z.discriminatedUnion('operation', [
  createCycleInput.safeExtend({ operation: z.literal('create') }),
  idInputSchema.extend({ operation: z.literal('archive') }),
  idInputSchema.extend({ operation: z.literal('activate') }),
])

export const previewCycleDeletionInput = idInputSchema

export const deleteCycleInput = idInputSchema.extend({
  preview_id: idSchema.describe(
    'Server-issued impact preview ID. This is not approval: the service checks genuine user approval recorded by the trusted host/application.',
  ),
})

export const cycleDeleteInput = z.discriminatedUnion('operation', [
  previewCycleDeletionInput.extend({ operation: z.literal('preview') }),
  deleteCycleInput.extend({ operation: z.literal('commit') }),
])
