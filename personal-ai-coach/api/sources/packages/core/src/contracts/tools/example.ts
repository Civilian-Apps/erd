/** Retained scaffold contracts, separate from the 22 product tools. */
import { z } from 'zod'
import { createExampleInput, exampleListRow, exampleRow } from '../../features/example/contract.js'
import { EXAMPLE_WIDGET_URI } from '../../features/example/chatgpt-widget.js'
import { READ_ONLY_ANNOTATIONS, WRITE_ANNOTATIONS } from '../../shared/mcp/annotations.js'
import type { ToolDefinition } from '../mcp.js'

export const listExamplesDefinition = {
  collection: 'example',
  name: 'example_list',
  title: 'List examples',
  description: "List the calling user's example rows.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    examples: exampleListRow.extend({ created_at: z.iso.datetime() }).array(),
  }),
  scope: 'coach:read',
  annotations: READ_ONLY_ANNOTATIONS,
  readiness: 'implemented',
  outputTemplateUri: EXAMPLE_WIDGET_URI,
} satisfies ToolDefinition

export const createExampleDefinition = {
  collection: 'example',
  name: 'example_create',
  title: 'Create an example',
  description: 'Create an example row with a short name for the calling user.',
  inputSchema: createExampleInput,
  outputSchema: exampleRow.extend({ created_at: z.iso.datetime() }),
  scope: 'coach:write',
  annotations: WRITE_ANNOTATIONS,
  readiness: 'implemented',
} satisfies ToolDefinition
