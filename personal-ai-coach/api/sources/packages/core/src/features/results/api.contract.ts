import * as inputs from './inputs.js'
import {
  clearResultLogComment,
  createResult,
  createResultLog,
  deleteResult,
  deleteResultLog,
  getResult,
  listHabitLogs,
  listResultLogs,
  listResults,
  previewResultDeletion,
  setHabitLog,
  updateResult,
} from './service.contract.js'
import { resultDeletionPreviewSchema } from './outputs.js'
import { resultDetailSchema, resultWriteResultSchema } from '../../shared/projections.js'
import { apiProcedure, defineServiceApi } from '../../shared/api/contract-base.js'
import { deleteResultSchema, pageSchema } from '../../shared/schemas.js'
import { habitLogSchema, resultSchema, resultLogSchema } from './records.js'

export const resultsContract = {
  preview_deletion: defineServiceApi(
    previewResultDeletion,
    apiProcedure
      .route({
        summary: 'Preview result deletion impact',
        description:
          'Return complete server impact and a trusted application approval URL. Missing impact or approval blocks deletion; preview possession is not consent.',
      })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.previewResultDeletionInput)
      .output(resultDeletionPreviewSchema),
  ),

  create: defineServiceApi(
    createResult,
    apiProcedure
      .route({ summary: 'Add result' })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.orpcCreateResultInput)
      .output(resultWriteResultSchema),
  ),
  list: defineServiceApi(
    listResults,
    apiProcedure
      .route({ summary: 'List results' })
      .meta({
        access: 'retained-read',
        implementation: 'contract-only',
      })
      .input(inputs.listResultsInput)
      .output(pageSchema(resultSchema)),
  ),
  get: defineServiceApi(
    getResult,
    apiProcedure
      .route({ summary: 'Read result details' })
      .meta({
        access: 'retained-read',
        implementation: 'contract-only',
      })
      .input(inputs.getResultInput)
      .output(resultDetailSchema),
  ),
  update: defineServiceApi(
    updateResult,
    apiProcedure
      .route({ summary: 'Edit result' })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.updateResultInput)
      .output(resultWriteResultSchema),
  ),
  delete: defineServiceApi(
    deleteResult,
    apiProcedure
      .route({
        summary: 'Delete result',
        description:
          'Permanently delete an owned result. Requires an actor/target/impact/expiry-bound server preview and genuine application approval, checked and consumed atomically with deletion. Fail closed on incomplete or changed impact.',
      })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.deleteResultInput)
      .output(deleteResultSchema),
  ),
}

export const resultLogsContract = {
  create: defineServiceApi(
    createResultLog,
    apiProcedure
      .route({
        summary: 'Add result log (update or comment)',
        description:
          'Append result evidence or a comment as a result log. Reuse the idempotency key on retries; current result figures are derived from retained logs.',
      })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.orpcCreateResultLogInput)
      .output(resultWriteResultSchema),
  ),
  list: defineServiceApi(
    listResultLogs,
    apiProcedure
      .route({
        summary: 'List result logs (Updates and Comments)',
        description: 'Read a bounded page of result logs for the selected result, newest first.',
      })
      .meta({
        access: 'retained-read',
        implementation: 'contract-only',
      })
      .input(inputs.listResultLogsInput)
      .output(pageSchema(resultLogSchema)),
  ),
  clear_comment: defineServiceApi(
    clearResultLogComment,
    apiProcedure
      .route({ summary: 'Clear comment from result log' })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.clearResultLogCommentInput)
      .output(resultWriteResultSchema),
  ),
  delete: defineServiceApi(
    deleteResultLog,
    apiProcedure
      .route({ summary: 'Delete result log (update)' })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.deleteResultLogInput)
      .output(resultWriteResultSchema),
  ),
}

export const habitLogsContract = {
  set: defineServiceApi(
    setHabitLog,
    apiProcedure
      .route({
        summary: 'Mark or unmark a habit day',
        description:
          'Set whether a habit happened on one calendar day. marked=true creates the habit log if absent; marked=false removes it. Repeating the same desired state is safe.',
      })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.setHabitLogInput)
      .output(resultWriteResultSchema),
  ),
  list: defineServiceApi(
    listHabitLogs,
    apiProcedure
      .route({
        summary: 'List habit logs (marked days)',
        description:
          'Read a bounded cursor page of habit logs (checked days) for the selected result and optional inclusive date range. Preserve filters when following next_cursor.',
      })
      .meta({
        access: 'retained-read',
        implementation: 'contract-only',
      })
      .input(inputs.listHabitLogsInput)
      .output(pageSchema(habitLogSchema)),
  ),
}
