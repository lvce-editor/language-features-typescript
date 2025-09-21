// @ts-nocheck
// import * as Rename from '../src/parts/Rename/Rename.ts'

test.skip('getPrepareRenameFromTsResult - can rename', () => {
  expect(
    Rename.getPrepareRenameFromTsResult({
      info: {
        canRename: true,
        displayName: 'add',
        fullDisplayName: 'add',
        // @ts-ignore
        kind: 'const',
        kindModifiers: '',
        triggerSpan: {
          end: {
            line: 2,
            offset: 4,
          },
          start: {
            line: 2,
            offset: 1,
          },
        },
      },
      locs: [
        {
          file: '/tmp/index.ts',
          locs: [
            {
              contextEnd: {
                line: 1,
                offset: 27,
              },
              contextStart: {
                line: 1,
                offset: 1,
              },
              end: {
                line: 1,
                offset: 10,
              },
              start: {
                line: 1,
                offset: 7,
              },
            },
            {
              end: {
                line: 2,
                offset: 4,
              },
              start: {
                line: 2,
                offset: 1,
              },
            },
          ],
        },
      ],
    }),
  ).toEqual({
    canRename: true,
  })
})

test.skip('getRenameResultFromTsResult - can rename', () => {
  expect(
    Rename.getRenameResultFromTsResult(
      {
        text: '',
      },
      {
        info: {
          canRename: true,
          displayName: 'add',
          fullDisplayName: 'add',
          // @ts-ignore
          kind: 'const',
          kindModifiers: '',
          triggerSpan: {
            end: {
              line: 2,
              offset: 4,
            },
            start: {
              line: 2,
              offset: 1,
            },
          },
        },
        locs: [
          {
            file: '/tmp/index.ts',
            locs: [
              {
                contextEnd: {
                  line: 1,
                  offset: 27,
                },
                contextStart: {
                  line: 1,
                  offset: 1,
                },
                end: {
                  line: 1,
                  offset: 10,
                },
                start: {
                  line: 1,
                  offset: 7,
                },
              },
              {
                end: {
                  line: 2,
                  offset: 4,
                },
                start: {
                  line: 2,
                  offset: 1,
                },
              },
            ],
          },
        ],
      },
      'abc',
    ),
  ).toEqual([
    {
      edits: [
        {
          deleted: 0,
          inserted: 'abc',
          offset: 0,
        },
        {
          deleted: 0,
          inserted: 'abc',
          offset: 0,
        },
      ],
      file: '/tmp/index.ts',
    },
  ])
})
