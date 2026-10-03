import { z } from 'zod'
import { changedSchema, writeResultSchema } from '../../shared/schemas.js'
import { profileSchema } from './records.js'

/** Feature-owned response schemas; no execution imports. */
export const userReadOutput = z.strictObject({ profile: profileSchema })

export const userUpdateOutput = z.strictObject({ profile: profileSchema, changed: changedSchema })

export const userWriteResultSchema = writeResultSchema(profileSchema)
