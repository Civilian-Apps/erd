/** Internal application query contract. Retired from the public MCP catalogue; no tool may wrap this generic reader. */
/** Normative inputs: docs/ONTOLOGY.md and this feature's spec Interfaces. Client-safe. */
import { z } from 'zod'
import { idSchema, dateSchema, timestampSchema, cursorSchema } from '../../contracts/input.js'
const boundSchema = z.union([dateSchema, timestampSchema])
export const recordQueryFilters = z
  .object({
    cycle_id: idSchema.optional(),
    objective_id: idSchema.optional(),
    result_id: idSchema.optional(),
    action_id: idSchema.optional(),
    note_id: idSchema.optional(),
    session_id: idSchema.optional(),
    kinds: z
      .array(z.enum(['result_logs', 'habit_logs', 'action_logs', 'notes', 'sessions']))
      .min(1)
      .optional(),
  })
  .strict()
export const recordQueryWindow = z
  .object({
    since: z.union([boundSchema, z.enum(['last_session', 'cycle_start'])]).optional(),
    until: boundSchema.optional(),
  })
  .strict()
export const recordQueryContinuations = z
  .object({
    cycles: cursorSchema.optional(),
    objectives: cursorSchema.optional(),
    results: cursorSchema.optional(),
    actions: cursorSchema.optional(),
    notes: cursorSchema.optional(),
    sessions: cursorSchema.optional(),
    result_logs: cursorSchema.optional(),
    habit_logs: cursorSchema.optional(),
    action_logs: cursorSchema.optional(),
  })
  .strict()
export const queryRecordInput = z
  .object({
    filters: recordQueryFilters.optional(),
    window: recordQueryWindow.optional(),
    continuations: recordQueryContinuations.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.filters?.kinds && !value.window)
      ctx.addIssue({
        code: 'custom',
        path: ['filters', 'kinds'],
        message: 'History kinds require a window.',
      })
    const since = value.window?.since,
      until = value.window?.until
    // Date-only bounds resolve in the profile timezone in the future service body.
    if (
      since &&
      until &&
      since !== 'last_session' &&
      since !== 'cycle_start' &&
      since.length === until.length &&
      since >= until
    )
      ctx.addIssue({
        code: 'custom',
        path: ['window', 'until'],
        message: 'Until must be after since.',
      })
  })
