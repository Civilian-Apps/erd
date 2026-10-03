// Product events emitted by the example slice. SERVER-ONLY registry fragment.
// SCAFFOLD-DISPOSABLE — delete at F1/F2 with the rest of features/example.
// Membership is explicitly approved in contracts/application.ts. shared/events/runtime.ts
// derives the flat emitter lookup; definitions never import either composition root.
import { z } from 'zod'
import { defineEvent } from '../../shared/events/definition.js'

// The `example_created` event is the hello-world proof that feature behaviour
// emits a typed product event into `product_events`. Removed when the example
// slice is deleted at F1/F2 and replaced by the real coaching events.
export const exampleCreatedPropsSchema = z
  .object({
    /** The example row id created in this transaction. */
    exampleId: z.string().uuid(),
  })
  .strict()

export type ExampleCreatedProps = z.infer<typeof exampleCreatedPropsSchema>

export const exampleCreated = defineEvent('example_created', exampleCreatedPropsSchema, {
  requirement: 'packages/core/src/features/example/docs.md',
  description: 'Retained scaffold: one event per fresh example write in the same transaction.',
})

/**
 * Event schemas contributed by the example slice, keyed by event name.
 * Individual schemas are registered explicitly by contracts/application.ts.
 */
export const exampleEventSchemas = {
  example_created: exampleCreatedPropsSchema,
} as const
