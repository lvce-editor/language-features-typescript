import type { GetCompletionsAtPositionOptions } from 'typescript'
import * as Assert from '../Assert/Assert.ts'
import { getCompletionFromTsResult2 } from '../GetCompletionFromTsResult2/GetCompletionFromTsResult2.ts'
import { getOrCreateLanguageService } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'

const getCompletionOptions = (): GetCompletionsAtPositionOptions => {
  return {
    allowIncompleteCompletions: true,
    allowRenameOfImportPath: true,
    allowTextChangesInNewFiles: true,
    autoImportFileExcludePatterns: [],
    autoImportSpecifierExcludeRegexes: [],
    importModuleSpecifierEnding: 'js',
    includeCompletionsForImportStatements: true,
    includePackageJsonAutoImports: 'on',
    includeCompletionsWithInsertText: true,
    includeCompletionsWithSnippetText: true,
    includeCompletionsForModuleExports: true,
    includeAutomaticOptionalChainCompletions: true,
    includeCompletionsWithObjectLiteralMethodSnippets: true,
    // importModuleSpecifierPreference: 'relative',
    // lazyConfiguredProjectsFromExternalProject: true,
  }
}

export const getCompletion2 = async (textDocument: any, offset: number) => {
  const uri = textDocument.uri
  Assert.string(uri)
  const { languageService, fs } = getOrCreateLanguageService(uri)
  fs.writeFile(textDocument.uri, textDocument.text)
  const completionOptions = getCompletionOptions()
  const tsResult = languageService.getCompletionsAtPosition(textDocument.uri, offset, completionOptions)
  const completions = getCompletionFromTsResult2(tsResult)
  return completions
}
