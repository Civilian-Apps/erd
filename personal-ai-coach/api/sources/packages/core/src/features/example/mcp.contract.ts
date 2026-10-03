/** Retained scaffold contracts, separate from the 22 product tools. */
import { z } from 'zod'
import { createExampleInput, exampleWidgetPayloadSchema, exampleRow } from './contract.js'
import { EXAMPLE_WIDGET_URI } from '../../contracts/widgets.js'
import { READ_ONLY_ANNOTATIONS, WRITE_ANNOTATIONS } from '../../shared/mcp/annotations.js'
import { defineTool } from '../../shared/mcp/types.js'

export const listExamplesDefinition = defineTool({
  collection: 'example',
  name: 'example_list' as const,
  title: 'List examples',
  description: "List the calling user's example rows.",
  inputSchema: z.object({}),
  outputSchema: exampleWidgetPayloadSchema,
  scope: 'coach:read',
  annotations: READ_ONLY_ANNOTATIONS,
  readiness: 'implemented',
  outputTemplateUri: EXAMPLE_WIDGET_URI,
})

export const createExampleDefinition = defineTool({
  collection: 'example',
  name: 'example_create' as const,
  title: 'Create an example',
  description: 'Create an example row with a short name for the calling user.',
  inputSchema: createExampleInput,
  outputSchema: exampleRow.extend({ created_at: z.iso.datetime() }),
  scope: 'coach:write',
  annotations: WRITE_ANNOTATIONS,
  readiness: 'implemented',
})
