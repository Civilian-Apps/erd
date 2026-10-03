import * as inputs from './inputs.js'
import { queryRecord } from './service.contract.js'
import { apiProcedure, defineServiceApi } from '../../shared/api/contract-base.js'
import { recordQuerySchema } from '../../shared/projections.js'

export const recordQueryContract = {
  query: defineServiceApi(
    queryRecord,
    apiProcedure
      .route({
        summary: 'Read coaching context and history',
        description:
          'Read application context without session effects. History kinds require a window; explicit window bounds must increase. Date-only bounds resolve in the profile timezone. This generic reader is not an MCP tool.',
      })
      .meta({
        access: 'retained-read',
        implementation: 'contract-only',
      })
      .input(inputs.queryRecordInput)
      .output(recordQuerySchema),
  ),
}
