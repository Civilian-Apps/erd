/** Pure product-event contracts. Emission is an implementation obligation. */
import { z } from 'zod'
import { billingPlanSchema } from './records.js'
import { idSchema } from '../../shared/schemas.js'
import { defineEvent } from '../../shared/events/definition.js'

export const accountCreated = defineEvent(
  'account_created',
  z.strictObject({ user_id: idSchema }),
  {
    requirement: 'docs/feature-specs/F1-identity.md',
    description: 'Durable account creation; user_id matches the canonical user UUID.',
    externalProducers: [
      {
        kind: 'auth-hook',
        source: 'packages/core/src/shared/auth/server.ts',
        when: 'After a newly persisted account.',
      },
    ],
  },
)

export const subscriptionStarted = defineEvent(
  'subscription_started',
  z.strictObject({
    plan: billingPlanSchema.shape.name,
    price: billingPlanSchema.shape.amount_minor.describe(
      'Configured POC monthly price in GBP minor units; 500 means £5.',
    ),
  }),
  {
    requirement: 'docs/feature-specs/F1-identity.md',
    description: 'First transition to active paid access.',
    externalProducers: [
      {
        kind: 'billing-webhook',
        source: 'packages/core/src/features/identity-billing/handler.ts',
        when: 'On the first verified transition to active; not checkout URL creation.',
      },
    ],
  },
)

export const subscriptionCancelled = defineEvent(
  'subscription_cancelled',
  z.strictObject({
    tenure_days: z.number().int().nonnegative(),
    reason_code: z.string().nullable(),
    reason_text: z.string().optional(),
  }),
  {
    requirement: 'docs/feature-specs/F1-identity.md',
    description: 'Once per scheduled or immediate cancellation; no duplicate webhook delivery.',
    externalProducers: [
      {
        kind: 'billing-webhook',
        source: 'packages/core/src/features/identity-billing/handler.ts',
        when: 'On a newly applied scheduled or immediate cancellation, not a duplicate delivery.',
      },
    ],
  },
)

export const connectorAuthorised = defineEvent('connector_authorised', z.strictObject({}), {
  requirement: 'docs/feature-specs/F1-identity.md',
  description: 'New durable connector consent; not a replay.',
  externalProducers: [
    {
      kind: 'auth-hook',
      source: 'packages/core/src/shared/auth/server.ts',
      when: 'After new connector consent is persisted.',
    },
  ],
})

export const onboardingStepCompleted = defineEvent(
  'onboarding_step_completed',
  z.strictObject({ step: z.union([z.literal(1), z.literal(2), z.literal(3)]) }),
  {
    requirement: 'docs/feature-specs/F1-identity.md',
    description: 'Verified onboarding step completion; never inferred from a redirect alone.',
    externalProducers: [
      {
        kind: 'page',
        source: 'packages/core/src/features/identity-billing/onboarding.page.tsx',
        when: 'After verified step completion; no new public event API is authorized.',
      },
    ],
    gaps: [
      'Specify trusted server recording and repeat-visit deduplication; the page alone is not an authorized event writer.',
    ],
  },
)

export const profileUpdated = defineEvent(
  'profile_updated',
  z.strictObject({ fields: z.array(z.enum(['name', 'about_me', 'timezone'])).min(1) }),
  {
    requirement: 'docs/feature-specs/F1-identity.md',
    description: 'Changed profile field names only; never profile content.',
  },
)

export const accountDeleted = defineEvent('account_deleted', z.strictObject({}), {
  requirement: 'docs/feature-specs/F1-identity.md',
  description:
    'Successful account deletion; record in the deletion transaction before removing the user so the existing ON DELETE SET NULL preserves the event.',
})
