import { noteDeletionPreviewSchema, noteListServiceSchema } from './outputs.js'
/** Pure service declarations; implementations live in service.ts. */
import { z } from 'zod'
import { deleteResultSchema } from '../../contracts/outputs.js'
import { defineService } from '../../contracts/service-types.js'
import * as inputs from './inputs.js'
import { noteWriteResultSchema } from './outputs.js'
import { noteSchema } from './record-contract.js'
export const addNote = defineService(
  z.union([inputs.orpcAddNoteInput, inputs.addNoteInput]),
  noteWriteResultSchema,
  {
    access: 'entitled-write',
    effect: 'write',
    retry:
      'API requires client-key replay; unkeyed MCP calls must inspect state after an uncertain outcome.',
    source: 'packages/core/src/features/notes/service.contract.ts#addNote',
    requirement: 'docs/feature-specs/F6-notes.md',
    errors: [
      'UNAUTHORIZED',
      'BAD_REQUEST',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'NOT_IMPLEMENTED',
      'INTERNAL_SERVER_ERROR',
    ],
  },
)
export const updateNote = defineService(inputs.updateNoteInput, noteWriteResultSchema, {
  access: 'entitled-write',
  effect: 'write',
  retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
  source: 'packages/core/src/features/notes/service.contract.ts#updateNote',
  requirement: 'docs/feature-specs/F6-notes.md',
  errors: [
    'UNAUTHORIZED',
    'BAD_REQUEST',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'NOT_IMPLEMENTED',
    'INTERNAL_SERVER_ERROR',
  ],
})
export const listNotes = defineService(inputs.listNotesInput, noteListServiceSchema, {
  access: 'retained-read',
  effect: 'read',
  retry: 'Safe to retry with the same resolved filters and cursor.',
  source: 'packages/core/src/features/notes/service.contract.ts#listNotes',
  requirement: 'docs/feature-specs/F6-notes.md',
  errors: [
    'UNAUTHORIZED',
    'BAD_REQUEST',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'NOT_IMPLEMENTED',
    'INTERNAL_SERVER_ERROR',
  ],
})
export const getNote = defineService(inputs.getNoteInput, noteSchema, {
  access: 'retained-read',
  effect: 'read',
  retry: 'Safe to retry with the same resolved filters and cursor.',
  source: 'packages/core/src/features/notes/service.contract.ts#getNote',
  requirement: 'docs/feature-specs/F6-notes.md',
  errors: [
    'UNAUTHORIZED',
    'BAD_REQUEST',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'NOT_IMPLEMENTED',
    'INTERNAL_SERVER_ERROR',
  ],
})
export const deleteNote = defineService(inputs.deleteNoteInput, deleteResultSchema, {
  access: 'entitled-write',
  effect: 'delete',
  retry: 'Inspect state after uncertain outcomes; never infer rollback from a response failure.',
  source: 'packages/core/src/features/notes/service.contract.ts#deleteNote',
  requirement: 'docs/feature-specs/F6-notes.md',
  errors: [
    'UNAUTHORIZED',
    'BAD_REQUEST',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'NOT_IMPLEMENTED',
    'INTERNAL_SERVER_ERROR',
  ],
})

export const previewNoteDeletion = defineService(
  inputs.previewNoteDeletionInput,
  noteDeletionPreviewSchema,
  {
    access: 'entitled-write',
    effect: 'write',
    retry:
      'Preview does not authorize deletion. Commit rechecks actor, target, impact, expiry and application approval; incomplete impact fails closed.',
    source: 'packages/core/src/features/notes/service.contract.ts#previewNoteDeletion',
    requirement: 'docs/feature-specs/F6-notes.md',
    errors: [
      'UNAUTHORIZED',
      'BAD_REQUEST',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'NOT_IMPLEMENTED',
      'INTERNAL_SERVER_ERROR',
    ],
  },
)
