import * as CompletionProvider from './parts/ExtensionHost/ExtensionHostCompletionProviderTypeScript.js'
import * as Rpc from './parts/Rpc/Rpc.js'

export const activate = async ({ path }) => {
  await Rpc.listen({ path })
  vscode.registerCompletionProvider(CompletionProvider)
}
