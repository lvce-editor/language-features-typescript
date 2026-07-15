import * as GetDiagnosticSeverity from '../GetDiagnosticSeverity/GetDiagnosticSeverity.ts'
import { getPositionAt } from '../GetPositionAt/GetPositionAt.ts'

interface TypeScriptDiagnostic {
  readonly category: number
  readonly code: number
  readonly file: { readonly fileName: string } | undefined
  readonly length: number | undefined
  readonly messageText: string
  readonly start: number | undefined
}

interface TypeScriptDiagnosticWithLocation extends TypeScriptDiagnostic {
  readonly file: { readonly fileName: string }
  readonly length: number
  readonly start: number
}

interface ConvertedDiagnostic {
  readonly code: number
  readonly columnIndex: number
  readonly endColumnIndex: number
  readonly endRowIndex: number
  readonly message: string
  readonly rowIndex: number
  readonly source: 'ts'
  readonly type: 'error' | 'warning'
  readonly uri: string
}

/**
 *
 */
const convertTsDiagnostic = (text: string, diagnostic: TypeScriptDiagnosticWithLocation): ConvertedDiagnostic => {
  // TODO in api, use only start offset and end offset. problems view can convert locations if needed
  const start = getPositionAt(text, diagnostic.start)
  const end = getPositionAt(text, diagnostic.start + diagnostic.length)
  return {
    code: diagnostic.code,
    columnIndex: start.columnIndex - 1, // TODO should be offset based here
    endColumnIndex: end.columnIndex - 1,
    endRowIndex: end.rowIndex - 1,
    message: diagnostic.messageText,
    rowIndex: start.rowIndex - 1,
    source: 'ts',
    type: GetDiagnosticSeverity.getDiagnosticSeverity(diagnostic),
    uri: diagnostic.file.fileName,
  }
}

const hasLocation = (diagnostic: TypeScriptDiagnostic): diagnostic is TypeScriptDiagnosticWithLocation => {
  return Boolean(diagnostic.file) && diagnostic.start !== undefined && diagnostic.length !== undefined
}

export const getDiagnosticsFromTsResult2 = (
  text: string,
  tsResult: readonly TypeScriptDiagnostic[],
): readonly ConvertedDiagnostic[] => {
  const diagnostics: ConvertedDiagnostic[] = []
  for (const tsDiagnostic of tsResult) {
    if (!hasLocation(tsDiagnostic)) {
      continue
    }
    diagnostics.push(convertTsDiagnostic(text, tsDiagnostic))
  }
  return diagnostics
}
