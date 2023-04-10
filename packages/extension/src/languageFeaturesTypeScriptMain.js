import * as CompletionProvider from './parts/ExtensionHost/ExtensionHostCompletionProviderTypeScript.js'
import * as Rpc from './parts/Rpc/Rpc.js'

export const activate = async ({ path }) => {
  await Rpc.listen({ path })
  const tsServerPath = await Rpc.invoke('GetTsServerPath.getTsServerPath')
  await Rpc.invoke('Initialize.initialize', {
    tsServerPath,
  })
  // vscode.onDidOpenTextDocument(TextDocumentSync.openTextDocuments)
  vscode.registerCompletionProvider(CompletionProvider)
}
