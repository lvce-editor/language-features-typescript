export const getUserPreferences = (): any => {
  return {
    // @ts-ignore
    autoImportFileExcludePatterns: [],
    importModuleSpecifierEnding: 'js',
    includeAutomaticOptionalChainCompletions: true,
    includeCompletionsForImportStatements: true,
    includeCompletionsForModuleExports: true,
    includeCompletionsWithClassMemberSnippets: true,
    includeCompletionsWithObjectLiteralMethodSnippets: true,
    includeCompletionsWithSnippetText: true,
    includePackageJsonAutoImports: 'on',
  }
}
