import { objectiveDeletionPreviewSchema, objectiveListServiceSchema } from './outputs.js'
/** Pure service declarations; implementations live in service.ts. */
import { z } from 'zod'
import { deleteResultSchema } from '../../contracts/outputs.js'
import { objectiveDetailSchema, objectiveWriteResultSchema } from '../../contracts/projections.js'
import { defineService } from '../../contracts/service-types.js'
import * as inputs from './inputs.js'
export const createObjective = defineService(
  z.union([inputs.orpcCreateObjectiveInput, inputs.createObjectiveInput]),
  objectiveWriteResultSchema,
  {
    access: 'entitled-write',
    effect: 'write',
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
