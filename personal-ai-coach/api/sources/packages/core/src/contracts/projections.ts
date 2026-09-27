// Client-safe return contracts. Source: ARCHITECTURE-DOC Specifications and
// TECHNICAL-DESIGN Read model; ONTOLOGY entities/derived values; feature Interfaces.
// Feature-owned schema halves are separate from their server-only fragment loaders.
import { z } from 'zod'
import { idSchema,timestampSchema } from './input.js'
import { pageSchema,continuationsSchema } from './paging.js'
import { profileSchema,userProfileSchema } from '../features/identity-billing/record-contract.js'
import { cycleSchema } from '../features/cycles/record-contract.js'
import { objectiveSchema } from '../features/objectives/record-contract.js'
import { resultSchema,resultUpdateSchema,habitMarkSchema,trendPointSchema } from '../features/results/record-contract.js'
import { actionSchema,actionLogSchema } from '../features/actions/record-contract.js'
import { noteSchema,notesFragmentSchema } from '../features/notes/record-contract.js'
import { sessionSchema } from '../features/sessions/record-contract.js'
export { pageSchema,continuationsSchema,profileSchema,userProfileSchema,cycleSchema,objectiveSchema,
 resultSchema,resultUpdateSchema,habitMarkSchema,actionSchema,actionLogSchema,noteSchema,sessionSchema }
