import { objectiveDeletionPreviewSchema } from './outputs.js'
import { serviceManifest } from '../../contracts/services.js'
/** objectives API: native oRPC declarations, no execution imports. */
import { apiProcedure } from '../../shared/api/contract-base.js'
import { deleteResultSchema } from '../../contracts/outputs.js'
import {
  objectiveDetailSchema,
  objectiveWriteResultSchema,
  pageSchema,
} from '../../contracts/projections.js'
import { objectiveSchema } from './record-contract.js'
import * as inputs from './inputs.js'

export const objectivesContract = {
  preview_deletion: apiProcedure
    .route({
      summary: 'Preview objective deletion impact',
      description:
        'Return complete server impact and a trusted application approval URL. Missing impact or approval blocks deletion; preview possession is not consent.',
    })
    .meta({
      service: serviceManifest.objectives.preview_deletion,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.previewObjectiveDeletionInput)
    .output(objectiveDeletionPreviewSchema),

  create: apiProcedure
    .route({ summary: 'Add objective' })
    .meta({
      service: serviceManifest.objectives.create,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.orpcCreateObjectiveInput)
    .output(objectiveWriteResultSchema),
  list: apiProcedure
    .route({ summary: 'List objectives' })
    .meta({
      service: serviceManifest.objectives.list,
      access: 'retained-read',
      implementation: 'contract-only',
    })
    .input(inputs.listObjectivesInput)
    .output(pageSchema(objectiveSchema)),
  get: apiProcedure
    .route({ summary: 'Read objective details' })
    .meta({
      service: serviceManifest.objectives.get,
      access: 'retained-read',
      implementation: 'contract-only',
    })
    .input(inputs.getObjectiveInput)
    .output(objectiveDetailSchema),
  update: apiProcedure
    .route({ summary: 'Edit objective' })
    .meta({
      service: serviceManifest.objectives.update,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.updateObjectiveInput)
    .output(objectiveWriteResultSchema),
  delete: apiProcedure
    .route({
      summary: 'Delete objective',
      description:
        'Permanently delete an owned objective. Requires an actor/target/impact/expiry-bound server preview and genuine application approval, checked and consumed atomically with deletion. Fail closed on incomplete or changed impact.',
    })
    .meta({
      service: serviceManifest.objectives.delete,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.deleteObjectiveInput)
    .output(deleteResultSchema),
}
