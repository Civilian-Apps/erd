import { noteDeletionPreviewSchema } from './outputs.js'
import { serviceManifest } from '../../contracts/services.js'
/** notes API: native oRPC declarations, no execution imports. */
import { apiProcedure } from '../../shared/api/contract-base.js'
import { deleteResultSchema } from '../../contracts/outputs.js'
import { noteSchema } from './record-contract.js'
import { noteWriteResultSchema } from './outputs.js'
import { pageSchema } from '../../contracts/projections.js'
import * as inputs from './inputs.js'

export const notesContract = {
  preview_deletion: apiProcedure
    .route({
      summary: 'Preview note deletion impact',
      description:
        'Return complete server impact and a trusted application approval URL. Missing impact or approval blocks deletion; preview possession is not consent.',
    })
    .meta({
      service: serviceManifest.notes.preview_deletion,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.previewNoteDeletionInput)
    .output(noteDeletionPreviewSchema),

  create: apiProcedure
    .route({ summary: 'New note' })
    .meta({
      service: serviceManifest.notes.create,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.orpcAddNoteInput)
    .output(noteWriteResultSchema),
  update: apiProcedure
    .route({ summary: 'Edit note' })
    .meta({
      service: serviceManifest.notes.update,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.updateNoteInput)
    .output(noteWriteResultSchema),
  list: apiProcedure
    .route({ summary: 'List notes' })
    .meta({
      service: serviceManifest.notes.list,
      access: 'retained-read',
      implementation: 'contract-only',
    })
    .input(inputs.listNotesInput)
    .output(pageSchema(noteSchema)),
  get: apiProcedure
    .route({ summary: 'Read note' })
    .meta({
      service: serviceManifest.notes.get,
      access: 'retained-read',
      implementation: 'contract-only',
    })
    .input(inputs.getNoteInput)
    .output(noteSchema),
  delete: apiProcedure
    .route({
      summary: 'Delete note',
      description:
        'Permanently delete an owned note. Requires an actor/target/impact/expiry-bound server preview and genuine application approval, checked and consumed atomically with deletion. Fail closed on incomplete or changed impact.',
    })
    .meta({
      service: serviceManifest.notes.delete,
      access: 'entitled-write',
      implementation: 'contract-only',
    })
    .input(inputs.deleteNoteInput)
    .output(deleteResultSchema),
}
