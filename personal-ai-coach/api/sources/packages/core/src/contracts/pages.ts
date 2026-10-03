// UI-SPEC § Page mapping → feature-owned lazy routes. Technical authority: TECHNICAL-DESIGN §3.3.
// Product stubs declare the approved surface; they do not claim feature behavior exists.
import { z } from 'zod'
import type { AppRouter } from './api.js'
import type { profileSchema } from '../features/identity-billing/records.js'
import type { cycleSchema } from '../features/cycles/records.js'
import type { objectiveSchema } from '../features/objectives/records.js'
import type { resultSchema } from '../features/results/records.js'
import type { actionSchema } from '../features/actions/records.js'
import type { noteSchema } from '../features/notes/records.js'
import type { sessionSchema } from '../features/sessions/records.js'

export type ProcedurePath = {
  [Namespace in keyof AppRouter & string]: `${Namespace}.${keyof AppRouter[Namespace] & string}`
}[keyof AppRouter & string]

export type ScreenFamily =
  | 'scaffold'
  | 'auth'
  | 'onboarding'
  | 'objectives'
  | 'objective-detail'
  | 'result-detail'
  | 'actions'
  | 'action-detail'
  | 'notes'
  | 'note'
  | 'sessions'
  | 'session-detail'
  | 'session-document'
  | 'settings'
  | 'cycles'
  | 'cycle-detail'

type PageRows = {
  profile: z.output<typeof profileSchema>
  cycle: z.output<typeof cycleSchema>
  objective: z.output<typeof objectiveSchema>
  result: z.output<typeof resultSchema>
  action: z.output<typeof actionSchema>
  note: z.output<typeof noteSchema>
  session: z.output<typeof sessionSchema>
}

export type PageColumns = {
  [Projection in keyof PageRows]: {
    projection: Projection
    fields: readonly (keyof PageRows[Projection] & string)[]
  }
}[keyof PageRows]

export type PageDef = {
  path: string
  title: string
  screen: ScreenFamily
  owner: string
  implementation: 'pending' | 'live' | 'scaffold'
  reads: readonly ProcedurePath[]
  writes: readonly ProcedurePath[]
  columns?: PageColumns
  /** Domain overlays this page may open; shared UI atoms are not registered here. */
  overlays?: readonly OverlayName[]
}

export const resultUpdateDialInputSchema = z.strictObject({ result_id: z.uuid() })

export const noteEditorInputSchema = z.discriminatedUnion('mode', [
  z.strictObject({ mode: z.literal('create') }),
  z.strictObject({ mode: z.literal('edit'), note_id: z.uuid() }),
])

export type ResultUpdateDialInput = z.output<typeof resultUpdateDialInputSchema>

export type NoteEditorInput = z.output<typeof noteEditorInputSchema>

export interface OverlayProps<Input> {
  input: Input
  onClose: () => void
}

type OverlayDef<S extends z.ZodType> = {
  title: string
  owner: string
  history: 'none'
  input: S
  procedures: readonly ProcedurePath[]
}

export const overlays = {
  'result-update-dial': {
    title: 'Update Result value',
    owner: 'F4 Results',
    history: 'none',
    input: resultUpdateDialInputSchema,
    procedures: ['results.get', 'result_logs.create', 'habit_logs.set'],
  } satisfies OverlayDef<typeof resultUpdateDialInputSchema>,
  'note-editor': {
    title: 'Capture or edit a note',
    owner: 'F6 Notes',
    history: 'none',
    input: noteEditorInputSchema,
    procedures: ['notes.get', 'notes.create', 'notes.update', 'notes.delete'],
  } satisfies OverlayDef<typeof noteEditorInputSchema>,
} as const

export type OverlayName = keyof typeof overlays

