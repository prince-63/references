import trackingTypes from '@constants/trackingTypes'
import useDispatchAction from '@hooks/useDispatchAction'
import trackingMethodFeatures from '@staticData/trackingMethodFeatures'
import CrownIcon from 'assets/icons/CrownIcon'
import Page from 'components/page/Page'
import AntdButton from 'components/atom/Buttons/AntdButton'
import When from 'components/when/When'
import {useContext, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {RootState} from 'redux/store'
import hasValue from 'utils/hasValue'
import OverviewPrompt from '../../overview/components/TrackingNotActivePrompt'
import userTypes from '@constants/userTypes'
import trackingMethodTagTypes from '@constants/trackingMethodTagTypes'

import {
  getTrackingDetails,
  handlePostTrackingDetails,
  postTrackingDetails,
} from 'redux/Slices/AppSlice/LeadsProfile/Tracking.slice'
import {TrackingAddingPayload} from './types/tracking.types'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import {getApiLeadsOverview} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import {AxiosError} from 'axios'
import UpgradePlanModal from 'components/subscription/modals/UpgradePlanModal'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import isPlanExpired from '@utils/isPlanExpired'
import getSubscriptionAlerts from '@utils/getSubscriptionAlerts'
import moment from 'moment'
import ModalUpgradeConfirm from 'components/modal/LeadsProfile/Tracking/ModalUpgradeConfirm'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import FinalizeTrackingConfirmModal from './FinalizeTrackingConfirmModal'
import {getApiDataDoctorProfile} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'

const ListItem = ({
  label,
  value,
  valueSubscript,
}: {
  label: string
  value: string
  valueSubscript?: string
}) => {
  return (
    <div className='flex flex-col md:flex-row w-full justify-between'>
      <span className='text-textColor text-[16px] font-[500]'>{label}</span>
      <When isTrue={hasValue(value)}>
        <div className='flex flex-col'>
          <span className='text-black text-[16px] font-semibold'>{value}</span>
          <span className='text-sm text-textColor'>{valueSubscript}</span>
        </div>
      </When>
      <When isTrue={!hasValue(value)}>
        <span className='text-[#BE8901] text-[16px] font-semibold'>
          {'Awaiting data from patient'}
        </span>
      </When>
    </div>
  )
}

const ReviewTrackingDetails = () => {
  const {patientId} = useParams()
  const {dispatchAction} = useDispatchAction()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {userId}: any = useContext(AuthContext)
  const [loadingSaveForLater, setLoadingSaveForLater] = useState<boolean>(false)
  const [searchParams] = useSearchParams()
  const isNew = searchParams.get('new') === 'true'
  const isView = searchParams.get('view') === 'true'
  const isPatientFilledData = searchParams.get('isPatientFilledData') === 'true'
  const isPatientFillingData = searchParams.get('isPatientFillingData') === 'true'
  const isDraft = searchParams.get('isDraft') === 'true'
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const [isModalUpgradeOpen, setIsModalUpgradeOpen] = useState(false)

  const {dataGetTrackingDetails, loadingGetTrackingDetails, loadingPostTrackingDetails} =
    useSelector((state: RootState) => state.tracking)
  const isUpdatableTracking =
    dataLeadsOverview?.tracking?.status === trackingMethodTagTypes.ACTIVE ||
    dataLeadsOverview?.tracking?.status === trackingMethodTagTypes.DRAFT
  const {loadingSubscriptionData, subscriptionData} = useSubscriptionDetails()
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false)
  const subscriptionAlerts = getSubscriptionAlerts({subscriptionData})

  const [payload, setPayload] = useState<TrackingAddingPayload>({
    tracking_type: dataGetTrackingDetails?.tracking_type,
    current_aligner_details: {
      number: dataGetTrackingDetails?.current_aligner_details?.number,
      start_date: dataGetTrackingDetails?.current_aligner_details?.start_date,
      end_date: dataGetTrackingDetails?.current_aligner_details?.end_date,
    },
    user_type: userTypes.DOCTOR,
    pricing: 0,
    status: status,
    aligner_treatment_plan_id: safeParseInt(dataGetTrackingDetails?.treatment_plan_id),
    doctor_name: '',
    ask_to_patient_fill: dataGetTrackingDetails?.ask_patient_to_fill,
    treatment_updating: isUpdatableTracking ? true : false,
  })

  const callFinalizeTracking = async (status: 'DRAFT' | 'ACTIVE') => {
    if (isPlanExpired(subscriptionData) || subscriptionAlerts.patients.error) {
      setIsUpgradeModalOpen(true)
      return
    }
    if (status === 'ACTIVE') {
      setPayload({...payload, status: 'ACTIVE'})
      setIsFinalizeModalOpen(true)
    } else {
      setLoadingSaveForLater(true)
      await dispatchAction(postTrackingDetails({...payload, status: 'DRAFT'}))
        .unwrap()
        .then(async () => {
          dispatchAction(getApiDataDoctorProfile({doctor_id: safeParseInt(userId)}))
          dispatchAction(
            getTrackingDetails({
              patient_id: String(patientId),
              doctor_id: safeParseInt(userId),
              treatment_subtype: treatmentTypeMain.ALIGNERS,
            })
          )
            .unwrap()
            .then(async () => {
              dispatchAction(
                getApiLeadsOverview({
                  data: {
                    patient_id: safeParseInt(patientId),
                    doctor_id: safeParseInt(userId),
                  },
                })
              )
              dispatchAction(
                getLeadsProfileDetails({
                  patient_id: safeParseInt(patientId),
                  doctor_id: safeParseInt(userId),
                })
              )
              dispatch(handlePostTrackingDetails(null))
              navigate(`${profileBasePath}/${patientId}/aligner-tracking`)
            })
            .catch((error: AxiosError) => {
              console.error(error)
              setLoadingSaveForLater(false)
            })
        })
        .catch((error: AxiosError) => {
          console.error(error)
        })
    }
  }

  const handleEditButtonClick = () => {
    const queryParams = new URLSearchParams({
      new: 'false',
      edit: 'true',
    }).toString()
    navigate(`${profileBasePath}/${patientId}/aligner-tracking?${queryParams}`)
  }

  useEffect(() => {
    if (hasValue(dataGetTrackingDetails)) {
      handlePostTrackingDetails(dataGetTrackingDetails)
    }
    if (isNew && !hasValue(dataGetTrackingDetails)) {
      navigate(`${profileBasePath}/${patientId}/plans-list`)
    }
  }, [])

  const handleTakeMeThereClick = () => {
    const queryParams = new URLSearchParams({
      new: 'false',
    }).toString()
    navigate(`${profileBasePath}/${patientId}/aligner-tracking?${queryParams}`)
  }

  return (
    <div className='flex flex-col gap-8 w-full'>
      <When isTrue={isModalUpgradeOpen}>
        <ModalUpgradeConfirm setIsModalUpgradeOpen={setIsModalUpgradeOpen} />
      </When>

      <When isTrue={isFinalizeModalOpen}>
        <FinalizeTrackingConfirmModal
          payload={payload}
          setIsFinalizeModalOpen={setIsFinalizeModalOpen}
        />
      </When>
      <Page
        title='Tracking Method details'
        showBorder={false}
        loading={loadingGetTrackingDetails || loadingSubscriptionData}
        showBackButton={true}
        backNavigationRoute={
          isNew
            ? `${profileBasePath}/${patientId}/plans-list`
            : `${profileBasePath}/${patientId}/plans-list`
        }
      >
        <When isTrue={isUpgradeModalOpen}>
          <UpgradePlanModal
            title='You’ve reached your patient limit'
            subTitle='To add more patients, please contact us to top up your limit.'
            onClose={() => setIsUpgradeModalOpen(false)}
          />
        </When>
        <When isTrue={isPatientFilledData}>
          <OverviewPrompt
            title='Data from patient seems incorrect?'
            text='You can edit the data if you would like to by clicking on edit button'
            type='primary'
            buttonText='Edit details'
            handleTakeMeThereClick={handleTakeMeThereClick}
          />
        </When>
        <div className='flex flex-col border border-mediumGray rounded-lg p-4 md:gap-4 md:mb-4 mb-44'>
          {/*-------------------------- Basic Details ---------------------------------------*/}
          <div className='sm:border-b'>
            <div className='text-Neutral-Black-Black-500 font-Figtree text-[20px] font-semibold flex items-center md:border-b border-b-mediumGray py-4 md:mb-2'>
              Basic Details
            </div>
            <div className='grid md:grid-cols-2 grid-cols-1 grid-rows-1 gap-x-12 gap-y-4 md:mb-4'>
              <ListItem
                label='Tracking Type'
                value={
                  dataGetTrackingDetails?.tracking_type === trackingTypes.PATIENTAPP
                    ? trackingMethodFeatures?.PATIENTAPP.title
                    : trackingMethodFeatures?.MANUAL.title
                }
              />
              {/* <ListItem label='Pricing' value={dataGetTrackingDetails?.pricing} /> */}
            </div>
          </div>
          <div className='border-b border-mediumGray md:hidden my-4'></div>
          {/*------------------------------------- Additional Details------------------------------- */}
          <div>
            <div className='text-Neutral-Black-Black-500 font-Figtree text-[20px] font-semibold flex items-center md:border-b border-b-mediumGray md:py-4 mb-4'>
              Additional Details
            </div>
            <div className='grid md:grid-cols-2 grid-cols-1 gap-x-12 gap-y-4'>
              <ListItem
                label='Current Aligner Set'
                value={dataGetTrackingDetails?.current_aligner_details?.number}
                valueSubscript={isPatientFilledData ? '(Patient Filled Data)' : ''}
              />
              <ListItem
                label='Current aligner start date'
                value={
                  hasValue(dataGetTrackingDetails?.current_aligner_details?.start_date)
                    ? moment(dataGetTrackingDetails?.current_aligner_details?.start_date).format(
                        'DD-MMM-YYYY '
                      )
                    : ''
                }
                valueSubscript={isPatientFilledData ? '(Patient Filled Data)' : ''}
              />
              <ListItem
                label='Current aligner end date'
                value={
                  hasValue(dataGetTrackingDetails?.current_aligner_details?.end_date)
                    ? moment(dataGetTrackingDetails?.current_aligner_details?.end_date).format(
                        'DD-MMM-YYYY '
                      )
                    : ''
                }
                valueSubscript={isPatientFilledData ? '(Patient Filled Data)' : ''}
              />
            </div>
          </div>
        </div>
        <div className='flex items-center justify-center md:justify-end  gap-6 py-[10px] w-full absolute bottom-0 left-0 shadow-footerShadow md:pe-[26px] z-10 bg-white rounded-lg'>
          <When isTrue={!isView}>
            <div className='flex flex-wrap-reverse gap-2 justify-center item-center w-full md:w-fit'>
              <When isTrue={!isPatientFillingData && isNew}>
                <button
                  className='text-grayDisabled text-[14px] cursor-pointer  h-12 px-4 w-full md:w-fit'
                  onClick={() => {
                    navigate(`${profileBasePath}/${patientId}/plans-list`)
                  }}
                >
                  Cancel
                </button>
              </When>
              <When
                isTrue={
                  hasValue(dataGetTrackingDetails) &&
                  !isPatientFillingData &&
                  !isPatientFilledData &&
                  !isDraft
                }
              >
                <AntdButton
                  loading={loadingSaveForLater}
                  disabled={loadingPostTrackingDetails}
                  text={'Save as draft'}
                  onClick={() => callFinalizeTracking(trackingMethodTagTypes.DRAFT)}
                  className='bg-primarySupport hover:!bg-primarySupport text-primaryColor border hover:!text-primaryColor border-primaryColor  hover:!border-primaryColor text-[14px] font-semibold rounded-lg h-12 w-full md:w-fit'
                />

                <AntdButton
                  disabled={loadingPostTrackingDetails}
                  text={
                    dataGetTrackingDetails?.ask_patient_to_fill
                      ? 'Send to Patient'
                      : 'Finalize tracking'
                  }
                  onClick={
                    dataGetTrackingDetails?.ask_patient_to_fill
                      ? callFinalizeTracking.bind(null, 'DRAFT')
                      : callFinalizeTracking.bind(null, 'ACTIVE')
                  }
                  className='bg-primaryColor text-white text-[14px] h-12 font-semibold text-base w-full md:w-fit'
                />
              </When>

              <When isTrue={isPatientFilledData}>
                <AntdButton
                  loading={loadingSaveForLater}
                  disabled={loadingPostTrackingDetails}
                  text={'Save as draft'}
                  onClick={() => callFinalizeTracking(trackingMethodTagTypes.DRAFT)}
                  className='bg-primarySupport text-primaryColor border border-primaryColor text-[14px] font-semibold rounded-lg h-12  w-full md:w-fit'
                />

                <AntdButton
                  disabled={loadingPostTrackingDetails}
                  text={'Finalize tracking'}
                  onClick={callFinalizeTracking.bind(null, 'ACTIVE')}
                  className='bg-primaryColor text-white text-[14px] h-12 font-semibold text-base  w-full md:w-fit'
                />
              </When>
              <When isTrue={isPatientFillingData || isDraft}>
                <AntdButton
                  text={'Edit Details'}
                  onClick={handleEditButtonClick}
                  className='bg-primaryColor text-[14px] font-semibold h-12  w-full md:w-fit'
                />
              </When>
            </div>
          </When>
          <When
            isTrue={
              dataGetTrackingDetails?.status === trackingMethodTagTypes.ACTIVE &&
              dataGetTrackingDetails?.tracking_type === trackingTypes.MANUAL &&
              !isNew
            }
          >
            <AntdButton
              text={'Upgrade'}
              onClick={() => setIsModalUpgradeOpen(true)}
              className='!bg-orangeSupport text-[14px] font-semibold h-12 !text-orange hover:!bg-orangeSupport  w-[95%] md:w-fit'
              icon={<CrownIcon />}
            />
          </When>
        </div>
      </Page>
    </div>
  )
}

export default ReviewTrackingDetails
