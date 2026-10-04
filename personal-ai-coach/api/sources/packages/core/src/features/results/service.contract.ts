import * as inputs from './inputs.js'
import { resultUpdateRecorded } from './events.js'
import { resultDeletionPreviewSchema, resultHistorySchema } from './outputs.js'
import { resultDetailSchema, resultWriteResultSchema } from '../../shared/projections.js'
import { z } from 'zod'
import { deleteResultSchema, pageSchema } from '../../shared/schemas.js'
import { defineService } from '../../shared/services/definition.js'
import { habitLogSchema, resultLogSchema, resultSchema } from './records.js'

export const createResult = defineService(
  z.union([inputs.orpcCreateResultInput, inputs.createResultInput]),
  resultWriteResultSchema,
  {
    access: 'entitled-write',
    effect: 'write',
    tables: {
      results: 'write',
      cycles: 'read',
      objectives: 'read',
      result_logs: 'read',
      habit_logs: 'read',
      idempotency_keys: 'write',
    },
    retry:
      'API requires client-key replay; unkeyed MCP calls must inspect state after an uncertain outcome.',
    source: 'packages/core/src/features/results/service.contract.ts#createResult',
    requirement: 'docs/feature-specs/F4-results.md',
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

export const listResults = defineService(inputs.listResultsInput, pageSchema(resultSchema), {
  access: 'retained-read',
  effect: 'read',
  tables: { results: 'read', cycles: 'read' },
  retry: 'Safe to retry with the same resolved filters and cursor.',
  source: 'packages/core/src/features/results/service.contract.ts#listResults',
  requirement: 'docs/feature-specs/F4-results.md',
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

export const getResult = defineService(inputs.getResultInput, resultDetailSchema, {
  access: 'retained-read',
  effect: 'read',
  tables: {
    results: 'read',
    cycles: 'read',
    objectives: 'read',
    result_logs: 'read',
    habit_logs: 'read',
  },
  retry: 'Safe to retry with the same resolved filters and cursor.',
  source: 'packages/core/src/features/results/service.contract.ts#getResult',
  requirement: 'docs/feature-specs/F4-results.md',
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

export const updateResult = defineService(inputs.updateResultInput, resultWriteResultSchema, {
  access: 'entitled-write',
  effect: 'write',
  tables: {
    results: 'write',
    cycles: 'read',
    objectives: 'read',
    result_logs: 'read',
    habit_logs: 'read',
  },
  retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
  source: 'packages/core/src/features/results/service.contract.ts#updateResult',
  requirement: 'docs/feature-specs/F4-results.md',
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

export const deleteResult = defineService(inputs.deleteResultInput, deleteResultSchema, {
  access: 'entitled-write',
  effect: 'delete',
  tables: { results: 'delete' },
  retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
  source: 'packages/core/src/features/results/service.contract.ts#deleteResult',
  requirement: 'docs/feature-specs/F4-results.md',
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

export const createResultLog = defineService(
  z.union([inputs.orpcCreateResultLogInput, inputs.createResultLogInput]),
  resultWriteResultSchema,
  {
    emits: [
      {
        event: resultUpdateRecorded,
        when: 'When numeric/performance evidence or a milestone flip is saved; not comment-only rows.',
      },
    ],
    access: 'entitled-write',
    effect: 'write',
    tables: {
      result_logs: 'write',
      results: 'read',
      cycles: 'read',
      objectives: 'read',
      habit_logs: 'read',
      idempotency_keys: 'write',
    },
    retry:
      'API requires client-key replay; unkeyed MCP calls must inspect state after an uncertain outcome.',
    source: 'packages/core/src/features/results/service.contract.ts#createResultLog',
    requirement: 'docs/feature-specs/F4-results.md',
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

export const listResultLogs = defineService(
  inputs.listResultLogsInput,
  pageSchema(resultLogSchema),
  {
    access: 'retained-read',
    effect: 'read',
    tables: { result_logs: 'read' },
    retry: 'Safe to retry with the same resolved filters and cursor.',
    source: 'packages/core/src/features/results/service.contract.ts#listResultLogs',
    requirement: 'docs/feature-specs/F4-results.md',
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

export const clearResultLogComment = defineService(
  inputs.clearResultLogCommentInput,
  resultWriteResultSchema,
  {
    access: 'entitled-write',
    effect: 'write',
    tables: {
      result_logs: 'write',
      results: 'read',
      cycles: 'read',
      objectives: 'read',
      habit_logs: 'read',
    },
    retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
    source: 'packages/core/src/features/results/service.contract.ts#clearResultLogComment',
    requirement: 'docs/feature-specs/F4-results.md',
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

export const deleteResultLog = defineService(inputs.deleteResultLogInput, resultWriteResultSchema, {
  access: 'entitled-write',
  effect: 'delete',
  tables: {
    result_logs: 'delete',
    results: 'read',
    cycles: 'read',
    objectives: 'read',
    habit_logs: 'read',
  },
  retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
  source: 'packages/core/src/features/results/service.contract.ts#deleteResultLog',
  requirement: 'docs/feature-specs/F4-results.md',
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

export const setHabitLog = defineService(inputs.setHabitLogInput, resultWriteResultSchema, {
  emits: [
    {
      event: resultUpdateRecorded,
      when: 'When a habit mark/unmark changes recorded progress; not comment-only changes or replay.',
    },
  ],
  access: 'entitled-write',
  effect: 'write',
  tables: {
    habit_logs: 'write',
    results: 'read',
    cycles: 'read',
    objectives: 'read',
    result_logs: 'read',
  },
  retry:
    'Repeated desired day state is safe; a comment is evidence and must not be blindly repeated.',
  source: 'packages/core/src/features/results/service.contract.ts#setHabitLog',
  requirement: 'docs/feature-specs/F4-results.md',
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

export const listHabitLogs = defineService(inputs.listHabitLogsInput, pageSchema(habitLogSchema), {
  access: 'retained-read',
  effect: 'read',
  tables: { habit_logs: 'read' },
  retry: 'Safe to retry with the same resolved filters and cursor.',
  source: 'packages/core/src/features/results/service.contract.ts#listHabitLogs',
  requirement: 'docs/feature-specs/F4-results.md',
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

export const previewResultDeletion = defineService(
  inputs.previewResultDeletionInput,
  resultDeletionPreviewSchema,
  {
    access: 'entitled-write',
    effect: 'write',
    tables: { results: 'read', result_logs: 'read', habit_logs: 'read' },
    retry:
      'Preview does not authorize deletion. Commit rechecks actor, target, impact, expiry and application approval; incomplete impact fails closed.',
    source: 'packages/core/src/features/results/service.contract.ts#previewResultDeletion',
    requirement: 'docs/feature-specs/F4-results.md',
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

export const readResultHistory = defineService(inputs.resultHistoryInput, resultHistorySchema, {
  access: 'retained-read',
  effect: 'read',
  tables: { results: 'read', result_logs: 'read', habit_logs: 'read' },
  retry: 'Safe to retry with the same resolved filters and cursor.',
  source: 'packages/core/src/features/results/service.contract.ts#readResultHistory',
  requirement: 'docs/feature-specs/F4-results.md',
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
