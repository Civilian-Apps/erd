// Client-safe wire contract. Source: docs/ONTOLOGY.md entity and derived-value tables.
// Persistence mapping belongs to record-fragment.ts; no database runtime enters this file.
import { z } from 'zod'
import { idSchema, timestampSchema } from '../../shared/schemas.js'

export const profileSchema = z.strictObject({
  id: idSchema,
  name: z
    .string()
    .describe(
      'Chosen coaching/display name, used verbatim. Target UI prompt: What should we call you? Empty means unknown; no separate surname.',
    ),
  about_me: z.string().describe('UI label: About me.'),
  timezone: z
    .string()
    .min(1)
    .describe('UI label: Time zone. IANA zone used for calendar dates and boundaries.'),
})

export const userProfileSchema = profileSchema
  .extend({
    email: z.email(),
    subscription_status: z
      .enum(['incomplete', 'active', 'past_due', 'canceled'])
      .describe(
        'Derived from subscription, not a User column: active = Active, past_due = Payment failed, canceled = Canceled, incomplete = Awaiting payment. Only active grants paid access. Scheduled cancellation uses the separate flag; it is not a fifth status.',
      ),
    subscription_cancel_at_period_end: z
      .boolean()
      .describe('Derived from the selected local subscription; false when none exists.'),
    subscription_current_period_end: timestampSchema
      .nullable()
      .describe('Derived from the selected local subscription; null when none exists.'),
    connected: z
      .boolean()
      .describe(
        'True when an OAuth consent row exists for this user, for any client. Indicates prior authorization for onboarding, not current connector liveness.',
      ),
    created_at: timestampSchema,
  })
  .describe(
    'Account view: chosen name and profile from user, billing state from subscription, and connected from oauth_consent. Auth credentials and provider tokens are not exposed.',
  )

export const profileFragmentSchema = profileSchema

export const checkoutSessionResultSchema = z.strictObject({ url: z.url() })

// Web-only Settings display read; the local subscription projection stays the sole access source.
export const billingPlanSchema = z
  .strictObject({
    name: z.string().min(1).describe('UI label: Plan. Provider-backed name of the selected plan.'),
    amount_minor: z
      .number()
      .int()
      .nonnegative()
      .describe(
        'UI label: Price. Recurring plan amount in the currency minor unit; not an invoice total or a tax/credit promise.',
      ),
    currency: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .describe('Three-letter currency code, upper case.'),
    interval: z.literal('month').describe('One monthly plan only.'),
    interval_count: z.literal(1),
  })
  .describe('The selected subscription plan, read from the billing provider.')

export const billingDetailsSchema = z
  .strictObject({
    plan: billingPlanSchema
      .nullable()
      .describe('Null when the account has no subscription (shown as No subscription).'),
    payment_method: z
      .strictObject({
        display: z
          .string()
          .min(1)
          .describe(
            'UI label: Payment method. Display text only, for example Visa ending in 4242; never a full number, token or provider object.',
          ),
      })
      .nullable()
      .describe(
        'Null when no payment method applies (shown as No payment method); never a provider failure.',
      ),
    retrieved_at: timestampSchema.describe(
      'When these display details were fetched; not a subscription event ordering token.',
    ),
  })
  .describe(
    'Settings billing details. Display only: never grants or denies entitlement and is never persisted.',
  )

export const billingDetailsUnavailableData = z.strictObject({
  error_code: z.literal('billing_details_unavailable'),
  message: z.string().describe('Sanitized text: Billing details are temporarily unavailable.'),
  retryable: z.literal(true),
})

export const billingPortalSessionResultSchema = checkoutSessionResultSchema
