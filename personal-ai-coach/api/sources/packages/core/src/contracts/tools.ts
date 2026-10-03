/** Single authored inventory: collection metadata and explicit membership together.
 * Domain modules own public definitions; handlers and publication live outside contracts.
 */
import type { ToolCollection, ToolDefinition, PromptDefinition } from './mcp.js'
import {
  cycleReadTool,
  cycleUpdateTool,
  cycleLifecycleTool,
  cycleDeleteTool,
} from './tools/cycles.js'
import { objectiveReadTool, objectiveWriteTool, objectiveDeleteTool } from './tools/objectives.js'
import { resultReadTool, resultWriteTool, resultDeleteTool } from './tools/results.js'
import { actionReadTool, actionWriteTool, actionDeleteTool } from './tools/actions.js'
import { noteReadTool, noteWriteTool, noteDeleteTool } from './tools/notes.js'
import { userReadTool, userUpdateTool } from './tools/users.js'
import { sessionReadTool, sessionStartTool, sessionCloseTool } from './tools/sessions.js'
import { progressRecordTool } from './tools/progress.js'
import { listExamplesDefinition, createExampleDefinition } from './tools/example.js'

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

export const promptContracts: readonly PromptDefinition[] = [
  {
    name: 'coaching_session',
    title: 'Coaching session',
    description:
      'Open a flexible coaching session: adapt to goal setup, check-in, review or open coaching within one session.',
    requiredTools: ['session_start', 'session_close'],
  },
]
