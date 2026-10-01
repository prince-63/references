import Page from 'components/page/Page'
import FooterRedesigned from '../components/FooterRedesigned'
import {Formik} from 'formik'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import FormikInputTextArea from 'components/atom/Inputs/FormikInputTextArea'
import {Divider} from 'antd'
import When from 'components/when/When'
import VerticalRadioGroup from 'components/RadioGroup/VerticalRadioGroup'
import toothNumbers from '@staticData/toothNumbers'
import {prescriptionValidationSchema} from './validations/prescription.validations'
import {
  attachmentOptions,
  doNotMoveToothList,
  extractionOptions,
  iprOptions,
  midLineOptions,
  prescriptionTreatmentTypesOptions,
  SELECT_SPECIFIC_TOOTH,
  SPECIFY_MIDLINE_INSTRUCTIONS,
} from './helpers/prescriptionFormOptions'
import userOrderDetails from '../hooks/userOrderDetails'
import getInitialPrescriptionValues from './helpers/getInitialPrescriptionValues'
import useDispatchAction from '@hooks/useDispatchAction'
import {createOrder, nextStep} from 'redux/Slices/AppSlice/orders/orders.slice'
import orderStatusConstants from '@constants/orderStatus.constants'
import {safeParseInt} from 'utils/ConstFunctions'
import {useContext, useEffect, useState} from 'react'
import {AuthContext} from 'context/AuthContext'
import hasValue from 'utils/hasValue'
import FormikMultiSelectList from 'components/atom/Dropdown/FormikMultiSelectList'
import {useGetCaseRecordAction} from 'screens/CaseRecords/hook'
import StepCard from '../components/StepCard'
import {FileText} from 'lucide-react'

const SectionLabel = ({children, required}: {children: React.ReactNode; required?: boolean}) => (
  <label className='text-black font-semibold text-base mb-2 flex items-center gap-1'>
    {children}
    {required && <span className='text-red'>*</span>}
  </label>
)

