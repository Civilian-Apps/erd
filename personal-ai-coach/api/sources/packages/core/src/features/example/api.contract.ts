/** Retained scaffold API contract; canonical example schemas stay feature-owned. */
import { apiProcedure } from '../../shared/api/contract-base.js'
import {
  orpcCreateExampleInput,
  exampleRow,
  exampleListRow,
  deleteExampleInput,
  deleteExampleResult,
} from './contract.js'

export const exampleContract = {
  list: apiProcedure
    .meta({ access: 'retained-read', implementation: 'implemented' })
    .output(exampleListRow.array()),
  create: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'implemented' })
    .input(orpcCreateExampleInput)
    .output(exampleRow),
  delete: apiProcedure
    .meta({ access: 'entitled-write', implementation: 'implemented' })
    .input(deleteExampleInput)
    .output(deleteExampleResult),
}
