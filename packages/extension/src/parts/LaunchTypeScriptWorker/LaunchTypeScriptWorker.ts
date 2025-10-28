import * as LaunchWorker from '../LaunchWorker/LaunchWorker.ts'
import * as TypeScriptWorkerUrl from '../TypeScriptWorkerUrl/TypeScriptWorkerUrl.ts'

export const launchTypeScriptWorker = async (): Promise<any> => {
  const worker = await LaunchWorker.launchWorker({
    url: TypeScriptWorkerUrl.typeScriptWorkerUrl,
    name: 'TypeScript Worker',
    contentSecurityPolicy: "default-src 'none'; script-src 'self'",
  })
  const typeScriptPath = ''
  const crossOriginIsolated = globalThis.crossOriginIsolated
  await worker.invoke('Initialize.initialize', typeScriptPath, crossOriginIsolated)
  return worker
}
