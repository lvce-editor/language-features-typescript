// @ts-nocheck
import * as LanguageId from '../LanguageId/LanguageId.ts'

const registerProvider = (provider: any): void => {
  if ('provideCompletions' in provider) {
    vscode.registerCompletionProvider(provider)
    return
  }
  if ('provideDefinition' in provider) {
    vscode.registerDefinitionProvider(provider)
    return
  }
  if ('provideReferences' in provider) {
    vscode.registerReferenceProvider(provider)
    return
  }
  if ('provideImplementations' in provider) {
    vscode.registerImplementationProvider(provider)
    return
  }
  if ('provideTypeDefinition' in provider) {
    vscode.registerTypeDefinitionProvider(provider)
    return
  }
  if ('provideHover' in provider && vscode.registerHoverProvider) {
    vscode.registerHoverProvider(provider)
    return
  }
  if ('provideTabCompletion' in provider && vscode.registerTabCompletionProvider) {
    vscode.registerTabCompletionProvider(provider)
    return
  }
  if ('provideDiagnostics' in provider && vscode.registerDiagnosticProvider) {
    vscode.registerDiagnosticProvider(provider)
    return
  }
  if ('provideCodeActions' in provider && vscode.registerCodeActionsProvider) {
    vscode.registerCodeActionsProvider(provider)
    return
  }
  if ('provideSelections' in provider && vscode.registerSelectionProvider) {
    vscode.registerSelectionProvider(provider)
    return
  }
  if ('provideRename' in provider && vscode.registerRenameProvider) {
    vscode.registerRenameProvider(provider)
    return
  }
}

export const registerProviders = (providers: any[]): void => {
  for (const languageId of [LanguageId.JavaScript, LanguageId.TypeScript]) {
    for (const provider of providers) {
      const actualProvider = {
        ...provider,
        languageId,
      }
      registerProvider(actualProvider)
    }
  }
}
