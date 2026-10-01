import {DefaultImage} from 'assets/images/Images/DefaultImage'
import {Image} from 'assets/images/Images/Image'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import When from 'components/when/When'
import {useNavigate} from 'react-router-dom'
import {SVG_HOSPITAL_NEW, SVG_USER_CHECK} from 'utils/SvgConstants'
import hasValue from 'utils/hasValue'
import moment from 'moment'
import useActiveProfile from '@hooks/useActiveProfile'
import GetAppInviteStatus from './GetAppInviteStatus'
import {ArchivePatient} from '../types/patientsList.types'
import DropDownOutline from 'assets/icons/DropDownOutline'
import getColorPalette from 'utils/getColorPalette'
import useAllUserPlan from '@hooks/useAllUserPlan'

const ArchivePatientListMobileView: React.FC<ArchivePatient> = (patientObject) => {
  const navigation = useNavigate()
  const {activeProfile} = useActiveProfile()
  const {isOrganization, isPractice, isStarterPlanUser} = useAllUserPlan()
  const countryCode = hasValue(patientObject.country_code) && patientObject.country_code
  const mobile = hasValue(patientObject.mobile) ? patientObject.mobile : null
  const mobileNumber = mobile ? countryCode + ' ' + mobile : '--'

  return (
    <div
      className='border border-mediumGray rounded-lg p-4 w-full mb-4 cursor-pointer'
      onClick={() => {
        navigation(`/leads-profile/${patientObject.patient_id}`)
      }}
    >
      <div className='pb-4 border-b border-mediumGray flex items-center justify-between gap-4 w-full'>
        <div className='flex gap-3 items-center w-full'>
          {hasValue(patientObject.profile_image) && patientObject.profile_image !== null ? (
            <Image
              className='w-11 h-11 object-cover rounded-full'
              src={patientObject.profile_image}
            />
          ) : (
            <DefaultImage letter={patientObject.first_name.charAt(0)} />
          )}
          <div className='flex flex-col gap-1 w-full overflow-hidden'>
            <div className='w-full'>
              <span className='font-semibold truncate max-w-[70%]'>
                {patientObject.first_name} {patientObject.last_name ?? ''}
              </span>
            </div>
          </div>
        </div>
      </div>
      <When
        isTrue={
          (isOrganization && patientObject.patient_belongs_to === 'ORG_PATIENT') ||
          isStarterPlanUser ||
          isPractice
        }
      >
        <div className='flex gap-1 border-b border-mediumGray py-4'>
          <div className='flex gap-1  text-sm font-medium'>{patientObject?.email}</div>
          {'•'}
          <div className='flex gap-1  text-sm font-medium'>{mobileNumber}</div>
        </div>
      </When>
      <div className='mt-4 flex flex-col gap-2'>
        <When
          isTrue={
            (isOrganization && patientObject.patient_belongs_to === 'ORG_PATIENT') ||
            isStarterPlanUser ||
            isPractice
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
        <div className='flex items-center gap-2'>
          <CommonSVG svg={SVG_USER_CHECK} width='20' />
          <p className='mt-[1px] font-medium'>
            Added on{' '}
            {hasValue(patientObject?.archived_at)
              ? moment(patientObject?.archived_at).format('DD-MMM-YYYY')
              : '--'}
          </p>
          {isOrganization && (
            <div className='text-textColor font-normal'>
              {' • '}
              {patientObject?.patient_belongs_to === 'ORG_PATIENT' ? 'by you' : 'by practice'}
            </div>
          )}
          {isPractice && (
            <div className='text-textColor font-normal'>
              {' • '}
              {patientObject?.patient_belongs_to === 'ORTHODONTIC_PATIENT'
                ? 'by you'
                : (activeProfile?.owner_organization_name ?? '--')}
            </div>
          )}
        </div>

        <div className='flex items-center gap-2'>
          {hasValue(patientObject?.app_invite_status) ? (
            <div className='flex text-sm font-medium items-center gap-1'>
              <div className='font-normal text-textColor'>App invite status:</div>

              <div className=' w-48 truncate ...'>
                {GetAppInviteStatus({
                  app_invite_status: patientObject?.app_invite_status,
                  patientId: patientObject.patient_id,
                })}
              </div>
            </div>
          ) : (
            '-'
          )}
        </div>
        <div className='flex items-center gap-2'>
          {hasValue(patientObject?.treatment_stage) ? (
            <div className='flex text-sm font-medium items-center gap-1'>
              <div className='font-normal text-textColor'>Treatment stage:</div>

              <div className=' w-48 truncate ...'>
                <div className='flex justify-between items-center w-full  '>
                  <div className='flex gap-2 justify-between items-center text-sm min-w-[130px]'>
                    <div>
                      <When isTrue={patientObject?.treatment_stage === 'ASSESSMENT'}>
                        <div className='text-sm font-medium'>In Assessment</div>
                      </When>
                      <When isTrue={patientObject?.treatment_stage === 'IN_PLANNING'}>
                        <div className='text-sm font-medium'>In Planning</div>
                        <button
                          className='flex gap-2 items-center text-primaryColor font-semibold'
                          onClick={(e) => {
                            e.stopPropagation()
                            navigation(`/leads-profile/${patientObject?.patient_id}/treatment`)
                          }}
                        >
                          <div>Set up</div>
                          <div className='-rotate-90'>
                            <DropDownOutline color={getColorPalette().primaryColor} />
                          </div>
                        </button>
                      </When>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            '-'
          )}
        </div>
      </div>
    </div>
  )
}

export default ArchivePatientListMobileView
