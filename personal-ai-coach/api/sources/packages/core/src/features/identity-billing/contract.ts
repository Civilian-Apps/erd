/** Normative inputs: docs/ONTOLOGY.md and this feature's spec Interfaces. Client-safe. */
import { z } from 'zod'
import { emptyInputSchema } from '../../contracts/input.js'
export const getUserInput = emptyInputSchema
export const updateUserInput = z
  .object({
    name: z
      .string()
      .trim()
      .optional()
      .describe(
        'Chosen coaching/display name; use verbatim. Omit to preserve, empty text clears it.',
      ),
    about_me: z
      .string()
      .max(4000)
      .optional()
      .describe(
        'UI label: About me. Coaching context; omit to preserve, empty text clears it, null is invalid.',
      ),
    timezone: z
      .string()
      .refine((value) => {
        try {
          new Intl.DateTimeFormat('en', { timeZone: value })
          return true
        } catch {
          return false
        }
      }, 'Unknown IANA timezone')
      .describe('UI label: Time zone. IANA zone used for calendar dates and boundaries.')
      .optional(),
  })
  .strict()
export const deleteUserInput = z.object({ password: z.string().min(1) }).strict()
export const createCheckoutSessionInput = emptyInputSchema
export const createBillingPortalSessionInput = emptyInputSchema
// The account and customer resolve server-side; no user or customer ID is ever accepted.
export const getBillingDetailsInput = emptyInputSchema

import { profileSchema, changedSchema } from '../../contracts/projections.js'
export const userReadOutput = z.strictObject({ profile: profileSchema })
export const userUpdateOutput = z.strictObject({ profile: profileSchema, changed: changedSchema })
