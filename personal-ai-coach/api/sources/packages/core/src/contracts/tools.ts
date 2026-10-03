/** Single authored inventory: collection metadata and explicit membership together.
 * Domain modules own public definitions; handlers and publication live outside contracts.
 */
import type { ToolCollection, ToolDefinition, PromptDefinition } from '../shared/mcp/types.js'
import {
  cycleReadTool,
  cycleUpdateTool,
  cycleLifecycleTool,
  cycleDeleteTool,
} from '../features/cycles/mcp.contract.js'
import {
  objectiveReadTool,
  objectiveWriteTool,
  objectiveDeleteTool,
} from '../features/objectives/mcp.contract.js'
import {
  resultReadTool,
  resultWriteTool,
  resultDeleteTool,
} from '../features/results/mcp.contract.js'
import {
  actionReadTool,
  actionWriteTool,
  actionDeleteTool,
} from '../features/actions/mcp.contract.js'
import { noteReadTool, noteWriteTool, noteDeleteTool } from '../features/notes/mcp.contract.js'
import { userReadTool, userUpdateTool } from '../features/identity-billing/mcp.contract.js'
import {
  sessionReadTool,
  sessionStartTool,
  sessionCloseTool,
} from '../features/sessions/mcp.contract.js'
import { progressRecordTool } from '../shared/mcp/progress.contract.js'
import {
  listExamplesDefinition,
  createExampleDefinition,
} from '../features/example/mcp.contract.js'

export const collections = {
  cycles: {
    title: 'Cycles',
    description: 'Coaching periods, dates, focus and lifecycle.',
    kind: 'product',
    tools: [cycleReadTool, cycleUpdateTool, cycleLifecycleTool, cycleDeleteTool],
  },
  objectives: {
    title: 'Objectives',
    description: 'Goals within a coaching cycle.',
    kind: 'product',
    tools: [objectiveReadTool, objectiveWriteTool, objectiveDeleteTool],
  },
  results: {
    title: 'Results',
    description: 'Measures of a goal and their recorded evidence.',
    kind: 'product',
    tools: [resultReadTool, resultWriteTool, resultDeleteTool],
  },
  actions: {
    title: 'Actions',
    description: 'Dated commitments, current state and history.',
    kind: 'product',
    tools: [actionReadTool, actionWriteTool, actionDeleteTool],
  },
  notes: {
    title: 'Notes',
    description: 'Standalone coaching notes and their timeline.',
    kind: 'product',
    tools: [noteReadTool, noteWriteTool, noteDeleteTool],
  },
  user: {
    title: 'Profile',
    description: 'The authenticated person’s permitted coaching profile.',
    kind: 'product',
    tools: [userReadTool, userUpdateTool],
  },
  sessions: {
    title: 'Sessions',
    description: 'Saved coaching sessions, opening and explicit closure.',
    kind: 'product',
    tools: [sessionReadTool, sessionStartTool, sessionCloseTool],
  },
  progress: {
    title: 'Progress',
    description: 'Evidence and action outcomes across the coaching record.',
    kind: 'product',
    tools: [progressRecordTool],
  },
  example: {
    title: 'Retained example',
    description: 'Scaffold-only reference; removed after a verified product replacement.',
    kind: 'scaffold',
    tools: [listExamplesDefinition, createExampleDefinition],
  },
} satisfies Record<string, ToolCollection>

/** Derived view, never a second authored tool list. */
export const allTools: readonly ToolDefinition[] = Object.values(
  collections,
).flatMap<ToolDefinition>((group) => group.tools)

export const promptContracts = [
  {
    name: 'coaching_session',
    title: 'Coaching session',
    description:
      'Open a flexible coaching session: adapt to goal setup, check-in, review or open coaching within one session.',
    requiredTools: ['session_start', 'session_close'],
  },
] as const satisfies readonly (Omit<PromptDefinition, 'requiredTools'> & {
  requiredTools: readonly ToolName[]
})[]

/** Tool names derive from the authored collection inventory. */
export type ToolName = (typeof collections)[keyof typeof collections]['tools'][number]['name']

/** Exact grouped operations for consumer references; single-purpose/scaffold tools use call. */
type RegisteredTool = (typeof collections)[keyof typeof collections]['tools'][number]
type Operations<T> = T extends { serviceBinding: { operations: infer O } }
  ? keyof O & string
  : 'call'
export type ToolOperationReference = {
  [Name in ToolName]: {
    readonly tool: Name
    readonly operations: readonly Operations<Extract<RegisteredTool, { name: Name }>>[]
  }
}[ToolName]
