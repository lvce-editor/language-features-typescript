import { expect, jest, test } from '@jest/globals'
import { beforeEach } from '@jest/globals'

beforeEach(() => {
  jest.resetAllMocks()
})

jest.unstable_mockModule('../src/parts/Rpc/Rpc.ts', () => {
  return {
    invoke: jest.fn(),
  }
})

const Rpc = await import('../src/parts/Rpc/Rpc.ts')
const TypeScriptRpc = await import('../src/parts/TypeScriptRpc/TypeScriptRpc.ts')

test('listen', async () => {
  const path = ''
  await TypeScriptRpc.listen(path)
  expect(Rpc.invoke).toHaveBeenCalledTimes(1)
  expect(Rpc.invoke).toHaveBeenCalledWith('TypeScriptRpc.listen', '')
})

test('invoke', async () => {
  await TypeScriptRpc.invoke('Completion.getCompletion')
  expect(Rpc.invoke).toHaveBeenCalledTimes(1)
  expect(Rpc.invoke).toHaveBeenCalledWith('TypeScriptRpc.invoke', 'Completion.getCompletion')
})
