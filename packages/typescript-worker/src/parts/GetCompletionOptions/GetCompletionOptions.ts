import type { GetCompletionsAtPositionOptions } from 'typescript'

export const getCompletionOptions = (): GetCompletionsAtPositionOptions => {
  return {
    allowIncompleteCompletions: true,
    allowRenameOfImportPath: true,
    allowTextChangesInNewFiles: true,
    autoImportFileExcludePatterns: [],
    autoImportSpecifierExcludeRegexes: [],
    importModuleSpecifierEnding: 'js',
    includeAutomaticOptionalChainCompletions: true,
    includeCompletionsForImportStatements: true,
    includeCompletionsForModuleExports: true,
    includeCompletionsWithInsertText: true,
    includeCompletionsWithObjectLiteralMethodSnippets: true,
    includeCompletionsWithSnippetText: true,
    includePackageJsonAutoImports: 'on',
  }
}
