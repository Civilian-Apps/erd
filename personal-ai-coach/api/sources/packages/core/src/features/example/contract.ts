// SCAFFOLD-DISPOSABLE — client-safe boundary; no schema/database imports in browser code.
import { z } from 'zod'
export const exampleRow = z.object({ id: z.uuid(), name: z.string(), created_at: z.coerce.date() })
export type ExampleRow = z.infer<typeof exampleRow>
export const exampleListRow = exampleRow.extend({ stale: z.boolean() })
export type ExampleListRow = z.infer<typeof exampleListRow>
export const createExampleInput = z.object({
  name: z.string().min(1).max(200),
  note: z.string().max(200).optional(),
})
export type CreateExampleInput = z.infer<typeof createExampleInput>
// Optional here so the helper emits the stable missing-key error contract.
export const orpcCreateExampleInput = createExampleInput.extend({
  idempotency_key: z.string().min(1).max(255).optional(),
})
export type OrpcCreateExampleInput = z.infer<typeof orpcCreateExampleInput>
export const deleteExampleInput = z.object({ id: z.uuid() })
export type DeleteExampleInput = z.infer<typeof deleteExampleInput>
export const deleteExampleResult = z.object({ id: z.uuid() })
export type DeleteExampleResult = z.infer<typeof deleteExampleResult>
