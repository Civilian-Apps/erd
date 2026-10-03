import { z } from 'zod'
import {
  resolvedReadWindowSchema,
  continuationPageFields,
  deletionOutputSchema,
  readerPageSchema,
} from '../../shared/mcp/schemas.js'
import {
  changedSchema,
  writeResultSchema,
  pageSchema,
  widgetSnapshotSchema,
  widgetTotalSchema,
} from '../../shared/schemas.js'
import { noteSchema } from './records.js'
import { noteListToolInput } from './inputs.js'

export const noteListToolOutput = readerPageSchema(
  noteSchema,
  'note_read',
  noteListToolInput.extend({
    ...continuationPageFields,
    window: resolvedReadWindowSchema.optional(),
  }),
).safeExtend({ operation: z.literal('list'), window: resolvedReadWindowSchema.nullable() })

export const noteReadOutput = z.union([
  noteListToolOutput,
  z.strictObject({ operation: z.literal('get'), note: noteSchema }),
])

export const noteMutationOutput = z.strictObject({ note: noteSchema, changed: changedSchema })

export const noteDeleteToolOutput = deletionOutputSchema(
  noteSchema.pick({ id: true, text: true }),
  { notes: z.literal(1) },
)

export const noteDetailSchema = noteSchema

export const noteWriteResultSchema = writeResultSchema(noteSchema)

export const noteDeletionPreviewSchema = noteDeleteToolOutput.options[0]

export const noteListServiceSchema = pageSchema(noteSchema).extend({
  window: resolvedReadWindowSchema.nullable(),
})

export const noteWidgetPayloadSchema = widgetSnapshotSchema(noteSchema, {})
export const notesWidgetPayloadSchema = widgetSnapshotSchema(
  noteListServiceSchema.extend({ items: noteListServiceSchema.shape.items.max(3) }),
  {
    notes: widgetTotalSchema,
  },
)
