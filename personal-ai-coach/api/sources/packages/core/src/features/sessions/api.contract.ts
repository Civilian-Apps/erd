import { serviceManifest } from '../../contracts/services.js'
/** sessions API: native oRPC declarations, no execution imports. */
import { apiProcedure } from '../../shared/api/contract-base.js'
import { closeSessionResultSchema } from './outputs.js'
import {
  loadBriefingResultSchema,
  pageSchema,
  sessionDetailSchema,
} from '../../contracts/projections.js'
import { sessionSchema } from './record-contract.js'
import * as inputs from './inputs.js'

export const sessionsContract = {
  start: apiProcedure
    .route({
      summary: 'Start or resume a coaching session and load its briefing',
      description:
        'Starts or reuses a session and persists briefing notes; this operation has write effects. An unpaid account receives the declared enablement response instead of coaching state.',
    })
    .meta({
      service: serviceManifest.sessions.start,
      access: 'session-start',
      implementation: 'contract-only',
    })
    .input(inputs.loadBriefingInput)
    .output(loadBriefingResultSchema),
  list: apiProcedure
    .route({ summary: 'List coaching sessions' })
    .meta({
      service: serviceManifest.sessions.list,
      access: 'retained-read',
      implementation: 'contract-only',
    })
    .input(inputs.listSessionsInput)
    .output(pageSchema(sessionSchema)),
  get: apiProcedure
    .route({ summary: 'Read coaching session details' })
    .meta({
      service: serviceManifest.sessions.get,
      access: 'retained-read',
      implementation: 'contract-only',
    })
    .input(inputs.getSessionInput)
    .output(sessionDetailSchema),
  close: apiProcedure
    .route({
      summary: 'Close coaching session and save summary',
      description:
        'Save the session summary and end time. Moving the session boundary affects subsequent reads on both surfaces.',
    })
    .meta({
      service: serviceManifest.sessions.close,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.closeSessionInput)
    .output(closeSessionResultSchema),
}
