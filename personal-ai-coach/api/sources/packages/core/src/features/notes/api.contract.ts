import * as inputs from './inputs.js'
import {
  addNote,
  deleteNote,
  getNote,
  listNotes,
  previewNoteDeletion,
  updateNote,
} from './service.contract.js'
import { noteDeletionPreviewSchema, noteWriteResultSchema } from './outputs.js'
import { apiProcedure, defineServiceApi } from '../../shared/api/contract-base.js'
import { deleteResultSchema, pageSchema } from '../../shared/schemas.js'
import { noteSchema } from './records.js'

export const notesContract = {
  preview_deletion: defineServiceApi(
    previewNoteDeletion,
    apiProcedure
      .route({
        summary: 'Preview note deletion impact',
        description:
          'Return complete server impact and a trusted application approval URL. Missing impact or approval blocks deletion; preview possession is not consent.',
      })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.previewNoteDeletionInput)
      .output(noteDeletionPreviewSchema),
  ),

  create: defineServiceApi(
    addNote,
    apiProcedure
      .route({ summary: 'New note' })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.orpcAddNoteInput)
      .output(noteWriteResultSchema),
  ),
  update: defineServiceApi(
    updateNote,
    apiProcedure
      .route({ summary: 'Edit note' })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.updateNoteInput)
      .output(noteWriteResultSchema),
  ),
  list: defineServiceApi(
    listNotes,
    apiProcedure
      .route({ summary: 'List notes' })
      .meta({
        access: 'retained-read',
        implementation: 'contract-only',
      })
      .input(inputs.listNotesInput)
      .output(pageSchema(noteSchema)),
  ),
  get: defineServiceApi(
    getNote,
    apiProcedure
      .route({ summary: 'Read note' })
      .meta({
        access: 'retained-read',
        implementation: 'contract-only',
      })
      .input(inputs.getNoteInput)
      .output(noteSchema),
  ),
  delete: defineServiceApi(
    deleteNote,
    apiProcedure
      .route({
        summary: 'Delete note',
        description:
          'Permanently delete an owned note. Requires an actor/target/impact/expiry-bound server preview and genuine application approval, checked and consumed atomically with deletion. Fail closed on incomplete or changed impact.',
      })
      .meta({
        access: 'entitled-write',
        implementation: 'contract-only',
      })
      .input(inputs.deleteNoteInput)
      .output(deleteResultSchema),
  ),
}
