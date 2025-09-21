// @ts-nocheck
import * as NotUsefulEntries from '../NotUsefuleEntries/NotUsefulEntries.js'

export const languageId = 'typescript'

/**
 *
 * @param {import('typescript/lib/protocol').CompletionEntry} tsEntry
 */
export const isUsefulEntry = (tsEntry) => {
  return !NotUsefulEntries.notUsefulEntries.has(tsEntry.name)
}
