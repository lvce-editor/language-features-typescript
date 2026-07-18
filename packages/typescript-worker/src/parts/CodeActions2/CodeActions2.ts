import type { CodeFixAction } from '../GetCodeActionsFromTsResult/GetCodeActionsFromTsResult.ts'
import { getCodeActionsFromTsResult } from '../GetCodeActionsFromTsResult/GetCodeActionsFromTsResult.ts'
import { getOrCreateLanguageService } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'
import { isDiagnosticAtOffset } from '../IsDiagnosticAtOffset/IsDiagnosticAtOffset.ts'

export const getCodeActions2 = async (textDocument: any, offset: number): Promise<readonly any[]> => {
  const { uri } = textDocument
  const { fs, languageService } = getOrCreateLanguageService(uri)
  fs.writeFile(uri, textDocument.text)
  const diagnostics = languageService.getSemanticDiagnostics(uri)
  const fixes: CodeFixAction[] = []
  for (const diagnostic of diagnostics) {
    if (!isDiagnosticAtOffset(diagnostic, offset)) {
      continue
    }
    const start = diagnostic.start as number
    const end = start + (diagnostic.length as number)
    fixes.push(...languageService.getCodeFixesAtPosition(uri, start, end, [diagnostic.code], {}, {}))
  }
  return getCodeActionsFromTsResult(uri, fixes)
}
