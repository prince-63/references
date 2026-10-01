import {useEffect, useMemo, useState} from 'react'
import {useLocation, useParams, useSearchParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import useDispatchAction from '@hooks/useDispatchAction'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import When from 'components/when/When'

// Existing, unchanged left-side form
import SetupTreatmentPlan from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/SetupTreatmentPlan'

// Reuse existing prescription + case records building blocks
import {
  getApiDataPrescriptionByPatient,
  PrescriptionData,
} from 'redux/Slices/AppSlice/Prescription/Prescription.slice'
import {EmbeddedPrescriptionForm} from 'screens/Orders/Steps/EmbeddedPrescriptionForm'
import CaseFilesViewerSidebar from 'screens/PatientDetailsOverview.tsx/components/CaseFilesViewerSidebar'
import cn from '@utils/cn'

const getPrescriptionLabel = (record: PrescriptionData) => {
  const data = record?.data
  if (data) {
    const textFieldKey = Object.keys(data).find((key) => /text[-_]?field/i.test(key))
    const label = textFieldKey ? data[textFieldKey] : undefined
    if (typeof label === 'string' && label.trim()) return label
  }
  if (record?.prescription_id) return `Prescription`
  return 'Prescription'
}
export default function SetupTreatmentPlanTwoPane() {
  const {patientId} = useParams<{patientId: string}>()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')

  const pid = useMemo(() => safeParseInt(patientId), [patientId])
  const {dispatchAction} = useDispatchAction()
  const {state} = useLocation()
  const {prescriptionsByPatient, getByPatientLoading} = useSelector(
    (state: RootState) => state.apiPrescription
  )

  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | ''>('')
  const selectedPrescription = useMemo<PrescriptionData | undefined>(() => {
    const sel = Number(selectedPrescriptionId)
    if (!sel) return undefined
    return prescriptionsByPatient?.find((p) => p.prescription_id === sel)
  }, [prescriptionsByPatient, selectedPrescriptionId])

  useEffect(() => {
    if (!pid) return
    dispatchAction(getApiDataPrescriptionByPatient(pid))
  }, [pid])

  return (
    <div className='flex flex-col lg:flex-row gap-4 mb-4'>
      {/* Left: 60% width - original form within a matched card wrapper */}
      <div className={cn('w-full ', state?.toBeCloned ? 'w-full' : 'lg:w-3/5')}>
        <aside
          className='bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden'
          aria-label='Treatment plan form container'
        >
          <div className='p-3 md:p-4'>
            <SetupTreatmentPlan
              toBeCloned={state?.toBeCloned ?? false}
              hideAlignerDetails={state?.toBeCloned ?? false}
              isEdit={state?.isEdit ?? false}
              order_id={orderId}
            />
          </div>
        </aside>
      </div>

      {/* Right: 40% width - Utilities panel */}
      {!state?.toBeCloned && (
        <div className='w-full lg:w-2/5'>
          <aside
            className='bg-white border border-gray-200 shadow-lg rounded-xl flex flex-col'
            aria-label='Utilities panel: Prescriptions and Case Records'
          >
            {/* Header */}
            <div className='px-4 py-3 border-b border-gray-200'>
              <div className='text-lg md:text-xl font-semibold text-gray-900'>
                View Prescriptions & Case Records
              </div>
              <div className='text-xs text-gray-500'>Quick access while setting up a plan</div>
            </div>

            {/* Body */}
            <div className='p-3 md:p-4 space-y-6'>
              {/* 1) Select Prescription */}
              <section>
                <div className='space-y-2'>
                  <select
                    className='w-full border rounded px-2 py-2 text-sm'
                    value={selectedPrescriptionId}
                    onChange={(e) =>
                      setSelectedPrescriptionId(e.target.value ? Number(e.target.value) : '')
                    }
                    disabled={getByPatientLoading}
                  >
                    <option value=''>Select a prescription</option>
                    {getByPatientLoading && <option value=''>Loading…</option>}
                    {!getByPatientLoading && prescriptionsByPatient?.length === 0 && (
                      <option value='' disabled>
                        No prescriptions
                      </option>
                    )}
                    {!getByPatientLoading &&
                      prescriptionsByPatient?.map((p) => (
                        <option key={p.prescription_id} value={p.prescription_id}>
                          {getPrescriptionLabel(p)}
                        </option>
                      ))}
                  </select>

                  {/* Show embedded, read-only summary when an item is selected */}
                  <When isTrue={Boolean(selectedPrescription)}>
                    <div className='rounded border border-gray-200 overflow-hidden h-[420px]'>
                      {patientId && selectedPrescriptionId && (
                        <EmbeddedPrescriptionForm
                          patientId={patientId}
                          prescriptionId={Number(selectedPrescriptionId)}
                          mode='view'
                        />
                      )}
                    </div>
                  </When>
                </div>
              </section>

              {/* Divider between Prescription and Case Records for clear segregation */}
              <div className='border-t border-purple-500 my-4'></div>

              {/* 2) Select Case Records */}
              <section>
                <CaseFilesViewerSidebar selectClassName='ml-auto w-full border rounded px-2 py-2 text-sm' />
              </section>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
