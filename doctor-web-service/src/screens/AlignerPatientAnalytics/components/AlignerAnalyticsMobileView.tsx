import {DefaultImage} from 'assets/images/Images/DefaultImage'
import {Image} from 'assets/images/Images/Image'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import When from 'components/when/When'
import {useNavigate} from 'react-router-dom'
import {SVG_HOSPITAL_NEW} from 'utils/SvgConstants'
import hasValue from 'utils/hasValue'
import GetCompilance from './GetCompilance'
import {RowData} from '../types/alignerPatientAnalytics.types'
import FirstAidDashboardIcon from 'assets/icons/FirstAidDashboardIcon'
import clsx from 'clsx'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {getImageUrl, getImageUrlById} from 'utils/ConstFunctions'

const AlignerAnalyticsMobileView = ({patientObject}: {patientObject: RowData}) => {
  const navigation = useNavigate()
  const {isOrganization, isDesignLabUser, isVendor} = useAllUserPlan()
  const countryCode = hasValue(patientObject.country_code) && patientObject.country_code
  const mobile = hasValue(patientObject.mobile) ? patientObject.mobile : null
  const mobileNumber = mobile ? `• ${countryCode ?? ''} ${mobile ?? ''}` : ''
  const {permissionChecks} = useFeatureAccess()
  const practicePermissions =
    permissionChecks?.customerManagement?.customerManagement?.isEditable ?? false
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

  const profile_url = patientObject.patient_profile_image_id
    ? getImageUrlById(patientObject.patient_profile_image_id)
    : patientObject.patient_profile_url
  return (
    <div
      className='border border-mediumGray rounded-lg p-4 w-full mb-4 cursor-pointer'
      onClick={() => {
        navigation(`/profile/${patientObject.patient_id}`)
      }}
    >
      <div
        className={clsx(
          'w-full pb-4 border-b border-mediumGray flex  justify-between',
          practicePermissions ? 'flex-col items-start gap-3' : 'items-center'
        )}
      >
        <div className='flex gap-3 items-center max-w-[60%]'>
          {profile_url ? (
            <Image
              className='w-11 h-11 object-cover rounded-full'
              src={
                patientObject.patient_profile_image_id
                  ? profile_url
                  : getImageUrl({
                      url: patientObject.patient_profile_url,
                      is_gdrive_platform:
                        patientObject.patient_profile_url.includes('patient/drive/image/'),
                      drive_file_id: patientObject.patient_profile_url.match(
                        /patient\/drive\/image\/([^/?#]+)/
                      )?.[1],
                    }) || patientObject.patient_profile_url
              }
            />
          ) : (
            <DefaultImage letter={patientObject.patient_full_name.charAt(0)} />
          )}
          <div className='flex flex-col overflow-hidden'>
            <span className='font-semibold truncate text-sm text-black'>
              {patientObject.patient_full_name}
            </span>
            <When isTrue={isAssessButtonBasedOnRole(patientObject.patient_belongs_to)}>
              <span className='truncate text-xs text-gray-500'>
                {patientObject.customer_mapped_id}
              </span>
            </When>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {patientObject.aligner_updates === 0 ? (
            <>
              <div className='w-2 h-2 bg-tertiaryColor rounded-full'></div>
              <div className='text-tertiaryColor font-semibold text-sm'>Completed</div>
            </>
          ) : (
            <>
              <div className='w-2 h-2 bg-orange rounded-full'></div>
              <div className='text-orange font-semibold text-sm'>
                {patientObject.aligner_updates} Pending
              </div>
            </>
          )}
        </div>
      </div>

      <When isTrue={!practicePermissions}>
        {hasValue(patientObject.email || mobileNumber) && (
          <div className='flex gap-1 border-b border-mediumGray py-4'>
            <div className='flex gap-1  text-sm font-medium'>
              {patientObject?.email?.toLocaleLowerCase()}
            </div>

            <div className='flex gap-1  text-sm font-medium'>{mobileNumber}</div>
          </div>
        )}
      </When>
      <div className='mt-4 flex flex-col gap-2'>
        <When isTrue={!practicePermissions}>
          <div className='flex items-center gap-2'>
            <CommonSVG svg={SVG_HOSPITAL_NEW} width='18' />
            <span className='text-sm font-medium'>
              {hasValue(patientObject.practice_location) ? patientObject.practice_location : '--'}
            </span>
          </div>
        </When>
        <When isTrue={practicePermissions}>
          <div className='flex items-center gap-2'>
            <FirstAidDashboardIcon />
            <span className='text-sm font-medium'>
              {hasValue(patientObject.assigned_practice) ? patientObject.assigned_practice : '--'}
            </span>
          </div>
        </When>
        <div className='flex gap-2 items-center'>
          <div className='flex gap-2 items-center'>
            <div className='text-sm font-medium text-textColor'>Current aligner:</div>
            <div className='text-xs font-medium'>
              {patientObject?.current_aligner_jaw_type} {patientObject?.current_aligner}
            </div>
          </div>
          <div className='text-xs font-semibold text-textColor'>
            Total {patientObject?.total_aligners}
          </div>
        </div>
        <div>
          {patientObject?.compliance ? (
            <div className='flex text-sm font-medium items-center gap-2'>
              <div className='font-normal text-textColor'>Compliance:</div>
              <GetCompilance app_invite_status={patientObject?.compliance} />
            </div>
          ) : (
            '-'
          )}
        </div>
      </div>
    </div>
  )
}

export default AlignerAnalyticsMobileView
