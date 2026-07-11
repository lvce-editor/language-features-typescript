import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'

export const languageId = 'typescript'

const createOrganizeImports = (): any => {
  const organizeImports: any = {
    kind: 'source.organizeImports', // TODO use numeric code action type
    name: 'Organize Imports',
  }
  Object.defineProperty(organizeImports, 'execute', {
    enumerable: false,
    async value(textDocument: any): Promise<any> {
      const worker = await TypeScriptWorker.getInstance()
      return worker.invoke('OrganizeImports.organizeImports', textDocument)
    },
  })
  return organizeImports
}

/**
 */
export const provideCodeActions = async (): Promise<any[]> => {
  return [createOrganizeImports()]
}
