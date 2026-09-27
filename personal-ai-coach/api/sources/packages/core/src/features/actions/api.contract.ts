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
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.orpcCreateActionInput)
    .output(actionWriteResultSchema),
  listActions: apiProcedure
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listActionsInput)
    .output(pageSchema(actionSchema)),
  getAction: apiProcedure
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.getActionInput)
    .output(actionDetailSchema),
  updateAction: apiProcedure
    .route({
      description:
        'Patch action fields. Status changes belong to action-log creation; ordering belongs to reorderAction.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.updateActionInput)
    .output(actionWriteResultSchema),
  reorderAction: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.reorderActionInput)
    .output(actionWriteResultSchema),
  deleteAction: apiProcedure
    .route({
      description:
        'Permanently delete an owned action. Review gap: the existing ID-only API input needs reconciliation with the shared impact-preview and application-approval boundary.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.deleteActionInput)
    .output(deleteResultSchema),
}

export const actionLogsContract = {
  createActionLog: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.orpcCreateActionLogInput)
    .output(actionWriteResultSchema),
  listActionLog: apiProcedure
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listActionLogInput)
    .output(pageSchema(actionLogSchema)),
  clearActionLogComment: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.clearActionLogCommentInput)
    .output(actionWriteResultSchema),
}
