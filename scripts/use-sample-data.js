import { mkdir, writeFile, rm } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const files = Object.create(null)

files['.gitkeep'] = ``

files['index.ts'] = `const add = (a: number, b: number) => {
  return a + b;
}`

const main = async () => {
  const playground = join(__dirname, '..', 'playground')
  await rm(playground, { recursive: true, force: true })
  for (const [key, value] of Object.entries(files)) {
    const absolutePath = join(playground, key)
    await mkdir(dirname(absolutePath), { recursive: true })
    await writeFile(absolutePath, value)
  }
}

main()
