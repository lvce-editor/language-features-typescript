import { test, expect } from '@jest/globals'
import { getFiles } from '../src/parts/GetFiles/GetFiles.ts'

test('getFiles should return empty array for empty directory', () => {
  const readDir = (uri: string): readonly string[] => {
    return []
  }

  const result = getFiles('/empty', [], readDir)

  expect(result).toEqual([])
})

test('getFiles should filter TypeScript files', () => {
  const readDir = (uri: string): readonly string[] => {
    if (uri === '/project') {
      return ['file1.ts', 'file2.js', 'file3.tsx', 'file4.txt']
    }
    return []
  }

  const result = getFiles('/project', undefined, readDir)

  expect(result).toEqual(['/project/file1.ts', '/project/file2.js'])
})

test('getFiles should recursively search src directories', () => {
  const readDir = (uri: string): readonly string[] => {
    if (uri === '/project') {
      return ['src', 'docs', 'file1.ts']
    }
    if (uri === '/project/src') {
      return ['components', 'utils', 'index.ts']
    }
    if (uri === '/project/src/components') {
      return ['Button.tsx', 'Modal.tsx']
    }
    if (uri === '/project/src/utils') {
      return ['helper.ts', 'constants.ts']
    }
    return []
  }

  const result = getFiles('/project', undefined, readDir)

  expect(result).toContain('/project/file1.ts')
  expect(result).toContain('/project/src/index.ts')
  expect(result).toContain('/project/src/utils/helper.ts')
  expect(result).toContain('/project/src/utils/constants.ts')
  // .tsx files are not considered TypeScript files by isTypeScriptFile
  expect(result).not.toContain('/project/src/components/Button.tsx')
  expect(result).not.toContain('/project/src/components/Modal.tsx')
})

test('getFiles should handle multiple src directories', () => {
  const readDir = (uri: string): readonly string[] => {
    if (uri === '/project') {
      return ['src', 'tests', 'file1.ts']
    }
    if (uri === '/project/src') {
      return ['index.ts']
    }
    if (uri === '/project/tests') {
      return ['test1.ts', 'test2.ts']
    }
    return []
  }

  const result = getFiles('/project', undefined, readDir)

  expect(result).toContain('/project/file1.ts')
  expect(result).toContain('/project/src/index.ts')
  expect(result).toContain('/project/tests/test1.ts')
  expect(result).toContain('/project/tests/test2.ts')
})

test('getFiles should handle nested src directories', () => {
  const readDir = (uri: string): readonly string[] => {
    if (uri === '/project') {
      return ['src']
    }
    if (uri === '/project/src') {
      return ['components', 'src']
    }
    if (uri === '/project/src/components') {
      return ['Button.tsx']
    }
    if (uri === '/project/src/src') {
      return ['deep.ts']
    }
    return []
  }

  const result = getFiles('/project', undefined, readDir)

  // .tsx files are not considered TypeScript files by isTypeScriptFile
  expect(result).not.toContain('/project/src/components/Button.tsx')
  expect(result).toContain('/project/src/src/deep.ts')
})

test('getFiles should handle include patterns', () => {
  const readDir = (uri: string): readonly string[] => {
    if (uri === '/project') {
      return ['src', 'file1.ts']
    }
    if (uri === '/project/src') {
      return ['index.ts']
    }
    return []
  }

  const include = ['src/**/*', '*.ts']
  const result = getFiles('/project', include, readDir)

  expect(result).toContain('/project/file1.ts')
  expect(result).toContain('/project/src/index.ts')
})

test('getFiles should handle empty include array', () => {
  const readDir = (uri: string): readonly string[] => {
    if (uri === '/project') {
      return ['src', 'file1.ts']
    }
    if (uri === '/project/src') {
      return ['index.ts']
    }
    return []
  }

  const result = getFiles('/project', [], readDir)

  expect(result).toEqual([])
})

test('getFiles should handle mixed file types', () => {
  const readDir = (uri: string): readonly string[] => {
    if (uri === '/project') {
      return ['src', 'file1.ts', 'file2.js', 'file3.tsx', 'file4.jsx', 'file5.d.ts']
    }
    if (uri === '/project/src') {
      return ['index.ts', 'component.tsx', 'style.css', 'test.js']
    }
    return []
  }

  const result = getFiles('/project', undefined, readDir)

  expect(result).toContain('/project/file1.ts')
  expect(result).toContain('/project/file2.js')
  expect(result).toContain('/project/file5.d.ts')
  expect(result).toContain('/project/src/index.ts')
  expect(result).toContain('/project/src/test.js')
  // .tsx and .jsx files are not considered TypeScript files by isTypeScriptFile
  expect(result).not.toContain('/project/file3.tsx')
  expect(result).not.toContain('/project/file4.jsx')
  expect(result).not.toContain('/project/src/component.tsx')
  expect(result).not.toContain('/project/src/style.css')
})

test('getFiles should handle deep nesting', () => {
  const readDir = (uri: string): readonly string[] => {
    if (uri === '/project') {
      return ['src']
    }
    if (uri === '/project/src') {
      return ['level1']
    }
    if (uri === '/project/src/level1') {
      return ['level2']
    }
    if (uri === '/project/src/level1/level2') {
      return ['level3']
    }
    if (uri === '/project/src/level1/level2/level3') {
      return ['deep.ts']
    }
    return []
  }

  const result = getFiles('/project', undefined, readDir)

  expect(result).toEqual(['/project/src/level1/level2/level3/deep.ts'])
})

test('getFiles should handle readDir errors gracefully', () => {
  const readDir = (uri: string): readonly string[] => {
    if (uri === '/project') {
      return ['src', 'file1.ts']
    }
    if (uri === '/project/src') {
      throw new Error('Permission denied')
    }
    return []
  }

  expect(getFiles('/project', undefined, readDir)).toEqual(['/project/file1.ts'])
})
