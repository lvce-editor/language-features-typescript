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
  const ipc = await vscode.createNodeIpc({
    path: tsPath,
  })
  ipc.onmessage = handleMessage
  console.log({ ipc })
  vscode.registerCompletionProvider({
    languageId: 'typescript',
    async provideCompletions() {
      const items = await JsonRpc.invoke(ipc, 'Completion.getCompletion')
      return items
    },
  })
}
