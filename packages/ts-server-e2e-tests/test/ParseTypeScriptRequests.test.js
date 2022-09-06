import { jest } from '@jest/globals'
import * as ParseTypeScriptRequests from '../../extension/src/parts/ParseTypeScriptRequests/ParseTypeScriptRequests.js'

// test('parseTypeScriptRequests', () => {
//   expect(
//     ParseTypeScriptRequests.parseTypeScriptRequests(`Content-Length: 111

// {"seq":0,"type":"event","event":"projectLoadingFinish","body":{"projectName":"/tmp/foo-grI2XZ/tsconfig.json"}}
// `)
//   ).toEqual([
//     {
//       seq: 0,
//       type: 'event',
//       event: 'projectLoadingFinish',
//       body: { projectName: '/tmp/foo-grI2XZ/tsconfig.json' },
//     },
//   ])
// })

// test('parseTypeScriptRequests - multiple requests', () => {
//   expect(
//     ParseTypeScriptRequests.parseTypeScriptRequests(`Content-Length: 606
// {"seq":0,"type":"event","event":"telemetry","body":{"telemetryEventName":"projectInfo","payload":{"projectId":"ab8df97f1e1d84c8b2b57d8752f72c03007709fd13cc970965d77d36efb325eb","fileStats":{"js":0,"jsSize":0,"jsx":0,"jsxSize":0,"ts":1,"tsSize":1,"tsx":0,"tsxSize":0,"dts":5,"dtsSize":1015410,"deferred":0,"deferredSize":0},"compilerOptions":{},"typeAcquisition":{"enable":false,"include":false,"exclude":false},"extends":false,"files":false,"include":false,"exclude":false,"compileOnSave":false,"configFileName":"tsconfig.json","projectType":"configured","languageServiceEnabled":true,"version":"4.4.4"}}}
// Content-Length: 162

// {"seq":0,"type":"event","event":"configFileDiag","body":{"triggerFile":"/tmp/foo-6RPsmV/index.ts","configFile":"/tmp/foo-6RPsmV/tsconfig.json","diagnostics":[]}}
// Content-Length: 99

// {"seq":0,"type":"response","command":"braceCompletion","request_seq":1,"success":true,"body":true}
// Content-Length: 76

// {"seq":0,"type":"event","event":"typingsInstallerPid","body":{"pid":56267}}
// `)
//   ).toEqual([
//     {
//       seq: 0,
//       type: 'event',
//       event: 'telemetry',
//       body: {
//         telemetryEventName: 'projectInfo',
//         payload: {
//           projectId:
//             'ab8df97f1e1d84c8b2b57d8752f72c03007709fd13cc970965d77d36efb325eb',
//           fileStats: {
//             js: 0,
//             jsSize: 0,
//             jsx: 0,
//             jsxSize: 0,
//             ts: 1,
//             tsSize: 1,
//             tsx: 0,
//             tsxSize: 0,
//             dts: 5,
//             dtsSize: 1015410,
//             deferred: 0,
//             deferredSize: 0,
//           },
//           compilerOptions: {},
//           typeAcquisition: { enable: false, include: false, exclude: false },
//           extends: false,
//           files: false,
//           include: false,
//           exclude: false,
//           compileOnSave: false,
//           configFileName: 'tsconfig.json',
//           projectType: 'configured',
//           languageServiceEnabled: true,
//           version: '4.4.4',
//         },
//       },
//     },
//     {
//       seq: 0,
//       type: 'event',
//       event: 'configFileDiag',
//       body: {
//         triggerFile: '/tmp/foo-6RPsmV/index.ts',
//         configFile: '/tmp/foo-6RPsmV/tsconfig.json',
//         diagnostics: [],
//       },
//     },
//     {
//       seq: 0,
//       type: 'response',
//       command: 'braceCompletion',
//       request_seq: 1,
//       success: true,
//       body: true,
//     },
//     {
//       seq: 0,
//       type: 'event',
//       event: 'typingsInstallerPid',
//       body: { pid: 56267 },
//     },
//   ])
// })

test('createParser - append single request', () => {
  const onMessage = jest.fn()
  const parser = ParseTypeScriptRequests.createParser({
    onMessage,
  })
  parser.append(
    Buffer.from(
      `Content-Length: 111

{"seq":0,"type":"event","event":"projectLoadingFinish","body":{"projectName":"/tmp/foo-grI2XZ/tsconfig.json"}}`
    )
  )
  expect(onMessage).toHaveBeenCalledTimes(1)
  expect(onMessage).toHaveBeenCalledWith({
    body: {
      projectName: '/tmp/foo-grI2XZ/tsconfig.json',
    },
    event: 'projectLoadingFinish',
    seq: 0,
    type: 'event',
  })
})

