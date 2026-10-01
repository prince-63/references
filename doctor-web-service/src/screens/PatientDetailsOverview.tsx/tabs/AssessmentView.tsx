import {Button, Collapse, ConfigProvider, Divider, Spin} from 'antd'
import CheckedCircleIcon from 'assets/icons/CheckedCircleIcon'
import CheckedCircleOutlineIcon from 'assets/icons/CheckedCircleOutlineIcon'
import FileIcon from 'assets/icons/FileIcon'
import DropdownRightArrow from 'assets/icons/VIewStatsIcon copy'
import {useNavigate, useParams} from 'react-router-dom'
import getColorPalette from 'utils/getColorPalette'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import ExpandIcon from 'assets/icons/ExpandIcon'
import cn from '@utils/cn'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import {useContext, useEffect, useMemo, useState} from 'react'
import useDispatchAction from '@hooks/useDispatchAction'
import {getAllCaseRecord} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import {ApiGetData, safeParseInt} from 'utils/ConstFunctions'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {AuthContext} from 'context/AuthContext'
import {ModalConnectWithPatient} from 'components/modal/Leads/Overview/ModalConnectWithPatient'
import When from 'components/when/When'
import {AddCaseRecordModal} from './CaseFiles'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {postApiLeadsProfileDetailsUpdate} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileUpdateDetails.slice'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import InvitePatientInfoCard from 'screens/Patients/LeadsProfile/main/overview/components/InvitePatientInfoCard'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import Spinner from 'components/spinner/Spinner'
import workflowNameConstants from '@constants/workflowName.constants'
import PaperPlaneTiltIcon from 'assets/icons/PaperPlaneTiltIcon'
import InfoCardAssessmentView from './InfoCardsAssessmentView'
import InfoCard from 'components/instruction/InfoCard'
import ModalPatientSettingsAction from 'components/modal/Leads/Overview/ModalPatientSettingsAction'
import {postApiDataPatientDelete} from 'redux/Slices/AppSlice/LeadsProfile/Overview/Overview.slice'
import patientTypeConstants from '@constants/patientType.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useProfileBasePath from '@hooks/useProfileBasePath'

type MarkAsRead = {
  case_record: boolean | null
  invite_modal: boolean | null
  prescription_read: boolean | null
}
const MARK_AS_READ_KEYS = {
  CASE_RECORD: 'case_record',
  INVITE_MODAL: 'invite_modal',
  PRESCRIPTION_READ: 'prescription_read',
} as const

type MarkAsReadKey = (typeof MARK_AS_READ_KEYS)[keyof typeof MARK_AS_READ_KEYS]

const CaseRecordDropdownContent = () => {
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const {caseRecordData, loadingGetAll} = useSelector((state: RootState) => state.caseRecord)

  useEffect(() => {
    if (!patientId) return
    dispatchAction(getAllCaseRecord({patient_id: safeParseInt(patientId)}))
  }, [dispatchAction, patientId])

  if (loadingGetAll) {
    return (
      <div className='flex justify-center py-6'>
        <Spinner loading size={24} />
      </div>
    )
  }

  return (
    <div>
      <DropdownRadioCaseRecord
        title='Photographs'
        subTitle='Intraoral and extraoral images.'
        isChecked={(caseRecordData && caseRecordData?.pre_treatment_files.length > 0) ?? false}
        count={caseRecordData?.pre_treatment_files.length ?? 0}
      />
      <Divider className='m-0' />
      <DropdownRadioCaseRecord
        title='Scan files'
        subTitle='Upper jaw, lower Jaw and bite scans.'
        isChecked={(caseRecordData && caseRecordData?.scan_files.length > 0) ?? false}
        count={caseRecordData?.scan_files.length ?? 0}
      />
      <Divider className='m-0' />
      <DropdownRadioCaseRecord
        title='Radiographs'
        subTitle='X-rays, OPG, and Lateral Cephalogram images.'
        isChecked={(caseRecordData && caseRecordData?.xray_files.length > 0) ?? false}
        count={caseRecordData?.xray_files.length ?? 0}
      />
    </div>
  )
}

