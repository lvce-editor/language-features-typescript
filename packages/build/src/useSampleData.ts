import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { root } from './root.ts'

const files: Record<string, string> = Object.create(null)

files['.gitkeep'] = ``

files['index.ts'] = `const add = (a: number, b: number) => {
  return a + b;
}`

const main = async (): Promise<void> => {
  const playground: string = join(root, 'playground')
  await rm(playground, { recursive: true, force: true })
  for (const [key, value] of Object.entries(files)) {
    const absolutePath: string = join(playground, key)
    await mkdir(dirname(absolutePath), { recursive: true })
    await writeFile(absolutePath, value)
  }
}

main()
