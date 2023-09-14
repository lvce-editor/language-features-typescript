import * as GetConfigureOptions from '../GetConfigureOptions/GetConfigureOptions.js'
import * as GetTsServerArgv from '../GetTsServerArgv/GetTsServerArgv.js'
import * as GetTsServerPath from '../GetTsServerPath/GetTsServerPath.js'
import * as Providers from '../Providers/Providers.js'
import * as RegisterProviders from '../RegisterProviders/RegisterProviders.js'
import * as Rpc from '../Rpc/Rpc.js'

export const activate = async ({ path }) => {
  await Rpc.listen({ path })
  const tsServerPath = await GetTsServerPath.getTsServerPath()
  const options = {}
  const { argv, execArgv } = GetTsServerArgv.getTsServerArgv(options)
  await Rpc.invoke('Initialize.initialize', {
    tsServerPath,
    argv,
    execArgv,
  })
  await Rpc.invoke('Configure.configure', GetConfigureOptions.getConfigureOptions())
  RegisterProviders.registerProviders(Object.values(Providers))
}
