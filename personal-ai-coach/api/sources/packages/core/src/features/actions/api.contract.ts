import { actionDeletionPreviewSchema } from './outputs.js'
import { serviceManifest } from '../../contracts/services.js'
/** actions API: native oRPC declarations, no execution imports. */
import { apiProcedure } from '../../shared/api/contract-base.js'
import {
  actionDetailSchema,
  actionWriteResultSchema,
  pageSchema,
} from '../../contracts/projections.js'
import { actionLogSchema, actionSchema } from './record-contract.js'
import { deleteResultSchema } from '../../contracts/outputs.js'
import * as inputs from './inputs.js'

export const actionsContract = {
  preview_deletion: apiProcedure
    .route({
      summary: 'Preview action deletion impact',
      description:
        'Return complete server impact and a trusted application approval URL. Missing impact or approval blocks deletion; preview possession is not consent.',
    })
    .meta({
      service: serviceManifest.actions.preview_deletion,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.previewActionDeletionInput)
    .output(actionDeletionPreviewSchema),

  create: apiProcedure
    .route({ summary: 'Add action' })
    .meta({
      service: serviceManifest.actions.create,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.orpcCreateActionInput)
    .output(actionWriteResultSchema),
  list: apiProcedure
    .route({ summary: 'List actions' })
    .meta({
      service: serviceManifest.actions.list,
      access: 'retained-read',
      implementation: 'contract-only',
    })
    .input(inputs.listActionsInput)
    .output(pageSchema(actionSchema)),
  get: apiProcedure
    .route({ summary: 'Read action details' })
    .meta({
      service: serviceManifest.actions.get,
      access: 'retained-read',
      implementation: 'contract-only',
    })
    .input(inputs.getActionInput)
    .output(actionDetailSchema),
  update: apiProcedure
    .route({
      summary: 'Edit action details',
      description:
        'Patch action fields. Omit fields to preserve them; null may clear optional links and description, but cannot clear a set due date. Status changes belong to action-log creation; ordering belongs to actions.reorder.',
    })
    .meta({
      service: serviceManifest.actions.update,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.updateActionInput)
    .output(actionWriteResultSchema),
  reorder: apiProcedure
    .route({ summary: 'Reorder action' })
    .meta({
      service: serviceManifest.actions.reorder,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.reorderActionInput)
    .output(actionWriteResultSchema),
  delete: apiProcedure
    .route({
      summary: 'Delete action',
      description:
        'Permanently delete an owned action. Requires an actor/target/impact/expiry-bound server preview and genuine application approval, checked and consumed atomically with deletion. Fail closed on incomplete or changed impact.',
    })
    .meta({
      service: serviceManifest.actions.delete,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.deleteActionInput)
    .output(deleteResultSchema),
}

export const actionLogsContract = {
  create: apiProcedure
    .route({
      summary: 'Add action log (status or comment)',
      description:
        'Append an action log with a status and optional comment. The action status changes in the same transaction; repeating a status with a comment is a valid log entry.',
    })
    .meta({
      service: serviceManifest.action_logs.create,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.orpcCreateActionLogInput)
    .output(actionWriteResultSchema),
  list: apiProcedure
    .route({
      summary: 'List action logs',
      description: 'Read a bounded page of action logs for the selected action, newest first.',
    })
    .meta({
      service: serviceManifest.action_logs.list,
      access: 'retained-read',
      implementation: 'contract-only',
    })
    .input(inputs.listActionLogsInput)
    .output(pageSchema(actionLogSchema)),
  clear_comment: apiProcedure
    .route({ summary: 'Clear comment from action log' })
    .meta({
      service: serviceManifest.action_logs.clear_comment,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.clearActionLogCommentInput)
    .output(actionWriteResultSchema),
}
