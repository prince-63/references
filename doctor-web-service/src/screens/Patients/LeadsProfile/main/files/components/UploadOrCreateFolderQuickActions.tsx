import {SVG_PLUS_BLACK} from 'utils/SvgConstants'
import QuickActionsRow from './QuickActionsRow'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  setIsRename,
  setOpenCreateFolderModal,
  setOpenUploadFilesModal,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'

const UploadOrCreateFolderQuickActions = ({setOpen}: {setOpen: (value: boolean) => void}) => {
  const {dispatchAction} = useDispatchAction()

  return (
    <div className='flex flex-col w-40 gap-2 '>
      <QuickActionsRow
        {...{
          showDivider: true,
          icon: SVG_PLUS_BLACK,
          className: 'text-black font-semibold text-base',
          width: '12.8',
          height: '12.8',
          showArrow: false,
          title: 'Upload files',
          onClickAction: () => {
            dispatchAction(setOpenUploadFilesModal(true))
            setOpen(false)
          },
        }}
      />
      <QuickActionsRow
        {...{
          showDivider: false,
          icon: SVG_PLUS_BLACK,
          className: 'text-black font-semibold text-base',
          width: '12.8',
          height: '12.8',
          showArrow: false,
          title: 'Create folder',
          onClickAction: () => {
            dispatchAction(setOpenCreateFolderModal(true))
            dispatchAction(setIsRename(false))
            setOpen(false)
          },
        }}
      />
    </div>
  )
}

export default UploadOrCreateFolderQuickActions
