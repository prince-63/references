import useDispatchAction from '@hooks/useDispatchAction'
import {useNavigate} from 'react-router-dom'
import PencilIcon from 'assets/icons/PencilIcon'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import hasValue from 'utils/hasValue'
import {Image} from 'assets/images/Images/Image'
import CalenderCheck from 'assets/icons/CalenderCheck'
import MailIcon from 'assets/icons/LineBreakSvg copy'
import PhoneIcon from 'assets/icons/PhoneIcon'
import clsx from 'clsx'
import moment from 'moment'
import {Invitation} from '../types/labs.types'
import When from 'components/when/When'
import Tag from 'components/tags/Tag'
import practiceFilterConstants from '@constants/practiceFilter.constants'
import {setDataEditLab} from 'redux/Slices/AppSlice/Labs/labs.slice'
import GetInviteButtonDetails from './GetInviteButtonDetails'
import {getImageUrlById, getSalutations} from 'utils/ConstFunctions'

const LabListItem = ({
  activeTab,
  isAccessible,
  lab,
  sendInvite,
  onClick,
}: {
  activeTab: keyof typeof practiceFilterConstants
  isAccessible: boolean
  lab: Invitation
  sendInvite: (lab: Invitation) => void
  onClick?: () => void
}) => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()

  const getMobileNumber = (lab: Invitation) => {
    const mobile_no = hasValue(lab.mobile_no) ? lab.mobile_no : ''
    const country_code = hasValue(lab.country_code) ? lab.country_code : ''
    return hasValue(lab.mobile_no) ? country_code + ' ' + mobile_no : 'Mobile number not added'
  }
  const url = lab?.profile_image_id ? getImageUrlById(lab?.profile_image_id) : lab.profile_url

  return (
    <div
      className='p-4 flex flex-col gap-3 border border-lighterGray rounded-lg font-medium text-sm justify-center'
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
    >
      <div className='flex justify-between items-center gap-2 text-base font-semibold'>
        <div className='flex gap-2 items-center'>
          {hasValue(url) ? (
            <Image className='w-11 h-11 object-cover rounded-full' src={url} />
          ) : (
            <DefaultImage letter={lab?.first_name?.charAt(0)} />
          )}
          <div className='font-semibold'>
            {getSalutations(lab?.salutation ?? '') + ' ' + lab.first_name + ' ' + lab.last_name}
            {lab.admin && (
              <Tag value={'ADMIN'} className='text-textColor bg-lightGray text-xs !w-fit' />
            )}
          </div>
        </div>
        <When isTrue={!lab.admin}>
          <button
            onClick={() => {
              if (isAccessible) {
                dispatchAction(setDataEditLab(lab))
                const queryParams = new URLSearchParams({
                  edit: 'true',
                }).toString()
                navigate(`/labs-add/${lab.invitation_id}?${queryParams}`)
              }
            }}
            className='flex gap-2 items-center'
          >
            <PencilIcon />
            <div className='text-sm text-textColor font-medium'>Edit</div>
          </button>
        </When>
      </div>
      <div className='w-full border border-lighterGray mx-1 '></div>
      <When isTrue={!lab.admin && activeTab === practiceFilterConstants.PENDING}>
        <GetInviteButtonDetails lab={lab} sendInvite={sendInvite} />
      </When>
      <div className='flex text-textColor text-sm font-medium gap-2 break-all'>
        <div>
          <CalenderCheck width='20' height='20' />
        </div>
        {lab.invited_at ? moment(lab.invited_at).format('DD-MMM-YYYY') : '--'}
      </div>
      <div className='flex text-sm font-medium text-black gap-2 break-all'>
        <div>
          <MailIcon width='20' height='20' />
        </div>
        {lab.email ? lab.email : '--'}
      </div>
      <div
        className={clsx(
          'flex  gap-2 break-all text-sm font-medium',
          lab.mobile_no ? 'text-black font-medium' : 'text-textColor font-normal'
        )}
      >
        <div>
          <PhoneIcon width='20' height='20' />
        </div>
        {getMobileNumber(lab)}
      </div>
    </div>
  )
}

export default LabListItem
