/** record-query API: native oRPC declarations, no execution imports. */
import { apiProcedure } from '../../shared/api/contract-base.js'
import { recordQuerySchema } from '../../contracts/projections.js'
import * as inputs from './contract.js'

export const recordQueryContract = {
  queryRecord: apiProcedure
    .route({
      summary: 'Read coaching context and history',
      description:
        'Read application context without session effects. History kinds require a window; explicit window bounds must increase. Date-only bounds resolve in the profile timezone. This generic reader is not an MCP tool.',
    })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.queryRecordInput)
    .output(recordQuerySchema),
}
