/** objectives API: native oRPC declarations, no execution imports. */
import { apiProcedure } from '../../shared/api/contract-base.js'
import {
  deleteResultSchema,
  objectiveDetailSchema,
  objectiveSchema,
  objectiveWriteResultSchema,
  pageSchema,
} from '../../contracts/projections.js'
import * as inputs from './contract.js'

export const objectivesContract = {
  create: apiProcedure
    .route({ summary: 'Add objective' })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.orpcCreateObjectiveInput)
    .output(objectiveWriteResultSchema),
  list: apiProcedure
    .route({ summary: 'List objectives' })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listObjectivesInput)
    .output(pageSchema(objectiveSchema)),
  get: apiProcedure
    .route({ summary: 'Read objective details' })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.getObjectiveInput)
    .output(objectiveDetailSchema),
  update: apiProcedure
    .route({ summary: 'Edit objective' })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.updateObjectiveInput)
    .output(objectiveWriteResultSchema),
  delete: apiProcedure
    .route({
      summary: 'Delete objective',
      description:
        'Permanently delete an owned objective. Review gap: the existing ID-only API input needs reconciliation with the shared impact-preview and application-approval boundary.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.deleteObjectiveInput)
    .output(deleteResultSchema),
}
