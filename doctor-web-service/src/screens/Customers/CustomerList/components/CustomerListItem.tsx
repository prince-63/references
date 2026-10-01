import {setDataEditCustomer} from 'redux/Slices/AppSlice/Customers/customers.slice'
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
import When from 'components/when/When'
import Tag from 'components/tags/Tag'
import customerFilterConstants from '@constants/customerFilter.constants'
import {getImageUrlById, getSalutations} from 'utils/ConstFunctions'
import GetInviteButtonDetails from 'screens/Labs/LabList/components/GetInviteButtonDetails'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'

const CustomerListItem = ({
  activeTab,
  isAccessible,
  customer,
  sendInvite,
}: {
  activeTab: keyof typeof customerFilterConstants
  isAccessible: boolean
  customer: Invitation
  sendInvite: (invitation: Invitation) => void
}) => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()

  const getMobileNumber = (customer: Invitation) => {
    const mobile_no = hasValue(customer.mobile_no) ? customer.mobile_no : ''
    const country_code = hasValue(customer.country_code) ? customer.country_code : ''
    return hasValue(customer.mobile_no) ? country_code + ' ' + mobile_no : 'Mobile number not added'
  }

  const handleCardClick = () => {
    if (customer.profile_id) {
      navigate(`/practice-profile/${customer.profile_id}`, {
        state: customer,
      })
    }
  }
  const url = customer?.profile_image_id
    ? getImageUrlById(customer?.profile_image_id)
    : customer?.profile_url

  return (
    <div
      className='p-4 flex flex-col gap-3 border border-lighterGray rounded-lg font-medium text-sm justify-center cursor-pointer'
      onClick={handleCardClick}
    >
      <div className='flex justify-between items-center gap-2 text-base font-semibold'>
        <div className='flex gap-2 items-center'>
          {hasValue(url) ? (
            <Image className='w-11 h-11 object-cover rounded-full' src={url} />
          ) : (
            <DefaultImage letter={customer?.first_name?.charAt(0)} />
          )}
          <div className='font-semibold'>
            {getSalutations(customer?.salutation ?? '') +
              customer.first_name +
              ' ' +
              customer.last_name}
            {customer.admin && (
              <Tag value={'ADMIN'} className='text-textColor bg-lightGray text-xs !w-fit' />
            )}
          </div>
        </div>
        <When isTrue={!customer.admin}>
          <button
            onClick={(e) => {
              e.stopPropagation() // prevent triggering card navigation
              if (isAccessible) {
                dispatchAction(setDataEditCustomer(customer))
                const queryParams = new URLSearchParams({
                  edit: 'true',
                }).toString()
                navigate(`/customers-add/${customer.invitation_id}?${queryParams}`)
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

      <When isTrue={!customer.admin && activeTab === customerFilterConstants.PENDING}>
        <div className='text-sm font-medium break-all'>
          <GetInviteButtonDetails lab={customer} sendInvite={sendInvite} />
        </div>
      </When>

      <div className='flex text-textColor text-sm font-medium gap-2 break-all'>
        <div>
          <CalenderCheck width='20' height='20' />
        </div>
        {customer.invited_at ? moment(customer.invited_at).format('DD-MMM-YYYY') : '--'}
      </div>

      <div className='flex text-sm font-medium text-black gap-2 break-all'>
        <div>
          <MailIcon width='20' height='20' />
        </div>
        {customer.email ? customer.email?.toLocaleLowerCase() : '--'}
      </div>

      <div
        className={clsx(
          'flex  gap-2 break-all text-sm font-medium',
          customer.mobile_no ? 'text-black font-medium' : 'text-textColor font-normal'
        )}
      >
        <div>
          <PhoneIcon width='20' height='20' />
        </div>
        {getMobileNumber(customer)}
      </div>
    </div>
  )
}

export default CustomerListItem
