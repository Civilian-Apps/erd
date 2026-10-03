import { z } from 'zod'
import { idSchema, timestampSchema } from '../../contracts/input.js'
import { changedSchema, deleteResultSchema } from '../../contracts/outputs.js'
import { pageSchema } from '../../contracts/paging.js'
import { cycleSchema } from './record-contract.js'

export const cycleLineSchema = z
  .strictObject({ range: z.string(), time_gone_pct: z.number().min(0).max(100) })
  .nullable()

export const cycleListSchema = pageSchema(cycleSchema)

export const cyclePageToolSchema = cycleListSchema.extend({
  continuation: z
    .strictObject({
      tool: z.literal('cycle_read'),
      arguments: z.strictObject({
        operation: z.literal('list'),
        cursor: z.string().min(1),
        limit: z.number().int().min(1).max(100),
      }),
    })
    .nullable(),
})

export const cycleReadOutputSchema = z.union([
  cyclePageToolSchema,
  z.strictObject({ cycle: cycleSchema.nullable() }),
])

export const cycleMutationToolSchema = z.strictObject({
  cycle: cycleSchema,
  changed: changedSchema,
})

export const cycleDeletionPreviewSchema = z.strictObject({
  operation: z.literal('preview'),
  preview_id: idSchema,
  expires_at: timestampSchema,
  cycle: cycleSchema.pick({ id: true, start_at: true, end_at: true, status: true }),
  deleted: z.strictObject({
    cycles: z.literal(1),
    objectives: z.number().int().nonnegative(),
    results: z.number().int().nonnegative(),
    result_logs: z.number().int().nonnegative(),
    habit_logs: z.number().int().nonnegative(),
    actions: z.number().int().nonnegative(),
    action_logs: z.number().int().nonnegative(),
  }),
  retained: z.tuple([z.literal('notes'), z.literal('sessions')]),
  active_remaining: z.boolean(),
  approval: z.strictObject({ status: z.literal('required'), url: z.url() }),
})

export const deleteCycleResultSchema = deleteResultSchema.extend({ active_remaining: z.boolean() })

export const cycleDeleteOutputSchema = z.union([
  cycleDeletionPreviewSchema,
  deleteCycleResultSchema.extend({ operation: z.literal('commit') }),
])
