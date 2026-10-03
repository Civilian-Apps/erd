import * as inputs from './inputs.js'
import { closeSession, getSession, listSessions, loadBriefing } from './service.contract.js'
import { apiProcedure, defineServiceApi } from '../../shared/api/contract-base.js'
import { closeSessionResultSchema, loadBriefingResultSchema } from './outputs.js'
import { sessionDetailSchema } from '../../shared/projections.js'
import { pageSchema } from '../../shared/schemas.js'
import { sessionSchema } from './records.js'

export const sessionsContract = {
  start: defineServiceApi(
    loadBriefing,
    apiProcedure
      .route({
        summary: 'Start or resume a coaching session and load its briefing',
        description:
          'Starts or reuses a session and persists briefing notes; this operation has write effects. An unpaid account receives the declared enablement response instead of coaching state.',
      })
      .meta({
        access: 'session-start',
        implementation: 'contract-only',
      })
      .input(inputs.loadBriefingInput)
      .output(loadBriefingResultSchema),
  ),
  list: defineServiceApi(
    listSessions,
    apiProcedure
      .route({ summary: 'List coaching sessions' })
      .meta({
        access: 'retained-read',
        implementation: 'contract-only',
      })
      .input(inputs.listSessionsInput)
      .output(pageSchema(sessionSchema)),
  ),
  get: defineServiceApi(
    getSession,
    apiProcedure
      .route({ summary: 'Read coaching session details' })
      .meta({
        access: 'retained-read',
        implementation: 'contract-only',
      })
      .input(inputs.getSessionInput)
      .output(sessionDetailSchema),
  ),
  close: defineServiceApi(
    closeSession,
    apiProcedure
      .route({
        summary: 'Close coaching session and save summary',
        description:
          'Save the session summary and end time. Moving the session boundary affects subsequent reads on both surfaces.',
      })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.closeSessionInput)
      .output(closeSessionResultSchema),
  ),
}
