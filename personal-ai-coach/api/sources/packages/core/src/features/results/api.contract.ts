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
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.orpcCreateResultInput)
    .output(resultWriteResultSchema),
  listResults: apiProcedure
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listResultsInput)
    .output(pageSchema(resultSchema)),
  getResult: apiProcedure
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.getResultInput)
    .output(resultDetailSchema),
  updateResult: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.updateResultInput)
    .output(resultWriteResultSchema),
  deleteResult: apiProcedure
    .route({
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
      description:
        'Append result evidence or a comment as a result log. Reuse the idempotency key on retries; current result figures are derived from retained logs.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.orpcCreateResultLogInput)
    .output(resultWriteResultSchema),
  listResultLogs: apiProcedure
    .route({
      description: 'Read a bounded page of result logs for the selected result, newest first.',
    })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listResultLogsInput)
    .output(pageSchema(resultLogSchema)),
  clearResultLogComment: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.clearResultLogCommentInput)
    .output(resultWriteResultSchema),
  deleteResultLog: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.deleteResultLogInput)
    .output(resultWriteResultSchema),
}

export const habitLogsContract = {
  setHabitLog: apiProcedure
    .route({
      description:
        'Set whether a habit happened on one calendar day. marked=true creates the habit log if absent; marked=false removes it. Repeating the same desired state is safe.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.setHabitLogInput)
    .output(resultWriteResultSchema),
  listHabitLogs: apiProcedure
    .route({
      description:
        'Read habit logs (checked days) for the selected result and optional date range. Review gap: this existing signature has no cursor; reconcile bounded history before freezing this API contract.',
    })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listHabitLogsInput)
    .output(habitLogSchema.array()),
}