const CheckListBox = ({
  icon,
  title,
  isOptional,
  subTitle,
  buttonText,
  onClick,
  showSkipNow,
  skippingItem,
  setRead,
  onSkip,
}: {
  icon: React.ReactNode
  title: string
  isOptional?: boolean
  subTitle?: string | null
  buttonText?: string
  onClick?: () => void
  showSkipNow?: boolean
  skippingItem?: MarkAsReadKey
  setRead?: (key: MarkAsReadKey, value: boolean) => void
  onSkip?: (patch?: Partial<MarkAsRead>) => void
}) => {
  const palette = getColorPalette()

  return (
    <div className='flex flex-col md:flex-row md:items-center justify-between gap-2 border border-mediumGray rounded-lg p-3 bg-white'>
      <div className='flex md:items-center items-start gap-2'>
        {icon && <div className='bg-primarySupport p-4 rounded-lg w-fit'>{icon}</div>}
        <div className='text-base text-textColor'>
          <p className='flex gap-1 items-center text-black font-semibold '>
            <div>{title}</div>
            {isOptional && <p className='text-textColor font-normal text-sm'>(Optional)</p>}
          </p>
          {subTitle && <p className='text-textColor font-normal text-sm'>{subTitle}</p>}
        </div>
      </div>

      {buttonText && (
        <div className='flex gap-2'>
          <When isTrue={showSkipNow}>
            <Button
              onClick={() => {
                const patch = skippingItem
                  ? ({[skippingItem]: true} as Partial<MarkAsRead>)
                  : undefined

                // keep local UI state in sync
                setRead?.(skippingItem!, true)

                // send the patch so the API gets the updated value immediately
                onSkip?.(patch)
              }}
              type='primary'
              className='w-full md:w-[200px] bg-primarySupport border border-primaryColor text-primaryColor h-10 px-4 font-semibold hover:!bg-primarySupport 
    hover:!border-primaryColor 
    hover:!text-primaryColor'
            >
              Skip for now
              <CaretRightIcon color={palette.primaryColor} width='7' height='10' />
            </Button>
          </When>
          <Button
            type='primary'
            onClick={onClick}
            className='md:self-auto self-end w-full md:w-[200px]'
            style={{
              background: palette.primaryColor,
              borderColor: palette.primaryColor,
              color: palette.white,
              height: 40,
              padding: '0 16px',
              fontFamily: 'Figtree, sans-serif',
              display: 'flex',
              alignItems: 'center',
              fontWeight: 600,
              gap: 8,
            }}
          >
            {buttonText}
            <CaretRightIcon color={palette.white} width='7' height='10' />
          </Button>
        </div>
      )}
    </div>
  )
}

