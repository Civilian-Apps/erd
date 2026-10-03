import { sessionListServiceSchema, storedSessionSchema } from './outputs.js'
/** Pure service declarations; implementations live in service.ts. */
import { loadBriefingResultSchema, sessionDetailSchema } from '../../contracts/projections.js'
import { defineService } from '../../contracts/service-types.js'
import * as inputs from './inputs.js'
import { closeSessionResultSchema } from './outputs.js'
export const loadBriefing = defineService(inputs.loadBriefingInput, loadBriefingResultSchema, {
  access: 'session-start',
  trustedContext: 'session-origin',
  effect: 'write',
  retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
  source: 'packages/core/src/features/sessions/service.contract.ts#loadBriefing',
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
export const listSessions = defineService(inputs.listSessionsInput, sessionListServiceSchema, {
  access: 'retained-read',
  effect: 'read',
  retry: 'Safe to retry with the same resolved filters and cursor.',
  source: 'packages/core/src/features/sessions/service.contract.ts#listSessions',
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
export const getSession = defineService(inputs.getSessionInput, sessionDetailSchema, {
  access: 'retained-read',
  effect: 'read',
  retry: 'Safe to retry with the same resolved filters and cursor.',
  source: 'packages/core/src/features/sessions/service.contract.ts#getSession',
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
export const closeSession = defineService(inputs.closeSessionInput, closeSessionResultSchema, {
  access: 'entitled-write',
  effect: 'write',
  retry: 'Return the originally saved closure on retry; never overwrite its summary.',
  source: 'packages/core/src/features/sessions/service.contract.ts#closeSession',
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

export const readStoredSession = defineService(inputs.readStoredSessionInput, storedSessionSchema, {
  access: 'retained-read',
  effect: 'read',
  retry: 'Safe to retry with the same resolved filters and cursor.',
  source: 'packages/core/src/features/sessions/service.contract.ts#readStoredSession',
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
