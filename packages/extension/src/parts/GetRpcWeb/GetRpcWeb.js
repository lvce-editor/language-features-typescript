import * as GetTsClientPathWeb from '../GetTsClientPathWeb/GetTsClientPathWeb.js'

export const getRpc = async (path) => {
  const tsPath = GetTsClientPathWeb.getTsClientPathWeb()
  // const ts = await LoadTypeScript.loadTypeScript(tsPath)
  const rpc = await vscode.createRpc({
    url: tsPath,
    name: 'TypeScript Worker',
  })
  return rpc
}
