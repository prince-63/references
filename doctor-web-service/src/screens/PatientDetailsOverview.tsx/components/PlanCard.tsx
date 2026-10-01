import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'
import moment from 'moment'
import {useEffect, useState, MouseEvent, useContext} from 'react'
import {NewPlanData} from '../types/PlanList.types'
import {IFile} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import clsx from 'clsx'
import When from 'components/when/When'
import {Image} from 'assets/images/Images/Image'
import TextWithTooltip from 'components/section/TextWithTooltip'
import pdfPng from 'assets/images/Pdf.png'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import getColorPalette from 'utils/getColorPalette'
import {useNavigate, useParams} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import TreatmentPlanActions from './TreatmentPlanActions'
import {getPlanStatus} from '@utils/getPlanStatus'
import PlanStatusTag from '../helpers/PlanStatusTag'
import TreatmentPlansInfoCards from '../helpers/TreatmentPlansInfoCards'
import useDispatchAction from '@hooks/useDispatchAction'
import {getTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {shouldShowButton} from '../helpers/shouldShowButton'
import AntdButton from 'components/atom/Buttons/AntdButton'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import {getImageUrl, openDocument, safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import BoxBadge from 'components/atom/Box/BoxBadge'

interface PlanCardProps {
  plan: NewPlanData
  handleOnClick: (
    plan: NewPlanData,
    treatmentPlanStatus?: keyof typeof treatmentPlanStatusConstants
  ) => Promise<any>
  handleDeleteDraft: ({planId}: {planId: number}) => void
  isMobile?: boolean
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  handleOnClick,
  handleDeleteDraft,
  isMobile = false,
}) => {
  const navigate = useNavigate()
  const {userId} = useContext(AuthContext)
  const {patientId} = useParams()
  const profileBasePath = useProfileBasePath()
  const {isPractice, isAlignerCompanyOrg, isGrowthPlanUser, isDesignLabUser, isCustomer, isVendor} =
    useAllUserPlan()
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const {dispatchAction} = useDispatchAction()
  const {isEnterprisePlanUser} = useAllUserPlan()
  const {permissionChecks} = useFeatureAccess()
  const planButtonsPermissions = permissionChecks?.patientProfileActions
  const {createTreatmentPlanLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )

  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean
    url: string
    fileName?: string
  }>({
    isOpen: false,
    url: '',
    fileName: '',
  })
  const [showMoreActions, setShowMoreActions] = useState(false)
  const palette = getColorPalette()
  const isPurchasedPlanReceived =
    plan.is_treatment_plan_created_on_cloned_order &&
    safeParseInt(userId) !== safeParseInt(plan.doctor_id) &&
    isEnterprisePlanUser

  useEffect(() => {
    setShowMoreActions(false)
  }, [plan.plan_id])

  const handleOpenPDF = (url: string, fileName?: string) => {
    setPdfViewer({
      isOpen: true,
      url,
      fileName,
    })
  }

  const handleClosePDF = () => {
    setPdfViewer({
      isOpen: false,
      url: '',
      fileName: '',
    })
  }

  const handleEditClick = ({planId, orderId}: {planId: number; orderId: string}) => {
    dispatchAction(
      getTreatmentPlan({
        aligner_treatment_id: planId?.toString() ?? '',
      })
    )
      .unwrap()
      .then(() =>
        navigate(`/${patientId}/plans-list/edit/setupTreatmentPlan/${planId}?order_id=${orderId}`, {
          state: {isEdit: true},
        })
      )
  }

  const treatmentStatus = getPlanStatus({
    treatmentPlan: plan as any,
  }) as keyof typeof treatmentPlanStatusConstants

  if (
    isPractice &&
    (treatmentStatus === treatmentPlanStatusConstants.DRAFT ||
      plan.initiator_status === 'IN_PROGRESS')
  ) {
    return null
  }

  const triggerStatusAction = (status: keyof typeof treatmentPlanStatusConstants) => {
    if (createTreatmentPlanLoading) return
    handleOnClick(plan, status)
  }

  const getUserType = () => {
    if (isAlignerCompanyOrg) {
      return 'ORG'
    }
    if (isGrowthPlanUser) {
      return 'GROWTH_ORG'
    }
    if (isCustomer) {
      return 'CUSTOMER'
    }
    if (isPractice) {
      return 'CONNECTED_PRACTICE'
    }
    if (isDesignLabUser || isVendor) {
      return 'LAB_ADMIN'
    }
    return 'ORG'
  }

  const formatAlignerSeries = (series?: string | null) => {
    if (!series || series === '0-0') return '-'
    return series
  }

  const isReplanStatus = treatmentStatus === treatmentPlanStatusConstants.RE_PLAN
  const revisionRequestedOn =
    plan?.treatment_plan_metadata?.replan_requested_on ??
    plan.order_status_changed_at ??
    plan.created_date

  const infoRows = [
    {label: 'Stages', value: plan.stages ?? '-'},
    {label: 'Upper Aligner Series', value: formatAlignerSeries(plan.upper_aligner_series)},
    {label: 'Lower Aligner Series', value: formatAlignerSeries(plan.lower_aligner_series)},
    ...(isReplanStatus && revisionRequestedOn
      ? [
          {
            label: 'Revision requested',
            value: moment(revisionRequestedOn).format('DD-MMM-YYYY'),
          },
        ]
      : []),
  ]

  type ActionConfig = {
    key: string
    label: string
    handler: () => void
    className: string
  }

  const primaryActions: ActionConfig[] = []
  if (isMobile) {
    if (
      shouldShowButton({
        status: treatmentStatus,
        userType: getUserType(),
        buttonType: 'SEND_FOR_APPROVAL',
      }) &&
      planButtonsPermissions?.submitForApproval?.isViewable
    ) {
      primaryActions.push({
        key: 'SEND_FOR_APPROVAL',
        label: 'Send for Approval',
        handler: () => triggerStatusAction(treatmentPlanStatusConstants.SENT_FOR_APPROVAL),
        className:
          'h-11 w-full border !border-primaryColor !bg-white !text-primaryColor font-semibold hover:!bg-primarySupport',
      })
    }

    if (
      shouldShowButton({
        status: treatmentStatus,
        userType: getUserType(),
        buttonType: 'APPROVE',
      }) &&
      planButtonsPermissions?.approvePlan?.isViewable &&
      !serviceConfig?.PLANNING
    ) {
      primaryActions.push({
        key: 'APPROVE',
        label: 'Approve',
        handler: () => triggerStatusAction(treatmentPlanStatusConstants.APPROVED),
        className: 'h-11 w-full !bg-primaryColor !text-white font-semibold',
      })
    }
  }

  const secondaryActions: ActionConfig[] = []
  if (isMobile) {
    if (
      shouldShowButton({
        status: treatmentStatus,
        userType: getUserType(),
        buttonType: 'EDIT_PLAN',
      }) &&
      planButtonsPermissions?.editPlan?.isViewable
    ) {
      secondaryActions.push({
        key: 'EDIT_PLAN',
        label: 'Edit Plan',
        handler: () => {
          if (createTreatmentPlanLoading) return
          handleEditClick({planId: plan.plan_id, orderId: plan?.order_id})
        },
        className: 'text-sm font-medium text-primaryColor',
      })
    }

    if (
      shouldShowButton({
        status: treatmentStatus,
        userType: getUserType(),
        buttonType: 'DELETE_DRAFT',
      }) &&
      planButtonsPermissions?.deleteDraft?.isViewable
    ) {
      secondaryActions.push({
        key: 'DELETE_DRAFT',
        label: 'Delete Draft',
        handler: () => {
          if (createTreatmentPlanLoading) return
          handleDeleteDraft({planId: plan.plan_id})
        },
        className: 'text-sm font-medium text-red',
      })
    }

    if (
      shouldShowButton({
        status: treatmentStatus,
        userType: getUserType(),
        buttonType: 'REQUEST_REPLAN',
      }) &&
      planButtonsPermissions?.requestRevision?.isViewable
    ) {
      secondaryActions.push({
        key: 'REQUEST_REPLAN',
        label: 'Request revision',
        handler: () => triggerStatusAction(treatmentPlanStatusConstants.RE_PLAN),
        className: 'text-sm font-medium text-primaryColor',
      })
    }

    // if (
    //   (shouldShowButton({
    //     status: treatmentStatus,
    //     userType: getUserType(),
    //     buttonType: 'DEACTIVATE',
    //   }) &&
    //     planButtonsPermissions?.deactivatePlan?.isViewable)
    // ) {
    //   secondaryActions.push({
    //     key: 'DEACTIVATE',
    //     label: 'Deactivate treatment',
    //     handler: () => triggerStatusAction(treatmentPlanStatusConstants.DEACTIVATED),
    //     className: 'text-sm font-medium text-red',
    //   })
    // }
  }

  const handleCardClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('button, a, input, textarea, select, [role="button"], .no-card-nav')) {
      return
    }
    const queryParams = new URLSearchParams({
      isPurchaseOrder: isPurchasedPlanReceived || plan.parent_order_id === null ? 'true' : 'false',
    }).toString()

    navigate(`${profileBasePath}/${patientId}/view-plan/${plan.plan_id}?${queryParams}`)
  }

  const renderInfoRow = ({label, value}: {label: string; value: string | number}) => (
    <div key={label} className='flex items-center justify-between text-sm text-textColor'>
      <span>{label}</span>
      <span className='font-semibold text-gray-900'>{value}</span>
    </div>
  )

  const renderMobileCard = () => (
    <div
      className='rounded-2xl border-2 border-lightGray bg-white p-4 shadow-lg cursor-pointer'
      onClick={handleCardClick}
    >
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>
            {plan?.treatment_plan_tag_name ?? plan?.treatment_plan_name ?? ''}
          </h3>
          <div className='mt-1 text-sm text-textColor'>{plan.version}</div>
        </div>
        <div className='flex items-center gap-2'>
          <PlanStatusTag treatmentStatus={treatmentStatus} mapReplan />
          <CaretRightIcon color='#9CA3AF' width='10' height='12' />
        </div>
      </div>
      <When isTrue={isPurchasedPlanReceived}>
        <span
          className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold text-white bg-orange`}
        >
          This Treatment is created by Lab! Approve and Clone for your practice
        </span>
      </When>
      <div className='mt-4 space-y-3 rounded-xl p-3'>{infoRows.map(renderInfoRow)}</div>

      <TreatmentPlansInfoCards
        treatmentPlanStatus={treatmentStatus}
        date={
          plan.order_status_changed_at
            ? moment(plan.order_status_changed_at).format('DD-MMM-YYYY')
            : '-'
        }
        replanReason={plan?.treatment_plan_metadata?.replan_reason}
      />

      {primaryActions.length > 0 && (
        <div className='mt-4 flex  gap-2'>
          {primaryActions.map(({key, label, handler, className}) => (
            <AntdButton
              key={key}
              text={label}
              onClick={(event) => {
                event.stopPropagation()
                handler()
              }}
              className={className}
              isLoading={createTreatmentPlanLoading}
              disabled={createTreatmentPlanLoading}
              type='default'
            />
          ))}
        </div>
      )}

      {secondaryActions.length > 0 && (
        <div className='mt-3'>
          <button
            type='button'
            className='flex w-full items-center justify-between px-4 py-3 text-sm font-semibold'
            onClick={(event) => {
              event.stopPropagation()
              setShowMoreActions((prev) => !prev)
            }}
          >
            <span>{showMoreActions ? 'Hide' : 'More Actions'}</span>
            <span
              className='inline-flex'
              style={{
                transform: showMoreActions ? 'rotate(-90deg)' : 'rotate(90deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              <CaretRightIcon color={palette.primaryColor} width='10' height='12' />
            </span>
          </button>
          <When isTrue={showMoreActions}>
            <div className='space-y-2 bg-white px-4 py-3'>
              {secondaryActions.map(({key, label, handler, className}) => (
                <button
                  key={key}
                  type='button'
                  className={clsx('w-full text-left', className)}
                  onClick={(event) => {
                    event.stopPropagation()
                    handler()
                    setShowMoreActions(false)
                  }}
                  disabled={createTreatmentPlanLoading}
                >
                  {label}
                </button>
              ))}
            </div>
          </When>
        </div>
      )}
    </div>
  )

  const renderDesktopCard = () => (
    <div
      className='bg-white border-4 border-lightGray rounded-lg p-6 shadow-lg cursor-pointer'
      onClick={handleCardClick}
    >
      <When isTrue={isShowPhotos}>
        <ImageViewer
          setIsShowPhotos={setIsShowPhotos}
          selectedImagesList={plan?.plan_files?.map((file, index) => ({
            id: index,
            src: getImageUrl(file),
            width: '100%',
            height: '100%',
          }))}
          selectedIndex={selectedIndex}
        />
      </When>
      <div className='flex flex-col items-start'>
        <div className='w-full flex justify-between gap-3'>
          <div>
            <div className='flex items-center gap-3'>
              <h3 className='text-xl font-semibold'>
                {plan?.treatment_plan_tag_name ?? plan?.treatment_plan_name ?? ''}
              </h3>
              <div className='text-xs text-textColor'>{plan.version}</div>
              {plan.order_id && <BoxBadge simple title={`Order Id : ${plan.order_id}`}></BoxBadge>}

              {plan.order_type && (
                <BoxBadge
                  simple
                  title={
                    isPurchasedPlanReceived || plan?.order_type === 'PLANNING_ORDER'
                      ? 'Planning Order'
                      : 'Aligner Order'
                  }
                ></BoxBadge>
              )}
              <When isTrue={treatmentStatus !== treatmentPlanStatusConstants.RE_PLAN}>
                <PlanStatusTag treatmentStatus={treatmentStatus} mapReplan />
              </When>
            </div>{' '}
            <When isTrue={isPurchasedPlanReceived}>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-white bg-orange`}
              >
                This Treatment is created by Lab! Approve and Clone for your practice
              </span>
            </When>
          </div>
          {isReplanStatus ? (
            <div className='flex items-center gap-3'>
              <PlanStatusTag treatmentStatus={treatmentStatus} mapReplan />
              <CaretRightIcon color='#666666' />
            </div>
          ) : (
            <div className='text-right ml-4'>
              <div className='text-sm text-textColor'>Created on :</div>
              <div className='text-sm font-medium'>
                {plan.created_date
                  ? moment(plan.created_date).format('MMM DD, YYYY, hh:mm A')
                  : '—'}
              </div>
              {plan.approved_date && (
                <div className='text-sm text-textColor mt-1'>
                  Approved on: {moment(plan.approved_date).format('DD-MMM-YYYY at hh:mm A')}
                </div>
              )}
            </div>
          )}
        </div>
        <div className='text-sm text-textColor mt-2'>{plan.description}</div>
      </div>
      <TreatmentPlansInfoCards
        treatmentPlanStatus={treatmentStatus}
        date={
          plan.order_status_changed_at
            ? moment(plan.order_status_changed_at).format('DD-MMM-YYYY')
            : '-'
        }
        replanReason={plan?.treatment_plan_metadata?.replan_reason}
      />
      <div className='grid grid-cols-1 gap-4 mt-6 md:grid-cols-3'>
        <div className='rounded border p-4 text-center bg-white'>
          <div className='text-sm text-textColor'>Stages</div>
          <div className='text-2xl font-semibold'>{plan.stages ?? '-'}</div>
        </div>
        <div className='rounded border p-4 text-center bg-white'>
          <div className='text-sm text-textColor'>Upper Aligner Series</div>
          <div className='text-2xl font-semibold truncate'>
            {String(plan.upper_aligner_series) === '0-0' ? '-' : (plan.upper_aligner_series ?? '-')}
          </div>
        </div>
        <div className='rounded border p-4 text-center bg-white'>
          <div className='text-sm text-textColor'>Lower Aligner Series</div>
          <div className='text-2xl font-semibold'>
            {plan.lower_aligner_series === '0-0' ? '-' : (plan.lower_aligner_series ?? '-')}
          </div>
        </div>
      </div>

      <div className='mt-6'>
        {plan?.plan_files && plan?.plan_files?.length > 0 && (
          <div className='text-sm text-gray-600 mb-2'>Plan Files</div>
        )}
        <div className='grid gap-2'>
          {plan?.plan_files ? (
            <div className='flex flex-col md:flex-row md:flex-wrap w-full gap-3 '>
              {plan?.plan_files &&
                plan?.plan_files.map((file: IFile, index: number) => (
                  <div
                    key={index}
                    className={clsx(
                      'flex items-center md:min-w-fit gap-2 flex-shrink bg-primarySupport p-2 rounded-lg cursor-pointer'
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (file.extension === 'mp4' || file.extension === 'pdf') {
                        handleOpenPDF(file.url ?? '', file.name)
                      } else {
                        setIsShowPhotos(true)
                        setSelectedIndex(index)
                      }
                    }}
                  >
                    <When isTrue={file.extension !== 'mp4' && file.extension !== 'pdf'}>
                      <Image
                        src={getImageUrl(file)}
                        alt='Uploaded file '
                        className='w-12 h-12 rounded-[4px] border border-lightGray object-cover cursor-pointer'
                        size={20}
                        fileName={file.name}
                        showFileName={true}
                        showLoading={true}
                      />
                    </When>

                    <When isTrue={file.extension === 'pdf'}>
                      <Image
                        className='w-12 h-12 rounded-[4px]  object-cover cursor-pointer'
                        size={20}
                        src={pdfPng}
                      />

                      <TextWithTooltip className='cursor-pointer'>{file.name}</TextWithTooltip>
                    </When>
                  </div>
                ))}
            </div>
          ) : null}
        </div>
      </div>

      <hr className='my-4' />

      <div
        className='flex items-center gap-3'
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        {plan?.planning_link && (
          <button
            className='border px-4 rounded text-sm h-12 text-white'
            style={{
              background: palette.primaryColor,
              borderColor: palette.primaryColor,
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (plan.planning_link) {
                openDocument(plan.planning_link, `${plan.plan_name || 'Treatment Plan'} PDF`)
              }
            }}
          >
            Web Viewer
          </button>
        )}

        <TreatmentPlanActions
          {...{
            isPurchasedPlanReceived: isPurchasedPlanReceived || plan.parent_order_id === null,
            treatmentStatus,
            handleOnClick: (treatmentPlanStatus?: keyof typeof treatmentPlanStatusConstants) =>
              handleOnClick(plan, treatmentPlanStatus),
            handleDeleteDraft: () => {
              handleDeleteDraft({planId: plan.plan_id!})
            },
            handleEditClick: () => {
              handleEditClick({planId: plan.plan_id, orderId: plan?.order_id})
            },
          }}
        />

        {(treatmentStatus === 'SENT_FOR_APPROVAL' || treatmentStatus === 'APPROVED') &&
          isPurchasedPlanReceived && (
            <AntdButton
              onClick={() => {
                dispatchAction(
                  getTreatmentPlan({
                    aligner_treatment_id: plan?.plan_id?.toString() ?? '',
                  })
                )
                  .unwrap()
                  .then(() => {
                    navigate(
                      `/plan/${patientId}/setup-treatment-plan/${plan?.plan_id}?order_id=${plan?.parent_order_id}`,
                      {
                        state: {
                          toBeCloned: true,
                        },
                      }
                    )
                  })
              }}
              className='md:w-fit w-full border !bg-primaryColor !text-white h-12 font-semibold text-base'
              isLoading={createTreatmentPlanLoading}
              text='Clone Plan'
              disabled={createTreatmentPlanLoading}
            />
          )}
      </div>

      <div className='text-sm text-textColor mt-4'>
        <div>
          Last updated:{' '}
          {plan?.upload_date ? moment(plan.upload_date).format('MMM DD, YYYY, hh:mm A') : '—'}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {pdfViewer.isOpen && (
        <PDFWebview pdfUrl={pdfViewer.url} onBack={handleClosePDF} fileName={pdfViewer.fileName} />
      )}
      {!pdfViewer.isOpen && (isMobile ? renderMobileCard() : renderDesktopCard())}
    </>
  )
}

export default PlanCard
