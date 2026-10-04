import * as inputs from './inputs.js'
import { objectiveCreated } from './events.js'
import { objectiveDeletionPreviewSchema, objectiveListServiceSchema } from './outputs.js'
import { objectiveDetailSchema, objectiveWriteResultSchema } from '../../shared/projections.js'
import { z } from 'zod'
import { deleteResultSchema } from '../../shared/schemas.js'
import { defineService } from '../../shared/services/definition.js'

export const createObjective = defineService(
  z.union([inputs.orpcCreateObjectiveInput, inputs.createObjectiveInput]),
  objectiveWriteResultSchema,
  {
    emits: [{ event: objectiveCreated, when: 'After durable creation; no replay duplicate.' }],
    access: 'entitled-write',
    effect: 'write',
    tables: {
      objectives: 'write',
      cycles: 'read',
      results: 'read',
      actions: 'read',
      idempotency_keys: 'write',
    },
    retry:
      'API requires client-key replay; unkeyed MCP calls must inspect state after an uncertain outcome.',
    source: 'packages/core/src/features/objectives/service.contract.ts#createObjective',
    requirement: 'docs/feature-specs/F3-objectives.md',
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

export const listObjectives = defineService(
  inputs.listObjectivesInput,
  objectiveListServiceSchema,
  {
    access: 'retained-read',
    effect: 'read',
    tables: { objectives: 'read' },
    retry: 'Safe to retry with the same resolved filters and cursor.',
    source: 'packages/core/src/features/objectives/service.contract.ts#listObjectives',
    requirement: 'docs/feature-specs/F3-objectives.md',
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

export const getObjective = defineService(inputs.getObjectiveInput, objectiveDetailSchema, {
  access: 'retained-read',
  effect: 'read',
  tables: { objectives: 'read', cycles: 'read', results: 'read', actions: 'read' },
  retry: 'Safe to retry with the same resolved filters and cursor.',
  source: 'packages/core/src/features/objectives/service.contract.ts#getObjective',
  requirement: 'docs/feature-specs/F3-objectives.md',
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

export const updateObjective = defineService(
  inputs.updateObjectiveInput,
  objectiveWriteResultSchema,
  {
    access: 'entitled-write',
    effect: 'write',
    tables: { objectives: 'write', cycles: 'read', results: 'read', actions: 'read' },
    retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
    source: 'packages/core/src/features/objectives/service.contract.ts#updateObjective',
    requirement: 'docs/feature-specs/F3-objectives.md',
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

export const deleteObjective = defineService(inputs.deleteObjectiveInput, deleteResultSchema, {
  access: 'entitled-write',
  effect: 'delete',
  tables: { objectives: 'delete' },
  retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
  source: 'packages/core/src/features/objectives/service.contract.ts#deleteObjective',
  requirement: 'docs/feature-specs/F3-objectives.md',
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

export const previewObjectiveDeletion = defineService(
  inputs.previewObjectiveDeletionInput,
  objectiveDeletionPreviewSchema,
  {
    access: 'entitled-write',
    effect: 'write',
    tables: {
      objectives: 'read',
      results: 'read',
      result_logs: 'read',
      habit_logs: 'read',
      actions: 'read',
      action_logs: 'read',
    },
    retry:
      'Preview does not authorize deletion. Commit rechecks actor, target, impact, expiry and application approval; incomplete impact fails closed.',
    source: 'packages/core/src/features/objectives/service.contract.ts#previewObjectiveDeletion',
    requirement: 'docs/feature-specs/F3-objectives.md',
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
