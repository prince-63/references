import {ConfigProvider, Divider, Steps} from 'antd'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import InfoCard from '../../alignersTracking/components/InfoCard'
import RadioGroupIcon from 'components/RadioGroup/RadioGroupIcon'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import When from 'components/when/When'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {Formik} from 'formik'
import * as Yup from 'yup'
import cn from '@utils/cn'
import FormikInput from 'components/atom/Inputs/FormikInput'
import StlFilesSteps from './StlFilesSteps'
import getCurrentStlFileStep from './helpers/getCurrentStlFileStep'
import {UploadFile} from 'antd/lib'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import useActiveProfile from '@hooks/useActiveProfile'
import ApproveStlFilesAndCloseOrderModal from './components/ApproveStlFilesAndCloseOrderModal'
import UploadedFilesOrLinksSection from './UploadedFilesOrLinksSection'
import hasValue from 'utils/hasValue'
import stlFileTypeOptions from '@staticData/stlFileTypeOptions'
import RequestStlFilesModal from '../clearAligners/components/RequestStlFilesModal'
import useDispatchAction from '@hooks/useDispatchAction'
import {createTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {AllTreatmentPlanListItem} from '../types/treatmentPlan.types'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import dayjs from 'dayjs'
import useAllUserPlan from '@hooks/useAllUserPlan'
import ZipHelpBanner from './components/ZipHelperBanner'
import shouldShowRequestStlFilesSection from '../clearAligners/helpers/shouldShowRequestStlFilesSection'
import DocumentsDraggerContainer from 'screens/Orders/components/DocumentsDraggerContainer'

const AntdFileDraggerUpload = ({
  treatmentPlanList,
  isClone,
}: {
  treatmentPlanList: AllTreatmentPlanListItem[]
  isClone?: boolean
}) => {
  const {treatmentPlan} = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const {order} = useSelector((state: RootState) => state.orders)
  const stlFileMetaData = treatmentPlan?.stl_file_metadata
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([])
  const [open, setOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  const {patientId} = useParams()
  const {doctorData} = useActiveProfile()
  const {isCustomer, isDesignLabUser, isVendor, isPractice} = useAllUserPlan()
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const isCustomerPatient = data?.patient_details?.assigned_practice?.is_customer_patient
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const {isEnterprisePlanUser} = useAllUserPlan()

  const addFileTypeOptions = isPractice
    ? [{value: 'DO_NOT_UPLOAD', label: "Don't Upload"}]
    : [
        {label: 'Upload', value: 'UPLOAD'},
        {value: 'ADD_LINK', label: 'Add link'},
        {value: 'DO_NOT_UPLOAD', label: "Don't Upload"},
      ]

  const requestedFileType = stlFileTypeOptions.find(
    (option) => option.value === stlFileMetaData?.printing_type
  )?.label
  const {dispatchAction} = useDispatchAction()
  const showRequestStlFilesSection = shouldShowRequestStlFilesSection({
    treatmentPlanList,
    treatmentPlan,
    isCustomer,
    isClone,
  })
  const navigate = useNavigate()
  return (
    <BorderedCard>
      <p className='text-lg font-semibold'>STL files</p>
      <Divider className='my-3' />
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#735bf2',
          },
        }}
      >
        <Steps
          current={getCurrentStlFileStep({
            stlFileMetaData: stlFileMetaData,
          })}
          items={StlFilesSteps({
            stlFileMetaData: stlFileMetaData,
            isCustomer,
            orderId,
            treatmentPlanName: treatmentPlan?.treatment_plan_name,
          })}
        />
      </ConfigProvider>
      <Divider className='my-3' />
      <When isTrue={stlFileMetaData?.status === 'STL_FILES_REQUESTED'}>
        <InfoCard
          title={`${requestedFileType} requested`}
          className='bg-orangeSupport text-textColor flex md:!justify-between !justify-start  border border-orange'
          titleClassName='!text-black font-semibold'
          infoIconColor='#BE8901'
          content={`Requested on ${dayjs(stlFileMetaData?.requested_at).format('DD MMM YYYY')}`}
          showButton={false}
        />
      </When>
      <When isTrue={showRequestStlFilesSection}>
        <InfoCard
          title={`Request for 3D STL files needed for the next steps.`}
          titleClassName='!text-black font-medium'
          buttonText='Request STL files'
          buttonClassName='bg-[#735BF2] text-white'
          iconColor='#fff'
          onClick={() => {
            setOpen(true)
          }}
        />
        <Divider className='my-3' />
      </When>
      <When
        isTrue={
          (isDesignLabUser && !isEnterprisePlanUser) ||
          isVendor ||
          (isEnterprisePlanUser && order?.is_customer_order)
        }
      >
        <Formik
          initialValues={{
            fileLink: '',
            uploadType: isPractice ? 'DO_NOT_UPLOAD' : 'UPLOAD',
          }}
          onSubmit={async (values) => {
            if (values.uploadType === 'UPLOAD') {
              if (uploadedFiles.length === 0) {
                ErrorToast('Please upload at least one file.')
                return
              }
            }
            await dispatchAction(
              createTreatmentPlan({
                details: {
                  treatment_plan_id: safeParseInt(treatmentPlan?.treatment_plan_id),
                  doctor_id: safeParseInt(doctorData?.id),
                  order_id: orderId,
                  patient_id: safeParseInt(patientId),
                  order_status_changed_at: new Date().toISOString(),
                  stl_file_metadata: {
                    link: [
                      ...(treatmentPlan?.stl_file_metadata?.link || []),
                      ...(hasValue(values.fileLink) ? [values.fileLink] : []),
                    ],
                    file_id: [...(treatmentPlan?.stl_file_metadata?.file_id || [])],
                    status: 'STL_FILES_UPLOADED',
                    printing_type:
                      treatmentPlan?.stl_file_metadata?.printing_type ?? 'THREE_D_PRINTED',
                    requested_at:
                      treatmentPlan?.stl_file_metadata?.requested_at ?? new Date().toISOString(),
                    approved_on: null,
                    uploaded_on: new Date().toISOString(),
                  },
                },
              })
            )
              .unwrap()
              .then(() => {
                SuccessToast('STL files uploaded successfully.')
                setUploadedFiles([])
                if (isCustomerPatient && !isDesignLabUser) {
                  const queryParams = new URLSearchParams({
                    customerOrders: 'true',
                  }).toString()
                  navigate(`/orders?${queryParams}`)
                } else {
                  navigate('/orders', {replace: true})
                }
              })
          }}
          validationSchema={Yup.object().shape({
            fileLink: Yup.string().when('uploadType', {
              is: 'ADD_LINK',
              then: (schema) => schema.required('This field is required.'),
              otherwise: (schema) => schema.notRequired(),
            }),
          })}
        >
          {(formik) => {
            return (
              <div>
                <RadioGroupIcon
                  options={addFileTypeOptions}
                  onOptionChange={(option) => {
                    formik.setFieldValue('uploadType', option)
                  }}
                  selectedOption={formik.values.uploadType}
                  label=''
                  className='text-center rounded-md md:rounded-lg sm:px-4'
                />
                <Divider className='my-3' />

                <When isTrue={formik.values.uploadType === 'UPLOAD'}>
                  <div className='mb-1 text-textColor font-medium'>Files</div>
                  <DocumentsDraggerContainer
                    {...{
                      maxFileSize: 1000,
                      maxFileCount: 5,
                      accept: '.zip',
                      parentPath: `/Orders/Order ${orderId}/${treatmentPlan?.treatment_plan_name}`,
                      getFreshOrderData: true,
                      uploadedFiles,
                      setUploadedFiles,
                      patientId: treatmentPlan?.patient_id,
                    }}
                  />
                </When>
                <div className='flex justify-between gap-3 w-full mt-2'>
                  <When isTrue={formik.values.uploadType === 'ADD_LINK'}>
                    <FormikInput
                      name={'fileLink'}
                      required
                      className='h-12'
                      maxLength={200}
                      placeholder='Add One drive, Google drive, WeTransfer or any other link here'
                    />
                  </When>
                  <div className='flex-col w-full gap-2 '>
                    <When isTrue={order?.show_zip_file}>
                      <ZipHelpBanner />
                    </When>
                    <div className='flex justify-end ml-auto mt-2'>
                      <AntdButton
                        text='Save & Notify'
                        className={cn(
                          'h-12 text-base bg-primaryColor border border-primaryColor  hover:!bg-primaryColor hover:!text-white font-semibold text-white',
                          'md:w-fit w-full'
                        )}
                        onClick={() => {
                          formik.handleSubmit()
                        }}
                        isLoading={formik.isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          }}
        </Formik>
        <Divider className='my-3' />
      </When>

      {/* TODO */}
      <When isTrue={stlFileMetaData?.status === 'STL_FILES_UPLOADED'}>
        <div className='flex justify-end ml-auto'>
          <AntdButton
            text='Approve'
            className={cn(
              'h-12 text-base bg-primaryColor border border-primaryColor  hover:!bg-primaryColor hover:!text-white font-semibold text-white',
              'w-fit'
            )}
            onClick={() => {
              setShowApprovalModal(true)
            }}
          />
        </div>
      </When>
      <When isTrue={showApprovalModal}>
        <ApproveStlFilesAndCloseOrderModal
          {...{
            setShowSendForApprovalModal: setShowApprovalModal,
          }}
        />
      </When>
      <When isTrue={hasValue(stlFileMetaData?.file_id) || hasValue(stlFileMetaData?.link)}>
        <UploadedFilesOrLinksSection
          {...{
            treatmentPlan: treatmentPlan,
          }}
        />
      </When>
      <RequestStlFilesModal
        {...{
          open,
          setOpen,
          treatmentName: treatmentPlan?.treatment_plan_name,
          treatmentPlanId: treatmentPlan?.treatment_plan_id,
          orderId: orderId,
          isViewTreatmentPlan: true,
        }}
      />
    </BorderedCard>
  )
}

export default AntdFileDraggerUpload
