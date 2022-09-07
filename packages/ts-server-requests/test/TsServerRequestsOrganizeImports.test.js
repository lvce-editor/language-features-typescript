import { jest } from '@jest/globals'

jest.unstable_mockModule('../src/parts/Id/Id.js', () => {
  return {
    create() {
      return 1
    },
  }
})

const TsServerRequests = await import(
  '../src/parts/TsServerRequestsOrganizeImports/TsServerRequestsOrganizeImports.js'
)

test('organizeImports', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: [
          {
            fileName: '/test/index.ts',
            textChanges: [
              {
                end: { line: 2, offset: 1 },
                newText:
                  process.platform === 'win32'
                    ? "import { add } from './calculate.ts'\r\n"
                    : "import { add } from './calculate.ts'\n",
                start: { line: 1, offset: 1 },
              },
            ],
          },
        ],
      }
    }),
  }
  expect(
    await TsServerRequests.organizeImports(server, {
      scope: {
        type: 'file',
        args: {
          file: '/test/index.ts',
        },
      },
    })
  ).toEqual([
    {
      fileName: '/test/index.ts',
      textChanges: [
        {
          end: { line: 2, offset: 1 },
          newText:
            process.platform === 'win32'
              ? "import { add } from './calculate.ts'\r\n"
              : "import { add } from './calculate.ts'\n",
          start: { line: 1, offset: 1 },
        },
      ],
    },
  ])
})

test('organizeImports - error - no project', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: false,
        message: `No Project.`,
      }
    }),
  }
  await expect(
    TsServerRequests.organizeImports(server, {
      scope: {
        type: 'file',
        args: {
          file: '/test/cat.ts',
        },
      },
    })
  ).rejects.toThrowError(
    new Error('TsServer.organizeImports failed to execute: No Project.')
  )
})
