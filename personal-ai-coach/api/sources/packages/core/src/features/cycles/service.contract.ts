/** Pure service declarations; implementations live in service.ts. */
import {
  cycleDetailSchema,
  cycleWriteResultSchema,
  pageSchema,
} from '../../contracts/projections.js'
import { defineService } from '../../contracts/service-types.js'
import * as inputs from './inputs.js'
import { cycleDeletionPreviewSchema, deleteCycleResultSchema } from './outputs.js'
import { cycleSchema } from './record-contract.js'
export const createCycle = defineService(inputs.createCycleInput, cycleWriteResultSchema, {
  access: 'entitled-write',
  effect: 'write',
  retry:
    'Actor/operation/key-scoped original-outcome replay, including post-commit response failures.',
  source: 'packages/core/src/features/cycles/service.contract.ts#createCycle',
  requirement: 'docs/feature-specs/F2-cycles.md',
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
export const getActiveCycle = defineService(inputs.getActiveCycleInput, cycleSchema.nullable(), {
  access: 'retained-read',
  effect: 'write',
  retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
  source: 'packages/core/src/features/cycles/service.contract.ts#getActiveCycle',
  requirement: 'docs/feature-specs/F2-cycles.md',
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
export const getStoredActiveCycle = defineService(
  inputs.getActiveCycleInput,
  cycleSchema.nullable(),
  {
    access: 'retained-read',
    effect: 'read',
    retry: 'Safe to retry with the same resolved filters and cursor.',
    source: 'packages/core/src/features/cycles/service.contract.ts#getStoredActiveCycle',
    requirement: 'docs/feature-specs/F2-cycles.md',
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
export const previewCycleDeletion = defineService(
  inputs.previewCycleDeletionInput,
  cycleDeletionPreviewSchema,
  {
    access: 'entitled-write',
    effect: 'write',
    retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
    source: 'packages/core/src/features/cycles/service.contract.ts#previewCycleDeletion',
    requirement: 'docs/feature-specs/F2-cycles.md',
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
export const getCycle = defineService(inputs.getCycleInput, cycleDetailSchema, {
  access: 'retained-read',
  effect: 'read',
  retry: 'Safe to retry with the same resolved filters and cursor.',
  source: 'packages/core/src/features/cycles/service.contract.ts#getCycle',
  requirement: 'docs/feature-specs/F2-cycles.md',
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
export const listCycles = defineService(inputs.listCyclesInput, pageSchema(cycleSchema), {
  access: 'retained-read',
  effect: 'read',
  retry: 'Safe to retry with the same resolved filters and cursor.',
  source: 'packages/core/src/features/cycles/service.contract.ts#listCycles',
  requirement: 'docs/feature-specs/F2-cycles.md',
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
export const updateCycle = defineService(inputs.updateCycleInput, cycleWriteResultSchema, {
  access: 'entitled-write',
  effect: 'write',
  retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
  source: 'packages/core/src/features/cycles/service.contract.ts#updateCycle',
  requirement: 'docs/feature-specs/F2-cycles.md',
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
export const deleteCycle = defineService(inputs.deleteCycleInput, deleteCycleResultSchema, {
  access: 'entitled-write',
  effect: 'delete',
  retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
  source: 'packages/core/src/features/cycles/service.contract.ts#deleteCycle',
  requirement: 'docs/feature-specs/F2-cycles.md',
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
