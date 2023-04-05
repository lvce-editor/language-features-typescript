import * as JsonRpc from './parts/JsonRpc/JsonRpc.js'
import * as Callback from './parts/Callback/Callback.js'

const getTsPath = (path) => {
  return `${path}/../node/src/typeScriptClient.js`
}

const handleMessage = (message) => {
  console.log({ message })
  Callback.resolve(message.id, message)
}

export const activate = async ({ path }) => {
  const tsPath = getTsPath(path)
  const rpc = await vscode.createNodeRpc({
    path: tsPath,
  })
  console.log({ rpc })
  vscode.registerCompletionProvider({
    languageId: 'typescript',
    async provideCompletions() {
      const items = await rpc.invoke('Completion.getCompletion')
      return items
    },
  })
}
