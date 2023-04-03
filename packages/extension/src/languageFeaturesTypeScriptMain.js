import { performance } from 'node:perf_hooks'
import * as Debug from './parts/Debug/Debug.js'
import * as ExtensionHostBraceCompletionProviderJavaScript from './parts/ExtensionHost/ExtensionHostBraceCompletionProviderJavaScript.js'
import * as ExtensionHostBraceCompletionProviderTypeScript from './parts/ExtensionHost/ExtensionHostBraceCompletionProviderTypeScript.js'
import * as ExtensionHostCompletionProviderJavaScript from './parts/ExtensionHost/ExtensionHostCompletionProviderJavaScript.js'
import * as ExtensionHostCompletionProviderTypeScript from './parts/ExtensionHost/ExtensionHostCompletionProviderTypeScript.js'
import * as ExtensionHostDefinitionProviderJavaScript from './parts/ExtensionHost/ExtensionHostDefinitionProviderJavaScript.js'
import * as ExtensionHostDefinitionProviderTypeScript from './parts/ExtensionHost/ExtensionHostDefinitionProviderTypeScript.js'
import * as ExtensionHostDiagnosticProviderJavaScript from './parts/ExtensionHost/ExtensionHostDiagnosticProviderJavaScript.js'
import * as ExtensionHostDiagnosticProviderTypeScript from './parts/ExtensionHost/ExtensionHostDiagnosticProviderTypeScript.js'
import * as ExtensionHostHoverProviderJavaScript from './parts/ExtensionHost/ExtensionHostHoverProviderJavaScript.js'
import * as ExtensionHostHoverProviderTypeScript from './parts/ExtensionHost/ExtensionHostHoverProviderTypeScript.js'
import * as ExtensionHostImplementationProviderJavaScript from './parts/ExtensionHost/ExtensionHostImplementationJavaScript.js'
import * as ExtensionHostImplementationProviderTypeScript from './parts/ExtensionHost/ExtensionHostImplementationProviderTypeScript.js'
import * as ExtensionHostReferenceProviderJavaScript from './parts/ExtensionHost/ExtensionHostReferenceProviderJavaScript.js'
import * as ExtensionHostReferenceProviderTypeScript from './parts/ExtensionHost/ExtensionHostReferenceProviderTypeScript.js'
import * as ExtensionHostRenameProviderJavaScript from './parts/ExtensionHost/ExtensionHostRenameProviderJavaScript.js'
import * as ExtensionHostRenameProviderTypeScript from './parts/ExtensionHost/ExtensionHostRenameProviderTypeScript.js'
import * as ExtensionHostSemanticTokenProviderJavaScript from './parts/ExtensionHost/ExtensionHostSemanticTokenProviderJavaScript.js'
import * as ExtensionHostSemanticTokenProviderTypeScript from './parts/ExtensionHost/ExtensionHostSemanticTokenProviderTypeScript.js'
import * as ExtensionHostTextDocument from './parts/ExtensionHost/ExtensionHostTextDocument.js'
import * as ExtensionHostTypeDefinitionProviderTypeScript from './parts/ExtensionHost/ExtensionHostTypeDefinitionProviderTypeScript.js'
import * as Platform from './parts/Platform/Platform.js'
import * as TsPrimaryServer from './parts/TsPrimaryServer/TsPrimaryServer.js'
import * as TsServerRequests from './parts/TsServerRequests/TsServerRequests.js'

