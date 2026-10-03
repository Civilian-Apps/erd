import {
  billingDetailsSchema,
  billingDetailsUnavailableData,
  billingPortalSessionResultSchema,
  checkoutSessionResultSchema,
} from './record-contract.js'
/** identity-billing API: native oRPC declarations, no execution imports. */
import { apiProcedure } from '../../shared/api/contract-base.js'
import {
  deleteResultSchema,
  userProfileSchema,
  userWriteResultSchema,
} from '../../contracts/projections.js'
import * as inputs from './contract.js'

export const userContract = {
  get: apiProcedure
    .route({
      summary: 'Read profile and subscription',
      description:
        'Read the authenticated account profile with locally derived subscription state and onboarding connection status. No live billing request; no auth credentials in the response.',
    })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.getUserInput)
    .output(userProfileSchema),
  update: apiProcedure
    .route({
      summary: 'Edit profile',
      description:
        'Edit the chosen name, About me and time zone. An account action, not a paid coaching write: it stays available on the web when the subscription is past due, canceled or incomplete. The chat tool user_update still requires an active subscription.',
    })
    .meta({ access: 'account-management', implementation: 'contract-only' })
    .input(inputs.updateUserInput)
    .output(userWriteResultSchema),
  delete: apiProcedure
    .route({
      summary: 'Delete account',
      description:
        'Web-only account deletion. Requires fresh identity confirmation; do not infer authorization from possession of an account ID.',
    })
    .meta({ access: 'account-management', implementation: 'contract-only' })
    .input(inputs.deleteUserInput)
    .output(deleteResultSchema),
}

export const billingContract = {
  create_checkout_session: apiProcedure
    .route({
      summary: 'Subscribe or resubscribe (open checkout)',
      description:
        'Create a checkout session for a new subscription: the first one from Onboarding, or a replacement from the Settings action Resubscribe after a canceled plan. The billing portal cannot start a subscription. The existing billing customer is reused. Refused with CONFLICT when an active or past-due subscription exists; those are managed in the billing portal. A browser return from checkout does not establish entitlement; subscription state follows verified billing events.',
    })
    .meta({ access: 'account-management', implementation: 'contract-only' })
    .input(inputs.createCheckoutSessionInput)
    .output(checkoutSessionResultSchema),
  create_portal_session: apiProcedure
    .route({
      summary: 'Manage subscription (open billing portal)',
      description:
        'Return a billing portal URL for the authenticated account; the client opens it for the Settings actions Manage subscription and Fix payment. It manages an existing subscription and cannot start a new one. A billing portal session is separate from a coaching session.',
    })
    .meta({ access: 'account-management', implementation: 'contract-only' })
    .input(inputs.createBillingPortalSessionInput)
    .output(billingPortalSessionResultSchema),
  get_details: apiProcedure
    .route({
      summary: 'Read billing details (Settings)',
      description:
        'Web-only read of the selected subscription plan, price and effective payment method for Settings. The account and customer resolve server-side. This is the only read that may contact the billing provider; user.get and coaching reads never do. No subscription returns null plan and payment method without a provider call. A transient provider failure returns SERVICE_UNAVAILABLE with error_code billing_details_unavailable; unsupported or unresolvable billing data also fails explicitly and is never reported as no subscription. Display only: it never grants entitlement, and a portal return re-reads it. Not an MCP tool.',
    })
    .meta({ access: 'account-management', implementation: 'contract-only' })
    .errors({
      SERVICE_UNAVAILABLE: { status: 503, data: billingDetailsUnavailableData },
    })
    .input(inputs.getBillingDetailsInput)
    .output(billingDetailsSchema),
}
