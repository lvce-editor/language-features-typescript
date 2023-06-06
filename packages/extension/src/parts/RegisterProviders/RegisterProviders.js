const registerProvider = (provider) => {
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
  }
  if ('provideTabCompletion' in provider && vscode.registerTabCompletionProvider) {
    vscode.registerTabCompletionProvider(provider)
  }
}

export const registerProviders = (providers) => {
  for (const provider of providers) {
    registerProvider(provider)
  }
}
