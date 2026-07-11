import * as LaunchWorker from '../LaunchWorker/LaunchWorker.ts'
import * as TypeScriptWorkerUrl from '../TypeScriptWorkerUrl/TypeScriptWorkerUrl.ts'

export const launchTypeScriptWorker = async (): Promise<any> => {
  const worker = await LaunchWorker.launchWorker({
    name: 'TypeScript Worker',
    url: TypeScriptWorkerUrl.typeScriptWorkerUrl,
  })
  const typeScriptPath = ''
  const { crossOriginIsolated } = globalThis
  await worker.invoke('Initialize.initialize', typeScriptPath, crossOriginIsolated)
  return worker
}
