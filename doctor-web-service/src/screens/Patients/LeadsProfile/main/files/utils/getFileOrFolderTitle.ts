import {RowDataForFolders} from '../types/files.types'

export default (selectedFilesOrFolders: (RowDataForFolders | null)[] | null) => {
  let fileOrFolder = 'folder'

  if (selectedFilesOrFolders?.length) {
    const hasFolders = selectedFilesOrFolders.some((file) => file?.folder === true)
    const hasFiles = selectedFilesOrFolders.some((file) => file?.folder === false)

    if (hasFolders && hasFiles) {
      fileOrFolder = 'folders and files'
    } else if (hasFolders) {
      fileOrFolder = selectedFilesOrFolders.length > 1 ? 'folders' : 'folder'
    } else if (hasFiles) {
      fileOrFolder = selectedFilesOrFolders.length > 1 ? 'files' : 'file'
    }
  }
  return fileOrFolder
}
