import * as inputs from './inputs.js'
import { actionCreated, actionStatusChanged } from './events.js'
import {
  actionDeletionPreviewSchema,
  actionHistorySchema,
  actionListServiceSchema,
} from './outputs.js'
import { actionDetailSchema, actionWriteResultSchema } from '../../shared/projections.js'
import { z } from 'zod'
import { deleteResultSchema, pageSchema } from '../../shared/schemas.js'
import { defineService } from '../../shared/services/definition.js'
import { actionLogSchema } from './records.js'

export const createAction = defineService(
  z.union([inputs.orpcCreateActionInput, inputs.createActionInput]),
  actionWriteResultSchema,
  {
    emits: [{ event: actionCreated, when: 'After durable creation; no replay duplicate.' }],
    access: 'entitled-write',
    effect: 'write',
    tables: {
      actions: 'write',
      cycles: 'read',
      objectives: 'read',
      sessions: 'read',
      action_logs: 'read',
      idempotency_keys: 'write',
    },
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
  tables: { actions: 'read' },
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
  tables: {
    actions: 'read',
    cycles: 'read',
    objectives: 'read',
    sessions: 'read',
    action_logs: 'read',
  },
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
  tables: {
    actions: 'write',
    cycles: 'read',
    objectives: 'read',
    sessions: 'read',
    action_logs: 'read',
  },
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
  tables: {
    actions: 'write',
    cycles: 'read',
    objectives: 'read',
    sessions: 'read',
    action_logs: 'read',
  },
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
  tables: { actions: 'delete' },
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
    emits: [
      {
        event: actionStatusChanged,
        when: 'For each persisted log, including repeat status with comment; not receipt replay.',
      },
    ],
    access: 'entitled-write',
    effect: 'write',
    tables: {
      action_logs: 'write',
      actions: 'write',
      cycles: 'read',
      objectives: 'read',
      sessions: 'read',
      idempotency_keys: 'write',
    },
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
    tables: { action_logs: 'read' },
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
    tables: {
      action_logs: 'write',
      actions: 'read',
      cycles: 'read',
      objectives: 'read',
      sessions: 'read',
    },
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
    tables: { actions: 'read', action_logs: 'read' },
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
  tables: { actions: 'read', action_logs: 'read' },
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
