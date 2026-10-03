import { z } from 'zod'
import { actionLogSchema, actionSchema } from '../features/actions/record-contract.js'
import {
  cycleLineSchema,
  cycleReadOutputSchema,
  deleteCycleResultSchema,
} from '../features/cycles/outputs.js'
import { cycleSchema } from '../features/cycles/record-contract.js'
import { profileSchema, userProfileSchema } from '../features/identity-billing/record-contract.js'
import { noteSchema, notesFragmentSchema } from '../features/notes/record-contract.js'
import { objectiveSchema } from '../features/objectives/record-contract.js'
import {
  habitLogSchema,
  resultLogSchema,
  resultSchema,
  trendPointSchema,
} from '../features/results/record-contract.js'
import { closeSessionResultSchema } from '../features/sessions/outputs.js'
import { sessionSchema } from '../features/sessions/record-contract.js'
import { idSchema, timestampSchema } from './input.js'
import { boundarySchema, changedSchema, deleteResultSchema, writeResultSchema } from './outputs.js'
import { continuationsSchema, pageSchema } from './paging.js'
export {
  actionLogSchema,
  actionSchema,
  continuationsSchema,
  cycleSchema,
  habitLogSchema,
  noteSchema,
  objectiveSchema,
  pageSchema,
  profileSchema,
  resultLogSchema,
  resultSchema,
  sessionSchema,
  userProfileSchema,
}
const parentFiguresSchema = z.strictObject({
  cycle: cycleSchema.nullable(),
  objectives: pageSchema(objectiveSchema, 50),
})
export const cycleDetailSchema = z.strictObject({
  cycle: cycleSchema,
  objectives: pageSchema(objectiveSchema, 50),
  continuations: continuationsSchema,
})
export const objectiveDetailSchema = z.strictObject({
  objective: objectiveSchema,
  cycle: cycleSchema,
  results: pageSchema(resultSchema, 50),
  actions: pageSchema(actionSchema, 50),
  continuations: continuationsSchema,
})
export const resultDetailSchema = z.strictObject({
  result: resultSchema,
  parents: parentFiguresSchema,
  result_logs: pageSchema(resultLogSchema),
  habit_logs: pageSchema(habitLogSchema),
  trend: pageSchema(trendPointSchema),
  continuations: continuationsSchema,
})
export const actionDetailSchema = z.strictObject({
  action: actionSchema,
  cycle: cycleSchema,
  objective: objectiveSchema.nullable(),
  source_session: sessionSchema.nullable(),
  action_logs: pageSchema(actionLogSchema),
  continuations: continuationsSchema,
})
export const sessionDetailSchema = z.strictObject({
  session: sessionSchema,
  actions: pageSchema(actionSchema),
  continuations: continuationsSchema,
})
export const cycleWriteResultSchema = writeResultSchema(cycleDetailSchema)
export const objectiveWriteResultSchema = writeResultSchema(objectiveDetailSchema)
export const resultWriteResultSchema = writeResultSchema(resultDetailSchema)
export const actionWriteResultSchema = writeResultSchema(actionDetailSchema)
export const sessionWriteResultSchema = writeResultSchema(sessionDetailSchema)
export {
  cycleDeleteOutputSchema,
  cycleDeletionPreviewSchema,
  cycleLineSchema,
  cycleListSchema,
  cycleMutationToolSchema,
  cyclePageToolSchema,
  cycleReadOutputSchema,
  deleteCycleResultSchema,
} from '../features/cycles/outputs.js'
export { userWriteResultSchema } from '../features/identity-billing/outputs.js'
export {
  billingPortalSessionResultSchema,
  checkoutSessionResultSchema,
} from '../features/identity-billing/record-contract.js'
export { noteDetailSchema, noteWriteResultSchema } from '../features/notes/outputs.js'
export { closeSessionResultSchema, sessionDocumentSchema } from '../features/sessions/outputs.js'
export { boundarySchema, changedSchema, deleteResultSchema, writeResultSchema } from './outputs.js'
export const dashboardSchema = z.strictObject({
  as_of: timestampSchema,
  boundary: boundarySchema,
  cycle: cycleSchema.nullable(),
  cycle_line: cycleLineSchema,
  objectives: pageSchema(objectiveSchema, 50),
  results: pageSchema(resultSchema, 50),
  continuations: continuationsSchema,
})
export const progressByTypeSchema = z.strictObject({
  objectives: z.strictObject({
    on_track: z.number().int(),
    off_track: z.number().int(),
    completed: z.number().int(),
  }),
  results: z.strictObject({
    in_play: z.number().int(),
    in_progress: z.number().int(),
    completed: z.number().int(),
    average_progress_pct: z.number().nullable(),
  }),
  actions: z.strictObject({
    open: z.number().int(),
    in_progress: z.number().int(),
    done: z.number().int(),
    overdue: z.number().int(),
  }),
  notes: z.strictObject({ total: z.number().int(), since_boundary: z.number().int() }),
})
export const currentRecordSchema = z.strictObject({
  profile: profileSchema,
  boundary: boundarySchema,
  cycle_line: cycleLineSchema,
  cycles: pageSchema(cycleSchema, 50),
  cycle: cycleSchema.nullable(),
  objectives: pageSchema(objectiveSchema, 50),
  results: pageSchema(resultSchema, 50),
  actions: pageSchema(actionSchema, 50),
  notes: notesFragmentSchema,
  last_completed_session: sessionSchema.nullable(),
  selected: z.strictObject({
    objective: objectiveSchema.nullable(),
    result: resultSchema.nullable(),
    action: actionSchema.nullable(),
    note: noteSchema.nullable(),
    session: sessionSchema.nullable(),
  }),
  continuations: continuationsSchema,
})
export const briefingSchema = z.strictObject({
  as_of: timestampSchema,
  current: currentRecordSchema,
  progress_by_type: progressByTypeSchema,
  session_history: pageSchema(sessionSchema, 6),
  attention: z.strictObject({
    overdue_actions: pageSchema(actionSchema, 50),
    never_updated_results: pageSchema(resultSchema, 50),
    silent_results: pageSchema(resultSchema, 50),
    unmarked_habits: pageSchema(resultSchema, 50),
  }),
  pace: z.enum(['ahead', 'behind', 'level', 'nothing_measurable']),
  next_due_action: actionSchema.nullable(),
})
export const resolvedWindowSchema = z
  .strictObject({ since: timestampSchema, until: timestampSchema })
  .refine((v) => Date.parse(v.since) < Date.parse(v.until), 'Window must be increasing')
