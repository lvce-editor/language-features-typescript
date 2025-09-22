import { test, expect } from '@jest/globals'
import { createFileSystem } from '../src/parts/CreateFileSystem/CreateFileSystem.ts'

test('createFileSystem should return a file system object', () => {
  const fileSystem = createFileSystem()

  expect(fileSystem).toBeDefined()
  expect(typeof fileSystem.writeFile).toBe('function')
  expect(typeof fileSystem.readFile).toBe('function')
  expect(typeof fileSystem.getVersion).toBe('function')
  expect(typeof fileSystem.getScriptFileNames).toBe('function')
  expect(typeof fileSystem.getScriptVersion).toBe('function')
})

test('createFileSystem should store and retrieve files', () => {
  const fileSystem = createFileSystem()

  fileSystem.writeFile('file1.ts', 'const x = 1;')
  fileSystem.writeFile('file2.ts', 'const y = 2;')

  expect(fileSystem.readFile('file1.ts')).toBe('const x = 1;')
  expect(fileSystem.readFile('file2.ts')).toBe('const y = 2;')
})

test('createFileSystem should return undefined for non-existent files', () => {
  const fileSystem = createFileSystem()

  expect(fileSystem.readFile('non-existent.ts')).toBeUndefined()
})

test('createFileSystem should overwrite existing files', () => {
  const fileSystem = createFileSystem()

  fileSystem.writeFile('file.ts', 'original content')
  expect(fileSystem.readFile('file.ts')).toBe('original content')

  fileSystem.writeFile('file.ts', 'updated content')
  expect(fileSystem.readFile('file.ts')).toBe('updated content')
})

test('createFileSystem should return all script file names', () => {
  const fileSystem = createFileSystem()

  fileSystem.writeFile('file1.ts', 'content1')
  fileSystem.writeFile('file2.ts', 'content2')
  fileSystem.writeFile('file3.tsx', 'content3')

  const fileNames = fileSystem.getScriptFileNames()
  expect(fileNames).toContain('file1.ts')
  expect(fileNames).toContain('file2.ts')
  expect(fileNames).toContain('file3.tsx')
  expect(fileNames).toHaveLength(3)
})

test('createFileSystem should return empty array when no files', () => {
  const fileSystem = createFileSystem()

  const fileNames = fileSystem.getScriptFileNames()
  expect(fileNames).toEqual([])
})

test('createFileSystem should return version string', () => {
  const fileSystem = createFileSystem()

  expect(fileSystem.getVersion()).toBe('0')
})

test('createFileSystem should return script version string', () => {
  const fileSystem = createFileSystem()

  fileSystem.writeFile('file.ts', 'content')
  expect(fileSystem.getScriptVersion('file.ts')).toBe('0')
})

test('createFileSystem should handle empty file content', () => {
  const fileSystem = createFileSystem()

  fileSystem.writeFile('empty.ts', '')
  expect(fileSystem.readFile('empty.ts')).toBe('')
})

test('createFileSystem should handle special characters in content', () => {
  const fileSystem = createFileSystem()

  const content = 'const x = "hello\nworld\twith\ttabs";'
  fileSystem.writeFile('special.ts', content)
  expect(fileSystem.readFile('special.ts')).toBe(content)
})

test('createFileSystem should handle unicode content', () => {
  const fileSystem = createFileSystem()

  const content = 'const x = "你好世界"; // unicode comment'
  fileSystem.writeFile('unicode.ts', content)
  expect(fileSystem.readFile('unicode.ts')).toBe(content)
})

test('createFileSystem should handle multiple file types', () => {
  const fileSystem = createFileSystem()

  fileSystem.writeFile('file.ts', 'typescript content')
  fileSystem.writeFile('file.tsx', 'react content')
  fileSystem.writeFile('file.js', 'javascript content')
  fileSystem.writeFile('file.jsx', 'react jsx content')
  fileSystem.writeFile('file.d.ts', 'declaration content')

  expect(fileSystem.readFile('file.ts')).toBe('typescript content')
  expect(fileSystem.readFile('file.tsx')).toBe('react content')
  expect(fileSystem.readFile('file.js')).toBe('javascript content')
  expect(fileSystem.readFile('file.jsx')).toBe('react jsx content')
  expect(fileSystem.readFile('file.d.ts')).toBe('declaration content')

  const fileNames = fileSystem.getScriptFileNames()
  expect(fileNames).toHaveLength(5)
})

test('createFileSystem should handle large content', () => {
  const fileSystem = createFileSystem()

  const largeContent = 'const x = ' + '"'.repeat(10_000) + ';'
  fileSystem.writeFile('large.ts', largeContent)
  expect(fileSystem.readFile('large.ts')).toBe(largeContent)
})

test('createFileSystem should handle file paths with special characters', () => {
  const fileSystem = createFileSystem()

  fileSystem.writeFile('file with spaces.ts', 'content')
  fileSystem.writeFile('file-with-dashes.ts', 'content')
  fileSystem.writeFile('file_with_underscores.ts', 'content')
  fileSystem.writeFile('file.with.dots.ts', 'content')

  expect(fileSystem.readFile('file with spaces.ts')).toBe('content')
  expect(fileSystem.readFile('file-with-dashes.ts')).toBe('content')
  expect(fileSystem.readFile('file_with_underscores.ts')).toBe('content')
  expect(fileSystem.readFile('file.with.dots.ts')).toBe('content')
})

test('createFileSystem should maintain separate instances', () => {
  const fileSystem1 = createFileSystem()
  const fileSystem2 = createFileSystem()

  fileSystem1.writeFile('file.ts', 'content1')
  fileSystem2.writeFile('file.ts', 'content2')

  expect(fileSystem1.readFile('file.ts')).toBe('content1')
  expect(fileSystem2.readFile('file.ts')).toBe('content2')
  expect(fileSystem1.getScriptFileNames()).toEqual(['file.ts'])
  expect(fileSystem2.getScriptFileNames()).toEqual(['file.ts'])
})
