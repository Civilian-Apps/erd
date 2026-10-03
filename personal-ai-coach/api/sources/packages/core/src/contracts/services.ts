/** Approved application capabilities. Adding an entry requires contract review. No automatic registration. */
import type { ServiceManifest } from './service-types.js'
import * as cycles from '../features/cycles/service.contract.js'
import * as objectives from '../features/objectives/service.contract.js'
import * as results from '../features/results/service.contract.js'
import * as actions from '../features/actions/service.contract.js'
import * as notes from '../features/notes/service.contract.js'
import * as sessions from '../features/sessions/service.contract.js'
import * as identityBilling from '../features/identity-billing/service.contract.js'
import * as recordQuery from '../features/record-query/service.contract.js'
export const serviceManifest = {
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
  objectives: {
    preview_deletion: objectives.previewObjectiveDeletion,
    create: objectives.createObjective,
    list: objectives.listObjectives,
    get: objectives.getObjective,
    update: objectives.updateObjective,
    delete: objectives.deleteObjective,
  },
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
  notes: {
    preview_deletion: notes.previewNoteDeletion,
    create: notes.addNote,
    update: notes.updateNote,
    list: notes.listNotes,
    get: notes.getNote,
    delete: notes.deleteNote,
  },
  sessions: {
    get_stored: sessions.readStoredSession,
    start: sessions.loadBriefing,
    list: sessions.listSessions,
    get: sessions.getSession,
    close: sessions.closeSession,
  },
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
  record: {
    query: recordQuery.queryRecord,
  },
} as const satisfies ServiceManifest
export type ApprovedServices = typeof serviceManifest
