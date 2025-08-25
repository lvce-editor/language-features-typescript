import type ts from 'typescript'
import * as GetDiagnosticSeverity from '../GetDiagnosticSeverity/GetDiagnosticSeverity.ts'
import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'

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

export const getDiagnosticsFromTsResult2 = (textDocument: any, tsResult: readonly ts.DiagnosticWithLocation[]) => {
  const diagnostics = []
  for (const tsDiagnostic of tsResult) {
    // @ts-ignore
    diagnostics.push(convertTsDiagnostic(textDocument, tsDiagnostic))
  }
  return diagnostics
}
