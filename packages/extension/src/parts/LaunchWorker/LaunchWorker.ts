import * as Command from '../Command/Command.ts'

export const launchWorker = async ({ url, name, contentSecurityPolicy }: { url: string; name: string; contentSecurityPolicy: string }): Promise<any> => {
  // @ts-expect-error
  const rpc = await vscode.createRpc({
    type: 'worker',
    url: url,
    name,
    contentSecurityPolicy,
    commandMap: Command.commandMap,
  })
  return rpc
}
