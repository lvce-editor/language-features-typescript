import * as LanguageServiceState from '../LanguageServiceState/LanguageServiceState.js'

const getDiagnosticFromTsResult = (diagnostic) => {
  return {
    start: {
      line: 1,
      offset: 1,
    },
    end: {
      line: 1,
      offset: 5,
    },
    text: diagnostic.messageText,
  }
}

const getDiagnosticsFromTsResult = (tsResult) => {
  return tsResult.map(getDiagnosticFromTsResult)
}

export const getDiagnostics = (params) => {
  console.log({ params })
  const { file } = params
  const languageService = LanguageServiceState.get()
  const tsResult = languageService.getSemanticDiagnostics(file)
  const diagnostics = getDiagnosticsFromTsResult(tsResult)
  return diagnostics
}
