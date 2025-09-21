// based on github.com/microsoft/vscode/tree/main/extensions/typescript-language-features/src/languageFeatures/util/snippetForFunctionCall.ts (License MIT)

import * as TsDisplayPartKind from '../TsDisplayPartKind/TsDisplayPartKind.ts'
import * as Character from '../Character/Character.ts'

/**
 *
 * @param {import('typescript').SymbolDisplayPart[]} displayParts
 * @returns
 */
export const getParameterListParts = (displayParts) => {
  const parts = []
  let isInMethod = false
  let hasOptionalParameters = false
  let parenCount = 0
  let braceCount = 0

  outer: for (let i = 0; i < displayParts.length; ++i) {
    const part = displayParts[i]
    switch (part.kind) {
      case TsDisplayPartKind.MethodName:
      case TsDisplayPartKind.FunctionName:
      case TsDisplayPartKind.Text:
      case TsDisplayPartKind.PropertyName:
        if (parenCount === 0 && braceCount === 0) {
          isInMethod = true
        }
        break

      case TsDisplayPartKind.ParameterName:
        if (parenCount === 1 && braceCount === 0 && isInMethod) {
          // Only take top level paren names
          const next = displayParts[i + 1]
          // Skip optional parameters
          const nameIsFollowedByOptionalIndicator = next && next.text === Character.QuestionMark
          // Skip this parameter
          const nameIsThis = part.text === Character.This
          if (!nameIsFollowedByOptionalIndicator && !nameIsThis) {
            parts.push(part)
          }
          hasOptionalParameters = hasOptionalParameters || nameIsFollowedByOptionalIndicator
        }
        break

      case TsDisplayPartKind.Punctuation:
        if (part.text === Character.RoundOpen) {
          ++parenCount
        } else if (part.text === Character.RoundClose) {
          --parenCount
          if (parenCount <= 0 && isInMethod) {
            break outer
          }
        } else if (part.text === Character.Ellipsis && parenCount === 1) {
          // Found rest parmeter. Do not fill in any further arguments
          hasOptionalParameters = true
          break outer
        } else if (part.text === Character.CurlyOpen) {
          ++braceCount
        } else if (part.text === Character.CurlyClose) {
          --braceCount
        }
        break
    }
  }

  return parts
}
