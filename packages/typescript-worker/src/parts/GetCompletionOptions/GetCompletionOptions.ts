import type { GetCompletionsAtPositionOptions } from 'typescript'

export const getCompletionOptions = (): GetCompletionsAtPositionOptions => {
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
  }
}
