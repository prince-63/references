import {DefaultImage} from 'assets/images/Images/DefaultImage'
import {Image} from 'assets/images/Images/Image'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import When from 'components/when/When'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {SVG_HOSPITAL_NEW, SVG_ORDER, SVG_THREE_USER, SVG_USER_CHECK} from 'utils/SvgConstants'
import hasValue from 'utils/hasValue'
import moment from 'moment'
import useActiveProfile from '@hooks/useActiveProfile'
import GetAppInviteStatus from './GetAppInviteStatus'
import {PatientRowDetails} from '../types/patientsList.types'
import FirstAidKit from 'assets/icons/FirstAidKit'
import PATIENT_TYPE from '@constants/patientType.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'
import AssignPracticeButton from 'screens/Patients/LeadsProfile/leftPanel/AssignPracticeButton'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {getImageUrl} from 'utils/ConstFunctions'
import useProfileBasePath from '@hooks/useProfileBasePath'

const PatientListMobileView = ({
  patientObject,
  isArchived,
}: {
  patientObject: PatientRowDetails
  isArchived: boolean
}) => {
  const navigation = useNavigate()
  const {activeProfile} = useActiveProfile()
  const profileBasePath = useProfileBasePath()
  const {isOrganization, isPractice, isDesignLabUser, isCustomer, isVendor, isEnterprisePlanUser} =
    useAllUserPlan()
  const countryCode = hasValue(patientObject.country_code) && patientObject.country_code
  const mobile = hasValue(patientObject.mobile) ? patientObject.mobile : null
  const mobileNumber = mobile ? countryCode + ' ' + mobile : ''
  const patientListAccessForLabs =
    isCustomer || (!isEnterprisePlanUser && isDesignLabUser) || isVendor
  const {permissionChecks} = useFeatureAccess()
  const assignPracticeNamePermissions = permissionChecks?.patientProfileActions?.displayPracticeName
  const [searchParams] = useSearchParams()
  const isCustomerList = searchParams.get('isCustomerList') === 'true'
  const isAssessButtonBasedOnRole = (patient_belongs_to: string) => {
    const access =
      (patient_belongs_to === 'ORG_PATIENT' && isOrganization) ||
      (patient_belongs_to === 'ASSIGNED_TO_PRACTICE' &&
        !isOrganization &&
        !isDesignLabUser &&
        !isVendor) ||
      (patient_belongs_to === 'ORTHODONTIC_PATIENT' &&
        !isOrganization &&
        !isDesignLabUser &&
        !isVendor)

    return access
  }

  return (
    <div
      className='border border-mediumGray rounded-lg p-4 w-full mb-4 cursor-pointer'
      onClick={() => {
        const patientId = patientObject.patient_id

        navigation(`${profileBasePath}/${patientId}`)
      }}
    >
      <div className='pb-4 border-b border-mediumGray flex items-center justify-between gap-4 w-full'>
        <div className='flex gap-3 items-center w-full'>
          {hasValue(patientObject.profile_url) && patientObject.profile_url !== null ? (
            <Image
              className='w-11 h-11 object-cover rounded-full'
              src={
                getImageUrl({
                  url: patientObject.profile_url,
                  is_gdrive_platform: patientObject.profile_url.includes('patient/drive/image/'),
                  drive_file_id: patientObject.profile_url.match(
                    /patient\/drive\/image\/([^/?#]+)/
                  )?.[1],
                }) || patientObject.profile_url
              }
            />
          ) : (
            <DefaultImage letter={patientObject.full_name.charAt(0)} />
          )}
          <div className='flex flex-col gap-1 w-full overflow-hidden'>
            <div className='w-full'>
              <span className='font-semibold truncate max-w-[70%]'>{patientObject.full_name}</span>
              <When
                isTrue={
                  !patientObject?.has_read_existing_patient_form &&
                  patientObject?.patient_type === PATIENT_TYPE.EXISTING_PATIENT
                }
              >
                <div className='flex gap-1 items-center'>
                  <div className='w-2 h-2 bg-orange rounded-full'></div>
                  <div className='font-figtree text-xs font-semibold leading-4 tracking-[0.12px] text-orange'>
                    Existing case
                  </div>
                </div>
              </When>
            </div>
          </div>
        </div>
      </div>

      <When isTrue={isAssessButtonBasedOnRole(patientObject.patient_belongs_to)}>
        {hasValue(patientObject.email || mobileNumber) && (
          <div className='flex gap-1 border-b border-mediumGray py-4'>
            <div className='flex gap-1  text-sm font-medium'>{patientObject?.email}</div>
            {'•'}
            <div className='flex gap-1  text-sm font-medium'>{mobileNumber}</div>
          </div>
        )}
      </When>
      <div className='mt-4 flex flex-col gap-2'>
        <When
          isTrue={
            isAssessButtonBasedOnRole(patientObject.patient_belongs_to) &&
            !patientListAccessForLabs &&
            !isCustomerList
          }
        >
          <div className='flex items-center gap-2'>
            <CommonSVG svg={SVG_HOSPITAL_NEW} width='18' />
            <span className='text-sm font-medium'>
              {hasValue(patientObject.practice_location_name)
                ? patientObject.practice_location_name
                : '--'}
            </span>
          </div>
        </When>

        <When isTrue={assignPracticeNamePermissions?.isViewable}>
          <div className='flex items-center gap-2'>
            <FirstAidKit color='#666666' />
            <AssignPracticeButton
              patientBelongsTo={patientObject?.patient_belongs_to}
              practiceName={patientObject?.assigned_practice?.name}
            />
          </div>
        </When>

        <When isTrue={!patientListAccessForLabs || isCustomer}>
          <div className='flex items-center gap-2'>
            <CommonSVG svg={SVG_USER_CHECK} width='20' />
            {isArchived ? (
              <p className='mt-[1px] font-medium'>
                Archived on
                {hasValue(patientObject?.added_on)
                  ? moment(patientObject?.added_on).format('DD-MMM-YYYY')
                  : '--'}
              </p>
            ) : (
              <p className='mt-[1px] font-medium'>
                Added on{' '}
                {hasValue(patientObject?.added_on)
                  ? moment(patientObject?.added_on).format('DD-MMM-YYYY')
                  : '--'}
              </p>
            )}
            <When isTrue={!isCustomerList}>
              {isOrganization && (
                <div className='text-textColor font-normal'>
                  {' • '}
                  {patientObject?.patient_belongs_to === 'ORG_PATIENT' ||
                  patientObject?.patient_belongs_to === 'ASSIGNED_TO_PRACTICE'
                    ? 'by you'
                    : 'by practice'}
                </div>
              )}
              {isPractice && (
                <div className='text-textColor font-normal'>
                  {' • '}
                  {patientObject.patient_belongs_to === 'ASSIGNED_TO_PRACTICE'
                    ? `by ${activeProfile?.owner_organization_name ?? '-'}`
                    : 'by You'}
                </div>
              )}
            </When>
          </div>
        </When>

        <When isTrue={patientListAccessForLabs && !isCustomer && !isCustomerList}>
          <div className='flex items-center gap-2'>
            <CommonSVG svg={SVG_THREE_USER} width='20' />
            <p className='mt-[1px] font-medium'>
              {hasValue(patientObject?.assigned_practice?.name)
                ? patientObject?.assigned_practice?.name
                : '--'}
            </p>
          </div>
        </When>

        <When isTrue={patientListAccessForLabs && !isCustomerList}>
          <div className='flex items-center gap-2'>
            <CommonSVG svg={SVG_ORDER} width='20' />
            <p className='mt-[1px] font-medium'>
              {hasValue(patientObject?.order_count) ? patientObject?.order_count : '--'}
            </p>
          </div>
        </When>

        <When isTrue={!patientListAccessForLabs && !isCustomerList}>
          <div className='flex items-center gap-2'>
            {hasValue(patientObject?.app_invite_status) ? (
              <div className='flex text-sm font-medium items-center gap-1'>
                <div className='font-normal text-textColor'>App invite status:</div>

                <div className=' w-48 truncate ...'>
                  {GetAppInviteStatus({
                    app_invite_status: patientObject?.app_invite_status,
                  })}
                </div>
              </div>
            ) : (
              '-'
            )}
          </div>
        </When>
      </div>
    </div>
  )
}

export default PatientListMobileView
