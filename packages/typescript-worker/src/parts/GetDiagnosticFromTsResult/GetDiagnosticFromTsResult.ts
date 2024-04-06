import * as TypeScriptErrorCodes from '../TypeScriptErrorCodes/TypeScriptErrorCodes.ts'

// Style check diagnostics that can be reported as warnings
const styleCheckDiagnostics = new Set([
  ...TypeScriptErrorCodes.variableDeclaredButNeverUsed,
  ...TypeScriptErrorCodes.propertyDeclaretedButNeverUsed,
  ...TypeScriptErrorCodes.allImportsAreUnused,
  ...TypeScriptErrorCodes.unreachableCode,
  ...TypeScriptErrorCodes.unusedLabel,
  ...TypeScriptErrorCodes.fallThroughCaseInSwitch,
  ...TypeScriptErrorCodes.notAllCodePathsReturnAValue,
])

const isStyleCheckDiagnostic = (code) => {
  return styleCheckDiagnostics.has(code)
}

const getSeverity = (diagnostic) => {
  if (isStyleCheckDiagnostic(diagnostic.code) && diagnostic.category === 'error') {
    return 'warning'
  }
  return 'error'
}
/**
 *
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
  // const startOffset = vscode.getOffset(textDocument, startPosition)
  // const endOffset = vscode.getOffset(textDocument, endPosition)

  return {
    rowIndex: diagnostic.start.line - 1,
    columnIndex: diagnostic.start.offset - 1, // TODO should be offset based here
    endRowIndex: diagnostic.end.line - 1,
    endColumnIndex: diagnostic.end.offset - 1,
    // endOffset,
    message: diagnostic.text,
    type: getSeverity(diagnostic),
    uri: textDocument.uri,
    source: 'ts',
    code: diagnostic.code,
  }
}

export const getDiagnosticsFromTsResult = (textDocument, tsResult) => {
  const diagnostics = []
  for (const tsDiagnostic of tsResult) {
    diagnostics.push(convertTsDiagnostic(textDocument, tsDiagnostic))
  }
  return diagnostics
}
