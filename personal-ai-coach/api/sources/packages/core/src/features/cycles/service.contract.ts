import * as inputs from './inputs.js'
import { cycleArchived, cycleCreated } from './events.js'
import { cycleDeletionPreviewSchema, deleteCycleResultSchema } from './outputs.js'
import { cycleDetailSchema, cycleWriteResultSchema } from '../../shared/projections.js'
import { pageSchema } from '../../shared/schemas.js'
import { defineService } from '../../shared/services/definition.js'
import { cycleSchema } from './records.js'

export const createCycle = defineService(inputs.createCycleInput, cycleWriteResultSchema, {
  emits: [
    { event: cycleCreated, when: 'After durable creation; no replay duplicate.' },
    {
      event: cycleArchived,
      when: 'When creation replaces an incumbent active cycle; reason replaced.',
    },
  ],
  access: 'entitled-write',
  effect: 'write',
  tables: { cycles: 'write', objectives: 'read', idempotency_keys: 'write' },
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
  emits: [
    {
      event: cycleArchived,
      when: 'When lazy expiry actually archives the active cycle; reason expired.',
    },
  ],
  access: 'retained-read',
  effect: 'write',
  tables: { cycles: 'write' },
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
    tables: { cycles: 'read' },
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
    tables: {
      cycles: 'read',
      objectives: 'read',
      results: 'read',
      result_logs: 'read',
      habit_logs: 'read',
      actions: 'read',
      action_logs: 'read',
    },
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
  tables: { cycles: 'read', objectives: 'read' },
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
  tables: { cycles: 'read' },
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
  emits: [
    {
      event: cycleArchived,
      when: 'When status changes to archived (manual), or activation replaces the incumbent (replaced); never for date/field edits or no-op status.',
    },
  ],
  access: 'entitled-write',
  effect: 'write',
  tables: { cycles: 'write', objectives: 'read' },
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
  tables: { cycles: 'delete' },
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