export const boundarySchema=z.strictObject({at:timestampSchema.nullable(),session_id:idSchema.nullable(),source:z.enum(['session','cycle_start','none'])})
export const cycleLineSchema=z.strictObject({range:z.string(),time_gone_pct:z.number().min(0).max(100)}).nullable()
const parentFiguresSchema=z.strictObject({cycle:cycleSchema.nullable(),objectives:pageSchema(objectiveSchema,50)})
export const cycleDetailSchema=z.strictObject({cycle:cycleSchema,objectives:pageSchema(objectiveSchema,50),continuations:continuationsSchema})
/** F2 Cycles: list pages contain cycle summaries; a get returns one cycle without child collections. */
export const cycleListSchema=pageSchema(cycleSchema)
export const cyclePageToolSchema=cycleListSchema.extend({
 continuation:z.strictObject({tool:z.literal('cycle_read'),arguments:z.strictObject({operation:z.literal('list'),cursor:z.string().min(1),limit:z.number().int().min(1).max(100)})}).nullable(),
})
export const cycleReadOutputSchema=z.union([cyclePageToolSchema,z.strictObject({cycle:cycleSchema.nullable()})])
export const objectiveDetailSchema=z.strictObject({objective:objectiveSchema,cycle:cycleSchema,results:pageSchema(resultSchema,50),actions:pageSchema(actionSchema,50),continuations:continuationsSchema})
export const resultDetailSchema=z.strictObject({result:resultSchema,parents:parentFiguresSchema,updates:pageSchema(resultUpdateSchema),marks:pageSchema(habitMarkSchema),trend:pageSchema(trendPointSchema),continuations:continuationsSchema})
export const actionDetailSchema=z.strictObject({action:actionSchema,cycle:cycleSchema,objective:objectiveSchema.nullable(),source_session:sessionSchema.nullable(),logs:pageSchema(actionLogSchema),continuations:continuationsSchema})
export const noteDetailSchema=noteSchema
export const sessionDetailSchema=z.strictObject({session:sessionSchema,actions:pageSchema(actionSchema),continuations:continuationsSchema})
export const sessionDocumentSchema=z.strictObject({session:sessionSchema,document:z.enum(['briefing','summary']),text:z.string().nullable()})
export const changedSchema=z.array(z.strictObject({entity:z.enum(['user','cycle','objective','result','result_update','action','action_log','session','note','habit_mark']),id:idSchema})).max(100)
export function writeResultSchema<T extends z.ZodType>(record:T){return z.strictObject({record,changed:changedSchema,continuations:continuationsSchema})}
export const userWriteResultSchema=writeResultSchema(profileSchema)
export const cycleWriteResultSchema=writeResultSchema(cycleDetailSchema)
// Compact MCP projection; the shared application receipt stays unchanged.
export const cycleMutationToolSchema=z.strictObject({cycle:cycleSchema,changed:changedSchema})
export const cycleDeletionPreviewSchema=z.strictObject({
 operation:z.literal('preview'),preview_id:idSchema,expires_at:timestampSchema,
 cycle:cycleSchema.pick({id:true,start_at:true,end_at:true,status:true}),
 deleted:z.strictObject({cycles:z.literal(1),objectives:z.number().int().nonnegative(),results:z.number().int().nonnegative(),result_logs:z.number().int().nonnegative(),habit_logs:z.number().int().nonnegative(),actions:z.number().int().nonnegative(),action_logs:z.number().int().nonnegative()}),
 retained:z.tuple([z.literal('notes'),z.literal('sessions')]),active_remaining:z.boolean(),
 approval:z.strictObject({status:z.literal('required'),url:z.url()}),
})
export const objectiveWriteResultSchema=writeResultSchema(objectiveDetailSchema)
export const resultWriteResultSchema=writeResultSchema(resultDetailSchema)
export const actionWriteResultSchema=writeResultSchema(actionDetailSchema)
export const noteWriteResultSchema=writeResultSchema(noteSchema)
export const sessionWriteResultSchema=writeResultSchema(sessionDetailSchema)
export const deleteResultSchema=z.strictObject({id:idSchema})
/** F2 Cycles deletion receipt; archived deletion may preserve a different active cycle. */
export const deleteCycleResultSchema=deleteResultSchema.extend({active_remaining:z.boolean()})
export const cycleDeleteOutputSchema=z.union([cycleDeletionPreviewSchema,deleteCycleResultSchema.extend({operation:z.literal('commit')})])
export { checkoutSessionResultSchema, billingPortalSessionResultSchema } from '../features/identity-billing/record-contract.js'
export const dashboardSchema=z.strictObject({as_of:timestampSchema,boundary:boundarySchema,cycle:cycleSchema.nullable(),cycle_line:cycleLineSchema,objectives:pageSchema(objectiveSchema,50),results:pageSchema(resultSchema,50),continuations:continuationsSchema})
export const progressByTypeSchema=z.strictObject({
 objectives:z.strictObject({on_track:z.number().int(),off_track:z.number().int(),completed:z.number().int()}),
 results:z.strictObject({in_play:z.number().int(),in_progress:z.number().int(),completed:z.number().int(),average_progress_pct:z.number().nullable()}),
 actions:z.strictObject({open:z.number().int(),in_progress:z.number().int(),done:z.number().int(),overdue:z.number().int()}),
 notes:z.strictObject({total:z.number().int(),since_boundary:z.number().int()}),
})
export const currentRecordSchema=z.strictObject({
 profile:profileSchema,boundary:boundarySchema,cycle_line:cycleLineSchema,cycles:pageSchema(cycleSchema,50),cycle:cycleSchema.nullable(),
 objectives:pageSchema(objectiveSchema,50),results:pageSchema(resultSchema,50),actions:pageSchema(actionSchema,50),
 notes:notesFragmentSchema,last_completed_session:sessionSchema.nullable(),
 selected:z.strictObject({objective:objectiveSchema.nullable(),result:resultSchema.nullable(),action:actionSchema.nullable(),note:noteSchema.nullable(),session:sessionSchema.nullable()}),
 continuations:continuationsSchema,
})
export const briefingSchema=z.strictObject({
 as_of:timestampSchema,current:currentRecordSchema,progress_by_type:progressByTypeSchema,
 session_history:pageSchema(sessionSchema,6),
 attention:z.strictObject({overdue_actions:pageSchema(actionSchema,50),never_updated_results:pageSchema(resultSchema,50),silent_results:pageSchema(resultSchema,50),unmarked_habits:pageSchema(resultSchema,50)}),
 pace:z.enum(['ahead','behind','level','nothing_measurable']),
 next_due_action:actionSchema.nullable(),
})
export const resolvedWindowSchema=z.strictObject({since:timestampSchema,until:timestampSchema}).refine(v=>Date.parse(v.since)<Date.parse(v.until),'Window must be increasing')
export const historySchema=z.strictObject({window:resolvedWindowSchema,updates:pageSchema(resultUpdateSchema,50),marks:pageSchema(habitMarkSchema,50),logs:pageSchema(actionLogSchema,50),notes:pageSchema(noteSchema,50),sessions:pageSchema(sessionSchema,50),continuations:continuationsSchema})
/** Internal application composition only; not an MCP tool output. */
export const recordQuerySchema=z.strictObject({as_of:timestampSchema,current:currentRecordSchema,history:historySchema.optional()})
export const loadBriefingResultSchema=z.discriminatedUnion('access_state',[
 z.strictObject({access_state:z.literal('active'),session:z.strictObject({id:idSchema,started_at:timestampSchema,stale:z.boolean().optional()}),briefing_notes:z.string(),briefing:briefingSchema}),
 z.strictObject({access_state:z.literal('unpaid'),enablement:z.strictObject({instruction:z.string(),signup_url:z.url()})}),
])
export const closeSessionResultSchema=z.strictObject({session:sessionSchema,boundary_moved_to:timestampSchema})
export type ProfileView=z.infer<typeof profileSchema>
export type UserProfileView=z.infer<typeof userProfileSchema>
export type CycleView=z.infer<typeof cycleSchema>
export type CycleListItem=CycleView
export type CycleDetailView=z.infer<typeof cycleDetailSchema>
export type ObjectiveView=z.infer<typeof objectiveSchema>
export type ObjectiveDetailView=z.infer<typeof objectiveDetailSchema>
export type ResultView=z.infer<typeof resultSchema>
export type ResultDetailView=z.infer<typeof resultDetailSchema>
export type ActionView=z.infer<typeof actionSchema>
export type ActionDetailView=z.infer<typeof actionDetailSchema>
export type NoteView=z.infer<typeof noteSchema>
export type SessionView=z.infer<typeof sessionSchema>
export type SessionDetailView=z.infer<typeof sessionDetailSchema>
export type Dashboard=z.infer<typeof dashboardSchema>
export type Briefing=z.infer<typeof briefingSchema>
export type QueryRecordView=z.infer<typeof recordQuerySchema>
export type WriteResult<T>={record:T;changed:z.infer<typeof changedSchema>;continuations:z.infer<typeof continuationsSchema>}
export type Detail<T>=T & {continuations:z.infer<typeof continuationsSchema>}
export type ToolResult=z.infer<typeof loadBriefingResultSchema>|z.infer<typeof closeSessionResultSchema>|WriteResult<ProfileView|CycleDetailView|ObjectiveDetailView|ResultDetailView|ActionDetailView|NoteView>|z.infer<typeof deleteResultSchema>|z.infer<typeof deleteCycleResultSchema>|z.infer<typeof cycleReadOutputSchema>