const PrescriptionStep = () => {
  const {order, loadingOrder} = userOrderDetails()
  const prescriptionDetails = order?.prescription_details
  const patientId = order?.patient_details?.id
  const {dispatchAction} = useDispatchAction()
  const {userId, profileId} = useContext(AuthContext)
  const {caseRecordData} = useGetCaseRecordAction({
    patient_id: safeParseInt(patientId),
  })
  const [chief_complaint_from_case_record, set_chief_complaint_from_case_record] =
    useState<string>('')

  useEffect(() => {
    if (caseRecordData) {
      set_chief_complaint_from_case_record(caseRecordData?.chief_complaint)
    }
  }, [caseRecordData])

  return (
    <Page title='' loading={loadingOrder} exitConfirmPredicate={false}>
      <Formik
        initialValues={getInitialPrescriptionValues(
          prescriptionDetails,
          chief_complaint_from_case_record
        )}
        validationSchema={prescriptionValidationSchema}
        enableReinitialize
        onSubmit={async (values) => {
          await dispatchAction(
            createOrder({
              prescription_details: {
                ...values,
                chief_complaint: values.chief_complaint.trim(),
                midline_instructions: values.midline_instructions?.trim(),
                ...(hasValue(prescriptionDetails?.id) && {
                  id: safeParseInt(prescriptionDetails?.id),
                }),
              },
              status:
                order?.status === orderStatusConstants.NEED_MORE_INFO
                  ? orderStatusConstants.NEED_MORE_INFO
                  : orderStatusConstants.DRAFT,
              order_id: order?.order_id,
              doctor_id: safeParseInt(userId),
              profile_id: safeParseInt(profileId),
              practice_doctor_id: safeParseInt(order?.doctor_id),
              practice_profile_id: safeParseInt(order?.profile_id),
              practice_organization_id: safeParseInt(order?.organization_id),
            })
          )
          dispatchAction(nextStep())
        }}
      >
        {(formik) => {
          return (
            <>
              <StepCard
                title='Prescription'
                subtitle='Add treatment details for the lab'
                icon={<FileText className='w-5 h-5' />}
                className='md:w-4/5 lg:w-3/4'
              >
                <div className='flex flex-col'>
                  <SectionLabel required>Chief complaint</SectionLabel>
                  <FormikInputTextArea
                    name={'chief_complaint'}
                    required
                    className='py-3'
                    maxLength={2000}
                    placeholder="Enter patient's chief complaint"
                  />
                  <Divider className='!my-5' />
                  <SectionLabel>Treatment plan instructions (optional)</SectionLabel>
                  <FormikInputTextArea
                    name={'notes'}
                    className='py-3'
                    maxLength={2000}
                    placeholder='Provide any specific instructions here'
                  />
                  <Divider className='!my-5' />
                  <SectionLabel required>Treatment needed</SectionLabel>
                  <div className='flex flex-col gap-2'>
                    <FormikSelectList
                      {...{
                        name: 'treatment_needed',
                        items: prescriptionTreatmentTypesOptions,
                        required: true,
                        label: 'Select treatment type',
                        onChangeMapperFunc: String,
                        size: 'large',

                        onChangeSuccess: (value) => {
                          formik.setFieldValue('treatment_needed', value?.value)
                        },
                      }}
                    />
                    <When isTrue={formik.values.treatment_needed === SELECT_SPECIFIC_TOOTH}>
                      <FormikMultiSelectList
                        {...{
                          name: 'treatment_needed_for_tooth',
                          items: toothNumbers.map((num) => ({value: num, label: num})),
                          placeholder: 'Select tooth',
                          required: true,
                          onChangeMapperFunc: String,
                          size: 'large',
                          mode: 'multiple',
                        }}
                      />
                    </When>
                  </div>
                  <Divider className='!my-5' />
                  <div className='flex flex-col gap-6'>
                    <div>
                      <SectionLabel required>Don&apos;t move the following tooth</SectionLabel>
                      <div className='flex flex-col gap-2'>
                        <VerticalRadioGroup
                          options={doNotMoveToothList}
                          name='do_not_move_the_following_tooth'
                        />
                        <When
                          isTrue={
                            formik.values.do_not_move_the_following_tooth === SELECT_SPECIFIC_TOOTH
                          }
                        >
                          <FormikMultiSelectList
                            {...{
                              name: 'do_not_move_the_following_selected_tooth',
                              items: toothNumbers.map((num) => ({value: num, label: num})),
                              placeholder: 'Select tooth',
                              required: true,
                              onChangeMapperFunc: String,
                              size: 'large',
                            }}
                          />
                        </When>
                      </div>
                    </div>
                    <div>
                      <SectionLabel required>Midline</SectionLabel>
                      <VerticalRadioGroup options={midLineOptions} name='midline' />
                      <When isTrue={formik.values.midline === SPECIFY_MIDLINE_INSTRUCTIONS}>
                        <FormikInputTextArea
                          name={'midline_instructions'}
                          required
                          className='py-3'
                          maxLength={500}
                          placeholder="Provide specific midline adjustments. Ex: Move upper arch to patient's right by 2 mm and lower arch to patient's left by 1.5 mm."
                        />
                      </When>
                    </div>
                  </div>
                  <Divider className='!my-5' />
                  <div className='flex flex-col gap-2'>
                    <SectionLabel required>Attachments</SectionLabel>
                    <VerticalRadioGroup options={attachmentOptions} name='attachments' />
                    <When isTrue={formik.values.attachments === SELECT_SPECIFIC_TOOTH}>
                      <FormikMultiSelectList
                        {...{
                          name: 'attachments_tooth_selected',
                          items: toothNumbers.map((num) => ({value: num, label: num})),
                          placeholder: 'Select tooth',
                          required: true,
                          onChangeMapperFunc: String,
                          size: 'large',
                        }}
                      />
                    </When>
                  </div>
                  <Divider className='!my-5' />
                  <SectionLabel required>Interproximal Reduction (IPR) </SectionLabel>
                  <VerticalRadioGroup options={iprOptions} name='inter_proximal_reduction' />
                  <Divider className='!my-5' />
                  <div className='flex flex-col gap-2'>
                    <SectionLabel required>Extraction</SectionLabel>
                    <VerticalRadioGroup options={extractionOptions} name='extraction' />
                    <When isTrue={formik.values.extraction === SELECT_SPECIFIC_TOOTH}>
                      <FormikMultiSelectList
                        {...{
                          name: 'extraction_tooth_selected',
                          items: toothNumbers.map((num) => ({value: num, label: num})),
                          placeholder: 'Select tooth',
                          required: true,
                          onChangeMapperFunc: String,
                          size: 'large',
                        }}
                      />
                    </When>
                  </div>
                </div>
              </StepCard>
              <FooterRedesigned
                {...{
                  onNext: () => {
                    formik.handleSubmit()
                  },
                }}
              />
            </>
          )
        }}
      </Formik>
    </Page>
  )
}

export default PrescriptionStep
