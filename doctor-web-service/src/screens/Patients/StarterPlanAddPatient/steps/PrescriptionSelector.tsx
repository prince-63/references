import React, {useEffect, useRef, useState} from 'react'
import dayjs from 'dayjs'
import {useSelector} from 'react-redux'
import {Formik} from 'formik'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import Page from 'components/page/Page'
import {RootState} from 'redux/store'
import {EmbeddedPrescriptionForm} from 'screens/Orders/Steps/EmbeddedPrescriptionForm'
import {useSearchParams} from 'react-router-dom'
import {safeParseInt} from 'utils/ConstFunctions'
import PrescriptionStep from './PrescriptionStep'
import Footer from '../components/Footer'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getApiDataPrescriptionByPatient,
  type PrescriptionData,
} from 'redux/Slices/AppSlice/Prescription/Prescription.slice'

type PrescriptionSelectorProps = {
  onComplete?: (prescriptionId?: number) => void
  onBack?: () => void
  onCancel?: () => void
  hideCancelButton?: boolean
  iframeClassName?: string
  useFooter?: boolean
  onInlineNext?: () => void
  onPrescriptionCreated?: (template: 'ALIGNER' | 'ORTHO') => void
}

export const PrescriptionSelector: React.FC<PrescriptionSelectorProps> = ({
  onComplete,
  onBack,
  onCancel,
  iframeClassName,
  useFooter = true,
  onInlineNext,
  onPrescriptionCreated,
}) => {
  const {prescriptionsByPatient, getByPatientLoading} = useSelector(
    (state: RootState) => state.apiPrescription
  )
  const {dispatchAction} = useDispatchAction()
  const [submitForm, setSubmitForm] = useState<(() => void) | null>(null)
  const [searchParams] = useSearchParams()
  const patientId = safeParseInt(searchParams.get('patient_id'))

  useEffect(() => {
    if (patientId) dispatchAction(getApiDataPrescriptionByPatient(patientId))
  }, [patientId])

  const responsiveIframeClass =
    iframeClassName || 'block w-full border-0 min-h-[80vh] md:min-h-[900px] h-auto'
  const hasAdvancedRef = useRef(false)

  const renderActions = ({
    onNext,
    nextButtonText = 'Save & Continue',
    disableNext = false,
    loadingNext = false,
    hideNextButton = false,
  }: {
    onNext: () => void
    nextButtonText?: string
    disableNext?: boolean
    loadingNext?: boolean
    hideNextButton?: boolean
  }) => {
    if (useFooter) {
      return (
        <Footer
          onNext={onNext}
          nextButtonText={nextButtonText}
          disableNext={disableNext}
          loadingNext={loadingNext}
          showNextButton={!hideNextButton}
        />
      )
    }

    return (
      <div className='flex flex-wrap justify-between items-center gap-3 mt-6 pt-4 border-t border-gray-200'>
        <div className='flex gap-2'>
          {onCancel && (
            <button
              type='button'
              onClick={onCancel}
              className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-textColor hover:bg-gray-50'
            >
              Cancel
            </button>
          )}
          {onBack && (
            <button
              type='button'
              onClick={onBack}
              className='rounded-lg border border-primaryColor px-4 py-2 text-sm font-semibold text-primaryColor bg-primarySupport hover:bg-primarySupport/80'
            >
              Back
            </button>
          )}
        </div>
        {!hideNextButton && (
          <button
            type='button'
            onClick={onNext}
            disabled={disableNext || loadingNext}
            className='rounded-lg px-5 py-2 text-sm font-semibold text-white bg-primaryColor hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loadingNext ? 'Saving...' : nextButtonText}
          </button>
        )}
      </div>
    )
  }

  const handleAdvance = (prescriptionIdToMap?: number) => {
    if (hasAdvancedRef.current) return
    hasAdvancedRef.current = true
    onComplete?.(prescriptionIdToMap)
    onInlineNext?.()
  }

  const getPrescriptionLabel = (record: PrescriptionData) => {
    const data = record?.data
    if (data) {
      const textFieldKey = Object.keys(data).find((key) => /text[-_]?field/i.test(key))
      const label = textFieldKey ? data[textFieldKey] : undefined
      if (typeof label === 'string' && label.trim()) return label
    }
    if (record?.prescription_id) return `Prescription #${record.prescription_id}`
    return 'Prescription'
  }

  const prescriptionOptions =
    prescriptionsByPatient?.map((record) => ({
      value: record.prescription_id,
      label: `${getPrescriptionLabel(record)}${
        record?.created_at && dayjs(record.created_at).isValid()
          ? ` (${dayjs(record.created_at).format('DD-MMM-YYYY, hh:mm A')})`
          : ''
      }`,
    })) || []

  const noPrescriptions = !prescriptionsByPatient || prescriptionsByPatient.length === 0

  if (noPrescriptions) {
    return (
      <PrescriptionStep
        onNext={(template) => onPrescriptionCreated?.(template)}
        onBack={onBack || (() => {})}
      />
    )
  }

  return (
    <Page title='Select Prescription' loading={getByPatientLoading} containerClassName='h-full'>
      <Formik
        enableReinitialize
        initialValues={{
          prescription:
            prescriptionsByPatient.length > 0
              ? prescriptionOptions[prescriptionOptions.length - 1]?.value
              : null,
        }}
        onSubmit={(values) => {
          if (!values.prescription) return
          handleAdvance(values.prescription)
        }}
      >
        {({values, setFieldValue, handleSubmit}) => (
          <>
            <FormikSelectList
              name='prescription'
              items={prescriptionOptions}
              label='Prescription'
              placeholder={getByPatientLoading ? 'Loading...' : 'Select a Prescription'}
              disabled={getByPatientLoading}
              allowClear
              onChangeSuccess={(selectedItem) => {
                hasAdvancedRef.current = false
                setFieldValue('prescription', selectedItem?.value)
              }}
            />

            {/* If one is selected, open the embedded form in EDIT mode for that id */}
            {values.prescription && (
              <EmbeddedPrescriptionForm
                patientId={patientId ? String(patientId) : ''}
                mode='edit'
                prescriptionId={values.prescription}
                setSubmitForm={setSubmitForm}
                iframeClassName={responsiveIframeClass}
                onSuccess={(updatedId?: number) => {
                  const idToAdvance = updatedId ?? values.prescription
                  if (!idToAdvance) return
                  handleAdvance(idToAdvance)
                }}
              />
            )}

            {renderActions({
              onNext: () => {
                // Always map selection; submitForm will handle edit/save when data is present
                handleSubmit()
                submitForm?.()
              },
              nextButtonText: 'Save & Continue',
              disableNext: !values.prescription,
            })}
          </>
        )}
      </Formik>
    </Page>
  )
}
