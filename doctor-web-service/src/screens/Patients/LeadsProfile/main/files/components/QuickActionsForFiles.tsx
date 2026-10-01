import DownloadIcon from 'assets/icons/DownloadIcon'
import {SVG_MOVE_ICON, SVG_RENAME_ICON} from 'utils/SvgConstants'
import QuickActionsRow from './QuickActionsRow'
import DeleteIcon from 'assets/icons/DeleteIcon'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  setIsRename,
  setOpenCreateFolderModal,
  setOpenDeleteModal,
  setOpenMoveFilesModal,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {RowDataForFolders} from '../types/files.types'
import {useSearchParams} from 'react-router-dom'
import When from 'components/when/When'

const QuickActionsForFiles = ({
  disabled,
  handleDownload,
  selectedRow,
  moveDisabled,
  setOpen,
}: {
  disabled?: boolean
  selectedRow: RowDataForFolders
  handleDownload: (x: RowDataForFolders) => void
  moveDisabled?: boolean
  setOpen: (value: boolean) => void
}) => {
  const {dispatchAction} = useDispatchAction()
  const [searchParams] = useSearchParams()
  const isStlFileView = searchParams.get('isStlFileView') === 'true'
  return (
    <div className='flex flex-col w-40 gap-2 '>
      <QuickActionsRow
        {...{
          showDivider: !isStlFileView ? true : false,
          icon: DownloadIcon,
          title: 'Download',
          onClickAction: () => {
            handleDownload(selectedRow)
            setOpen(false)
          },
        }}
      />
      <When isTrue={!isStlFileView}>
        <QuickActionsRow
          {...{
            showDivider: false,
            icon: SVG_RENAME_ICON,
            title: 'Rename',
            disabled,
            onClickAction: () => {
              dispatchAction(setOpenCreateFolderModal(true))
              setOpen(false)

              dispatchAction(setIsRename(true))
            },
          }}
        />
        <QuickActionsRow
          {...{
            showDivider: true,
            icon: SVG_MOVE_ICON,
            title: 'Move',
            disabled: moveDisabled,
            onClickAction: () => {
              dispatchAction(setOpenMoveFilesModal(true))
              setOpen(false)
            },
          }}
        />
        <QuickActionsRow
          {...{
            showDivider: false,
            icon: DeleteIcon,
            title: 'Delete',
            disabled: true,
            onClickAction: () => {
              dispatchAction(setOpenDeleteModal(true))
              setOpen(false)
            },
          }}
        />
      </When>
    </div>
  )
}

export default QuickActionsForFiles
