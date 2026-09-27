import { billingPortalSessionResultSchema, checkoutSessionResultSchema } from './record-contract.js'
/** identity-billing API: native oRPC declarations, no execution imports. */
import { apiProcedure } from '../../shared/api/contract-base.js'
import {
  deleteResultSchema,
  userProfileSchema,
  userWriteResultSchema,
} from '../../contracts/projections.js'
import * as inputs from './contract.js'

export const userContract = {
  getUser: apiProcedure
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.getUserInput)
    .output(userProfileSchema),
  updateUser: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.updateUserInput)
    .output(userWriteResultSchema),
  deleteUser: apiProcedure
    .route({
      description:
        'Web-only account deletion. Requires fresh identity confirmation; do not infer authorization from possession of an account ID.',
    })
    .meta({ access: 'account-management', implementation: 'contract-only' })
    .input(inputs.deleteUserInput)
    .output(deleteResultSchema),
}

export const billingContract = {
  createCheckoutSession: apiProcedure
    .route({
      description:
        'Create a checkout session for subscription setup. A browser return from checkout does not establish entitlement; subscription state follows verified billing events.',
    })
    .meta({ access: 'account-management', implementation: 'contract-only' })
    .input(inputs.createCheckoutSessionInput)
    .output(checkoutSessionResultSchema),
  createBillingPortalSession: apiProcedure
    .route({ description: 'Create a billing portal session for the authenticated account.' })
    .meta({ access: 'account-management', implementation: 'contract-only' })
    .input(inputs.createBillingPortalSessionInput)
    .output(billingPortalSessionResultSchema),
}
