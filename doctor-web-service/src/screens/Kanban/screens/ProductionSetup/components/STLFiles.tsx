import SectionCard from './SectionCard'
import {Box, Info} from 'lucide-react'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import hasValue from 'utils/hasValue'
import When from 'components/when/When'
import cn from '@utils/cn'
import {Divider, Spin} from 'antd'
import AntdButton from 'components/atom/Buttons/AntdButton'
import FormikInput from 'components/atom/Inputs/FormikInput'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import RadioGroupIcon from 'components/RadioGroup/RadioGroupIcon'
import {Formik} from 'formik'
import {
  createTreatmentPlan,
  getTreatmentPlan,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import DocumentsDraggerContainer from 'screens/Orders/components/DocumentsDraggerContainer'
import {safeParseInt} from 'utils/ConstFunctions'
import {useContext, useEffect, useMemo, useState} from 'react'
import {UploadFile} from 'antd/lib'
import useDispatchAction from '@hooks/useDispatchAction'
import {useParams} from 'react-router-dom'
import * as Yup from 'yup'
import STLFilesView from './STLFilesView'
import {AllFiles} from 'screens/Patients/LeadsProfile/main/files/types/files.types'
import {AuthContext} from 'context/AuthContext'
import {allFile} from 'redux/Slices/AppSlice/LeadsProfile/LeadsFiles.Slice'
import Spinner from 'components/spinner/Spinner'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {ITreatmentPlan} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import RequestStlFilesSection from 'screens/PatientDetailsOverview.tsx/pages/CustomerPatientProfile/components/RequestStlFilesSection'

const STLFiles = ({
  showTitle = true,
  refreshData,
}: {
  showTitle?: boolean
  refreshData: () => void
}) => {
  const {dispatchAction} = useDispatchAction()
  const {patientId, treatmentId} = useParams()
  const {userId} = useContext(AuthContext)
  const {isPractice} = useAllUserPlan()
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const {treatmentPlan, getTreatmentPlanLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const hidePrintFiles = useMemo(() => {
    return data?.is_customer_print_file_view_enabled === false
  }, [data])

  const allFiles = useSelector((state: RootState) => state.leadFiles)
  const stlFileMetaData = allFiles?.Files.map((file: AllFiles) => file)
  const addFileTypeOptions = isPractice
    ? [{value: 'DO_NOT_UPLOAD', label: "Don't Upload"}]
    : [
        {label: 'Upload', value: 'UPLOAD'},
        {value: 'ADD_LINK', label: 'Add link'},
        {value: 'DO_NOT_UPLOAD', label: "Don't Upload"},
      ]

  useEffect(() => {
    if (!userId || !treatmentId || !patientId) return

    if (
      treatmentPlan &&
      hasValue(treatmentPlan) &&
      String((treatmentPlan as ITreatmentPlan)?.treatment_plan_id) === String(treatmentId)
    ) {
      dispatchAction(
        allFile({
          doctor_id: String(userId),
          patient_id: String(patientId),
          path: `/Orders/STL ${treatmentPlan?.treatment_plan_name + treatmentPlan?.treatment_plan_id}`,
        })
      )
    } else {
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
    }
  }, [userId, treatmentId, patientId, dispatchAction])

  const isInteractionLocked = isUploading || isSaving

  return (
    <>
      <When isTrue={isInteractionLocked}>
        <div className='fixed inset-0 z-[1200] bg-white/40 flex items-center justify-center cursor-wait'>
          <Spinner loading />
        </div>
      </When>

      <Spin
        indicator={<Spinner loading />}
        spinning={allFiles?.loadingAllFiles || getTreatmentPlanLoading}
      >
        <When isTrue={!(isPractice && serviceConfig?.PLANNING)}>
          <SectionCard
            id='stl-files'
            icon={showTitle ? <Box className='h-5 w-5' /> : null}
            title={showTitle ? 'STL Files' : ''}
            subtitle={
              showTitle
                ? 'Provide STL files for production. Use existing plan files or upload new ones.'
                : ''
            }
          >
            <div className='rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600'>
              <Info className='mr-2 inline h-4 w-4' /> Provide STL files for production. You can use
              existing plan files, upload new ones, or skip uploading if they’ve already been
              shared.
            </div>

            <div className='mb-2'>
              <Formik
                initialValues={{
                  fileLink: '',
                  uploadType: isPractice ? 'DO_NOT_UPLOAD' : 'UPLOAD',
                }}
                onSubmit={async (values, formik) => {
                  if (values.uploadType === 'UPLOAD') {
                    if (uploadedFiles.length === 0) {
                      ErrorToast('Please upload at least one file.')
                      return
                    }
                  }
                  setIsSaving(true)
                  try {
                    await dispatchAction(
                      createTreatmentPlan({
                        details: {
                          treatment_plan_id: safeParseInt(treatmentPlan?.treatment_plan_id),
                          doctor_id: safeParseInt(treatmentPlan?.doctor_id),
                          order_id: treatmentPlan?.order_id,
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
                              treatmentPlan?.stl_file_metadata?.requested_at ??
                              new Date().toISOString(),
                            approved_on: null,
                            uploaded_on: new Date().toISOString(),
                          },
                        },
                      })
                    )
                      .unwrap()
                      .then(() => {
                        formik.resetForm()
                        setUploadedFiles([])
                        SuccessToast('STL files uploaded successfully.')
                        refreshData()
                      })
                  } finally {
                    setIsSaving(false)
                  }
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
                            maxFileSize: 5000,
                            maxFileCount: 5,
                            accept: '.zip',
                            parentPath: `/Orders/STL ${
                              treatmentPlan?.treatment_plan_name + treatmentPlan?.treatment_plan_id
                            }`,
                            uploadedFiles,
                            setUploadedFiles,
                            patientId: treatmentPlan?.patient_id,
                            onUploadingChange: setIsUploading,
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
                          <div className='flex justify-end ml-auto mt-2'>
                            {formik.values.uploadType !== 'DO_NOT_UPLOAD' && (
                              <AntdButton
                                text='Save'
                                className={cn(
                                  'h-10 text-base bg-primaryColor border border-primaryColor  hover:!bg-primaryColor hover:!text-white font-semibold text-white',
                                  'md:w-fit w-full',
                                  isInteractionLocked ? 'opacity-50 cursor-not-allowed' : ''
                                )}
                                disabled={isInteractionLocked}
                                onClick={() => {
                                  formik.handleSubmit()
                                }}
                                isLoading={formik.isSubmitting}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }}
              </Formik>
            </div>
          </SectionCard>
        </When>
        <When
          isTrue={
            isPractice && serviceConfig?.PLANNING && stlFileMetaData && stlFileMetaData.length === 0
          }
        >
          <RequestStlFilesSection
            orderId={treatmentPlan?.order_id ?? null}
            treatmentPlanId={safeParseInt(treatmentId) ?? 0}
            variant='customerSummary'
          />
        </When>
        <When
          isTrue={
            ((isPractice && !(isPractice && serviceConfig?.PLANNING) ? !hidePrintFiles : true) &&
              stlFileMetaData &&
              stlFileMetaData.length > 0) ||
            hasValue(treatmentPlan?.stl_file_metadata?.link)
          }
        >
          <STLFilesView
            {...{
              showTitle: showTitle,
              treatmentPlan: treatmentPlan,
              stlFileMetaData: stlFileMetaData,
            }}
          />
        </When>
      </Spin>
    </>
  )
}

export default STLFiles
