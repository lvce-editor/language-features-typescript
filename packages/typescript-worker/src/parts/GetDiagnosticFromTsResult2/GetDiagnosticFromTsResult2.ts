import type ts from 'typescript'
import * as GetDiagnosticSeverity from '../GetDiagnosticSeverity/GetDiagnosticSeverity.ts'
import { getPositionAt } from '../GetPositionAt/GetPositionAt.ts'

/**
 *
 */
const convertTsDiagnostic = (text: string, diagnostic: ts.DiagnosticWithLocation) => {
  // TODO in api, use only startoffset and endoffset. problems view can convert locations if needed
  const start = getPositionAt(text, diagnostic.start)
  const end = getPositionAt(text, diagnostic.start + diagnostic.length)
  return {
    rowIndex: start.rowIndex - 1,
    columnIndex: start.columnIndex - 1, // TODO should be offset based here
    endRowIndex: end.rowIndex - 1,
    endColumnIndex: end.columnIndex - 1,

    message: diagnostic.messageText,
    type: GetDiagnosticSeverity.getDiagnosticSeverity(diagnostic),
    uri: diagnostic.file.fileName,
    source: 'ts',
    code: diagnostic.code,
  }
}

export const getDiagnosticsFromTsResult2 = (text: string, tsResult: readonly ts.DiagnosticWithLocation[]) => {
  const diagnostics: any[] = []
  for (const tsDiagnostic of tsResult) {
    diagnostics.push(convertTsDiagnostic(text, tsDiagnostic))
  }
  return diagnostics
}
