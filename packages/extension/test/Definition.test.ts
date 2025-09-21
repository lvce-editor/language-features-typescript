// @ts-nocheck
// import * as Definition from '../src/parts/Definition/Definition.ts'

test.skip('getDefinitionFromTsResult', () => {
  // TODO
  expect(
    Definition.getDefinitionFromTsResult(
      {
        lines: [],
        uri: '',
      },
      [
        {
          contextEnd: { line: 2, offset: 12 },
          contextStart: { line: 2, offset: 1 },
          end: { line: 2, offset: 8 },
          file: '/tmp/index.ts',
          start: { line: 2, offset: 7 },
        },
      ],
    ),
  ).toEqual(undefined)
})
