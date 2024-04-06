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

export const isStyleCheckDiagnostic = (code) => {
  return styleCheckDiagnostics.has(code)
}
