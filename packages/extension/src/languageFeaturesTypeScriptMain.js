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
import * as TsServerRequests from 'ts-server-requests'

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
  const server = TsPrimaryServer.getInstance()
  await TsServerRequests.configure(server, {
    hostInfo: 'test',
    preferences: {
      importModuleSpecifierEnding: 'js',
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
  console.log('active typescript extension')
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
