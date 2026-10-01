import {useDispatch, useSelector} from 'react-redux'
import PatientLeftPanel from './leftPanel/PatientLeftPanel'
import Main from './main/Main'
import {ApiGetData, safeParseInt} from 'utils/ConstFunctions'
import {useContext, useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {RootState} from 'redux/store'
import When from 'components/when/When'
import ModalPatientSettings from 'components/modal/Leads/Overview/ModalPatientSettings'
import ModalPatientSettingsAction from 'components/modal/Leads/Overview/ModalPatientSettingsAction'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import leadsPatientStatusType from '@constants/leadsPatientStatusType'
import {
  postApiDataPatientDelete,
  postApiDataPatientStatusChange,
} from 'redux/Slices/AppSlice/LeadsProfile/Overview/Overview.slice'
import {ModalConnectWithPatient} from 'components/modal/Leads/Overview/ModalConnectWithPatient'
import {
  assignPracticeToPatient,
  getApiLeadsOverview,
  getCaseInformation,
  markGettingStartedComplete,
  setIsAssignPracticeDrawerOpen,
  setSelectedOverviewStep,
  setSkipAssessmentTab,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import Page from 'components/page/Page'
import TopPanel from './topPanelMobile/TopPanel'
import {getActivePractices} from 'redux/Slices/AppSlice/Practices/practices.slice'
import leadsOverviewConstants from '@constants/leadsOverview.constants'
import {Modal} from 'antd'
import InfoIcon from 'assets/icons/InfoIcon'
import AntdButton from 'components/atom/Buttons/AntdButton'
import getColorPalette from 'utils/getColorPalette'
import {
  getArchivePatientsList,
  RequestPatientList,
} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
import {getOrderDetails, resetPatientDetails} from 'redux/Slices/AppSlice/orders/orders.slice'
import useFilter from '@hooks/useFilter'
import actionList from '@staticData/actionList'
import ForceAlignerChange from './main/alignersTracking/actionModals/ForceAlignerChange'
import ModalViewForceAlignerChange from './main/alignersTracking/actionModals/components/ModalViewForceAlignerChange'
import ModalProductionLogs from 'components/modal/PatientProfile/Tabs/TreatmentPlan/ModalProductionLogs'
import PauseTreatment from './main/alignersTracking/actionModals/PauseTreatment'
import ResumeTreatment from './main/alignersTracking/actionModals/ResumeTreatment'
import actionTypes from '@constants/actionTypes'
import UpdateWearDaysAllAligners from './main/alignersTracking/actionModals/UpdateWearDaysAllAligners'
import ModalForceAlignerWarning from './main/alignersTracking/actionModals/components/ModalForceAlignerWarning'
import {resetCaseRecordState} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'

import {Formik} from 'formik'
import assignPracticeFormValidation from './leftPanel/assignPracticeForm.validation'
import {eventEmitter} from '@utils/eventEmitter'
import {AxiosError} from 'axios'
import alertType from '@constants/alertType'
import CustomDrawer from 'components/drawer/CustomDrawer'
import {useMediaQuery} from 'react-responsive'
import AssignPracticeForm from './leftPanel/AssignPracticeForm'
import {resetUpdatedInfo} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileUpdateDetails.slice'
import {resetManufacturingListData} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {CompleteTreatment} from './main/alignersTracking/actionModals/CompleteTreatment'
import {getAllTreatmentPlanList} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'

const LeadsProfile = () => {
  const dispatch = useDispatch()
  const {patientId} = useParams()
  const {userId, organizationId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {filter: activeAction, handleFilterChange} = useFilter(actionList, false)
  const getLeadsDetails = () => {
    const postData = {
      patient_id: safeParseInt(patientId),
      doctor_id: safeParseInt(userId),
    }
    dispatch(getLeadsProfileDetails(postData) as any)
  }

  const getActivePracticeList = async (query: string) => {
    await dispatchAction(
      getActivePractices({
        data: {
          sort_order: 'PRACTICE_NAME_ASC',
          page_number: 0,
          page_size: 0,
          search: query,
          doctor_id: safeParseInt(userId),
          organization_id: safeParseInt(organizationId),
          invitation_status: 'ACCEPTED',
          invitation_roles: ['CONSULTING_ORTHODONTIST'],
        },
      })
    )
  }

  useEffect(() => {
    getLeadsDetails()
    getOverviewState()
    if (!patientId || !userId) return
    dispatchAction(
      getCaseInformation({
        patient_id: patientId,
        doctor_id: userId,
        product_type: 'ALIGNER',
      })
    )

    dispatchAction(
      getAllTreatmentPlanList({
        doctor_id: userId!,
        patient_id: patientId!,
        organization_id: safeParseInt(organizationId),
      })
    )
    getActivePracticeList('')

    return () => {
      dispatch(resetCaseRecordState())
      dispatchAction(resetUpdatedInfo())
      dispatchAction(resetPatientDetails())
      dispatchAction(resetManufacturingListData({}))
    }
  }, [patientId])
  const [loading, setLoading] = useState(true)
  const [isModalPatientSettingsOpen, setIsModalPatientSettingsOpen] = useState(false)
  const [isModalPatientSettingsActionOpen, setIsModalPatientSettingsActionOpen] = useState(false)
  const [patientActionType, setPatientActionType] = useState<
    'ACTIVATE' | 'ARCHIVE' | 'DELETE' | null
  >(null)

  const {loadingPatientDelete, loadingPatientStatusChange} = useSelector(
    (state: RootState) => state.apiGetLeadsOverview
  )
  const {data: patientData} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {skipAssessmentTab, isAssignPracticeDrawerOpen, dataLeadsOverview} = useSelector(
    (state: RootState) => state.leadsProfile
  )
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})

  const callPatientDelete = () => {
    const postData: ApiGetData = {
      data: {
        patient_id: patientData.patient_details.id,
      },
    }
    dispatch(postApiDataPatientDelete(postData) as any)
      .unwrap()
      .then(() => {
        setIsModalPatientSettingsActionOpen(false)
        navigate('/patients-list')
      })
      .catch(() => {})
  }

  const callPatientStatusChange = (
    newStatus: (typeof leadsPatientStatusType)[keyof typeof leadsPatientStatusType] // newStatus : "ACTIVE" | 'ARCHIVE'
  ) => {
    const postData: ApiGetData = {
      data: {
        patient_id: patientData.patient_details.id,
        status: newStatus,
      },
    }
    dispatch(postApiDataPatientStatusChange(postData) as any)
      .unwrap()
      .then(() => {
        getLeadsDetails()
        setIsModalPatientSettingsActionOpen(false)
        if (newStatus === leadsPatientStatusType.ARCHIVE) {
          const payload: RequestPatientList = {
            page_number: 1,
            doctor_id: safeParseInt(userId),
            search: null,
            practice_location: [],
            archive: true,
            filter_by_app_invite_status: 'ALL',
            filter_by_global_status: 'ALL',
            filter_by_treatment_type: '',
            filter_by_practice_name: '',
            filter_by_role: null,
          }
          dispatchAction(getArchivePatientsList(payload))
            .unwrap()
            .then(() => {
              navigate('/patients-list', {
                state: {
                  patientListTab: 'ARCHIVED',
                },
              })
            })
        } else {
          navigate('/patients-list')
        }
      })
      .catch(() => {})
  }

  const {isModalConnectWithPatientOpen} = useSelector(
    (state: RootState) => state.apiAddAndSendInvite
  )
  const orderId = patientData?.getting_started_details?.order_id
  useEffect(() => {
    if (orderId) {
      dispatchAction(
        getOrderDetails({
          doctor_id: safeParseInt(userId),
          order_id: orderId,
          retrieve_treatment_plan: true,
        })
      )
    }
  }, [orderId])

  useEffect(() => {}, [])

  const getOverviewState = async () => {
    dispatchAction(
      getApiLeadsOverview({
        data: {
          patient_id: safeParseInt(patientId),
          doctor_id: safeParseInt(userId),
        },
      })
    )
    await dispatchAction(
      getLeadsProfileDetails({
        patient_id: safeParseInt(patientId),
        doctor_id: safeParseInt(userId),
      })
    )
      .unwrap()
      .then(async () => {
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  return (
    <Page loading={loading}>
      <Modal
        destroyOnClose={true}
        style={{fontFamily: 'figtree'}}
        open={skipAssessmentTab}
        closeIcon={false}
        width={550}
        footer={
          <div className='flex justify-between gap-2 mt-6'>
            <AntdButton
              text={'Skip'}
              htmlType='button'
              className='h-11  w-full !bg-primaryColor hover:!bg-primaryColor text-center !text-white font-semibold'
              onClick={() => {
                dispatchAction(
                  markGettingStartedComplete({patient_id: safeParseInt(patientId)})
                ).then(() => {
                  dispatchAction(
                    getLeadsProfileDetails({
                      patient_id: safeParseInt(patientId),
                      doctor_id: safeParseInt(userId),
                    })
                  )
                  dispatchAction(setSkipAssessmentTab(false))
                  dispatchAction(setSelectedOverviewStep(leadsOverviewConstants.SETUP_TREATMENT))
                })
              }}
            />

            <AntdButton
              text={'Go back'}
              className='h-11 w-full !bg-primarySupport hover:!bg-primarySupport !border-primaryColor !text-primaryColor text-center font-semibold'
              onClick={() => dispatchAction(setSkipAssessmentTab(false))}
            />
          </div>
        }
        onCancel={() => dispatchAction(setSkipAssessmentTab(false))}
      >
        <div className='flex flex-col justify-center items-center  pt-6'>
          <div className='w-12 h-12 rounded-full flex justify-center items-center bg-primarySupport'>
            <InfoIcon color={getColorPalette().primaryColor} width='24' height='24' />
          </div>
          <div className='w-full text-center'>
            <p className='font-semibold text-2xl mt-6'>Skip Assessment?</p>

            <div className='text-textColor font-normal'>
              You can skip assessment and access them later.
            </div>
          </div>
        </div>
      </Modal>

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
              getOverviewState()
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
      <div className='flex flex-col md:flex-row justify-between gap-4 mb-4'>
        <When isTrue={isModalPatientSettingsOpen}>
          <ModalPatientSettings
            setIsModalPatientSettingsOpen={setIsModalPatientSettingsOpen}
            setIsModalPatientSettingsActionOpen={setIsModalPatientSettingsActionOpen}
            setPatientActionType={setPatientActionType}
          />
        </When>
        <When isTrue={isModalPatientSettingsActionOpen && patientActionType === 'ACTIVATE'}>
          <ModalPatientSettingsAction
            title='Do you want to activate the patient?'
            text='Once the patient is active you can make changes and perform actions for the patient'
            buttonSolidText='Activate patient'
            buttonOutlineText='Cancel'
            type='primary'
            setIsModalPatientSettingsActionOpen={setIsModalPatientSettingsActionOpen}
            onClickSolidButton={() => {
              callPatientStatusChange(leadsPatientStatusType.ACTIVE)
            }}
            onClickOutlineButton={() => {
              setIsModalPatientSettingsActionOpen(false)
              setIsModalPatientSettingsOpen(true)
            }}
            loading={loadingPatientStatusChange}
          />
        </When>
        <When isTrue={isModalPatientSettingsActionOpen && patientActionType === 'ARCHIVE'}>
          <ModalPatientSettingsAction
            title='Do you want to archive the patient?'
            text='You can archive the patient if you wish to start the treatment for the patient in future'
            buttonSolidText='Archive patient'
            onClickSolidButton={() => {
              callPatientStatusChange(leadsPatientStatusType.ARCHIVE)
            }}
            buttonOutlineText='Cancel'
            onClickOutlineButton={() => {
              setIsModalPatientSettingsActionOpen(false)
              setIsModalPatientSettingsOpen(true)
            }}
            type='primary'
            setIsModalPatientSettingsActionOpen={setIsModalPatientSettingsActionOpen}
            loading={loadingPatientStatusChange}
          />
        </When>
        <When isTrue={isModalPatientSettingsActionOpen && patientActionType === 'DELETE'}>
          <ModalPatientSettingsAction
            title='Do you want to delete the patient?'
            text='Once deleted the data for the patient will also be deleted. We recommend backing up the data before deleting'
            buttonSolidText='Delete patient'
            onClickSolidButton={callPatientDelete}
            buttonOutlineText='Cancel'
            onClickOutlineButton={() => {
              setIsModalPatientSettingsActionOpen(false)
              setIsModalPatientSettingsOpen(true)
            }}
            type='warning'
            setIsModalPatientSettingsActionOpen={setIsModalPatientSettingsActionOpen}
            loading={loadingPatientDelete}
          />
        </When>
        {/* Connect with patient section */}
        <When isTrue={isModalConnectWithPatientOpen}>
          <ModalConnectWithPatient />
        </When>

        {/* Centralized modals for quick actions */}
        <When isTrue={activeAction.FORCE_CHANGE_ALIGNER}>
          <ForceAlignerChange
            handleOnClose={(option) => handleFilterChange(option, true)}
            handleActionOnClick={handleFilterChange}
          />
        </When>
        <When isTrue={activeAction.FORCE_CHANGE_ALIGNER_CONFIRM_MODAL}>
          <ModalViewForceAlignerChange
            handleOnClose={(option) => handleFilterChange(option, true)}
          />
        </When>
        <When isTrue={activeAction.FORCE_CHANGE_ALIGNER_WARNING_MODAL}>
          <ModalForceAlignerWarning
            handleOnClose={(option) => handleFilterChange(option, true)}
            handleActionOnClick={handleFilterChange}
          />
        </When>
        <When isTrue={activeAction.VIEW_LOGS}>
          <ModalProductionLogs
            handleOnClose={(option) => handleFilterChange(option, true)}
            alignerJourneyId={dataLeadsOverview?.treatment_plan?.journey_id}
          />
        </When>
        <When isTrue={activeAction.PAUSE_TREATMENT}>
          <PauseTreatment
            handleOnClose={(option) => handleFilterChange(option, true)}
            alignerJourneyId={dataLeadsOverview?.treatment_plan?.journey_id}
          />
        </When>
        <When isTrue={activeAction.RESUME_TREATMENT}>
          <ResumeTreatment
            handleOnClose={(option) => handleFilterChange(option, true)}
            alignerJourneyId={dataLeadsOverview?.treatment_plan?.journey_id}
          />
        </When>
        <When isTrue={activeAction.EXTEND_WEAR_DAYS}>
          <UpdateWearDaysAllAligners
            open={activeAction.EXTEND_WEAR_DAYS}
            onCancel={() => handleFilterChange(actionTypes.EXTEND_WEAR_DAYS, true)}
            onConfirm={() => {
              handleFilterChange(actionTypes.EXTEND_WEAR_DAYS, true)
            }}
            alignerJourneyId={dataLeadsOverview?.treatment_plan?.journey_id?.toString() ?? ''}
          />
        </When>
        <When isTrue={activeAction.COMPLETE_TREATMENT}>
          <CompleteTreatment
            handleOnClose={() => handleFilterChange(actionTypes.COMPLETE_TREATMENT, true)}
            alignerJourneyId={dataLeadsOverview?.treatment_plan?.journey_id ?? null}
          />
        </When>

        {patientData && (
          <PatientLeftPanel
            setIsModalPatientSettingsOpen={setIsModalPatientSettingsOpen}
            activeAction={activeAction}
            handleFilterChange={handleFilterChange}
          />
        )}

        <TopPanel
          setIsModalPatientSettingsOpen={setIsModalPatientSettingsOpen}
          handleFilterChange={handleFilterChange}
        />
        <Main />
      </div>
    </Page>
  )
}

export default LeadsProfile
