import { resultDeletionPreviewSchema } from './outputs.js'
import { serviceManifest } from '../../contracts/services.js'
/** results API: native oRPC declarations, no execution imports. */
import { apiProcedure } from '../../shared/api/contract-base.js'
import { deleteResultSchema } from '../../contracts/outputs.js'
import { habitLogSchema, resultSchema, resultLogSchema } from './record-contract.js'
import {
  pageSchema,
  resultDetailSchema,
  resultWriteResultSchema,
} from '../../contracts/projections.js'
import * as inputs from './inputs.js'

export const resultsContract = {
  preview_deletion: apiProcedure
    .route({
      summary: 'Preview result deletion impact',
      description:
        'Return complete server impact and a trusted application approval URL. Missing impact or approval blocks deletion; preview possession is not consent.',
    })
    .meta({
      service: serviceManifest.results.preview_deletion,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.previewResultDeletionInput)
    .output(resultDeletionPreviewSchema),

  create: apiProcedure
    .route({ summary: 'Add result' })
    .meta({
      service: serviceManifest.results.create,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.orpcCreateResultInput)
    .output(resultWriteResultSchema),
  list: apiProcedure
    .route({ summary: 'List results' })
    .meta({
      service: serviceManifest.results.list,
      access: 'retained-read',
      implementation: 'contract-only',
    })
    .input(inputs.listResultsInput)
    .output(pageSchema(resultSchema)),
  get: apiProcedure
    .route({ summary: 'Read result details' })
    .meta({
      service: serviceManifest.results.get,
      access: 'retained-read',
      implementation: 'contract-only',
    })
    .input(inputs.getResultInput)
    .output(resultDetailSchema),
  update: apiProcedure
    .route({ summary: 'Edit result' })
    .meta({
      service: serviceManifest.results.update,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.updateResultInput)
    .output(resultWriteResultSchema),
  delete: apiProcedure
    .route({
      summary: 'Delete result',
      description:
        'Permanently delete an owned result. Requires an actor/target/impact/expiry-bound server preview and genuine application approval, checked and consumed atomically with deletion. Fail closed on incomplete or changed impact.',
    })
    .meta({
      service: serviceManifest.results.delete,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
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
    .meta({
      service: serviceManifest.result_logs.create,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.orpcCreateResultLogInput)
    .output(resultWriteResultSchema),
  list: apiProcedure
    .route({
      summary: 'List result logs (Updates and Comments)',
      description: 'Read a bounded page of result logs for the selected result, newest first.',
    })
    .meta({
      service: serviceManifest.result_logs.list,
      access: 'retained-read',
      implementation: 'contract-only',
    })
    .input(inputs.listResultLogsInput)
    .output(pageSchema(resultLogSchema)),
  clear_comment: apiProcedure
    .route({ summary: 'Clear comment from result log' })
    .meta({
      service: serviceManifest.result_logs.clear_comment,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.clearResultLogCommentInput)
    .output(resultWriteResultSchema),
  delete: apiProcedure
    .route({ summary: 'Delete result log (update)' })
    .meta({
      service: serviceManifest.result_logs.delete,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
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
    .meta({
      service: serviceManifest.habit_logs.set,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.setHabitLogInput)
    .output(resultWriteResultSchema),
  list: apiProcedure
    .route({
      summary: 'List habit logs (marked days)',
      description:
        'Read a bounded cursor page of habit logs (checked days) for the selected result and optional inclusive date range. Preserve filters when following next_cursor.',
    })
    .meta({
      service: serviceManifest.habit_logs.list,
      access: 'retained-read',
      implementation: 'contract-only',
    })
    .input(inputs.listHabitLogsInput)
    .output(pageSchema(habitLogSchema)),
}
