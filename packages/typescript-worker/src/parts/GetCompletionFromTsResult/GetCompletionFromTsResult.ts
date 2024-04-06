import * as ConvertCompletionEntry from '../ConvertTsCompletionEntry/ConvertTsCompletionEntry.ts'
import * as IsUsefulEntry from '../IsUsefulEntry/IsUsefulEntry.ts'

export const getCompletionFromTsResult = (tsResult) => {
  return tsResult.entries.filter(IsUsefulEntry.isUsefulEntry).map(ConvertCompletionEntry.convertTsCompletionEntry)
}
