import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'
import * as ConvertCompletionEntry from '../ConvertTsCompletionEntry/ConvertTsCompletionEntry.ts'
import * as IsUsefulEntry from '../IsUsefulEntry/IsUsefulEntry.ts'

export const getCompletionFromTsResult = (tsResult: TypeScriptProtocol.CompletionInfoResponse['body']) => {
  if (!tsResult) {
    return []
  }
  return tsResult.entries.filter(IsUsefulEntry.isUsefulEntry).map(ConvertCompletionEntry.convertTsCompletionEntry)
}
