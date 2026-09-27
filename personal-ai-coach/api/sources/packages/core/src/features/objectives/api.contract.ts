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
  createObjective: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.orpcCreateObjectiveInput)
    .output(objectiveWriteResultSchema),
  listObjectives: apiProcedure
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listObjectivesInput)
    .output(pageSchema(objectiveSchema)),
  getObjective: apiProcedure
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.getObjectiveInput)
    .output(objectiveDetailSchema),
  updateObjective: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.updateObjectiveInput)
    .output(objectiveWriteResultSchema),
  deleteObjective: apiProcedure
    .route({
      description:
        'Permanently delete an owned objective. Review gap: the existing ID-only API input needs reconciliation with the shared impact-preview and application-approval boundary.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.deleteObjectiveInput)
    .output(deleteResultSchema),
}
