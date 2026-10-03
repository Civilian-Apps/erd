/** Pure product-event contracts. Emission is an implementation obligation. */
import { z } from 'zod'
import { defineEvent } from '../../shared/events/definition.js'
import { idSchema, surfaceSchema } from '../../shared/schemas.js'
import { sessionTypeSchema, sessionSchema } from './records.js'

export const sessionStarted = defineEvent(
  'session_started',
  z.strictObject({
    session_id: idSchema,
    vendor: sessionSchema.shape.vendor,
    surface: surfaceSchema,
  }),
  {
    requirement: 'docs/feature-specs/F7-sessions.md',
    description: 'New persisted session, not reuse of an existing open session.',
  },
)

export const sessionSummaryWritten = defineEvent(
  'session_summary_written',
  z.strictObject({ session_id: idSchema, type: sessionTypeSchema }),
  {
    requirement: 'docs/feature-specs/F7-sessions.md',
    description: 'First successful close with a summary, not replay or forced stale-session close.',
  },
)

export const chatToolUsed = defineEvent(
  'chat_tool_used',
  z.strictObject({ tool_name: z.string().min(1), success: z.boolean() }),
  {
    requirement: 'docs/feature-specs/F7-sessions.md',
    description: 'MCP tool call outcome; no stored coaching content.',
    externalProducers: [
      {
        kind: 'mcp-boundary',
        source: 'packages/core/src/shared/mcp/index.ts',
        when: 'For a tool call with an authenticated actor; both success and failure outcomes.',
      },
    ],
    gaps: [
      'Specify treatment of calls without authenticated identity; tenant event storage requires an actor.',
    ],
  },
)
