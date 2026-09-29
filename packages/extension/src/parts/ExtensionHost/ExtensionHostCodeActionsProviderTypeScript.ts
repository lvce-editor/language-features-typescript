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

const createAddMissingImports = (): any => {
  const addMissingImports: any = {
    kind: 'source.addMissingImports',
    name: 'Add All Missing Imports',
  }
  Object.defineProperty(addMissingImports, 'execute', {
    enumerable: false,
    async value(textDocument: any): Promise<any> {
      const worker = await TypeScriptWorker.getInstance()
      return worker.invoke('AddMissingImports.addMissingImports', textDocument)
    },
  })
  return addMissingImports
}

/**
 */
export const provideCodeActions = async (textDocument?: any, offset?: number): Promise<any[]> => {
  const organizeImports = createOrganizeImports()
  const addMissingImports = createAddMissingImports()
  if (!textDocument || typeof offset !== 'number') {
    return [organizeImports, addMissingImports]
  }
  const worker = await TypeScriptWorker.getInstance()
  const quickFixes = await worker.invoke('CodeActions.getCodeActions', textDocument, offset)
  return [organizeImports, addMissingImports, ...quickFixes]
}
