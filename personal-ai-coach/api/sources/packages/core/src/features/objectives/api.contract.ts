import * as inputs from './inputs.js'
import {
  createObjective,
  deleteObjective,
  getObjective,
  listObjectives,
  previewObjectiveDeletion,
  updateObjective,
} from './service.contract.js'
import { objectiveDeletionPreviewSchema } from './outputs.js'
import { objectiveDetailSchema, objectiveWriteResultSchema } from '../../shared/projections.js'
import { apiProcedure, defineServiceApi } from '../../shared/api/contract-base.js'
import { deleteResultSchema, pageSchema } from '../../shared/schemas.js'
import { objectiveSchema } from './records.js'

export const objectivesContract = {
  preview_deletion: defineServiceApi(
    previewObjectiveDeletion,
    apiProcedure
      .route({
        summary: 'Preview objective deletion impact',
        description:
          'Return complete server impact and a trusted application approval URL. Missing impact or approval blocks deletion; preview possession is not consent.',
      })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.previewObjectiveDeletionInput)
      .output(objectiveDeletionPreviewSchema),
  ),

  create: defineServiceApi(
    createObjective,
    apiProcedure
      .route({ summary: 'Add objective' })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.orpcCreateObjectiveInput)
      .output(objectiveWriteResultSchema),
  ),
  list: defineServiceApi(
    listObjectives,
    apiProcedure
      .route({ summary: 'List objectives' })
      .meta({
        access: 'retained-read',
        implementation: 'contract-only',
      })
      .input(inputs.listObjectivesInput)
      .output(pageSchema(objectiveSchema)),
  ),
  get: defineServiceApi(
    getObjective,
    apiProcedure
      .route({ summary: 'Read objective details' })
      .meta({
        access: 'retained-read',
        implementation: 'contract-only',
      })
      .input(inputs.getObjectiveInput)
      .output(objectiveDetailSchema),
  ),
  update: defineServiceApi(
    updateObjective,
    apiProcedure
      .route({ summary: 'Edit objective' })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.updateObjectiveInput)
      .output(objectiveWriteResultSchema),
  ),
  delete: defineServiceApi(
    deleteObjective,
    apiProcedure
      .route({
        summary: 'Delete objective',
        description:
          'Permanently delete an owned objective. Requires an actor/target/impact/expiry-bound server preview and genuine application approval, checked and consumed atomically with deletion. Fail closed on incomplete or changed impact.',
      })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.deleteObjectiveInput)
      .output(deleteResultSchema),
  ),
}
