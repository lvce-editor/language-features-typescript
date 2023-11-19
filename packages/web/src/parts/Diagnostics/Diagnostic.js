import * as LanguageServiceState from '../LanguageServiceState/LanguageServiceState.js'

export const getDiagnostics = (params) => {
  console.log({ params })
  const { file } = params
  const languageService = LanguageServiceState.get()
  const tsResult = languageService.getSemanticDiagnostics(file)
  return tsResult
}
