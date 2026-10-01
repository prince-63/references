import Page from 'components/page/Page'
import InfoCard from '../alignersTracking/components/InfoCard'
import ClipBoardIcon from 'assets/icons/ClipBoardIcon'
import patientAssignedTypeConstants from '@constants/patientAssignedType.constants'
import useDispatchAction from '@hooks/useDispatchAction'
import {setTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {useNavigate, useParams} from 'react-router-dom'
import {
  assignPracticeToPatient,
  setIsAssignPracticeDrawerOpen,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {getOverviewDataType} from '../../leadsProfile.types'
import When from 'components/when/When'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import hasValue from 'utils/hasValue'
import {useContext, useState} from 'react'
import CreateTreatmentPlanModal from 'screens/Orders/components/CreateTreatmentPlanModal'
import orderStatusConstants from '@constants/orderStatus.constants'
import alertType from '@constants/alertType'
import {eventEmitter} from '@utils/eventEmitter'
import {AxiosError} from 'axios'
import AntdButton from 'components/atom/Buttons/AntdButton'
import CustomDrawer from 'components/drawer/CustomDrawer'
import {Formik} from 'formik'
import {safeParseInt} from 'utils/ConstFunctions'
import AssignPracticeForm from '../../leftPanel/AssignPracticeForm'
import assignPracticeFormValidation from '../../leftPanel/assignPracticeForm.validation'
import {useMediaQuery} from 'react-responsive'
import {AuthContext} from 'context/AuthContext'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import useAllUserPlan from '@hooks/useAllUserPlan'
type PatientAssignedTo = keyof Omit<typeof patientAssignedTypeConstants, 'ASSIGNED_TO_ME'>
const UnassignedPatientOverviewPage = ({
  patientAssignedTo,
  dataLeadsData,
}: {
  patientAssignedTo: PatientAssignedTo
  dataLeadsData: getOverviewDataType
}) => {
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {isAssignPracticeDrawerOpen} = useSelector((state: RootState) => state.leadsProfile)
  const gettingStartedDataLeadsOverview = data.getting_started_details
  const {userId} = useContext(AuthContext)

  const orderId = gettingStartedDataLeadsOverview?.order_id
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})

  const pageContentConfig = {
    [patientAssignedTypeConstants.UNASSIGNED]: {
      subTitle: 'This patient has no assigned practice. Assign one to unlock more features.',
      onClick: () => {
        dispatchAction(setIsAssignPracticeDrawerOpen(true))
      },
      buttonText: 'Assign practice',
      infoTile: 'Assign practice to unlock more features',
      infoSubtitle: 'This patient has no assigned practice. Assign one to unlock more features.',
    },
    [patientAssignedTypeConstants.ASSIGNED_TO_PRACTICE]: {
      subTitle: 'You can view treatment progress once a aligner tracking is finalized.',
      onClick: () => {
        handleCreateTreatmentPlan()
      },
      buttonText: 'Setup treatment',
      infoTile: 'Set up a treatment plan',
      infoSubtitle: 'Set-up a treatment plan to get them started.',
    },
  }
  const {patientId} = useParams()
  const [open, setOpen] = useState(false)
  const {isOrganization} = useAllUserPlan()
  const handleCreateTreatmentPlan = () => {
    if (isOrganization) {
      setOpen(true)
      return
    }

    dispatchAction(setTreatmentPlan({}))
    navigate(`/${patientId}/plans-list/new/setupTreatmentPlan`)
  }
  return (
    <Page title='Treatment overview'>
      <Formik
        initialValues={{
          practice_profile_id: null as number | null,
        }}
        validationSchema={assignPracticeFormValidation}
        enableReinitialize
        validateOnMount
        onSubmit={async (values) => {
          await dispatchAction(
            assignPracticeToPatient({
              patient_id: safeParseInt(patientId),
              practice_profile_id: safeParseInt(values.practice_profile_id),
            })
          )
            .unwrap()
            .then(() => {
              dispatchAction(
                getLeadsProfileDetails({
                  patient_id: safeParseInt(patientId),
                  doctor_id: safeParseInt(userId),
                })
              )
            })
            .catch((error: AxiosError) => {
              eventEmitter.emit('apiError', {...error, alertType: alertType.MODAL})
            })
          dispatchAction(setIsAssignPracticeDrawerOpen(false))
        }}
      >
        {(formik) => {
          return (
            <CustomDrawer
              {...{
                title: 'Assign practice',
                subTitle: 'Search or select a practice from the dropdown.',
                width: !isMobile ? '700' : '100%',
                open: isAssignPracticeDrawerOpen,
                placement: isMobile ? 'bottom' : undefined,

                height: '90%',
                destroyOnClose: true,
                onClose: () => {
                  dispatchAction(setIsAssignPracticeDrawerOpen(false))
                  formik.resetForm()
                },
              }}
              footer={
                <div className='flex gap-3 w-full md:w-auto justify-end'>
                  <AntdButton
                    className=' hover:!bg-white !bg-white hover:!text-textColor h-10 font-semibold text-base w-fit border !border-mediumGray !text-textColor'
                    isLoading={false}
                    text='Cancel'
                    onClick={() => {
                      formik.resetForm()
                      dispatchAction(setIsAssignPracticeDrawerOpen(false))
                    }}
                  />
                  <AntdButton
                    className='bg-primaryColor text-white h-10 font-semibold text-base w-fit'
                    isLoading={formik.isSubmitting}
                    disabled={!formik.isValid}
                    text='Assign practice'
                    htmlType='submit'
                    onClick={() => {
                      formik.handleSubmit()
                    }}
                  />
                </div>
              }
            >
              <AssignPracticeForm />
            </CustomDrawer>
          )
        }}
      </Formik>
      <div className='flex flex-col gap-6'>
        <When
          isTrue={
            patientAssignedTo === 'UNASSIGNED' ||
            (patientAssignedTo === 'ASSIGNED_TO_PRACTICE' &&
              !dataLeadsData?.treatment_active &&
              hasValue(orderId) &&
              (gettingStartedDataLeadsOverview?.order_status === orderStatusConstants.ORDERED ||
                gettingStartedDataLeadsOverview?.order_status === orderStatusConstants.RE_PLAN))
          }
        >
          <InfoCard
            {...{
              className: 'border border-primaryColor bg-primarySupport py-2',
              title: pageContentConfig[patientAssignedTo].infoTile,
              content: pageContentConfig[patientAssignedTo].infoSubtitle,
              buttonText: pageContentConfig[patientAssignedTo].buttonText,
              buttonClassName: '!rounded-lg !py-1',
              onClick: pageContentConfig[patientAssignedTo].onClick,
            }}
          />
        </When>
        <div className='flex flex-col gap-2 items-center justify-center text-textColor border border-mediumGray rounded-lg  h-[calc(80vh-21rem)] text-base'>
          <ClipBoardIcon width='32' height='32' />
          <p className='text-center'>{pageContentConfig[patientAssignedTo].subTitle}</p>
        </div>
      </div>
      <CreateTreatmentPlanModal {...{patientId, open, setOpen, orderId}} />
    </Page>
  )
}

export default UnassignedPatientOverviewPage
