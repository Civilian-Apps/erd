/** results API: native oRPC declarations, no execution imports. */
import { apiProcedure } from '../../shared/api/contract-base.js'
import {
  deleteResultSchema,
  habitLogSchema,
  pageSchema,
  resultDetailSchema,
  resultSchema,
  resultLogSchema,
  resultWriteResultSchema,
} from '../../contracts/projections.js'
import * as inputs from './contract.js'

export const resultsContract = {
  createResult: apiProcedure
    .route({ summary: 'Add result' })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.orpcCreateResultInput)
    .output(resultWriteResultSchema),
  listResults: apiProcedure
    .route({ summary: 'List results' })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listResultsInput)
    .output(pageSchema(resultSchema)),
  getResult: apiProcedure
    .route({ summary: 'Read result details' })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.getResultInput)
    .output(resultDetailSchema),
  updateResult: apiProcedure
    .route({ summary: 'Edit result' })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.updateResultInput)
    .output(resultWriteResultSchema),
  deleteResult: apiProcedure
    .route({
      summary: 'Delete result',
      description:
        'Permanently delete an owned result. Review gap: the existing ID-only API input needs reconciliation with the shared impact-preview and application-approval boundary.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.deleteResultInput)
    .output(deleteResultSchema),
}

export const resultLogsContract = {
  createResultLog: apiProcedure
    .route({
      summary: 'Add result log (update or comment)',
      description:
        'Append result evidence or a comment as a result log. Reuse the idempotency key on retries; current result figures are derived from retained logs.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.orpcCreateResultLogInput)
    .output(resultWriteResultSchema),
  listResultLogs: apiProcedure
    .route({
      summary: 'List result logs (Updates and Comments)',
      description: 'Read a bounded page of result logs for the selected result, newest first.',
    })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listResultLogsInput)
    .output(pageSchema(resultLogSchema)),
  clearResultLogComment: apiProcedure
    .route({ summary: 'Clear comment from result log' })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.clearResultLogCommentInput)
    .output(resultWriteResultSchema),
  deleteResultLog: apiProcedure
    .route({ summary: 'Delete result log (update)' })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.deleteResultLogInput)
    .output(resultWriteResultSchema),
}

export const habitLogsContract = {
  setHabitLog: apiProcedure
    .route({
      summary: 'Mark or unmark a habit day',
      description:
        'Set whether a habit happened on one calendar day. marked=true creates the habit log if absent; marked=false removes it. Repeating the same desired state is safe.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.setHabitLogInput)
    .output(resultWriteResultSchema),
  listHabitLogs: apiProcedure
    .route({
      summary: 'List habit logs (marked days)',
      description:
        'Read habit logs (checked days) for the selected result and optional date range. Review gap: this existing signature has no cursor; reconcile bounded history before freezing this API contract.',
    })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listHabitLogsInput)
    .output(habitLogSchema.array()),
}