const AssessmentView = () => {
  const {userId} = useContext(AuthContext)
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {patientId} = useParams()
  const {dispatchAction} = useDispatchAction()
  const {isModalConnectWithPatientOpen} = useSelector(
    (state: RootState) => state.apiAddAndSendInvite
  )
  const {isGrowthPlanUser, isStarterPlanUser} = useAllUserPlan()
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {permissionChecks} = useFeatureAccess()
  const caseFilesAccess = permissionChecks?.patientProfileActions?.caseFiles
  const prescriptionsAccess = permissionChecks?.patientProfileActions?.prescriptions
  const patientInvitationPermissions =
    permissionChecks?.patientManagement?.patientInvitation?.isAddable
  const numberOfPrescriptions = useMemo(() => {
    return data?.getting_started_details?.prescription_count
  }, [data])
  const gs = data?.getting_started_details
  const [openDeleteExistingPatient, setOpenDeleteExistingPatient] = useState(false)
  const {loadingPatientDelete} = useSelector((state: RootState) => state.apiGetLeadsOverview)
  const customerTrackingEnabled = useMemo(() => {
    return isGrowthPlanUser || isStarterPlanUser
      ? true
      : data?.is_customer_tracking_enabled === true
  }, [])

  // show sections when the corresponding flag is falsy (undefined/null/false)
  const showCaseRecords = !gs?.case_record
  const showPrescription = !gs?.prescription_read
  const showInvite = !gs?.invite_modal

  const [markAsRead, setMarkAsRead] = useState<MarkAsRead>({
    case_record: null,
    invite_modal: null,
    prescription_read: null,
  })
  const [hasInfoCards, setHasInfoCards] = useState(true)

  const {loadingWorkFlow, getIndividualTaskList} = useSelector((state: RootState) => state.workFlow)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const taskWorkflowName = useMemo(() => {
    if (!getIndividualTaskList) return ''
    if (Array.isArray(getIndividualTaskList)) {
      if (getIndividualTaskList?.[0]?.workflow_name === 'ONGOING PRODUCT LIST') {
        return getIndividualTaskList.filter((g) => g.workflow_name === 'ONGOING PRODUCT LIST')
      }
      return getIndividualTaskList?.[0]?.workflow_name ?? ''
    }

    return getIndividualTaskList?.workflow_name ?? ''
  }, [getIndividualTaskList])

  const taskWorkflowSlug = useMemo(() => {
    if (!taskWorkflowName) return null
    const normalizedName = taskWorkflowName.toString().trim().toUpperCase()
    if (normalizedName.includes('NEW CASE')) return workflowNameConstants.NEW_CASE
    if (
      normalizedName.includes('PLANS OUTSOURCED') ||
      normalizedName.includes('PLAN OUTSOURCED') ||
      normalizedName.includes('PLANNING OUTSOURCE') ||
      normalizedName.includes('PLANNING OUTSOURCED')
    )
      return workflowNameConstants.PLANNING_OUTSOURCE
    if (normalizedName.includes('PLANNING ORDER')) return workflowNameConstants.PLANNING_ORDER
    if (normalizedName.includes('PLANNING')) return workflowNameConstants.PLANNING_IN_HOUSE
    if (
      normalizedName.includes('PRODUCTION OUTSOURCED') ||
      normalizedName.includes('PRODUCTION OUTSOURCE')
    )
      return workflowNameConstants.PRODUCTION_OUTSOURCE
    if (normalizedName.includes('PRODUCTION')) return workflowNameConstants.PRODUCTION_IN_HOUSE
    return null
  }, [taskWorkflowName])

  const setRead = (key: MarkAsReadKey, value: boolean) => {
    setMarkAsRead((prev) => ({...prev, [key]: value}))
  }

  const skipAssessment = (patch?: Partial<MarkAsRead>) => {
    if (!patientId) return

    const postData = {
      data: {
        patient_id: safeParseInt(patientId),
        ...markAsRead, // current state
        ...(patch ?? {}), // immediate override (avoids async lag)
      },
    }

    dispatchAction(postApiLeadsProfileDetailsUpdate(postData)).then(() => {
      if (userId) {
        dispatchAction(
          getLeadsProfileDetails({
            patient_id: safeParseInt(patientId),
            doctor_id: safeParseInt(userId),
          })
        )
      }
    })
  }

  const palette = getColorPalette()
  const InProductionWorkflow =
    !taskWorkflowSlug ||
    taskWorkflowSlug === workflowNameConstants.PRODUCTION_IN_HOUSE ||
    taskWorkflowSlug === workflowNameConstants.PRODUCTION_OUTSOURCE
  taskWorkflowSlug === workflowNameConstants.PLANNING_OUTSOURCE

  const showCaseRecordsSection =
    showCaseRecords &&
    caseFilesAccess?.isViewable &&
    !InProductionWorkflow &&
    serviceConfig?.ALIGNER_PLANNING_MANUFACTURING
  const showPrescriptionSection =
    showPrescription &&
    prescriptionsAccess?.isViewable &&
    !InProductionWorkflow &&
    serviceConfig?.ALIGNER_PLANNING_MANUFACTURING
  const showInviteSection =
    !data?.patient_details?.connection_date &&
    showInvite &&
    patientInvitationPermissions &&
    customerTrackingEnabled
  const showAssessmentEmptyState =
    Boolean(gs) &&
    taskWorkflowSlug !== workflowNameConstants.NEW_CASE &&
    !showCaseRecordsSection &&
    !showPrescriptionSection &&
    !showInviteSection &&
    taskWorkflowSlug !== workflowNameConstants.PRODUCTION_IN_HOUSE &&
    !hasInfoCards

  const getAssessmentCollapse = [
    {
      key: '1',
      label: (
        <div className='flex flex-col md:flex-row w-full items-start md:items-center justify-between gap-4'>
          <div className='flex items-start md:items-center gap-2'>
            <div className='bg-primarySupport p-4 rounded-lg w-fit'>
              <FileIcon />
            </div>
            <div className='text-base text-textColor'>
              <p className='flex gap-1 items-center text-black font-semibold'>
                <span>Case records</span>
                <span className='text-textColor font-normal text-sm'>(Recommended)</span>
              </p>
              <p className='text-textColor font-normal text-sm'>
                Upload all relevant files to maintain complete case documentation.
              </p>
            </div>
          </div>

          {/* ---- Right side (AntdButton) ---- */}
          <AntdButton
            onClick={(e) => {
              e.stopPropagation() // prevents collapse toggle
              e.preventDefault()
              setRead(MARK_AS_READ_KEYS.CASE_RECORD, true)
              skipAssessment({case_record: true})
            }}
            type='primary'
            className='bg-primarySupport border border-primaryColor hover:!bg-primarySupport 
    hover:!border-primaryColor 
    hover:!text-primaryColor text-primaryColor h-10 px-4 font-semibold flex items-center gap-2 justify-center w-full md:w-[200px]'
            text={
              <div className='flex gap-2 items-center'>
                <span>Skip for now</span>
                <CaretRightIcon color={palette.primaryColor} width='7' height='10' />
              </div>
            }
          />
        </div>
      ),
      children: <CaseRecordDropdownContent />,
    },
  ]

  const callPatientDelete = () => {
    const postData: ApiGetData = {
      data: {
        patient_id: patientId,
      },
    }
    dispatchAction(postApiDataPatientDelete(postData) as any)
      .unwrap()
      .then(() => {
        setOpenDeleteExistingPatient(false)
        navigate('/patients-list')
      })
      .catch(() => {})
  }

  return (
    <Spin indicator={<Spinner loading />} spinning={loadingWorkFlow}>
      <div className='w-full flex flex-col gap-3'>
        <When isTrue={openDeleteExistingPatient}>
          <ModalPatientSettingsAction
            title='Incomplete Patient Record'
            text='Patient data could not be saved correctly. It seems the page was refreshed while the patient was still being added.
Please delete this patient entry and re-add them using Quick Add again.'
            buttonSolidText='Delete patient'
            buttonOutlineText='Go back'
            type='warning'
            onClickSolidButton={callPatientDelete}
            onClickOutlineButton={() => {
              setOpenDeleteExistingPatient(false)
            }}
            loading={loadingPatientDelete}
            setIsModalPatientSettingsActionOpen={setOpenDeleteExistingPatient}
          />
        </When>
        <When isTrue={isModalConnectWithPatientOpen}>
          <ModalConnectWithPatient />
        </When>

        <div className='flex flex-col gap-3'>
          <InfoCardAssessmentView onVisibilityChange={setHasInfoCards} />
          {!data?.patient_details?.has_read_existing_patient_form &&
            data.patient_details?.patient_type === patientTypeConstants.EXISTING_PATIENT && (
              <InfoCard
                title='Incomplete Patient Record'
                subTitle='Patient data could not be saved correctly. It seems the page was refreshed while the patient was still being added.
Please delete this patient entry and re-add them using Quick Add again.'
                buttonText='Delete Patient'
                color='red'
                classNameButton='!bg-red'
                className='border border-red bg-redSupport text-red'
                onClick={() => setOpenDeleteExistingPatient(true)}
              />
            )}
          <When isTrue={showCaseRecordsSection}>
            <div>
              <ConfigProvider
                theme={{
                  components: {
                    Collapse: {
                      contentPadding: 0,
                    },
                  },
                }}
              >
                <Collapse
                  expandIconPosition='end'
                  size='large'
                  items={getAssessmentCollapse}
                  style={{margin: 0, padding: 0, background: 'white'}}
                  className='collapse-no-spacing'
                  expandIcon={({isActive}) => (
                    <ExpandIcon className={cn(!isActive && 'pt-8')} {...{isActive}} />
                  )}
                  defaultActiveKey={['1']}
                />
              </ConfigProvider>
            </div>
          </When>

          <When isTrue={showPrescriptionSection}>
            <CheckListBox
              icon={<FileIcon color={palette.primaryColor} />}
              title={'Add Prescription'}
              isOptional={false}
              buttonText={'Add Prescription'}
              onClick={() => {
                if (prescriptionsAccess?.isAddable) {
                  navigate(`${profileBasePath}/${patientId}/details/prescriptions`)
                } else {
                  ErrorToast('You don’t have permission to add prescriptions.')
                }
              }}
              showSkipNow={true}
              skippingItem={MARK_AS_READ_KEYS.PRESCRIPTION_READ}
              setRead={setRead}
              onSkip={skipAssessment}
              subTitle={numberOfPrescriptions > 0 ? `count: ${numberOfPrescriptions}` : null}
            />
          </When>

          <When isTrue={showInviteSection}>
            <InvitePatientInfoCard
              icon={<PaperPlaneTiltIcon color='#be8901' />}
              iconWrapperClassName='flex h-12 w-14 items-center justify-center rounded-xl bg-orangeSupport'
              title='Invite patient'
              description={
                !data?.invitation_details?.is_patient_invited
                  ? "The patient hasn't signed up yet. Send an invitation to start communicating."
                  : "An invite has been sent, but the patient hasn't signed up yet. Resend the invite and ensure they use the same email ID."
              }
              optionalLabel=''
              cardClassName='flex flex-col md:flex-row md:items-center md:justify-between rounded-xl border border-mediumGray bg-white shadow-sm p-4'
              primaryButtonLabel={
                data?.invitation_details?.is_patient_invited ? 'Resend Invite' : 'Send Invite'
              }
              primaryButtonIcon={null}
            />
          </When>

          <When isTrue={showAssessmentEmptyState}>
            <div className='flex flex-col items-center justify-center gap-3 text-center h-[50dvh]'>
              <CheckedCircleOutlineIcon color={palette.tertiaryColor} width='48' height='48' />
              <p className='font-figtree text-textColor'>You're all caught up</p>
            </div>
          </When>
        </div>
      </div>
    </Spin>
  )
}

