import {useContext, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import Page from 'components/page/Page'
import When from 'components/when/When'
import {getOrderDetails, resetPatientDetails} from 'redux/Slices/AppSlice/orders/orders.slice'
import {ApiGetData, getFirstLetterCapitalOfWord, safeParseInt} from 'utils/ConstFunctions'
import {
  getApiLeadsOverview,
  getCaseInformation,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {
  getArchivePatientsList,
  RequestPatientList,
} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
import leadsPatientStatusType from '@constants/leadsPatientStatusType'
import {postApiDataPatientStatusChange} from 'redux/Slices/AppSlice/LeadsProfile/Overview/Overview.slice'
import {resetCaseRecordState} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import {resetUpdatedInfo} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileUpdateDetails.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {useParams, useNavigate} from 'react-router-dom'
import {resetManufacturingListData} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {getActivePractices} from 'redux/Slices/AppSlice/Practices/practices.slice'
import getColorPalette from 'utils/getColorPalette'
import ArchivePatientModal from '../components/ArchivePatientModal'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import ModalPatientSettingsAction from 'components/modal/Leads/Overview/ModalPatientSettingsAction'
import {postApiDataPatientDelete} from 'redux/Slices/AppSlice/LeadsProfile/Overview/Overview.slice'
import hasValue from 'utils/hasValue'
import useAllUserPlan from '@hooks/useAllUserPlan'

export const PatientDetails = () => {
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {permissionChecks} = useFeatureAccess()
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const {isStarterPlanUser} = useAllUserPlan()

  const patientManagementAccess =
    permissionChecks?.patientManagement?.patientManagement?.isEditable &&
    serviceConfig?.ALIGNER_PLANNING_MANUFACTURING
  const patientDeleteAccess =
    permissionChecks?.patientManagement?.patientManagement?.isDeletable &&
    serviceConfig?.ALIGNER_PLANNING_MANUFACTURING
  const patientDetailsAccess = permissionChecks?.patientDetails
  const dispatch = useDispatch()
  const {patientId} = useParams()
  const {userId, organizationId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
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
    if (!patientId || !userId) return

    getOverviewState()

    dispatchAction(
      getCaseInformation({
        patient_id: patientId,
        doctor_id: userId,
        product_type: 'ALIGNER',
      })
    )

    if (organizationId) {
      getActivePracticeList('')
    }

    return () => {
      dispatch(resetCaseRecordState())
      dispatchAction(resetUpdatedInfo())
      dispatchAction(resetPatientDetails())
      dispatchAction(resetManufacturingListData({}))
    }
  }, [patientId, userId, organizationId])
  const [isModalPatientSettingsActionOpen, setIsModalPatientSettingsActionOpen] = useState(false)
  type PatientActionType =
    | (typeof leadsPatientStatusType)[keyof typeof leadsPatientStatusType]
    | 'DELETE'
    | null
  const [patientActionType, setPatientActionType] = useState<PatientActionType>(null)

  const {data: patientData} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {loadingPatientDelete} = useSelector((state: RootState) => state.apiGetLeadsOverview)

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
        dispatchAction(
          getLeadsProfileDetails({
            patient_id: safeParseInt(patientId),
            doctor_id: safeParseInt(userId),
          } as any)
        )

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

  const {dataLeadsOverview: dataLeadsData} = useSelector((state: RootState) => state.leadsProfile)
  const trackingEnabled = hasValue(dataLeadsData?.tracking?.tracking_id)
  const canManagePatient = patientManagementAccess || isStarterPlanUser
  const canDeletePatient = !trackingEnabled && (patientDeleteAccess || isStarterPlanUser)
  const callPatientDelete = () => {
    if (!patientData?.patient_details?.id) return
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

  const isArchived = data?.patient_details?.status === leadsPatientStatusType.ARCHIVE

  const getOverviewState = async () => {
    if (!patientId || !userId) return

    await dispatchAction(
      getApiLeadsOverview({
        data: {
          patient_id: safeParseInt(patientId),
          doctor_id: safeParseInt(userId),
        },
      })
    )
  }

  return (
    <Page>
      <div>
        <When
          isTrue={
            isModalPatientSettingsActionOpen && patientActionType === leadsPatientStatusType.ARCHIVE
          }
        >
          <ArchivePatientModal
            isModalVisible={isModalPatientSettingsActionOpen}
            onClickSolidButton={() => {
              callPatientStatusChange(leadsPatientStatusType.ARCHIVE)
            }}
            onConfirm={() => {
              setIsModalPatientSettingsActionOpen(false)
            }}
            onClose={() => {
              setIsModalPatientSettingsActionOpen(false)
            }}
          />
        </When>
        <When isTrue={isModalPatientSettingsActionOpen && patientActionType === 'DELETE'}>
          <ModalPatientSettingsAction
            title='Do you want to delete the patient?'
            text='Once deleted the data for the patient will also be deleted. We recommend backing up the data before deleting.'
            buttonSolidText='Delete patient'
            buttonOutlineText='Cancel'
            type='warning'
            onClickSolidButton={callPatientDelete}
            onClickOutlineButton={() => {
              setIsModalPatientSettingsActionOpen(false)
            }}
            loading={loadingPatientDelete}
            setIsModalPatientSettingsActionOpen={setIsModalPatientSettingsActionOpen}
          />
        </When>

        <div className='space-y-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='text-lg font-semibold text-black'>Patient Details</div>
            <div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3'>
              {(() => {
                const p = getColorPalette()
                const base =
                  'inline-flex w-full sm:w-auto items-center justify-center h-10 px-4 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0'
                return (
                  <>
                    {canManagePatient && (
                      <button
                        onClick={() => navigate(`/add-patient?isEdit=true&patientId=${patientId}`)}
                        className={`${base} border border-mediumGray text-textColor bg-white hover:bg-gray-50`}
                      >
                        Edit
                      </button>
                    )}
                    {canManagePatient && (
                      <When isTrue={!isArchived}>
                        <button
                          onClick={() => {
                            if (isArchived) {
                              setPatientActionType(leadsPatientStatusType.ACTIVE)
                              callPatientStatusChange(leadsPatientStatusType.ACTIVE)
                              return
                            }
                            setPatientActionType(leadsPatientStatusType.ARCHIVE)
                            setIsModalPatientSettingsActionOpen(true)
                          }}
                          className={`${base} text-[#BE8901] hover:bg-[#FFE6C2]`}
                          style={{
                            background: p.orangeSupport,
                            border: `1px solid ${p.orangeSupport}`,
                          }}
                        >
                          Archive
                        </button>
                      </When>
                    )}
                    {canDeletePatient && (
                      <button
                        onClick={() => {
                          setPatientActionType('DELETE')
                          setIsModalPatientSettingsActionOpen(true)
                        }}
                        className={`${base} text-[#F45045] hover:bg-[#FDD6D4]`}
                        style={{
                          background: p.redSupport,
                          border: `1px solid ${p.red}`,
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </>
                )
              })()}
            </div>
          </div>

          <div className='bg-white border border-gray-200 rounded-lg'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-6'>
              {patientDetailsAccess?.patientPersonalInformation?.isViewable && (
                <div className='space-y-4'>
                  <h3 className='text-md font-medium text-black border-b border-gray-200 pb-2'>
                    Personal Information
                  </h3>

                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <span className='text-textColor block'>Full Name</span>
                      <span className='text-black font-medium'>
                        {data?.patient_details?.full_name}
                      </span>
                    </div>
                    <div>
                      <span className='text-textColor block'>Patient ID</span>
                      <span className='text-black font-medium'>
                        {data?.patient_details?.customer_mapped_id != null
                          ? data?.patient_details?.customer_mapped_id
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <span className='text-textColor block'>Age</span>
                      <span className='text-black font-medium'>{`${
                        data?.patient_details?.age != null
                          ? `${data.patient_details.age} years`
                          : '-'
                      }`}</span>
                    </div>
                    <div>
                      <span className='text-textColor block'>Gender</span>
                      <span className='text-black font-medium'>
                        {getFirstLetterCapitalOfWord(data?.patient_details?.gender ?? '-')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {patientDetailsAccess?.patientContactDetails?.isViewable && (
                <div className='space-y-4'>
                  <h3 className='text-md font-medium text-black border-b border-gray-200 pb-2'>
                    Contact Information
                  </h3>

                  <div className='space-y-3 text-sm'>
                    <div>
                      <span className='text-textColor block'>Phone Number</span>
                      <span className='text-black font-medium'>
                        {data?.patient_details?.country_code && data?.patient_details?.mobile
                          ? `${data.patient_details.country_code} ${data.patient_details.mobile}`
                          : '-'}
                      </span>
                    </div>
                    <div>
                      <span className='text-textColor block'>Email Address</span>
                      <span className='text-black font-medium'>
                        {data?.patient_details?.email ?? '-'}
                      </span>
                    </div>
                    <div>
                      <span className='text-textColor block'>Address</span>
                      <span className='text-black font-medium'>
                        {data?.patient_details?.city ||
                        data?.patient_details?.state ||
                        data?.patient_details?.country
                          ? [
                              data?.patient_details?.city,
                              data?.patient_details?.state,
                              data?.patient_details?.country,
                            ]
                              .filter(Boolean)
                              .join(', ')
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}
