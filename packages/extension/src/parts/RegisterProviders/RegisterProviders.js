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
  if ('provideTypeDefinition') {
    vscode.registerTypeDefinitionProvider(provider)
    return
  }
}

export const registerProviders = (providers) => {
  for (const provider of providers) {
    registerProvider(provider)
  }
}
