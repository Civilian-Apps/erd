import * as inputs from './inputs.js'
import { accountDeleted, profileUpdated } from './events.js'
import { deleteResultSchema } from '../../shared/schemas.js'
import { defineService } from '../../shared/services/definition.js'
import { userWriteResultSchema } from './outputs.js'
import {
  billingDetailsSchema,
  billingPortalSessionResultSchema,
  checkoutSessionResultSchema,
  userProfileSchema,
} from './records.js'

export const getUser = defineService(inputs.getUserInput, userProfileSchema, {
  access: 'retained-read',
  effect: 'read',
  tables: { user: 'read', subscription: 'read', oauth_consent: 'read' },
  retry: 'Safe to retry with the same resolved filters and cursor.',
  source: 'packages/core/src/features/identity-billing/service.contract.ts#getUser',
  requirement: 'docs/feature-specs/F1-identity.md',
  errors: [
    'UNAUTHORIZED',
    'BAD_REQUEST',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'NOT_IMPLEMENTED',
    'INTERNAL_SERVER_ERROR',
  ],
})

export const updateUser = defineService(inputs.updateUserInput, userWriteResultSchema, {
  emits: [
    {
      event: profileUpdated,
      when: 'When at least one editable profile field changes; payload lists changed names only.',
    },
  ],
  access: 'account-management',
  effect: 'write',
  tables: { user: 'write', subscription: 'read', oauth_consent: 'read' },
  retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
  source: 'packages/core/src/features/identity-billing/service.contract.ts#updateUser',
  requirement: 'docs/feature-specs/F1-identity.md',
  errors: [
    'UNAUTHORIZED',
    'BAD_REQUEST',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'NOT_IMPLEMENTED',
    'INTERNAL_SERVER_ERROR',
  ],
})

export const deleteUser = defineService(inputs.deleteUserInput, deleteResultSchema, {
  emits: [
    {
      event: accountDeleted,
      when: 'In the successful deletion transaction, before user removal; ON DELETE SET NULL retains the event. Never on failed provider cancellation or replay.',
    },
  ],
  access: 'account-management',
  effect: 'delete',
  tables: { user: 'delete' },
  external: 'stripe',
  retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
  source: 'packages/core/src/features/identity-billing/service.contract.ts#deleteUser',
  requirement: 'docs/feature-specs/F1-identity.md',
  errors: [
    'UNAUTHORIZED',
    'BAD_REQUEST',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'NOT_IMPLEMENTED',
    'INTERNAL_SERVER_ERROR',
  ],
})

export const createCheckoutSession = defineService(
  inputs.createCheckoutSessionInput,
  checkoutSessionResultSchema,
  {
    access: 'account-management',
    effect: 'external',
    tables: { user: 'read', subscription: 'read' },
    external: 'stripe',
    retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
    source: 'packages/core/src/features/identity-billing/service.contract.ts#createCheckoutSession',
    requirement: 'docs/feature-specs/F1-identity.md',
    errors: [
      'UNAUTHORIZED',
      'BAD_REQUEST',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'NOT_IMPLEMENTED',
      'INTERNAL_SERVER_ERROR',
    ],
  },
)

export const createBillingPortalSession = defineService(
  inputs.createBillingPortalSessionInput,
  billingPortalSessionResultSchema,
  {
    access: 'account-management',
    effect: 'external',
    tables: { user: 'read' },
    external: 'stripe',
    retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
    source:
      'packages/core/src/features/identity-billing/service.contract.ts#createBillingPortalSession',
    requirement: 'docs/feature-specs/F1-identity.md',
    errors: [
      'UNAUTHORIZED',
      'BAD_REQUEST',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'NOT_IMPLEMENTED',
      'INTERNAL_SERVER_ERROR',
    ],
  },
)

export const getBillingDetails = defineService(
  inputs.getBillingDetailsInput,
  billingDetailsSchema,
  {
    access: 'account-management',
    effect: 'external',
    tables: { subscription: 'read' },
    external: 'stripe',
    retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
    source: 'packages/core/src/features/identity-billing/service.contract.ts#getBillingDetails',
    requirement: 'docs/feature-specs/F1-identity.md',
    errors: [
      'UNAUTHORIZED',
      'BAD_REQUEST',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'NOT_IMPLEMENTED',
      'INTERNAL_SERVER_ERROR',
      'SERVICE_UNAVAILABLE',
    ],
  },
)
