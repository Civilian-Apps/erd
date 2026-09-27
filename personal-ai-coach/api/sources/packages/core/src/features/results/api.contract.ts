/** results API: native oRPC declarations, no execution imports. */
import { apiProcedure } from '../../shared/api/contract-base.js'
import {
  deleteResultSchema,
  habitMarkSchema,
  pageSchema,
  resultDetailSchema,
  resultSchema,
  resultUpdateSchema,
  resultWriteResultSchema,
} from '../../contracts/projections.js'
import * as inputs from './contract.js'

export const resultsContract = {
  createResult: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.orpcCreateResultInput)
    .output(resultWriteResultSchema),
  listResults: apiProcedure
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listResultsInput)
    .output(pageSchema(resultSchema)),
  getResult: apiProcedure
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.getResultInput)
    .output(resultDetailSchema),
  updateResult: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.updateResultInput)
    .output(resultWriteResultSchema),
  deleteResult: apiProcedure
    .route({
      description:
        'Permanently delete an owned result. Review gap: the existing ID-only API input needs reconciliation with the shared impact-preview and application-approval boundary.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.deleteResultInput)
    .output(deleteResultSchema),
}

export const resultUpdatesContract = {
  recordResultUpdate: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.orpcRecordResultUpdateInput)
    .output(resultWriteResultSchema),
  listResultUpdates: apiProcedure
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listResultUpdatesInput)
    .output(pageSchema(resultUpdateSchema)),
  clearResultUpdateComment: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.clearResultUpdateCommentInput)
    .output(resultWriteResultSchema),
  deleteResultUpdate: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.deleteResultUpdateInput)
    .output(resultWriteResultSchema),
}

export const habitMarksContract = {
  setHabitMark: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.setHabitMarkInput)
    .output(resultWriteResultSchema),
  listHabitMarks: apiProcedure
    .route({
      description:
        'Return the declared habit-mark array. Review gap: this existing signature has no cursor; reconcile bounded history before freezing this API contract.',
    })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listHabitMarksInput)
    .output(habitMarkSchema.array()),
}
