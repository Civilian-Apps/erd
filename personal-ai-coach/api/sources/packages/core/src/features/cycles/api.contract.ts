import * as inputs from './inputs.js'
import {
  createCycle,
  deleteCycle,
  getActiveCycle,
  getCycle,
  listCycles,
  previewCycleDeletion,
  updateCycle,
} from './service.contract.js'
import { apiProcedure, defineServiceApi } from '../../shared/api/contract-base.js'
import { deleteCycleResultSchema, cycleDeletionPreviewSchema } from './outputs.js'
import { cycleDetailSchema, cycleWriteResultSchema } from '../../shared/projections.js'
import { pageSchema } from '../../shared/schemas.js'
import { cycleSchema } from './records.js'

export const cyclesContract = {
  create: defineServiceApi(
    createCycle,
    apiProcedure
      .route({
        summary: 'Start a cycle',
        description:
          'Create a cycle and archive the prior active cycle. Reuse the idempotency key and identical fields for retries. End date must be after start date. Original-outcome replay is a service obligation.',
      })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.orpcCreateCycleInput)
      .output(cycleWriteResultSchema),
  ),
  resolve_active: defineServiceApi(
    getActiveCycle,
    apiProcedure
      .route({
        summary: 'Resolve the active cycle and reconcile expiry',
        description:
          'Resolve the active cycle with lazy expiry. This operation may archive an expired cycle; it differs from the MCP stored-active lookup.',
      })
      .meta({
        access: 'retained-read',
        implementation: 'contract-only',
      })
      .input(inputs.getActiveCycleInput)
      .output(cycleSchema.nullable()),
  ),
  get: defineServiceApi(
    getCycle,
    apiProcedure
      .route({ summary: 'Read cycle details' })
      .meta({
        access: 'retained-read',
        implementation: 'contract-only',
      })
      .input(inputs.getCycleInput)
      .output(cycleDetailSchema),
  ),
  list: defineServiceApi(
    listCycles,
    apiProcedure
      .route({ summary: 'List cycles' })
      .meta({
        access: 'retained-read',
        implementation: 'contract-only',
      })
      .input(inputs.listCyclesInput)
      .output(pageSchema(cycleSchema)),
  ),
  update: defineServiceApi(
    updateCycle,
    apiProcedure
      .route({
        summary: 'Edit cycle details or status',
        description:
          'Patch an owned cycle by UUID or the stored active selector. Omitted fields stay unchanged; null intention clears it. Validate date ordering after merging with stored dates. Activating a cycle archives the incumbent.',
      })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.updateCycleInput)
      .output(cycleWriteResultSchema),
  ),
  preview_deletion: defineServiceApi(
    previewCycleDeletion,
    apiProcedure
      .route({
        summary: 'Preview cycle deletion impact',
        description:
          'Compute complete deletion impact and return a trusted application approval URL. A preview does not authorize deletion. Fail closed when impact cannot be established.',
      })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.previewCycleDeletionInput)
      .output(cycleDeletionPreviewSchema),
  ),
  delete: defineServiceApi(
    deleteCycle,
    apiProcedure
      .route({
        summary: 'Delete cycle',
        description:
          'Permanently delete the cycle and its dependants only after checking actor-bound application approval, preview expiry and unchanged impact in the transaction. A preview ID alone is not approval.',
      })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.deleteCycleInput)
      .output(deleteCycleResultSchema),
  ),
}
