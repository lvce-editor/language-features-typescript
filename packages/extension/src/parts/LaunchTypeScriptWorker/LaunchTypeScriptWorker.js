import * as LaunchWorker from '../LaunchWorker/LaunchWorker.ts'
import * as TypeScriptWorkerUrl from '../TypeScriptWorkerUrl/TypeScriptWorkerUrl.ts'

export const launchPrettierWorker = () => {
  return LaunchWorker.launchWorker({
    url: TypeScriptWorkerUrl.typeScriptWorkerUrl,
    name: 'Prettier Worker',
    contentSecurityPolicy: "default-src 'none'; script-src 'self'",
  })
}
