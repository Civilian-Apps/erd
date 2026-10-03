/** Approved inventory, ordered surfaces → transports → services → events.
 * Definitions and connections stay at their source; api:docs:build derives the flow review.
 * Service namespaces preserve their public references; adjacent groups share a feature owner.
 */
import * as identitybillingEvents from '../features/identity-billing/events.js'
import * as sessionsEvents from '../features/sessions/events.js'
import * as notesEvents from '../features/notes/events.js'
import * as actionsEvents from '../features/actions/events.js'
import * as resultsEvents from '../features/results/events.js'
import * as objectivesEvents from '../features/objectives/events.js'
import * as cyclesEvents from '../features/cycles/events.js'
import * as cycles from '../features/cycles/service.contract.js'
import * as objectives from '../features/objectives/service.contract.js'
import * as results from '../features/results/service.contract.js'
import * as actions from '../features/actions/service.contract.js'
import * as notes from '../features/notes/service.contract.js'
import * as sessions from '../features/sessions/service.contract.js'
import * as identityBilling from '../features/identity-billing/service.contract.js'
import * as recordQuery from '../features/record-query/service.contract.js'
import type { EventDefinition } from '../shared/events/definition.js'
import { type ApiContract, apiContract } from './api.js'
import {
  toolOperationNames,
  validateToolDefinition,
  type ToolCollection,
} from '../shared/mcp/types.js'
import { type PageDef, pages, overlays } from './pages.js'
import type { ServiceDefinition, ServiceManifest } from '../shared/services/definition.js'
import { collections, promptContracts } from './tools.js'
import { widgets, type WidgetDefinition } from './widgets.js'
import { exampleCreated } from '../features/example/events.js'

export type EventGroups = Readonly<Record<string, Readonly<Record<string, EventDefinition>>>>

export interface ApplicationDefinition {
  /** Review locator only: do not import Drizzle/database code into transport declarations. */
  readonly schema: { readonly source: `${string}.ts`; readonly ontology: `${string}.md` }
  readonly overlays: typeof overlays
  readonly prompts: typeof promptContracts
  readonly pages: readonly PageDef[]
  readonly widgets: Readonly<Record<string, WidgetDefinition>>
  readonly api: ApiContract
  readonly mcp: Readonly<Record<string, ToolCollection>>
  readonly services: ServiceManifest
  readonly events: EventGroups
}

export function defineApplication<const T extends ApplicationDefinition>(definition: T): T {
  return definition
}

