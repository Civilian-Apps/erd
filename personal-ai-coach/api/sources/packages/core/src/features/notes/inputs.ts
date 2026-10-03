import {
  idSchema,
  idInputSchema,
  idempotencyKeySchema,
  pageInputSchema,
} from '../../shared/schemas.js'
import { z } from 'zod'
import { deletionInputSchema, readWindowSchema } from '../../shared/mcp/schemas.js'

export const addNoteInput = z.object({ text: z.string().trim().min(1) }).strict()

export const orpcAddNoteInput = addNoteInput.extend({ idempotency_key: idempotencyKeySchema })

export const updateNoteInput = idInputSchema.extend({ text: addNoteInput.shape.text })

export const previewNoteDeletionInput = idInputSchema

export const deleteNoteInput = idInputSchema.extend({
  preview_id: idSchema.describe(
    'Server impact preview ID; trusted application approval must already exist.',
  ),
})

export const getNoteInput = idInputSchema

export const listNotesInput = pageInputSchema.extend({ window: readWindowSchema.optional() })

export const noteWriteInput = z.discriminatedUnion('operation', [
  addNoteInput.extend({ operation: z.literal('create') }),
  updateNoteInput.extend({ operation: z.literal('update') }),
])

export const noteListToolInput = listNotesInput.extend({
  operation: z.literal('list'),
  window: readWindowSchema.optional(),
})

export const noteGetToolInput = getNoteInput.extend({ operation: z.literal('get') })

export const noteReadInput = z.discriminatedUnion('operation', [
  noteListToolInput,
  noteGetToolInput,
])

export const noteDeleteToolInput = deletionInputSchema
