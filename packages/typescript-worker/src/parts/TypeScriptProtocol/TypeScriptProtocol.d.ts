import * as ts from '../../../node_modules/typescript/lib/tsserverlibrary.js'

export = ts.server.protocol

declare enum ServerType {
  Syntax = 'syntax',
  Semantic = 'semantic',
}

declare module 'typescript/lib/tsserverlibrary' {
  namespace server.protocol {
    type TextInsertion = ts.TextInsertion
    type ScriptElementKind = ts.ScriptElementKind

    interface Response {
      readonly _serverType?: ServerType
    }
  }
}
