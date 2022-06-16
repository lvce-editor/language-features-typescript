import * as TsServerRequests from '../src/parts/TsServerRequests/TsServerRequests.js'

test.skip('completionInfo', () => {
  TsServerRequests.configure({
    hostInfo: 'vscode',
  })
  TsServerRequests.completionInfo({
    file: '',
    line: 1,
    offset: 1,
  })
})
