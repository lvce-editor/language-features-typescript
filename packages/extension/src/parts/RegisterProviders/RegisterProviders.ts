import {
  registerBraceCompletionProvider,
  registerClosingTagProvider,
  registerCodeActionsProvider,
  registerCommentProvider,
  registerCompletionProvider,
  registerDefinitionProvider,
  registerDiagnosticProvider,
  registerDocumentSymbolProvider,
  registerHoverProvider,
  registerImplementationProvider,
  registerReferenceProvider,
  registerRenameProvider,
  registerSelectionProvider,
  registerSignatureHelpProvider,
  registerTabCompletionProvider,
  registerTypeDefinitionProvider,
} from '@lvce-editor/api'
import * as LanguageId from '../LanguageId/LanguageId.ts'

const registerSecondaryProvider = (provider: any): { dispose(): void } => {
  if ('provideDocumentSymbols' in provider) {
    return registerDocumentSymbolProvider(provider)
  }
  if ('provideReferences' in provider) {
    return registerReferenceProvider(provider)
  }
  if ('provideImplementations' in provider) {
    return registerImplementationProvider(provider)
  }
  if ('provideTypeDefinition' in provider) {
    return registerTypeDefinitionProvider(provider)
  }
  if ('provideHover' in provider) {
    return registerHoverProvider(provider)
  }
  if ('provideSignatureHelp' in provider) {
    return registerSignatureHelpProvider(provider)
  }
  if ('provideTabCompletion' in provider) {
    return registerTabCompletionProvider(provider)
  }
  if ('provideDiagnostics' in provider) {
    return registerDiagnosticProvider(provider)
  }
  if ('provideCodeActions' in provider) {
    return registerCodeActionsProvider(provider)
  }
  if ('provideSelections' in provider) {
    return registerSelectionProvider(provider)
  }
  if ('provideRename' in provider) {
    return registerRenameProvider(provider)
  }
  if ('provideComment' in provider) {
    return registerCommentProvider(provider)
  }
  throw new Error('Unknown TypeScript provider')
}

const registerProvider = (provider: any): { dispose(): void } => {
  if ('provideBraceCompletion' in provider) {
    return registerBraceCompletionProvider(provider)
  }
  if ('provideClosingTag' in provider) {
    return registerClosingTagProvider(provider)
  }
  if ('provideCompletions' in provider) {
    return registerCompletionProvider(provider)
  }
  if ('provideDefinition' in provider) {
    return registerDefinitionProvider(provider)
  }
  return registerSecondaryProvider(provider)
}

export const registerProviders = (providers: any[], beforeProvide: () => Promise<void>): { dispose(): void }[] => {
  const registrations: { dispose(): void }[] = []
  for (const languageId of [LanguageId.JavaScript, LanguageId.TypeScript, LanguageId.TypeScriptReact]) {
    for (const provider of providers) {
      const actualProvider = {
        ...Object.fromEntries(
          Object.entries(provider).map(([key, value]) => [
            key,
            typeof value === 'function'
              ? async (...args: any[]) => {
                  await beforeProvide()
                  return value(...args)
                }
              : value,
          ]),
        ),
        id: `typescript.${Object.keys(provider).find((key) => key.startsWith('provide') || key === 'prepareRename')}.${languageId}`,
        languageId,
      }
      registrations.push(registerProvider(actualProvider))
    }
  }
  return registrations
}
