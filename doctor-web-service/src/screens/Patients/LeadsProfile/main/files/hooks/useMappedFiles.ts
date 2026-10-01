import {useMemo} from 'react'
import hasValue from 'utils/hasValue'
import {Files, RowDataForFolders} from '../types/files.types'
import useAllUserPlan from '@hooks/useAllUserPlan'

const useMappedFiles = ({
  files,
  isMoveFilesModal = false,
}: {
  files: Files[]
  isMoveFilesModal?: boolean
}) => {
  const {isStarterPlanUser, isPractice} = useAllUserPlan()

  const mappedOrders = useMemo(() => {
    if (!hasValue(files)) return []

    const fileRows: RowDataForFolders[] = files
      .filter((file: Files) => {
        if (isStarterPlanUser) {
          return file.name !== 'Orders'
        } else if (isPractice) {
          return file.is_purchase_order_files !== true
        }
        return true
      })
      .map((file: Files) => ({
        name: file.name,
        createdBy: file.created_by_user_type,
        createdOn: file.created_at,
        size: file?.size ?? 0,
        folder: file.folder,
        url: file?.url,
        type: file.type,
        extension: file.extension,
        full_path: file.full_path,
        children_files: file?.children_files ?? [],
        fileId: file.file_id,
        default_folder: file.default_folder,
        files_from_treatment_plan: file.files_from_treatment_plan,
      }))

    fileRows.sort((a, b) => {
      if (a.folder && !b.folder) return -1
      if (!a.folder && b.folder) return 1
      return new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
    })

    if (isMoveFilesModal) {
      return fileRows.filter((file) => file.folder)
    }

    return fileRows
  }, [files, isMoveFilesModal, isStarterPlanUser, isPractice])

  return mappedOrders
}

export default useMappedFiles
