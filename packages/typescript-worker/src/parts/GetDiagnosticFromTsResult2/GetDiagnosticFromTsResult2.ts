import * as GetDiagnosticSeverity from '../GetDiagnosticSeverity/GetDiagnosticSeverity.ts'
import { getPositionAt } from '../GetPositionAt/GetPositionAt.ts'

interface TypeScriptDiagnosticMessageChain {
  readonly messageText: string
  readonly next?: readonly TypeScriptDiagnosticMessageChain[]
}

interface TypeScriptDiagnostic {
  readonly category: number
  readonly code: number
  readonly file: { readonly fileName: string; readonly text?: string } | undefined
  readonly length: number | undefined
  readonly messageText: string | TypeScriptDiagnosticMessageChain
  readonly relatedInformation?: readonly TypeScriptDiagnostic[]
  readonly start: number | undefined
}

interface TypeScriptDiagnosticWithLocation extends TypeScriptDiagnostic {
  readonly file: { readonly fileName: string; readonly text?: string }
  readonly length: number
  readonly start: number
}

interface ConvertedDiagnostic {
  readonly code: number
  readonly columnIndex: number
  readonly endColumnIndex: number
  readonly endRowIndex: number
  readonly message: string
  readonly relatedInformation?: readonly ConvertedRelatedInformation[]
  readonly rowIndex: number
  readonly source: 'ts'
  readonly type: 'error' | 'warning'
  readonly uri: string
}

interface ConvertedRelatedInformation {
  readonly columnIndex: number
  readonly endColumnIndex: number
  readonly endRowIndex: number
  readonly message: string
  readonly rowIndex: number
  readonly uri: string
}

const flattenDiagnosticMessageText = (
  messageText: string | TypeScriptDiagnosticMessageChain,
  indentation = 0,
): string => {
  if (typeof messageText === 'string') {
    return messageText
  }
  const prefix = indentation === 0 ? '' : `\n${'  '.repeat(indentation)}`
  let result = `${prefix}${messageText.messageText}`
  const children = messageText.next || []
  for (const child of children) {
    result += flattenDiagnosticMessageText(child, indentation + 1)
  }
  return result
}

const convertRelatedInformation = (diagnostic: TypeScriptDiagnostic): ConvertedRelatedInformation | undefined => {
  if (!hasLocation(diagnostic) || typeof diagnostic.file.text !== 'string') {
    return undefined
  }
  const start = getPositionAt(diagnostic.file.text, diagnostic.start)
  const end = getPositionAt(diagnostic.file.text, diagnostic.start + diagnostic.length)
  return {
    columnIndex: start.columnIndex,
    endColumnIndex: end.columnIndex,
    endRowIndex: end.rowIndex,
    message: flattenDiagnosticMessageText(diagnostic.messageText),
    rowIndex: start.rowIndex,
    uri: diagnostic.file.fileName,
  }
}

/**
 *
 */
const convertTsDiagnostic = (text: string, diagnostic: TypeScriptDiagnosticWithLocation): ConvertedDiagnostic => {
  // TODO in api, use only start offset and end offset. problems view can convert locations if needed
  const start = getPositionAt(text, diagnostic.start)
  const end = getPositionAt(text, diagnostic.start + diagnostic.length)
  const converted: ConvertedDiagnostic = {
    code: diagnostic.code,
    columnIndex: start.columnIndex,
    endColumnIndex: end.columnIndex,
    endRowIndex: end.rowIndex,
    message: flattenDiagnosticMessageText(diagnostic.messageText),
    rowIndex: start.rowIndex,
    source: 'ts',
    type: GetDiagnosticSeverity.getDiagnosticSeverity(diagnostic),
    uri: diagnostic.file.fileName,
  }
  const relatedInformation = diagnostic.relatedInformation?.flatMap((item) => {
    const convertedItem = convertRelatedInformation(item)
    return convertedItem ? [convertedItem] : []
  })
  return relatedInformation && relatedInformation.length > 0 ? { ...converted, relatedInformation } : converted
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
