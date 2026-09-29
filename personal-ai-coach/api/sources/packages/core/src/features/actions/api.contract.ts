/** actions API: native oRPC declarations, no execution imports. */
import { apiProcedure } from '../../shared/api/contract-base.js'
import {
  actionDetailSchema,
  actionLogSchema,
  actionSchema,
  actionWriteResultSchema,
  deleteResultSchema,
  pageSchema,
} from '../../contracts/projections.js'
import * as inputs from './contract.js'

export const actionsContract = {
  createAction: apiProcedure
    .route({ summary: 'Add action' })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.orpcCreateActionInput)
    .output(actionWriteResultSchema),
  listActions: apiProcedure
    .route({ summary: 'List actions' })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listActionsInput)
    .output(pageSchema(actionSchema)),
  getAction: apiProcedure
    .route({ summary: 'Read action details' })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.getActionInput)
    .output(actionDetailSchema),
  updateAction: apiProcedure
    .route({
      summary: 'Edit action details',
      description:
        'Patch action fields. Omit fields to preserve them; null may clear optional links and description, but cannot clear a set due date. Status changes belong to action-log creation; ordering belongs to reorderAction.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.updateActionInput)
    .output(actionWriteResultSchema),
  reorderAction: apiProcedure
    .route({ summary: 'Reorder action' })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.reorderActionInput)
    .output(actionWriteResultSchema),
  deleteAction: apiProcedure
    .route({
      summary: 'Delete action',
      description:
        'Permanently delete an owned action. Review gap: the existing ID-only API input needs reconciliation with the shared impact-preview and application-approval boundary.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.deleteActionInput)
    .output(deleteResultSchema),
}

export const actionLogsContract = {
  createActionLog: apiProcedure
    .route({
      summary: 'Add action log (status or comment)',
      description:
        'Append an action log with a status and optional comment. The action status changes in the same transaction; repeating a status with a comment is a valid log entry.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.orpcCreateActionLogInput)
    .output(actionWriteResultSchema),
  listActionLogs: apiProcedure
    .route({
      summary: 'List action logs',
      description: 'Read a bounded page of action logs for the selected action, newest first.',
    })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listActionLogsInput)
    .output(pageSchema(actionLogSchema)),
  clearActionLogComment: apiProcedure
    .route({ summary: 'Clear comment from action log' })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.clearActionLogCommentInput)
    .output(actionWriteResultSchema),
}
