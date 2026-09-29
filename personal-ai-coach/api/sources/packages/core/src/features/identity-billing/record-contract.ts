// Client-safe wire contract. Source: docs/ONTOLOGY.md entity and derived-value tables.
// Persistence mapping belongs to record-fragment.ts; no database runtime enters this file.
import { z } from 'zod'
import {
  idSchema,
  dateSchema,
  timestampSchema,
  objectiveStatusSchema,
  resultStatusSchema,
  actionStatusSchema,
  sessionTypeSchema,
  metricTypeSchema,
  cadenceSchema,
} from '../../contracts/input.js'
import { pageSchema } from '../../contracts/paging.js'
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
export const billingPortalSessionResultSchema = checkoutSessionResultSchema
