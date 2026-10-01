import Page from 'components/page/Page'
import Footer from '../components/Footer'
import {Formik} from 'formik'
import {useSelector} from 'react-redux'
import AlignerSummary from '../components/AlignerSummary'
import UnprocessedAligners from '../components/UnprocessedAligners'
import useDispatchAction from '@hooks/useDispatchAction'
import * as Yup from 'yup'
import {RootState} from 'redux/store'
import ConfirmManufacturing from '../components/ConfirmManufacturing'
import manufacturingConstants from '@constants/manufacturing.constants'
import {
  nextStep,
  setSaveManufacturingData,
} from 'redux/Slices/AppSlice/ExistingCase/ExistingCase.slice'
import FormikDatePicker from 'components/atom/Inputs/FormikDatePicker'
import dayjs from 'dayjs'

export type ManufacturingFormValues = {
  fromStage: number | null
  toStage: number | null
  upperAlignerStart: number | null
  upperAlignerEnd: number | null
  lowerAlignerStart: number | null
  lowerAlignerEnd: number | null
  delivery_date: string | null
}

const validationSchema = Yup.object().shape({
  fromStage: Yup.number().required('Required'),
  toStage: Yup.number()
    .required('Required')
    .min(Yup.ref('fromStage'), 'To Stage must be >= From Stage'),
  delivery_date: Yup.string().required(' Delivery Date is Required'),
})

const ManufacturingStep = () => {
  const {dispatchAction} = useDispatchAction()
  const {treatmentPlan} = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const {manufacturingFromStage, manufacturingToStage, productSelected, saveManufacturingData} =
    useSelector((state: RootState) => state.existingCase)

  const getInitialValues = () => {
    return {
      fromStage: manufacturingFromStage ?? null,
      toStage: manufacturingToStage ?? null,
      upperAlignerStart: null,
      upperAlignerEnd: null,
      lowerAlignerStart: null,
      lowerAlignerEnd: null,
      delivery_date: saveManufacturingData?.delivery_date ?? null,
    }
  }

  return (
    <Page title='Manufacturing' exitConfirmPredicate={false}>
      <div className='flex flex-col gap-3 md:w-4/5 pb-28 sm:pb-26 md:pb-24 lg:pb-32 overflow-scroll'>
        <Formik<ManufacturingFormValues>
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          onSubmit={async (values, formik) => {
            try {
              await validationSchema.validate(values, {abortEarly: false})
            } catch (error: any) {
              if (error.name === 'ValidationError') {
                const errorMap: Record<string, string> = {}
                error.inner.forEach((err: any) => {
                  if (err.path) {
                    errorMap[err.path] = err.message
                  }
                })

                formik.setTouched(
                  Object.keys(errorMap).reduce(
                    (acc, key) => {
                      acc[key] = true
                      return acc
                    },
                    {} as Record<string, boolean>
                  )
                )

                formik.setErrors(errorMap)

                return
              }

              console.error('[handleNext] Unexpected error ❌', error)
            }

            const upperAlignerCount =
              values.upperAlignerStart && values.upperAlignerEnd
                ? values.upperAlignerEnd - values.upperAlignerStart + 1
                : 0

            const lowerAlignerCount =
              values.lowerAlignerStart && values.lowerAlignerEnd
                ? values.lowerAlignerEnd - values.lowerAlignerStart + 1
                : 0

            const payload = {
              status: manufacturingConstants.DELIVERED,
              upper_aligner_start: values.upperAlignerStart,
              upper_aligner_end: values.upperAlignerEnd,
              lower_aligner_start: values.lowerAlignerStart,
              lower_aligner_end: values.lowerAlignerEnd,
              total_aligners: upperAlignerCount + lowerAlignerCount,
              batch_type: 'IN_BATCHES' as const,
              treatment_plan_id: treatmentPlan.treatment_plan_id,
              delivery_date: values.delivery_date,
              outsource_lab_profile_id: productSelected?.profile_id,
              ...(productSelected && {service_products: productSelected}),
              service_product_id: productSelected?.id,
            }

            try {
              dispatchAction(setSaveManufacturingData(payload))
              dispatchAction(nextStep())
            } catch (error) {
              console.error('Failed to submit manufacturing details:', error)
            }
          }}
        >
          {(formik) => {
            return (
              <div className='flex flex-col gap-3'>
                <div className='flex flex-col gap-3 pb-28 sm:pb-28 md:pb-12 overflow-scroll'>
                  <AlignerSummary />
                  <ConfirmManufacturing formik={formik} />
                  <UnprocessedAligners formik={formik} />
                  <hr className='py-4' />
                  <div>
                    <div className={'md:text-2xl text-xl font-semibold self-center'}>
                      Confirm Delivery
                    </div>
                    <div className={'md:text-base text-base self-center mb-4'}>
                      Confirm the delivery date for this batch.
                    </div>

                    <div className='flex flex-col gap-3'>
                      <FormikDatePicker
                        name='delivery_date'
                        label='Delivered on'
                        required
                        placeholder='DD-MM-YYYY'
                        format='DD-MM-YYYY'
                        disabledDate={(current) => current && current > dayjs().endOf('day')}
                      />{' '}
                    </div>
                  </div>
                </div>
                <Footer
                  onNext={() => {
                    formik.handleSubmit()
                  }}
                />
              </div>
            )
          }}
        </Formik>
      </div>
    </Page>
  )
}

export default ManufacturingStep
