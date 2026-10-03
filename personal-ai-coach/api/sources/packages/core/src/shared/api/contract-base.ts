import type { ServiceDefinition } from '../services/definition.js'
import {
  oc,
  ContractProcedure,
  type AnySchema,
  type ErrorMap,
  type InferSchemaInput,
  type InferSchemaOutput,
} from '@orpc/contract'
import { z } from 'zod'

export interface ApiMeta {
  service?: ServiceDefinition
  access: 'retained-read' | 'entitled-write' | 'account-management' | 'session-start'
  implementation: 'contract-only' | 'implemented'
}

// Existing service error data, distinct from oRPC's input-validation issue payload.
export const domainErrorData = z.object({
  error_code: z.string(),
  outcome: z.enum(['not_applied', 'unknown']).optional(),
  constraint: z.string().nullable().optional(),
  table: z.string().nullable().optional(),
  message: z.string().optional(),
})

const pathSegment = z.union([z.string(), z.number()])

export const validationErrorData = z.object({
  issues: z.array(
    z.object({
      message: z.string(),
      path: z.array(z.union([pathSegment, z.object({ key: pathSegment })])).optional(),
    }),
  ),
})

export const apiProcedure = oc
  .$meta<ApiMeta>({ access: 'retained-read', implementation: 'contract-only' })
  .errors({
    UNAUTHORIZED: {},
    BAD_REQUEST: { data: z.union([domainErrorData, validationErrorData]).optional() },
    FORBIDDEN: { data: domainErrorData.optional() },
    NOT_FOUND: { data: domainErrorData.optional() },
    CONFLICT: { data: domainErrorData.optional() },
    TOO_MANY_REQUESTS: {},
    INTERNAL_SERVER_ERROR: { data: domainErrorData.optional() },
    NOT_IMPLEMENTED: { data: z.object({ error_code: z.literal('NOT_IMPLEMENTED') }) },
  })

/** Bind a finalized transport declaration to its service before any handler exists.
 * Input flows API parsed → service input; output flows service parsed → API input.
 * Runtime validation still enforces refinements, strict fields and serialization.
 */
export function defineServiceApi<
  D extends ServiceDefinition,
  I extends AnySchema,
  O extends AnySchema,
  E extends ErrorMap,
>(
  service: D,
  contract: ContractProcedure<I, O, E, ApiMeta> &
    ([InferSchemaOutput<I>] extends [z.input<D['inputSchema']>]
      ? unknown
      : { input_adapter_required: true }) &
    ([z.output<D['outputSchema']>] extends [InferSchemaInput<O>]
      ? unknown
      : { output_adapter_required: true }),
): ContractProcedure<I, O, E, ApiMeta & { service: D }> {
  return new ContractProcedure({
    ...contract['~orpc'],
    meta: { ...contract['~orpc'].meta, service },
  })
}
