import * as LanguageServiceState from '../LanguageServiceState/LanguageServiceState.js'

export const getCompletion = (params) => {
  const { file, line, offset } = params
  const languageService = LanguageServiceState.get()
  const tsCompletionResult = languageService.getCompletionsAtPosition(file, offset, {})
  return {
    entries: tsCompletionResult.entries,
  }
}
