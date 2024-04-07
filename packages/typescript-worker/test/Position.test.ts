import { beforeEach, expect, jest, test } from '@jest/globals'

beforeEach(() => {
  jest.resetAllMocks()
})

jest.unstable_mockModule('../src/parts/Rpc/Rpc.ts', () => {
  return {
    invoke: jest.fn(),
  }
})

const Position = await import('../src/parts/Position/Position.ts')
const Rpc = await import('../src/parts/Rpc/Rpc.ts')

test('getPosition', async () => {
  jest.spyOn(Rpc, 'invoke').mockResolvedValue({ rowIndex: 0, columnIndex: 0 })
  const textDocument = {
    uri: '',
  }
  const offset = 0
  expect(await Position.getTsPosition(textDocument, offset)).toEqual({
    line: 1,
    offset: 1,
  })
})

test('getOffset', async () => {
  jest.spyOn(Rpc, 'invoke').mockResolvedValue(0)
  const textDocument = {
    uri: '',
  }
  const tsPosition = {
    line: 1,
    offset: 1,
  }
  expect(await Position.getOffset(textDocument, tsPosition)).toBe(0)
})

test('getRowIndex', async () => {
  const tsPosition = {
    line: 1,
    offset: 1,
  }
  expect(Position.getRowIndex(tsPosition)).toBe(0)
})
