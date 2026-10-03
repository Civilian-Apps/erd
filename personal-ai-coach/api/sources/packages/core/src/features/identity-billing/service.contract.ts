/** Pure service declarations; implementations live in service.ts. */
import { deleteResultSchema } from '../../contracts/outputs.js'
import { defineService } from '../../contracts/service-types.js'
import * as inputs from './inputs.js'
import { userWriteResultSchema } from './outputs.js'
import {
  billingDetailsSchema,
  billingPortalSessionResultSchema,
  checkoutSessionResultSchema,
  userProfileSchema,
} from './record-contract.js'
export const getUser = defineService(inputs.getUserInput, userProfileSchema, {
  access: 'retained-read',
  effect: 'read',
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
  access: 'account-management',
  effect: 'write',
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
  access: 'account-management',
  effect: 'delete',
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
