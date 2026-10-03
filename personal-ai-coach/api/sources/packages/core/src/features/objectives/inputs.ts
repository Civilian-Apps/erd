/** Feature-owned input schemas shared by permitted transports. */
import { z } from 'zod'
import {
  dateSchema,
  idInputSchema,
  idSchema,
  idempotencyKeySchema,
  pageInputSchema,
} from '../../shared/schemas.js'
import { objectiveStatusSchema } from './records.js'
import { deletionInputSchema } from '../../shared/mcp/schemas.js'

export const createObjectiveInput = z
  .object({
    title: z.string(),
    description: z.string().optional(),
    deadline_at: dateSchema
      .nullable()
      .optional()
      .describe(
        'UI label: Deadline. Optional; omitted or null creates the objective with no deadline.',
      ),
  })
  .strict()

export const orpcCreateObjectiveInput = createObjectiveInput.extend({
  idempotency_key: idempotencyKeySchema,
})

export const updateObjectiveInput = idInputSchema.extend({
  title: z.string().optional(),
  description: z.string().optional(),
  deadline_at: dateSchema
    .optional()
    .describe(
      'UI label: Deadline. Omit to preserve; a date sets or replaces it. A deadline cannot be cleared, so null is rejected.',
    ),
  status: objectiveStatusSchema.optional(),
})

export const previewObjectiveDeletionInput = idInputSchema

export const deleteObjectiveInput = idInputSchema.extend({
  preview_id: idSchema.describe(
    'Server impact preview ID; trusted application approval must already exist.',
  ),
})

export const getObjectiveInput = idInputSchema

export const listObjectivesInput = pageInputSchema.extend({ cycle_id: idSchema.optional() })

export const objectiveWriteInput = z.discriminatedUnion('operation', [
  createObjectiveInput.extend({
    operation: z.literal('create'),
    title: z.string().trim().min(1),
    description: z.string(),
  }),
  updateObjectiveInput.extend({
    operation: z.literal('update'),
    title: z.string().trim().min(1).optional(),
  }),
])

export const objectiveListToolInput = listObjectivesInput.extend({ operation: z.literal('list') })

export const objectiveGetToolInput = getObjectiveInput.extend({ operation: z.literal('get') })

export const objectiveReadInput = z.discriminatedUnion('operation', [
  objectiveListToolInput,
  objectiveGetToolInput,
])

export const objectiveDeleteToolInput = deletionInputSchema
