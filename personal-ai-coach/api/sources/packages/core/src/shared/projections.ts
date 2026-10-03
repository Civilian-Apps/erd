/** Cross-feature response compositions. Import feature-only schemas directly from their owners. */
import { z } from 'zod'
import { actionLogSchema, actionSchema } from '../features/actions/records.js'
import { cycleLineSchema, cycleListSchema } from '../features/cycles/outputs.js'
import { cycleSchema } from '../features/cycles/records.js'
import { profileSchema } from '../features/identity-billing/records.js'
import { noteSchema, notesFragmentSchema } from '../features/notes/records.js'
import { objectiveSchema } from '../features/objectives/records.js'
import {
  habitLogSchema,
  resultLogSchema,
  resultSchema,
  trendPointSchema,
} from '../features/results/records.js'
import { sessionSchema } from '../features/sessions/records.js'
import {
  timestampSchema,
  widgetSnapshotSchema,
  widgetTotalSchema,
  boundarySchema,
  continuationsSchema,
  pageSchema,
  writeResultSchema,
} from './schemas.js'

export const cycleDetailSchema = z.strictObject({
  cycle: cycleSchema,
  objectives: pageSchema(objectiveSchema, 50),
  continuations: continuationsSchema,
})

export const cycleWriteResultSchema = writeResultSchema(cycleDetailSchema)

export const objectiveDetailSchema = z.strictObject({
  objective: objectiveSchema,
  cycle: cycleSchema,
  results: pageSchema(resultSchema, 50),
  actions: pageSchema(actionSchema, 50),
  continuations: continuationsSchema,
})

export const objectiveWriteResultSchema = writeResultSchema(objectiveDetailSchema)

const parentFiguresSchema = z.strictObject({
  cycle: cycleSchema.nullable(),
  objectives: pageSchema(objectiveSchema, 50),
})

export const resultDetailSchema = z.strictObject({
  result: resultSchema,
  parents: parentFiguresSchema,
  result_logs: pageSchema(resultLogSchema),
  habit_logs: pageSchema(habitLogSchema),
  trend: pageSchema(trendPointSchema),
  continuations: continuationsSchema,
})

export const resultWriteResultSchema = writeResultSchema(resultDetailSchema)

export const actionDetailSchema = z.strictObject({
  action: actionSchema,
  cycle: cycleSchema,
  objective: objectiveSchema.nullable(),
  source_session: sessionSchema.nullable(),
  action_logs: pageSchema(actionLogSchema),
  continuations: continuationsSchema,
})

export const actionWriteResultSchema = writeResultSchema(actionDetailSchema)

export const sessionDetailSchema = z.strictObject({
  session: sessionSchema,
  actions: pageSchema(actionSchema),
  continuations: continuationsSchema,
})

export const sessionWriteResultSchema = writeResultSchema(sessionDetailSchema)

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

/** Widget presentation wraps canonical data; totals are counted before truncation in the same snapshot. */
export const progressWidgetPayloadSchema = widgetSnapshotSchema(dashboardSchema, {
  objectives: widgetTotalSchema,
  results: widgetTotalSchema,
})
export const objectiveWidgetPayloadSchema = widgetSnapshotSchema(objectiveDetailSchema, {
  results: widgetTotalSchema,
  actions: widgetTotalSchema,
})
export const resultWidgetPayloadSchema = widgetSnapshotSchema(resultDetailSchema, {
  objectives: widgetTotalSchema,
  result_logs: widgetTotalSchema,
  habit_logs: widgetTotalSchema,
  trend: widgetTotalSchema,
})
export const actionWidgetPayloadSchema = widgetSnapshotSchema(actionDetailSchema, {
  action_logs: widgetTotalSchema,
})
export const cycleWidgetPayloadSchema = z.union([
  widgetSnapshotSchema(cycleDetailSchema, { objectives: widgetTotalSchema }),
  widgetSnapshotSchema(cycleListSchema, { cycles: widgetTotalSchema }),
])
export const sessionWidgetPayloadSchema = z.union([
  widgetSnapshotSchema(sessionDetailSchema, { actions: widgetTotalSchema }),
  widgetSnapshotSchema(pageSchema(sessionSchema), { sessions: widgetTotalSchema }),
])
export const dueActionsWidgetPayloadSchema = widgetSnapshotSchema(
  currentRecordSchema.pick({
    cycle: true,
    cycle_line: true,
    objectives: true,
    actions: true,
    continuations: true,
  }),
  { objectives: widgetTotalSchema, actions: widgetTotalSchema },
)
