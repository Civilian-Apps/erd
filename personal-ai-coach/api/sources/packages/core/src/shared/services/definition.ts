/** Pure service vocabulary. Descriptors declare obligations; execution enforces them. */
import type { z } from 'zod'
import type { surfaceSchema } from '../schemas.js'
import type { EventEmission } from '../events/definition.js'

/** Server-populated context, never accepted as public API/MCP arguments.
 * Session start requires session_origin; adapters derive it from the verified OAuth client
 * and host metadata. A service implementation rejects absent origin before creating a session.
 */
export interface ServiceContext {
  readonly userId: string
  /** Supplied by the authenticated transport, never a public argument. */
  readonly surface: z.output<typeof surfaceSchema>
  readonly session_origin?: {
    readonly vendor: 'claude' | 'openai'
    readonly source_url?: string
  }
}

export type ServiceAccess =
  | 'retained-read'
  | 'entitled-write'
  | 'account-management'
  | 'session-start'

export type ServiceEffect = 'read' | 'write' | 'delete' | 'external'

export type ServiceError =
  | 'UNAUTHORIZED'
  | 'BAD_REQUEST'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'NOT_IMPLEMENTED'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_SERVER_ERROR'

export interface ServicePolicy {
  readonly emits?: readonly EventEmission[]
  readonly access: ServiceAccess
  readonly effect: ServiceEffect
  readonly retry: string
  readonly source?: string
  readonly trustedContext?: 'session-origin'
  readonly requirement: string
  readonly errors: readonly ServiceError[]
}

export interface ServiceDefinition<
  I extends z.ZodType = z.ZodType,
  O extends z.ZodType = z.ZodType,
> extends ServicePolicy {
  readonly inputSchema: I
  readonly outputSchema: O
  readonly readiness: 'contract-only' | 'implemented'
}

export function defineService<
  I extends z.ZodType,
  O extends z.ZodType,
  const P extends ServicePolicy,
>(inputSchema: I, outputSchema: O, policy: P): ServiceDefinition<I, O> & P {
  return Object.freeze({ inputSchema, outputSchema, ...policy, readiness: 'contract-only' })
}

export type ServiceManifest = Readonly<Record<string, Readonly<Record<string, ServiceDefinition>>>>

/** Deliberately retains each entry's exact schema types. */
export type ServiceInput<D extends ServiceDefinition> = z.input<D['inputSchema']>

export type ServiceOutput<D extends ServiceDefinition> = z.output<D['outputSchema']>

export type ServiceContextFor<D extends ServiceDefinition> = D extends {
  trustedContext: 'session-origin'
}
  ? ServiceContext & { readonly session_origin: NonNullable<ServiceContext['session_origin']> }
  : ServiceContext
