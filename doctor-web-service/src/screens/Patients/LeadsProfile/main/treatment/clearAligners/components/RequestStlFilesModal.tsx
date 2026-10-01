import {Modal} from 'antd'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useContext, useState} from 'react'
import FilterOptionSelectDropdown from 'screens/Practices/PracticeList/components/FilterOptionSelectDropdown'
import InfoCard from '../../../alignersTracking/components/InfoCard'
import cn from '@utils/cn'
import stlFileTypeOptions from '@staticData/stlFileTypeOptions'
import stlFileTypeConstants from '@constants/stlFileType.constants'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  createTreatmentPlan,
  getAllTreatmentPlanList,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {useNavigate, useParams} from 'react-router-dom'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import stlFileUploadStatusConstants from '@constants/stlFileUploadStatus.constants'
import {getOrderDetails} from 'redux/Slices/AppSlice/orders/orders.slice'
import {useFeatureAccess} from '@hooks/useFeatureAccess'

type optionType = {
  label: string
  value: keyof typeof stlFileTypeConstants
}
const RequestStlFilesModal = ({
  open,
  setOpen,
  patientIdFromOrder,
  treatmentName,
  treatmentPlanId,
  orderId,
  isTreatmentPlanList,
  isViewTreatmentPlan,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  patientIdFromOrder?: number
  treatmentName: string
  treatmentPlanId: number
  orderId?: string | null
  isTreatmentPlanList?: boolean
  isViewTreatmentPlan?: boolean
}) => {
  const [requestStlFileType, setRequestStlFileType] = useState(stlFileTypeOptions[0].value)
  const {dispatchAction} = useDispatchAction()
  const {patientId: patientIdFromParams} = useParams()
  const patientId = patientIdFromOrder ?? patientIdFromParams
  const {userId, organizationId} = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const {permissionChecks} = useFeatureAccess()
  const stlFilePermissions = permissionChecks?.treatmentPlanManagement?.requestSTLFiles?.isAddable
  return (
    <Modal
      destroyOnClose={true}
      style={{fontFamily: 'figtree'}}
      closable={false}
      open={open}
      title={<p className='font-semibold text-2xl'>Select STL file type for {treatmentName}</p>}
      width={500}
      centered
      footer={
        <div className='flex justify-between gap-2'>
          <button
            className=' w-full rounded-lg h-10 px-5 text-textColor border border-mediumGray justify-start'
            type='button'
            onClick={() => {
              setOpen(false)
            }}
          >
            Cancel
          </button>
          {stlFilePermissions && (
            <AntdButton
              key='submit'
              text={'Request STL files'}
              htmlType='submit'
              className='h-11 w-full bg-primaryColor text-center'
              loading={loading}
              onClick={async () => {
                setLoading(true)
                await dispatchAction(
                  createTreatmentPlan({
                    details: {
                      treatment_plan_id: treatmentPlanId,
                      doctor_id: safeParseInt(userId),
                      patient_id: safeParseInt(patientId),
                      order_status_changed_at: new Date().toISOString(),
                      order_id: orderId,
                      stl_file_metadata: {
                        printing_type: requestStlFileType,
                        requested_at: new Date().toISOString(),
                        link: [],
                        file_id: [],
                        status: stlFileUploadStatusConstants.STL_FILES_REQUESTED,
                      },
                    },
                  })
                )
                  .unwrap()
                  .then(() => {
                    if (isTreatmentPlanList) {
                      if (!userId || !patientId) return
                      dispatchAction(
                        getAllTreatmentPlanList({
                          doctor_id: userId,
                          patient_id: patientId,
                          organization_id: safeParseInt(organizationId),
                        })
                      )
                    }
                    if (!isTreatmentPlanList) {
                      if (!orderId) return
                      dispatchAction(
                        getOrderDetails({
                          doctor_id: safeParseInt(userId),
                          order_id: orderId,
                          retrieve_treatment_plan: true,
                        })
                      )
                    }
                    if (isViewTreatmentPlan) {
                      navigate(`/leads-profile/${patientId}/treatment`, {replace: true})
                    }
                    setLoading(false)
                    setOpen(false)
                  })
              }}
            />
          )}
        </div>
      }
      //   onCancel={() => handleClose(formik)}
    >
      <div className='flex flex-col gap-4'>
        <InfoCard
          {...{
            showButton: false,
            className: 'border border-primaryColor bg-primarySupport py-2 pl-2',
            titleClassName: 'font-medium text-xs md:text-sm text-black -ml-2',
            title: 'Once requested you can’t request for another treatment plan.',
          }}
        />
        {stlFileTypeOptions.map((option) => {
          return (
            <FilterOptionSelectDropdown
              key={option.value}
              value={option.value}
              label={option.label}
              subTitle={option.subTitle}
              onChange={(option: optionType) => {
                setRequestStlFileType(option.value)
              }}
              className={cn(
                'px-4 py-3 border border-mediumGray rounded-lg',
                option.value === requestStlFileType && 'border-primaryColor'
              )}
              checked={option.value === requestStlFileType}
              labelClassName={cn('truncate font-medium text-lg text-black')}
            />
          )
        })}
      </div>
    </Modal>
  )
}

export default RequestStlFilesModal
