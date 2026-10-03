/** Pure event definitions and conditional emission references; no persistence or application inventory imports. */
import type { z } from 'zod'

export interface EventDefinition<N extends string = string, P extends z.ZodType = z.ZodType> {
  readonly name: N
  readonly payloadSchema: P
  readonly requirement: string
  readonly description: string
  readonly externalProducers?: readonly {
    readonly kind: 'auth-hook' | 'billing-webhook' | 'page' | 'mcp-boundary'
    readonly source: string
    readonly when: string
  }[]
  readonly gaps?: readonly string[]
}

export function defineEvent<const N extends string, P extends z.ZodType>(
  name: N,
  payloadSchema: P,
  details: Omit<EventDefinition<N, P>, 'name' | 'payloadSchema'>,
): EventDefinition<N, P> {
  return Object.freeze({ name, payloadSchema, ...details })
}

export interface EventEmission {
  readonly event: EventDefinition
  /** May emit only when this condition holds; a declaration is not an executed side effect. */
  readonly when: string
}