export default AssessmentView

const DropdownRadioCaseRecord = ({
  title,
  subTitle,
  isChecked,
  count,
}: {
  title: string
  subTitle: string
  isChecked: boolean
  count: number
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedCaseRecordId, setSelectedCaseRecordId] = useState<number | null>(null)
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {caseRecordData} = useSelector((state: RootState) => state.caseRecord)
  const {dispatchAction} = useDispatchAction()
  const {permissionChecks} = useFeatureAccess()
  const caseFilesAccess = permissionChecks?.patientProfileActions?.caseFiles

  return (
    <>
      <AddCaseRecordModal
        isModalVisible={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCaseRecordId(null)
          setIsEditMode(false) // reset edit mode
        }}
        patientId={data?.patient_details?.id.toString() ?? ''}
        caseRecordId={selectedCaseRecordId ?? undefined}
        isEditMode={isEditMode}
        onSuccess={() => {
          setIsModalOpen(false) // ✅ close modal after save
          setSelectedCaseRecordId(null)
          setIsEditMode(false)
          // optional: refresh case records
          if (data?.patient_details?.id) {
            dispatchAction(getAllCaseRecord({patient_id: data.patient_details.id}))
          }
        }}
      />
      <div
        className='flex items-center justify-between p-3 cursor-pointer'
        onClick={() => {
          const existingCaseRecordId = caseRecordData?.case_record_id

          if (existingCaseRecordId) {
            if (caseFilesAccess?.isViewable) {
              setSelectedCaseRecordId(existingCaseRecordId)
              setIsEditMode(false)
              setIsModalOpen(true)
            } else {
              ErrorToast('You don’t have permission to view Case files.')
            }
            return
          }

          if (!caseFilesAccess?.isAddable) {
            ErrorToast('You don’t have permission to add Case files.')
            return
          }

          setSelectedCaseRecordId(null)
          setIsEditMode(false)
          setIsModalOpen(true)
        }}
      >
        <div className='flex items-center md:gap-3 gap-2'>
          {isChecked ? (
            <CheckedCircleIcon color='#00B383' />
          ) : (
            <div className='min-w-5 w-5 h-5 rounded-full border border-grayDisabled'></div>
          )}

          <div className='text-base text-textColor'>
            <p className='flex gap-1 items-center text-black font-semibold'>
              <div> {title}</div>{' '}
              <p className='text-textColor font-normal text-sm'>(Recommended) </p>
            </p>
            <p className='text-textColor font-normal text-sm'>
              {isChecked ? `${count} files added.` : subTitle}
            </p>
          </div>
        </div>
        <div>
          <DropdownRightArrow color='#666' />
        </div>
      </div>
    </>
  )
}
