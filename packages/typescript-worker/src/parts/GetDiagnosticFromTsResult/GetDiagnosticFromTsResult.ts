import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'
import * as GetDiagnosticSeverity from '../GetDiagnosticSeverity/GetDiagnosticSeverity.ts'

/**
 *
 */
const convertTsDiagnostic = (textDocument: any, diagnostic: TypeScriptProtocol.Diagnostic) => {
  return {
    code: diagnostic.code,
    columnIndex: diagnostic.start.offset - 1, // TODO should be offset based here
    endColumnIndex: diagnostic.end.offset - 1,
    endRowIndex: diagnostic.end.line - 1,
    // endOffset,
    message: diagnostic.text,
    rowIndex: diagnostic.start.line - 1,
    source: 'ts',
    type: GetDiagnosticSeverity.getDiagnosticSeverity(diagnostic),
    uri: textDocument.uri,
  }
}

export const getDiagnosticsFromTsResult = (
  textDocument: any,
  tsResult: TypeScriptProtocol.SemanticDiagnosticsSyncResponse['body'],
) => {
  const diagnostics = []
  const tsDiagnostics = tsResult || []
  for (const tsDiagnostic of tsDiagnostics) {
    // @ts-ignore
    diagnostics.push(convertTsDiagnostic(textDocument, tsDiagnostic))
  }
  return diagnostics
}
