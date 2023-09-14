import * as GetTypeScriptPath from '../GetTypeScriptPath/GetTypeScriptPath.js'
import * as LoadTypeScript from '../LoadTypeScript/LoadTypeScript.js'

export const initialize = async () => {
  const typescriptPath = GetTypeScriptPath.getTypeScriptPath()
  const typescript = await LoadTypeScript.loadTypeScript(typescriptPath)
  console.log({ typescript })
  // TODO
  console.log('initialize')
}
