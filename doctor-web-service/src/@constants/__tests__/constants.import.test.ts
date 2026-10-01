import fs from 'fs'
import path from 'path'

describe('constants modules', () => {
  const constantsDir = path.resolve(__dirname, '..')
  const constantFiles = fs
    .readdirSync(constantsDir)
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('.d.ts'))

  it('imports all constant files without errors', () => {
    constantFiles.forEach((file) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(path.join(constantsDir, file))
      expect(mod).toBeTruthy()
    })
  })
})
