import { serviceManifest } from '../../contracts/services.js'
/** cycles API: native oRPC declarations, no execution imports. */
import { apiProcedure } from '../../shared/api/contract-base.js'
import {
  cycleDetailSchema,
  cycleWriteResultSchema,
  pageSchema,
} from '../../contracts/projections.js'
import { cycleSchema } from './record-contract.js'
import { deleteCycleResultSchema, cycleDeletionPreviewSchema } from './outputs.js'
import * as inputs from './inputs.js'

export const cyclesContract = {
  create: apiProcedure
    .route({
      summary: 'Start a cycle',
      description:
        'Create a cycle and archive the prior active cycle. Reuse the idempotency key and identical fields for retries. End date must be after start date. Original-outcome replay is a service obligation.',
    })
    .meta({
      service: serviceManifest.cycles.create,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.orpcCreateCycleInput)
    .output(cycleWriteResultSchema),
  resolve_active: apiProcedure
    .route({
      summary: 'Resolve the active cycle and reconcile expiry',
      description:
        'Resolve the active cycle with lazy expiry. This operation may archive an expired cycle; it differs from the MCP stored-active lookup.',
    })
    .meta({
      service: serviceManifest.cycles.resolve_active,
      access: 'retained-read',
      implementation: 'contract-only',
    })
    .input(inputs.getActiveCycleInput)
    .output(cycleSchema.nullable()),
  get: apiProcedure
    .route({ summary: 'Read cycle details' })
    .meta({
      service: serviceManifest.cycles.get,
      access: 'retained-read',
      implementation: 'contract-only',
    })
    .input(inputs.getCycleInput)
    .output(cycleDetailSchema),
  list: apiProcedure
    .route({ summary: 'List cycles' })
    .meta({
      service: serviceManifest.cycles.list,
      access: 'retained-read',
      implementation: 'contract-only',
    })
    .input(inputs.listCyclesInput)
    .output(pageSchema(cycleSchema)),
  update: apiProcedure
    .route({
      summary: 'Edit cycle details or status',
      description:
        'Patch an owned cycle by UUID or the stored active selector. Omitted fields stay unchanged; null intention clears it. Validate date ordering after merging with stored dates. Activating a cycle archives the incumbent.',
    })
    .meta({
      service: serviceManifest.cycles.update,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.updateCycleInput)
    .output(cycleWriteResultSchema),
  preview_deletion: apiProcedure
    .route({
      summary: 'Preview cycle deletion impact',
      description:
        'Compute complete deletion impact and return a trusted application approval URL. A preview does not authorize deletion. Fail closed when impact cannot be established.',
    })
    .meta({
      service: serviceManifest.cycles.preview_deletion,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.previewCycleDeletionInput)
    .output(cycleDeletionPreviewSchema),
  delete: apiProcedure
    .route({
      summary: 'Delete cycle',
      description:
        'Permanently delete the cycle and its dependants only after checking actor-bound application approval, preview expiry and unchanged impact in the transaction. A preview ID alone is not approval.',
    })
    .meta({
      service: serviceManifest.cycles.delete,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.deleteCycleInput)
    .output(deleteCycleResultSchema),
}
