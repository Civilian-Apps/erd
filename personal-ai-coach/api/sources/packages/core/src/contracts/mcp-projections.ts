/** MCP projection of the shared briefing: every truncated page names its owning reader.
 * The application receipt in projections.ts stays unchanged. Runtime projection is still owed.
 */
import { z } from 'zod'
import { briefingSchema, loadBriefingResultSchema } from './projections.js'
import { cycleSchema } from '../features/cycles/record-contract.js'
import { objectiveSchema } from '../features/objectives/record-contract.js'
import { resultSchema } from '../features/results/record-contract.js'
import { actionSchema } from '../features/actions/record-contract.js'
import { noteSchema } from '../features/notes/record-contract.js'
import { idSchema } from './input.js'
import { readerPageSchema, continuationPageFields, resolvedReadWindowSchema } from './mcp.js'
import { listCyclesInput } from '../features/cycles/inputs.js'
import { objectiveListToolInput } from '../features/objectives/inputs.js'
import { resultListToolInput } from '../features/results/inputs.js'
import { actionListToolInput } from '../features/actions/inputs.js'
import { noteListToolInput } from '../features/notes/inputs.js'
import { sessionListToolInput } from '../features/sessions/inputs.js'
import { sessionSummarySchema } from '../features/sessions/outputs.js'

const cyclePage = readerPageSchema(
  cycleSchema,
  'cycle_read',
  listCyclesInput.extend({
    ...continuationPageFields,
    operation: z.literal('list'),
  }),
  50,
)
const objectivePage = readerPageSchema(
  objectiveSchema,
  'objective_read',
  objectiveListToolInput.extend({
    ...continuationPageFields,
    cycle_id: idSchema,
  }),
  50,
)
const resultArguments = resultListToolInput.safeExtend(continuationPageFields)
const resultPage = readerPageSchema(resultSchema, 'result_read', resultArguments, 50)
const actionArguments = actionListToolInput.safeExtend({
  ...continuationPageFields,
  cycle_id: idSchema,
})
const actionPage = readerPageSchema(
  actionSchema,
  'action_read',
  actionArguments.safeExtend({ outstanding: z.literal(true) }),
  50,
)
const notePage = readerPageSchema(
  noteSchema,
  'note_read',
  noteListToolInput.extend({
    ...continuationPageFields,
    window: resolvedReadWindowSchema.optional(),
  }),
  50,
)

const current = briefingSchema.shape.current.omit({ continuations: true }).extend({
  cycles: cyclePage,
  objectives: objectivePage,
  results: resultPage,
  actions: actionPage,
  notes: briefingSchema.shape.current.shape.notes.extend({ notes: notePage }),
})
const attention = z.strictObject({
  overdue_actions: readerPageSchema(
    actionSchema,
    'action_read',
    actionArguments.safeExtend({
      overdue: z.literal(true),
      due_before: actionListToolInput.shape.due_before.unwrap(),
    }),
    50,
  ),
  never_updated_results: readerPageSchema(
    resultSchema,
    'result_read',
    resultArguments.safeExtend({
      attention: z.literal('never_updated'),
    }),
    50,
  ),
  silent_results: readerPageSchema(
    resultSchema,
    'result_read',
    resultArguments.safeExtend({
      attention: z.literal('silent'),
      window: resolvedReadWindowSchema,
    }),
    50,
  ),
  unmarked_habits: readerPageSchema(
    resultSchema,
    'result_read',
    resultArguments.safeExtend({
      attention: z.literal('unmarked'),
      window: resolvedReadWindowSchema,
    }),
    50,
  ),
})

export const mcpBriefingSchema = briefingSchema.extend({
  current,
  attention,
  session_history: readerPageSchema(
    sessionSummarySchema,
    'session_read',
    sessionListToolInput.extend({
      ...continuationPageFields,
      window: resolvedReadWindowSchema.optional(),
    }),
    6,
  ),
})

export const sessionStartOutputSchema = z.discriminatedUnion('access_state', [
  loadBriefingResultSchema.options[0].extend({ briefing: mcpBriefingSchema }),
  loadBriefingResultSchema.options[1],
])
