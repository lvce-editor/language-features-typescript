import * as GetDiagnosticSeverity from '../GetDiagnosticSeverity/GetDiagnosticSeverity.ts'
import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.cts'

/**
 *
 */
const convertTsDiagnostic = (textDocument: any, diagnostic: TypeScriptProtocol.Diagnostic) => {
  return {
    rowIndex: diagnostic.start.line - 1,
    columnIndex: diagnostic.start.offset - 1, // TODO should be offset based here
    endRowIndex: diagnostic.end.line - 1,
    endColumnIndex: diagnostic.end.offset - 1,
    // endOffset,
    message: diagnostic.text,
    type: GetDiagnosticSeverity.getDiagnosticSeverity(diagnostic),
    uri: textDocument.uri,
    source: 'ts',
    code: diagnostic.code,
  }
}

export const getDiagnosticsFromTsResult = (
  textDocument: any,
  tsResult: TypeScriptProtocol.SemanticDiagnosticsSyncResponse['body'],
) => {
  const diagnostics = []
  for (const tsDiagnostic of tsResult) {
    // @ts-ignore
    diagnostics.push(convertTsDiagnostic(textDocument, tsDiagnostic))
  }
  return diagnostics
}
