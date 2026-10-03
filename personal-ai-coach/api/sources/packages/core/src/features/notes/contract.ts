/** Normative inputs: docs/ONTOLOGY.md and this feature's spec Interfaces. Client-safe. */
import { z } from 'zod'
import { idInputSchema, idempotencyKeySchema, pageInputSchema } from '../../contracts/input.js'
export const addNoteInput = z.object({ text: z.string().trim().min(1) }).strict()
export const orpcAddNoteInput = addNoteInput.extend({ idempotency_key: idempotencyKeySchema })
export const updateNoteInput = idInputSchema.extend({ text: addNoteInput.shape.text })
export const deleteNoteInput = idInputSchema
export const getNoteInput = idInputSchema
export const listNotesInput = pageInputSchema
export const noteWriteInput = z.discriminatedUnion('operation', [
  addNoteInput.extend({ operation: z.literal('create') }),
  updateNoteInput.extend({ operation: z.literal('update') }),
])

// MCP transport contracts: reuse domain fields; keep handlers outside declarations.
import {
  readerPageSchema,
  continuationPageFields,
  readWindowSchema,
  resolvedReadWindowSchema,
  deletionInputSchema,
  deletionOutputSchema,
} from '../../contracts/mcp.js'
import { noteSchema, changedSchema } from '../../contracts/projections.js'
import { idSchema } from '../../contracts/input.js'
export const noteListToolInput = listNotesInput.extend({
  operation: z.literal('list'),
  window: readWindowSchema.optional(),
})
export const noteGetToolInput = getNoteInput.extend({ operation: z.literal('get') })
export const noteReadInput = z.discriminatedUnion('operation', [
  noteListToolInput,
  noteGetToolInput,
])
const noteListToolOutput = readerPageSchema(
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
export const noteDeleteToolInput = deletionInputSchema
export const noteDeleteToolOutput = deletionOutputSchema(
  noteSchema.pick({ id: true, text: true }),
  { notes: z.literal(1) },
)
