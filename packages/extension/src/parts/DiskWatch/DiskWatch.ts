import {
  createFileSystemWatcher,
  getWorkspaceUri,
  type FileSystemWatcher,
  type FileSystemWatchEvent,
} from '@lvce-editor/api'
import { getDiskWatchRoots } from '../GetDiskWatchRoots/GetDiskWatchRoots.ts'
import { writeResult } from '../WriteResult/WriteResult.ts'

export interface WatchDescriptor {
  readonly active: boolean
  readonly files: readonly string[]
  readonly id: number
  readonly revision: number
  readonly roots: readonly string[]
}

interface Session {
  active: boolean
  readonly files: ReadonlySet<string>
  revision: number
  readonly roots: readonly string[]
  starting: boolean
  readonly watchers: FileSystemWatcher[]
  readonly workspaceUri: string
}

const sessions = new Map<number, Session>()
const counters = { nextId: 0 }

const within = (uri: string, root: string): boolean => {
  const path = root.replace(/\/$/, '')
  return uri === path || uri.startsWith(`${path}/`)
}

export const stopWatching = async (id: number): Promise<void> => {
  const session = sessions.get(id)
  if (!session) return
  session.active = false
  const results = await Promise.allSettled(session.watchers.map((watcher) => watcher.dispose()))
  const errors = results.filter((result) => result.status === 'rejected').map((result) => result.reason)
  if (errors.length > 0) throw new AggregateError(errors, 'Failed to dispose TypeScript disk watches')
  if (!session.starting) sessions.delete(id)
}

export const stopAll = async (): Promise<void> => {
  await Promise.all(Array.from(sessions.keys(), stopWatching))
}

export const startWatching = async (): Promise<WatchDescriptor | null> => {
  const workspaceUri = await getWorkspaceUri()
  if (!workspaceUri.startsWith('file://')) return null
  const { files, parents, roots } = getDiskWatchRoots(workspaceUri)
  const id = ++counters.nextId
  const session: Session = {
    active: true,
    files: new Set(files),
    revision: 0,
    roots,
    starting: true,
    watchers: [],
    workspaceUri,
  }
  sessions.set(id, session)
  const handleEvent = (event: FileSystemWatchEvent): void => {
    if (!session.active) return
    if (event.eventName === 'error') {
      session.active = false
    } else if (session.files.has(event.uri) || session.roots.some((root) => within(event.uri, root))) {
      session.revision++
    }
  }
  try {
    session.watchers.push(await createFileSystemWatcher({ exclude: ['.git'], roots }, handleEvent))
    if (!session.active) throw new Error('TypeScript disk watch was cancelled')
    if (parents.length > 0) {
      const options = { exclude: ['.git'], recursive: false, roots: parents }
      session.watchers.push(await createFileSystemWatcher(options, handleEvent))
    }
    if (!session.active || workspaceUri !== (await getWorkspaceUri()))
      throw new Error('TypeScript disk watch became unavailable during setup')
    return { active: true, files, id, revision: session.revision, roots }
  } catch {
    try {
      await stopWatching(id)
    } catch {
      // Registrations remain inactive and extension shutdown retries their cleanup.
    }
    return { active: false, files: [], id, revision: 0, roots: [] }
  } finally {
    session.starting = false
    if (!session.active) {
      try {
        await stopWatching(id)
      } catch {
        // Keep failed cleanup registered for a later shutdown retry.
      }
    }
  }
}

export const getWatchState = async (syncId: number, id: number): Promise<void> => {
  await writeResult(syncId, async () => {
    const session = sessions.get(id)
    if (!session) return { active: false, revision: 0 }
    if (!session.active || session.workspaceUri !== (await getWorkspaceUri())) {
      // A disconnected backend may leave disposal pending; cache fallback must not wait for it.
      void stopWatching(id).catch(() => {})
      return { active: false, revision: session.revision }
    }
    return { active: session.active, revision: session.revision }
  })
}