export const historySchema = z.strictObject({
  window: resolvedWindowSchema,
  result_logs: pageSchema(resultLogSchema, 50),
  habit_logs: pageSchema(habitLogSchema, 50),
  action_logs: pageSchema(actionLogSchema, 50),
  notes: pageSchema(noteSchema, 50),
  sessions: pageSchema(sessionSchema, 50),
  continuations: continuationsSchema,
})
export const recordQuerySchema = z.strictObject({
  as_of: timestampSchema,
  current: currentRecordSchema,
  history: historySchema.optional(),
})
export const loadBriefingResultSchema = z.discriminatedUnion('access_state', [
  z.strictObject({
    access_state: z.literal('active'),
    session: z.strictObject({
      id: idSchema,
      started_at: timestampSchema,
      stale: z.boolean().optional(),
    }),
    briefing_notes: z.string(),
    briefing: briefingSchema,
  }),
  z.strictObject({
    access_state: z.literal('unpaid'),
    enablement: z.strictObject({ instruction: z.string(), signup_url: z.url() }),
  }),
])
export type ProfileView = z.infer<typeof profileSchema>
export type UserProfileView = z.infer<typeof userProfileSchema>
export type CycleView = z.infer<typeof cycleSchema>
export type CycleListItem = CycleView
export type CycleDetailView = z.infer<typeof cycleDetailSchema>
export type ObjectiveView = z.infer<typeof objectiveSchema>
export type ObjectiveDetailView = z.infer<typeof objectiveDetailSchema>
export type ResultView = z.infer<typeof resultSchema>
export type ResultDetailView = z.infer<typeof resultDetailSchema>
export type ActionView = z.infer<typeof actionSchema>
export type ActionDetailView = z.infer<typeof actionDetailSchema>
export type NoteView = z.infer<typeof noteSchema>
export type SessionView = z.infer<typeof sessionSchema>
export type SessionDetailView = z.infer<typeof sessionDetailSchema>
export type Dashboard = z.infer<typeof dashboardSchema>
export type Briefing = z.infer<typeof briefingSchema>
export type QueryRecordView = z.infer<typeof recordQuerySchema>
export type WriteResult<T> = {
  record: T
  changed: z.infer<typeof changedSchema>
  continuations: z.infer<typeof continuationsSchema>
}
export type Detail<T> = T & { continuations: z.infer<typeof continuationsSchema> }
export type ToolResult =
  | z.infer<typeof loadBriefingResultSchema>
  | z.infer<typeof closeSessionResultSchema>
  | WriteResult<
      | ProfileView
      | CycleDetailView
      | ObjectiveDetailView
      | ResultDetailView
      | ActionDetailView
      | NoteView
    >
  | z.infer<typeof deleteResultSchema>
  | z.infer<typeof deleteCycleResultSchema>
  | z.infer<typeof cycleReadOutputSchema>
