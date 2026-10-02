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
  create: apiProcedure
    .route({ summary: 'New note' })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.orpcAddNoteInput)
    .output(noteWriteResultSchema),
  update: apiProcedure
    .route({ summary: 'Edit note' })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.updateNoteInput)
    .output(noteWriteResultSchema),
  list: apiProcedure
    .route({ summary: 'List notes' })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.listNotesInput)
    .output(pageSchema(noteSchema)),
  get: apiProcedure
    .route({ summary: 'Read note' })
    .meta({ access: 'retained-read', implementation: 'contract-only' })
    .input(inputs.getNoteInput)
    .output(noteSchema),
  delete: apiProcedure
    .route({
      summary: 'Delete note',
      description:
        'Permanently delete an owned note. Review gap: the existing ID-only API input needs reconciliation with the shared impact-preview and application-approval boundary.',
    })
    .meta({ access: 'entitled-write', implementation: 'contract-only' })
    .input(inputs.deleteNoteInput)
    .output(deleteResultSchema),
}
