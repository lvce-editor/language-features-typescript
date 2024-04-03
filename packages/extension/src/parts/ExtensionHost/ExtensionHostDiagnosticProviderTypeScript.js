import * as Diagnostic from '../Diagnostic/Diagnostic.js'
import * as GetDiagnosticFromTsResult from '../GetDiagnosticFromTsResult/GetDiagnosticFromTsResult.js'

export const languageId = 'typescript'

/**
 */
export const provideDiagnostics = async (textDocument) => {
  // Debug.debug(`getting diagnostics for ${textDocument.uri}`)
  const tsResult = await Diagnostic.getDiagnostics(textDocument)
  return GetDiagnosticFromTsResult.getDiagnosticsFromTsResult(textDocument, tsResult)
}
