import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Image} from '../../../../assets/images/Images/Image'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import * as Yup from 'yup'
import {
  SVG_BLUE_EMAIL,
  SVG_BLUE_IDENTIFICATION,
  SVG_BLUE_MOBILE,
  SVG_CLINIC_GRAY,
  SVG_LOCATION_MAP_PIN,
  SVG_LOCATION_MAP_PIN_GRAY,
  SVG_PROFILE_EMAIL,
  SVG_PROFILE_PHONE,
} from 'utils/SvgConstants'
import hasValue from 'utils/hasValue'
import {useContext, useState} from 'react'
import {
  ERROR_MAIL_FORMAT,
  ERROR_MAX_255_CHAR,
  ERROR_MIN_5_CHAR,
  ERROR_MOBILE_FORMAT,
} from 'utils/MessageConstant'
import defaultCountyCode from '@constants/defaultCountyCode'
import {
  capitalizeFirstLetter,
  cropPracticeLocationName,
  emailRegex,
  getImageUrlById,
} from 'utils/ConstFunctions'
import When from 'components/when/When'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import clsx from 'clsx'
import InviteSection from './InviteSection'
import {specialCharacters} from 'utils/ConstantValidations'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {AuthContext} from 'context/AuthContext'
import getPatientAssignedTo from '@utils/getPatientAssignedTo'
import {Collapse} from 'antd'
import ExpandIcon from 'screens/Patients/PatientProfile/Tabs/components/ExpandIcon'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import cn from '@utils/cn'
import useAllUserPlan from '@hooks/useAllUserPlan'
import AssignPracticeButton from './AssignPracticeButton'

const PatientDetailItem = ({
  svg,
  title,
  value,
  iconHeight,
  className,
  icon,
}: {
  svg?: any
  title?: string | null
  value: React.ReactNode | null
  iconHeight?: string
  className?: string
  icon?: React.ReactNode
}) => {
  const emptyText = title === 'Practice Location' ? 'Not assigned' : 'Not added'
  return (
    <div className='flex gap-2 items-center min-w-0'>
      <When isTrue={!hasValue(icon)}>
        <CommonSVG width='28' svg={svg} className={clsx('hidden md:block min-w-7', className)} />
        <CommonSVG height={iconHeight || '28'} width='28' svg={svg} className='md:hidden' />
      </When>
      <When isTrue={hasValue(icon)}>{icon}</When>
      <div className='flex flex-col gap-0 min-w-0 flex-1 overflow-hidden'>
        <div className='text-sm md:text-textColor font-medium truncate'>
          {hasValue(value) ? value : emptyText}
        </div>
        <div className='text-xs text-textColor font-normal hidden md:block'>{title}</div>
      </div>
    </div>
  )
}

export const schemaForEditPatientDetails = (countryCode: string) => {
  return Yup.object().shape({
    firstName: Yup.string()
      .max(100, 'Please enter a first name with less than 100 characters.')
      .matches(specialCharacters, 'Please enter a valid first name')
      .required('Please enter a valid name')
      .test('no-only-spaces', 'Please enter a valid first name', (value) => {
        return !!value && value.trim() !== ''
      }),
    lastName: Yup.string()
      .max(100, 'Please enter a last name with less than 100 characters.')
      .matches(specialCharacters, 'Please enter a valid last name')
      .optional(),
    mobileNumber: Yup.string()
      .min(
        countryCode === defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA ? 10 : 7,
        ERROR_MOBILE_FORMAT
      )
      .max(
        countryCode === defaultCountyCode.DEFAULT_COUNTRY_CODE_INDIA ? 10 : 11,
        ERROR_MOBILE_FORMAT
      )
      .matches(/^[0-9]{10,11}$/, ERROR_MOBILE_FORMAT)
      .optional(),
    email: Yup.string()
      .optional()
      .min(5, ERROR_MIN_5_CHAR)
      .matches(
        /^[A-Za-z0-9][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}$/,
        'Please enter a valid email ID'
      )
      .matches(emailRegex, 'Please enter a valid email ID')
      .max(255, ERROR_MAX_255_CHAR)
      .email(ERROR_MAIL_FORMAT),
    practiceLocation: Yup.string().optional(),
  })
}

