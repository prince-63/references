import fs from 'fs'
import path from 'path'

const roots = [
  path.join(__dirname, '../@constants'),
  path.join(__dirname, '../@utils'),
  path.join(__dirname, '../utils'),
  path.join(__dirname, '../redux/Slices'),
].filter(fs.existsSync)

const allowedExtensions = new Set(['.ts', '.tsx', '.js', '.jsx'])
const ignoredPatterns = [/\.test\./, /\.spec\./, /\.d\.ts$/]

function shouldInclude(filePath: string): boolean {
  const ext = path.extname(filePath)
  if (!allowedExtensions.has(ext)) return false
  return !ignoredPatterns.some((pattern) => pattern.test(filePath))
}

function collectFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, {withFileTypes: true})
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath))
    } else if (shouldInclude(fullPath)) {
      files.push(fullPath)
    }
  }
  return files
}

const filesToImport = roots.flatMap(collectFiles)

describe('coverage smoke imports', () => {
  it('imports target modules without throwing', () => {
    const failures: string[] = []
    filesToImport.forEach((filePath) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require(filePath)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        failures.push(`${filePath}: ${message}`)
      }
    })

    if (failures.length) {
      throw new Error(`Failed imports:\n${failures.join('\n')}`)
    }
  })
})
