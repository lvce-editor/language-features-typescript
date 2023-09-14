import * as GetTsClientPath from '../GetTsClientPathNode/GetTsClientPathNode.js'
import * as GetTsClientPathWeb from '../GetTsClientPathWeb/GetTsClientPathWeb.js'
import * as IsWeb from '../IsWeb/IsWeb.js'

const listenWeb = async (path) => {
  const tsPath = GetTsClientPathWeb.getTsClientPathWeb()
  // const ts = await LoadTypeScript.loadTypeScript(tsPath)
  const rpc = await vscode.createRpc({
    url: tsPath,
    name: 'TypeScript Worker',
  })
  return rpc
}

const listenNode = async (path) => {
  const tsPath = GetTsClientPath.getTsClientPathNode(path)
  const rpc = await vscode.createNodeRpc({
    path: tsPath,
  })
  return rpc
}

export const getRpc = (path) => {
  if (IsWeb.isWeb) {
    return listenWeb(path)
  }
  return listenNode(path)
}