test('createParser - append single request with multiple messages', () => {
  const onMessage = jest.fn()
  const parser = ParseTypeScriptRequests.createParser({
    onMessage,
  })
  parser.append(
    Buffer.from(
      `Content-Length: 606
{"seq":0,"type":"event","event":"telemetry","body":{"telemetryEventName":"projectInfo","payload":{"projectId":"ab8df97f1e1d84c8b2b57d8752f72c03007709fd13cc970965d77d36efb325eb","fileStats":{"js":0,"jsSize":0,"jsx":0,"jsxSize":0,"ts":1,"tsSize":1,"tsx":0,"tsxSize":0,"dts":5,"dtsSize":1015410,"deferred":0,"deferredSize":0},"compilerOptions":{},"typeAcquisition":{"enable":false,"include":false,"exclude":false},"extends":false,"files":false,"include":false,"exclude":false,"compileOnSave":false,"configFileName":"tsconfig.json","projectType":"configured","languageServiceEnabled":true,"version":"4.4.4"}}}
Content-Length: 162

{"seq":0,"type":"event","event":"configFileDiag","body":{"triggerFile":"/tmp/foo-6RPsmV/index.ts","configFile":"/tmp/foo-6RPsmV/tsconfig.json","diagnostics":[]}}
Content-Length: 99

{"seq":0,"type":"response","command":"braceCompletion","request_seq":1,"success":true,"body":true}
Content-Length: 76

{"seq":0,"type":"event","event":"typingsInstallerPid","body":{"pid":56267}}
`
    )
  )
  expect(onMessage).toHaveBeenCalledTimes(4)
  expect(onMessage).toHaveBeenNthCalledWith(1, {
    body: {
      payload: {
        compileOnSave: false,
        compilerOptions: {},
        configFileName: 'tsconfig.json',
        exclude: false,
        extends: false,
        fileStats: {
          deferred: 0,
          deferredSize: 0,
          dts: 5,
          dtsSize: 1015410,
          js: 0,
          jsSize: 0,
          jsx: 0,
          jsxSize: 0,
          ts: 1,
          tsSize: 1,
          tsx: 0,
          tsxSize: 0,
        },
        files: false,
        include: false,
        languageServiceEnabled: true,
        projectId:
          'ab8df97f1e1d84c8b2b57d8752f72c03007709fd13cc970965d77d36efb325eb',
        projectType: 'configured',
        typeAcquisition: {
          enable: false,
          exclude: false,
          include: false,
        },
        version: '4.4.4',
      },
      telemetryEventName: 'projectInfo',
    },
    event: 'telemetry',
    seq: 0,
    type: 'event',
  })
  expect(onMessage).toHaveBeenNthCalledWith(2, {
    body: {
      configFile: '/tmp/foo-6RPsmV/tsconfig.json',
      diagnostics: [],
      triggerFile: '/tmp/foo-6RPsmV/index.ts',
    },
    event: 'configFileDiag',
    seq: 0,
    type: 'event',
  })
  expect(onMessage).toHaveBeenNthCalledWith(3, {
    body: true,
    command: 'braceCompletion',
    request_seq: 1,
    seq: 0,
    success: true,
    type: 'response',
  })
  expect(onMessage).toHaveBeenNthCalledWith(4, {
    body: {
      pid: 56267,
    },
    event: 'typingsInstallerPid',
    seq: 0,
    type: 'event',
  })
})

test('createParser - one message split over two buffers', () => {
  const onMessage = jest.fn()
  const parser = ParseTypeScriptRequests.createParser({
    onMessage,
  })
  parser.append(
    Buffer.from(
      `Content-Length: 111

{"seq":0,"type":"event","event":`
    )
  )
  expect(onMessage).toHaveBeenCalledTimes(0)
  parser.append(
    Buffer.from(`"projectLoadingFinish","body":{"projectName":"/tmp/foo-grI2XZ/tsconfig.json"}}
  `)
  )
  expect(onMessage).toHaveBeenCalledTimes(1)
  expect(onMessage).toHaveBeenCalledWith({
    body: {
      projectName: '/tmp/foo-grI2XZ/tsconfig.json',
    },
    event: 'projectLoadingFinish',
    seq: 0,
    type: 'event',
  })
})