// TODO for completion add object setting to filter completion items
// ts.completion.ADDRCONFIG: false
// ts.completion.ADDRGETNETWORKPARAMS: false
// ts.completion.AudioDestinationNode: false
// ts.completion.Audio: false
// ts.completion.AudioBuffer: false
// ts.completion.AudioBufferSourceNode: false
// ts.completion.AudioContext: false
// ts.completion.AudioListener: false
// ts.completion.AudioNode: false
// ts.completion.AudioParam: false
// ts.completion.AudioParamMap: false
// ts.completion.AudioScheduledSourceNode: false
// ts.completion.AudioWorklet: false
// ts.completion.AudioWorkletNode: false
// ts.completion.AudioProcessingEvent: false
// ts.completion.appendFile: false
// ts.completion.appendFileSync: false
// ts.completion.SocketAddress: false
// ts.completion.alledNodeEnvironmentFlags: false
// ts.completion.BaseAudioContext: false
// ts.completion.AnalyserNode: false
// ts.completion.OfflineAudioCompletionEvent: false
// ts.completion.OfflineAudioContext: false
// ts.completion.MediaStreamAudioDestinationNode: false
// ts.completion.RTCEncodedAudioFrame: false
// ts.completion.triggerAsyncId: false
// ts.completion.MediaElementAudioSourceNode: false
// ts.completion.executionAsync: false
// ts.completion.ElementInternals: false
// ts.completion.frameElement: false
// ts.completion.CustomElementRegistry: false
// ts.completion.SvgSetElement: false
// ts.completion.SVGUseElement: false
// ts.completion.getEventListeners: false
// ts.completion.HtmlMapElement: false
// ts.completion.HtmlModElement: false
// ts.completion.hasUncaughtExceptionCaptureCallback: false

export const exitHook = () => {
  Debug.debug('stopping tsserver via exitHook')
  TsPrimaryServer.stop()
}

// this function is for project indexing
export const initializeProject = async () => {
  // TODO only create server once typescript document is opened
  console.log('start-ts-server', performance.now())

  TsPrimaryServer.start({
    tsServerPath: Platform.getTsServerPath(),
  })
  console.log('started-ts-server', performance.now())
  await TsServerRequests.configure({
    hostInfo: 'test',
    preferences: {
      importModuleSpecifierEnding: 'js',
      includeCompletionsForModuleExports: true,
    },
  })
  console.log('configured-ts-server', performance.now())

  const textDocuments = vscode.getTextDocuments()
  await ExtensionHostTextDocument.handleOpenTextDocuments(textDocuments)
  // @ts-ignore
  vscode.onDidOpenTextDocument(ExtensionHostTextDocument.handleOpenTextDocument)
  vscode.onWillChangeTextDocument(
    ExtensionHostTextDocument.handleWillChangeTextDocument
  )
}

// prettier-ignore
export const activate = async () => {
  vscode.registerBraceCompletionProvider(ExtensionHostBraceCompletionProviderJavaScript)
  vscode.registerBraceCompletionProvider(ExtensionHostBraceCompletionProviderTypeScript)

  // vscode.registerClosingTagProvider(EXtensionHostClosingTagProviderTypeScript)

  vscode.registerCompletionProvider(ExtensionHostCompletionProviderJavaScript)
  vscode.registerCompletionProvider(ExtensionHostCompletionProviderTypeScript)

  vscode.registerDefinitionProvider(ExtensionHostDefinitionProviderJavaScript)
  vscode.registerDefinitionProvider(ExtensionHostDefinitionProviderTypeScript)

  vscode.registerDiagnosticProvider(ExtensionHostDiagnosticProviderJavaScript)
  vscode.registerDiagnosticProvider(ExtensionHostDiagnosticProviderTypeScript)

  vscode.registerHoverProvider(ExtensionHostHoverProviderJavaScript)
  vscode.registerHoverProvider(ExtensionHostHoverProviderTypeScript)

  vscode.registerImplementationProvider(ExtensionHostImplementationProviderJavaScript)
  vscode.registerImplementationProvider(ExtensionHostImplementationProviderTypeScript)

  vscode.registerRenameProvider(ExtensionHostRenameProviderJavaScript)
  vscode.registerRenameProvider(ExtensionHostRenameProviderTypeScript)

  vscode.registerReferenceProvider(ExtensionHostReferenceProviderJavaScript)
  vscode.registerReferenceProvider(ExtensionHostReferenceProviderTypeScript)

  vscode.registerSemanticTokenProvider(ExtensionHostSemanticTokenProviderJavaScript)
  vscode.registerSemanticTokenProvider(ExtensionHostSemanticTokenProviderTypeScript)

  vscode.registerTypeDefinitionProvider(ExtensionHostTypeDefinitionProviderTypeScript)

  await initializeProject()
  // openDocuments(vscode.visibleTextDocuments)
  // vscode.mapOpenTextDocuments(handleOpenDocument)
}
