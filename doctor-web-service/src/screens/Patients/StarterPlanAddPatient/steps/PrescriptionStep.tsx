import React, {useState, useCallback, useMemo} from 'react'
import FilterOptionSelectDropdown from 'screens/Practices/PracticeList/components/FilterOptionSelectDropdown'
import {EmbeddedPrescriptionForm} from 'screens/Orders/Steps/EmbeddedPrescriptionForm'
import cn from '@utils/cn'
import {ServiceConfigurationItemName} from 'redux/Slices/AppSlice/ServiceConfiguration/ServiceConfiguration.slice'
import Footer from '../components/Footer'
import {useSearchParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

interface PrescriptionStepProps {
  onNext: (template: 'ALIGNER' | 'ORTHO') => void
  onBack: () => void
}

type PrescriptionTemplateOption = {
  value: 'ALIGNER' | 'ORTHO'
  label: string
  subTitle: string
}

const prescriptionTemplateOptions: PrescriptionTemplateOption[] = [
  {
    value: 'ALIGNER',
    label: 'Orthodontic Template',
    subTitle: 'For aligner-based prescriptions.',
  },
]

const PrescriptionStep: React.FC<PrescriptionStepProps> = ({onNext}) => {
  const [searchParams] = useSearchParams()
  const patientId = searchParams.get('patient_id')
  const {data} = useSelector((state: RootState) => state.serviceConfiguration)

  const isBracesAddOnActive = useMemo(
    () =>
      data?.enabled_items.some(
        (item) => item.item_name === ServiceConfigurationItemName.BRACES_ADD_ON && item.is_active
      ) ?? false,
    [data]
  )

  const templateOptions = useMemo(() => {
    const opts = [...prescriptionTemplateOptions]
    if (isBracesAddOnActive) {
      opts.push({
        value: 'ORTHO',
        label: 'General Template',
        subTitle: 'For braces based prescriptions.',
      })
    }
    return opts
  }, [isBracesAddOnActive])

  const [selectedTemplate, setSelectedTemplate] = useState<'ALIGNER' | 'ORTHO' | null>(null)
  const [submitForm, setSubmitForm] = useState<(() => void) | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isFormReady = !!submitForm

  const handleTemplateChange = (template: 'ALIGNER' | 'ORTHO') => {
    setSelectedTemplate(template)
  }

  const handleNext = useCallback(() => {
    if (isSubmitting || !selectedTemplate) {
      return
    }

    if (submitForm) {
      setIsSubmitting(true)

      try {
        submitForm()
      } catch (error) {
        console.error('Error submitting form:', error)
        setIsSubmitting(false)
      }

      // Reset isSubmitting after 2 seconds if onSuccess wasn't called
      // This handles validation errors where the form doesn't actually submit
      const timeoutId = setTimeout(() => {
        setIsSubmitting(false)
      }, 2000)

      // Store timeout ID to clear it if success happens quickly
      ;(window as any).__prescriptionSubmitTimeout = timeoutId
    } else {
    }
  }, [submitForm, isSubmitting])

  const handleSuccess = useCallback(() => {
    if (!selectedTemplate) return
    // Clear the timeout since submission was successful
    const timeoutId = (window as any).__prescriptionSubmitTimeout
    if (timeoutId) {
      clearTimeout(timeoutId)
      delete (window as any).__prescriptionSubmitTimeout
    }

    setIsSubmitting(false)
    onNext(selectedTemplate)
  }, [selectedTemplate, onNext])

  return (
    <div className='p-4 md:p-6 w-full max-w-5xl mx-auto'>
      <h2 className='text-2xl md:text-3xl font-semibold mb-6'>Prescription</h2>

      {/* Template Selection */}
      <div className='flex flex-col gap-3 md:gap-4 mb-6'>
        <h3 className='text-lg md:text-xl font-semibold'>Select treatment type</h3>
        <p className='text-sm md:text-base text-gray-600 mb-2'>
          Choose the type of treatment you want to provide for this patient.
        </p>
        {templateOptions.map((option) => {
          const isSelected = option.value === selectedTemplate
          return (
            <FilterOptionSelectDropdown
              key={option.value}
              value={option.value}
              label={option.label}
              subTitle={option.subTitle}
              onChange={(opt) => handleTemplateChange(opt.value as 'ALIGNER' | 'ORTHO')}
              className={cn(
                'px-4 py-4 border rounded-xl transition-colors cursor-pointer w-full',
                isSelected
                  ? 'border-primaryColor bg-primarySupport'
                  : 'border-mediumGray bg-white hover:border-gray-400'
              )}
              checked={isSelected}
              labelClassName='truncate font-semibold text-lg text-black'
            />
          )
        })}
      </div>

      {/* Prescription Form */}
      {patientId ? (
        <div className='mt-6 border-t pt-6'>
          <h3 className='text-lg md:text-xl font-semibold mb-4'>Prescription Details</h3>
          {!selectedTemplate && (
            <div className='text-sm md:text-base text-blue-600 mb-2'>
              Select a treatment type to load the prescription form.
            </div>
          )}
          {selectedTemplate && (
            <>
              {!isFormReady && (
                <div className='text-sm md:text-base text-blue-600 mb-2'>
                  ⏳ Loading prescription form...
                </div>
              )}
              <EmbeddedPrescriptionForm
                patientId={patientId.toString()}
                mode='add'
                setSubmitForm={setSubmitForm}
                iframeClassName='block w-full min-h-[480px] md:min-h-[600px]'
                onSuccess={handleSuccess}
                template={selectedTemplate}
              />
            </>
          )}
        </div>
      ) : (
        <div className='text-center py-8 text-gray-500 text-sm md:text-base'>
          Loading patient information...
        </div>
      )}

      <Footer
        nextButtonText={isSubmitting ? 'Saving...' : 'Save & Continue'}
        disableNext={!isFormReady || isSubmitting || !selectedTemplate}
        onNext={handleNext}
      />
    </div>
  )
}

export default PrescriptionStep
