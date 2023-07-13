export const getUserPreferences = () => {
  return {
    includeCompletionsForModuleExports: true,
    includeCompletionsForImportStatements: true,
    includeCompletionsWithSnippetText: true,
    includeAutomaticOptionalChainCompletions: true,
    includeCompletionsWithObjectLiteralMethodSnippets: true,
    includeCompletionsWithClassMemberSnippets: true,
    importModuleSpecifierEnding: 'js',
    includePackageJsonAutoImports: 'on',
    // @ts-ignore
    autoImportFileExcludePatterns: [],
  }
}
