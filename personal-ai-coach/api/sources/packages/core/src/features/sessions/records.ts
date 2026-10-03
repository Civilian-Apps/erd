// Client-safe wire contract. Source: docs/ONTOLOGY.md entity and derived-value tables.
// Persistence mapping belongs to record-fragment.ts; no database runtime enters this file.
import { z } from 'zod'
import { idSchema, timestampSchema, pageSchema } from '../../shared/schemas.js'

export const sessionTypeSchema = z
  .enum(['goal_setup', 'check_in', 'review', 'open_coaching'])
  .describe(
    'Coaching session type: Goal setup, Check-in, Review or Open coaching. Separate from whether the session is still open.',
  )

export const sessionSchema = z.strictObject({
  id: idSchema,
  vendor: z
    .enum(['claude', 'openai'])
    .describe('Conversation host: claude is shown as Claude; openai is shown as ChatGPT.'),
  source_url: z
    .url()
    .nullable()
    .describe('External conversation link used by Open the conversation. Not the app detail URL.'),
  type: sessionTypeSchema.nullable(),
  briefing_notes: z.string().describe('UI document: Briefing. Server-prepared coaching context.'),
  headline: z
    .string()
    .nullable()
    .describe('One-line coaching-session summary used in session lists.'),
  summary_notes: z
    .string()
    .nullable()
    .describe('UI document: Summary. Saved when the coaching session closes.'),
  started_at: timestampSchema,
  ended_at: timestampSchema
    .nullable()
    .describe(
      'Closed when set; In progress when null. This is derived session state, not a stored status enum.',
    ),
  url: z.url().describe('Internal app link to coaching session details; distinct from source_url.'),
  duration_minutes: z.number().int().nonnegative().nullable(),
  actions_created: z.number().int().nonnegative(),
  actions_reviewed: z.number().int().nonnegative(),
})

export const sessionsFragmentSchema = z.strictObject({
  sessions: pageSchema(sessionSchema, 50),
  last_completed: sessionSchema.nullable(),
  open: sessionSchema.nullable(),
})
