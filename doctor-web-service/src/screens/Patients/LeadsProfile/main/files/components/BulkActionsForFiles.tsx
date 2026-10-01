import DeleteIcon from 'assets/icons/DeleteIcon'
import DownloadIcon from 'assets/icons/DownloadIcon'
import ellipse from 'assets/icons/ellipse.svg'
import Spinner from 'components/spinner/Spinner'
import {Popover} from 'antd'
import QuickActionsRow from './QuickActionsRow'
import {SVG_MOVE_ICON} from 'utils/SvgConstants'
import useDispatchAction from '@hooks/useDispatchAction'
import {setOpenDeleteModal} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import clsx from 'clsx'
import {useSearchParams} from 'react-router-dom'
import When from 'components/when/When'

const BulkActionsForFiles = ({
  noOfItemsSelected,
  onClickDownload,
  onClickActionMenu,
  isDownloading,
  moveDisabled,
}: {
  noOfItemsSelected: number
  onClickDownload: () => void
  onClickActionMenu: () => void
  isDownloading: boolean
  moveDisabled?: boolean
  deletedDisabled?: boolean
}) => {
  const {dispatchAction} = useDispatchAction()
  const [searchParams] = useSearchParams()
  const isStlFileView = searchParams.get('isStlFileView') === 'true'
  return (
    <div className='bg-lightGray w-full py-3 px-6 h-full flex justify-between items-center text-textColor text-base font-medium'>
      <p>{noOfItemsSelected} selected</p>
      <div className='flex gap-7 '>
        <div className='flex gap-4'>
          <Spinner loading={isDownloading} size={28} color='#666666' />
          <button
            onClick={() => {
              onClickDownload()
            }}
            type='button'
            className={clsx(isDownloading && 'cursor-not-allowed')}
            disabled={isDownloading}
          >
            <DownloadIcon width={'28px'} height={'28px'} />
          </button>
        </div>
        <When isTrue={!isStlFileView}>
          <button
            onClick={() => {
              dispatchAction(setOpenDeleteModal(true))
            }}
            disabled={true}
            type='button'
            className={clsx({
              'opacity-50': true,
              'opacity-100': !true,
              'cursor-not-allowed': true,
            })}
          >
            <DeleteIcon width={'28px'} height={'28px'} className='cursor-pointer' />
          </button>
          <Popover
            content={
              <div className=' w-40 '>
                <QuickActionsRow
                  {...{
                    showDivider: false,
                    icon: SVG_MOVE_ICON,
                    title: 'Move',
                    onClickAction: onClickActionMenu,
                    disabled: moveDisabled,
                  }}
                />
              </div>
            }
            placement='topLeft'
            getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
            trigger='click'
          >
            <img src={ellipse} alt='' className='cursor-pointer' width={'23px'} height={'5px'} />
          </Popover>
        </When>
      </div>
    </div>
  )
}

export default BulkActionsForFiles
