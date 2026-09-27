/** Normative inputs: docs/ONTOLOGY.md and this feature's spec Interfaces. Client-safe. */
import { z } from 'zod'
import {
  dateSchema,
  idInputSchema,
  idSchema,
  idempotencyKeySchema,
  pageInputSchema,
  objectiveStatusSchema,
} from '../../contracts/input.js'
export const createObjectiveInput = z
  .object({
    title: z.string(),
    description: z.string().optional(),
    deadline_at: dateSchema.nullable().optional(),
  })
  .strict()
export const orpcCreateObjectiveInput = createObjectiveInput.extend({
  idempotency_key: idempotencyKeySchema,
})
export const updateObjectiveInput = idInputSchema.extend({
  title: z.string().optional(),
  description: z.string().optional(),
  deadline_at: dateSchema.nullable().optional(),
  status: objectiveStatusSchema.optional(),
})
export const deleteObjectiveInput = idInputSchema
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

// MCP transport contracts: reuse domain fields; keep handlers outside declarations.
import {
  readerPageSchema,
  continuationPageFields,
  readWindowSchema,
  resolvedReadWindowSchema,
  deletionInputSchema,
  deletionOutputSchema,
} from '../../contracts/mcp.js'
import { objectiveSchema, changedSchema } from '../../contracts/projections.js'
export const objectiveListToolInput = listObjectivesInput.extend({ operation: z.literal('list') })
export const objectiveGetToolInput = getObjectiveInput.extend({ operation: z.literal('get') })
export const objectiveReadInput = z.discriminatedUnion('operation', [
  objectiveListToolInput,
  objectiveGetToolInput,
])
const objectiveListToolOutput = readerPageSchema(
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
export const objectiveDeleteToolInput = deletionInputSchema
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
