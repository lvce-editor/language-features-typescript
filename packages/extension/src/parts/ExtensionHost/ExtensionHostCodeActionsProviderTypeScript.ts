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
export const provideCodeActions = async (textDocument?: any, offset?: number): Promise<any[]> => {
  const organizeImports = createOrganizeImports()
  if (!textDocument || typeof offset !== 'number') {
    return [organizeImports]
  }
  const worker = await TypeScriptWorker.getInstance()
  const quickFixes = await worker.invoke('CodeActions.getCodeActions', textDocument, offset)
  return [organizeImports, ...quickFixes]
}
