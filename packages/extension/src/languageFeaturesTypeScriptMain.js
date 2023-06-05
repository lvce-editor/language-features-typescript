import * as GetTsServerPath from './parts/GetTsServerPath/GetTsServerPath.js'
import * as Providers from './parts/Providers/Providers.js'
import * as RegisterProviders from './parts/RegisterProviders/RegisterProviders.js'
import * as Rpc from './parts/Rpc/Rpc.js'

const toJsProvider = (provider) => {
  return {
    ...provider,
    languageId: 'javascript',
  }
}

const getArgv = ({ disableAutomaticTypingAcquisition = true, npmLocation = '' }) => {
  const argv = []
  argv.push('--useInferredProjectPerProjectRoot')
  if (disableAutomaticTypingAcquisition) {
    argv.push('--disableAutomaticTypingAcquisition')
  }
  if (npmLocation) {
    argv.push('--npmLocation', `${npmLocation}`)
  }
  argv.push('--locale', 'en')
  argv.push('--noGetErrOnBackgroundUpdate')
  argv.push('--validateDefaultNpmLocation')
  argv.push('--suppressDiagnosticEvents')

  const execArgv = ['--max-old-space-size=200']
  return {
    argv,
    execArgv,
  }
}

export const activate = async ({ path }) => {
  await Rpc.listen({ path })
  const tsServerPath = await GetTsServerPath.getTsServerPath()
  const options = {}
  const { argv, execArgv } = getArgv(options)
  await Rpc.invoke('Initialize.initialize', {
    tsServerPath,
    argv,
    execArgv,
  })
  RegisterProviders.registerProviders(Object.values(Providers))
  RegisterProviders.registerProviders(Object.values(Providers).map(toJsProvider))
}
