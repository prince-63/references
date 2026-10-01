import {ProcessedManufacturingBatch} from 'screens/Patients/LeadsProfile/main/overview/hooks/useManufacturingDetails'
import hasValue from 'utils/hasValue'
import {TableContainerForBatches} from './TableContainerForBatches'
import {
  ManufacturingItem,
  ManufacturingStatus,
} from 'screens/Patients/LeadsProfile/main/overview/types/GettingStarted.types'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'
import {modeOptions} from '@constants/modeOptions.constants'
import dayjs from 'dayjs'
import {useNavigate} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {AllTreatmentPlanListItem} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import {Tooltip} from 'antd'
import useDispatchAction from '@hooks/useDispatchAction'
import {setInstructions} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useActiveProfile from '@hooks/useActiveProfile'
import {safeParseInt} from 'utils/ConstFunctions'

interface BatchDetailsProps {
  processed: ProcessedManufacturingBatch
  index: number
  plan: AllTreatmentPlanListItem
  patientId: number
  latestManufacturingData?: ManufacturingItem | null
}

type NonNullManufacturingStatus = Exclude<ManufacturingStatus, null>

export const manufacturingStatusMapper: Record<NonNullManufacturingStatus, string> = {
  MANUFACTURING: 'MANUFACTURING',
  PENDING: 'PENDING',
  MANUFACTURING_STARTED: 'In Production',
  IN_PROGRESS: 'IN PROGRESS',
  COMPLETED: 'COMPLETED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
}

const BatchDetails = (props: BatchDetailsProps) => {
  const {processed, plan, patientId} = props
  const {profileId} = useContext(AuthContext)
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {service_products, product_name} = processed
  const {dispatchAction} = useDispatchAction()
  const {activeProfile} = useActiveProfile()
  const isOutsourced =
    Number(profileId) !== service_products.profile_id &&
    service_products.profile_id !== safeParseInt(activeProfile?.owner_profile_id)
  const {getIndividualTaskList} = useSelector((state: RootState) => state.workFlow)
  const isDeactivated = plan?.treatment_status === treatmentPlanStatusConstants.DEACTIVATED
  const isDelivered = processed?.status === 'DELIVERED'
  return (
    <>
      <div className='text-sm sm:text-base text-black'>
        <div className='mb-1'>
          <strong>Mode:</strong>{' '}
          {(isOutsourced ? modeOptions.Outsourced : modeOptions['In-House']).toUpperCase()}
        </div>
        <div className='mb-1'>
          <strong>Product:</strong> {product_name || '-'}
        </div>
        <div className='mb-1'>
          <strong>Started On:</strong>{' '}
          {hasValue(processed.started_on)
            ? dayjs(processed.started_on as any).format('DD-MMM-YYYY')
            : '-'}
        </div>
        <div className='mb-1'>
          <strong>Shipped On:</strong>{' '}
          {hasValue(processed.shipped_on)
            ? dayjs(processed.shipped_on as any).format('DD-MMM-YYYY')
            : '-'}
        </div>
        <div className='mb-3'>
          <strong>Delivered On:</strong>{' '}
          {hasValue(processed.delivered_on)
            ? dayjs(processed.delivered_on as any).format('DD-MMM-YYYY')
            : '-'}
        </div>
      </div>

      <div className='my-4 border border-mediumGray ' />
      <div className='mt-3 sm:mt-4 '>
        <div className='text-sm sm:text-base font-semibold mb-2'>Product Summary</div>
        <TableContainerForBatches processed={processed} />
      </div>

      {!isDeactivated && (
        <div className='mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3'>
          <AntdButton
            className='text-white bg-primaryColor border border-primaryColor font-semibold w-full sm:w-fit px-4 py-2 rounded-lg'
            text='View Batch Details >'
            htmlType='button'
            onClick={() => {
              dispatchAction(setInstructions(processed?.instructions))
              navigate(
                `${profileBasePath}/${patientId}/production/batch/${plan?.aligner_treatment_id}/${processed.id}`,
                {
                  state: {
                    processed,
                  },
                }
              )
            }}
          />

          <Tooltip title='Ongoing Production: Manage active batches currently under production.'>
            <div className='inline-block'>
              {!isDelivered && (
                <AntdButton
                  className='text-white bg-primaryColor border border-primaryColor font-semibold w-fit px-4 py-2 rounded-lg'
                  text='View Ongoing Production'
                  onClick={() => {
                    const batchId = props.latestManufacturingData?.manufacturing_batch_id

                    const params = new URLSearchParams()
                    params.set('tab', 'ongoing')
                    if (batchId) params.set('batchId', String(batchId))
                    if (getIndividualTaskList?.patient_name)
                      params.set('patientName', String(getIndividualTaskList?.patient_name))
                    navigate(`/aligner-production?${params.toString()}`)
                  }}
                />
              )}
            </div>
          </Tooltip>
        </div>
      )}
    </>
  )
}

export default BatchDetails
