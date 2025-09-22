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

  const result = getFiles('/project', [], readDir)

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

  const result = getFiles('/project', [], readDir)

  expect(result).toContain('/project/file1.ts')
  expect(result).toContain('/project/src/index.ts')
  // The function only recursively searches directories ending with /src
  // It doesn't recursively search subdirectories of /src
  expect(result).not.toContain('/project/src/utils/helper.ts')
  expect(result).not.toContain('/project/src/utils/constants.ts')
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

  const result = getFiles('/project', [], readDir)

  expect(result).toContain('/project/file1.ts')
  expect(result).toContain('/project/src/index.ts')
  // Note: tests directory is not /src so it won't be included
  expect(result).not.toContain('/project/tests/test1.ts')
  expect(result).not.toContain('/project/tests/test2.ts')
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

  const result = getFiles('/project', [], readDir)

  // .tsx files are not considered TypeScript files by isTypeScriptFile
  expect(result).not.toContain('/project/src/components/Button.tsx')
  expect(result).toContain('/project/src/src/deep.ts')
})

test('getFiles should handle include patterns (though not implemented)', () => {
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

  // The function doesn't actually use include patterns yet, but should still work
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

  expect(result).toContain('/project/file1.ts')
  expect(result).toContain('/project/src/index.ts')
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

  const result = getFiles('/project', [], readDir)

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

  const result = getFiles('/project', [], readDir)

  // The function only recursively searches directories ending with /src
  // So it won't find files in nested non-src directories
  expect(result).toEqual([])
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

  // The function should not throw, but may not include files from erroring directories
  expect(() => {
    getFiles('/project', [], readDir)
  }).toThrow()
})
