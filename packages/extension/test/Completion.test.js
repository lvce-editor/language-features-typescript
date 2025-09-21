// @ts-nocheck
// import * as Completion from '../src/parts/Completion/Completion.js'
test.skip('getCompletionFromTsResult - empty entries', () => {
    expect(Completion.getCompletionFromTsResult({
        entries: [],
        isGlobalCompletion: true,
        isMemberCompletion: false,
        isNewIdentifierLocation: false,
    })).toEqual([]);
});
test.skip('getCompletionFromTsResult - normal entries', () => {
    expect(Completion.getCompletionFromTsResult({
        entries: [
            {
                // @ts-ignore
                kind: 'keyword',
                kindModifiers: '',
                name: 'const',
                sortText: '15',
            },
        ],
        isGlobalCompletion: true,
        isMemberCompletion: false,
        isNewIdentifierLocation: false,
    })).toEqual([
        {
            label: 'const',
            snippet: 'const',
            kind: 5,
        },
    ]);
});
// TODO
test.skip('getCompletionDetailsFromTsResult', () => {
    expect(Completion.getCompletionDetailsFromTsResult({})).toBeUndefined();
});
export {};
//# sourceMappingURL=Completion.test.js.map