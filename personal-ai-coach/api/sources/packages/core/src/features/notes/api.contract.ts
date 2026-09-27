/** notes API: native oRPC declarations, no execution imports. */
import { apiProcedure } from '../../shared/api/contract-base.js'
import {
  deleteResultSchema,
  noteSchema,
  noteWriteResultSchema,
  pageSchema,
} from '../../contracts/projections.js'
import * as inputs from './contract.js'

export const notesContract = {
  addNote: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.orpcAddNoteInput)
    .output(noteWriteResultSchema),
  updateNote: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.updateNoteInput)
    .output(noteWriteResultSchema),
  listNotes: apiProcedure
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listNotesInput)
    .output(pageSchema(noteSchema)),
  getNote: apiProcedure
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.getNoteInput)
    .output(noteSchema),
  deleteNote: apiProcedure
    .route({
      description:
        'Permanently delete an owned note. Review gap: the existing ID-only API input needs reconciliation with the shared impact-preview and application-approval boundary.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.deleteNoteInput)
    .output(deleteResultSchema),
}
