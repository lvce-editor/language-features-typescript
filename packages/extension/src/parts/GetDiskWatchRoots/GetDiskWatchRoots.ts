export interface DiskWatchRoots {
  readonly files: readonly string[]
  readonly parents: readonly string[]
  readonly roots: readonly string[]
}

export const getDiskWatchRoots = (workspaceUri: string): DiskWatchRoots => {
  let folder = new URL(workspaceUri.endsWith('/') ? workspaceUri : `${workspaceUri}/`)
  if (folder.protocol !== 'file:') throw new Error('Disk watchers require a file workspace')
  const roots = [folder.href]
  const parents: string[] = []
  const files: string[] = []
  while (true) {
    // A UNC share is the filesystem root; its server is not a directory to watch.
    if (folder.hostname && /^\/[^/]+\/$/.test(folder.pathname)) break
    const parent = new URL('../', folder)
    if (parent.href === folder.href) break
    parents.push(parent.href)
    roots.push(new URL('node_modules/', parent).href)
    for (const name of ['tsconfig.json', 'jsconfig.json', 'package.json']) files.push(new URL(name, parent).href)
    folder = parent
  }
  return { files, parents, roots }
}