export const application = defineApplication({
  schema: { source: 'packages/core/src/contracts/schema.ts', ontology: 'docs/ONTOLOGY.md' },
  pages,
  overlays,
  widgets,
  prompts: promptContracts,
  api: apiContract,
  mcp: collections,
  services: {
    // Cycles.
    cycles: {
      create: cycles.createCycle,
      resolve_active: cycles.getActiveCycle,
      get_stored_active: cycles.getStoredActiveCycle,
      preview_deletion: cycles.previewCycleDeletion,
      get: cycles.getCycle,
      list: cycles.listCycles,
      update: cycles.updateCycle,
      delete: cycles.deleteCycle,
    },
    // Objectives.
    objectives: {
      preview_deletion: objectives.previewObjectiveDeletion,
      create: objectives.createObjective,
      list: objectives.listObjectives,
      get: objectives.getObjective,
      update: objectives.updateObjective,
      delete: objectives.deleteObjective,
    },
    // Results, result logs and habit logs.
    results: {
      history: results.readResultHistory,
      preview_deletion: results.previewResultDeletion,
      create: results.createResult,
      list: results.listResults,
      get: results.getResult,
      update: results.updateResult,
      delete: results.deleteResult,
    },
    result_logs: {
      create: results.createResultLog,
      list: results.listResultLogs,
      clear_comment: results.clearResultLogComment,
      delete: results.deleteResultLog,
    },
    habit_logs: {
      set: results.setHabitLog,
      list: results.listHabitLogs,
    },
    // Actions and action logs.
    actions: {
      history: actions.readActionHistory,
      preview_deletion: actions.previewActionDeletion,
      create: actions.createAction,
      list: actions.listActions,
      get: actions.getAction,
      update: actions.updateAction,
      reorder: actions.reorderAction,
      delete: actions.deleteAction,
    },
    action_logs: {
      create: actions.createActionLog,
      list: actions.listActionLogs,
      clear_comment: actions.clearActionLogComment,
    },
    // Notes.
    notes: {
      preview_deletion: notes.previewNoteDeletion,
      create: notes.addNote,
      update: notes.updateNote,
      list: notes.listNotes,
      get: notes.getNote,
      delete: notes.deleteNote,
    },
    // Sessions and record queries.
    sessions: {
      get_stored: sessions.readStoredSession,
      start: sessions.loadBriefing,
      list: sessions.listSessions,
      get: sessions.getSession,
      close: sessions.closeSession,
    },
    record: {
      query: recordQuery.queryRecord,
    },
    // Identity and billing.
    user: {
      get: identityBilling.getUser,
      update: identityBilling.updateUser,
      delete: identityBilling.deleteUser,
    },
    billing: {
      create_checkout_session: identityBilling.createCheckoutSession,
      create_portal_session: identityBilling.createBillingPortalSession,
      get_details: identityBilling.getBillingDetails,
    },
  },
  events: {
    cycles: {
      cycle_created: cyclesEvents.cycleCreated,
      cycle_archived: cyclesEvents.cycleArchived,
    },
    objectives: {
      objective_created: objectivesEvents.objectiveCreated,
    },
    results: {
      result_update_recorded: resultsEvents.resultUpdateRecorded,
    },
    actions: {
      action_created: actionsEvents.actionCreated,
      action_status_changed: actionsEvents.actionStatusChanged,
    },
    notes: {
      note_created: notesEvents.noteCreated,
    },
    sessions: {
      session_started: sessionsEvents.sessionStarted,
      session_summary_written: sessionsEvents.sessionSummaryWritten,
      chat_tool_used: sessionsEvents.chatToolUsed,
    },
    identity_billing: {
      account_created: identitybillingEvents.accountCreated,
      subscription_started: identitybillingEvents.subscriptionStarted,
      subscription_cancelled: identitybillingEvents.subscriptionCancelled,
      connector_authorised: identitybillingEvents.connectorAuthorised,
      onboarding_step_completed: identitybillingEvents.onboardingStepCompleted,
      profile_updated: identitybillingEvents.profileUpdated,
      account_deleted: identitybillingEvents.accountDeleted,
    },
    example: { example_created: exampleCreated },
  },
})

export type Application = typeof application

