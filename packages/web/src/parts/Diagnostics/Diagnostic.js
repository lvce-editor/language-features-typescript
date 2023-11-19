import * as LanguageServiceState from '../LanguageServiceState/LanguageServiceState.js'

const getDiagnosticFromTsResult = (languageService, file, tsDiagnostic) => {
  const { start, length, messageText } = tsDiagnostic
  const startPosition = languageService.toLineColumnOffset(file, start)
  const endPosition = languageService.toLineColumnOffset(file, start + length)
  return {
    start: {
      line: startPosition.line + 1,
      offset: startPosition.character + 1,
    },
    end: {
      line: endPosition.line + 1,
      offset: endPosition.character + 1,
    },
    text: messageText,
  }
}

const getDiagnosticsFromTsResult = (languageService, file, tsResult) => {
  const diagnostics = []
  for (const tsDiagnostic of tsResult) {
    diagnostics.push(getDiagnosticFromTsResult(languageService, file, tsDiagnostic))
  }
  console.log({ diagnostics })
  return diagnostics
}

export const getDiagnostics = (params) => {
  console.log({ params })
  const { file } = params
  const languageService = LanguageServiceState.get()
  const tsResult = languageService.getSemanticDiagnostics(file)
  const diagnostics = getDiagnosticsFromTsResult(languageService, file, tsResult)
  return diagnostics
}
