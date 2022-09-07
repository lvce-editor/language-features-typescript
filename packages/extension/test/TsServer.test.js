import * as TsServerRequests from 'ts-server-requests'

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
