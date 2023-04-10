const registerProvider = (provider) => {
  if ('provideCompletions' in provider) {
    vscode.registerCompletionProvider(provider)
    return
  }
  if ('provideDefinition' in provider) {
    vscode.registerDefinitionProvider(provider)
    return
  }
}

export const registerProviders = (providers) => {
  for (const provider of providers) {
    registerProvider(provider)
  }
}
