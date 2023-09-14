import * as LanguageServiceState from '../LanguageServiceState/LanguageServiceState.js'

export const getCompletion = async (params) => {
  const languageService = LanguageServiceState.get()
  const x = await languageService.getCompletionsAtPosition(params)
  return {
    entries: [],
  }
}
