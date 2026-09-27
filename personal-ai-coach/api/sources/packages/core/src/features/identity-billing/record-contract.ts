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
  name: z.string(),
  about_me: z.string(),
  timezone: z.string().min(1),
})
export const userProfileSchema = profileSchema
  .extend({
    email: z.email(),
    subscription_status: z
      .enum(['incomplete', 'active', 'past_due', 'canceled'])
      .describe(
        'Derived from local subscription rows; not a User column. Only active grants paid access.',
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
