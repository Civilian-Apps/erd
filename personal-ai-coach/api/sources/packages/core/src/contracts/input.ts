/** Client-safe input primitives. Authority: ONTOLOGY entities + feature Interfaces. */
import { z } from 'zod'
import { pageInput } from '../shared/cursor.js'

export const idSchema = z.string().uuid().describe('Owned record UUID from fresh tool results or user-selected context. Never invent an ID; clarify ambiguous targets.')
export const dateSchema = z.string().date().describe('Calendar date as YYYY-MM-DD in the profile timezone.')
export const timestampSchema = z.string().datetime({ offset: true })
export const cursorSchema = z.string().min(1)
export const pageInputSchema = pageInput.strict()
export const emptyInputSchema = z.object({}).strict()
export const idInputSchema = z.object({ id: idSchema }).strict()
export const idempotencyKeySchema = z.string().min(1).max(255)
export const objectiveStatusSchema = z.enum(['on_track', 'off_track', 'completed'])
export const resultStatusSchema = z.enum(['in_progress', 'completed'])
export const actionStatusSchema = z.enum(['open', 'in_progress', 'done'])
export const sessionTypeSchema = z.enum(['goal_setup', 'check_in', 'review', 'open_coaching'])
export const metricTypeSchema = z.enum(['number', 'percentage', 'milestone', 'habit', 'performance'])
export const cadenceSchema = z.enum(['weekly', 'monthly'])
export const surfaceSchema = z.enum(['web', 'chat'])
