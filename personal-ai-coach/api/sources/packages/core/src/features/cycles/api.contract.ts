/** cycles API: native oRPC declarations, no execution imports. */
import { apiProcedure } from '../../shared/api/contract-base.js'
import {
  cycleDetailSchema,
  cycleSchema,
  cycleWriteResultSchema,
  deleteCycleResultSchema,
  cycleDeletionPreviewSchema,
  pageSchema,
} from '../../contracts/projections.js'
import * as inputs from './inputs.js'

export const cyclesContract = {
  createCycle: apiProcedure
    .route({
      description:
        'Create a cycle and archive the prior active cycle. Reuse the idempotency key and identical fields for retries. End date must be after start date. Original-outcome replay is a service obligation.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.orpcCreateCycleInput)
    .output(cycleWriteResultSchema),
  getActiveCycle: apiProcedure
    .route({
      description:
        'Resolve the active cycle with lazy expiry. This API read may archive an expired cycle; it differs from the MCP stored-active lookup.',
    })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.getActiveCycleInput)
    .output(cycleSchema.nullable()),
  getCycle: apiProcedure
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.getCycleInput)
    .output(cycleDetailSchema),
  listCycles: apiProcedure
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listCyclesInput)
    .output(pageSchema(cycleSchema)),
  updateCycle: apiProcedure
    .route({
      description:
        'Patch an owned cycle by UUID or the stored active selector. Omitted fields stay unchanged; null intention clears it. Validate date ordering after merging with stored dates. Activating a cycle archives the incumbent.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.updateCycleInput)
    .output(cycleWriteResultSchema),
  previewCycleDeletion: apiProcedure
    .route({
      description:
        'Compute complete deletion impact and return a trusted application approval URL. A preview does not authorize deletion. Fail closed when impact cannot be established.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.previewCycleDeletionInput)
    .output(cycleDeletionPreviewSchema),
  deleteCycle: apiProcedure
    .route({
      description:
        'Permanently delete the cycle and its dependants only after checking actor-bound application approval, preview expiry and unchanged impact in the transaction. A preview ID alone is not approval.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.deleteCycleInput)
    .output(deleteCycleResultSchema),
}
