/** Pure product-event contracts. Emission is an implementation obligation. */
import { z } from 'zod'
import { defineEvent } from '../../shared/events/definition.js'
import { idSchema, surfaceSchema } from '../../shared/schemas.js'
import { metricTypeSchema } from './records.js'

export const resultUpdateRecorded = defineEvent(
  'result_update_recorded',
  z.strictObject({ result_id: idSchema, metric_type: metricTypeSchema, surface: surfaceSchema }),
  {
    requirement: 'docs/feature-specs/F4-results.md',
    description:
      'Saved value, reading, milestone flip, habit mark or unmark; not a comment-only update.',
  },
)