export const pages = [
  {
    path: '/terms',
    title: 'Terms',
    screen: 'scaffold',
    owner: 'Scaffold legal-route continuity',
    implementation: 'scaffold',
    reads: [],
    writes: [],
  },
  {
    path: '/privacy',
    title: 'Privacy',
    screen: 'scaffold',
    owner: 'Scaffold legal-route continuity',
    implementation: 'scaffold',
    reads: [],
    writes: [],
  },
  {
    path: '/cookies',
    title: 'Cookies',
    screen: 'scaffold',
    owner: 'Scaffold legal-route continuity',
    implementation: 'scaffold',
    reads: [],
    writes: [],
  },

  {
    path: '/example',
    title: 'Example',
    screen: 'scaffold',
    owner: 'Temporary scaffold reference',
    implementation: 'scaffold',
    reads: ['example.list'],
    writes: ['example.create', 'example.delete'],
  },
  {
    path: '/',
    overlays: ['result-update-dial', 'note-editor'],
    title: 'Objectives',
    screen: 'objectives',
    owner: 'F3 Objectives',
    implementation: 'pending',
    reads: ['record.query'],
    writes: ['objectives.create'],
    columns: { projection: 'objective', fields: ['short_code', 'title', 'progress_pct'] },
  },
  {
    path: '/objectives/:id',
    overlays: ['result-update-dial'],
    title: 'Objective',
    screen: 'objective-detail',
    owner: 'F3 Objectives',
    implementation: 'pending',
    reads: ['objectives.get'],
    writes: [
      'objectives.create',
      'objectives.update',
      'objectives.delete',
      'results.create',
      'actions.create',
      'action_logs.create',
    ],
    columns: {
      projection: 'objective',
      fields: ['short_code', 'title', 'description', 'deadline_at', 'status', 'progress_pct'],
    },
  },
  {
    path: '/results/:id',
    overlays: ['result-update-dial'],
    title: 'Result',
    screen: 'result-detail',
    owner: 'F4 Results',
    implementation: 'pending',
    reads: ['results.get', 'result_logs.list', 'habit_logs.list'],
    writes: [
      'results.create',
      'results.update',
      'results.delete',
      'result_logs.create',
      'result_logs.clear_comment',
      'result_logs.delete',
      'habit_logs.set',
    ],
    columns: { projection: 'result', fields: ['short_code', 'title', 'metric_type', 'status'] },
  },
  {
    path: '/actions',
    title: 'Actions',
    screen: 'actions',
    owner: 'F5 Actions',
    implementation: 'pending',
    reads: ['actions.list'],
    writes: ['actions.create', 'actions.reorder', 'action_logs.create'],
    columns: { projection: 'action', fields: ['title', 'due_at', 'status', 'sort_order'] },
  },
  {
    path: '/actions/:id',
    title: 'Action',
    screen: 'action-detail',
    owner: 'F5 Actions',
    implementation: 'pending',
    reads: ['actions.get', 'action_logs.list'],
    writes: [
      'actions.create',
      'actions.update',
      'actions.delete',
      'action_logs.create',
      'action_logs.clear_comment',
    ],
    columns: {
      projection: 'action',
      fields: ['title', 'due_at', 'status', 'description', 'objective_id', 'session_id'],
    },
  },
  {
    path: '/notes',
    overlays: ['note-editor'],
    title: 'Notes',
    screen: 'notes',
    owner: 'F6 Notes',
    implementation: 'pending',
    reads: ['notes.list'],
    writes: ['notes.delete'],
    columns: { projection: 'note', fields: ['recorded_at', 'text'] },
  },
  {
    path: '/notes/:id',
    title: 'Note',
    screen: 'note',
    owner: 'F6 Notes',
    implementation: 'pending',
    reads: ['notes.get'],
    writes: ['notes.update', 'notes.delete'],
    columns: { projection: 'note', fields: ['recorded_at', 'text'] },
  },
  {
    path: '/sessions',
    title: 'Sessions',
    screen: 'sessions',
    owner: 'F7 Sessions',
    implementation: 'pending',
    reads: ['sessions.list'],
    writes: [],
    columns: {
      projection: 'session',
      fields: ['started_at', 'headline', 'type', 'vendor', 'ended_at'],
    },
  },
  {
    path: '/sessions/:id',
    title: 'Session',
    screen: 'session-detail',
    owner: 'F7 Sessions',
    implementation: 'pending',
    reads: ['sessions.get'],
    writes: ['action_logs.create'],
    columns: {
      projection: 'session',
      fields: [
        'started_at',
        'ended_at',
        'vendor',
        'source_url',
        'type',
        'headline',
        'briefing_notes',
        'summary_notes',
      ],
    },
  },
  {
    path: '/sessions/:id/briefing',
    title: 'Briefing',
    screen: 'session-document',
    owner: 'F7 Sessions',
    implementation: 'pending',
    reads: ['sessions.get'],
    writes: [],
    columns: { projection: 'session', fields: ['started_at', 'briefing_notes', 'source_url'] },
  },
  {
    path: '/sessions/:id/summary',
    title: 'Session summary',
    screen: 'session-document',
    owner: 'F7 Sessions',
    implementation: 'pending',
    reads: ['sessions.get'],
    writes: [],
    columns: { projection: 'session', fields: ['started_at', 'summary_notes', 'source_url'] },
  },
  {
    path: '/cycles',
    title: 'Cycles',
    screen: 'cycles',
    owner: 'F2 Cycles',
    implementation: 'pending',
    reads: ['cycles.list'],
    writes: [],
    columns: { projection: 'cycle', fields: ['start_at', 'end_at', 'status'] },
  },
  {
    path: '/cycles/new',
    title: 'Set up a cycle',
    screen: 'cycle-detail',
    owner: 'F2 Cycles',
    implementation: 'pending',
    reads: [],
    writes: ['cycles.create'],
    columns: { projection: 'cycle', fields: ['start_at', 'end_at', 'intention'] },
  },
  {
    path: '/cycles/:id',
    title: 'Cycle',
    screen: 'cycle-detail',
    owner: 'F2 Cycles',
    implementation: 'pending',
    reads: ['cycles.get'],
    writes: ['cycles.update', 'cycles.delete'],
    columns: { projection: 'cycle', fields: ['start_at', 'end_at', 'intention', 'status'] },
  },
  {
    path: '/settings',
    title: 'Settings',
    screen: 'settings',
    owner: 'F1 Identity and billing',
    implementation: 'pending',
    // Billing details load independently; their failure never blocks profile or entitlement.
    reads: ['user.get', 'cycles.resolve_active', 'billing.get_details'],
    writes: [
      'user.update',
      'user.delete',
      'billing.create_portal_session',
      // Resubscribe after a canceled plan; the portal cannot start a subscription.
      'billing.create_checkout_session',
    ],
    columns: { projection: 'profile', fields: ['name', 'about_me', 'timezone'] },
  },
  {
    path: '/onboarding',
    title: 'Set up your coaching',
    screen: 'onboarding',
    owner: 'F1 Identity and billing',
    implementation: 'pending',
    reads: ['user.get'],
    writes: ['billing.create_checkout_session'],
    columns: { projection: 'profile', fields: [] },
  },
  {
    path: '/sign-in',
    title: 'Sign in',
    screen: 'auth',
    owner: 'F1 Identity and billing',
    implementation: 'live',
    reads: [],
    writes: [],
  },
  {
    path: '/sign-up',
    title: 'Sign up',
    screen: 'auth',
    owner: 'F1 Identity and billing',
    implementation: 'live',
    reads: [],
    writes: [],
  },
  {
    path: '/oauth/consent',
    title: 'Authorize',
    screen: 'onboarding',
    owner: 'F1 Identity and billing',
    implementation: 'live',
    reads: [],
    writes: [],
  },
] as const satisfies readonly PageDef[]

export const productPages = pages

export type PagePath = (typeof pages)[number]['path']
export type OverlayInput<N extends OverlayName> = z.output<(typeof overlays)[N]['input']>
