import getFileOrFolderTitle from './getFileOrFolderTitle'

describe('getFileOrFolderTitle', () => {
  it('defaults to folder when nothing selected', () => {
    expect(getFileOrFolderTitle(null)).toBe('folder')
  })

  it('returns folder or file singular', () => {
    expect(getFileOrFolderTitle([{folder: true} as any])).toBe('folder')
    expect(getFileOrFolderTitle([{folder: false} as any])).toBe('file')
  })

  it('handles plural cases and mixed selection', () => {
    expect(getFileOrFolderTitle([{folder: true} as any, {folder: true} as any])).toBe('folders')
    expect(getFileOrFolderTitle([{folder: false} as any, {folder: false} as any])).toBe('files')
    expect(getFileOrFolderTitle([{folder: true} as any, {folder: false} as any])).toBe(
      'folders and files'
    )
  })
})
