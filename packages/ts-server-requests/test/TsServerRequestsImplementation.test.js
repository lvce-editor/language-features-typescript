import { jest } from '@jest/globals'

jest.unstable_mockModule('../src/parts/Id/Id.js', () => {
  return {
    create() {
      return 1
    },
  }
})

const TsServerRequests = await import(
  '../src/parts/TsServerRequestsImplementation/TsServerRequestsImplementation.js'
)

test('implementation', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: [
          {
            contextEnd: { line: 1, offset: 28 },
            contextStart: { line: 1, offset: 1 },
            end: { line: 1, offset: 10 },
            file: '/test/index.ts',
            start: { line: 1, offset: 7 },
          },
        ],
      }
    }),
  }
  expect(
    // @ts-ignore
    await TsServerRequests.implementation(server, {
      file: '/test/index.ts',
      line: 2,
      offset: 14,
    })
  ).toEqual([
    {
      contextEnd: { line: 1, offset: 28 },
      contextStart: { line: 1, offset: 1 },
      end: { line: 1, offset: 10 },
      file: '/test/index.ts',
      start: { line: 1, offset: 7 },
    },
  ])
})

test('implementation - error - no project', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: false,
        message: `No Project.`,
      }
    }),
  }
  await expect(
    // @ts-ignore
    TsServerRequests.implementation(server, {
      file: '/test/cat.ts',
      line: 2,
      offset: 14,
    })
  ).rejects.toThrowError(
    new Error('TsServer.implementation failed to execute: No Project.')
  )
})
