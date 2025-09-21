import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.js'

export const languageId = 'typescript'

const organizeImports = {
  kind: 'source.organizeImports', // TODO use numeric code action type
  name: 'Organize Imports',
  async execute(textDocument) {
    const worker = await TypeScriptWorker.getInstance()
    return worker.invoke('OrganizeImports.organizeImports', textDocument)
  },
}

/**
 */
export const provideCodeActions = async () => {
  return [organizeImports]
}
