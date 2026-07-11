import { createRpc } from '@lvce-editor/api'
import * as Command from '../Command/Command.ts'

export const launchWorker = async ({ name, url }: { name: string; url: string }): Promise<any> => {
  const rpc = await createRpc({
    commandMap: Command.commandMap,
    name,
    url,
  })
  return rpc
}
