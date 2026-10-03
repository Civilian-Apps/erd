/** Feature-owned input schemas shared by permitted transports. */
import { z } from 'zod'
import { emptyInputSchema, ianaTimezoneSchema } from '../../shared/schemas.js'

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
    timezone: ianaTimezoneSchema
      .describe('UI label: Time zone. IANA zone used for calendar dates and boundaries.')
      .optional(),
  })
  .strict()

export const deleteUserInput = z.object({ password: z.string().min(1) }).strict()

export const createCheckoutSessionInput = emptyInputSchema

export const createBillingPortalSessionInput = emptyInputSchema

export const getBillingDetailsInput = emptyInputSchema
