/** Pure product-event contracts. Emission is an implementation obligation. */
import { z } from 'zod'
import { defineEvent } from '../../shared/events/definition.js'
import { actionStatusSchema } from './records.js'
import { dateSchema, idSchema, surfaceSchema } from '../../shared/schemas.js'

export const actionCreated = defineEvent(
  'action_created',
  z.strictObject({
    action_id: idSchema,
    cycle_id: idSchema,
    objective_id: idSchema.optional(),
    due_at: dateSchema.nullable(),
    surface: surfaceSchema,
  }),
  {
    requirement: 'docs/feature-specs/F5-actions.md',
    description: 'Durable action creation; due_at is null for an unset web draft.',
  },
)

export const actionStatusChanged = defineEvent(
  'action_status_changed',
  z.strictObject({ action_id: idSchema, status: actionStatusSchema, surface: surfaceSchema }),
  {
    requirement: 'docs/feature-specs/F5-actions.md',
    description: 'Each persisted action log, including a repeated status with a comment.',
  },
)
