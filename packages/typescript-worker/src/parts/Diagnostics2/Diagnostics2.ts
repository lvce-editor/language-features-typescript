import type { Diagnostic } from '../Diagnostic/Diagnostic.ts'
import { getDiagnosticsFromTsResult2 } from '../GetDiagnosticFromTsResult2/GetDiagnosticFromTsResult2.ts'
import { getOrCreateLanguageService } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'

export const getDiagnostics2 = async (textDocument: any): Promise<readonly Diagnostic[]> => {
  const { fs, languageService } = getOrCreateLanguageService(textDocument.uri)
  fs.writeFile(textDocument.uri, textDocument.text)
  const tsResult = languageService.getSemanticDiagnostics(textDocument.uri)
  const diagnostics = getDiagnosticsFromTsResult2(textDocument.text, tsResult)
  return diagnostics
}
