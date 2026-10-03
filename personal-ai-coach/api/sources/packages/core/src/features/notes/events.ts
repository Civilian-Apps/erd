/** Pure product-event contracts. Emission is an implementation obligation. */
import { z } from 'zod'
import { defineEvent } from '../../shared/events/definition.js'
import { idSchema, surfaceSchema } from '../../shared/schemas.js'

export const noteCreated = defineEvent(
  'note_created',
  z.strictObject({ note_id: idSchema, surface: surfaceSchema }),
  {
    requirement: 'docs/feature-specs/F6-notes.md',
    description: 'Durable note creation; no duplicate on original-outcome replay.',
  },
)
