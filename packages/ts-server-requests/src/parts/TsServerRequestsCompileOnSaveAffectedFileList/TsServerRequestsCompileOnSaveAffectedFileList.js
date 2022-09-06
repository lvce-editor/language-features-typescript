/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').CompileOnSaveAffectedFileListRequest['arguments']} params
 */
export const compileOnSaveAffectedFileList = (server, params) => {
  server.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.CompileOnSaveAffectedFileList,
    arguments: params,
  })
}
