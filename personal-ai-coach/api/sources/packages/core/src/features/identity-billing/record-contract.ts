// Client-safe wire contract. Source: docs/ONTOLOGY.md entity and derived-value tables.
// Persistence mapping belongs to record-fragment.ts; no database runtime enters this file.
import { z } from 'zod'
import { idSchema, dateSchema, timestampSchema, objectiveStatusSchema, resultStatusSchema,
  actionStatusSchema, sessionTypeSchema, metricTypeSchema, cadenceSchema } from '../../contracts/input.js'
import { pageSchema } from '../../contracts/paging.js'
export const profileSchema = z.strictObject({
 id: idSchema, name: z.string(),
 about_me: z.string(), timezone: z.string().min(1),
})
export const userProfileSchema = profileSchema.extend({
 email: z.email(), subscription_status: z.enum(['incomplete','active','past_due','canceled']),
 subscription_cancel_at_period_end: z.boolean(), subscription_current_period_end: timestampSchema.nullable(),
 created_at: timestampSchema,
})
export const profileFragmentSchema = profileSchema

export const checkoutSessionResultSchema = z.strictObject({ url: z.url() })
export const billingPortalSessionResultSchema = checkoutSessionResultSchema
