import React, {useContext, useEffect, useState} from 'react'
import {useParams, useNavigate, useLocation} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {useManufacturingDetails} from 'screens/Patients/LeadsProfile/main/overview/hooks/useManufacturingDetails'
import TableContainerForBatches from '../components/TableContainerForBatches'
import {ArrowLeftOutlined} from '@ant-design/icons'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import dayjs from 'dayjs'
import {AuthContext} from 'context/AuthContext'
import STLFilesView from 'screens/Kanban/screens/ProductionSetup/components/STLFilesView'
import {Button, Modal} from 'antd'
import {allFile} from 'redux/Slices/AppSlice/LeadsProfile/LeadsFiles.Slice'
import useDispatchAction from '@hooks/useDispatchAction'
import {getTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {ITreatmentPlan} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import FooterDetailsView from 'screens/Kanban/screens/ProductionReview/components/FooterDetailsView'
import InfoCard from 'components/instruction/InfoCard'
import ShippingDetailsContainer from 'screens/Patients/LeadsProfile/main/overview/components/ShippingDetailsContainer'
import {ManufacturingItem} from 'screens/Patients/LeadsProfile/main/overview/types/GettingStarted.types'
import manufacturingConstants from '@constants/manufacturing.constants'
import getColorPalette from 'utils/getColorPalette'
import {getManufacturingListDetails} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import useAllUserPlan from '@hooks/useAllUserPlan'
import AddShippingModalTask from '../components/AddShippingModalTask'
import useActiveProfile from '@hooks/useActiveProfile'
import {safeParseInt} from 'utils/ConstFunctions'

const ProductionBatchDetails: React.FC = () => {
  const navigate = useNavigate()
  const {userId, profileId} = useContext(AuthContext)
  const {activeProfile} = useActiveProfile()
  const {dispatchAction} = useDispatchAction()
  const {secondaryColor} = getColorPalette()
  const {isPractice} = useAllUserPlan()
  const {treatmentId, batchId, patientId} = useParams<{
    patientId: string
    treatmentId: string
    batchId: string
  }>()
  const {treatmentPlan} = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const allFiles = useSelector((state: RootState) => state.leadFiles)
  const {manufacturingListByPlan, openShippingDetailsModal} = useSelector(
    (state: RootState) => state.GettingStartedOverview
  )
  const {processed, loading, unprocessed} = useManufacturingDetails({
    getFreshData: true,
    treatment_plan_id: Number(treatmentId),
  })

  useEffect(() => {
    if (!treatmentId) return
    dispatchAction(
      getTreatmentPlan({
        aligner_treatment_id: String(treatmentId),
      })
    )
      .unwrap()
      .then((res: ITreatmentPlan) => {
        dispatchAction(
          allFile({
            doctor_id: String(userId),
            patient_id: String(patientId),
            path: `/Orders/STL ${res?.treatment_plan_name + res.treatment_plan_id}`,
          })
        )
      })
  }, [treatmentId])

  const refreshManufacturingData = () => {
    const parsedPatientId = patientId ? Number(patientId) : NaN
    const parsedTreatmentId = treatmentId ? Number(treatmentId) : NaN
    if (!Number.isFinite(parsedPatientId) || !Number.isFinite(parsedTreatmentId)) return
    dispatchAction(
      getManufacturingListDetails({
        patient_id: parsedPatientId,
        treatment_plan_id: parsedTreatmentId,
      })
    )
  }

  const location = useLocation()
  const batchDetails = location.state?.processed

  const {service_products} = batchDetails

  const isOutsourced =
    Number(profileId) !== service_products.profile_id &&
    service_products.profile_id !== safeParseInt(activeProfile?.owner_profile_id)

  const [isShippingDetailsModalOpen, setIsShippingDetailsModalOpen] = useState(false)
  const planId = treatmentId ? Number(treatmentId) : undefined
  const manufacturingListForPlan =
    planId != null && !Number.isNaN(planId)
      ? manufacturingListByPlan?.[planId]?.processed_manufacturing
      : undefined

  const batch = processed?.find((b: any) => String(b.id) === String(batchId))
  const selectedManufacturing: ManufacturingItem | undefined =
    batchId && manufacturingListForPlan?.length
      ? manufacturingListForPlan.find(
          (manufacturing) => String(manufacturing.manufacturing_batch_id) === String(batchId)
        )
      : undefined

  const shouldShowShippingInfoCard =
    selectedManufacturing?.status === manufacturingConstants.SHIPPED ||
    selectedManufacturing?.status === manufacturingConstants.DELIVERED
  const shippingDetailsAddedOn = hasValue(selectedManufacturing?.shipping_added_on)
    ? dayjs(selectedManufacturing?.shipping_added_on).format('DD-MMM-YYYY')
    : '-'

  const patient = useSelector(
    (state: RootState) => state.apiGetLeadsProfileDetails.data?.patient_details
  )

  const handleOpenShippingDetails = () => {
    if (!selectedManufacturing) return
    setIsShippingDetailsModalOpen(true)
  }
  const handleCloseShippingDetails = () => setIsShippingDetailsModalOpen(false)

  return (
    <>
      <AddShippingModalTask
        openModal={openShippingDetailsModal}
        refreshData={refreshManufacturingData}
      />
      <div className='w-full p-4 md:p-6 bg-white min-h-screen'>
        <Modal
          closable
          destroyOnClose
          footer={null}
          maskClosable={false}
          open={isShippingDetailsModalOpen}
          onCancel={handleCloseShippingDetails}
          width={566}
        >
          <div className='p-5'>
            <div className='text-2xl font-semibold mb-3'>Shipping details</div>
            {isShippingDetailsModalOpen && selectedManufacturing && (
              <ShippingDetailsContainer shipping_detail={selectedManufacturing} />
            )}
          </div>
        </Modal>
        <div className='mb-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Button type='text' icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
          <h1 className='text-xl md:text-2xl font-semibold text-gray-900'>
            Batch Details : {patient?.first_name}-{unprocessed?.treatment_version}-B
            {batch?.batch_number}
          </h1>
          <p className='text-sm text-gray-500 mt-1'>View batch summary, checklist and notes.</p>
        </div>

        <When isTrue={!loading && !!batch}>
          <When isTrue={shouldShowShippingInfoCard}>
            <div className='mb-6'>
              <InfoCard
                title={`Shipping details added on ${shippingDetailsAddedOn}.`}
                buttonText='View details'
                onClick={handleOpenShippingDetails}
                color={secondaryColor}
                iconColor={secondaryColor}
                className='!bg-secondarySupport !border-secondaryColor'
                classNameButton='!bg-transparent !text-secondaryColor !px-0 !py-0 hover:!text-secondaryColor'
              />
            </div>
          </When>
          {/* Case Overview */}
          <section className='mb-6 rounded-g border p-4'>
            <h3 className='text-base font-semibold mb-2'>Case Overview</h3>
            <div className='border rounded-lg p-0 overflow-hidden'>
              <table className='w-full text-sm'>
                <tbody>
                  <tr className='border-b'>
                    <td className='w-1/3 bg-gray-50 px-3 py-2 font-medium text-gray-600'>
                      Batch ID
                    </td>
                    <td className='px-3 py-2 text-gray-900'>{String((batch as any)?.id ?? '-')}</td>
                  </tr>
                  <tr className='border-b'>
                    <td className='bg-gray-50 px-3 py-2 font-medium text-gray-600'>Patient Name</td>
                    <td className='px-3 py-2 text-gray-900'>{patient?.full_name ?? '-'}</td>
                  </tr>
                  <tr className='border-b'>
                    <td className='bg-gray-50 px-3 py-2 font-medium text-gray-600'>Patient ID</td>
                    <td className='px-3 py-2 text-gray-900'>
                      {patient?.customer_mapped_id || '-'}
                    </td>
                  </tr>
                  <tr className='border-b'>
                    <td className='bg-gray-50 px-3 py-2 font-medium text-gray-600'>Created On</td>
                    <td className='px-3 py-2 text-gray-900'>
                      {hasValue((batch as any)?.started_on)
                        ? dayjs((batch as any)?.started_on).format('DD-MMM-YYYY')
                        : '-'}
                    </td>
                  </tr>
                  <tr className='border-b'>
                    <td className='bg-gray-50 px-3 py-2 font-medium text-gray-600'>Mode</td>
                    <td className='px-3 py-2 text-gray-900'>
                      {isOutsourced ? 'Outsources' : 'InHouse'}
                    </td>
                  </tr>
                  <tr className='border-b'>
                    <td className='bg-gray-50 px-3 py-2 font-medium text-gray-600'>Lab Name</td>
                    <td className='px-3 py-2 text-gray-900'>
                      {!!batchDetails && batchDetails?.outsourced_to
                        ? batchDetails?.outsourced_to
                        : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td className='bg-gray-50 px-3 py-2 font-medium text-gray-600'>Product Name</td>
                    <td className='px-3 py-2 text-gray-900'>
                      {(batch as any)?.product_name || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className='mb-6 rounded-lg border bg-white gap-5 p-4'>
            <h3 className='text-base font-semibold mb-2'>Product Summary</h3>
            <TableContainerForBatches processed={batch as any} />
          </section>
          {!isPractice && (
            <STLFilesView
              {...{
                treatmentPlan: treatmentPlan,
                stlFileMetaData: allFiles?.Files,
              }}
            />
          )}

          <div className='mt-4'>
            <FooterDetailsView id={batchId ? Number(batchId) : 0} />
          </div>
        </When>
      </div>
    </>
  )
}

export default ProductionBatchDetails
