import type { ServiceDefinition } from '../services/definition.js'
import { z, type ZodType } from 'zod'
import type { ProductScope } from '../scopes.js'
import type { ToolAnnotations } from './annotations.js'

export interface ToolDefinition<I extends ZodType = ZodType, O extends ZodType = ZodType> {
  /** Internal contract traceability; never publish this metadata to the model. */
  readonly serviceBinding?: {
    readonly status: 'planned' | 'bound'
    readonly projection: string
    readonly operations: Readonly<Record<string, ToolOperation>>
    readonly gap?: string
  }
  readonly collection: string
  readonly name: string
  readonly title?: string
  readonly description: string
  readonly scope: ProductScope
  readonly annotations: ToolAnnotations
  readonly inputSchema: I
  /** The actual JSON structuredContent received by the agent, not a service's internal receipt. */
  readonly outputSchema: O
  readonly readiness: 'implemented' | 'contract-only'
  /**
   * 'required' makes the MCP boundary assert an active subscription before the handler runs.
   * Declare it when the bound service is an account action that stays open on the web
   * (profile edits) but chat, the paid product, must refuse without a plan.
   */
  readonly entitlement?: 'required'
  readonly evals?: string
  readonly specification?: string
  readonly outputTemplateUri?: string
}

export interface ToolCollection {
  readonly title: string
  readonly description: string
  readonly instructions?: string
  readonly kind: 'product' | 'scaffold'
  readonly tools: readonly ToolDefinition[]
}

export interface PromptDefinition {
  readonly name: string
  readonly title: string
  readonly description: string
  readonly requiredTools: readonly string[]
}

/** Read operation discriminants from published input JSON Schema, including nested unions. */
export function toolOperationNames(tool: ToolDefinition): string[] {
  const schema = tool.inputSchema.toJSONSchema({ io: 'input' })
  const names = new Set<string>()
  function visit(node: unknown) {
    if (!node || typeof node !== 'object') return
    const value = node as {
      properties?: Record<string, { const?: unknown; enum?: unknown[] }>
      anyOf?: unknown[]
      oneOf?: unknown[]
    }
    const operation = value.properties?.operation
    const target = value.properties?.target
    if (operation)
      for (const name of operation.enum ?? [operation.const])
        if (typeof name === 'string') names.add(name)
    if (target)
      for (const name of target.enum ?? [target.const])
        if (typeof name === 'string')
          names.add(name === 'result' && value.properties?.marked ? 'habit' : name)
    for (const branch of [...(value.anyOf ?? []), ...(value.oneOf ?? [])]) visit(branch)
  }
  visit(schema)
  return names.size ? [...names].sort() : ['call']
}

/** Pure mapping declarations: adapters implement transformations outside the contract. */
export type ToolOperation = {
  readonly mode: 'direct' | 'adapted'
  readonly services: readonly ServiceDefinition[]
}

export function adapted<const D extends readonly ServiceDefinition[]>(...services: D) {
  return { mode: 'adapted', services } as const
}

export function direct<const D extends ServiceDefinition>(service: D) {
  return { mode: 'direct', services: [service] } as const
}

type DirectCompatible<D extends ToolDefinition, O> = O extends {
  mode: 'direct'
  services: readonly [infer S extends ServiceDefinition]
}
  ? [z.output<D['inputSchema']>] extends [z.input<S['inputSchema']>]
    ? [z.output<S['outputSchema']>] extends [z.input<D['outputSchema']>]
      ? true
      : false
    : false
  : true

type MappingProof<D extends ToolDefinition> = D extends { serviceBinding: { operations: infer O } }
  ? false extends { [K in keyof O]: DirectCompatible<D, O[K]> }[keyof O]
    ? { readonly incompatible_direct_mapping: never }
    : unknown
  : unknown

/** Preserve individual schema and service types instead of widening them to the registry type. */
export function defineTool<const D extends ToolDefinition>(definition: D & MappingProof<D>): D {
  validateToolDefinition(definition)
  return definition
}

export function validateToolDefinition(definition: ToolDefinition): void {
  if (definition.serviceBinding) {
    const names = toolOperationNames(definition)
    if (names.join() !== Object.keys(definition.serviceBinding.operations).sort().join())
      throw new Error(`MCP operation coverage mismatch: ${definition.name}`)
    for (const [name, mapping] of Object.entries(definition.serviceBinding.operations)) {
      if (!mapping.services.length && !definition.serviceBinding.gap)
        throw new Error(`Unexplained unmapped operation: ${definition.name}.${name}`)
      if (mapping.mode === 'direct' && (name !== 'call' || mapping.services.length !== 1))
        throw new Error(
          `Direct mappings require one service and an undispatched input: ${definition.name}`,
        )
    }
  }
}
