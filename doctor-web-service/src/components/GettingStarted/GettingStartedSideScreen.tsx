import useAllUserPlan from '@hooks/useAllUserPlan'
import useDispatchAction from '@hooks/useDispatchAction'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {Drawer, Progress} from 'antd'
import CloseIcon from 'assets/icons/CloseIcon'
import clsx from 'clsx'
import AntdButton from 'components/atom/Buttons/AntdButton'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import When from 'components/when/When'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useMediaQuery} from 'react-responsive'
import {useNavigate} from 'react-router-dom'
import {
  getGettingStarted,
  skipGettingStartedStep,
} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import getBrandConfig from 'utils/getBrandConfig'
import {getStorageType} from 'utils/storage'

import {SVG_ARROW_DOWN, SVG_CHECKED_GREEN} from 'utils/SvgConstants'

interface CollapsibleProps {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  checked: boolean
  setIsGettingStartedOpen: (isGettingStartedOpen: boolean) => void
  onSkipClick?: (stepValue: string) => void
  stepValue?: string
}
type GettingStartedSideScreenProps = {
  setIsGettingStartedOpen: (isGettingStartedOpen: boolean) => void
}

const Collapsible = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  checked,
  setIsGettingStartedOpen,
  onSkipClick,
  stepValue,
}: CollapsibleProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const navigate = useNavigate()

  return (
    <div className={clsx('w-full border border-grayDisabled rounded-lg p-4 h-fit')}>
      <div
        className='flex items-center justify-between cursor-pointer'
        onClick={() => {
          if (checked) return
          setIsExpanded(!isExpanded)
        }}
      >
        <div className='flex gap-4 items-center'>
          {!checked && (
            <div className='h-[24px] w-[24px] rounded-full border border-grayDisabled'></div>
          )}
          {checked && <CommonSVG svg={SVG_CHECKED_GREEN} height='24' width='24' />}
          <span className='sm:text-md md:text-lg font-semibold'>{title}</span>
        </div>
        <div className={clsx(!isExpanded && '-rotate-90', checked && 'opacity-40')}>
          <CommonSVG svg={SVG_ARROW_DOWN} height='20' width='20' />
        </div>
      </div>
      {isExpanded && <p className='text-textColor text-sm mb-4'>{subtitle}</p>}
      {isExpanded && (
        <div className='flex gap-2'>
          <AntdButton
            onClick={() => {
              setIsGettingStartedOpen(false)
              navigate(ctaLink)
            }}
            isDisabled={checked}
            text={ctaText}
            className={clsx(
              'border font-semibold ',
              checked
                ? '!bg-lightGray !border-grayDisabled !text-grayDisabled  hover:!bg-lightGray '
                : '!bg-primarySupport !border-primaryColor !text-primaryColor '
            )}
          />
          {onSkipClick && stepValue && (
            <AntdButton
              onClick={() => {
                onSkipClick(stepValue)
              }}
              isDisabled={checked}
              text={'Skip'}
              className={clsx(
                'border font-semibold',
                checked
                  ? '!bg-lightGray !border-grayDisabled !text-grayDisabled  hover:!bg-lightGray '
                  : ' !border-mediumGray !text-textColor hover:!bg-white hover:!text-textColor'
              )}
            />
          )}
        </div>
      )}
    </div>
  )
}
const GettingStartedSideScreen: React.FC<GettingStartedSideScreenProps> = ({
  setIsGettingStartedOpen,
}) => {
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()

  const {gettingStartedData} = useSelector((state: RootState) => state.apiDoctorProfileGet)

  const {patient_added, practice_location_added, user_added, customer_added} = gettingStartedData

  const patientCounts = patient_added ? 1 : 0
  const practiceLocations = practice_location_added ? 1 : 0

  const customersCounts = customer_added ? 1 : 0
  const userCount = user_added ? 1 : 0

  const totalScoreWithoutCustomers = patientCounts + practiceLocations
  const totalScoreWithCustomers = customersCounts + userCount

  const percentWithoutCustomers = totalScoreWithoutCustomers * 50
  const percentWithCustomers = totalScoreWithCustomers * 50

  const {isDesignLabUser, isEnterprisePlanUser} = useAllUserPlan()
  const {permissionChecks} = useFeatureAccess()
  const patientManagementAccess = permissionChecks?.patientManagement?.patientManagement?.isAddable
  useEffect(() => {
    if (percentWithCustomers === 100 || percentWithoutCustomers === 100) {
      setIsGettingStartedOpen(false)
      getStorageType().setItem('isGettingStartedOpen', 'false')
    }
  }, [])

  const onClose = () => {
    getStorageType().setItem('isGettingStartedOpen', 'false')
    setIsGettingStartedOpen(false)
  }

  const onSkipClick = (step: string) => {
    dispatchAction(
      skipGettingStartedStep({
        doctor_id: safeParseInt(userId),
        getting_started_enum: step,
      })
    )
      .unwrap()
      .then(() => {
        dispatchAction(
          getGettingStarted({
            doctor_id: safeParseInt(userId),
          })
        )
      })
  }

  const isMobile = useMediaQuery({query: '(max-width: 768px)'})

  useEffect(() => {
    if (percentWithCustomers === 100) {
      setIsGettingStartedOpen(false)
    }
  }, [])
  return (
    <Drawer
      open={true}
      destroyOnClose={true}
      closeIcon={null}
      rootStyle={{fontFamily: 'figtree'}}
      width={isMobile ? '100%' : 672}
      height={isMobile ? '90vh' : 'auto'}
      styles={{
        body: {
          padding: '0px',
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? '90vh' : 'auto', // Ensure full height usage
        },
        content: {
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          height: '100%', // Fill available space
        },
        wrapper: {
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
        },
        footer: {
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingTop: '10px',
          paddingBottom: '20px',
        },
      }}
      placement={isMobile ? 'bottom' : 'right'}
    >
      <div className='flex flex-col h-full'>
        {/* Header Section */}
        <div className='w-full bg-primaryColor md:rounded-none rounded-t-xl flex flex-col px-4 py-6 gap-2'>
          <button className='cursor-pointer' onClick={onClose}>
            <CloseIcon color='white' />
          </button>

          <div className='text-white text-[24px] font-semibold'>Let's get you started</div>
          <p className='text-white'>Start with your first things on {getBrandConfig().name}.</p>

          <div className='flex gap-4 mt-2'>
            <span className='text-white font-semibold text-lg'>
              {Math.round(
                isDesignLabUser || isEnterprisePlanUser
                  ? percentWithCustomers
                  : percentWithoutCustomers
              )}
              %
            </span>
            <Progress
              percent={
                isDesignLabUser || isEnterprisePlanUser
                  ? percentWithCustomers
                  : percentWithoutCustomers
              }
              showInfo={false}
              trailColor='white'
              strokeColor='#00B383'
              strokeWidth={10}
              className='h-[1rem]'
            />
          </div>
        </div>

        {/* Content Section */}
        <div className='p-4 flex flex-col gap-4 overflow-auto flex-1'>
          <When isTrue={!isDesignLabUser}>
            <Collapsible
              title='Add your practice location'
              subtitle='Add your practice location and link your patient to them'
              ctaText='Add practice location'
              ctaLink='practice-location-list'
              checked={practice_location_added}
              setIsGettingStartedOpen={setIsGettingStartedOpen}
            />
            <When isTrue={patientManagementAccess}>
              <Collapsible
                title='Add a patient'
                subtitle='Add your first patient and get started with tracking'
                ctaText='Add patient'
                ctaLink='/add-patient'
                checked={patient_added}
                setIsGettingStartedOpen={setIsGettingStartedOpen}
              />
            </When>
          </When>

          <When isTrue={isDesignLabUser}>
            <Collapsible
              title='Invite users'
              subtitle='Invite team members to plan and manage cases.'
              ctaText='Add user'
              ctaLink='/add-access-control-user'
              checked={user_added}
              setIsGettingStartedOpen={setIsGettingStartedOpen}
              onSkipClick={onSkipClick}
              stepValue='NEW_USER_ADDED'
            />
            <Collapsible
              title='Add customers'
              subtitle='Invite and connect with customers to start receiving orders.'
              ctaText='Add customer'
              ctaLink='/customers-add'
              checked={customer_added}
              setIsGettingStartedOpen={setIsGettingStartedOpen}
            />
          </When>
        </div>
      </div>
    </Drawer>
  )
}

export default GettingStartedSideScreen
