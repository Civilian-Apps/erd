/** Pure product-event contracts. Emission is an implementation obligation. */
import { z } from 'zod'
import { defineEvent } from '../../shared/events/definition.js'
import { idSchema, surfaceSchema } from '../../shared/schemas.js'

export const cycleCreated = defineEvent(
  'cycle_created',
  z.strictObject({ cycle_id: idSchema, surface: surfaceSchema }),
  {
    requirement: 'docs/feature-specs/F2-cycles.md',
    description: 'Durable cycle creation.',
  },
)

export const cycleArchived = defineEvent(
  'cycle_archived',
  z.strictObject({ cycle_id: idSchema, reason: z.enum(['expired', 'manual', 'replaced']) }),
  {
    requirement: 'docs/feature-specs/F2-cycles.md',
    description: 'Actual transition to archived; never for a no-op.',
  },
)
