import {
  createFileSystemWatcher,
  executeCommand,
  getWorkspaceUri,
  type FileSystemWatcher,
  type FileSystemWatchEvent,
} from '@lvce-editor/api'

interface Session {
  timer?: ReturnType<typeof setTimeout>
  watcher?: Promise<FileSystemWatcher | undefined>
}

const state: { session?: Session; revision: number } = { revision: 0 }

const handleChange = (session: Session, event: FileSystemWatchEvent): void => {
  if (
    state.session !== session ||
    event.eventName === 'error' ||
    !new URL(event.uri).pathname.split('/').includes('node_modules')
  ) {
    return
  }
  clearTimeout(session.timer)
  session.timer = setTimeout(() => {
    state.revision++
    void executeCommand('GetActiveEditor.updateAllDiagnostics').catch((error) => {
      console.warn('TypeScript dependency diagnostic refresh failed', error)
    })
  }, 250)
}

const start = async (session: Session): Promise<FileSystemWatcher | undefined> => {
  try {
    const workspace = await getWorkspaceUri()
    if (state.session !== session || (!workspace.startsWith('file://') && !workspace.startsWith('remote-server://'))) {
      return undefined
    }
    return await createFileSystemWatcher({ exclude: ['.git', '.cache'], roots: [workspace] }, (event) =>
      handleChange(session, event),
    )
  } catch (error) {
    console.warn('TypeScript dependency watcher could not start', error)
    return undefined
  }
}

export const ensure = async (): Promise<void> => {
  if (!state.session) {
    const session: Session = {}
    state.session = session
    session.watcher = start(session)
  }
  await state.session.watcher
}

export const getRevision = (): number => state.revision

export const dispose = async (): Promise<void> => {
  const { session } = state
  state.session = undefined
  if (session) {
    clearTimeout(session.timer)
    const watcher = await session.watcher
    await watcher?.dispose()
  }
}
