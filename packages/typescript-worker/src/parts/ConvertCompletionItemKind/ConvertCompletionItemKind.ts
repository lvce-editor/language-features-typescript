import * as TsCompletionItemKind from '../TsCompletionItemKind/TsCompletionItemKind.ts'
import * as CompletionItemKind from '../CompletionKind/CompletionKind.ts'
import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'

export const convertCompletionItemKind = (tsKind: TypeScriptProtocol.ScriptElementKind): number => {
  switch (tsKind) {
    case TsCompletionItemKind.Function:
    case TsCompletionItemKind.Method:
    case TsCompletionItemKind.LocalFunction:
      return CompletionItemKind.Function
    case TsCompletionItemKind.Var:
    case TsCompletionItemKind.Const:
    case TsCompletionItemKind.Let:
    case TsCompletionItemKind.LocalVariable:
    case TsCompletionItemKind.Alias:
    case TsCompletionItemKind.Parameter:
      return CompletionItemKind.Variable
    case TsCompletionItemKind.PrimitiveType:
    case TsCompletionItemKind.Keyword:
      return CompletionItemKind.Keyword
    case TsCompletionItemKind.Directory:
      return CompletionItemKind.Folder
    case TsCompletionItemKind.Script:
      return CompletionItemKind.File
    case TsCompletionItemKind.Property:
    case TsCompletionItemKind.MemberVariable:
    case TsCompletionItemKind.MemberGetAccessor:
    case TsCompletionItemKind.MemberSetAccessor:
      return CompletionItemKind.Field
    default:
      return CompletionItemKind.Unknown
  }
}
