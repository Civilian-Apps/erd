/** Pure service declarations; implementations live in service.ts. */
import * as inputs from './inputs.js'
import { recordQuerySchema } from '../../shared/projections.js'
import { defineService } from '../../shared/services/definition.js'

export const queryRecord = defineService(inputs.queryRecordInput, recordQuerySchema, {
  access: 'retained-read',
  effect: 'read',
  retry: 'Safe to retry with the same resolved filters and cursor.',
  source: 'packages/core/src/features/record-query/service.contract.ts#queryRecord',
  requirement: 'docs/feature-specs/F7-sessions.md',
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