test('createParser - one message split over three buffers', () => {
  const onMessage = jest.fn()
  const parser = ParseTypeScriptRequests.createParser({
    onMessage,
  })
  parser.append(
    Buffer.from(
      `Content-Length: 111

{"seq":0,"type":"event","event":`
    )
  )
  expect(onMessage).toHaveBeenCalledTimes(0)
  parser.append(Buffer.from('"projectLoadingFinish","body":'))
  expect(onMessage).toHaveBeenCalledTimes(0)
  parser.append(Buffer.from('{"projectName":"/tmp/foo-grI2XZ/tsconfig.json"}}'))
  expect(onMessage).toHaveBeenCalledTimes(1)
  expect(onMessage).toHaveBeenCalledWith({
    body: {
      projectName: '/tmp/foo-grI2XZ/tsconfig.json',
    },
    event: 'projectLoadingFinish',
    seq: 0,
    type: 'event',
  })
})

test('createParser - two messages split over three buffers and a third message', () => {
  const onMessage = jest.fn()
  const parser = ParseTypeScriptRequests.createParser({
    onMessage,
  })
  parser.append(
    Buffer.from(
      `Content-Length: 606
{"seq":0,"type":"event","event":"tele`
    )
  )
  expect(onMessage).toHaveBeenCalledTimes(0)
  parser.append(
    Buffer.from(`metry","body":{"telemetryEventName":"projectInfo","payload":{"projectId":"ab8df97f1e1d84c8b2b57d8752f72c03007709fd13cc970965d77d36efb325eb","fileStats":{"js":0,"jsSize":0,"jsx":0,"jsxSize":0,"ts":1,"tsSize":1,"tsx":0,"tsxSize":0,"dts":5,"dtsSize":1015410,"deferred":0,"deferredSize":0},"compilerOptions":{},"typeAcquisition":{"enable":false,"include":false,"exclude":false},"extends":false,"files":false,"include":false,"exclude":false,"compileOnSave":false,"configFileName":"tsconfig.json","projectType":"configured","languageServiceEnabled":true,"version":"4.4.4"}}}
Content-Length: 162

{"seq":0,"type":"event","event":"configFileDiag",`)
  )
  expect(onMessage).toHaveBeenCalledTimes(1)
  expect(onMessage).toHaveBeenNthCalledWith(1, {
    body: {
      payload: {
        compileOnSave: false,
        compilerOptions: {},
        configFileName: 'tsconfig.json',
        exclude: false,
        extends: false,
        fileStats: {
          deferred: 0,
          deferredSize: 0,
          dts: 5,
          dtsSize: 1015410,
          js: 0,
          jsSize: 0,
          jsx: 0,
          jsxSize: 0,
          ts: 1,
          tsSize: 1,
          tsx: 0,
          tsxSize: 0,
        },
        files: false,
        include: false,
        languageServiceEnabled: true,
        projectId:
          'ab8df97f1e1d84c8b2b57d8752f72c03007709fd13cc970965d77d36efb325eb',
        projectType: 'configured',
        typeAcquisition: {
          enable: false,
          exclude: false,
          include: false,
        },
        version: '4.4.4',
      },
      telemetryEventName: 'projectInfo',
    },
    event: 'telemetry',
    seq: 0,
    type: 'event',
  })
  parser.append(
    Buffer.from(
      '"body":{"triggerFile":"/tmp/foo-6RPsmV/index.ts","configFile":"/tmp/foo-6RPsmV/tsconfig.json","diagnostics":[]}}'
    )
  )
  expect(onMessage).toHaveBeenCalledTimes(2)
  expect(onMessage).toHaveBeenNthCalledWith(2, {
    body: {
      configFile: '/tmp/foo-6RPsmV/tsconfig.json',
      diagnostics: [],
      triggerFile: '/tmp/foo-6RPsmV/index.ts',
    },
    event: 'configFileDiag',
    seq: 0,
    type: 'event',
  })
  parser.append(
    Buffer.from(`Content-Length: 99

{"seq":0,"type":"response","command":"braceCompletion","request_seq":1,"success":true,"body":true}`)
  )
  expect(onMessage).toHaveBeenCalledTimes(3)
  expect(onMessage).toHaveBeenNthCalledWith(3, {
    body: true,
    command: 'braceCompletion',
    request_seq: 1,
    seq: 0,
    success: true,
    type: 'response',
  })
})

