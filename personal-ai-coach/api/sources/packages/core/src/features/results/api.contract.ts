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
  create: apiProcedure
    .route({ summary: 'Add result' })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.orpcCreateResultInput)
    .output(resultWriteResultSchema),
  list: apiProcedure
    .route({ summary: 'List results' })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listResultsInput)
    .output(pageSchema(resultSchema)),
  get: apiProcedure
    .route({ summary: 'Read result details' })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.getResultInput)
    .output(resultDetailSchema),
  update: apiProcedure
    .route({ summary: 'Edit result' })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.updateResultInput)
    .output(resultWriteResultSchema),
  delete: apiProcedure
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
  create: apiProcedure
    .route({
      summary: 'Add result log (update or comment)',
      description:
        'Append result evidence or a comment as a result log. Reuse the idempotency key on retries; current result figures are derived from retained logs.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.orpcCreateResultLogInput)
    .output(resultWriteResultSchema),
  list: apiProcedure
    .route({
      summary: 'List result logs (Updates and Comments)',
      description: 'Read a bounded page of result logs for the selected result, newest first.',
    })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listResultLogsInput)
    .output(pageSchema(resultLogSchema)),
  clearComment: apiProcedure
    .route({ summary: 'Clear comment from result log' })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.clearResultLogCommentInput)
    .output(resultWriteResultSchema),
  delete: apiProcedure
    .route({ summary: 'Delete result log (update)' })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.deleteResultLogInput)
    .output(resultWriteResultSchema),
}

export const habitLogsContract = {
  set: apiProcedure
    .route({
      summary: 'Mark or unmark a habit day',
      description:
        'Set whether a habit happened on one calendar day. marked=true creates the habit log if absent; marked=false removes it. Repeating the same desired state is safe.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.setHabitLogInput)
    .output(resultWriteResultSchema),
  list: apiProcedure
    .route({
      summary: 'List habit logs (marked days)',
      description:
        'Read habit logs (checked days) for the selected result and optional date range. Review gap: this existing signature has no cursor; reconcile bounded history before freezing this API contract.',
    })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listHabitLogsInput)
    .output(habitLogSchema.array()),
}
