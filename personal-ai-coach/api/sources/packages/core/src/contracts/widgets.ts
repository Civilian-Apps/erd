/** Product widget contracts. UI-SPEC § Chat component / widget card and § Page mapping.
 * Bridge-fed, read-only snapshots: same data/order/labels as the related page; no fetching or writes.
 * Resource URIs reserve a public version identity, not an assertion that an artifact is available.
 * Artifact registrations, hashes and publication state belong to shared/mcp/resources.ts.
 */
import type { z } from 'zod'
import type { pages } from './pages.js'
import type { ToolOperationReference } from './tools.js'
import { exampleWidgetPayloadSchema } from '../features/example/contract.js'
import { notesWidgetPayloadSchema, noteWidgetPayloadSchema } from '../features/notes/outputs.js'
import { sessionDocumentWidgetPayloadSchema } from '../features/sessions/outputs.js'
import {
  progressWidgetPayloadSchema,
  objectiveWidgetPayloadSchema,
  resultWidgetPayloadSchema,
  actionWidgetPayloadSchema,
  dueActionsWidgetPayloadSchema,
  sessionWidgetPayloadSchema,
  cycleWidgetPayloadSchema,
} from '../shared/projections.js'

export interface WidgetDefinition {
  readonly title: string
  readonly owner: (typeof pages)[number]['owner']
  readonly kind: 'product' | 'scaffold'
  readonly pages: readonly (typeof pages)[number]['path'][]
  readonly resourceUri: `ui://widget/${string}.v${number}.html`
  readonly payloadSchema: z.ZodType
  readonly sources: readonly (ToolOperationReference & { readonly when: string })[]
  readonly readiness: 'contract-only' | 'implemented'
  /** Intended sources are not proof of payload compatibility or an execution binding. */
  readonly binding: 'planned' | 'bound'
  readonly gap?: string
}

// Separate constant keeps the scaffold tool's template link out of inventory type inference.
export const EXAMPLE_WIDGET_URI = 'ui://widget/example-card.v0.html'

