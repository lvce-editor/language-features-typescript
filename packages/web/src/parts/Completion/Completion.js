import * as LanguageServiceState from '../LanguageServiceState/LanguageServiceState.js'

export const getCompletion = async (params) => {
  const languageService = LanguageServiceState.get()
  const { file, line, offset } = params
  const x = await languageService.getCompletionsAtPosition('/index.ts', offset, {})
  return {
    entries: [],
  }
}
