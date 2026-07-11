import {
  registerBraceCompletionProvider,
  registerClosingTagProvider,
  registerCodeActionsProvider,
  registerCommentProvider,
  registerCompletionProvider,
  registerDefinitionProvider,
  registerDiagnosticProvider,
  registerHoverProvider,
  registerImplementationProvider,
  registerReferenceProvider,
  registerRenameProvider,
  registerSelectionProvider,
  registerTabCompletionProvider,
  registerTypeDefinitionProvider,
} from '@lvce-editor/api'
import * as LanguageId from '../LanguageId/LanguageId.ts'

const registerProvider = (provider: any): void => {
  if ('provideBraceCompletion' in provider) {
    registerBraceCompletionProvider(provider)
    return
  }
  if ('provideClosingTag' in provider) {
    registerClosingTagProvider(provider)
    return
  }
  if ('provideCompletions' in provider) {
    registerCompletionProvider(provider)
    return
  }
  if ('provideDefinition' in provider) {
    registerDefinitionProvider(provider)
    return
  }
  if ('provideReferences' in provider) {
    registerReferenceProvider(provider)
    return
  }
  if ('provideImplementations' in provider) {
    registerImplementationProvider(provider)
    return
  }
  if ('provideTypeDefinition' in provider) {
    registerTypeDefinitionProvider(provider)
    return
  }
  if ('provideHover' in provider) {
    registerHoverProvider(provider)
    return
  }
  if ('provideTabCompletion' in provider) {
    registerTabCompletionProvider(provider)
    return
  }
  if ('provideDiagnostics' in provider) {
    registerDiagnosticProvider(provider)
    return
  }
  if ('provideCodeActions' in provider) {
    registerCodeActionsProvider(provider)
    return
  }
  if ('provideSelections' in provider) {
    registerSelectionProvider(provider)
    return
  }
  if ('provideRename' in provider) {
    registerRenameProvider(provider)
    return
  }
  if ('provideComment' in provider) {
    registerCommentProvider(provider)
    return
  }
}

export const registerProviders = (providers: any[]): void => {
  for (const languageId of [LanguageId.JavaScript, LanguageId.TypeScript, LanguageId.TypeScriptReact]) {
    for (const provider of providers) {
      const actualProvider = {
        ...provider,
        id: `typescript.${Object.keys(provider).find((key) => key.startsWith('provide') || key === 'prepareRename')}.${languageId}`,
        languageId,
      }
      registerProvider(actualProvider)
    }
  }
}