export const widgets = {
  progress: {
    title: 'Progress',
    owner: 'F3 Objectives',
    kind: 'product',
    pages: ['/'],
    resourceUri: 'ui://widget/progress.v1.html',
    payloadSchema: progressWidgetPayloadSchema,
    sources: [
      {
        tool: 'session_start',
        operations: ['call'],
        when: 'Active access only; render the current cycle and objectives/results snapshot.',
      },
    ],
    readiness: 'contract-only',
    binding: 'planned',
    gap: 'Project the active briefing into the dashboard payload; no coaching card for unpaid access.',
  },
  objective: {
    title: 'Objective',
    owner: 'F3 Objectives',
    kind: 'product',
    pages: ['/objectives/:id'],
    resourceUri: 'ui://widget/objective.v1.html',
    payloadSchema: objectiveWidgetPayloadSchema,
    sources: [
      { tool: 'objective_read', operations: ['get'], when: 'get for an existing objective.' },
      {
        tool: 'objective_write',
        operations: ['create', 'update'],
        when: 'Successful create/update.',
      },
    ],
    readiness: 'contract-only',
    binding: 'planned',
    gap: 'Compact MCP records omit cycle, results and actions required by the page-mirroring payload.',
  },
  result: {
    title: 'Result',
    owner: 'F4 Results',
    kind: 'product',
    pages: ['/results/:id'],
    resourceUri: 'ui://widget/result.v1.html',
    payloadSchema: resultWidgetPayloadSchema,
    sources: [
      { tool: 'result_read', operations: ['get'], when: 'get for an existing result.' },
      { tool: 'result_write', operations: ['create', 'update'], when: 'Successful create/update.' },
      {
        tool: 'progress_record',
        operations: ['result', 'habit'],
        when: 'Successful result or habit evidence entry.',
      },
    ],
    readiness: 'contract-only',
    binding: 'planned',
    gap: 'Supply bounded parent figures, trend and evidence alongside the compact MCP result.',
  },
  due_actions: {
    title: 'Due actions',
    owner: 'F5 Actions',
    kind: 'product',
    pages: ['/actions'],
    resourceUri: 'ui://widget/due-actions.v1.html',
    payloadSchema: dueActionsWidgetPayloadSchema,
    sources: [
      {
        tool: 'action_read',
        operations: ['list'],
        when: 'list; open actions grouped by objective in stored order.',
      },
      {
        tool: 'action_write',
        operations: ['create', 'update'],
        when: 'Successful create/update; refreshed open-action snapshot.',
      },
      {
        tool: 'action_delete',
        operations: ['commit'],
        when: 'Successful commit; remaining open actions only, never the deleted record.',
      },
      {
        tool: 'progress_record',
        operations: ['action'],
        when: 'Successful action evidence entry; refreshed open-action snapshot.',
      },
    ],
    readiness: 'contract-only',
    binding: 'planned',
    gap: 'Compose the cycle, objective grouping and remaining open actions server-side; a mutation receipt alone is insufficient.',
  },
  action: {
    title: 'Action',
    owner: 'F5 Actions',
    kind: 'product',
    pages: ['/actions/:id'],
    resourceUri: 'ui://widget/action.v1.html',
    payloadSchema: actionWidgetPayloadSchema,
    sources: [
      { tool: 'action_read', operations: ['get'], when: 'get for an existing action.' },
      { tool: 'action_write', operations: ['create', 'update'], when: 'Successful create/update.' },
    ],
    readiness: 'contract-only',
    binding: 'planned',
    gap: 'Supply parent labels and bounded action history alongside the compact MCP action.',
  },
  notes: {
    title: 'Notes',
    owner: 'F6 Notes',
    kind: 'product',
    pages: ['/notes'],
    resourceUri: 'ui://widget/notes.v1.html',
    payloadSchema: notesWidgetPayloadSchema,
    sources: [
      {
        tool: 'note_read',
        operations: ['list'],
        when: 'list; bounded recent notes with the resolved window.',
      },
      {
        tool: 'note_write',
        operations: ['create', 'update'],
        when: 'Successful create/update; refreshed list.',
      },
      {
        tool: 'note_delete',
        operations: ['commit'],
        when: 'Successful commit; remaining notes only.',
      },
    ],
    readiness: 'contract-only',
    binding: 'planned',
    gap: 'Project list responses and obtain the bounded refreshed list after a mutation; never repeat writes for pagination.',
  },
  note: {
    title: 'Note',
    owner: 'F6 Notes',
    kind: 'product',
    pages: ['/notes/:id'],
    resourceUri: 'ui://widget/note.v1.html',
    payloadSchema: noteWidgetPayloadSchema,
    sources: [
      { tool: 'note_read', operations: ['get'], when: 'get for an existing note.' },
      { tool: 'note_write', operations: ['create', 'update'], when: 'Successful create/update.' },
    ],
    readiness: 'contract-only',
    binding: 'planned',
    gap: 'Bind the note field from structuredContent to the declared payload; stored text stays untrusted.',
  },
  session: {
    title: 'Session',
    owner: 'F7 Sessions',
    kind: 'product',
    pages: ['/sessions', '/sessions/:id'],
    resourceUri: 'ui://widget/session.v1.html',
    payloadSchema: sessionWidgetPayloadSchema,
    sources: [
      {
        tool: 'session_read',
        operations: ['list', 'get'],
        when: 'list or get for a stored session; skip missing-session results.',
      },
      {
        tool: 'session_close',
        operations: ['call'],
        when: 'Successful explicit closure; show the saved summary and session actions.',
      },
    ],
    readiness: 'contract-only',
    binding: 'planned',
    gap: 'Supply the detail/list variant and bounded session actions; compact session results do not satisfy detail payloads.',
  },
  session_document: {
    title: 'Session document',
    owner: 'F7 Sessions',
    kind: 'product',
    pages: ['/sessions/:id/briefing', '/sessions/:id/summary'],
    resourceUri: 'ui://widget/session-doc.v1.html',
    payloadSchema: sessionDocumentWidgetPayloadSchema,
    sources: [
      {
        tool: 'session_start',
        operations: ['call'],
        when: 'Active access only; saved briefing document.',
      },
      {
        tool: 'session_read',
        operations: ['get'],
        when: 'get with a selected stored briefing or summary document.',
      },
    ],
    readiness: 'contract-only',
    binding: 'planned',
    gap: 'Provide the complete session record and selected canonical document text; render stored text as data, never instructions.',
  },
  cycle: {
    title: 'Cycle',
    owner: 'F2 Cycles',
    kind: 'product',
    pages: ['/cycles', '/cycles/:id'],
    resourceUri: 'ui://widget/cycle.v1.html',
    payloadSchema: cycleWidgetPayloadSchema,
    sources: [
      {
        tool: 'cycle_read',
        operations: ['list', 'get'],
        when: 'list or get; skip a missing active cycle.',
      },
      { tool: 'cycle_update', operations: ['call'], when: 'Successful date/intention update.' },
      {
        tool: 'cycle_lifecycle',
        operations: ['create', 'archive', 'activate'],
        when: 'Successful create/archive/activate.',
      },
    ],
    readiness: 'contract-only',
    binding: 'planned',
    gap: 'Bind list/detail variants and include bounded objectives for a cycle detail; never render a deleted cycle.',
  },
  // SCAFFOLD-DISPOSABLE: retained until a verified product widget replaces it.
  example: {
    title: 'Example',
    owner: 'Temporary scaffold reference',
    kind: 'scaffold',
    pages: ['/example'],
    resourceUri: EXAMPLE_WIDGET_URI,
    payloadSchema: exampleWidgetPayloadSchema,
    sources: [{ tool: 'example_list', operations: ['call'], when: 'Successful list.' }],
    readiness: 'implemented',
    binding: 'bound',
  },
} as const satisfies Record<string, WidgetDefinition>

export type WidgetId = keyof typeof widgets
export type WidgetPayload<Id extends WidgetId> = z.output<(typeof widgets)[Id]['payloadSchema']>