/** Identity/membership checks supplement static shape checks. No handlers are loaded. */
export function validateApplication(definition: ApplicationDefinition): void {
  const approved = new Set<ServiceDefinition>()
  for (const [group, entries] of Object.entries(definition.services)) {
    for (const [name, service] of Object.entries(entries)) {
      if (approved.has(service)) throw new Error(`Duplicate service declaration: ${group}.${name}`)
      approved.add(service)
    }
  }
  const procedures = new Set<string>()
  for (const [group, entries] of Object.entries(definition.api)) {
    for (const [name, procedure] of Object.entries(entries)) {
      procedures.add(`${group}.${name}`)
      // The retained scaffold predates product service contracts.
      if (group !== 'example' && !approved.has(procedure['~orpc'].meta.service!))
        throw new Error(`API operation missing approved service: ${group}.${name}`)
    }
  }
  const tools = new Set<string>()
  const operationsByTool = new Map<string, string[]>()
  for (const [group, collection] of Object.entries(definition.mcp)) {
    for (const tool of collection.tools) {
      validateToolDefinition(tool)
      if (tools.has(tool.name)) throw new Error(`Duplicate tool name: ${tool.name}`)
      tools.add(tool.name)
      operationsByTool.set(tool.name, toolOperationNames(tool))
      if (tool.collection !== group) throw new Error(`Wrong tool collection: ${tool.name}`)
      if (collection.kind === 'product' && !tool.serviceBinding)
        throw new Error(`MCP tool missing service mapping: ${tool.name}`)
      for (const services of Object.values(tool.serviceBinding?.operations ?? {})) {
        if (services.services.some((service) => !approved.has(service)))
          throw new Error(`MCP operation references an unapproved service: ${tool.name}`)
      }
    }
  }
  for (const [name, overlay] of Object.entries(definition.overlays)) {
    for (const procedure of overlay.procedures) {
      if (!procedures.has(procedure))
        throw new Error(`Unknown overlay API reference: ${name} → ${procedure}`)
    }
  }
  const routes = new Set<string>()
  for (const page of definition.pages) {
    if (routes.has(page.path)) throw new Error(`Duplicate page route: ${page.path}`)
    routes.add(page.path)
    for (const name of page.overlays ?? []) {
      if (!Object.hasOwn(definition.overlays, name))
        throw new Error(`Unknown page overlay reference: ${page.path} → ${name}`)
    }
    for (const path of [...page.reads, ...page.writes]) {
      if (!procedures.has(path))
        throw new Error(`Unknown page API reference: ${page.path} → ${path}`)
    }
  }
  const promptNames = new Set<string>()
  for (const prompt of definition.prompts) {
    if (promptNames.has(prompt.name)) throw new Error(`Duplicate prompt: ${prompt.name}`)
    promptNames.add(prompt.name)
    for (const tool of prompt.requiredTools) {
      if (!tools.has(tool)) throw new Error(`Unknown prompt tool: ${prompt.name} → ${tool}`)
    }
  }
  const widgetUris = new Set<string>()
  for (const [id, widget] of Object.entries(definition.widgets)) {
    if (widgetUris.has(widget.resourceUri))
      throw new Error(`Duplicate widget URI: ${widget.resourceUri}`)
    widgetUris.add(widget.resourceUri)
    if (!widget.pages.length || !widget.sources.length)
      throw new Error(`Widget must name its page and source: ${id}`)
    for (const path of widget.pages) {
      if (!routes.has(path)) throw new Error(`Unknown widget page: ${id} → ${path}`)
    }
    for (const source of widget.sources) {
      if (!tools.has(source.tool)) throw new Error(`Unknown widget tool: ${id} → ${source.tool}`)
      if (
        !source.operations.length ||
        source.operations.some(
          (operation) => !operationsByTool.get(source.tool)?.includes(operation),
        )
      )
        throw new Error(`Unknown widget tool operation: ${id} → ${source.tool}`)
      if (!source.when.trim()) throw new Error(`Missing widget source condition: ${id}`)
    }
    if (widget.binding === 'planned' && !widget.gap?.trim())
      throw new Error(`Missing widget binding gap: ${id}`)
    if (widget.readiness === 'contract-only' && widget.binding === 'bound')
      throw new Error(`Unimplemented widget claims a bound renderer: ${id}`)
  }
  const eventNames = new Set<string>()
  for (const group of Object.values(definition.events)) {
    for (const [name, event] of Object.entries(group)) {
      if (eventNames.has(name)) throw new Error(`Duplicate event name: ${name}`)
      if (name !== event.name) throw new Error(`Event name differs from registration: ${name}`)
      eventNames.add(name)
    }
  }
  const events = new Set(Object.values(definition.events).flatMap((group) => Object.values(group)))
  for (const service of approved) {
    for (const emission of service.emits ?? []) {
      if (!events.has(emission.event))
        throw new Error(`Unapproved service event: ${emission.event.name}`)
      if (!emission.when.trim())
        throw new Error(`Missing emission condition: ${emission.event.name}`)
    }
  }
}