const NAME_CHAR_LIMIT = 18
function getTruncatedName(firstName: string, lastName: string, limit: number) {
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  if (fullName.length > limit) {
    return fullName.slice(0, limit) + '...'
  }
  return fullName
}

const PatientDetails = () => {
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const patientData = data.patient_details
  const {profileId} = useContext(AuthContext)
  const {isDesignLabUser, isCustomer, isVendor, isPractice, isOrganization} = useAllUserPlan()
  const {isProfessionalPlanUser, isGrowthPlanUser, isStarterPlanUser} = useAllUserPlan()
  const {permissionChecks} = useFeatureAccess()
  const patientAssignedTo = getPatientAssignedTo(profileId, patientData)
  const isVisible = isProfessionalPlanUser || isGrowthPlanUser || isStarterPlanUser
  const patientConnectionStatusControl =
    permissionChecks.patientManagement?.patientConnectionStatus?.isViewable

  const {subscriptionData} = useSubscriptionDetails()
  const planName = subscriptionData?.plan_metadata?.plan_name
  const isGrowthPlan = planName === 'GROWTH'
  const hasContentToShow = () => {
    const isNotRestrictedUser =
      (!isDesignLabUser && !isCustomer && !isVendor && !isOrganization) || isGrowthPlan
    const isNotAssignedToPractice = patientAssignedTo !== 'ASSIGNED_TO_PRACTICE'

    return isNotRestrictedUser && isNotAssignedToPractice
  }
  const [activeKey, setActiveKey] = useState<string | string[]>(hasContentToShow() ? '1' : [])
  const isExpanded = activeKey === '1' || (Array.isArray(activeKey) && activeKey.includes('1'))
  const url = patientData?.profile_image_id
    ? getImageUrlById(patientData?.profile_image_id)
    : patientData?.profile_picture_url
  const renderPatientHeader = () => (
    <div className='flex flex-wrap gap-2 items-center pb-3 w-full min-w-0'>
      <When isTrue={isVisible || patientAssignedTo === 'ASSIGNED_TO_ME'}>
        {hasValue(url) ? (
          <Image
            className='min-w-11 min-h-11 w-11 h-11 max-w-11 max-h-11 object-cover rounded-full'
            src={url ?? ''}
          />
        ) : (
          <DefaultImage
            letter={patientData?.first_name.charAt(0)}
            className='border-mediumGray bg-lightGray text-textColor'
          />
        )}
      </When>
      <div className='flex flex-col gap-0 min-w-0 flex-1'>
        <div
          className={
            'text-xl text-black font-bold min-w-0 ' + (isExpanded ? 'text-wrap break-all' : '')
          }
        >
          {isExpanded
            ? [patientData?.first_name, patientData?.last_name].filter(Boolean).join(' ')
            : getTruncatedName(
                patientData?.first_name || '',
                patientData?.last_name || '',
                NAME_CHAR_LIMIT
              )}
        </div>
        <div className='text-textColor text-sm font-medium truncate min-w-0'>
          ID: #{patientData?.uuid}
        </div>
        <div className='text-textColor text-sm font-medium truncate'>
          <When isTrue={hasValue(patientData?.gender || patientData?.age)}>
            <span>
              {patientData?.gender === 'OTHER'
                ? 'Prefer not to say'
                : capitalizeFirstLetter(patientData?.gender, false)}
              <When
                isTrue={hasValue(patientData?.gender) && hasValue(patientData?.age) && isVisible}
              >
                <span> | </span>
              </When>
              <When isTrue={hasValue(patientData?.age) && isVisible}>
                <span className='truncate'>{patientData?.age} years</span>
              </When>
            </span>
          </When>
          <When isTrue={!hasValue(patientData?.gender) && !hasValue(patientData?.age)}>
            <span>--</span>
          </When>
        </div>
        <span className='truncate text-textColor text-sm font-medium text-wrap'>
          <AssignPracticeButton
            patientBelongsTo={patientData?.patient_belongs_to}
            practiceName={patientData?.assigned_practice?.name}
          />
        </span>

        <When isTrue={isVisible || isPractice}>
          <span
            className={cn(
              ' text-textColor text-sm font-medium',
              isExpanded ? 'text-wrap break-all' : 'truncate '
            )}
          >
            {patientData?.practice_location
              ? patientData?.practice_location.slice(0, 24) + '...'
              : ''}
          </span>
        </When>
      </div>
    </div>
  )
  const renderPatientDetails = () => (
    <>
      <When
        isTrue={(!isDesignLabUser && !isCustomer && !isVendor && !isOrganization) || isGrowthPlan}
      >
        <div className={clsx('flex-col gap-2 justify-center pb-4 hidden md:flex')}>
          <When isTrue={patientAssignedTo !== 'ASSIGNED_TO_PRACTICE'}>
            <PatientDetailItem svg={SVG_BLUE_EMAIL} title={'Email'} value={patientData?.email} />
            <When isTrue={isVisible || patientAssignedTo === 'ASSIGNED_TO_ME'}>
              <PatientDetailItem
                svg={SVG_BLUE_IDENTIFICATION}
                title={'Patient ID'}
                className='bg-secondarySupport p-[2px] rounded'
                value={
                  hasValue(patientData?.customer_mapped_id) ? patientData?.customer_mapped_id : null
                }
              />
            </When>
            <PatientDetailItem
              svg={SVG_BLUE_MOBILE}
              title={'Mobile'}
              value={
                hasValue(patientData?.mobile)
                  ? patientData?.country_code + ' ' + patientData?.mobile
                  : null
              }
            />
            <PatientDetailItem
              title={'Location'}
              svg={SVG_LOCATION_MAP_PIN}
              value={
                `${hasValue(patientData?.city) ? patientData.city : '--'}, ` +
                `${hasValue(patientData?.state) ? patientData.state : '--'}, ` +
                `${hasValue(patientData?.country) ? patientData.country : '--'}`
              }
            />
          </When>
        </div>
      </When>

      {/* Mobile design Start--------------------------------------------------------------> */}
      <div className={clsx('flex flex-col gap-2 justify-center pb-4 md:hidden')}>
        <When isTrue={patientAssignedTo !== 'ASSIGNED_TO_PRACTICE'}>
          <PatientDetailItem svg={SVG_PROFILE_EMAIL} title={'Email'} value={patientData?.email} />
          <PatientDetailItem
            svg={SVG_PROFILE_PHONE}
            iconHeight='24'
            value={
              hasValue(patientData?.mobile)
                ? patientData?.country_code + ' ' + patientData?.mobile
                : null
            }
          />
          <PatientDetailItem
            svg={SVG_CLINIC_GRAY}
            value={
              isExpanded
                ? patientData?.practice_location
                : cropPracticeLocationName(patientData?.practice_location)
            }
          />
          <PatientDetailItem
            title={'Location'}
            svg={SVG_LOCATION_MAP_PIN_GRAY}
            value={
              `${hasValue(patientData?.city) ? patientData.city : '--'}, ` +
              `${hasValue(patientData?.state) ? patientData.state : '--'}, ` +
              `${hasValue(patientData?.country) ? patientData.country : '--'}`
            }
          />
        </When>
      </div>

      {/* Mobile design End--------------------------------------------------------------> */}
      <When isTrue={patientAssignedTo !== 'ASSIGNED_TO_PRACTICE' && patientConnectionStatusControl}>
        <div className={clsx('flex-[5] flex flex-col gap-2 justify-center md:hidden')}>
          <InviteSection
            connectionStatus={data?.invitation_details}
            connectionDate={data?.patient_details?.connection_date}
          />
        </div>
      </When>
    </>
  )

  return (
    <>
      <Collapse
        collapsible={hasContentToShow() ? 'header' : 'icon'}
        className='bg-transparent rounded-lg'
        expandIcon={({isActive}) =>
          hasContentToShow() ? <ExpandIcon isActive={isActive} /> : null
        }
        expandIconPosition='end'
        activeKey={activeKey}
        onChange={setActiveKey}
        items={[
          {
            key: '1',
            label: renderPatientHeader(),
            children: hasContentToShow() ? renderPatientDetails() : null,
            className: 'border-none',
          },
        ]}
      />
    </>
  )
}

export default PatientDetails
