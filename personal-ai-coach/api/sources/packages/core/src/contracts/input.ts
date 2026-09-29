/** Client-safe input primitives. Authority: ONTOLOGY entities + feature Interfaces. */
import { z } from 'zod'
import { pageInput } from '../shared/cursor.js'

export const idSchema = z
  .string()
  .uuid()
  .describe(
    'Owned record UUID from fresh tool results or user-selected context. Never invent an ID; clarify ambiguous targets.',
  )
export const dateSchema = z
  .string()
  .date()
  .describe('Calendar date as YYYY-MM-DD in the profile timezone.')
export const timestampSchema = z.string().datetime({ offset: true })
export const cursorSchema = z.string().min(1)
export const pageInputSchema = pageInput.strict()
export const emptyInputSchema = z.object({}).strict()
export const idInputSchema = z.object({ id: idSchema }).strict()
export const idempotencyKeySchema = z.string().min(1).max(255)
export const objectiveStatusSchema = z
  .enum(['on_track', 'off_track', 'completed'])
  .describe(
    'Objective status: On track, Off track or Completed. Coaching judgment, independent of the derived Progress percentage.',
  )
export const resultStatusSchema = z
  .enum(['in_progress', 'completed'])
  .describe(
    'Result status: In progress or Completed. Reaching the target does not automatically mark the result completed.',
  )
export const actionStatusSchema = z
  .enum(['open', 'in_progress', 'done'])
  .describe(
    'Action status: Open, In progress or Done. The To do UI group includes Open and In progress; Overdue is derived, not a status.',
  )
export const sessionTypeSchema = z
  .enum(['goal_setup', 'check_in', 'review', 'open_coaching'])
  .describe(
    'Coaching session type: Goal setup, Check-in, Review or Open coaching. Separate from whether the session is still open.',
  )
export const metricTypeSchema = z
  .enum(['number', 'percentage', 'milestone', 'habit', 'performance'])
  .describe('UI label: Type. Number, Percentage, Milestone, Habit or Performance.')
export const cadenceSchema = z
  .enum(['weekly', 'monthly'])
  .describe('UI label: Cadence. Weekly or Monthly; per supplies the Times value.')
export const surfaceSchema = z.enum(['web', 'chat'])
