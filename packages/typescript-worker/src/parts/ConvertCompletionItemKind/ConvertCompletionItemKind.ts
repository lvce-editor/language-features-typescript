import * as CompletionItemKind from '../CompletionKind/CompletionKind.ts'
import * as TsCompletionItemKind from '../TsCompletionItemKind/TsCompletionItemKind.ts'

export const convertCompletionItemKind = (tsKind: string): number => {
  switch (tsKind) {
    case TsCompletionItemKind.Alias:
    case TsCompletionItemKind.Const:
    case TsCompletionItemKind.Let:
    case TsCompletionItemKind.LocalVariable:
    case TsCompletionItemKind.Parameter:
    case TsCompletionItemKind.Var:
      return CompletionItemKind.Variable
    case TsCompletionItemKind.Directory:
      return CompletionItemKind.Folder
    case TsCompletionItemKind.Function:
    case TsCompletionItemKind.LocalFunction:
    case TsCompletionItemKind.Method:
      return CompletionItemKind.Function
    case TsCompletionItemKind.Keyword:
    case TsCompletionItemKind.PrimitiveType:
      return CompletionItemKind.Keyword
    case TsCompletionItemKind.MemberGetAccessor:
    case TsCompletionItemKind.MemberSetAccessor:
    case TsCompletionItemKind.MemberVariable:
    case TsCompletionItemKind.Property:
      return CompletionItemKind.Field
    case TsCompletionItemKind.Script:
      return CompletionItemKind.File
    default:
      return CompletionItemKind.Unknown
  }
}
