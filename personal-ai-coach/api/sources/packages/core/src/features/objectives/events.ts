/** Pure product-event contracts. Emission is an implementation obligation. */
import { z } from 'zod'
import { defineEvent } from '../../shared/events/definition.js'
import { idSchema, surfaceSchema } from '../../shared/schemas.js'

export const objectiveCreated = defineEvent(
  'objective_created',
  z.strictObject({ objective_id: idSchema, cycle_id: idSchema, surface: surfaceSchema }),
  {
    requirement: 'docs/feature-specs/F3-objectives.md',
    description: 'Durable objective creation; no duplicate on original-outcome replay.',
  },
)
