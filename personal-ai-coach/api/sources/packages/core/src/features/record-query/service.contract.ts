/** Pure service declarations; implementations live in service.ts. */
import { recordQuerySchema } from '../../contracts/projections.js'
import { defineService } from '../../contracts/service-types.js'
import * as inputs from './inputs.js'
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
