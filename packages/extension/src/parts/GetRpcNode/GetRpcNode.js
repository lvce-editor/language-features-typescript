import * as GetTsClientPath from '../GetTsClientPathNode/GetTsClientPathNode.js'

export const getRpc = async (path) => {
  const tsPath = GetTsClientPath.getTsClientPathNode(path)
  // @ts-ignore
  const rpc = await vscode.createNodeRpc({
    path: tsPath,
  })
  return rpc
}
