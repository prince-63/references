import {setDataEditPractice} from 'redux/Slices/AppSlice/Practices/practices.slice'
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
import DropDownOutline from 'assets/icons/DropDownOutline'
import InfoIcon from 'assets/icons/InfoIcon'
import getColorPalette from 'utils/getColorPalette'
import moment from 'moment'
import {Invitation} from '../types/practices.types'
import When from 'components/when/When'
import Tag from 'components/tags/Tag'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import dayjs from 'dayjs'
import practiceFilterConstants from '@constants/practiceFilter.constants'
import {getImageUrlById, getSalutations} from 'utils/ConstFunctions'

const PracticeListItem = ({
  activeTab,
  isAccessible,
  practice,
  sendInvite,
}: {
  activeTab: keyof typeof practiceFilterConstants
  isAccessible: boolean
  practice: Invitation
  sendInvite: (invitation: Invitation) => void
}) => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {loadingAddingEditPractice} = useSelector((state: RootState) => state.practices)

  function getHoursDifference(dateInSec: number): number {
    const now = dayjs()
    const past = dayjs(dateInSec)
    return now.diff(past, 'hour')
  }

  const InviteButton = ({last_invitation_at}: {last_invitation_at: string}) => {
    if (last_invitation_at === null) {
      return (
        <button
          className='flex gap-2 items-center text-primaryColor'
          disabled={loadingAddingEditPractice}
          onClick={() => sendInvite(practice)}
        >
          <div>Send Invite</div>
          <div className='-rotate-90'>
            <DropDownOutline color={getColorPalette().primaryColor} />
          </div>
        </button>
      )
    } else {
      const hoursSinceLastInvite = getHoursDifference(new Date(last_invitation_at).getTime())

      if (hoursSinceLastInvite < 24) {
        const remainingHours = 24 - hoursSinceLastInvite
        return (
          <button className='flex gap-1 items-center text-textColor' disabled>
            <InfoIcon width='16' height='16' />
            <div> Resend Invite in {remainingHours} h</div>
          </button>
        )
      } else {
        return (
          <button
            className='flex gap-2 items-center text-primaryColor'
            onClick={() => sendInvite(practice)}
            disabled={loadingAddingEditPractice}
          >
            <div>Resend invite</div>
            <div className='-rotate-90'>
              <DropDownOutline color={getColorPalette().primaryColor} />
            </div>
          </button>
        )
      }
    }
  }

  const getMobileNumber = (practice: Invitation) => {
    const mobile_no = hasValue(practice.mobile_no) ? practice.mobile_no : ''
    const country_code = hasValue(practice.country_code) ? practice.country_code : ''
    return hasValue(practice.mobile_no) ? country_code + ' ' + mobile_no : 'Mobile number not added'
  }

  const profile_url = practice?.profile_image_id
    ? getImageUrlById(practice.profile_image_id)
    : practice?.profile_url
  return (
    <div className='p-4 flex flex-col gap-3 border border-lighterGray rounded-lg font-medium text-sm justify-center'>
      <div className='flex justify-between items-center gap-2 text-base font-semibold'>
        <div className='flex gap-2 items-center'>
          {hasValue(profile_url) ? (
            <Image className='w-11 h-11 object-cover rounded-full' src={profile_url} />
          ) : (
            <DefaultImage letter={practice?.first_name?.charAt(0)} />
          )}
          <div className='font-semibold'>
            {getSalutations(practice.salutation) +
              ' ' +
              practice.first_name +
              ' ' +
              practice.last_name}
            {practice.admin && (
              <Tag value={'ADMIN'} className='text-textColor bg-lightGray text-xs !w-fit' />
            )}
          </div>
        </div>
        <When isTrue={!practice.admin}>
          <button
            onClick={() => {
              if (isAccessible) {
                dispatchAction(setDataEditPractice(practice))
                const queryParams = new URLSearchParams({
                  edit: 'true',
                }).toString()
                navigate(`/practices-add/${practice.invitation_id}?${queryParams}`)
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
      <When isTrue={!practice.admin && activeTab === practiceFilterConstants.PENDING}>
        <InviteButton last_invitation_at={practice?.last_invitation_at} />
      </When>
      <div className='flex text-textColor text-sm font-medium gap-2 break-all'>
        <div>
          <CalenderCheck width='20' height='20' />
        </div>
        {practice.invited_at ? moment(practice.invited_at).format('DD-MMM-YYYY') : '--'}
      </div>
      <div className='flex text-sm font-medium text-black gap-2 break-all'>
        <div>
          <MailIcon width='20' height='20' />
        </div>
        {practice.email ? practice.email : '--'}
      </div>
      <div
        className={clsx(
          'flex  gap-2 break-all text-sm font-medium',
          practice.mobile_no ? 'text-black font-medium' : 'text-textColor font-normal'
        )}
      >
        <div>
          <PhoneIcon width='20' height='20' />
        </div>
        {getMobileNumber(practice)}
      </div>
    </div>
  )
}

export default PracticeListItem
