import * as LaunchWorker from '../LaunchWorker/LaunchWorker.js'
import * as TypeScriptWorkerUrl from '../TypeScriptWorkerUrl/TypeScriptWorkerUrl.js'

export const launchTypeScriptWorker = () => {
  return LaunchWorker.launchWorker({
    url: TypeScriptWorkerUrl.typeScriptWorkerUrl,
    name: 'Prettier Worker',
    contentSecurityPolicy: "default-src 'none'; script-src 'self'",
  })
}
