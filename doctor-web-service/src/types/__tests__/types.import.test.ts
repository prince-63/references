import fs from 'fs'
import path from 'path'

describe('types modules', () => {
  const typesDir = path.resolve(__dirname, '..')
  const typeFiles = fs
    .readdirSync(typesDir)
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('.d.ts'))

  it('imports all type declaration files', () => {
    typeFiles.forEach((file) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(path.join(typesDir, file))
      expect(mod).toBeTruthy()
    })
  })
})
