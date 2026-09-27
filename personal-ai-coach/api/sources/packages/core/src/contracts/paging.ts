// Canonical bounded wire page, shared by list procedures, records and widgets.
import { z } from 'zod'
export function pageSchema<T extends z.ZodType>(item: T, max = 100) {
 return z.strictObject({items:z.array(item).max(max),next_cursor:z.string().min(1).nullable()})
}
export const collectionNameSchema=z.enum(['cycles','objectives','results','actions','notes','sessions','updates','marks','logs','trend'])
export const continuationsSchema=z.partialRecord(collectionNameSchema,z.string().min(1))
export type CollectionName=z.infer<typeof collectionNameSchema>
