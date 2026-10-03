import * as inputs from './inputs.js'
import {
  clearActionLogComment,
  createAction,
  createActionLog,
  deleteAction,
  getAction,
  listActionLogs,
  listActions,
  previewActionDeletion,
  reorderAction,
  updateAction,
} from './service.contract.js'
import { actionDeletionPreviewSchema } from './outputs.js'
import { actionDetailSchema, actionWriteResultSchema } from '../../shared/projections.js'
import { apiProcedure, defineServiceApi } from '../../shared/api/contract-base.js'
import { pageSchema, deleteResultSchema } from '../../shared/schemas.js'
import { actionLogSchema, actionSchema } from './records.js'

export const actionsContract = {
  preview_deletion: defineServiceApi(
    previewActionDeletion,
    apiProcedure
      .route({
        summary: 'Preview action deletion impact',
        description:
          'Return complete server impact and a trusted application approval URL. Missing impact or approval blocks deletion; preview possession is not consent.',
      })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.previewActionDeletionInput)
      .output(actionDeletionPreviewSchema),
  ),

  create: defineServiceApi(
    createAction,
    apiProcedure
      .route({ summary: 'Add action' })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.orpcCreateActionInput)
      .output(actionWriteResultSchema),
  ),
  list: defineServiceApi(
    listActions,
    apiProcedure
      .route({ summary: 'List actions' })
      .meta({
        access: 'retained-read',
        implementation: 'contract-only',
      })
      .input(inputs.listActionsInput)
      .output(pageSchema(actionSchema)),
  ),
  get: defineServiceApi(
    getAction,
    apiProcedure
      .route({ summary: 'Read action details' })
      .meta({
        access: 'retained-read',
        implementation: 'contract-only',
      })
      .input(inputs.getActionInput)
      .output(actionDetailSchema),
  ),
  update: defineServiceApi(
    updateAction,
    apiProcedure
      .route({
        summary: 'Edit action details',
        description:
          'Patch action fields. Omit fields to preserve them; null may clear optional links and description, but cannot clear a set due date. Status changes belong to action-log creation; ordering belongs to actions.reorder.',
      })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.updateActionInput)
      .output(actionWriteResultSchema),
  ),
  reorder: defineServiceApi(
    reorderAction,
    apiProcedure
      .route({ summary: 'Reorder action' })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.reorderActionInput)
      .output(actionWriteResultSchema),
  ),
  delete: defineServiceApi(
    deleteAction,
    apiProcedure
      .route({
        summary: 'Delete action',
        description:
          'Permanently delete an owned action. Requires an actor/target/impact/expiry-bound server preview and genuine application approval, checked and consumed atomically with deletion. Fail closed on incomplete or changed impact.',
      })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.deleteActionInput)
      .output(deleteResultSchema),
  ),
}

export const actionLogsContract = {
  create: defineServiceApi(
    createActionLog,
    apiProcedure
      .route({
        summary: 'Add action log (status or comment)',
        description:
          'Append an action log with a status and optional comment. The action status changes in the same transaction; repeating a status with a comment is a valid log entry.',
      })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.orpcCreateActionLogInput)
      .output(actionWriteResultSchema),
  ),
  list: defineServiceApi(
    listActionLogs,
    apiProcedure
      .route({
        summary: 'List action logs',
        description: 'Read a bounded page of action logs for the selected action, newest first.',
      })
      .meta({
        access: 'retained-read',
        implementation: 'contract-only',
      })
      .input(inputs.listActionLogsInput)
      .output(pageSchema(actionLogSchema)),
  ),
  clear_comment: defineServiceApi(
    clearActionLogComment,
    apiProcedure
      .route({ summary: 'Clear comment from action log' })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.clearActionLogCommentInput)
      .output(actionWriteResultSchema),
  ),
}
