import * as Providers from '../Providers/Providers.ts'
import * as RegisterProviders from '../RegisterProviders/RegisterProviders.ts'
import * as Rpc from '../Rpc/Rpc.ts'

interface ActivateOptions {
  path: string
}

export const activate = async ({ path }: ActivateOptions): Promise<void> => {
  // await Rpc.listen({ path })
  // const tsServerPath = await GetTsServerPath.getTsServerPath()
  const options = {}
  // const { argv, execArgv } = GetTsServerArgv.getTsServerArgv(options)
  // await Rpc.invoke('Initialize.initialize', {
  //   tsServerPath,
  //   argv,
  //   execArgv,
  // })
  // await Rpc.invoke('Configure.configure', GetConfigureOptions.getConfigureOptions())
  RegisterProviders.registerProviders(Object.values(Providers))
}
