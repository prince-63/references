import CommonBreadCrumb from 'components/breadCrumb/CommonBreadCrumb'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {
  setIsRename,
  setOpenCreateFolderModal,
  setOpenUploadFilesModal,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import getBreadCrumbItems from '../../../../../../@utils/getBreadCrumbItems'
import CustomSeparator from './CustomSeparator'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import getSubscriptionAlerts from '@utils/getSubscriptionAlerts'
import isPlanExpired from '@utils/isPlanExpired'
import clsx from 'clsx'
import CloudIcon from 'assets/icons/CloudIcon'
import {Popover} from 'antd'
import UploadOrCreateFolderQuickActions from './UploadOrCreateFolderQuickActions'
import {useState} from 'react'
import ellipse from 'assets/icons/ellipse.svg'
import getColorPalette from 'utils/getColorPalette'
import PlusIcon from 'assets/icons/PlusIcon'
import DropdownRightArrow from 'assets/icons/VIewStatsIcon copy'

const FilesHeader = ({isMoveFilesModal = false}: {isMoveFilesModal?: boolean}) => {
  const {dispatchAction} = useDispatchAction()
  const {subscriptionData} = useSubscriptionDetails()
  const subscriptionAlerts = getSubscriptionAlerts({subscriptionData})
  const navigate = useNavigate()
  const params = useParams()
  const [open, setOpen] = useState(false)
  const path = params['*']
  const isUploadDisabled = isPlanExpired(subscriptionData) || subscriptionAlerts.storage.error
  const [searchParams] = useSearchParams()
  const isStlFileView = searchParams.get('isStlFileView') === 'true'
  return (
    <div className='flex flex-col md:flex-row justify-between border-b border-lightGray pb-3 gap-4'>
      {isStlFileView ? (
        <div className='flex gap-2 items-center'>
          <button
            type='button'
            onClick={() => {
              navigate(-1)
            }}
            className='rotate-180'
          >
            <DropdownRightArrow color='#666' width='17' height='17' />
          </button>
          <div className='text-2xl font-semibold '>Files</div>
        </div>
      ) : (
        <CommonBreadCrumb
          separator={<CustomSeparator />}
          items={getBreadCrumbItems({
            baseUrl: `/profile/${params.patientId}/`,
          })}
        />
      )}
      <When isTrue={!isMoveFilesModal && hasValue(path) && !isStlFileView}>
        <div className='md:flex gap-4 hidden '>
          <button
            className='  
          bg-secondarySupport text-secondaryColor font-semibold text-sm
          h-10 px-2 rounded-lg flex items-center gap-2 min-w-32'
            onClick={() => {
              dispatchAction(setOpenCreateFolderModal(true))
              dispatchAction(setIsRename(false))
            }}
          >
            <PlusIcon color={getColorPalette().secondaryColor} />
            Create folder
          </button>
          <button
            className={clsx(
              'bg-primarySupport text-primaryColor font-semibold text-sm h-10 px-2 rounded-lg flex items-center gap-2 min-w-28 justify-center',
              isUploadDisabled && 'opacity-50 bg-grayDisabled text-textColor'
            )}
            disabled={isUploadDisabled}
            onClick={() => {
              dispatchAction(setOpenUploadFilesModal(true))
            }}
          >
            <CloudIcon color={isUploadDisabled ? '#B0B0B0' : getColorPalette().primaryColor} />
            Upload
          </button>
        </div>
        <div className='flex justify-between items-center md:hidden'>
          <p className='text-xl font-semibold'>{path?.split('/').pop()}</p>

          <div className='cursor-pointer  hover:bg-lighterGray p-2 py-4 flex items-center justify-center rounded-full md:hidden ml-1'>
            <Popover
              content={<UploadOrCreateFolderQuickActions {...{setOpen}} />}
              placement='bottomLeft'
              trigger={['click']}
              onOpenChange={(open) => {
                setOpen(open)
              }}
              open={open}
              className='transition ease-in-out duration-200'
            >
              <img
                src={ellipse}
                alt=''
                className=' rotate-90 '
                // onClick={(e) => e.stopPropagation()} // Stop event propagation here
              />
            </Popover>
          </div>
        </div>
      </When>
    </div>
  )
}

export default FilesHeader
