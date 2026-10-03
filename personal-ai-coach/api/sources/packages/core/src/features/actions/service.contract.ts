import {
  actionDeletionPreviewSchema,
  actionHistorySchema,
  actionListServiceSchema,
} from './outputs.js'
/** Pure service declarations; implementations live in service.ts. */
import { z } from 'zod'
import { deleteResultSchema } from '../../contracts/outputs.js'
import {
  actionDetailSchema,
  actionWriteResultSchema,
  pageSchema,
} from '../../contracts/projections.js'
import { defineService } from '../../contracts/service-types.js'
import * as inputs from './inputs.js'
import { actionLogSchema } from './record-contract.js'
export const createAction = defineService(
  z.union([inputs.orpcCreateActionInput, inputs.createActionInput]),
  actionWriteResultSchema,
  {
    access: 'entitled-write',
    effect: 'write',
    retry:
      'API requires client-key replay; unkeyed MCP calls must inspect state after an uncertain outcome.',
    source: 'packages/core/src/features/actions/service.contract.ts#createAction',
    requirement: 'docs/feature-specs/F5-actions.md',
    errors: [
      'UNAUTHORIZED',
      'BAD_REQUEST',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'NOT_IMPLEMENTED',
      'INTERNAL_SERVER_ERROR',
    ],
  },
)
export const listActions = defineService(inputs.listActionsInput, actionListServiceSchema, {
  access: 'retained-read',
  effect: 'read',
  retry: 'Safe to retry with the same resolved filters and cursor.',
  source: 'packages/core/src/features/actions/service.contract.ts#listActions',
  requirement: 'docs/feature-specs/F5-actions.md',
  errors: [
    'UNAUTHORIZED',
    'BAD_REQUEST',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'NOT_IMPLEMENTED',
    'INTERNAL_SERVER_ERROR',
  ],
})
export const getAction = defineService(inputs.getActionInput, actionDetailSchema, {
  access: 'retained-read',
  effect: 'read',
  retry: 'Safe to retry with the same resolved filters and cursor.',
  source: 'packages/core/src/features/actions/service.contract.ts#getAction',
  requirement: 'docs/feature-specs/F5-actions.md',
  errors: [
    'UNAUTHORIZED',
    'BAD_REQUEST',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'NOT_IMPLEMENTED',
    'INTERNAL_SERVER_ERROR',
  ],
})
export const updateAction = defineService(inputs.updateActionInput, actionWriteResultSchema, {
  access: 'entitled-write',
  effect: 'write',
  retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
  source: 'packages/core/src/features/actions/service.contract.ts#updateAction',
  requirement: 'docs/feature-specs/F5-actions.md',
  errors: [
    'UNAUTHORIZED',
    'BAD_REQUEST',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'NOT_IMPLEMENTED',
    'INTERNAL_SERVER_ERROR',
  ],
})
export const reorderAction = defineService(inputs.reorderActionInput, actionWriteResultSchema, {
  access: 'entitled-write',
  effect: 'write',
  retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
  source: 'packages/core/src/features/actions/service.contract.ts#reorderAction',
  requirement: 'docs/feature-specs/F5-actions.md',
  errors: [
    'UNAUTHORIZED',
    'BAD_REQUEST',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'NOT_IMPLEMENTED',
    'INTERNAL_SERVER_ERROR',
  ],
})
export const deleteAction = defineService(inputs.deleteActionInput, deleteResultSchema, {
  access: 'entitled-write',
  effect: 'delete',
  retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
  source: 'packages/core/src/features/actions/service.contract.ts#deleteAction',
  requirement: 'docs/feature-specs/F5-actions.md',
  errors: [
    'UNAUTHORIZED',
    'BAD_REQUEST',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'NOT_IMPLEMENTED',
    'INTERNAL_SERVER_ERROR',
  ],
})
export const createActionLog = defineService(
  z.union([inputs.orpcCreateActionLogInput, inputs.createActionLogInput]),
  actionWriteResultSchema,
  {
    access: 'entitled-write',
    effect: 'write',
    retry:
      'API requires client-key replay; unkeyed MCP calls must inspect state after an uncertain outcome.',
    source: 'packages/core/src/features/actions/service.contract.ts#createActionLog',
    requirement: 'docs/feature-specs/F5-actions.md',
    errors: [
      'UNAUTHORIZED',
      'BAD_REQUEST',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'NOT_IMPLEMENTED',
      'INTERNAL_SERVER_ERROR',
    ],
  },
)
export const listActionLogs = defineService(
  inputs.listActionLogsInput,
  pageSchema(actionLogSchema),
  {
    access: 'retained-read',
    effect: 'read',
    retry: 'Safe to retry with the same resolved filters and cursor.',
    source: 'packages/core/src/features/actions/service.contract.ts#listActionLogs',
    requirement: 'docs/feature-specs/F5-actions.md',
    errors: [
      'UNAUTHORIZED',
      'BAD_REQUEST',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'NOT_IMPLEMENTED',
      'INTERNAL_SERVER_ERROR',
    ],
  },
)
export const clearActionLogComment = defineService(
  inputs.clearActionLogCommentInput,
  actionWriteResultSchema,
  {
    access: 'entitled-write',
    effect: 'write',
    retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
    source: 'packages/core/src/features/actions/service.contract.ts#clearActionLogComment',
    requirement: 'docs/feature-specs/F5-actions.md',
    errors: [
      'UNAUTHORIZED',
      'BAD_REQUEST',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'NOT_IMPLEMENTED',
      'INTERNAL_SERVER_ERROR',
    ],
  },
)

export const previewActionDeletion = defineService(
  inputs.previewActionDeletionInput,
  actionDeletionPreviewSchema,
  {
    access: 'entitled-write',
    effect: 'write',
    retry:
      'Preview does not authorize deletion. Commit rechecks actor, target, impact, expiry and application approval; incomplete impact fails closed.',
    source: 'packages/core/src/features/actions/service.contract.ts#previewActionDeletion',
    requirement: 'docs/feature-specs/F5-actions.md',
    errors: [
      'UNAUTHORIZED',
      'BAD_REQUEST',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'NOT_IMPLEMENTED',
      'INTERNAL_SERVER_ERROR',
    ],
  },
)

export const readActionHistory = defineService(inputs.actionHistoryInput, actionHistorySchema, {
  access: 'retained-read',
  effect: 'read',
  retry: 'Safe to retry with the same resolved filters and cursor.',
  source: 'packages/core/src/features/actions/service.contract.ts#readActionHistory',
  requirement: 'docs/feature-specs/F5-actions.md',
  errors: [
    'UNAUTHORIZED',
    'BAD_REQUEST',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'NOT_IMPLEMENTED',
    'INTERNAL_SERVER_ERROR',
  ],
})
