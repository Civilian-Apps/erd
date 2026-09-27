/** Client-safe oRPC contract vocabulary. Metadata declares policy; services enforce it. */
import { oc } from '@orpc/contract'
import { z } from 'zod'

export interface ApiMeta {
  access: 'retained-read' | 'entitled-write' | 'account-management' | 'session-start'
  implementation: 'contract-only' | 'implemented'
}

// Existing service error data, distinct from oRPC's input-validation issue payload.
export const domainErrorData = z.object({
  error_code: z.string(),
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
    NOT_IMPLEMENTED: { data: z.object({ error_code: z.literal('NOT_IMPLEMENTED') }) },
  })