test('createParser - bug on windows', () => {
  const onMessage = jest.fn()
  const parser = ParseTypeScriptRequests.createParser({
    onMessage,
  })
  parser.append(
    Buffer.from(
      'Content-Length: 253\r\n' +
        '\r\n' +
        '{"seq":0,"type":"event","event":"projectLoadingStart","body":{"projectName":"C:/Users/simon/AppData/Local/Temp/foo-02JVpO/tsconfig.json","reason":"Creating possible configured project for C:/Users/simon/AppData/Local/Temp/foo-02JVpO/index.ts to open"}}\r\n'
    )
  )
  expect(onMessage).toHaveBeenCalledTimes(1)
  expect(onMessage).toHaveBeenNthCalledWith(1, {
    body: {
      projectName: 'C:/Users/simon/AppData/Local/Temp/foo-02JVpO/tsconfig.json',
      reason:
        'Creating possible configured project for C:/Users/simon/AppData/Local/Temp/foo-02JVpO/index.ts to open',
    },
    event: 'projectLoadingStart',
    seq: 0,
    type: 'event',
  })
  parser.append(
    Buffer.from(
      'Content-Length: 140\r\n' +
        '{"seq":0,"type":"event","event":"projectLoadingFinish","body":{"projectName":"C:/Users/simon/AppData/Local/Temp/foo-02JVpO/tsconfig.json"}}\r\n'
    )
  )
  expect(onMessage).toHaveBeenCalledTimes(2)
  expect(onMessage).toHaveBeenNthCalledWith(2, {
    body: {
      projectName: 'C:/Users/simon/AppData/Local/Temp/foo-02JVpO/tsconfig.json',
    },
    event: 'projectLoadingFinish',
    seq: 0,
    type: 'event',
  })
  parser.append(
    Buffer.from(
      'Content-Length: 606\r\n' +
        '\r\n' +
        '{"seq":0,"type":"event","event":"telemetry","body":{"telemetryEventName":"projectInfo","payload":{"projectId":"a7a56868e3858c6b94c2c9cdb178bef5b6e619ad7a7a8ae76653dbf28e7d7f2d","fileStats":{"js":0,"jsSize":0,"jsx":0,"jsxSize":0,"ts":1,"tsSize":1,"tsx":0,"tsxSize":0,"dts":5,"dtsSize":1015410,"deferred":0,"deferredSize":0},"compilerOptions":{},"typeAcquisition":{"enable":false,"include":false,"exclude":false},"extends":false,"files":false,"include":false,"exclude":false,"compileOnSave":false,"configFileName":"tsconfig.json","projectType":"configured","languageServiceEnabled":true,"version":"4.4.4"}}}\r\n' +
        'Content-Length: 220\r\n' +
        '\r\n' +
        '{"seq":0,"type":"event","event":"configFileDiag","body":{"triggerFile":"C:/Users/simon/AppData/Local/Temp/foo-02JVpO/index.ts","configFile":"C:/Users/simon/AppData/Local/Temp/foo-02JVpO/tsconfig.json","diagnostics":[]}}\r\n' +
        'Content-Length: 99\r\n' +
        '\r\n' +
        '{"seq":0,"type":"response","command":"braceCompletion","request_seq":0,"success":true,"body":true}\r\n'
    )
  )
  expect(onMessage).toHaveBeenCalledTimes(5)
  expect(onMessage).toHaveBeenNthCalledWith(3, {
    body: {
      payload: {
        compileOnSave: false,
        compilerOptions: {},
        configFileName: 'tsconfig.json',
        exclude: false,
        extends: false,
        fileStats: {
          deferred: 0,
          deferredSize: 0,
          dts: 5,
          dtsSize: 1015410,
          js: 0,
          jsSize: 0,
          jsx: 0,
          jsxSize: 0,
          ts: 1,
          tsSize: 1,
          tsx: 0,
          tsxSize: 0,
        },
        files: false,
        include: false,
        languageServiceEnabled: true,
        projectId:
          'a7a56868e3858c6b94c2c9cdb178bef5b6e619ad7a7a8ae76653dbf28e7d7f2d',
        projectType: 'configured',
        typeAcquisition: {
          enable: false,
          exclude: false,
          include: false,
        },
        version: '4.4.4',
      },
      telemetryEventName: 'projectInfo',
    },
    event: 'telemetry',
    seq: 0,
    type: 'event',
  })
  expect(onMessage).toHaveBeenNthCalledWith(4, {
    body: {
      configFile: 'C:/Users/simon/AppData/Local/Temp/foo-02JVpO/tsconfig.json',
      diagnostics: [],
      triggerFile: 'C:/Users/simon/AppData/Local/Temp/foo-02JVpO/index.ts',
    },
    event: 'configFileDiag',
    seq: 0,
    type: 'event',
  })
  expect(onMessage).toHaveBeenNthCalledWith(5, {
    body: true,
    command: 'braceCompletion',
    request_seq: 0,
    seq: 0,
    success: true,
    type: 'response',
  })
})
