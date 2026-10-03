/** Complete client-safe API shape, grouped by public namespace.
 * Feature api.contract.ts files own procedures and their canonical input/output schemas.
 * application.ts, the oRPC runtime and OpenAPI generation all consume this inventory.
 */
import { actionsContract, actionLogsContract } from '../features/actions/api.contract.js'
import { cyclesContract } from '../features/cycles/api.contract.js'
import { exampleContract } from '../features/example/api.contract.js'
import { userContract, billingContract } from '../features/identity-billing/api.contract.js'
import { notesContract } from '../features/notes/api.contract.js'
import { objectivesContract } from '../features/objectives/api.contract.js'
import { recordQueryContract } from '../features/record-query/api.contract.js'
import {
  resultsContract,
  resultLogsContract,
  habitLogsContract,
} from '../features/results/api.contract.js'
import { sessionsContract } from '../features/sessions/api.contract.js'

export const apiContract = {
  example: exampleContract,
  user: userContract,
  billing: billingContract,
  cycles: cyclesContract,
  objectives: objectivesContract,
  results: resultsContract,
  result_logs: resultLogsContract,
  habit_logs: habitLogsContract,
  actions: actionsContract,
  action_logs: actionLogsContract,
  notes: notesContract,
  sessions: sessionsContract,
  record: recordQueryContract,
}

export type ApiContract = typeof apiContract
/** Compatibility type for existing procedure-path consumers; contains no server implementation. */
export type AppRouter = ApiContract
