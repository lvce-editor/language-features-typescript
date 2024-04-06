import * as GetTsServerPath from '../GetTsServerPath/GetTsServerPath.js'
import * as LaunchWorker from '../LaunchWorker/LaunchWorker.js'
import * as TypeScriptWorkerUrl from '../TypeScriptWorkerUrl/TypeScriptWorkerUrl.js'

export const launchTypeScriptWorker = async () => {
  const worker = await LaunchWorker.launchWorker({
    url: TypeScriptWorkerUrl.typeScriptWorkerUrl,
    name: 'Prettier Worker',
    contentSecurityPolicy: "default-src 'none'; script-src 'self'",
  })
  const typeScriptPath = await GetTsServerPath.getTsServerPath()
  await worker.invoke('Initialize.initialize', typeScriptPath)
  return worker
}
