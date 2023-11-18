import * as Debug from '../Debug/Debug.js'
import * as Diagnostic from '../Diagnostic/Diagnostic.js'

export const languageId = 'typescript'

/**
 *
 * @param {vscode.TextDocument} textDocument
 * @param {*} diagnostic
 * @returns {vscode.Diagnostic}
 */
const convertTsDiagnostic = (textDocument, diagnostic) => {
  const startPosition = {
    rowIndex: diagnostic.start.line - 1,
    columnIndex: diagnostic.start.offset - 1,
  }
  const endPosition = {
    rowIndex: diagnostic.end.line - 1,
    columnIndex: diagnostic.end.offset - 1,
  }
  const startOffset = vscode.getOffset(textDocument, startPosition)
  const endOffset = vscode.getOffset(textDocument, endPosition)
  return {
    rowIndex: diagnostic.start.line - 1,
    columnIndex: diagnostic.start.offset - 1, // TODO should be offset based here
    // endOffset,
    message: diagnostic.text,
    type: 'error',
  }
  // console.log({ diagnostic })
}

const getDiagnosticsFromTsResult = (textDocument, tsResult) => {
  // console.log(tsResult)
  const diagnostics = []
  for (const tsDiagnostic of tsResult) {
    diagnostics.push(convertTsDiagnostic(textDocument, tsDiagnostic))
  }
  return diagnostics
}

/**
 * @type{vscode.DiagnosticProvider['provideDiagnostics']}
 */
export const provideDiagnostics = async (textDocument) => {
  Debug.debug(`getting diagnostics for ${textDocument.uri}`)
  const tsResult = await Diagnostic.getDiagnostics(textDocument)
  return getDiagnosticsFromTsResult(textDocument, tsResult)
}
