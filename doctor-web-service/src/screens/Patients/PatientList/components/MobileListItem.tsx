import productTypes from '@constants/productTypes'
import useActiveProfile from '@hooks/useActiveProfile'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import {Image} from 'assets/images/Images/Image'
import clsx from 'clsx'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import Tag from 'components/tags/Tag'
import When from 'components/when/When'
import {useNavigate} from 'react-router-dom'
import {SVG_HOSPITAL_NEW, SVG_USER_CHECK} from 'utils/SvgConstants'
import hasValue from 'utils/hasValue'
import FirstAidKit from 'assets/icons/FirstAidKit'
import DropDownOutline from 'assets/icons/DropDownOutline'
import getColorPalette from 'utils/getColorPalette'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import GetAppInviteStatus from './GetAppInviteStatus'
import useAllUserPlan from '@hooks/useAllUserPlan'
import AssignPracticeButton from 'screens/Patients/LeadsProfile/leftPanel/AssignPracticeButton'
import {PatientBelongsTo} from '../types/patientsList.types'
import useProfileBasePath from '@hooks/useProfileBasePath'

interface MobileListItemInterface {
  profile_image?: any
  patient_name?: string
  treatment_types?: ('ALIGNERS' | 'BRACES' | 'UNASSIGNED')[]
  mobile_number?: string
  clinic_name?: string
  date?: string
  patient_id: number
  patient_type: 'ACTIVE' | 'ARCHIVE'
  is_your_patient: boolean
  patient_belongs_to: PatientBelongsTo
  setPatientId?: (patientId: number) => void
  activeList: boolean
  assigned_practice: string | null
  app_invite_status: string
  treatment_stage: string
}

const MobileListItem = ({
  profile_image,
  patient_name = '',
  treatment_types = [] as (keyof typeof productTypes)[],
  mobile_number = '',
  clinic_name = '',
  date = '',
  patient_id,
  patient_type,
  is_your_patient,
  patient_belongs_to,
  assigned_practice,
  app_invite_status,
  treatment_stage,
}: MobileListItemInterface) => {
  const {activeProfile} = useActiveProfile()

  const {isOrganization, isPractice, isAlignerCompanyOrg} = useAllUserPlan()
  const navigation = useNavigate()
  const profileBasePath = useProfileBasePath()
  const isAssessButtonBasedOnRole = (patient_belongs_to: string) => {
    const access =
      (patient_belongs_to === 'ORG_PATIENT' && isOrganization) ||
      (patient_belongs_to === 'ASSIGNED_TO_PRACTICE' && !isOrganization) ||
      (patient_belongs_to === 'ORTHODONTIC_PATIENT' && !isOrganization)

    return access
  }
  return (
    <div
      className='border border-mediumGray rounded-lg p-4 w-full mb-4 cursor-pointer'
      onClick={() => {
        if (patient_type === 'ACTIVE') {
          navigation(`${profileBasePath}/${patient_id}`)
        } else {
          navigation(`/leads-profile/${patient_id}/files`)
        }
      }}
    >
      <div className='pb-4 border-b border-mediumGray flex items-center gap-4 w-full'>
        {hasValue(profile_image) ? (
          <Image className='w-11 h-11 object-cover rounded-full' src={profile_image} />
        ) : (
          <DefaultImage letter={patient_name.charAt(0)} />
        )}
        <div className='flex flex-col gap-1 w-full overflow-hidden'>
          <div className='w-full flex items-center justify-between '>
            <span className='font-semibold truncate max-w-[70%]'>
              <div>{patient_name}</div>
              <When isTrue={patient_belongs_to !== 'ASSIGNED_TO_PRACTICE'}>
                <div className='flex gap-1 text-sm font-medium'>
                  {hasValue(mobile_number) ? mobile_number : '--'}
                </div>
              </When>
            </span>
            <span className='flex gap-2 items-center justify-center'>
              {treatment_types.map((type) => {
                return (
                  <Tag
                    key={type}
                    className={clsx(
                      'text-sm font-medium w-fit',
                      type === 'ALIGNERS' && 'text-primaryColor bg-primarySupport',
                      type === 'BRACES' && 'text-secondaryColor bg-secondarySupport',
                      type === 'UNASSIGNED' && 'hidden'
                    )}
                    value={type === 'ALIGNERS' ? 'Aligners' : 'Braces'}
                  />
                )
              })}
            </span>
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-2 mt-3'>
        {isOrganization && (
          <div className='flex items-center gap-2'>
            <FirstAidKit color={'#666666'} width='20' />
            <AssignPracticeButton
              patientBelongsTo={patient_belongs_to}
              practiceName={assigned_practice}
            />
          </div>
        )}
        <div className='flex items-center gap-2'>
          <CommonSVG svg={SVG_HOSPITAL_NEW} width='20' />
          <span className='text-sm font-medium truncate ...'>{clinic_name ?? '--'}</span>
        </div>

        <div className='flex items-center gap-2 flex-wrap'>
          <CommonSVG svg={SVG_USER_CHECK} width='20' />

          <span className='text-sm font-medium'>
            {patient_type === 'ACTIVE' ? 'Added on' : 'Archived on'}
          </span>
          <span className='text-sm font-medium '>{date}</span>
          {isOrganization && (
            <div className='text-textColor font-normal'>
              {' • '} {is_your_patient ? 'by you' : 'by practice'}
            </div>
          )}
          {isPractice && (
            <div className='text-textColor font-normal'>
              {' • '}
              {is_your_patient ? 'by you' : `by ${activeProfile?.owner_organization_name ?? '--'}`}
            </div>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <p className='font-medium text-textColor'>App invite status: </p>
          <p>
            <GetAppInviteStatus app_invite_status={app_invite_status} patientId={patient_id} />
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <p className='font-medium text-textColor'>Treatment stage: </p>
          <When isTrue={treatment_stage === 'ASSESSMENT'}>
            <div className='text-sm font-medium'>In Assessment</div>
          </When>
          <When isTrue={treatment_stage === 'IN_PLANNING'}>
            <div className='text-sm font-medium'>In Planning</div>
            <button
              className='flex gap-2 items-center text-primaryColor font-semibold'
              onClick={(e) => {
                e.stopPropagation()

                navigation(`${profileBasePath}/${patient_id}/plans-list`)
              }}
            >
              <div>Set up</div>
              <div className='-rotate-90'>
                <DropDownOutline color={getColorPalette().primaryColor} />
              </div>
            </button>
          </When>
          <When isTrue={treatment_stage === 'ADD_TRACKING'}>
            <div className='text-sm font-medium'>Tracking Pending</div>
            <When
              isTrue={
                isAssessButtonBasedOnRole(patient_belongs_to) && !isPractice && !isAlignerCompanyOrg
              }
            >
              <button
                className='flex gap-2 items-center text-primaryColor font-semibold'
                onClick={(e) => {
                  e.stopPropagation()
                  if (
                    treatment_types.some(
                      (product_type: string) => product_type === treatmentTypeMain.BRACES
                    )
                  ) {
                    navigation(`${profileBasePath}/${patient_id}`)
                  } else {
                    navigation(`${profileBasePath}/${patient_id}/aligner-tracking`)
                  }
                }}
              >
                <div>Add tracking</div>
                <div className='-rotate-90'>
                  <DropDownOutline color={getColorPalette().primaryColor} />
                </div>
              </button>
            </When>
          </When>
        </div>
      </div>
    </div>
  )
}

export default MobileListItem
